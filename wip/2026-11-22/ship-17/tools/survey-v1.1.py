# Survey of the spelling bridge v1.1 before ship 17 is built (22 November 2026). Reads only.
# Usage: python3 -I survey-v1.1.py <list v1.1> <reader dir>
import json, sys, re, gzip, collections
LIST, R = sys.argv[1], sys.argv[2]
L = [json.loads(x) for x in open(LIST, encoding="utf-8")]
PLAIN = re.compile(r"^H\d+[A-Za-z]*$")
def marks_off(t):
    t = re.sub(r"[\[\]<>]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()
new = [l for l in L if l["use"] == "NEW_PIECES" and l["class"] != "STEP_WRITES_OUR_SPELLING"]
print("794?", len(new), collections.Counter(l["class"] for l in new))
brace = [l for l in new if any(not PLAIN.match(str(p.get("tag") or "")) for p in l["pieces"])]
brace2 = [l for l in new if any("}+" in str(p.get("tag") or "") for p in l["pieces"])]
print("}+ at the 794 (not plain):", len(brace), "(holding }+):", len(brace2), collections.Counter(l["class"] for l in brace))
odd = [(l["book"], l["place"], p["tag"]) for l in L for p in (l["pieces"] or []) if not PLAIN.match(str(p.get("tag") or ""))]
print("every not-plain tag in the list:", len(odd), sorted(set(t for _, _, t in odd))[:20])
laid = [l for l in new if l not in brace]
print("laid new:", len(laid), collections.Counter(l["class"] for l in laid), "pieces", sum(len(l["pieces"]) for l in laid))
# section 2 on every piece of the list
bad = [(l["book"], l["place"], p["index"]) for l in L for p in (l["pieces"] or []) if marks_off(p["english_tahot_as_written"]) != p["english_tahot"]]
print("section 2 fails over all pieces:", len(bad))
# empty after trim, sign only, punctuation only
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$")
emp = [(l["book"], l["place"]) for l in laid for p in l["pieces"] if not p["english_tahot_as_written"].strip()]
sig = [(l["book"], l["place"], p["english_tahot_as_written"].strip()) for l in laid for p in l["pieces"] if SIGN.match(p["english_tahot_as_written"].strip())]
pun = [(l["book"], l["place"], p["english_tahot_as_written"].strip()) for l in laid for p in l["pieces"] if not re.search(r"[A-Za-z]", p["english_tahot_as_written"])]
print("laid pieces empty after trim:", len(emp), emp[:5])
print("laid pieces a sign only:", len(sig), collections.Counter(x[2] for x in sig).most_common(12))
print("laid pieces with no letter:", len(pun), pun[:12])
# rows and stroke checks: the joined parts give the translation column
mism = 0
for l in laid:
    rows = l["tahot_rows"]; cols = l["translation_columns_as_tahot_writes_them"]
    by = collections.defaultdict(list)
    for p in l["pieces"]: by[p["english_tahot_as_written_from"]["row"]].append(p)
    for r, c in zip(rows, cols):
        parts = c.split("/")
        for p in by.get(r, []):
            if parts[p["english_tahot_as_written_from"]["part"]] != p["english_tahot_as_written"]: mism += 1
print("laid pieces whose part is not its row's column cut at the stroke:", mism)
# the 206 against their form rows and the zones
fr = [json.loads(x) for x in open(R + "/data/landings/bridge-form-rows-v1/form-rows-v1.jsonl", encoding="utf-8")]
fr += [json.loads(x) for x in open(R + "/data/spelling-bridge/bridge-v1/form-rows-not-landed-v1.jsonl", encoding="utf-8")]
rowAt = collections.defaultdict(list)
for r in fr:
    for p in r["places"]: rowAt[(p["book"], p["place"])].append(r)
s206 = [l for l in L if l["use"] == "NEW_PIECES" and l["class"] == "STEP_WRITES_OUR_SPELLING"]
same_bytes = same_trim = 0; diffs = []
zones = {}
def zone(b):
    if b not in zones: zones[b] = json.loads(gzip.open(R + "/data/zones/" + b + ".bin").read())
    return zones[b]
z_bytes = z_trim = 0; zdiff = []
for l in s206:
    rows = rowAt[(l["book"], l["place"])]
    parts = rows[0]["route"].split("/")
    aw = [p["english_tahot_as_written"] for p in l["pieces"]]
    if parts == aw: same_bytes += 1
    if [x.strip() for x in parts] == [x.strip() for x in aw]: same_trim += 1
    else: diffs.append((l["book"], l["place"], parts, aw))
    z = zone(l["book"]); sec = [s for s in z["sections"] if s.get("label") == l["ref"]][0]
    n = int(l["place"].split(":")[2]); w = [x for x in sec["words"] if not x.get("mark")][n - 1]
    g = [p["g"] for p in w.get("pg", [])]
    if g == [x.strip() for x in aw]: z_bytes += 1
    else: zdiff.append((l["book"], l["place"], g, [x.strip() for x in aw]))
    if [x.strip() for x in g] == [x.strip() for x in aw]: z_trim += 1
print("206:", len(s206), "form row part == as_written byte for byte:", same_bytes, "· trimmed equal:", same_trim, "· differ:", diffs[:5])
print("206 on the zones: laid g == as_written trimmed, byte for byte:", z_bytes, "· trimmed both:", z_trim)
nd = sum(1 for l in s206 for p in l["pieces"] if p["english_tahot_as_written"] != p["english_tahot_as_written"].strip())
print("pieces at the 206 whose part carries an end space:", nd, "at places:", sum(1 for l in s206 if any(p["english_tahot_as_written"] != p["english_tahot_as_written"].strip() for p in l["pieces"])))
print("zone diffs sample:", [(b, p, g, a) for b, p, g, a in zdiff[:3]])
# brace places named
print("brace places:", [(l["book"], l["place"], l["class"]) for l in brace][:50])
# laid by book
print("laid by book:", dict(collections.Counter(l["book"] for l in laid)))
# pieces of the new laid with end spaces
print("new laid pieces with an end space:", sum(1 for l in laid for p in l["pieces"] if p["english_tahot_as_written"] != p["english_tahot_as_written"].strip()))
print("new laid pieces with a bracket:", sum(1 for l in laid for p in l["pieces"] if re.search(r"[\[\]<>]", p["english_tahot_as_written"])), "places:", sum(1 for l in laid if any(re.search(r"[\[\]<>]", p["english_tahot_as_written"]) for p in l["pieces"])))
print("roles among laid:", collections.Counter(p["role"] for l in laid for p in l["pieces"]))
print("laid rows count:", collections.Counter(len(l["tahot_rows"]) for l in laid))
