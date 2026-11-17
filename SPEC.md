# SPEC — アクセント練習 Web App

> 这份文档是整个项目的唯一依据。Claude Code 每次开发前先读它；需求变了先改这里，再改代码。
> 标 **[待确认]** 的地方还没定，集中列在第 10 节。

## 1. 目标

- **用户**：一个人（准备医学部入试的学妹），主要在手机上用。
- **目的**：练英语单词的アクセント（第一强势的位置），错过的词按间隔反复复习，直到记住。
- **不做的事**：登录、多用户、发音（母音读法）题、文法题、排行榜、通知推送、每日连续签到、徽章。

## 2. 核心设计决定

| 决定 | 内容 | 理由 |
|---|---|---|
| 记录单位 | **「词条」= 单词 + 词性**，不是「题」 | 四选一的题答错时，不知道她到底哪个词不会；按词条记录才能准确复习，也才能处理名动词 |
| 身份识别 | URL 里的随机 ID（`/?u=<22位随机串>`） | 不登录，换设备也能接着用 |
| 题库存放 | 打包成静态 JSON 放在前端 | 题库不变，不需要进数据库 |
| 进度存放 | Supabase（Postgres） | 云端保存，免费 |
| 每组题数 | 10 题 | 短，电车上一两站能做完 |
| 界面语言 | 日语 | 用户是日本考生 |

## 3. 题型

### 题型 A：位置選択（基础题型，Learn 和 Review 的主力）
- 显示一个词（需要时带词性标签），选第一强势在第几音节。
- 选项是 `1 / 2 / 3 / 4`（按该词音节数显示）。
- 一题只考一个词条，对错信号最干净。

### 题型 B：仲間はずれ（考试形式）
- 显示 4 个音节数相同的词，选强势位置与其他三个不同的那个。
- 由题库动态组合：3 个同位置 + 1 个不同位置。
- 答错时：把「她选的词」和「正确答案的词」两个词条都记为错。
- 解说里列出四个词各自的强势位置。
- 答对时：四个词条都记为答对（Learn 里即 `mastered`）。答错时只记录上面两个词条，另外两个不记录，以后仍作为新词出题。（2026-11-17 确认）
- Learn 一组 10 题中放 **2 题**题型 B（前半、后半各一题，第 1 题不放）。确认目标学校的出题形式后再调整（第 10 节）。

### 题型 C：品詞判定（名动词专用，见第 4 节）
- 显示一个短句，句中目标词加下划线，选强势位置。
- 例：`They will record the meeting.` → 第 2 音节。

### 答题后的画面（所有题型共通）
- 正误 + 正确的强势位置（如 `re・CORD`，强势音节大写加粗）
- 所属规则的一句话说明（如「-tion の直前に強勢」）
- 发音播放按钮
- 「次へ」按钮

## 4. 名动词（強勢が品詞で変わる語）的处理

这是整个题库里最容易出错、也最常考的部分，单独规定。

### 4.1 问题
- `record`、`present`、`object` 这类词，名词和动词的强势位置不同。
- CMU 词典只会列出多种读法，**不标哪个读法对应哪个词性**，列出的顺序也不可靠。
- 另外有些词的多种读法和词性无关，只是地区或个人差异（如 `adult`、`address`、`research`、`detail`）。这种词出成题，答案会有争议。
- 学生还会过度套用「名前動後」，把 `report`、`control` 这种**不变**的词也答错。

### 4.2 把词分成四类

| 类别 | 定义 | 例 | 处理 |
|---|---|---|---|
| **N：普通词** | CMU 里所有读法的第一强势位置一致 | information, economy | 自动生成，直接进题库 |
| **S：变化词** | 强势随词性变化 | record, present, object, increase, conduct, contrast, permit, produce, progress, project, protest, subject, suspect, perfect | **自动交叉验证**（4.3）。每个词性各建一个词条 |
| **K：不变词** | 名动同形，但强势不变（陷阱的陷阱） | report, control, comment, respect, support, surprise, attack, delay, result, promise | **自动交叉验证**（4.3）。一个词条，带「名動同形・不変」标签 |
| **X：争议词** | 数据源之间对强势位置有分歧（详见 5.3） | adult, address, research, detail, finance | **自动排除**，永不出题 |

