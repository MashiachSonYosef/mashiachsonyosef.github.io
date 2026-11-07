import gzip, json, os, collections
S = "<scratchpad>"
D = f"{S}/pt/reader/data/route-store/shards"
rows_by_m = collections.Counter(); years_by_m = collections.defaultdict(collections.Counter); keys_by_m = collections.defaultdict(set)
for f in sorted(os.listdir(D)):
    if not f.endswith(".bin"): continue
    body = json.loads(gzip.open(os.path.join(D, f)).read())
    for k, rows in body.items():
        for r in rows:
            m = str(r[3]); rows_by_m[m] += 1; years_by_m[m][str(r[4])] += 1; keys_by_m[m].add(k)
out = {m: {"rows": rows_by_m[m], "keys": len(keys_by_m[m]), "years": dict(years_by_m[m])} for m in rows_by_m}
json.dump(out, open(f"{S}/v16/fold/census-by-m.json", "w"), ensure_ascii=False, indent=1)
idx = json.load(open(f"{S}/pt/reader/data/route-store/index.json"))
ms = idx["m_sources"]
print("M · rows · keys · the row years · the M table's year")
for m, c in sorted(rows_by_m.items(), key=lambda x: -x[1])[:40]:
    print(m, c, len(keys_by_m[m]), dict(years_by_m[m]), ms.get(m, {}).get("sourceYear"), ms.get(m, {}).get("key", "")[:40])
nd = sum(c for m in rows_by_m for y, c in years_by_m[m].items() if y == "S_NO_SOURCE_YEAR")
print("rows with no year:", nd, "of", sum(rows_by_m.values()))
