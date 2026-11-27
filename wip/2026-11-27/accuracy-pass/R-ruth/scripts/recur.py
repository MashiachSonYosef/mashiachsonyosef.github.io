# How often the causes seen in Ruth recur in the 39 books, counted from the lines at rest and the book files.
# Read only. Usage: python3 -I recur.py <reader dir> <out dir>
import gzip, json, sys, os, glob, re, collections
R, OUT = sys.argv[1], sys.argv[2]
books = sorted(os.path.basename(p)[:-8] for p in glob.glob(os.path.join(R, "data/resting-lines/*.json.gz")) if "tikkunei" not in p)  # the 39 books only
out = open(os.path.join(OUT, "recur-places.tsv"), "w")
out.write("cause\tbook\tverse\tentry\thebrew\tline\tcredit\tnote\n")
tot = collections.Counter()
credit_tot = collections.Counter()
words = 0
for b in books:
    zp = os.path.join(R, "data/zones", b + ".bin")
    if not os.path.exists(zp):
        continue
    zone = json.load(gzip.open(zp))
    rest = json.load(gzip.open(os.path.join(R, "data/resting-lines", b + ".json.gz")))
    lines = {label: {row[0]: row for row in rows} for label, rows in rest["sections"]}
    for sec in zone["sections"]:
        label = sec["label"]
        ws = sec["words"]
        for ei, w in enumerate(ws):
            if w.get("mark"):
                continue
            row = lines.get(label, {}).get(ei)
            line = row[2] if row else ""
            credit = row[3] if row else ""
            words += 1
            credit_tot[credit] += 1
            kq = w.get("kq") or {}
            order = kq.get("order", "")
            def put(cause, note=""):
                tot[cause] += 1
                out.write(f"{cause}\t{b}\t{label}\t{ei}\t{w.get('s','')}\t{line}\t{credit}\t{note}\n")
            if order == "KETIV_ONLY":
                put("written_not_read", json.dumps(kq, ensure_ascii=False)[:200])
            if order == "QERE_ONLY":
                put("read_not_written")
                # the word before it (TAHOT joins the two on one row)
                j = ei - 1
                while j >= 0 and ws[j].get("mark"):
                    j -= 1
                if j >= 0:
                    prow = lines.get(label, {}).get(j)
                    tot["word_before_read_not_written"] += 1
                    out.write(f"word_before_read_not_written\t{b}\t{label}\t{j}\t{ws[j].get('s','')}\t{prow[2] if prow else ''}\t{prow[3] if prow else ''}\t\n")
            if order and order not in ("KETIV_ONLY", "QERE_ONLY") and credit not in ("PIECE:TAHOT", "M4"):
                put("written_and_read_pair_not_led_by_step", order)
            if not order and credit not in ("PIECE:TAHOT", "M4"):
                put("plain_word_not_led_by_step")
            pieces = [p.strip() for p in line.replace("​", " ​ ").split(" + ")]
            if any(p == "!" for p in pieces):
                put("piece_is_exclamation_mark")
            if line.replace("​", "").strip() == "":
                put("line_is_gap_only", "joined to next by maqaf" if (w.get("presentation_join") or {}).get("join_next_without_separator") else "NOT joined to next")
            elif re.fullmatch(r"(<[^>]*>|\[[^\]]*\]|¿|~|\+|\s)+", line.replace("​", "")):
                put("line_is_signs_only")
            if not row:
                put("no_line")
print("books", len(books), "words", words)
for k, v in tot.most_common():
    print(v, k)
print("credits", credit_tot.most_common())
