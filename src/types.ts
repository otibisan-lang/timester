export interface Item {
  id: string;
  name: string;
  releaseYear: number;
  /** 発売元。空なら表示しない */
  maker: string;
  trivia: string;
}

export type GameState = 'START' | 'EXPLAIN' | 'PLAYING' | 'REVEALED' | 'FINISHED';
