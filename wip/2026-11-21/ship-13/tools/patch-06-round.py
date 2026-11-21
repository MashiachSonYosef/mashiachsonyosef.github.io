# Ship 13: tools/round-v1.sh hands the lattice projection the folder of the lattice delta's lists.
import sys
p = sys.argv[1] + "/tools/round-v1.sh"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-06: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)
sub("""# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book), its two binyan files and their extension to
# three more dictionaries (pinned in data/stems-extension/ by its size and
# sha256), and its ledger of each source's own picks at every word place (the""",
    """# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book), the lists of its delta over that lattice
# (pinned in data/lattice-delta/PIN.json, each by its size and sha256: the
# projection reads a listed entry's names and grades from them, and is never
# run without them once the tree pins them), its two binyan files and their
# extension to
# three more dictionaries (pinned in data/stems-extension/ by its size and
# sha256), and its ledger of each source's own picks at every word place (the""")
sub("""#             [--lattice <folder holding lattice-<book>-v12.json and its positions and routes>]
""", """#             [--lattice <folder holding lattice-<book>-v12.json and its positions and routes>]
#             [--lattice-delta <folder holding the lists data/lattice-delta/PIN.json names>]
""")
sub("""STAMP=""; LATTICE=""; STEMS=""; EXTENSION=""; DEFAULT_PICKS="";""", """STAMP=""; LATTICE=""; LATTICE_DELTA=""; STEMS=""; EXTENSION=""; DEFAULT_PICKS="";""")
sub("""    --lattice) LATTICE="${2:?--lattice needs a folder}"; shift 2 ;;
""", """    --lattice) LATTICE="${2:?--lattice needs a folder}"; shift 2 ;;
    --lattice-delta) LATTICE_DELTA="${2:?--lattice-delta needs a folder}"; shift 2 ;;
""")
sub("""    [ -n "$EXTENSION" ] || { echo "round-v1: --lattice needs --stems-extension (the file data/stems-extension/PIN.json names; the projection reads it beside the binyan files)" >&2; exit 2; }
""", """    [ -n "$EXTENSION" ] || { echo "round-v1: --lattice needs --stems-extension (the file data/stems-extension/PIN.json names; the projection reads it beside the binyan files)" >&2; exit 2; }
    # the delta over the lattice: due where the tree pins it, and never handed to a tree that pins none (the projection refuses either way; said here first)
    DELTA_ARGS=()
    if [ -f data/lattice-delta/PIN.json ]; then
      [ -n "$LATTICE_DELTA" ] || { echo "round-v1: this tree pins the lattice delta (data/lattice-delta/PIN.json), so --lattice needs --lattice-delta (the folder holding its lists)" >&2; exit 2; }
      DELTA_ARGS=(--delta "$LATTICE_DELTA")
    elif [ -n "$LATTICE_DELTA" ]; then echo "round-v1: --lattice-delta names a folder, and this tree pins no lattice delta" >&2; exit 2; fi
""")
sub("""        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" --row-stems-extension "$EXTENSION" > "$WORK/lattice/$b.log" 2>&1 \\
""", """        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" --row-stems-extension "$EXTENSION" "${DELTA_ARGS[@]}" > "$WORK/lattice/$b.log" 2>&1 \\
""")
open(p, "w", encoding="utf-8").write(t)
print("patch-06 ok")
