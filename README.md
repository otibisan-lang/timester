# TIMESTER（タイムスター）

身近な商品が「初めて日本で発売された年」を当てて、紙を並べてタイムラインを作るパーティゲームです。
キャラスター（CHARASTER）の姉妹版。

- 公開URL: https://otibisan-lang.github.io/timester/
- `main` に push すると GitHub Actions がビルドして自動公開します。

## 編集するファイル

| ファイル | 内容 |
|---|---|
| `items_master.csv` | 出題する商品のリスト（Excel で編集可）。status が「確定」で始まる行だけ出題 |
| `HOW_TO_PLAY.md` | 「あそびかた」の本文 |
| `src/App.tsx` | 画面 |

## 手元で動かす

```bash
npm install
npm run dev
```
