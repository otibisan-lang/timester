# timester（タイムスター）

キャラスターの姉妹版。身近な商品が「初めて日本で発売された年」を当てるゲーム。出題アイテムの画像は使わない（文字のみ）。

## 公開
- GitHub: https://github.com/otibisan-lang/timester（public）
- 公開URL: https://otibisan-lang.github.io/timester/
- `main` に push すると GitHub Actions（.github/workflows/deploy.yml）がビルドして GitHub Pages に自動公開する。手動アップロードは不要。
- 修正したら、ユーザーの了承を得てから commit & push する。公開後は上のURLが 200 を返すか確認する。

## データ
- 出題リストの正: `items_master.csv`（列: no, name, releaseYear, maker, trivia, status, yomi）。
- 元は Downloads の `タイムスター_題材リスト.xlsx`。CSV を直したら Excel 側も合わせる。
- `npm run sync:items` で `src/generated/items.ts` を生成（build/dev で自動実行）。

## 更新履歴・バージョン
- 公開するたびに `src/changelog.ts` の一番上に新しい版を足す（タイトル画面の「更新履歴」に出る）。
- バージョンと更新日は changelog.ts の一番上から自動で表示される。番号は 機能追加＝2つ目、小さな修正＝3つ目 を上げる。
- 答えのヒントにならないよう、アイテム名や年は書かない（「アイテムを入れかえ（2つ追加）」のように数だけ）。
