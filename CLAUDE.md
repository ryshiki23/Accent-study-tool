# CLAUDE.md

英語アクセント問題の練習 Web アプリ。利用者は医学部受験生 1 人（スマホ中心）。

## 最初に読むもの
- `SPEC.md` が唯一の仕様。作業前に必ず読む。仕様と違うことをしたくなったら、先にユーザーに確認してから SPEC.md を更新する。
- 開発は SPEC.md 第 9 節の順番で、**1 ステップずつ**。1 ステップ終わったら動作確認 → コミット → ユーザーに報告して止まる。複数ステップを一度にやらない。

## ルール
- アプリの画面の文言はすべて日本語。
- 題庫は `public/data/items.json`（`scripts/build_dataset.py` が生成）。手で編集しない。直したいときはスクリプトか `data/manual/` を直して再生成する。
- Supabase の service role key はコードにもリポジトリにも入れない。フロントは anon key だけ。環境変数は `.env.local`（git に入れない）。
- ユーザーはコードを書かない（vibe coding）。説明は短く、何を変えたか・どう確認するかを書く。
- ユーザーとの会話は中国語でもよい。

## 題庫の再生成（必要なときだけ）
```bash
bash scripts/fetch_data.sh
pip install nltk pyphen wordfreq better_profanity
python3 scripts/build_dataset.py
```
