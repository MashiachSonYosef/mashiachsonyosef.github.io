# More counts over the walked cards: the first pill on divided words, cross-reference pills, the shape of the
# notes above the pills by source. Read only. Usage: python3 -I more-counts.py <out dir>
import sys, os, json, glob, re, collections
OUT = sys.argv[1]
rows = []
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        rows.append(json.loads(ln))
first_div = collections.Counter()
xref = collections.Counter(); xref_cards = 0
defn = collections.Counter(); defn_cards = 0
notes = collections.defaultdict(collections.Counter)
pressed_by = collections.Counter()
suggest = collections.Counter()
record_tail = collections.Counter()
kq_notes = collections.Counter()
for r in rows:
    pills = r.get("pills") or []
    divided = any((b.get("label") or "").startswith("Complete divisions") for b in r.get("bands") or [])
    on = [i for i, p in enumerate(pills) if p["on"]]
    if divided and pills and on and on[0] != 0:
        first_div[pills[0]["t"]] += 1
    hit = False; hit2 = False
    for p in pills:
        if re.search(r"\b(Compare|See|compare|see) \d+", p["t"]):
            xref[p["t"]] += 1; hit = True
        if re.match(r"(a primitive root|from |properly, |perhaps |apparently |or |the same as |feminine of |probably )", p["t"]) and len(p["t"]) > 60 and "M14" in p["by"].split():
            defn[p["t"][:70]] += 1; hit2 = True
    xref_cards += hit; defn_cards += hit2
    for cls, t in r.get("notes") or []:
        m = re.match(r"here (\w+) reads ?(.*?)( (CC BY(-SA)? 4\.0|Public Domain))?$", t)
        if cls.startswith("r-dflt") and m:
            src, body = m.group(1), m.group(2)
            notes[src]["all"] += 1
            if "(no words given)" in body: notes[src]["says no words given"] += 1
            if re.search(r"· \d+ («|\()", body): notes[src]["lists a second or third pick after a middle dot and a bare number"] += 1
            head = re.split(r" · ", body)[0]
            if " / " in head and src == "BDB": notes[src]["BDB: gloss followed by pieces of sub-headings after a slash"] += 1
            if re.search(r"· (sense \d+|the entry)", body): notes[src]["names a sense number or the entry"] += 1
        if "r-sug" in cls:
            if "vvv" in t: suggest["vvv"] += 1
            elif ". . ." in t: suggest[". . ."] += 1
            elif "leaves this word without English" in t: suggest["- (no English)"] += 1
            elif "spells this word otherwise" in t: suggest["BSB's Hebrew spells this word otherwise"] += 1
            elif "lacks this word" in t: suggest["BSB's Hebrew lacks this word"] += 1
            elif "empty" in t: suggest["empty cell"] += 1
            else: suggest["a rendering"] += 1
        if cls.startswith("kq-role") and "withheld" not in cls and "signs-off" not in cls: kq_notes[t[:90]] += 1
    for d in r.get("dcard") or []:
        if "this reading is a piece cut out of the record above" in (d.get("att") or ""): record_tail["this reading is a piece cut out of the record above"] += 1
print("cards", len(rows))
print("first pill on a divided word where the pressed pill is not first (top 25):")
for t, v in first_div.most_common(25): print(f"   {v:4d}  {t[:110]}")
print("pills that carry a cross-reference number: instances", sum(xref.values()), "cards", xref_cards)
for t, v in xref.most_common(12): print(f"   {v:4d}  {t[:120]}")
print("pills that are a Strong's definition sentence (form-list rows): instances", sum(defn.values()), "cards", defn_cards)
for t, v in defn.most_common(8): print(f"   {v:4d}  {t}")
for src in notes:
    print("notes «here", src, "reads»:", dict(notes[src]))
print("BSB suggestion row:", dict(suggest))
print("record tail:", dict(record_tail))
print("other notes:", kq_notes.most_common(12))
