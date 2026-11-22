# Ship 16, patch 5: the kinds record files the key of the sources that return now. English Wiktionary's translation
# tables (M78, M103, one key: the table of translations into other languages written in Hebrew letters) join their
# family, a word list (shut by kind at rest); its «where» names the record they return by. The version moves to
# the day, so an «open» a reader pressed under the record before holds no longer and the returning rows rest shut
# for every reader until opened again, as the page keeps the press (zone.html, KINDS_KEY). PanLex and Harkavy do
# not return in this ship and are not filed. Exact replacements on the record as main keeps it.
# Usage: patch-16-05-kinds.py <reader>
import io, sys, json
p = sys.argv[1] + "/data/dictionary-kinds-v1.json"; s = io.open(p, encoding="utf-8").read()
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)
swap(' "version": "2026-11-19a",\n', ' "version": "2026-11-22a",\n')
swap('"keys":["dbnary_english_wiktionary_hebrew_translation_gloss","kaikki_english_wiktionary_hebrew_translation_table"],',
     '"keys":["dbnary_english_wiktionary_hebrew_translation_gloss","kaikki_english_wiktionary_hebrew_translation_table","kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table"],')
swap('"where":"source-declarations-v1.bin, stems.kaikki_english_wiktionary_hebrew_translation_table and stems.dbnary_english_wiktionary_hebrew_translation_gloss.","files":{"source-declarations-v1.bin":"data/route-store/source-declarations-v1.bin"},',
     '"where":"source-declarations-v1.bin, stems.kaikki_english_wiktionary_hebrew_translation_table and stems.dbnary_english_wiktionary_hebrew_translation_gloss; readmission-v1.json, the sources of the work translation-tables (the key kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table, back since 22 November 2026 for the rows the source ledger v1.1 admits).","files":{"source-declarations-v1.bin":"data/route-store/source-declarations-v1.bin","readmission-v1.json":"data/readmission-v1.json"},')
rec = json.loads(s)
fam = [f for f in rec["families"] if f["id"] == "english-wiktionary-translation-tables"][0]
assert len(fam["keys"]) == 3 and rec["version"] == "2026-11-22a"
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p, "· version", rec["version"], "·", len(fam["keys"]), "keys in the translation tables' family")
