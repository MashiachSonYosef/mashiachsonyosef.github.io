# Machine checks over every card the walk opened (cards-ch*.jsonl). Read only.
# Usage: python3 -I analyze-cards.py <out dir>
import sys, os, json, glob, re, collections, csv, statistics
OUT = sys.argv[1]
rows = []
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        rows.append(json.loads(ln))
cnt = {}
for r in rows:
    cnt[r["verse"]] = cnt.get(r["verse"], 0) + 1
    r["wv"] = cnt[r["verse"]]
# the line at rest as data
rest = {}
with open(os.path.join(OUT, "sheet.tsv")) as f:
    rd = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(rd)
    for verse, section, entry, word_no, heb, key, line, credit, tag, head, pieces, extra in rd:
        if word_no:
            rest[(verse, int(entry))] = (line, credit)
C = collections.Counter()
ex = collections.defaultdict(list)
def note(kind, r, detail=""):
    C[kind] += 1
    ex[kind].append((f"{r['verse']} w{r['wv']}", r["s"], detail))
pos_whole, pos_block = [], []
n_pills_all = []
year_label = collections.Counter()
rec_year = collections.Counter()
frag = collections.Counter()
frag_cards = collections.defaultdict(set)
dflt_notes = collections.Counter()
top_kinds = collections.Counter()
labels_seen = collections.Counter()
for r in rows:
    if r.get("fault"):
        note("fault", r, r["fault"]); continue
    if not r.get("settled"):
        note("card_not_settled", r)
    drawn = r.get("credit") or ""        # the line's own text (the chip taken off) rides on data-by / title
    line_data = rest.get((r["verse"], r["e"]), ("", ""))[0]
    # the line as the page drew it: textContent holds the line then the license chip
    page_line = r.get("line") or ""
    if not page_line.replace("​", "").strip():
        note("line_blank_on_page", r, repr(line_data))
    if not page_line.startswith(line_data) and line_data.replace("​", "").strip():
        note("page_line_differs_from_resting_data", r, f"page «{page_line}» data «{line_data}»")
    if not r.get("lineShown"):
        note("line_not_shown", r)
    for k, v in r.get("now") or []:
        top_kinds[k] += 1
    pills = r.get("pills") or []
    n_pills_all.append(len(pills))
    divided = any((b.get("label") or "").startswith("Complete divisions") for b in r.get("bands") or [])
    on = [i for i, p in enumerate(pills) if p["on"]]
    if not pills:
        note("card_with_no_pill", r, r.get("label") or "")
    elif not on:
        note("no_pill_pressed", r, f"{len(pills)} pills; first «{pills[0]['t']}»")
    else:
        (pos_block if divided else pos_whole).append((on[0] + 1, len(pills)))
        if on[0] != 0:
            note("pressed_pill_not_first_divided" if divided else "pressed_pill_not_first_whole", r, f"pressed «{pills[on[0]]['t']}» at {on[0]+1} of {len(pills)}; first «{pills[0]['t']}»")
        if on[0] >= 10:
            note("pressed_pill_beyond_tenth", r, f"pressed «{pills[on[0]]['t']}» at {on[0]+1} of {len(pills)}; first «{pills[0]['t']}»")
        ptxt = pills[on[0]]["t"].strip().lower()
        top_v = ((r.get("now") or [[None, ""]])[0][1] or "")
        line_pieces = [x.strip().lower() for x in top_v.split(" + ")]
        if ptxt != top_v.strip().lower() and ptxt not in line_pieces:
            note("pressed_pill_is_not_a_reading_of_the_line", r, f"line «{top_v}»; pressed «{pills[on[0]]['t']}» ‹{pills[on[0]]['by']}› at {on[0]+1} of {len(pills)}")
        if len(on) > 1:
            note("more_than_one_pill_pressed", r, " | ".join(pills[i]["t"] for i in on))
    for d in r.get("dcard") or []:
        m = re.match(r"(.*?) \u00b7 wording (\d{4})", d.get("att") or "")
        if m: rec_year[(m.group(1), m.group(2))] += 1
        if m and "MACULA" in m.group(1) and m.group(2) != "2022": note("record_credits_macula_with_another_year", r, (d.get("att") or "")[:110])
    if len(pills) <= 2 and r.get("credit") and not divided and len((r.get("credit") or "").split(" + ")) > 1:
        note("divided_line_but_card_offers_no_division", r, f"{len(pills)} pills; label {r.get('label')}")
    for p in pills[:1]:
        if re.fullmatch(r"(Hē|Yôdh|Wāw|Kaph|Nûn|Mēm|Tāw|ʾĀleph|Bêth|Lāmedh|Šîn|Hê|Yodh|Waw)", p["t"]): note("first_pill_is_a_letter_name", r, p["t"])
    seen_txt = collections.Counter()
    for p in pills:
        t = p["t"]
        yr = p["ti"].split(" · ")[0] if p["ti"] else ""
        lab = p["ti"].split(" · ")[1] if " · " in p["ti"] else ""
        year_label[(yr, lab)] += 1
        # a pill cut in the wrong place: brackets that do not balance
        if t.count("(") != t.count(")") or t.count("[") != t.count("]"):
            frag[(t, p["by"])] += 1; frag_cards[(t, p["by"])].add(f"{r['verse']} w{r['wv']}")
        if re.search(r"[Ͱ-ϿЀ-ӿ؀-ۿ]", t):
            note("pill_in_another_script", r, t)
        if re.search(r"[֐-׿]", t):
            note("pill_holds_hebrew", r, f"{t} ‹{p['by']}›")
        if len(t) > 160:
            C["pill_longer_than_160"] += 1
        seen_txt[t.lower().strip(". ")] += 1
    for cls, t in r.get("notes") or []:
        if cls.startswith("r-dflt") or cls.startswith("r-piece"):
            if "(no words given)" in t:
                note("note_source_reads_no_words", r, t)
            if re.search(r"· \d+ «", t):
                note("note_repeats_its_own_reading", r, t)
            if " ~ " in t:
                note("note_holds_tilde", r, t)
        if "your source switches" in t:
            C["note_says_your_source_switches"] += 1
    labels_seen[re.sub(r"\d+", "N", re.sub(r"[֐-׿]+", "HEB", r.get("label") or ""))] += 1
