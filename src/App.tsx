/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Info, Trophy, ArrowRight, Hourglass, Shuffle } from 'lucide-react';
import { ITEMS } from './generated/items';
import { Item, GameState } from './types';
import { HowToPlayBody } from './HowToPlayBody';

const DEFAULT_FEEDBACK_FORM_URL = 'https://form.run/@otibisan-t4q5Blrt5CTGeCAUpCDJ';
const FEEDBACK_FORM_URL =
  (import.meta.env.VITE_FEEDBACK_FORM_URL as string | undefined)?.trim() || DEFAULT_FEEDBACK_FORM_URL;

const APP_VERSION = '1.0.0';
const LAST_UPDATED = '2026-10-07';

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentRevealed, setCurrentRevealed] = useState(false);
  // 山札。タイトルに戻っても保持し、「いま n / N」からシャッフルしたときだけ作り直す
  const [deck, setDeck] = useState<Item[]>(() => shuffle(ITEMS));
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState<Item[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    document.title = 'TIMESTER タイムスター';
  }, []);

  const drawFrom = useCallback((cards: Item[], index: number) => {
    setCurrentItem(cards[index]);
    setCurrentRevealed(false);
    setRound(index + 1);
    setGameState('PLAYING');
  }, []);

  /** 試合を始める。山札は前の試合の続きから使う（未回答のまま中断したカードはもう一度出す） */
  const startGame = useCallback(() => {
    setHistory([]);
    setShowRules(false);
    if (currentItem && !currentRevealed) {
      setGameState('PLAYING');
      return;
    }
    if (round >= deck.length) {
      const reshuffled = shuffle(ITEMS);
      setDeck(reshuffled);
      drawFrom(reshuffled, 0);
      return;
    }
    drawFrom(deck, round);
  }, [currentItem, currentRevealed, round, deck, drawFrom]);

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
    setCurrentRevealed(true);
    setGameState('REVEALED');
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
    if (gameState === 'PLAYING' || gameState === 'REVEALED') {
      drawFrom(reshuffled, 0);
    } else {
      setCurrentItem(null);
      setCurrentRevealed(false);
      setRound(0);
    }
  };

  const onClickHeaderTitle = () => {
    if (gameState === 'PLAYING' || gameState === 'REVEALED' || gameState === 'FINISHED') {
      setShowExitConfirm(true);
      return;
    }
    setGameState('START');
  };

  const showMobilePlayDock = (gameState === 'PLAYING' || gameState === 'REVEALED') && currentItem != null;

  return (
    <div className="min-h-[100dvh] bg-theme-bg text-gray-800 font-sans selection:bg-yellow-200 flex flex-col">
      {/* Header */}
      <header className="bg-theme-coral px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] flex justify-between items-center shadow-[0_4px_0_rgba(0,0,0,0.1)] relative z-10 shrink-0">
        <button
          type="button"
          onClick={onClickHeaderTitle}
          className="text-left text-white font-black text-2xl md:text-3xl tracking-tighter font-display uppercase italic flex items-baseline gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          TIMESTER
          <span className="text-[10px] md:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md normal-case not-italic">
            タイムスター
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
        <div className="w-full">
          <AnimatePresence mode="wait">
            {gameState === 'START' && (
              <motion.div
                key="start"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.05, opacity: 0 }}
                className="bg-white rounded-[40px] border-[8px] border-theme-blue p-8 md:p-16 shadow-[12px_12px_0_#4D96FF] flex flex-col items-center text-center max-w-2xl mx-auto"
              >
                <div className="w-24 h-24 mb-8 bg-theme-yellow border-4 border-white rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3 text-gray-800">
                  <Hourglass className="w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 font-display italic tracking-tighter leading-tight">
                  TIMESTER
                  <span className="block text-xl md:text-2xl mt-1 text-theme-coral opacity-80 not-italic font-bold">
                    タイムスター
                  </span>
                </h1>
                <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-md">
                  身近な商品の発売年を当てて<br />
                  タイムラインを作ろう！
                </p>
                <div className="flex w-full max-w-md flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="explain-button"
                      onClick={() => setGameState('EXPLAIN')}
                      className="bg-theme-blue text-white px-2 py-4 rounded-[18px] font-black text-sm sm:text-base md:text-lg whitespace-nowrap shadow-[0_5px_0_rgba(0,0,0,0.1)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                    >
                      あそびかた
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                    <button
                      onClick={() => setShowCatalog(true)}
                      className="bg-white text-theme-blue px-2 py-4 rounded-[18px] font-black text-sm sm:text-base md:text-lg whitespace-nowrap border-2 border-theme-blue/30 shadow-[0_5px_0_rgba(77,150,255,0.2)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                    >
                      収録アイテム一覧
                    </button>
                  </div>
                  <button
                    id="quick-start-button"
                    onClick={startGame}
                    className="w-full bg-theme-coral text-white px-8 py-6 rounded-[20px] font-black text-2xl md:text-3xl shadow-[0_6px_0_#D32F2F] hover:scale-[1.03] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    <Play className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                    ゲームを始める
                  </button>
                </div>
                <div className="mt-8 w-full max-w-md rounded-2xl border-2 border-theme-blue/30 bg-[#EEF5FF] px-5 py-3 text-xs md:text-sm text-gray-700 font-bold leading-relaxed">
                  <div>Version: v{APP_VERSION}</div>
                  <div>更新日: {LAST_UPDATED}</div>
                  <div>収録アイテム数: {ITEMS.length}</div>
                </div>
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
                    className="bg-theme-coral text-white px-16 py-5 rounded-[20px] font-black text-2xl shadow-[0_6px_0_#D32F2F] hover:scale-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase"
                  >
                    ゲームを始める
                    <Play className="w-7 h-7 fill-current" />
                  </button>
                </div>
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
                つぎへ進む →
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
          <button
            onClick={() => setShowRules(true)}
            className="text-sm font-black text-gray-600 hover:text-theme-blue transition-colors flex items-center gap-2 uppercase tracking-widest cursor-pointer bg-white/50 px-6 py-2 rounded-full border-2 border-gray-100"
          >
            <Info className="w-4 h-4" />
            あそびかたを見る
          </button>
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

      <footer className="py-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] shrink-0 flex flex-col items-center gap-2">
        <span>&copy; 2026 TIMESTER • タイムスター</span>
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
