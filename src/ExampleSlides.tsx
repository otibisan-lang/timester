/**
 * 「やり方の例をみる」：1人の紙の並び方を、紙芝居のように1枚ずつ見せる。
 * 中身は docs/タイムスター_あそびかた.pdf の「やってみよう（例）」と同じ。
 * 画面の絵は public/example/（docs/あそびかた_画面 を縮小したもの）。
 */
import { useState } from 'react';
import { motion } from 'motion/react';

type Paper = { year: number | null; name: string; mark?: 'new' | 'miss' | 'blank' };

type Shot = { src: string; caption: string };

/** 1枚の中身は、上から順に並べるブロックで書く */
type Block =
  | { kind: 'shots'; shots: Shot[] }
  | { kind: 'text'; text: string }
  | { kind: 'papers'; label: string; papers: Paper[]; caption?: string }
  | { kind: 'highlight'; text: string }
  | { kind: 'note'; text: string };

type Slide = { badge: string; title: string; blocks: Block[] };

const P = {
  iron: { year: 1914, name: '電気アイロン' },
  cup: { year: 1971, name: 'カップヌードル' },
  pocari: { year: 1980, name: 'ポカリスエット' },
  tama: { year: 1996, name: 'たまごっち' },
  sw: { year: 2017, name: 'Switch' },
} satisfies Record<string, Paper>;

const fresh = (p: Paper): Paper => ({ ...p, mark: 'new' });
/** まだ何も書いていない、予想して置いただけの紙 */
const BLANK: Paper = { year: null, name: '', mark: 'blank' };
const NOTHING_WRITTEN = '※この時点では、紙には何も書きません';

const question = (n: string): Block => ({ kind: 'shots', shots: [{ src: `example/${n}a_question.webp`, caption: '問題の画面' }] });
const answer = (n: string): Block => ({ kind: 'shots', shots: [{ src: `example/${n}b_answer.webp`, caption: '答えの画面' }] });
const text = (t: string): Block => ({ kind: 'text', text: t });
const papers = (ps: Paper[], label = '手元の紙の並び'): Block => ({ kind: 'papers', label, papers: ps });
/** 予想して白い紙を置いたところ（まだ何も書かない） */
const placed = (ps: Paper[], label = '手元の紙の並び'): Block => ({ kind: 'papers', label, papers: ps, caption: NOTHING_WRITTEN });