with open(os.path.join(OUT, "card-checks.tsv"), "w") as f:
    f.write("check\tplace\thebrew\tdetail\n")
    for k in ex:
        for place, s, d in ex[k]:
            f.write(f"{k}\t{place}\t{s}\t{d}\n")
print("cards", len(rows))
for k, v in C.most_common():
    print(f"{v:6d} {k}")
def stats(name, arr):
    if not arr: print(name, "none"); return
    ps = [a for a, b in arr]
    print(f"{name}: cards {len(arr)}; pressed first {sum(1 for p in ps if p == 1)}; median position {statistics.median(ps)}; beyond 5th {sum(1 for p in ps if p > 5)}; beyond 10th {sum(1 for p in ps if p > 10)}; beyond 30th {sum(1 for p in ps if p > 30)}; last on the card {sum(1 for a, b in arr if a == b and b > 1)}; worst {max(ps)}")
stats("whole words (no division band)", pos_whole)
stats("divided words (block of a division pressed)", pos_block)
print("pills per card: median", statistics.median(n_pills_all), "max", max(n_pills_all), "cards over 40 pills", sum(1 for n in n_pills_all if n > 40), "cards over 80", sum(1 for n in n_pills_all if n > 80))
print("top-of-card kinds:", top_kinds.most_common())
print("year · label on pill titles:")
for (yr, lab), v in sorted(year_label.items(), key=lambda x: -x[1]):
    print(f"   {v:6d}  {yr} · {lab}")
print("record under the pills, source and wording year:")
for (lab, yr), v in sorted(rec_year.items(), key=lambda x: -x[1]):
    print(f"   {v:6d}  {lab} · wording {yr}")
print("pills whose brackets do not balance (distinct text, sources): ", len(frag), "; pill instances", sum(frag.values()))
with open(os.path.join(OUT, "pill-fragments.tsv"), "w") as f:
    f.write("pill\tsources\tinstances\tcards\n")
    for (t, by), v in frag.most_common():
        f.write(f"{t}\t{by}\t{v}\t{' '.join(sorted(frag_cards[(t, by)])[:8])}\n")
by_src = collections.Counter()
for (t, by), v in frag.items():
    by_src[by] += v
print("   by source:", by_src.most_common(8))
for (t, by), v in frag.most_common(25):
    print(f"   {v:4d}  «{t}»  ‹{by}›")
print("label shapes:", labels_seen.most_common(8))
