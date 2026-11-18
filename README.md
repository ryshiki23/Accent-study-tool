# Accent-study-tool

英語アクセント問題の練習 Web アプリ。仕様は [SPEC.md](SPEC.md)。

## 現状
- ✅ 第 0 步：題庫（`public/data/items.json`、4751 詞条）とレポート（`data/generated/report.md`）
- ✅ 第 1 步：Learn（題型 A・10 問）＋ 解説 ＋ 結果画面。進捗はメモリのみ
- ✅ 第 1.5 步：Vercel 連携（ブランチごとにプレビュー URL）
- ✅ 第 2 步：Supabase 連携（URL の ID、進捗の保存・読み込み）
- ✅ 第 3 步：間隔復習（Review）、1 組内の間違い直し、単体テスト（`npm test`）
- ✅ 第 4 步：題型 B（仲間はずれ）・C（例文）、品詞ラベル
- ✅ 第 5 步：間違いノート・分析画面・下部ナビ
- ✅ 第 6 步：発音・正解リアクション・形象とレベル・報告ボタン・PWA
- ✅ 第 7 步：形象・配色（Neko Seaside）
- ⬜ 第 8 步：正式上線

例文の読み上げチェック：`/?check=sentences`

## 動かし方
```bash
npm install
cp .env.example .env.local   # Supabase の URL と anon key を入れる
npm run dev
```
ブラウザで `http://localhost:5173/?u=<22 文字の ID>` を開く。

## データベース
- `supabase/schema.sql` を Supabase の SQL Editor で実行（何度実行しても大丈夫）。
- 利用者用 ID と URL の作成：`node scripts/new_user_id.mjs https://<サイトのURL>`

## 形象の画像
`public/avatar/` に `lv{レベル}_{状態}.png` を置くと差し替わる（詳しくは `public/avatar/README.md`）。
アイコン（ホーム画面用）は `python3 scripts/make_icons.py` で作り直せる。

## データの出典
- CMU Pronouncing Dictionary（BSD）
- Britfone（MIT）
- g2p_en homographs（Apache 2.0）
- WordNet（WordNet License）
- New General Service List / New Academic Word List（CC BY-SA 4.0, Browne, Culligan & Phillips）、Academic Word List（Coxhead）
- wordfreq（Apache 2.0 / CC BY-SA 4.0）
