# Ship 16, patch 6: the ledgers' manifest says why the key of the sources that return now has no ledger. The ledgers'
# divisions refuse a served source with no ledger that the manifest does not name with why
# (tools/apply-ledger-divisions-v1.mjs), and the translation tables' returning rows are served under a key of their
# own (M78, M103): the corpus lane has declared no ledger of its punctuation, so each row is one reading, whole, as
# its landing line gives it. Of ship 12's patch 4 only this key is needed: no other returning source lands now.
# An exact replacement on the manifest as main keeps it. Usage: patch-16-06-ledgers-excluded.py <reader>
import io, sys, json
p = sys.argv[1] + "/data/ledgers-v1/manifest.json"; s = io.open(p, encoding="utf-8").read()
old = ' "excluded": {},\n'
new = (' "excluded": {\n'
       '  "kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table": "returned to the store on 22 November 2026 for the rows the corpus lane\'s source ledger v1.1 admits by their own language field (relay v210; data/readmission-v1.json): the lane has declared no ledger of its punctuation, so each of its rows is one reading as its landing line gives it, whole, until a ledger lands"\n'
       ' },\n')
assert s.count(old) == 1, s.count(old)
s = s.replace(old, new)
m = json.loads(s)
assert json.dumps(m, ensure_ascii=False, indent=1) + "\n" == s, "the manifest's layout is not the one it is kept in"
assert "kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table" not in m["ledgers"]
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p, "· excluded with why:", len(m["excluded"]), "source key")
