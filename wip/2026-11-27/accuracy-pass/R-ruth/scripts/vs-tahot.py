# Every word of Ruth: the line at rest against TAHOT's own Translation column at the same place. Read only.
# Usage: python3 -I vs-tahot.py <out dir>
import sys, os, csv, re, unicodedata
OUT = sys.argv[1]
tahot = {}
for ln in open(os.path.join(OUT, "tahot-ruth.tsv")):
    c = ln.rstrip("\n").split("\t")
    m = re.match(r"Rut\.(\d+)\.(\d+)#(\d+)=(\S+)", c[0])
    ch, v, n, typ = m.group(1), m.group(2), int(m.group(3)), m.group(4)
    tahot.setdefault(f"{ch}:{v}", []).append((n, typ, c[1], c[3], c[4], c[5], c[6], c[7]))
page = {}
with open(os.path.join(OUT, "sheet.tsv")) as f:
    rd = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(rd)
    for verse, section, entry, word_no, heb, key, line, credit, tag, head, pieces, extra in rd:
        if not word_no:
            continue
        page.setdefault(verse, []).append((int(entry), int(word_no), heb, line, credit, tag, extra))
def norm_t(t):
    # TAHOT joins a word's pieces with "/"; the page prints " + " and drops a piece that is only an angle-bracket word
    parts = [p.strip() for p in t.split("/")]
    return parts
def norm_p(l):
    return [p.strip() for p in l.replace("​", "").split(" + ")]
def strip_he(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s) if "א" <= ch <= "ת")
same = diff = 0
out = open(os.path.join(OUT, "line-vs-tahot-ruth.tsv"), "w")
out.write("verse\tword_no\thebrew\tpage_line\tcredit\ttahot_ref\ttahot_hebrew\ttahot_translation\ttahot_dstrongs\tverdict\n")
for verse in page:
    pw, tw = page[verse], tahot.get(verse, [])
    if len(pw) != len(tw):
        print("count differs", verse, len(pw), len(tw))
    # align by letters, in order
    ti = 0
    for (entry, wn, heb, line, credit, tag, extra) in pw:
        t = tw[ti] if ti < len(tw) else None
        if t is None:
            out.write(f"{verse}\t{wn}\t{heb}\t{line}\t{credit}\t\t\t\t\tNO_TAHOT_ROW\n"); diff += 1; continue
        ti += 1
        n, typ, th, tt, ds, gr, mv, sv = t
        tparts = norm_t(tt)
        pparts = norm_p(line)
        # the page hides pieces whose whole reading is one angle-bracket word
        tshown = [p for p in tparts if not re.fullmatch(r"<[^<>]*>", p)]
        pshown = [p for p in pparts if p != ""]
        verdict = "SAME" if tparts == pparts else ("SAME_BUT_HIDDEN_PIECE" if tshown == pshown else "DIFFERENT")
        if verdict == "DIFFERENT": diff += 1
        else: same += 1
        hl = strip_he(heb.split("[")[-1]) if "[" in heb else strip_he(heb)
        tl = strip_he(th)
        if hl != tl:
            verdict += "|LETTERS_DIFFER"
        if mv.strip() or sv.strip():
            verdict += "|TAHOT_VARIANTS"
        out.write(f"{verse}\t{wn}\t{heb}\t{line}\t{credit}\tRut.{verse.replace(':','.')}#{n:02d}={typ}\t{th}\t{tt}\t{ds}\t{verdict}\n")
out.close()
print("same", same, "different", diff)
