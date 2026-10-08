/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Info, Trophy, ArrowRight, Hourglass, Shuffle, ExternalLink, Lightbulb } from 'lucide-react';
import { ITEMS } from './generated/items';
import { Item, GameState } from './types';
import { HowToPlayBody } from './HowToPlayBody';

const DEFAULT_FEEDBACK_FORM_URL = 'https://form.run/@otibisan-t4q5Blrt5CTGeCAUpCDJ';
const FEEDBACK_FORM_URL =
  (import.meta.env.VITE_FEEDBACK_FORM_URL as string | undefined)?.trim() || DEFAULT_FEEDBACK_FORM_URL;

const APP_VERSION = '1.1.0';
const LAST_UPDATED = '2026-10-08';
/** シリーズ内でのこの版の名前（ヘッダー・タイトル画面に表示） */
const EDITION_NAME = '現代アイテム';

/** 「別のバージョンでも遊ぶ？」に並べるリンク（タイムスターの別版が増えたらここに足す） */
const OLDEST_YEAR = Math.min(...ITEMS.map((i) => i.releaseYear));
const NEWEST_YEAR = Math.max(...ITEMS.map((i) => i.releaseYear));

/** 「ヒント」ウインドウに並べる文（年はリストから自動計算） */
const HINTS = [
  `収録アイテムのうち、一番古いものは${OLDEST_YEAR}年、一番新しいものは${NEWEST_YEAR}年だよ。`,
  '「初めて発売された年」は、「一般家庭に広まった年」より早いよ。',
  '年上の人に「子どものころに、これあった？」って聞いてみて。',
  'ゲーム機やおもちゃは、1980年以降が多いよ。',
  'ほかの人が出したカードもヒントになるかも。',
];

const OTHER_VERSIONS = [
  {
    title: 'キャラスター 超有名キャラ版',
    description: 'だれもが知っているキャラクターのデビュー年を当てよう',
    url: 'https://otibisan-lang.github.io/charaster-fomous/',
    color: 'bg-theme-blue',
  },
  {
    title: 'キャラスター 企業キャラ版',
    description: '会社やお店のキャラクターのデビュー年を当てよう',
    url: 'https://otibisan-lang.github.io/charaster-corporate/',
    color: 'bg-theme-green',
  },
];

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/** 再読み込みしても続きから遊べるよう、山札と進み具合をこのブラウザに保存する */
const STORAGE_KEY = 'timester-modern-items-progress-v1';

type SavedProgress = {
  deckIds: string[];
  round: number;
  originRound: number;
  historyIds: string[];
  currentId: string | null;
  gameState: GameState;
};

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedProgress;
    const deck = saved.deckIds.map((id) => ITEM_BY_ID.get(id));
    // 収録リストが変わっていたら保存内容は使わない
    if (deck.length !== ITEMS.length || deck.some((item) => !item)) return null;
    const history = saved.historyIds.map((id) => ITEM_BY_ID.get(id)).filter((item): item is Item => !!item);
    const currentItem = saved.currentId ? ITEM_BY_ID.get(saved.currentId) ?? null : null;
    const gameState: GameState =
      currentItem || saved.gameState === 'START' || saved.gameState === 'EXPLAIN' || saved.gameState === 'FINISHED'
        ? saved.gameState
        : 'START';
    return {
      deck: deck as Item[],
      round: saved.round,
      originRound: saved.originRound,
      history,
      currentItem,
      gameState,
    };
  } catch {
    return null;
  }
}

function saveProgress(progress: SavedProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 保存できない環境（プライベートモード等）では何もしない
  }
}

