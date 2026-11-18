# 形象の画像

ねこ（1b、Claude Design「Neko Seaside」）。32×32、`lv{レベル}_{状態}.png`。

- レベル：1〜6（覚えた単語 0 / 50 / 150 / 300 / 600 / 1000 語）
  - Lv1 なし → Lv2 赤い首輪 → Lv3 鈴 + 斑 → Lv4 ナースキャップ → Lv5 白衣 + 聴診器 → Lv6 金のキャップ + キラキラ
- 状態：`normal`、`happy`（正解）、`sad`（不正解）、`sleep`（今日の復習なし）
- 画像を差し替えるだけでアプリに反映される（コードの変更は不要）。表示は 32 の整数倍（48 は 1.5 倍）がきれい。
- ホーム画面のねこは canvas で描いている（`src/seaside.ts` の `catSprite`）。画像を変えたらそちらも合わせる。
- 設計の詳細：`docs/design-handoff-neko-seaside.md`
