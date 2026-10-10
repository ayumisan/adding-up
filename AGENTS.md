# adding-up

都道府県の 2010→2015 人口変化率ランキング。依存パッケージなし。

## 触るファイル

- `app.js` — 集計・整形・CLI
- `fixtures/sample-pref.csv` — 検証用の小さいデータ
- `test/*.js` — 単体/CLI テスト
- `popu-pref.csv` — 本番データ。全文をコンテキストに入れない

## コマンド

```bash
npm test
npm start
npm run start:fixture
```

## エージェント向け

- この地図を優先し、リポジトリ探索を増やさない
- 大きな CSV や長いログは `head` / fixture / テスト結果だけ見る
- 変更後は `npm test`
- 利用枠の運用メモは `docs/quota-playbook.md`
