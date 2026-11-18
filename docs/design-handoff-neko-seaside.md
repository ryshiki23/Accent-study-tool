# Handoff: 形象（1b ねこ）+ 海边首页 + 配色

> 给 Claude Code 的说明。仓库：`ryshiki23/Accent-study-tool`（分支 `claude/amazing-hypatia-1r5pwi`）。对应 SPEC 第 9 节「7. 形象和配色」。

## Overview
- 形象：1b 的奶油三花猫，16×16 像素画，输出 32×32 PNG（6 等级 × 4 状态 = 24 张）。
- 首页：全屏像素海边场景（朝 / 昼 / 夕 按日本时间自动切换），猫站在栏杆上，只做眨眼；Learn / Review 缩成两个正方形卡片放在栏杆下方。
- 答题页：不放场景，用同一时间段的浅色渐变 + 同一套 UI 色。正确=绿、错误=红保留。

## About the Design Files
`design/` 里的 HTML 是**设计参考**（用浏览器直接打开 `design/Final - Neko Seaside.dc.html` 可以看到会动的效果），不是要直接拷贝的代码。请在现有的 Vite + React + TypeScript + Tailwind 代码里按现有写法重新实现。
例外：`src/seaside.js` 是纯 canvas 绘制逻辑，与框架无关，可以直接转成 `src/seaside.ts` 使用（加类型即可，逻辑不用改）。

## Fidelity
**High-fidelity**。颜色、字号、尺寸都是定稿值，请按像素还原。

---

## 1. 要放进仓库的文件
| 来源（本文件夹） | 放到仓库 | 说明 |
|---|---|---|
| `public/avatar/lv{1-6}_{normal,happy,sad,sleep}.png` | `public/avatar/` | 32×32。现有 `Avatar.tsx` 会自动读取，不用改代码 |
| `public/icons/*.png` | `public/icons/` | 27×27 像素图标，替换 NavBar 的 emoji（🏠📒📊）和卡片里的 ▶ |
| `src/seaside.js` | `src/seaside.ts` | 海边场景 + 猫的绘制。导出 `drawSeaside / catSprite / paintSprite / THEMES / CAT_POS / timeOfDay` |

## 2. 字体
`index.html` 加：
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Zen+Maru+Gothic:wght@500;700;900&display=swap" rel="stylesheet">
```
- 正文：`'Zen Maru Gothic', "Hiragino Sans", "Noto Sans JP", sans-serif`（500 / 700 / 900）
- 像素字（标题、数字、Lv、Learn/Review 标签、吹き出し、选项数字、判定文字）：`'DotGothic16'`（只有 400）

## 3. 时间段与配色（THEMES）
`timeOfDay()`：日本时间 4–10 时 = `morning`，10–16 时 = `noon`，其余 = `evening`（和 SPEC 的 4 点换日一致）。打开 app 时决定一次即可（可每分钟重算）。

| token | 朝 morning | 昼 noon | 夕 evening | 用途 |
|---|---|---|---|---|
| ink | `#22325A` | `#173A5E` | `#2E2A4F` | 主文字、所有描边、卡片阴影 |
| sub | `#5E6B8C` | `#4F6A86` | `#66648A` | 次要文字 |
| primary | `#3F6FB8` | `#2786C0` | `#5466C0` | Learn、Lv、进度条、「次へ」、强势音节 |
| accent | `#F29A5B` | `#F2B33D` | `#F08A5D` | Review 按钮底色 |
| accentText | `#C0602A` | `#9A6A0C` | `#C2582B` | 「Review」文字 |
| tile | `#E6EEF8` | `#E1F2F7` | `#EEEAFB` | 浅底（进度条空格、発音按钮、ルール标签） |
| quizBg | `#EAF2FB → #FDEBD9` | `#E4F3FB → #D5EEF2` | `#FDE4EC → #E6DDF6 → #CFDBF4` | 答题页背景 `linear-gradient(160deg, …)` |
| correct | `#2E9E6A` | `#24966A` | `#2A9A68` | 正确 |
| wrong | `#E0484F` | `#DE4452` | `#DE4459` | 错误 |
| sky0 | `#A9C8EE` | `#4F9FE6` | `#BCA9E3` | 首页 canvas 加载前的底色 |
| 卡片 | `#FFFFFF` | ← | ← | |