**关键规则**：脚本处理每个词时，只要 CMU 里出现两种以上的第一强势位置，并且这个词没通过 S 类的交叉验证，就归入 X 类丢弃。原则是宁可少出题，不出错题。

### 4.3 S 类和 K 类的判定：多数据源自动交叉验证（已实现）

不做逐条人工审核。对不上的直接丢弃。

> 原计划用 Wiktionary（kaikki.org）做第二个数据源，但开发环境访问不了，改用 **Britfone**（英式发音词典，约 1.6 万常用词，带重音标记）。它和 CMU（美式）互相独立，正好顺便解决了英美差异的问题。

**S 类（变化词）的通过条件**，全部满足：
1. g2p_en 的 `homographs.en` 里，该词两种读法的第一强势位置不同（只看重音不同、不看元音不同，所以 abuse、use 这类不算）
2. Britfone 里两个强势位置都有
3. 名词（或形容词）的强势在前，动词在后（名前動後）
   - g2p_en 有几行品词顺序写反了（object、rebel、segment、exploit）。如果 1、2 已经确认两个位置都存在，就按名前動後修正，报告里标注
4. 两种读法的音节数相同（排除 resume / résumé 这种其实是两个词的）
5. WordNet 里该词既有动词用法，也有名词或形容词用法。名词有使用例就标「名詞」，否则标「形容詞」（perfect）
6. 在词汇范围内（5.1），或在常考词清单里

**K 类（不变词）的通过条件**，全部满足：
1. 普通词的全部检查都通过（5.3）
2. 2 音节，强势在第 2 音节（也就是「看起来该是名前動後、其实不变」的陷阱）
3. WordNet 的使用例里名词和动词都至少出现过一次
4. 按词频顺序取前 60 个

**第 0 步结果**：S 类 66 词（132 个词条），K 类 60 词。常考词清单 20 词全部通过。

**人工只做一件事**：上线前把 `data/generated/report.md` 里的 S 类表格通读一遍，约 5 分钟的抽查。

**例句**：`data/manual/sentences.json`，S 类每个词性一句，8 词以内，由 Claude 生成，构建脚本会检查例句里确实含有该词。例句不涉及重音对错，不需要审核。

### 4.4 S 类和 K 类怎么出题
- **题型 A**：词旁边显示词性标签，如 `record（名詞）`。日本的入试题也是这样标的。
- **题型 C**：用例句出题，这是 S 类的主要题型。
- **题型 B**：S 类词可以出现，但必须带词性标签。
- **K 类**：用题型 A 出题，并在解说里明确写「名詞・動詞で強勢は変わらない」。
- S 类的名词和动词是两个独立词条，各自有复习进度。她可能名词记住了、动词总错。

### 4.5 发音播放的例外
- 浏览器的语音合成单独读 `record` 时，读哪个版本无法控制。
- 所以 **S 类词不播放单词，只播放例句**（放在句子里，合成引擎通常能读对，但不保证）。
- 开发时要把 S 类的全部例句实际听一遍，读错的换例句或关闭该条的播放。

## 5. 题库数据

### 5.1 来源
| 数据 | 用途 | 授权 |
|---|---|---|
| CMU Pronouncing Dictionary | 美式发音：音节数、强势位置 | BSD 类，可自由使用 |
| Britfone | 英式发音：交叉验证全部词条 | MIT |
| g2p_en `homographs.en` | S 类的词性别读法 | Apache 2.0 |
| WordNet（NLTK） | 判断名词・动词・形容词用法 | WordNet License |
| NGSL / NAWL / AWL | 词汇范围（基本词 + 学术词） | NGSL/NAWL：CC BY-SA，需署名 |
| wordfreq | 词汇范围扩充（Zipf ≥ 3.5，约每百万词 3 次以上）、出题顺序 | Apache 2.0 / CC BY-SA |
| better_profanity | 过滤不适合出题的词 | MIT |

