#!/usr/bin/env python3
"""Step 0: build the item bank (public/data/items.json) and a report (data/generated/report.md).

Sources (data/raw):
  cmudict.dict     CMU Pronouncing Dictionary (US)
  britfone.csv     Britfone (UK, with stress marks)
  homographs.en    g2p_en homograph table (POS-specific pronunciations)
  ngsl.json, nawl.json, AWL.json   vocabulary lists
  WordNet (nltk)   noun / verb / adjective usage
Manual (data/manual):
  katakana_traps.txt, sentences.json
"""
import json, re, sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW, MAN, GEN = ROOT / "data/raw", ROOT / "data/manual", ROOT / "data/generated"
OUT = ROOT / "public/data/items.json"
GEN.mkdir(parents=True, exist_ok=True)
OUT.parent.mkdir(parents=True, exist_ok=True)

from nltk.corpus import wordnet as wn  # noqa: E402
import pyphen  # noqa: E402
from wordfreq import top_n_list, zipf_frequency  # noqa: E402
from better_profanity import profanity  # noqa: E402
profanity.load_censor_words()

ZIPF_MIN = 3.5   # about 3 occurrences per million words

MUST_CHECK = ("record present object increase decrease conduct contrast permit produce progress "
              "project protest subject suspect export import insult desert rebel refund").split()
K_CAP = 60
# better_profanity flags some ordinary / medical words; keep these
PROFANITY_OK = set("""facial organ oral penetrate penetration stroke urine womb murder slave erect sexual
virgin vomit drunk dummy strip thrust pawn slope snatch pot god hell kill naked heroin ugly stupid
vulgar sniper vodka rum paddy erection sperm lust""".split())

# ---------------------------------------------------------------- loaders
def load_cmu():
    d = defaultdict(list)
    for line in open(RAW / "cmudict.dict", encoding="utf-8"):
        line = line.split("#")[0].strip()
        if not line:
            continue
        w, *ph = line.split()
        w = re.sub(r"\(\d+\)$", "", w)
        d[w].append(ph)
    return d

def cmu_info(phones):
    vowels = [p for p in phones if p[-1].isdigit()]
    pos = [i + 1 for i, v in enumerate(vowels) if v.endswith("1")]
    return len(vowels), (pos[0] if len(pos) == 1 else None)   # None: no or several primary stresses

IPA_V = set("aeiouɛəɪæɐɒʊɔɜɑʌɘɵɚɝ")

def load_brit():
    d = defaultdict(list)
    for line in open(RAW / "britfone.csv", encoding="utf-8"):
        if "," not in line:
            continue
        w, ipa = line.split(",", 1)
        w = re.sub(r"\(\d+\)$", "", w.strip()).lower()
        toks = ipa.split()
        vs = [t for t in toks if any(c in IPA_V for c in t)]
        pos = [i + 1 for i, t in enumerate(vs) if "ˈ" in t]
        if pos:
            d[w].append((len(vs), pos[0]))
    return d

def load_vocab():
    words = {}
    ngsl = json.load(open(RAW / "ngsl.json"))
    def add_family(head, fam, tag):
        words.setdefault(head.lower(), tag)
        for s in fam or []:
            s = s.lower()
            base = wn.morphy(s)
            if base and base != s:              # inflected form (studies, studied) -> skip
                continue
            words.setdefault(s, tag + "派生")
    for band in ("1000", "2000", "3000"):
        for w, fam in ngsl[band].items():
            add_family(w, fam, f"NGSL{band}")
    for w, fam in json.load(open(RAW / "nawl.json")).items():
        add_family(w, fam, "NAWL")
    for sub in json.load(open(RAW / "AWL.json")).values():
        for head, v in sub.items():
            words.setdefault(head.lower(), "AWL")
            for s in (v or {}).get("subwords") or []:
                s = s.lower()
                base = wn.morphy(s)
                if base and base != s:      # inflected form (analysed, analyses) -> skip
                    continue
                words.setdefault(s, "AWL派生")
    # frequency-based pool: common lemmas (not inflected, not proper nouns)
    for w in top_n_list("en", 60000):
        if zipf_frequency(w, "en") < ZIPF_MIN:
            break
        if not (w.isalpha() and w.islower()) or w in words:
            continue
        if not any(l.name() == w for syn in wn.synsets(w) for l in syn.lemmas()):
            continue
        is_adj = any(l.name() == w for syn in wn.synsets(w, "a") + wn.synsets(w, "s") for l in syn.lemmas())
        if wn.morphy(w) != w and not is_adj:
            continue                            # gerunds / past forms (planting), keep adjectives (interesting)
        words[w] = "wordfreq"
    return words

