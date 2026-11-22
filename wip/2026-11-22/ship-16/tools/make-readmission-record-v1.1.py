# Ship 16: writes data/readmission-v1.json, the record the re-admission reads, for the corpus lane's relay v210 (send
# back v1.1, which corrects relay v207). Two sources return: English Wiktionary's translation tables (M78, M103), for
# the rows the source ledger v1.1 admits by their own language field (BY_ROW). Their entries are the ones the index
# held before the strike (wip/2026-11-21/v207/the-35-sources-as-the-index-held-them.json, recovered from the history
# by ship 12). PanLex (M24, M82) is held with its source: its lines are in the same list, and the pin holds it back
# with the reason it gives (data/landings/PIN.json, held_sources), which this record copies. Harkavy (withdrawn whole
# by v210) and the Bible dictionaries (they wait for the owner's word) are in no list this ship pins: the record names
# them and why, and they stay struck with every other struck source.
# Usage: make-readmission-record-v1.1.py <reader> <the-35-sources json> <send-back-v1.1 dir> <ship 12's record, read only>
import io, sys, os, json, collections, hashlib
R, HELD, D, SHIP12 = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
held = json.load(io.open(HELD, encoding="utf-8"))
RULE = "readmission-rule-v1-a-source-our-own-label-struck-returns-on-what-its-own-source-says-it-is-for-the-rows-the-corpus-lane-lists"
LID = "send-back-own-language-v1.1"
LIST = "landing-own-language-v1.1.jsonl"
num = lambda m: int(m[1:])
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
assert sha(os.path.join(D, LIST)) == "fbdb06ede7e90254d505a2ef619614d6ea5f31866973f488f00985e198fca878"
assert sha(os.path.join(D, "withdrawn-harkavy-v1.1.json")) == "1ca01ac0a26bc391a8034e25cb1f93ef58c3782f2731eb8681044732ab69cbfc"
assert sha(os.path.join(D, "receipt-v1.1.json")) == "e031f0b3d5c765508b5bb4dd8a417bc0bfba258d2b49eadd6077e980245beb6b"
pin = json.load(io.open(os.path.join(R, "data", "landings", "PIN.json"), encoding="utf-8"))
L = next(l for l in pin["lists"] if l["id"] == LID)
HOLD = L["held_sources"]
assert sorted(HOLD) == ["M24", "M82"], HOLD
rows = collections.Counter(); cls = {}; said = {}; key_of = {}; values = collections.defaultdict(collections.Counter)
for line in io.open(os.path.join(D, LIST), encoding="utf-8"):
    e = json.loads(line)
    rows[e["m"]] += 1; cls[e["m"]] = e.get("source_class") or e.get("work_family"); said[e["m"]] = e["struck"]; key_of[e["m"]] = e["source"]
    lg = e["language"]; values[e["m"]][f'{lg["field"]}={lg["value"]}' + (f' (code {lg["code"]})' if lg["field"] == "lang" else "")] += 1
returning = sorted([m for m in rows if m not in HOLD], key=num)
assert returning == ["M78", "M103"] and rows["M78"] == 114 and rows["M103"] == 12, (returning, rows)
SAYS = ("English Wiktionary writes each translation's language in the item's own field lang, with its code beside it. The "
        "source ledger v1.1 (relay v210) judges this label row by row (BY_ROW) by that field: it admits a row whose lang "
        "reads «Aramaic» (code arc or arc-bib), «Jewish Babylonian Aramaic» (code tmr or arc) or "
        "«Jewish Palestinian Aramaic» (code jpa), and refuses every other value; Lishana Deni and Classical Syriac "
        "are out (the lane's call). A served row of the label stands only where the ledger's admitted_rows names it, by m, "
        "key and words")
OWN = ["Aramaic", "Jewish Babylonian Aramaic", "Jewish Palestinian Aramaic"]
sources = []
for m in returning:
    h = held[m]; e = h["entry"]
    assert e["key"] == key_of[m] and cls[m] == "translation-tables", (m, e["key"], key_of[m], cls[m])
    sources.append({"m": m, "work": cls[m], "returns": "the rows the source ledger v1.1 admits by their own language field",
      "ground": "each row's own language field, as the source ledger v1.1 admits it (BY_ROW)", "says": SAYS, "own_words": OWN,
      "languages": ["Aramaic", "English"], "values_on_its_rows": dict(sorted(values[m].items(), key=lambda x: (-x[1], x[0]))),
      "list": LID, "rows_listed": rows[m], "held_by_their_line": sum(1 for h in L.get("held_lines", []) if h["m"] == m), "struck": said[m],
      "entry": {"key": e["key"], "label": e["label"], "licensePosture": e["licensePosture"], "licensePointer": e["licensePointer"]},
      "entry_from": h["from_commit"], "source_year_before_the_strike": e.get("sourceYear")})
