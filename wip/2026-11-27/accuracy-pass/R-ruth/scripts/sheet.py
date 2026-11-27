# Reading sheet: every entry of Ruth (zone file) joined to its line at rest (resting-lines).
# Read only. Usage: python3 -I sheet.py <reader dir> <out dir>
import gzip, json, sys, os
R, OUT = sys.argv[1], sys.argv[2]
zone = json.load(gzip.open(os.path.join(R, "data/zones/ruth.bin")))
rest = json.load(gzip.open(os.path.join(R, "data/resting-lines/ruth.json.gz")))
lines = {label: {row[0]: row for row in rows} for label, rows in rest["sections"]}
rows_out = []
words = 0
with open(os.path.join(OUT, "sheet.txt"), "w") as f:
    for si, sec in enumerate(zone["sections"]):
        label = sec["label"]
        f.write(f"\n=== {label} (section {si})\n")
        wn = 0
        for ei, w in enumerate(sec["words"]):
            row = lines.get(label, {}).get(ei)
            line = row[2] if row else ""
            credit = row[3] if row else ""
            is_word = bool(w.get("k")) or bool(w.get("pg"))
            if row or is_word:
                wn += 1
                words += 1
            pg = " | ".join(f"{p.get('k')}={p.get('g','').strip()}[{p.get('s','')}/{p.get('r','')}]" for p in w.get("pg", []))
            extra = {k: v for k, v in w.items() if k not in ("s", "k", "h", "hp", "pg", "tg", "hg", "hm")}
            f.write(f"{ei:3d} w{wn:<3d} {w.get('s','')}\t{line}\t{credit}\ttg={w.get('tg','')}\th={w.get('h','')}\t{pg}\t{json.dumps(extra, ensure_ascii=False) if extra else ''}\n")
            rows_out.append([label, si, ei, wn if (row or is_word) else "", w.get("s", ""), w.get("k", ""), line, credit, w.get("tg", ""), w.get("h", ""), pg, json.dumps(extra, ensure_ascii=False) if extra else ""])
with open(os.path.join(OUT, "sheet.tsv"), "w") as f:
    f.write("verse\tsection\tentry\tword_no\thebrew\tkey\tline\tcredit\tstep_tag\theadword\tpieces\textra\n")
    for r in rows_out:
        f.write("\t".join(str(x) for x in r) + "\n")
print("sections", len(zone["sections"]), "entries", len(rows_out), "words counted", words)
