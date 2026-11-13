// The round projects the lattice over each book with the corpus lane's two binyan files, which are named on its
// command line because they are too large to keep beside the door. The stems extension (relay v173) is a third
// such file, 7 MB, pinned in data/stems-extension/ by its size and sha256. The round is now given it by name too
// and hands it to the projection; a round that re-projects without it stops, since the tree pins it and a sidecar
// projected without it would lack the stems the owner ruled in.
// node 70-the-round-is-given-the-stems-extension.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "round-v1.sh"), [
  [`# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book) and its two binyan files, which are too large
# to keep beside the door. They are named on the command line and never
# guessed;`,
   `# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book), its two binyan files and their extension to
# three more dictionaries (pinned in data/stems-extension/ by its size and
# sha256), which are too large to keep beside the door. They are named on
# the command line and never guessed;`],
  [`#             [--stems <folder holding place-stems-v2.jsonl and row-stems-v2.jsonl>]
`,
   `#             [--stems <folder holding place-stems-v2.jsonl and row-stems-v2.jsonl>]
#             [--stems-extension <the corpus lane's row-stems-extension-v1.jsonl>]
`],
  [`STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,search,records,lines,chain,door"`,
   `STAMP=""; LATTICE=""; STEMS=""; EXTENSION=""; STEPS="zones,stamps,search,records,lines,chain,door"`],
  [`    --stems) STEMS="\${2:?--stems needs a folder}"; shift 2 ;;
`,
   `    --stems) STEMS="\${2:?--stems needs a folder}"; shift 2 ;;
    --stems-extension) EXTENSION="\${2:?--stems-extension needs a file}"; shift 2 ;;
`],
  [`    [ -n "$STEMS" ] || { echo "round-v1: --lattice needs --stems (the binyan files the projection reads)" >&2; exit 2; }
`,
   `    [ -n "$STEMS" ] || { echo "round-v1: --lattice needs --stems (the binyan files the projection reads)" >&2; exit 2; }
    [ -n "$EXTENSION" ] || { echo "round-v1: --lattice needs --stems-extension (the file data/stems-extension/PIN.json names; the projection reads it beside the binyan files)" >&2; exit 2; }
`],
  [`        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" > "$WORK/lattice/$b.log" 2>&1 \\
`,
   `        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" --row-stems-extension "$EXTENSION" > "$WORK/lattice/$b.log" 2>&1 \\
`],
]);