建议：在 `App.tsx` 算出 `theme = THEMES[timeOfDay()]`，用 CSS 变量（`--ink` 等）挂在根元素上，Tailwind 里用 `text-[var(--ink)]` 之类引用。`index.css` 的 body 背景改为 `var(--quiz-bg)`（首页被场景盖住，其他页面用它）。

## 4. 首页（Home.tsx）
画面 375×760 为基准（宽度 > 375 时居中、最大 480，场景按宽度等比放大）。

**结构（全部 `position:absolute`，叠在场景上）**
1. **场景 canvas**：`<canvas width=94 height=190>`，CSS `width:100%`（375 宽时 376×760），`image-rendering: pixelated`，铺满整个首页背景（含状态栏区域）。
   - 每 125ms 一帧：`requestAnimationFrame` 里 `fr = Math.floor(performance.now()/125)`，fr 变化时调用 `drawSeaside(ctx, fr, time, level, mood)`。
   - `prefers-reduced-motion` 时只画一帧（fr=0）不循环。
   - mood 用现有 `greeting()` 返回的 mood。
2. **头部** top 52 / 左右 20，`flex justify-between items-start`
   - 左：日期 13px/700 ink；下方「アクセント練習」DotGothic16 26px ink，gap 2。
   - 右：**Lv 牌** 宽 132，`background:rgba(255,255,255,.92)`，`border:2px solid ink`，圆角 6，padding 6×9，纵向 gap 5。
     - 第 1 行：`Lv3` DotGothic16 17px primary｜`あと 92 語` 11px/700 sub（最高级显示「最高レベル！」）
     - 第 2 行：10 格进度，高 6，gap 2，已满 = primary，未满 = tile（格数 = `round(progress*10)`）
3. **吹き出し** top 364 / left 166，`width:max-content; max-width:186px`，白底，`border:2px solid ink`，圆角 4，padding 6×10，DotGothic16 13px / 行高 1.45，ink，`box-shadow:0 3px 0 ink`。左侧小尖角：8×8 白方块 left -7 top 12，左边+下边 2px ink 边，`rotate(45deg)`。
   - 猫在 canvas 坐标 `CAT_POS = {x:6, y:86, scale:2}`（32×32 逻辑像素 → 375 宽时 CSS 约 left 24 / top 344 / 128×128）。吹き出し放在猫右侧。
4. **两个正方形** top 504 / 左右 20，`flex gap-12`，每个 162×162，`box-sizing:border-box`，背景 `rgba(255,255,255,.95)`，`border:3px solid ink`，圆角 10，`box-shadow:0 5px 0 rgba(0,0,0,.35)`，padding 14，`flex-col justify-between`。按下时 `active:scale-[0.98]`。
   - 上行：标签（DotGothic16 16px，letter-spacing .06em；Learn = primary，Review = accentText）｜右上 34×34 方块（Learn 底 primary / Review 底 accent，`border:2px solid ink`）中间 `icons/play_white.png` 18×18。
   - 下行：数字 DotGothic16 32px 行高 1 ink（Learn = 残り数，Review = `capCount(reviewCount)`）；说明 13px/700 sub：「新しい単語・残り」「復習・今日」。
   - **Review 为 0**：背景 `rgba(255,255,255,.35)`，`border:3px dashed rgba(255,255,255,.8)`，无阴影，文字全白：「Review」/「完了！」(DotGothic16 22px)/「今日の復習は完了」13px/700。不可点击。
   - Learn 为 0 时整体 `opacity:.5` 并禁用（同现有逻辑）。
5. **NavBar（仅首页样式）**：高 68（+ safe-area），`background:rgba(12,14,36,.5)`，无边框，叠在场景底部。图标 24×24（`icons/*_active.png` / `*_inactive.png`），文字 11px/700，当前页 `#FFFFFF`，其他 `#C9CEE6`。
   - 其他页面（間違いノート・分析）的 NavBar：白底 `border-top:3px solid ink`，当前页图标/文字用 primary（可用 inactive 图标 + primary 文字，或自行导出 primary 色图标）。

