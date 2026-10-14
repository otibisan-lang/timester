/**
 * 「やり方の例をみる」：1人の紙の並び方を、紙芝居のように1枚ずつ見せる。
 * 中身は docs/タイムスター_あそびかた.pdf の「やってみよう（例）」と同じ。
 * 画面の絵は public/example/（docs/あそびかた_画面 を縮小したもの）。
 */
import { useState } from 'react';
import { motion } from 'motion/react';

type Paper = { year: number | null; name: string; mark?: 'new' | 'miss' };

type Slide = {
  badge: string;
  title: string;
  shots: { src: string; caption: string }[];
  lines: string[];
  note?: string;
  highlight?: string;
  rows: { label: string; papers: Paper[] }[];
};

const P = {
  iron: { year: 1914, name: '電気アイロン' },
  cup: { year: 1971, name: 'カップヌードル' },
  pocari: { year: 1980, name: 'ポカリスエット' },
  tama: { year: 1996, name: 'たまごっち' },
  sw: { year: 2017, name: 'Switch' },
} satisfies Record<string, Paper>;

const fresh = (p: Paper): Paper => ({ ...p, mark: 'new' });

const SLIDES: Slide[] = [
  {
    badge: '1',
    title: '起点カード：カップヌードル',
    shots: [{ src: 'example/01_origin.webp', caption: '起点カードの画面' }],
    lines: [
      '「ゲームを始める」を押すと、起点カードが出ます。今回はカップヌードル（1971年）。',
      '全員が1枚目の紙に「カップヌードル 1971」と書いて、自分の前に置きます。「書けたら、つぎへ進む」を押してスタート。',
    ],
    rows: [{ label: '手元の紙の並び', papers: [fresh(P.cup)] }],
  },
  {
    badge: '2',
    title: 'たまごっち',
    shots: [
      { src: 'example/02a_question.webp', caption: '問題の画面' },
      { src: 'example/02b_answer.webp', caption: '答えの画面' },
    ],
    lines: [
      '「たまごっちは、カップヌードルより後かな？」と考えて、白い紙を右に置きます。',
      '「答えをみる」を押すと1996年。当たり！ 紙に「たまごっち 1996」と書きます。',
    ],
    rows: [{ label: '手元の紙の並び', papers: [P.cup, fresh(P.tama)] }],
  },
  {
    badge: '3',
    title: '電気アイロン',
    shots: [
      { src: 'example/03a_question.webp', caption: '問題の画面' },
      { src: 'example/03b_answer.webp', caption: '答えの画面' },
    ],
    lines: [
      '紙が増えると、紙と紙の間にも置けるので、置き場所の選び方がむずかしくなります。',
      '「電気アイロンは、いちばん古そう」と考えて、白い紙を左のはしに置きます。',
      '答えは1914年。当たり！',
    ],
    rows: [{ label: '手元の紙の並び', papers: [fresh(P.iron), P.cup, P.tama] }],
  },
  {
    badge: '4',
    title: 'Switch',
    shots: [
      { src: 'example/04a_question.webp', caption: '問題の画面' },
      { src: 'example/04b_answer.webp', caption: '答えの画面' },
    ],
    lines: ['「いちばん新しそう」と考えて、右のはしに置きます。', '答えは2017年。当たり！ これで紙は4枚。あと1枚であがりです。'],
    rows: [{ label: '手元の紙の並び', papers: [P.iron, P.cup, P.tama, fresh(P.sw)] }],
  },
  {
    badge: '5',
    title: 'ポカリスエット（当たりの場合）',
    shots: [
      { src: 'example/05a_question.webp', caption: '問題の画面' },
      { src: 'example/05b_answer.webp', caption: '答えの画面' },
    ],
    lines: [
      '「カップヌードルより後、たまごっちより前かな？」と考えて、カップヌードルとたまごっちの間に置きます。',
      '答えは1980年。当たり！',
    ],
    highlight: '紙が5枚、正しい順に並びました。あがり！',
    rows: [{ label: '手元の紙の並び', papers: [P.iron, P.cup, fresh(P.pocari), P.tama, P.sw] }],
  },
  {
    badge: '5',
    title: 'もしも、はずれてしまったら',
    shots: [
      { src: 'example/05a_question.webp', caption: '問題の画面' },
      { src: 'example/05b_answer.webp', caption: '答えの画面' },
    ],
    lines: [
      '「カップヌードルより前かな？」と考えて、電気アイロンとカップヌードルの間に置いたとします。',
      '答えは1980年。カップヌードル（1971年）より後なので、はずれ……。',
    ],
    note: 'はずれたら、紙には何も書かずに手元に戻し、次の自分の番に使います。紙は4枚のまま。あがりは次のチャンスに！',
    rows: [
      { label: '置いた位置', papers: [P.iron, { year: null, name: 'ポカリスエット', mark: 'miss' }, P.cup, P.tama, P.sw] },
      { label: 'はずれたあとの並び（4枚のまま）', papers: [P.iron, P.cup, P.tama, P.sw] },
    ],
  },
];