def load_homographs():
    d = {}
    for line in open(RAW / "homographs.en", encoding="utf-8"):
        if line.startswith("#") or "|" not in line:
            continue
        w, p1, p2, pos = line.strip().split("|")
        if pos == "V":
            d[w.lower()] = (p1.split(), p2.split())
    return d

def wn_pos(word):
    """count of noun/verb/adj lemma usages in WordNet (SemCor counts, +1 per synset presence)."""
    c = Counter()
    for s in wn.synsets(word):
        for l in s.lemmas():
            if l.name().lower() == word:
                p = {"s": "a"}.get(s.pos(), s.pos())
                c[p + "_syn"] += 1
                c[p] += l.count()
    return c

# ---------------------------------------------------------------- suffix rules
# (suffix, syllables of the suffix, where the stress goes, label)
#   where: "before" = the syllable just before the suffix (直前)
#          "two"    = two syllables before the suffix (2つ前)
#          "self"   = the suffix itself (語尾自身)
# Syllables are counted on the CMU pronunciation, not on the spelling.
# Suffixes starting with i/e/u (ial, ious, eous, ...) are one syllable longer when
# that vowel is pronounced on its own (ma-te-ri-al vs es-sen-tial); detected from CMU.
I_SUFFIXES = {"ial", "ian", "ious", "eous", "ient", "ience", "iency", "iar", "ior", "ual", "uous", "ular"}
UNSTRESSED_I = {v + d for v in ("IY", "IH", "UW", "UH", "AH") for d in "02"}  # i/u as its own weak syllable
RULES = [
    ("tion", 1, "before", "-tion/-sion"), ("sion", 1, "before", "-tion/-sion"), ("xion", 1, "before", "-tion/-sion"),
    ("cian", 1, "before", "-ian/-cian"), ("ian", 1, "before", "-ian/-cian"),
    ("ical", 2, "before", "-ic/-ical"), ("ics", 1, "before", "-ic/-ical"), ("ic", 1, "before", "-ic/-ical"),
    ("ity", 2, "before", "-ity/-ety"), ("ety", 2, "before", "-ity/-ety"),
    ("ial", 1, "before", "-ial/-ual"), ("ual", 1, "before", "-ial/-ual"),
    ("ious", 1, "before", "-ious/-eous/-uous"), ("eous", 1, "before", "-ious/-eous/-uous"),
    ("uous", 1, "before", "-ious/-eous/-uous"),
    ("ient", 1, "before", "-ient/-ience/-iency"), ("ience", 1, "before", "-ient/-ience/-iency"),
    ("iency", 2, "before", "-ient/-ience/-iency"),
    ("iar", 1, "before", "-iar/-ior"), ("ior", 1, "before", "-iar/-ior"),
    ("ular", 1, "before", "-ular"),
    ("ify", 2, "before", "-ify"),
    ("ish", 1, "before", "-ish（動詞）"),
    ("graphy", 2, "before", "-graphy/-logy/-nomy/-metry"), ("logy", 2, "before", "-graphy/-logy/-nomy/-metry"),
    ("nomy", 2, "before", "-graphy/-logy/-nomy/-metry"), ("metry", 2, "before", "-graphy/-logy/-nomy/-metry"),
    ("pathy", 2, "before", "-graphy/-logy/-nomy/-metry"), ("cracy", 2, "before", "-graphy/-logy/-nomy/-metry"),
    ("meter", 2, "before", "-meter"),
    ("grapher", 2, "before", "-graphy/-logy/-nomy/-metry"), ("logist", 2, "before", "-graphy/-logy/-nomy/-metry"),
    ("nomist", 2, "before", "-graphy/-logy/-nomy/-metry"),
    ("ate", 1, "two", "-ate"), ("ize", 1, "two", "-ize/-ise"), ("ise", 1, "two", "-ize/-ise"),
    ("tude", 1, "two", "-tude"), ("graph", 1, "two", "-graph/-crat"), ("crat", 1, "two", "-graph/-crat"),
    ("ee", 1, "self", "語尾に強勢"), ("eer", 1, "self", "語尾に強勢"), ("ese", 1, "self", "語尾に強勢"),
    ("oo", 1, "self", "語尾に強勢"), ("oon", 1, "self", "語尾に強勢"), ("ique", 1, "self", "語尾に強勢"),
    ("esque", 1, "self", "語尾に強勢"), ("ette", 1, "self", "語尾に強勢"), ("ade", 1, "self", "語尾に強勢"),
    ("teen", 1, "self", "語尾に強勢"),
]
RULES.sort(key=lambda r: -len(r[0]))  # longest suffix wins (ical before ic)

