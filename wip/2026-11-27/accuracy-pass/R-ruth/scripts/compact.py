# Compact reading sheet from sheet.tsv: one word per line, verse by verse. Read only.
# Usage: python3 -I compact.py <out dir> [chapter]
import sys, os, csv
OUT = sys.argv[1]
chap = sys.argv[2] if len(sys.argv) > 2 else None
cur = None
with open(os.path.join(OUT, "sheet.tsv")) as f:
    rd = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(rd)
    for verse, section, entry, word_no, heb, key, line, credit, tag, head, pieces, extra in rd:
        if chap and not verse.startswith(chap + ":"):
            continue
        if verse != cur:
            cur = verse
            print(f"\n== {verse}")
        if not word_no:
            continue
        vis = line.replace("​", "␀")  # show zero-width space
        note = ""
        if credit != "PIECE:TAHOT":
            note += f" «{credit}»"
        if '"ld"' in extra or '"kq"' in extra or '"te"' in extra:
            note += " " + extra[:160]
        elif extra and "presentation_join" not in extra and extra != '{"np": 1}':
            note += " " + extra[:160]
        elif extra and ("np" in extra):
            note += " np"
        print(f"{entry:>2} w{word_no:<2} {heb}  →  {vis}   [{tag}]{note}")
