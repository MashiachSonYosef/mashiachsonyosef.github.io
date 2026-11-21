# Ship 12: writes data/readmission-v1.json, the record the re-admission reads, from the 35 sources' index entries as
# the history holds them (wip/2026-11-21/v207/the-35-sources-as-the-index-held-them.json) and the lane's three lists.
# Usage: make-readmission-record.py <reader> <the-35-sources json> <send-back-v1 dir>
import io, sys, os, json, collections
R, HELD, D = sys.argv[1], sys.argv[2], sys.argv[3]
held = json.load(io.open(HELD, encoding="utf-8"))
RULE = "readmission-rule-v1-a-source-our-own-label-struck-returns-on-what-its-own-source-says-it-is-for-the-rows-the-corpus-lane-lists"
LISTS = [("send-back-own-language-v1", "landing-own-language-v1.jsonl"), ("send-back-harkavy-v1", "landing-harkavy-v1.jsonl")]
HELD_LIST = "landing-bible-dictionaries-v1.jsonl"   # the relay's third list: its sources wait for the owner's word
rows = collections.Counter(); in_list = {}; cls = {}; said = {}; key_of = {}
for lid, f in LISTS:
    for line in io.open(os.path.join(D, f), encoding="utf-8"):
        e = json.loads(line)
        rows[e["m"]] += 1; in_list.setdefault(e["m"], lid); assert in_list[e["m"]] == lid
        cls[e["m"]] = e.get("source_class") or e.get("work_family"); said[e["m"]] = e["struck"]; key_of[e["m"]] = e["source"]
GROUND = {
 "davidson": ("whole", "its own title page", ["ANALYTICAL  HEBREW  AND  CHALDEE"], ["Hebrew", "Chaldee", "English"],
   "Davidson's own title page, as the archive's text of the scan reads it, names the book «ANALYTICAL  HEBREW  AND  CHALDEE»"),
 "etcbc": ("whole", "its own dataset name", ["@datasetName=Biblia Hebraica Stuttgartensia Amstelodamensis"], ["Hebrew", "English"],
   "The ETCBC's own gloss file names its dataset «@datasetName=Biblia Hebraica Stuttgartensia Amstelodamensis»"),
 "step-expanded-strong": ("whole", "its own file's title and column", ["Translators Amalgamated Hebrew OT tagged with disambiguated Strongs extended for BDB", "Expanded Strong tags"], ["Hebrew", "English"],
   "STEP's own file names itself «Translators Amalgamated Hebrew OT tagged with disambiguated Strongs extended for BDB», and its rows are from the column «Expanded Strong tags»"),
 "harkavy": ("whole", "its own columns", [], ["Hebrew", "English"],
   "Harkavy prints a Yiddish word, its English and its Hebrew; each row's key is a word of the Hebrew column and its words are the English column, as the page image was read (the corpus lane's reading of July 2026, named line by line in the list)"),
 "panlex": ("the rows whose own language field names Hebrew or Aramaic", "each row's own language field", [], ["Hebrew", "Aramaic", "English"],
   "PanLex's own language field for each listed row, langvar_uid, reads a code ISO 639-3 names as Ancient Hebrew or as an Aramaic (hbo, arc, aii); the rows whose field names another language stay out"),
 "translation-tables": ("the rows whose own language field names Hebrew or Aramaic", "each row's own language field", [], ["Hebrew", "Aramaic", "English"],
   "English Wiktionary's own language field for each listed translation, lang, reads an Aramaic («Aramaic», «Jewish Babylonian Aramaic», «Jewish Palestinian Aramaic», «Lishana Deni»); the rows whose field names another language stay out"),
}
num = lambda m: int(m[1:])
held_rows = collections.Counter(); held_cls = {}
for line in io.open(os.path.join(D, HELD_LIST), encoding="utf-8"):
    e = json.loads(line); held_rows[e["m"]] += 1; held_cls[e["m"]] = e.get("source_class") or e.get("work_family")
sources = []
for m in sorted(rows, key=num):
    h = held[m]; e = h["entry"]; c = cls[m]
    assert e["key"] == key_of[m], (m, e["key"], key_of[m])
    returns, ground, own, langs, says = GROUND[c]
    sources.append({"m": m, "work": c, "returns": returns, "ground": ground, "says": says, "own_words": own, "languages": langs,
      "list": in_list[m], "rows_listed": rows[m], "struck": said[m],
      "entry": {"key": e["key"], "label": e["label"], "licensePosture": e["licensePosture"], "licensePointer": e["licensePointer"]},
      "entry_from": h["from_commit"], "source_year_before_the_strike": e.get("sourceYear")})
assert set(rows) | set(held_rows) == set(held) and not (set(rows) & set(held_rows)) and len(sources) == 16 and len(held_rows) == 19, (len(rows), len(held_rows))
rec = {
 "schema_version": "READMISSION_V1", "rule_id": RULE,
 "what": "the sources the language admission struck on our own label, back on what each one's own source says it is. The language admission (language-admission-rule-v1) judged a source by the label this project gave it; its record says of every source it struck for silence that «the fix is a label at the source naming what its own title page names, not an exception here». The corpus lane's relay v207 made that fix row by row: each line of its three lists quotes the source's own title, the row's own language field, or the dictionary's own columns. A source returns whole where its own title or columns say what it is, and for its listed rows alone where each row's own field decides. Its index entry is the one the store held before the strike, with the languages its own source names and no wording year (the lane: no ruling gives any of them one). The rows themselves land by the landings' rule (data/landings/PIN.json).",
 "relay": "v207", "of": "20 November 2026", "letter": "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v207.md",
 "lists": [lid for lid, _ in LISTS], "lists_pin": "data/landings/PIN.json",
 "source_year": "S_NO_SOURCE_YEAR",
 "sources": sources,
 "stay_struck": sorted(["M12", "M39", "M40", "M49", "M52", "M63", "M65", "M75", "M99", "M104", "M106", "M108", "M131", "M168"] + list(held_rows), key=num),
 "held_for_the_owners_word": {
  "what": "the relay's third list, the Bible dictionaries, is proved line for line as the other two are and is not landed yet. A trial of 21 November 2026 landed all three lists on a copy and read every resting line: nothing moves in the thirty-nine books, where these would rest shut or stand among the owner's twelve, but the Tikkunei Zohar, which the rest does not reach, moves at 1,276 places, 1,111 of them by the ETCBC's rows; and about a fifth of Davidson's returning rows are descriptions of a word and not readings of it («a masculine proper name»). The owner's rule of 19 November is «slowly add», so each of the three waits for the owner to add it",
  "list": "landing-bible-dictionaries-v1.jsonl (18,164 lines, sha256 e6527161efdf3a75b17ca1df98a9b02d37ea023fadabd8c898668eaa1d256e6b), at r2:mishkan/v2/ledgers/all/send-back/send-back-v1/",
  "sources": {c: {"m": sorted([m for m in held_rows if held_cls[m] == c], key=num), "rows_listed": sum(n for m, n in held_rows.items() if held_cls[m] == c)} for c in sorted(set(held_cls.values()))}},
 "counts": {"sources": len(sources), "rows_listed": sum(rows.values()), "by_work": {c: {"sources": sum(1 for s in sources if s["work"] == c), "rows_listed": sum(s["rows_listed"] for s in sources if s["work"] == c)} for c in sorted(set(cls.values()))}},
}
io.open(os.path.join(R, "data", "readmission-v1.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(rec, ensure_ascii=False, indent=1) + "\n")
print(json.dumps(rec["counts"], ensure_ascii=False))