function PaperChip({ paper }: { paper: Paper }) {
  if (paper.mark === 'miss') {
    return (
      <div className="min-w-0 flex-1 max-w-[3.6rem] rounded-md border-2 border-dashed border-gray-300 bg-white py-1.5 text-center">
        <div className="text-base font-black leading-tight text-theme-coral">×</div>
        <div className="text-[0.5rem] font-bold leading-tight text-gray-500 break-all">{paper.name}</div>
      </div>
    );
  }
  const isNew = paper.mark === 'new';
  return (
    <div
      className={`min-w-0 flex-1 max-w-[3.6rem] rounded-md border-2 py-1.5 text-center shadow-[0.125rem_0.125rem_0_rgba(0,0,0,0.08)] ${
        isNew ? 'border-theme-coral bg-[#FFE3E3]' : 'border-theme-yellow/70 bg-theme-trivia'
      }`}
    >
      <div className="text-sm font-black leading-tight text-gray-900 tabular-nums">{paper.year}</div>
      <div className="text-[0.5rem] font-bold leading-tight text-gray-600 break-all">{paper.name}</div>
    </div>
  );
}

export function ExampleSlides({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;
  const isMiss = slide.title.startsWith('もしも');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-[0.375rem] md:border-[0.5rem] border-theme-yellow p-5 md:p-8 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col relative"
      >
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800"
        >
          <div className="text-xl font-black">×</div>
        </button>
        <div className="mb-3 flex items-baseline gap-3 pr-12">
          <h2 className="text-lg md:text-2xl font-black text-gray-900">やり方の例</h2>
          <span className="text-xs md:text-sm font-black text-gray-400 tabular-nums">
            {index + 1} / {SLIDES.length}
          </span>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
          {isFirst && (
            <p className="mb-3 text-xs md:text-sm leading-relaxed text-gray-500">
              5つの商品で、1人の人の紙の並び方を見てみましょう。実際は、1枚ごとに次の人の番になります（ここでは説明のため、同じ人の番だけを続けて見ていきます）。
            </p>
          )}

          <div className="mb-3 flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
                isMiss ? 'bg-gray-400' : 'bg-theme-coral'
              }`}
            >
              {slide.badge}
            </span>
            <h3 className="text-base md:text-xl font-black text-gray-900">{slide.title}</h3>
          </div>

          <div className="mb-3 flex justify-center gap-3">
            {slide.shots.map((s) => (
              <figure key={s.src + s.caption} className="w-[6.5rem] md:w-[7.5rem]">
                <img src={s.src} alt={s.caption} className="w-full rounded-lg border-2 border-gray-100 shadow-sm" />
                <figcaption className="mt-1 text-center text-[0.625rem] md:text-xs font-bold text-gray-400">{s.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className="space-y-1.5 text-sm leading-relaxed text-gray-700">
            {slide.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          {slide.highlight && (
            <p className="mt-3 rounded-xl border-2 border-theme-yellow bg-theme-trivia px-3 py-2 text-sm font-black text-gray-800">
              {slide.highlight}
            </p>
          )}
          {slide.note && (
            <p className="mt-3 rounded-xl bg-gray-100 px-3 py-2 text-xs md:text-sm leading-relaxed text-gray-600">{slide.note}</p>
          )}

          {slide.rows.map((row) => (
            <div key={row.label} className="mt-4">
              <p className="mb-1.5 text-xs font-bold text-gray-400">{row.label}</p>
              <div className="flex justify-center gap-1">
                {row.papers.map((p, i) => (
                  <PaperChip key={`${p.name}-${i}`} paper={p} />
                ))}
              </div>
              <div className="mt-1 flex justify-between px-1 text-[0.625rem] font-bold text-gray-400">
                <span>← 前（古い）</span>
                <span>後（新しい）→</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setIndex((i) => i - 1)}
            disabled={isFirst}
            className="bg-gray-100 text-gray-500 py-3 rounded-[1.125rem] font-black text-base hover:bg-gray-200 transition-colors disabled:invisible"
          >
            ← もどる
          </button>
          {isLast ? (
            <button
              onClick={onClose}
              className="bg-theme-blue text-white py-3 rounded-[1.125rem] font-black text-base shadow-[0_0.25rem_0_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity"
            >
              とじる
            </button>
          ) : (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="bg-theme-coral text-white py-3 rounded-[1.125rem] font-black text-base shadow-[0_0.25rem_0_#D32F2F] hover:opacity-90 transition-opacity"
            >
              つぎへ →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