const SLIDES: Slide[] = [
  {
    badge: '1',
    title: '起点カード：カップヌードル',
    blocks: [
      { kind: 'shots', shots: [{ src: 'example/01_origin.webp', caption: '起点カードの画面' }] },
      text('「ゲームを始める」を押すと、起点カードが出ます。今回はカップヌードル（1971年）。'),
      text('全員が1枚目の紙に「カップヌードル 1971」と書いて、自分の前に置きます。「書けたら、つぎへ進む」を押してスタート。'),
      papers([fresh(P.cup)]),
    ],
  },
  {
    badge: '2',
    title: 'たまごっち',
    blocks: [
      question('02'),
      text('「たまごっちは、カップヌードルより後かな？」と考えて、白い紙を右に置きます。'),
      placed([P.cup, BLANK]),
      text('「答えをみる」を押すと1996年。'),
      answer('02'),
      text('当たり！ 紙に「たまごっち 1996」と書きます。'),
      papers([P.cup, fresh(P.tama)]),
    ],
  },
  {
    badge: '3',
    title: '電気アイロン',
    blocks: [
      text('紙が増えると、紙と紙の間にも置けるので、置き場所の選び方がむずかしくなります。'),
      question('03'),
      text('「電気アイロンは、いちばん古そう」と考えて、白い紙を左のはしに置きます。'),
      placed([BLANK, P.cup, P.tama]),
      text('「答えをみる」を押すと1914年。'),
      answer('03'),
      text('当たり！ 紙に「電気アイロン 1914」と書きます。'),
      papers([fresh(P.iron), P.cup, P.tama]),
    ],
  },
  {
    badge: '4',
    title: 'Switch',
    blocks: [
      question('04'),
      text('「いちばん新しそう」と考えて、白い紙を右のはしに置きます。'),
      placed([P.iron, P.cup, P.tama, BLANK]),
      text('「答えをみる」を押すと2017年。'),
      answer('04'),
      text('当たり！ 紙に「Switch 2017」と書きます。これで紙は4枚。あと1枚であがりです。'),
      papers([P.iron, P.cup, P.tama, fresh(P.sw)]),
    ],
  },
  {
    badge: '5',
    title: 'ポカリスエット（当たりの場合）',
    blocks: [
      question('05'),
      text('「カップヌードルより後、たまごっちより前かな？」と考えて、カップヌードルとたまごっちの間に白い紙を置きます。'),
      placed([P.iron, P.cup, BLANK, P.tama, P.sw]),
      text('「答えをみる」を押すと1980年。'),
      answer('05'),
      text('当たり！ 紙に「ポカリスエット 1980」と書きます。'),
      { kind: 'highlight', text: '紙が5枚、正しい順に並びました。あがり！' },
      papers([P.iron, P.cup, fresh(P.pocari), P.tama, P.sw]),
    ],
  },
  {
    badge: '5',
    title: 'もしも、はずれてしまったら',
    blocks: [
      question('05'),
      text('「カップヌードルより前かな？」と考えて、電気アイロンとカップヌードルの間に白い紙を置いたとします。'),
      placed([P.iron, BLANK, P.cup, P.tama, P.sw], '置いた位置'),
      text('「答えをみる」を押すと1980年。'),
      answer('05'),
      text('カップヌードル（1971年）より後なので、はずれ……。'),
      { kind: 'note', text: 'はずれたら、紙には何も書かずに手元に戻し、次の自分の番に使います。紙は4枚のまま。あがりは次のチャンスに！' },
      papers([P.iron, P.cup, P.tama, P.sw], 'はずれたあとの並び（4枚のまま）'),
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
  if (paper.mark === 'blank') {
    return (
      <div className="min-w-0 flex-1 max-w-[3.6rem] rounded-md border-2 border-theme-coral bg-white py-1.5 text-center shadow-[0.125rem_0.125rem_0_rgba(0,0,0,0.08)]">
        <div className="text-sm font-black leading-tight invisible">0000</div>
        <div className="text-[0.5rem] leading-tight invisible">-</div>
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

function SlideBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case 'shots':
      // 画面全体ではなく、カードの部分だけを大きく見せる。スマホでは縦に、広い画面では横に並べる
      return (
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-center">
          {block.shots.map((s) => (
            <figure key={s.src} className="w-full max-w-[20rem] md:flex-1">
              <figcaption className="mb-1 text-xs font-bold text-gray-400">{s.caption}</figcaption>
              <img src={s.src} alt={s.caption} className="w-full" />
            </figure>
          ))}
        </div>
      );
    case 'text':
      return <p className="text-sm leading-relaxed text-gray-700">{block.text}</p>;
    case 'highlight':
      return (
        <p className="rounded-xl border-2 border-theme-yellow bg-theme-trivia px-3 py-2 text-sm font-black text-gray-800">{block.text}</p>
      );
    case 'note':
      return <p className="rounded-xl bg-gray-100 px-3 py-2 text-xs md:text-sm leading-relaxed text-gray-600">{block.text}</p>;
    case 'papers':
      return (
        <div className="pt-1">
          <p className="mb-1.5 text-xs font-bold text-gray-400">{block.label}</p>
          <div className="flex justify-center gap-1">
            {block.papers.map((p, i) => (
              <PaperChip key={`${p.name}-${i}`} paper={p} />
            ))}
          </div>
          <div className="mt-1 flex justify-between px-1 text-[0.625rem] font-bold text-gray-400">
            <span>← 前（古い）</span>
            <span>後（新しい）→</span>
          </div>
          {block.caption && <p className="mt-1.5 text-xs font-bold text-theme-coral">{block.caption}</p>}
        </div>
      );
  }
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

          <div className="space-y-3">
            {slide.blocks.map((block, i) => (
              <SlideBlock key={i} block={block} />
            ))}
          </div>
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