def rule_for(word, phones, stress):
    vowels = [p for p in phones if p[-1].isdigit()]
    syl = len(vowels)
    for suf, n, where, label in RULES:
        if not word.endswith(suf) or len(word) <= len(suf) + 1:
            continue
        if suf in I_SUFFIXES and syl > n and vowels[-(n + 1)] in UNSTRESSED_I:
            n += 1                              # the i/e is its own syllable
        pred = syl - n + {"before": 0, "two": -1, "self": 1}[where]
        if pred < 1 or pred > syl or (where != "self" and syl - n < 1):
            return None, None                   # e.g. 2-syllable -ate words (create, climate)
        return label, pred == stress
    return None, None

# ---------------------------------------------------------------- build
def main():
    cmu, brit, vocab, homo = load_cmu(), load_brit(), load_vocab(), load_homographs()
    sentences = json.load(open(MAN / "sentences.json")) if (MAN / "sentences.json").exists() else {}
    kata = {l.strip() for l in open(MAN / "katakana_traps.txt") if l.strip() and not l.startswith("#")}
    hy = pyphen.Pyphen(lang="en_US", left=1, right=1)

    items, dropped = [], defaultdict(list)
    s_report, k_candidates = [], []

    def split_of(word, syl):
        s = hy.inserted(word, "・")
        return s if s.count("・") + 1 == syl else None

    # ---- S class: cross validation (g2p_en + CMU + Britfone + 名前動後 direction + WordNet)
    s_words = set()
    for w, (pv, po) in sorted(homo.items()):
        base = wn.morphy(w)
        if base and base != w:
            continue                            # plural / inflected form
        sv, vpos = cmu_info(pv)
        so, opos = cmu_info(po)
        reasons = []
        if vpos is None or opos is None or vpos == opos:
            continue                            # pronunciation differs, stress does not (abuse, use)
        if w not in vocab and w not in MUST_CHECK:
            continue                            # outside the vocabulary range
        cpos = {cmu_info(p)[1] for p in cmu.get(w, [])}
        bpos = {b[1] for b in brit.get(w, [])}
        if not ({vpos, opos} <= cpos or w in homo):
            reasons.append("CMU に両方の強勢がない")
        if sv != so:
            reasons.append("品詞で音節数が違う（別の語）")
        if w not in brit:
            reasons.append("Britfone に無い")
        elif not {vpos, opos} <= bpos:
            reasons.append(f"Britfone の強勢 {sorted(bpos)} が一致しない")
        note = ""
        if opos > vpos and not reasons:
            # g2p_en has a few rows with the POS order flipped (object, rebel).
            # Both stresses are attested in two sources, so assign by 名前動後.
            opos, vpos = vpos, opos
            note = "g2p_en の品詞順を名前動後で補正"
        c = wn_pos(w)
        if c["n_syn"] or c["a_syn"]:
            other = "noun" if (c["n"] > 0 or not c["a_syn"]) else "adj"
        else:
            other = None
        if not c["v_syn"] or not other:
            reasons.append("WordNet で品詞を確認できない")
        ok = not reasons
        s_report.append((w, other, opos, vpos, ok, "; ".join(reasons) or note))
        if not ok:
            continue
        s_words.add(w)
        for pos, st in ((other, opos), ("verb", vpos)):
            items.append({
                "id": f"{w}_{pos}", "word": w, "pos": pos, "syllables": sv, "stress": st,
                "split": split_of(w, sv), "tags": ["名前動後"], "class": "S",
                "sentence": sentences.get(f"{w}_{pos}"), "zipf": round(zipf_frequency(w, "en"), 2),
            })

    # ---- N / K / X classes over the vocabulary (+ katakana list)
    pool = dict(vocab)
    for w in kata:
        pool.setdefault(w, "カタカナ語リスト")
    for w, src in sorted(pool.items()):
        if w in s_words:
            continue
        if not re.fullmatch(r"[a-z]+", w):
            dropped["記号・空白を含む"].append(w); continue
        if w not in cmu:
            dropped["CMU に無い"].append(w); continue
        if src == "wordfreq" and w not in PROFANITY_OK and profanity.contains_profanity(w):
            dropped["不適切な語"].append(w); continue
        prons = cmu[w]
        first = prons[0]
        syl, stress = cmu_info(first)
        if syl < 2:
            continue  # monosyllable: silently skipped
        bpos = {b[1] for b in brit.get(w, [])}
        if not bpos:
            dropped["Britfone に無い（英国発音で確認できない）"].append(w); continue
        if stress is None:
            dropped["X: CMU の第一強勢が0個または複数"].append(f"{w}(UK{sorted(bpos)})"); continue
        positions = {cmu_info(p)[1] for p in prons}
        rescued = False
        if len(positions) > 1:
            # CMU lists several stresses. Keep the word only if Britfone has exactly one
            # and it equals CMU's first (main) pronunciation: two sources agree.
            if bpos == {stress}:
                rescued = True
            else:
                dropped["X: CMU に複数の強勢位置"].append(f"{w}(CMU{sorted(p for p in positions if p)}/UK{sorted(bpos)})"); continue
        if bpos != {stress}:
            dropped["X: CMU と Britfone で強勢が違う"].append(f"{w}(US{stress}/UK{sorted(bpos)})"); continue
        uk = True
        tags = []
        c = wn_pos(w)
        longest = max((p for p in prons if cmu_info(p)[1] == stress), key=lambda p: cmu_info(p)[0])  # avoid elided variants
        label, follows = rule_for(w, longest, stress)
        if label:
            tags.append(label)
            if not follows:
                tags.append("規則の例外")
        if w in kata:
            tags.append("カタカナ語")
        cls = "N"
        if syl == 2 and stress == 2 and c["n"] >= 1 and c["v"] >= 1:
            k_candidates.append((src, w))
            cls = "K?"
        if not label and "カタカナ語" not in tags:
            if syl == 2:
                # 2音節: 名詞・形容詞は前、動詞は後ろ（傾向）. POS = WordNet の多い方
                tags.append("2音節（動詞）" if c["v"] > c["n"] + c["a"] else "2音節（名詞・形容詞）")
            else:
                tags.append(f"{syl}音節" if syl < 4 else "4音節以上")
        items.append({"id": w, "word": w, "pos": None, "syllables": syl, "stress": stress,
                      "split": split_of(w, syl), "tags": tags, "class": cls, "uk_checked": uk, "rescued": rescued,
                      "source": src, "zipf": round(zipf_frequency(w, "en"), 2)})

    # Drop redundant derived forms: inflections (-s/-ed/-ing) and -ly adverbs whose base word
    # is also in the bank with the same stress. They add no new accent knowledge.
    def stress_of(word):
        if word in cmu:
            n, st = cmu_info(cmu[word][0])
            return 1 if n == 1 else st
        return None
    keep = []
    for i in items:
        w = i["word"]
        if i["class"] != "S":
            infl = {b for b in (wn.morphy(w, wn.VERB), wn.morphy(w, wn.NOUN)) if b and b != w}
            if infl and i.get("source") == "wordfreq":
                dropped["活用形（-s/-ed/-ing）"].append(w)
                continue
            bases = set(infl)
            if w.endswith("ly"):
                bases |= {w[:-2], w[:-1] + "e", w[:-3] + "y"}  # sadly->sad, gently->gentle, happily->happy
            same = [b for b in bases if stress_of(b) == i["stress"]]
            if same:
                dropped["派生形（基本形と同じ強勢）"].append(f"{w}<{same[0]}")
                continue
        keep.append(i)
    items[:] = keep

    # K class: cap by list order (NGSL1000 < 2000 < 3000 < NAWL < AWL)
    order = {"NGSL1000": 0, "NGSL2000": 1, "NGSL3000": 2, "NAWL": 3, "AWL": 4}
    k_sorted = [w for _, w in sorted(k_candidates, key=lambda x: (order.get(x[0], 9), x[1]))]
    k_set = set(k_sorted[:K_CAP])
    for it in items:
        if it["class"] == "K?":
            if it["word"] in k_set:
                it["class"] = "K"
                it["tags"] = [t for t in it["tags"] if not t.endswith("音節")] + ["名動同形・不変"]
            else:
                it["class"] = "N"

    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
    json.dump([i for i in items if i["class"] == "S"], open(GEN / "shift_words.json", "w"), ensure_ascii=False, indent=1)
    json.dump([i for i in items if i["class"] == "K"], open(GEN / "fixed_words.json", "w"), ensure_ascii=False, indent=1)

    # ---------------------------------------------------------------- report
    R = []
    cls = Counter(i["class"] for i in items)
    R.append("# Step 0 report\n")
    R.append(f"- 語彙プール: {len(pool)} 語（NGSL + NAWL + AWL + wordfreq Zipf≥3.5 の基本形 + カタカナ語リスト）")
    R.append(f"- 出題可能な詞条: **{len(items)}**（N {cls['N']} / S {cls['S']} / K {cls['K']}）")
    R.append(f"- 英国発音（Britfone）でも確認済み: {sum(1 for i in items if i.get('uk_checked'))} / {cls['N'] + cls['K']}")
    R.append(f"- CMU に複数あったが Britfone と一致したので採用: {sum(1 for i in items if i.get('rescued'))}")
    R.append(f"- 音節分割 split が作れた詞条: {sum(1 for i in items if i['split'])} / {len(items)}")
    R.append(f"- 例句が入っている S 詞条: {sum(1 for i in items if i['class']=='S' and i['sentence'])} / {cls['S']}\n")
    R.append("## 音節数 × 強勢位置\n")
    grid = Counter((i["syllables"], i["stress"]) for i in items)
    for n in sorted({k[0] for k in grid}):
        R.append(f"- {n}音節: " + ", ".join(f"第{p}={grid[(n, p)]}" for p in range(1, n + 1) if grid[(n, p)]))
    R.append("\n## タグ別の語数\n")
    tc = Counter(t for i in items for t in i["tags"])
    for t, n in tc.most_common():
        R.append(f"- {t}: {n}")
    R.append("\n## 常考词チェックリスト（S 類）\n")
    srep = {r[0]: r for r in s_report}
    for w in MUST_CHECK:
        r = srep.get(w)
        if not r:
            R.append(f"- ❌ {w}: g2p_en の表に無い")
        else:
            R.append(f"- {'✅' if r[4] else '❌'} {w}: {r[1]} 第{r[2]} / verb 第{r[3]}" + (f" — {r[5]}" if r[5] else ""))
    R.append(f"\n## S 類 通過 {sum(r[4] for r in s_report)} / 候補 {len(s_report)}\n")
    R.append("| 語 | 名詞/形容詞 | 動詞 | 判定 | 理由 |\n|---|---|---|---|---|")
    for w, other, o, v, ok, why in s_report:
        R.append(f"| {w} | {other} 第{o} | 第{v} | {'✅' if ok else '❌'} | {why} |")
    R.append(f"\n## K 類（{len(k_set)} 語、候補 {len(k_candidates)}）\n")
    R.append(", ".join(k_sorted[:K_CAP]))
    R.append("\n## 規則の例外（自動判定）\n")
    ex = [i for i in items if "規則の例外" in i["tags"]]
    by = defaultdict(list)
    for i in ex:
        by[i["tags"][0]].append(f"{i['word']}({i['stress']})")
    for k, v in sorted(by.items()):
        R.append(f"- **{k}** ({len(v)}): " + ", ".join(v))
    R.append("\n## 除外された語\n")
    for k, v in dropped.items():
        R.append(f"- **{k}** ({len(v)}): " + ", ".join(v[:400]))
    (GEN / "report.md").write_text("\n".join(R), encoding="utf-8")
    print("\n".join(R[:12]))

if __name__ == "__main__":
    main()
