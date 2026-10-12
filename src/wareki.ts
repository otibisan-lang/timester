/** 西暦の年を和暦にする。改元のあった年は「昭和64年・平成元年」のように両方を返す。明治より前は「江戸時代」 */
const ERAS = [
  { name: '令和', start: 2019 },
  { name: '平成', start: 1989 },
  { name: '昭和', start: 1926 },
  { name: '大正', start: 1912 },
  { name: '明治', start: 1868 },
];

function eraYear(name: string, start: number, year: number) {
  const n = year - start + 1;
  return `${name}${n === 1 ? '元' : n}年`;
}

export function toWareki(year: number): string {
  const i = ERAS.findIndex((e) => year >= e.start);
  // 明治より前は、元号が細かく変わるので「江戸時代」とだけ書く
  if (i === -1) return year >= 1603 ? '江戸時代' : '';
  const era = ERAS[i];
  const current = eraYear(era.name, era.start, year);
  // 改元の年は、前の元号の最後の年もあわせて書く
  if (year === era.start && i + 1 < ERAS.length) {
    const prev = ERAS[i + 1];
    return `${eraYear(prev.name, prev.start, year)}・${current}`;
  }
  return current;
}
