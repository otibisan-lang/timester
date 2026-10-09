/**
 * items_master.csv を正として src/generated/items.ts を生成する。
 * 実行: timester フォルダで npm run sync:items（npm run build でも自動で走る）
 *
 * CSV の列: no, name, releaseYear, maker, trivia, status, yomi
 * - yomi（よみがな・ひらがな）は、名前に漢字や英字があるときだけ商品名の上に小さく表示する。
 * - maker（発売元）は出題時に商品名と一緒に表示する。空欄なら表示しない。
 * - status が「確定」で始まる行だけ出題に使う（「確定（国産初）」なども含む）。
 * - trivia は答え画面の「豆知識」に表示される。全角 160 字以内が目安。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "items_master.csv");
const OUT_DIR = path.join(ROOT, "src", "generated");
const OUT_PATH = path.join(OUT_DIR, "items.ts");
const TRIVIA_MAX_LEN = 160;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8").replace(/^﻿/, ""));
  const header = rows[0].map((h) => h.trim());
  for (const col of ["no", "name", "releaseYear", "maker", "trivia", "status", "yomi"]) {
    if (!header.includes(col)) throw new Error(`CSV に列がありません: ${col}`);
  }

  const objects = rows.slice(1).map((cells) =>
    Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()]))
  );
  const active = objects.filter((o) => o.status.startsWith("確定"));

  const items = [];
  for (const o of active) {
    const year = Number(o.releaseYear);
    if (!Number.isInteger(year)) {
      console.warn(`[sync] 発売年が数字ではないためスキップ: no=${o.no} ${o.name} (${o.releaseYear})`);
      continue;
    }
    const len = [...o.trivia].length;
    if (len > TRIVIA_MAX_LEN) {
      console.warn(`[sync] 豆知識が ${TRIVIA_MAX_LEN} 字を超えています（${len} 字）: no=${o.no} ${o.name}`);
    }
    // 備考が発売元と同じ（例: 「任天堂」だけ）なら、豆知識としては出さない
    const trivia = o.trivia === o.maker ? "" : o.trivia;
    // ひらがな・カタカナだけの名前には、よみがなを付けない（小1でも読めるため）
    const needsYomi = /[^\u3040-\u30ff\uff08\uff09()\s]/.test(o.name);
    items.push({ id: `item-${o.no}`, name: o.name, yomi: needsYomi ? o.yomi : "", releaseYear: year, maker: o.maker, trivia });
  }

  const src =
    `import { Item } from "../types";\n\n` +
    `/** items_master.csv から自動生成（直接編集しないこと） */\n` +
    `export const ITEMS: Item[] = ${JSON.stringify(items, null, 2)};\n`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, src, "utf8");
  console.log(`[sync] ${items.length} 品目 → src/generated/items.ts（CSV 全 ${objects.length} 行）`);
}

main();