## 5. 出題画面（Quiz.tsx）
背景 quizBg 渐变，内容宽 343 居中。
- **顶栏**：「✕ やめる」胶囊（白底，`border:2px solid ink`，padding 7×12，13px/700 ink）｜Avatar 48×48（现有组件，PNG 会自动替换）｜「✓ 3 / 10」DotGothic16 16px ink。
- **进度条**（mt 10）：外框 `border:2px solid ink`，白底，padding 2；内部 10 格（题数格），gap 2，高 8，已答对 = primary，其余 = tile。（不是 10 题时按题数分格，或保留现有连续条但改色）
- **题目**：「第一強勢はどこ？」14px/700 sub｜单词 46px/900 ink，letter-spacing .02em｜「4 音節」DotGothic16 14px sub，纵向 gap 10。
- **解説卡**：白底，`border:3px solid ink`，圆角 8，padding 12×16，gap 8。
  - 判定：DotGothic16 22px，「○ 正解！」= correct，「× ざんねん」= wrong。
  - 発音按钮：tile 底胶囊，13px/700 primary，文字「♪ 発音」（替换 🔊）。
  - StressedWord 24px：强势音节 primary/900，其他 sub/500，「・」`#C9C3D6`；「第 3 音節」14px/700 sub。
  - 规则行：「ルール」标签（tile 底，DotGothic16 12px ink，padding 2×8）+ 规则文 13px/700 ink（替换 💡）。
  - 「この問題を報告」11px sub 下划线，右对齐。
- **选项**（mt 14）：`grid-cols-{音节数}` gap 10，高 60，圆角 8，`border:3px solid`，`box-shadow:0 4px 0 (同边框色)`，DotGothic16 26px。
  - 未答：白底 / ink 字 / ink 边。
  - 正解：correct 底 / 白字 / ink 边。选错的：wrong 底 / 白字 / ink 边。其余：`rgba(255,255,255,.6)` 底 / sub 字 / sub 边。
  - 题型 B 的 2×2 词语按钮同样式，字改为 Zen Maru Gothic 18px/700。
- **次へ**（mt 16）：高 54，primary 底，`border:3px solid ink`，圆角 8，`box-shadow:0 5px 0 ink`，18px/900 白字。
- 「もう一度」标签：accent 底、ink 字、DotGothic16 12px（替换 amber）。
- 连对 5 题的庆祝弹窗：去掉 🎉，改为猫的 `lv{n}_happy.png`（64×64）+「5 問連続正解！」DotGothic16 18px primary，卡片样式同解説卡。

## 6. 形象（Avatar）
- PNG 直接覆盖 `public/avatar/`，`Avatar.tsx` 不用改。尺寸建议用 32 的整数倍（32 / 64 / 96 / 128），否则像素会不均匀：首页由 canvas 绘制（2 倍 = 128px），答题页 48 也可（1.5 倍，每块 3px，均匀）。
- 成长：Lv1 无配件 → Lv2 红项圈 → Lv3 铃铛 + 右脸花斑 → Lv4 护士帽 → Lv5 白大褂 + 听诊器 → Lv6 帽子金色 + 闪光。
- 状态：normal / happy（^^ + 张嘴）/ sad（眉毛下垂 + 眼泪）/ sleep（闭眼 + Z）。场景内另有 `blink`（只在 canvas 里用，无 PNG）。

## 7. 动画（全部很克制）
| 位置 | 动作 |
|---|---|
| 首页猫 normal | 每 32 帧（4 秒）闭眼 2 帧（250ms）。不移动 |
| 首页猫 happy | 每 24 帧（3 秒）跳一次：上移 0/2/4/2/0 逻辑像素 |
| 首页猫 sleep | 2 个小 Z 慢慢往右上飘 |
| 云 / 海鸥 / 海面 | 云 2–4 秒移动 1 格，海鸥 0.5 秒 1 格，波纹和反光每 0.25–0.5 秒变化 |
| 答对 | 保留现有 `animate-hop`（Avatar 跳一下） |

## 8. State
不需要新的持久化状态。新增：`time = timeOfDay()`（App 级），传给 Home（场景）和主题 CSS 变量。

## Files
- `design/Final - Neko Seaside.dc.html`：最终设计参考（需同目录 `support.js` `sprites.js` `seaside.js`，用浏览器打开）。
- `src/seaside.js`：可直接移植的场景 + 猫绘制代码。
- `public/avatar/`、`public/icons/`：素材。