词汇范围 = NGSL + NAWL + AWL（含派生词）+ wordfreq 高频词的基本形 + 外来语清单，共约 1.1 万词。私立难关大学约需 5000–6000 词、国公立难关约 6000–7000 词，这个范围足够覆盖医学部入试。医学专业词汇对合否影响很小，不专门收录；Britfone 收录不到的较专业的词（如 pneumonia）被排除也没问题。

### 5.2 分类用词表（只管分类，不管答案）
- `data/manual/katakana_traps.txt`：外来语陷阱，约 90 词（hotel, event, career, pattern, image, energy, damage, volunteer, percent…）
- 强势位置一律取自数据源，词表只决定打哪个标签，不需要审核。
- 规则例外**不需要手工表**，由脚本自动判定（5.4）。

### 5.3 构建流程（`scripts/build_dataset.py`，已实现）
1. `scripts/fetch_data.sh` 下载原始数据到 `data/raw/`。
2. 判定 S 类（4.3）。
3. 对词汇范围内的每个词，依次检查，不通过就丢弃并记录原因：
   - 只含字母；不是不适当的词；CMU 里有
   - 2 音节以上（用 CMU 的第一个读法计算）
   - Britfone 里有（**英式发音确认不了的一律不出题**）
   - CMU 第一个读法的第一强势恰好一个
   - CMU 有多个读法且强势位置不同时：只有 Britfone 的强势唯一、且等于 CMU 第一个读法时才保留（information、museum 等靠这条保住）；否则归 X 类
   - CMU 和 Britfone 的强势位置必须一致，否则归 X 类（laboratory、television 这种英美不同的词）
4. 判定 K 类（4.3），打规则标签（5.4）。
5. 去掉冗余的派生形：`-s/-ed/-ing` 的活用形，以及和基本形强势相同的派生词（`accepted < accept`、`sadly < sad`）。
6. 输出：
   - `public/data/items.json`（app 用的题库）
   - `data/generated/shift_words.json`、`fixed_words.json`
   - `data/generated/report.md`：各类数量、标签数量、常考词清单结果、S 类判定表、规则例外一览、全部被排除的词及原因

**第 0 步结果**：可出题词条 **4751**（普通 4559 / 变化 132 / 不变 60），全部经过英美两个词典确认。随机抽查 100 词，强势位置没有发现错误。

### 5.4 规则标签（用于弱点统计，已实现）

每个词最多一个规则标签，词尾匹配取最长的（`-ical` 优先于 `-ic`）。

| 标签 | 强势位置 | 词尾 | 例 |
|---|---|---|---|
| -tion/-sion | 词尾的前一个音节 | -tion -sion -xion | infor**ma**tion |
| -ian/-cian | 同上 | -ian -cian | mu**si**cian |
| -ic/-ical | 同上 | -ic -ics -ical | eco**nom**ic |
| -ity/-ety | 同上 | -ity -ety | so**ci**ety |
| -ial/-ual | 同上 | -ial -ual | ma**te**rial, **ac**tual |
| -ious/-eous/-uous | 同上 | -ious -eous -uous | de**li**cious |
| -ient/-ience/-iency | 同上 | -ient -ience -iency | ef**fi**cient |
| -iar/-ior | 同上 | -iar -ior | fa**mil**iar |
| -ular | 同上 | -ular | par**tic**ular |
| -ify | 同上 | -ify | i**den**tify |
| -ish（動詞） | 同上 | -ish | es**tab**lish |
| -graphy/-logy/-nomy/-metry | 同上 | -graphy -grapher -logy -logist -nomy -nomist -metry -pathy -cracy | pho**tog**raphy, de**moc**racy |
| -meter | 同上 | -meter | ther**mom**eter |
| -ate | 词尾的前两个音节 | -ate（3 音节以上） | **con**centrate |
| -ize/-ise | 同上 | -ize -ise（3 音节以上） | **re**cognize |
| -tude | 同上 | -tude | **at**titude |
| -graph/-crat | 同上 | -graph -crat | **pho**tograph |
| 語尾に強勢 | 词尾本身 | -ee -eer -ese -oo -oon -ique -esque -ette -ade -teen | engi**neer**, tech**nique** |
| 名前動後 / 名動同形・不変 | — | S 类 / K 类 | |
| カタカナ語 | — | 5.2 的词表 | |
| 2音節（名詞・形容詞）/ 2音節（動詞） | 倾向：名词在前、动词在后 | 没有词尾规则的 2 音节词，按 WordNet 中较多的用法分 | **pa**per / re**lax** |
| 3音節 / 4音節以上 | — | 其余 | |

