export interface Item {
  id: string;
  name: string;
  releaseYear: number;
  /** 発売元。空なら表示しない */
  maker: string;
  trivia: string;
}

/** ORIGIN: 試合の最初の1枚（起点カード）。答えを最初から見せる */
export type GameState = 'START' | 'EXPLAIN' | 'ORIGIN' | 'PLAYING' | 'REVEALED' | 'FINISHED';