index = json.load(io.open(os.path.join(R, "data", "route-store", "index.json"), encoding="utf-8"))
struck = index["language_admission"]["struck_m_ids"]
assert len(struck) == 49 and not index["language_admission"].get("readmitted_m_ids"), "the index is not the strike's as it stood before any re-admission"
stay = sorted([m for m in struck if m not in returning], key=num)
# Harkavy's twelve, as the receipt of v1.1 counts its withdrawn list's lines by source
rc = json.load(io.open(os.path.join(D, "receipt-v1.1.json"), encoding="utf-8"))
hark_m = sorted(rc["counts"]["harkavy"]["lines_by_m"], key=num)
assert len(hark_m) == 12 and rc["counts"]["harkavy"]["lands"] == 0, hark_m
NEVER = ["M12", "M39", "M40", "M49", "M52", "M63", "M65", "M75", "M99", "M104", "M106", "M108", "M131", "M168"]
bible = sorted([m for m in stay if m not in HOLD and m not in hark_m and m not in NEVER], key=num)
s12 = json.load(io.open(SHIP12, encoding="utf-8"))
s12_bible = sorted([m for w in s12["held_for_the_owners_word"]["sources"].values() for m in w["m"]], key=num)
assert bible == s12_bible and len(bible) == 19, (bible, s12_bible)
assert all(m in stay for m in HOLD)
bd = rc["counts"]["bible_dictionaries"]["carried"]
rec = {
 "schema_version": "READMISSION_V1", "rule_id": RULE,
 "what": ("the sources the language admission struck on our own label, back on what each one's own source says it is. "
          "The language admission (language-admission-rule-v1) judged a source by the label this project gave it; its "
          "record says of every source it struck for silence that «the fix is a label at the source naming what its "
          "own title page names, not an exception here». The corpus lane's relay v210 corrects its relay v207: the "
          "owner never repealed the language ban of 31 August for a defining source (an M stays Hebrew and Aramaic only), "
          "and the source ledger is reissued as v1.1, which judges three labels row by row (BY_ROW), each row by its own "
          "source's language field. Of those, English Wiktionary's translation tables return now, for the rows the "
          "ledger admits and no other. Their index entry is the one the store held before the strike, with the languages "
          "its own source names and no wording year. The rows themselves land by the landings' rule "
          "(data/landings/PIN.json)."),
 "relay": "v210", "of": "21 November 2026", "letter": "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v210.md",
 "corrects": {"relay": "v207", "of": "20 November 2026", "what": "send back v1: its sentence that the language ban of 31 August was repealed was the lane's own, not the owner's; Harkavy's list is withdrawn whole; 20 lines of the own-language list are withdrawn (Assyrian Neo-Aramaic, Lishana Deni, Classical Syriac)"},
 "source_ledger": {"at": "r2:mishkan/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json", "sha256": "8d9caf8c5c5f253f307ce9ffac176d77c01642e7fb72fcb1ae4241c4b9c78bbc",
   "declared_corpus": "BY_ROW", "how": "a served row of this label stands only where a line of the landing list names its m, key and words (route)"},
 "lists": [LID], "lists_pin": "data/landings/PIN.json",
 "source_year": "S_NO_SOURCE_YEAR",
 "sources": sources,
 "held": {
  "what": "sources whose lines stand in a list of this record and do not return: the list's pin holds each back with why (held_sources), every line of it is named not landed, held with its source, and the source stays struck",
  "sources": {m: {"work": cls[m], "list": LID, "rows_listed": rows[m], "why": HOLD[m]} for m in sorted(HOLD, key=num)}},
 "not_in_this_record": {
  "harkavy": {"m": hark_m, "why": "withdrawn whole by the corpus lane's relay v210: the owner refused Harkavy by name on 1 and 6 September 2026, and nothing of his reverses it; the source ledger v1.1 keeps his twelve labels REFUSED",
    "list": "r2:mishkan/v2/ledgers/all/send-back/send-back-v1.1/withdrawn-harkavy-v1.1.json (sha256 1ca01ac0a26bc391a8034e25cb1f93ef58c3782f2731eb8681044732ab69cbfc)"},
  "bible-dictionaries": {"m": bible, "why": "the relay's list of the Bible dictionaries (Davidson's seventeen other sources, the ETCBC's glosses, STEP's Expanded Strong tags) is unchanged by v210 and waits for the owner's word; ship 12 held it so on 21 November 2026",
    "list": f"r2:mishkan/v2/ledgers/all/send-back/send-back-v1/{bd['file']} ({bd['lines']:,} lines, sha256 {bd['sha256']})"},
  "listed-by-no-relay": {"m": NEVER, "why": "struck sources no list of the corpus lane's sends back"}},
 "stay_struck": stay,
 "counts": {"sources": len(sources), "rows_listed": sum(s["rows_listed"] for s in sources), "rows_held_by_their_line": sum(s["held_by_their_line"] for s in sources), "held_sources": len(HOLD), "held_rows_listed": sum(rows[m] for m in HOLD), "stay_struck": len(stay)},
}
assert set(stay) == set(HOLD) | set(hark_m) | set(bible) | set(NEVER) and len(stay) == 47, len(stay)
io.open(os.path.join(R, "data", "readmission-v1.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(rec, ensure_ascii=False, indent=1) + "\n")
print(json.dumps(rec["counts"], ensure_ascii=False), "· returning", returning, "· held", sorted(HOLD, key=num), "· Harkavy", len(hark_m), "· Bible dictionaries", len(bible), "· listed by no relay", len(NEVER))