**音节数按发音算，不按拼写算**：`-ial`、`-ious` 这类以 i/u 开头的词尾，i/u 有时自成一个音节（ma-te-ri-al），有时不（es-sen-tial），脚本根据 CMU 的发音判断。

**規則の例外（自动判定）**：词符合某条词尾规则，但实际强势位置和规则预测的不一样，就同时打上「規則の例外」。不需要手工表。第 0 步共判出 15 个：politics, rhetoric, coffee, committee, refugee, employee, characterize, industrialize, expertise, spiritual, millimeter, subdivision, comrade, honeymoon, karate。

### 5.5 词条的数据格式
```json
{
  "id": "record_verb",
  "word": "record",
  "pos": "verb",
  "syllables": 2,
  "stress": 2,
  "split": "re・cord",
  "tags": ["名前動後"],
  "class": "S",
  "sentence": "They will record the meeting.",
  "zipf": 4.9
}
```
- `pos`、`sentence` 只有 S 类必填。`zipf` 是词频（越大越常见）。
- 普通词还有 `source`（来自哪个词表）、`rescued`（是否靠 4.3 的补救规则保留）。
- `split`（音节拆分的拼写）：用 pyphen 断字，段数等于 CMU 音节数时才采用，约 70% 的词条有。没有 `split` 的词，解说里只显示「第 n 音節」。

### 5.6 已知的数据风险
- 所有词条都经过美式（CMU）和英式（Britfone）两个词典确认，英美不一致的词已排除。
- 构建完成后，在 app 里加一个「この問題を報告」按钮，她觉得答案不对时可以标记，方便事后修正。

## 6. 学习和复习的逻辑

### 6.1 词条的状态
- `new`：没做过
- `learning`：在错题本里，有 `stage`（0–4）和 `due_date`
- `mastered`：已掌握

### 6.2 Learn（刷新题）
- 从 `new` 的词条里出题，一组 10 题，**按词频从高到低**（`zipf`），常见词先出。题型 A 为主，混入题型 B；S 类用题型 C。
- 答对 → `mastered`。
- 答错 → `learning`，`stage = 0`，`due_date = 明天`。

### 6.3 Review（复习错题）
- 出 `due_date <= 今天` 的全部词条，用题型 A（S 类用题型 C）。
- 间隔表（天）：`[1, 2, 7, 14, 30]`，对应 stage 0–4。也就是错了之后：第二天、再隔两天、一周后、两周后、一个月后。
- 答对 → `stage + 1`，`due_date = 今天 + 间隔[新 stage]`。stage 4 再答对 → `mastered`。
- 答错 → `stage = 0`，`due_date = 明天`。
- 「今天」按日本时间算，凌晨 4 点换日（深夜学习不会被算成第二天）。
- **不是每天用**：没打开的日子，到期的词会累积。Review 一组也是 10 题，从**过期最久的**开始出，剩下的下次再做。首页显示的数字封顶为「10+」之类，不显示吓人的大数字。
- 过期多天后答对，照常进入下一 stage，不额外惩罚。
- 考试约 3 个月后（2027 年 2 月）。错题最快约 54 天毕业（1+2+7+14+30），在期限内。

