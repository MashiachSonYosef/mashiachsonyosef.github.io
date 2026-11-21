# Ship 10b, patch 6: the round holds the spans' node laws with the default picks' (tools/round-v1.sh), and
# PIPELINE.md says where the spans come from and what reads them.
import sys, io
R = sys.argv[1]
def patch(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, s.count(a), a[:80])
        s = s.replace(a, b)
    io.open(path, "w", encoding="utf-8").write(s)
    print("patched", path)

patch(R + "/tools/round-v1.sh", [
('''# sha256), and its ledger of each source's own picks at every word place (the
# default sources' pills; pinned in data/default-picks/PIN.json), which are
''', '''# sha256), and its ledger of each source's own picks at every word place (the
# default sources' pills; pinned in data/default-picks/PIN.json; with it,
# where the tree pins it, the list of the words each pick's line reads,
# data/default-picks/spans-v1/PIN.json, in the same folder as spans-v1/), which are
'''),
('''#             [--default-picks <folder holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/>]
''', '''#             [--default-picks <folder holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/, and spans-v1/ where the tree pins the spans>]
'''),
('''  else echo "   $(grep -cE '^  ok  ' "$WORK/defaults-check.log") node laws held (tools/check-default-picks-v1.mjs --node)"; fi
fi
''', '''  else echo "   $(grep -cE '^  ok  ' "$WORK/defaults-check.log") node laws held (tools/check-default-picks-v1.mjs --node)"; fi
  # the words each source's line reads (default-spans-rule-v1): the pin, and every book's spans, recounted from
  # the list where the ledger is given; its page laws run with the suite (exit 3: the tree pins no spans)
  code=0
  node tools/check-default-spans-v1.mjs --node ${DEFAULT_PICKS:+--ledger "$DEFAULT_PICKS"} > "$WORK/defaults-spans-check.log" 2>&1 || code=$?
  if [ "$code" = "3" ]; then sed -n 's/^SKIPPED/   skipped/p' "$WORK/defaults-spans-check.log"
  elif [ "$code" != "0" ]; then echo "round-v1: the default picks' spans do not hold" >&2; grep -E "^FAIL" "$WORK/defaults-spans-check.log" >&2 || true; tail -2 "$WORK/defaults-spans-check.log" >&2; exit 1
  else echo "   $(grep -cE '^  ok  ' "$WORK/defaults-spans-check.log") node laws held (tools/check-default-spans-v1.mjs --node)"; fi
fi
'''),
])

patch(R + "/PIPELINE.md", [
('''> under which rule (its `rule_id` and `landings`), and
> `tools/check-audit-calls-v1.mjs` (A10 to A12) and the gate read it.
''', '''> under which rule (its `rule_id` and `landings`), and
> `tools/check-audit-calls-v1.mjs` (A10 to A12) and the gate read it.
> The words a source's line reads (`default-spans-rule-v1`, relay v209): the
> corpus lane's spans list gives, for every default-pick line, the first and
> the last word the line reads by its own source's data. Its rule and
> receipts are kept in `data/default-picks/spans-v1/` and named by the pin
> there; the list stays on the lane's store beside the default picks and is
> read through `--default-picks` (`spans-v1/`), by `tools/default-spans-v1.mjs`
> alone. The default picks' bake lays, in each book's file, the units of two
> or more words that MACULA's, UBS's and BDB's first pick reads (`spans`),
> each line proved to be the pick the bake read at its place. The page reads
> a unit's words as one under that source set first: one line over them in
> one cell, each word as it rests where they stand apart. Nothing at rest
> moves. `tools/check-default-spans-v1.mjs` holds the pin, the book files
> and the page under each source, and the gate takes the spans as owed
> lines under a source pressed.
'''),
])