export default function App() {
  const [saved] = useState(loadProgress);
  const [gameState, setGameState] = useState<GameState>(saved?.gameState ?? 'START');
  const [currentItem, setCurrentItem] = useState<Item | null>(saved?.currentItem ?? null);
  // 山札。タイトルに戻っても再読み込みしても保持し、「いま n / N」からシャッフルしたときだけ作り直す
  const [deck, setDeck] = useState<Item[]>(() => saved?.deck ?? shuffle(ITEMS));
  const [round, setRound] = useState(saved?.round ?? 0);
  // この試合の起点カードが山札の何枚目か（ここより前には戻れない）
  const [originRound, setOriginRound] = useState(saved?.originRound ?? 0);
  const [history, setHistory] = useState<Item[]>(saved?.history ?? []);

  useEffect(() => {
    saveProgress({
      deckIds: deck.map((item) => item.id),
      round,
      originRound,
      historyIds: history.map((item) => item.id),
      currentId: currentItem?.id ?? null,
      gameState,
    });
  }, [deck, round, originRound, history, currentItem, gameState]);
  const [showRules, setShowRules] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showOtherVersions, setShowOtherVersions] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    document.title = `TIMESTER タイムスター ${EDITION_NAME}`;
  }, []);

  const drawFrom = useCallback((cards: Item[], index: number) => {
    setCurrentItem(cards[index]);
    setRound(index + 1);
    setGameState('PLAYING');
  }, []);

  /** 試合の最初の1枚を起点カードとして出す。答えは最初から見せるので、出題履歴にも入れる */
  const drawOrigin = useCallback((cards: Item[], index: number) => {
    setCurrentItem(cards[index]);
    setRound(index + 1);
    setHistory([cards[index]]);
    setOriginRound(index + 1);
    setGameState('ORIGIN');
  }, []);

  /** 試合を始める。山札は前の試合の続きから使い、最初の1枚は必ず起点カードにする */
  const startGame = useCallback(() => {
    setShowRules(false);
    if (round >= deck.length) {
      const reshuffled = shuffle(ITEMS);
      setDeck(reshuffled);
      drawOrigin(reshuffled, 0);
      return;
    }
    drawOrigin(deck, round);
  }, [round, deck, drawOrigin]);

  const nextItem = useCallback(() => {
    if (round >= deck.length) {
      setGameState('FINISHED');
      return;
    }
    drawFrom(deck, round);
  }, [round, deck, drawFrom]);

  const revealInfo = () => {
    if (currentItem && !history.find((c) => c.id === currentItem.id)) {
      setHistory((prev) => [...prev, currentItem]);
    }
    setGameState('REVEALED');
  };

  const isInGame = gameState === 'ORIGIN' || gameState === 'PLAYING' || gameState === 'REVEALED';

  const canGoBack = gameState === 'REVEALED' || (gameState === 'PLAYING' && round > originRound);

  /** ひとつ前の画面に戻る。答え→同じカードの問題、問題→前のカードの答え（前が起点カードなら起点カード） */
  const goBack = () => {
    if (gameState === 'REVEALED' && currentItem) {
      setHistory((prev) => prev.filter((c) => c.id !== currentItem.id));
      setGameState('PLAYING');
      return;
    }
    if (gameState === 'PLAYING' && round > originRound) {
      const prevRound = round - 1;
      setCurrentItem(deck[prevRound - 1]);
      setRound(prevRound);
      setGameState(prevRound === originRound ? 'ORIGIN' : 'REVEALED');
    }
  };

  const backToTitle = () => {
    setGameState('START');
    setShowExitConfirm(false);
  };

  const shuffleDeck = () => {
    const reshuffled = shuffle(ITEMS);
    setDeck(reshuffled);
    setHistory([]);
    setShowShuffleConfirm(false);
    if (isInGame) {
      drawOrigin(reshuffled, 0);
    } else {
      setCurrentItem(null);
      setRound(0);
    }
  };

  const onClickHeaderTitle = () => {
    if (isInGame || gameState === 'FINISHED') {
      setShowExitConfirm(true);
      return;
    }
    setGameState('START');
  };

  const showMobilePlayDock = isInGame && currentItem != null;

  return (
    <div className="min-h-[100dvh] bg-theme-bg text-gray-800 font-sans selection:bg-yellow-200 flex flex-col">
      {/* Header */}
      <header className="bg-theme-coral px-4 md:px-5 pb-3 md:pb-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] md:pt-[max(1.25rem,env(safe-area-inset-top,0px))] flex justify-between items-center shadow-[0_4px_0_rgba(0,0,0,0.1)] relative z-10 shrink-0">
        <button
          type="button"
          onClick={onClickHeaderTitle}
          className="text-left text-white font-black text-2xl md:text-3xl tracking-tighter font-display uppercase italic flex items-baseline gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          TIMESTER
          <span className="text-[10px] md:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md normal-case not-italic">
            {EDITION_NAME}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowShuffleConfirm(true)}
          title="カードをシャッフルする"
          className="bg-white px-5 py-2 rounded-full font-bold text-theme-coral flex items-center gap-2 shadow-sm border-2 border-orange-100 cursor-pointer hover:scale-105 active:translate-y-0.5 transition-all"
        >
          <span className="text-gray-400 text-xs">いま</span>
          <span className="tabular-nums">
            {round} / {deck.length}
          </span>
        </button>
      </header>

      <main
        className={`flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 py-4 md:py-12 flex flex-col items-center justify-center ${
          showMobilePlayDock
            ? 'max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]'
        }`}
      >
        {isInGame ? (
          <div className="mb-2 md:mb-4 w-full max-w-xl mx-auto">
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              className={`rounded-full border-2 border-gray-200 bg-white px-4 py-1.5 text-xs md:text-sm font-black text-gray-500 hover:border-theme-blue hover:text-theme-blue transition-colors ${
                canGoBack ? '' : 'invisible'
              }`}
            >
              ← ひとつ戻る
            </button>
          </div>
        ) : null}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {gameState === 'START' && (
              <motion.div
                key="start"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.05, opacity: 0 }}
                className="mx-auto flex w-full max-w-2xl flex-col items-center"
              >
                <div className="w-full bg-white rounded-[32px] md:rounded-[40px] border-[6px] md:border-[8px] border-theme-blue px-5 py-6 md:p-14 shadow-[8px_8px_0_#4D96FF] md:shadow-[12px_12px_0_#4D96FF] flex flex-col items-center text-center max-w-2xl mx-auto"
              >
                <div className="w-14 h-14 md:w-24 md:h-24 mb-3 md:mb-6 bg-theme-yellow border-4 border-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3 text-gray-800">
                  <Hourglass className="w-7 h-7 md:w-12 md:h-12" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 md:mb-5 font-display italic tracking-tighter leading-tight">
                  TIMESTER
                  <span className="mt-1 flex items-center justify-center gap-2 not-italic tracking-normal">
                    <span className="text-lg md:text-2xl text-theme-coral opacity-80 font-bold">タイムスター</span>
                    <span className="rounded-full bg-theme-yellow px-2 py-0.5 text-[10px] md:text-xs font-black text-gray-800">
                      {EDITION_NAME}
                    </span>
                  </span>
                </h1>
                <p className="text-gray-600 mb-5 md:mb-8 leading-relaxed text-sm md:text-lg max-w-md">
                  身近な商品の発売年を当てて<br />
                  タイムラインを作ろう！
                </p>
                <div className="flex w-full max-w-md flex-col gap-3 md:gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="explain-button"
                      onClick={() => setGameState('EXPLAIN')}
                      className="bg-theme-blue text-white px-2 py-3 md:py-4 rounded-[16px] md:rounded-[18px] font-black text-sm sm:text-base md:text-lg whitespace-nowrap shadow-[0_5px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                    >
                      あそびかた
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                    <button
                      onClick={() => setShowCatalog(true)}
                      className="bg-white text-theme-blue px-2 py-3 md:py-4 rounded-[16px] md:rounded-[18px] font-black text-sm sm:text-base md:text-lg whitespace-nowrap border-2 border-theme-blue/30 shadow-[0_5px_0_rgba(77,150,255,0.2)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                    >
                      収録アイテム一覧
                    </button>
                  </div>
                  <button
                    id="quick-start-button"
                    onClick={startGame}
                    className="w-full bg-theme-coral text-white px-8 py-5 md:py-6 rounded-[20px] font-black text-2xl md:text-3xl shadow-[0_6px_0_#D32F2F] hover:scale-[1.03] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    <Play className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                    ゲームを始める
                  </button>
                </div>
                <p className="mt-5 md:mt-8 text-[11px] md:text-xs text-gray-400 font-bold">
                  v{APP_VERSION}・更新日 {LAST_UPDATED}・収録 {ITEMS.length} アイテム
                </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtherVersions(true)}
                  className="mt-4 md:mt-6 text-xs md:text-sm font-bold text-gray-400 underline underline-offset-2 hover:text-theme-blue transition-colors"
                >
                  別のバージョンでも遊ぶ？
                </button>
              </motion.div>
            )}

            {gameState === 'EXPLAIN' && (
              <motion.div
                key="explain"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white rounded-[40px] border-[8px] border-theme-yellow p-6 md:p-12 shadow-[12px_12px_0_#FFD93D] max-w-3xl mx-auto overflow-y-auto max-h-[80vh] custom-scrollbar"
              >
                <HowToPlayBody />

                <div className="mt-10 flex justify-center">
                  <button
                    onClick={startGame}
                    className="bg-theme-coral text-white px-8 md:px-16 py-4 md:py-5 rounded-[20px] font-black text-lg md:text-2xl whitespace-nowrap shadow-[0_6px_0_#D32F2F] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 uppercase"
                  >
                    ゲームを始める
                    <Play className="w-5 h-5 md:w-7 md:h-7 fill-current" />
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'ORIGIN' && currentItem && (
              <motion.div
                key={`origin-${round}`}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                className="mx-auto w-full max-w-xl bg-white rounded-[40px] border-[8px] border-theme-yellow p-6 md:p-10 shadow-[12px_12px_0_#FFD93D] flex flex-col items-center text-center gap-4 md:gap-6"
              >
                <span className="rounded-full bg-theme-yellow px-4 py-1 text-sm md:text-base font-black text-gray-800">
                  起点カード
                </span>
                <p className="text-sm md:text-lg font-bold text-gray-700 leading-relaxed">
                  プレイヤーは全員、このカードのアイテム名と西暦年を、手元の紙1枚に書いてください。
                </p>
                <div className="w-full rounded-3xl bg-theme-bg px-4 py-6 md:py-8 flex flex-col items-center gap-2">
                  <p className="text-3xl md:text-5xl font-black leading-tight text-gray-900 break-words">
                    {currentItem.name}
                  </p>
                  <p className="text-6xl md:text-7xl font-black text-theme-coral font-display leading-none">
                    {currentItem.releaseYear}
                  </p>
                </div>
                <p className="text-[11px] md:text-xs text-gray-500 font-bold leading-relaxed">
                  このカードが起点となります。次のカードからは、このカードよりも古いか、新しいかを判断してください。
                </p>
                <button
                  onClick={nextItem}
                  className="max-md:hidden w-full bg-theme-green text-white font-black py-5 rounded-[20px] shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 tracking-widest text-lg"
                >
                  書けたら、つぎへ進む →
                </button>
              </motion.div>
            )}

            {(gameState === 'PLAYING' || gameState === 'REVEALED') && currentItem && (
              <motion.div
                key={`round-${round}`}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                className="mx-auto flex w-full max-w-xl flex-col"
              >
                <AnimatePresence mode="wait">
                  {gameState === 'PLAYING' ? (
                    <motion.div
                      key="playing-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-[40px] border-[8px] border-theme-blue p-6 md:p-10 shadow-[12px_12px_0_#4D96FF] flex flex-col items-center text-center gap-5 md:gap-8"
                    >
                      <div className="space-y-1.5">
                        <h2 className="font-display text-sm font-black uppercase tracking-widest text-gray-400 md:text-base">
                          Current Question
                        </h2>
                        <p className="text-base font-bold text-gray-500 md:text-xl">
                          この商品が、初めて日本で発売されたのは何年？
                        </p>
                      </div>
                      <div className="w-full rounded-3xl bg-theme-bg px-4 py-8 md:py-12 flex flex-col items-center gap-3 md:gap-4">
                        <p className="text-4xl font-black leading-tight text-gray-900 break-words md:text-6xl">
                          {currentItem.name}
                        </p>
                        {currentItem.maker ? (
                          <p className="rounded-full bg-[#E1F5FE] px-4 py-1.5 text-sm font-bold text-[#01579B] md:text-base">
                            発売元：{currentItem.maker}
                          </p>
                        ) : null}
                      </div>
                      <button
                        id="reveal-button"
                        onClick={revealInfo}
                        className="max-md:hidden w-full bg-theme-coral text-white px-8 py-6 rounded-[20px] font-black text-3xl shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                      >
                        答えをみる
                        <Info className="w-8 h-8" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed-state"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[40px] border-[8px] border-theme-green p-6 md:p-10 shadow-[12px_12px_0_#6BCB77] flex flex-col gap-4 md:gap-5 text-center"
                    >
                      <div className="text-[14px] font-bold text-gray-400 tracking-widest uppercase">RELEASE YEAR</div>
                      <div className="text-7xl md:text-8xl font-black text-theme-coral font-display leading-none">
                        {currentItem.releaseYear}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-[#1A5F7A] break-words">{currentItem.name}</h3>
                      {currentItem.maker ? (
                        <p className="-mt-2 text-sm font-bold text-[#01579B]">発売元：{currentItem.maker}</p>
                      ) : null}

                      {currentItem.trivia ? (
                        <div className="bg-theme-trivia p-5 rounded-2xl border-2 border-dashed border-theme-yellow text-sm md:text-base leading-relaxed text-[#5D4037] font-medium text-left">
                          <strong>豆知識:</strong> {currentItem.trivia}
                        </div>
                      ) : null}

                      <div className="mt-2 max-md:hidden">
                        <button
                          id="next-button"
                          onClick={nextItem}
                          className="w-full bg-theme-green text-white font-black py-5 rounded-[20px] shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-lg"
                        >
                          つぎへ進む →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'FINISHED' && (
              <motion.div
                key="finished"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] border-[8px] border-theme-coral p-8 md:p-12 shadow-[12px_12px_0_#FF6B6B] flex flex-col items-center max-w-3xl mx-auto"
              >
                <div className="w-20 h-20 mb-6 bg-theme-green border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-4 uppercase italic font-display text-gray-900 tracking-tighter text-center">QUEST COMPLETE!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-center font-bold">
                  お疲れ様でした！今回の出題アイテムを年の順に並べました。
                </p>

                <div className="w-full bg-theme-bg rounded-3xl p-6 mb-8 max-h-[300px] overflow-y-auto border-4 border-white shadow-inner">
                  <div className="space-y-3">
                    {[...history]
                      .sort((a, b) => a.releaseYear - b.releaseYear)
                      .map((item) => (
                        <div key={item.id} className="flex justify-between items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <span className="font-black text-gray-800">{item.name}</span>
                          <span className="bg-theme-coral text-white px-3 py-1 rounded-lg font-black font-display text-sm shrink-0">
                            {item.releaseYear}
                          </span>
                        </div>
                      ))}
                    {history.length === 0 && <p className="text-center text-gray-400 py-4">出題履歴がありません</p>}
                  </div>
                </div>

                <button
                  id="restart-button"
                  onClick={backToTitle}
                  className="bg-theme-coral text-white px-12 py-5 rounded-[20px] font-black text-2xl shadow-[0_6px_0_#D32F2F] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase"
                >
                  タイトルに戻る
                  <RotateCcw className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* スマホ: プライマリ操作を常に親指圏内に */}
      {showMobilePlayDock && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t-2 border-white/70 bg-theme-bg/98 backdrop-blur-md shadow-[0_-8px_28px_rgba(0,0,0,0.12)]"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-6xl mx-auto w-full space-y-1 px-3 pt-1.5 pb-0.5">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
              <button
                type="button"
                onClick={() => setShowRules(true)}
                className="flex items-center gap-1 text-theme-blue hover:text-theme-coral transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                あそびかた
              </button>
              <span className="text-gray-300" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={() => setShowHints(true)}
                className="flex items-center gap-1 text-theme-blue hover:text-theme-coral transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                ヒント
              </button>
              <span className="text-gray-300" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="text-gray-500 hover:text-theme-coral transition-colors"
              >
                タイトルへ
              </button>
            </div>
            {gameState === 'PLAYING' ? (
              <button
                type="button"
                onClick={revealInfo}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-theme-coral px-4 py-3.5 font-black text-lg text-white shadow-[0_4px_0_rgba(0,0,0,0.15)] transition-all active:translate-y-0.5 active:shadow-none"
              >
                答えをみる
                <Info className="h-5 w-5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextItem}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-theme-green py-3.5 font-black uppercase tracking-widest text-sm text-white shadow-[0_4px_0_rgba(0,0,0,0.15)] transition-all active:translate-y-0.5 active:shadow-none"
              >
                {gameState === 'ORIGIN' ? '書けたら、つぎへ進む →' : 'つぎへ進む →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      {gameState !== 'START' && gameState !== 'EXPLAIN' && (
        <div
          className={`flex flex-col items-center gap-4 pb-8 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] ${
            showMobilePlayDock ? 'max-md:hidden' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRules(true)}
              className="text-sm font-black text-gray-600 hover:text-theme-blue transition-colors flex items-center gap-2 uppercase tracking-widest cursor-pointer bg-white/50 px-6 py-2 rounded-full border-2 border-gray-100"
            >
              <Info className="w-4 h-4" />
              あそびかたを見る
            </button>
            <button
              onClick={() => setShowHints(true)}
              className="text-sm font-black text-gray-600 hover:text-theme-blue transition-colors flex items-center gap-2 uppercase tracking-widest cursor-pointer bg-white/50 px-6 py-2 rounded-full border-2 border-gray-100"
            >
              <Lightbulb className="w-4 h-4" />
              ヒント
            </button>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-xs font-bold text-gray-400 hover:text-theme-coral transition-colors flex items-center gap-1 uppercase tracking-widest cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            タイトルに戻る
          </button>
        </div>
      )}

      {/* Item Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
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
              className="bg-white rounded-[40px] border-[8px] border-theme-blue p-6 md:p-10 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col relative"
            >
              <button
                onClick={() => setShowCatalog(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800 z-10"
              >
                <div className="text-2xl font-black">×</div>
              </button>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 font-display">収録アイテム一覧</h2>
              <div className="text-xs md:text-sm text-gray-500 font-bold mb-4">{ITEMS.length}件</div>
              <div className="overflow-y-auto custom-scrollbar flex-1 rounded-2xl border-2 border-theme-blue/20 bg-theme-bg p-4 text-sm md:text-base text-gray-700 leading-relaxed grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 content-start">
                {ITEMS.map((item) => (
                  <p key={item.id}>{item.name}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
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
              className="bg-white rounded-[40px] border-[8px] border-theme-yellow p-6 md:p-12 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col relative"
            >
              <button
                onClick={() => setShowRules(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800 z-10"
              >
                <div className="text-2xl font-black">×</div>
              </button>

              <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                <HowToPlayBody />
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowRules(false)}
                  className="bg-theme-blue text-white px-12 py-4 rounded-[20px] font-black text-xl shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
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
              className="bg-white rounded-[40px] border-[8px] border-theme-coral p-8 md:p-12 shadow-2xl max-w-md w-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-theme-coral/10 rounded-full flex items-center justify-center mb-6">
                <RotateCcw className="w-8 h-8 text-theme-coral" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-8">タイトルに戻りますか？</h2>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={backToTitle}
                  className="w-full bg-theme-coral text-white py-4 rounded-[20px] font-black text-xl shadow-[0_6px_0_#D32F2F] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                >
                  タイトルに戻る
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black text-xl hover:bg-gray-200 transition-colors"
                >
                  つづける
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shuffle Confirmation Modal */}
      <AnimatePresence>
        {showShuffleConfirm && (
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
              className="bg-white rounded-[40px] border-[8px] border-theme-blue p-8 md:p-12 shadow-2xl max-w-md w-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-theme-blue/10 rounded-full flex items-center justify-center mb-6">
                <Shuffle className="w-8 h-8 text-theme-blue" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3">カードをシャッフルしますか？</h2>
              <p className="text-xs text-gray-400 font-bold mb-8 leading-relaxed">
                今までに答えたカードもまた出てくるようになります。
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={shuffleDeck}
                  className="w-full bg-theme-blue text-white py-4 rounded-[20px] font-black text-xl shadow-[0_6px_0_rgba(0,0,0,0.15)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                >
                  はい
                </button>
                <button
                  onClick={() => setShowShuffleConfirm(false)}
                  className="w-full bg-gray-100 text-gray-500 py-4 rounded-[20px] font-black text-xl hover:bg-gray-200 transition-colors"
                >
                  いいえ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints Modal */}
      <AnimatePresence>
        {showHints && (
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
              className="bg-white rounded-[32px] md:rounded-[40px] border-[6px] md:border-[8px] border-theme-yellow p-6 md:p-10 shadow-2xl max-w-md w-full flex flex-col relative"
            >
              <button
                onClick={() => setShowHints(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800"
              >
                <div className="text-xl font-black">×</div>
              </button>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 pr-10 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-theme-yellow" />
                ヒント
              </h2>
              <ol className="flex flex-col gap-3">
                {HINTS.map((hint, i) => (
                  <li key={hint} className="flex gap-3 text-sm md:text-base text-gray-700 font-bold leading-relaxed">
                    <span className="bg-theme-yellow text-gray-800 font-black w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <span className="min-w-0">{hint}</span>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setShowHints(false)}
                className="mt-6 w-full bg-gray-100 text-gray-500 py-3 rounded-[18px] font-black text-base hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other Versions Modal */}
      <AnimatePresence>
        {showOtherVersions && (
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
              className="bg-white rounded-[32px] md:rounded-[40px] border-[6px] md:border-[8px] border-theme-yellow p-6 md:p-10 shadow-2xl max-w-md w-full flex flex-col relative"
            >
              <button
                onClick={() => setShowOtherVersions(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800"
              >
                <div className="text-xl font-black">×</div>
              </button>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1 pr-10">別のバージョンでも遊ぶ？</h2>
              <p className="text-xs md:text-sm text-gray-500 font-bold mb-5">同じルールで遊べる、ほかのゲームです。</p>
              <div className="flex flex-col gap-3">
                {OTHER_VERSIONS.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${v.color} flex items-center gap-3 rounded-[18px] px-5 py-4 text-white shadow-[0_5px_0_rgba(0,0,0,0.12)] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block font-black text-base md:text-lg">{v.title}</span>
                      <span className="block text-[11px] md:text-xs font-bold text-white/90">{v.description}</span>
                    </span>
                    <ExternalLink className="w-5 h-5 shrink-0 opacity-90" />
                  </a>
                ))}
              </div>
              <button
                onClick={() => setShowOtherVersions(false)}
                className="mt-5 w-full bg-gray-100 text-gray-500 py-3 rounded-[18px] font-black text-base hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-4 md:py-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] shrink-0 flex flex-col items-center gap-2">
        <span>&copy; 2026 TIMESTER • タイムスター {EDITION_NAME}</span>
        {FEEDBACK_FORM_URL ? (
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="normal-case tracking-normal text-theme-blue hover:text-theme-coral hover:underline font-black text-xs"
          >
            感想・ご意見はこちら（外部フォーム）
          </a>
        ) : null}
      </footer>
    </div>
  );
}