### 6.3.1 一组之内的错题重做（2026-11-17 追加）
- Learn 和 Review 都一样：一组里**第一次答错的词，排到这一组最后再出一次**；再错就再排到最后，直到答对。全部答对才算这一组结束。
- **复习进度只按第一次的回答计算**（6.2 / 6.3）。重做时答对不改变状态，也不保存到数据库。否则 Learn 里答错的词重做一次就会直接变成 `mastered`，失去复习的意义。
- 重做的题显示「もう一度」标记。题型 A / C 答错，就用同样的题型重做。
- 题型 B 第一次答错：先把她选的词和正确答案的词各单独出一次（题型 A，S 类用题型 C），最后再出一次原来的 B 题（选项顺序打乱）。原题重做时又错，只把原题再排到最后。
- 进度条按「已答对的词数 / 这一组的词数」前进。
- 结果画面的正确数按第一次答对的数量计算，答错一览列出第一次答错的词。

### 6.4 首页的两个数字
- **Learn**：剩余 `new` 词条数
- **Review**：今天到期的词条数

## 7. 画面

整体参考截图：干净的首页，两张大卡片，底部三个图标。背景用柔和的渐变色，不用照片。手机优先（宽 375px 起），电脑上内容居中、最大宽度 480px。

### 7.1 ホーム
- 顶部：今天的日期
- 形象 + 等级 + 一句话（7.6）
- 中部：两张大卡片 `Learn（残り数）`、`Review（今日の数）`。Review 为 0 时卡片变灰，显示「今日の復習は完了」
- 底部导航：ホーム / 間違いノート / 分析

### 7.2 出題画面
- 顶部：进度（`7 / 10`）和退出按钮
- 中部：单词（大字）或例句
- 下部：选项按钮，足够大，单手拇指能按
- 答题后原地显示解说（第 3 节）

### 7.3 結果画面
- 这一组的正确数、答错的词一览、「ホームへ」按钮

### 7.4 間違いノート
- `learning` 状态的词条一览：单词、强势位置、下次复习日、错过几次
- 可按标签筛选

### 7.5 分析
- 各规则标签的正确率，从低到高排序，最弱的三项突出显示
- 累计：已掌握数、错题本数、未学习数
- 最近 14 天每天的答题数

### 7.6 激励机制

前提：她不会每天用，所以**只累积、不惩罚**，没有断签清零之类的机制。

**答对反应**
- 答对：选项变绿，形象跳一下（形象做好前，先用一个简单的弹跳动画代替）
- 连对 5 题：一个小庆祝动画，一组最多出现一次
- 答错：选项变红，显示正确答案。不放任何负面的动画或音效

**形象成长**
- 按「已掌握」的词条数升级：Lv1 0 / Lv2 50 / Lv3 150 / Lv4 300 / Lv5 600 / Lv6 1000
- 升级时在结果画面弹出一次「レベルアップ！」
- ホーム画面显示形象、当前等级和到下一级还差多少
- 形象的状态：普通、开心（答对）、沮丧（答错）、睡觉（今天没有要复习的）
- 打开 app 时形象说一句话，按情况选，如「復習が 8 個たまってるよ」「今日の復習は完了！」

**弱点分析**：见 7.5。

**形象的实现方式（形象最后再做）**
- 先用占位图开发。所有图片放在 `public/avatar/`，命名规则 `lv{等级}_{状态}.png`，如 `lv1_happy.png`
- 某个等级缺图时，往下找最近的等级用；全都没有时显示占位图
- 这样之后只需要把画好的 PNG 放进去，不用改代码
- 像素风格，建议 32×32 或 48×48，用 `image-rendering: pixelated` 放大显示
- 整体配色等形象定了以后，从形象的主色出发再定

