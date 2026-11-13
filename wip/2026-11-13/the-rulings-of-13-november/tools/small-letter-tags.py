# Tags that carry a small letter after their digits: where the zones' words carry one (the place's side), and where
# the row entries ledger's lines carry one (the row's side), by source. To see whose letters the small ones are.
# python3 -I small-letter-tags.py <reader dir> <the row entries ledger>
import collections, gzip, json, os, re, sys
R, LEDGER = sys.argv[1], sys.argv[2]
SMALL = re.compile(r"^[HA]\d+[a-z]$")
CAP = re.compile(r"^[HA]\d+[A-Z]$")
zones = os.path.join(R, "data", "zones")
places = collections.Counter()
shown = []
for name in sorted(os.listdir(zones)):
    if not name.endswith(".bin") or name.count(".") != 1: continue
    try: z = json.loads(gzip.open(os.path.join(zones, name)).read().decode("utf-8"))
    except Exception: continue
    for sec in z.get("sections") or []:
        for w in sec.get("words") or []:
            for half in [w] + list(w.get("kq") or []) if isinstance(w.get("kq"), list) else [w]:
                tg = half.get("tg") if isinstance(half, dict) else None
                if not tg: continue
                for t in (tg if isinstance(tg, list) else [tg]):
                    if SMALL.match(str(t)):
                        places[name[:-4]] += 1
                        if len(shown) < 30: shown.append(f"{name[:-4]} {sec.get('label')} «{w.get('s')}» key {w.get('k')} tag {t}")
print(sum(places.values()), "places carry a tag with a small letter:", dict(places))
for s in shown: print("  ", s)

rows_small = collections.Counter(); rows_cap = collections.Counter()
keys_wanted = set(s.split(" key ")[1].split(" tag ")[0] for s in shown)
sample = []
for line in open(LEDGER, encoding="utf-8"):
    l = json.loads(line)
    for r in l["rows"]:
        m, entries = r[1], r[4]
        tags = [e[0] if isinstance(e, list) else e for e in entries]
        if any(SMALL.match(str(t)) for t in tags): rows_small[m] += 1
        if any(CAP.match(str(t)) for t in tags): rows_cap[m] += 1
        if l["k"] in keys_wanted and m in ("M4", "M19", "M3") and len(sample) < 40:
            sample.append(f"{l['k']} {m} rank {r[0]} entries {json.dumps(entries, ensure_ascii=False)[:150]} numbers {r[5]}")
print("ledger rows with an entry carrying a small letter, by source:", dict(rows_small))
print("ledger rows with an entry carrying a capital letter, by source:", dict(rows_cap))
for s in sample: print("  ", s)
