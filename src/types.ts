export interface Item {
  id: string;
  name: string;
  /** よみがな（ひらがな）。名前に漢字や英字があるときだけ入る */
  yomi: string;
  releaseYear: number;
  /** 発売元。空なら表示しない */
  maker: string;
  trivia: string;
}

/** ORIGIN: 試合の最初の1枚（起点カード）。答えを最初から見せる */
export type GameState = 'START' | 'EXPLAIN' | 'ORIGIN' | 'PLAYING' | 'REVEALED' | 'FINISHED';