## 8. 技术

### 8.1 技术栈
- 前端：Vite + React + TypeScript + Tailwind CSS
- 数据库：Supabase
- 部署：Vercel（静态站点）
- 发音：浏览器的 Web Speech API（`en-US`）
- 加 PWA manifest，让她可以「添加到主屏幕」

### 8.2 数据库
```sql
create table progress (
  user_id      text not null,
  item_id      text not null,
  status       text not null,          -- 'learning' | 'mastered'
  stage        int  not null default 0,
  due_date     date,
  correct_count int not null default 0,
  wrong_count   int not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table study_days (
  user_id text not null,
  day     date not null,
  answered int not null default 0,
  primary key (user_id, day)
);

create table reports (
  id bigint generated always as identity primary key,
  user_id text, item_id text, created_at timestamptz default now()
);
```
- `new` 状态的词条不存行。没有行就是 `new`。

### 8.3 访问方式和安全
- 三张表都开启 RLS，**不给匿名用户任何直接读写权限**。
- 只通过三个数据库函数访问（`security definer`）：
  - `get_state(p_user_id)`：返回该用户的全部 progress 和 study_days
  - `save_answer(p_user_id, p_item_id, p_status, p_stage, p_due_date, p_correct)`：更新一条进度，同时给当天的 `answered` 加 1
  - `report_item(p_user_id, p_item_id)`
- 这样别人即使拿到前端里的 key，不知道她的 ID 也读不到任何数据。
- `user_id` 是 22 位随机串，由 Jing 生成一次后写进发给她的链接里。URL 里没有 `u` 参数时，显示「リンクが正しくありません」，不自动生成新用户。
- 前端只使用 Supabase 的 anon key。service role key 不进代码、不进仓库。环境变量放 `.env.local`，并写进 `.gitignore`。

### 8.4 保存的时机
- 每答一题立刻调用 `save_answer`，界面不等返回结果直接进入下一步。
- 保存失败时在内存里排队，自动重试；页面顶部显示一个小的「未保存」提示，直到成功。
- 打开 app 时调用一次 `get_state`，之后的状态都在内存里维护。

## 9. 开发顺序

每一步都要能跑起来、确认没问题、`git commit` 之后再做下一步。

0. ~~**数据验证**~~ ✅ 完成（2026-11-17）。题库 4751 词条，常考词清单全部通过。
1. ~~**答题流程**~~ ✅ 完成（2026-11-17）。只用本地 JSON，做出题型 A 的 Learn 一组 10 题 + 解说 + 结果画面。进度先放内存。
1.5 ~~**接 Vercel**~~ ✅ 完成（2026-11-17）。仓库连上 Vercel，之后每个分支自动生成预览链接，用手机测试。构建设置写在 `vercel.json`（Vite / `dist`），不依赖 Vercel 后台的设置。
2. ~~**接数据库**~~ ✅ 完成（2026-11-17）。建表和函数（`supabase/schema.sql`），接上 URL 的 ID，实现 `get_state` / `save_answer`。
3. ~~**复习逻辑**~~ ✅ 完成（2026-11-17，另追加 6.3.1 错题重做）。实现 6.3 的间隔规则和 Review，首页显示两个数字。写单元测试覆盖间隔计算和换日规则。
4. **题型 B 和 C**，S / K 类的词性标签。
5. **間違いノート、分析画面**。
6. **发音播放、答对反应、形象成长（用占位图）、报告按钮、PWA**。
7. **正式上线**：合并到 main，在实际的 iPhone Safari 上测试，把带 ID 的链接发给她。
8. **形象和配色**：画像素形象，放进 `public/avatar/`，按形象主色调整整体配色。

## 10. 待确认事项

1. **目标学校**：考哪些学校、过去问里有没有アクセント题、是什么形式。很多医学部现在已经不单独考アクセント，值得确认一下，决定题型 B 的比重。
