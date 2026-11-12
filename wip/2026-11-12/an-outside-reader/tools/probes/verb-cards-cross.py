# The outside reader's call on each pill of fourteen verb cards (R right, S same entry another stem, W another word,
# B a broken piece, M one pill bundling stems, U unsure), set beside what each pill stands on in the served data:
# who carries it, whether any of its rows has a stem said by a source, and how its rows' own headwords stand to the
# headword of the word at this place. The calls are the reader's; nothing here re-judges them.
# python3 -I verb-cards-cross.py <the review as pasted> <cards dump .json> <m-sources.tsv> [out.tsv]
import collections, json, re, sys, unicodedata
review, dump, msrc = sys.argv[1], sys.argv[2], sys.argv[3]
out = sys.argv[4] if len(sys.argv) > 4 else None
labels = {}
for line in open(msrc, encoding="utf8"):
    p = line.rstrip("\n").split("\t")
    labels[p[0]] = p[2]
FAMILY = {
    "M9": "Strong's (two editions)", "M14": "Strong's (two editions)",
    "M5": "BDB (two editions)", "M46": "BDB (two editions)",
    "M4": "TAHOT and MACULA, read at their places", "M3": "TAHOT and MACULA, read at their places",
    "M17": "SDBH and the UBS dictionary", "M18": "SDBH and the UBS dictionary",
}
def family(pill):
    if pill["overlay"]:
        return "the dictionaries beside the store (Jastrow, the Samaritan)"
    lead = pill["lead"] or (pill["by"].split(" ")[0] if pill["by"] else "")
    if lead.startswith("PIECE:"):
        return "TAHOT and MACULA, read at their places"
    if lead in FAMILY:
        return FAMILY[lead]
    lab = labels.get(lead, "")
    if re.search(r"Kaikki|PanLex|ConceptNet|OmegaWiki|Wikidata|Wiktionary|MUSE|WordNet|Wikipedia|Lexibank", lab):
        return "the modern and many-language sources"
    return "other lexicons of Biblical Hebrew"
def bare(t):
    return re.sub(r"[֑-ֽ֯־׃͏]", "", unicodedata.normalize("NFC", t))
def pointed(t):
    return re.search(r"[ְ-ֻ]|וּ", unicodedata.normalize("NFKD", t)) is not None
def heads_of(pill, hp):
    hs = {h for r in pill["rows"] for h in (r["heads"] or [])}
    if not pill["rows"]:
        return "no row of the store prints it as the pill does"
    if not hs:
        return "its rows carry no headword"
    if hp and any(bare(h) == bare(hp) for h in hs):
        return "a row is headed by this word's own headword"
    if any(pointed(h) for h in hs):
        return "headed by a form pointed otherwise than the headword"
    return "headed by bare letters only"
# the review's rows, in order, per card
cards_r = []
cur = None
for line in open(review, encoding="utf8"):
    m = re.match(r"^### (\d+:\d+) (\S+) —", line)
    if m:
        cur = {"at": m.group(1), "form": m.group(2), "rows": []}
        cards_r.append(cur)
        continue
    m = re.match(r"^\| (\d+) \| (.*) \| ([RSWBMU]) \| (.*) \|\s*$", line)
    if m and cur is not None:
        cur["rows"].append((int(m.group(1)), m.group(2), m.group(3), m.group(4)))
d = json.load(open(dump, encoding="utf8"))
by_call = collections.Counter()
t_family = collections.defaultdict(collections.Counter)
t_stem = collections.defaultdict(collections.Counter)
t_head = collections.defaultdict(collections.Counter)
mismatch = 0
rows_out = []
for cr, c in zip(cards_r, d["cards"]):
    if len(cr["rows"]) != len(c["pills"]):
        print("COUNT DIFFERS", cr["at"], len(cr["rows"]), len(c["pills"]))
    for (n, text, call, src), pill in zip(cr["rows"], c["pills"]):
        if pill["text"][:140].strip() != text.strip():
            mismatch += 1
            if mismatch <= 5:
                print("TEXT DIFFERS", cr["at"], n, repr(text[:60]), repr(pill["text"][:60]))
        by_call[call] += 1
        fam = family(pill)
        said = sorted({s for r in pill["rows"] for s in (r["stems"] or [])})
        stem = "a source says its stem: " + ", ".join(said) if said else "no source says a stem for it"
        head = heads_of(pill, c["hp"])
        t_family[call][fam] += 1
        t_stem[call][stem if not said else "a source says a stem for it"] += 1
        t_head[call][head] += 1
        rows_out.append((cr["at"], c["s"], ",".join(c["placeStems"] or []), str(n), pill["text"], call, fam, pill["by"], ",".join(said), head))
print(f"{len(cards_r)} cards · {sum(by_call.values())} pills · the pill texts differ from the review's at {mismatch}")
print("the reader's calls:", " · ".join(f"{k} {v}" for k, v in sorted(by_call.items(), key=lambda x: -x[1])))
def table(name, t):
    print(f"\n{name}")
    cols = sorted({k for c in t.values() for k in c})
    for col in cols:
        print("  " + " · ".join(f"{call} {t[call][col]}" for call in "RSWBMU" if t[call][col]) + f"   — {col}")
table("who carries the pill (the source the card credits):", t_family)
table("whether a source says the stem of the reading:", t_stem)
table("how its rows are headed, beside the headword of the word at this place:", t_head)
if out:
    with open(out, "w", encoding="utf8") as g:
        g.write("\t".join(["verse", "form", "stem at this place", "pill", "text", "the reader's call", "who carries it", "sources behind it", "stems a source says", "how its rows are headed"]) + "\n")
        for r in rows_out:
            g.write("\t".join(r) + "\n")
    print("\ntable:", out)
