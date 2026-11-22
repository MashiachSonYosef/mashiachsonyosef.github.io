# Ship 17 (22 November 2026): data/spelling-bridge/PIN.json learns bridge v1.1 (relay v214). Ship 11d's entries for v1
# stand as it wrote them, named as what v1.1 extends. Added: `v1_1`, naming v1.1's kept files and the files of the
# lane's folder not kept, each by the bytes and sha256 read off the file and held equal to the figures relay v214's
# letter gives; `laid` and `not_laid` by kind (class, use, and what holds a place within its class), every count read
# from the list by the rules tools/spelling-bridge-v1.mjs states (a tag is plain where it is «H», digits and letters;
# the lattice's surface writes a pair with round and square brackets). Run again on its own output it writes the same
# bytes. Usage: python3 -I make-pin-17.py <reader dir> <v1.1 download folder> <letter v214>
import io, json, re, sys, hashlib, os
R, D, LETTER = sys.argv[1], sys.argv[2], sys.argv[3]
HOME = os.path.join(R, "data", "spelling-bridge")
PIN = os.path.join(HOME, "PIN.json")
pin = json.load(open(PIN, encoding="utf-8"))
fail = lambda why: (print("REFUSED: " + why), sys.exit(1))

# the figures the letter gives, one line per file: «- bridge-v1.1/<path>: <bytes> bytes, sha256 <hex>»
said = {}
for line in io.open(LETTER, encoding="utf-8"):
    m = re.match(r"^- bridge-v1\.1/(\S+): ([0-9,]+) bytes, sha256 ([0-9a-f]{64})\s*$", line)
    if m: said[m.group(1)] = (int(m.group(2).replace(",", "")), m.group(3))
def entry(path, name, lines=False):
    b = open(path, "rb").read()
    e = {"file": name, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    if name not in said: fail(f"the letter names no figures for {name}")
    if said[name] != (e["bytes"], e["sha256"]): fail(f"{path} is {e['bytes']} bytes, {e['sha256'][:12]}, and the letter names {said[name][0]}, {said[name][1][:12]}")
    if lines:
        t = b.decode("utf-8")
        if not t.endswith("\n"): fail(f"{path} does not end in a line end")
        e["lines"] = len(t[:-1].split("\n"))
    return e

KEPT = os.path.join(HOME, "bridge-v1.1")
rule = entry(os.path.join(KEPT, "RULE.md"), "RULE.md")
receipt = entry(os.path.join(KEPT, "receipt-v1.1.json"), "receipt-v1.1.json")
places = entry(os.path.join(KEPT, "bridge-places-v1.1.jsonl"), "bridge-places-v1.1.jsonl", lines=True)
not_kept = [entry(os.path.join(D, n), n) for n in ["ANSWER-D.md", "build-bridge-v1.1.mjs", "verify-bridge-v1.1.mjs", "verify-receipt-v1.1.json", "two-runs-v1.txt", "verify-r1/recount-r1.mjs", "verify-r1/recount-r1.json", "verify-r1/two-runs-r1.txt"]]

# the kinds of the list, by the reading's rules
L = [json.loads(x) for x in io.open(os.path.join(KEPT, "bridge-places-v1.1.jsonl"), encoding="utf-8")]
PLAIN_TAG = re.compile(r"^H[0-9A-Za-z]+$")
PAIR_MARKS = re.compile(r"[()\[\]]")
# call 4's hold, read as the house makes it (tools/spelling-bridge-v1.mjs, call4HoldOf): call 4's landing in the
# audit calls' pin, while it holds the class of STEP's words written with « | », and the list it names, the bytes the
# default picks' pin names for the bake; every place whose STEP's words hold « | » (the bake's SPLIT)
CALL4 = {"audit_calls_pin": "../audit-calls/PIN.json", "call": 4, "tool_pin": "../default-picks/PIN.json", "tool_entry": "held_split_v189", "stands_action": "steps_words_are_the_line"}
SPLIT = " | "
ap = os.path.normpath(os.path.join(HOME, CALL4["audit_calls_pin"])); audit = json.load(open(ap, encoding="utf-8"))
tool = json.load(open(os.path.normpath(os.path.join(HOME, CALL4["tool_pin"])), encoding="utf-8"))
landing = [x for x in audit.get("landings", []) if x.get("call") == CALL4["call"]]
if len(landing) != 1: fail("the audit calls' pin names no one landing of call 4")
landing = landing[0]; lentry = audit["lists"][landing["list"]]
lpath = os.path.join(os.path.dirname(ap), audit["folder"], lentry["file"]); lb = open(lpath, "rb").read()
if len(lb) != lentry["bytes"] or hashlib.sha256(lb).hexdigest() != lentry["sha256"]: fail(f"{lpath} is not the bytes the audit calls' pin names")
te = tool.get(CALL4["tool_entry"]) or {}
if te.get("sha256") != lentry["sha256"] or te.get("bytes") != lentry["bytes"]: fail("the default picks' pin reads call 4's list as other bytes")
holding = any(f"«{SPLIT}»" in str(h.get("class", "")) for h in landing.get("holds", []))
rows4 = [json.loads(x) for x in lb.decode("utf-8").splitlines() if x.strip()]
call4 = {(d["book"], d["p"]) for d in rows4 if holding and isinstance(d.get("steps_words"), str) and SPLIT in d["steps_words"]}
# where call 4 makes STEP's reading stand: the action named, while the landing lands it, STEP's words holding no « | »
lands = CALL4["stands_action"] in str(landing.get("lands", ""))
stands4 = {(d["book"], d["p"]) for d in rows4 if lands and d.get("action") == CALL4["stands_action"] and isinstance(d.get("steps_words"), str) and SPLIT not in d["steps_words"]}
def held_of(l):
    if l.get("use") != "NEW_PIECES": return None
    if any(not PLAIN_TAG.match(str((x or {}).get("tag") or "")) for x in (l.get("pieces") or [])): return "a_piece_whose_tag_is_not_plain"
    if PAIR_MARKS.search(str((l.get("lattice_v12") or {}).get("surface") or "")): return "a_pair"
    if (l["book"], l["place"]) in call4: return "a_place_call_4_holds"
    if (l["book"], l["place"]) in stands4: return "a_place_where_steps_reading_stands"
    return None
count = {}
for l in L:
    k = (l["class"], l["use"], held_of(l))
    count[k] = count.get(k, 0) + 1

WHY_LAID = {
    ("STEP_WRITES_OUR_SPELLING", "NEW_PIECES"): ("form_row", None),
    ("THROUGH_ONE_LETTER", "NEW_PIECES"): ("as_written", "our letters and the Leningrad text's differ by one letter, and the corpus lane's bridge cuts STEP's pieces onto ours through it. Bridge v1.1 (relay v214) gives each piece its part of STEP's Translation column as STEP writes it, brackets and all; the piece's English is that part with the spaces taken off its ends, as the lane's letter says to do when the pieces are joined, and the marks taken off the part give v1's English for the piece, held so at every piece. The places where call 4 of relay v189 makes STEP's own reading stand are held (not_laid)"),
    ("SAME_LETTERS", "NEW_PIECES"): ("as_written", "our letters are the Leningrad text's, and our one word is two of STEP's rows; worded as THROUGH_ONE_LETTER is, from bridge v1.1"),
}
WHY_HELD = {
    "a_piece_whose_tag_is_not_plain": "a piece's tag is STEP's «{…}+», one tag going on over the next Hebrew word, which v1 cut to «…}+»: the piece is not read as the word's own, and at some places the roles move (relay v214, section 5). Bridge v1.2 (relay v218) mends it, and until then the place is not read around the fault",
    "a_pair": "the place is a pair in our text: the lattice's surface writes a written form and a read form (round and square brackets), the zone's word there is a pair, whose line a zone carries by its own rule, and the bridge lays pieces on a plain word only",
    "a_place_call_4_holds": "call 4 of relay v189 writes STEP's words here with « | », one written word read as two of STEP's, and the house holds the place's line as it rests until the corpus lane says how STEP's line reads there (the owner's question 2, put back to the lane; the audit calls' pin, call 4's holds). The bridge does not lay pieces past that hold (the page lane's call, 22 November 2026): at Psalms 44:15 they would print «not + peoples» where the word reads «among the peoples». Read as the hold is read (held_with_call_4), so that when the lane answers call 4 the same rule lets them in",
    "a_place_where_steps_reading_stands": "call 4 of relay v189 makes STEP's own pick 1 the line here whatever today's line is, and the page asks it before the place's pieces. Laid in ship 17's first build, the pieces left the line as it was and read the place a second way beside it: the card opened on the whole word, STEP's pick pressed, with the place's pieces said above it (check-compspan-coverage-v1 C3, Amos 1:10), and under a source pressed a reading across two words kept the pieces where the line as it rests is STEP's words (check-rulings-under-sources-v1 U8, Esther 9:18). The place waits until the page lane says how a place both read is drawn (22 November 2026). Read from call 4's list as the hold above is, while its landing lands the action named (held_with_call_4.stands_action)",
}
old_laid = {(e["class"], e["use"]): e for e in pin.get("laid", []) if not e.get("held")}
old_not = {(e["class"], e["use"]): e for e in pin.get("not_laid", []) if not e.get("held")}
laid, not_laid = [], []
for (cls, use, held), n in sorted(count.items(), key=lambda kv: (kv[0][1] is None, str(kv[0][1]), kv[0][0], str(kv[0][2]))):
    if held:
        not_laid.append({"class": cls, "use": use, "held": held, "places": n, "why": WHY_HELD[held]})
    elif (cls, use) in WHY_LAID:
        words, why = WHY_LAID[(cls, use)]
        if why is None:
            if (cls, use) not in old_laid: fail(f"{cls} · {use}: laid by ship 11d, and the pin does not lay it")
            why = old_laid[(cls, use)]["why"]
        laid.append({"class": cls, "use": use, "places": n, "words": words, "why": why})
    else:
        e = old_not.get((cls, use)) or old_laid.get((cls, use))
        if not e: fail(f"{cls} · {use}: a kind the pin has no reason for")
        not_laid.append({"class": cls, "use": use, "places": n, "why": e["why"]})
order = {("STEP_WRITES_OUR_SPELLING", "NEW_PIECES"): 0, ("THROUGH_ONE_LETTER", "NEW_PIECES"): 1, ("SAME_LETTERS", "NEW_PIECES"): 2}
laid.sort(key=lambda e: order[(e["class"], e["use"])])
held_first = [e for e in not_laid if e.get("held")] + [e for e in not_laid if not e.get("held")]
# the not-laid kinds of ship 11d keep their order; the held kinds stand first
rest = [e for e in held_first if not e.get("held")]
keep_order = [(e["class"], e["use"]) for e in pin.get("not_laid", []) if not e.get("held")]
rest.sort(key=lambda e: keep_order.index((e["class"], e["use"])) if (e["class"], e["use"]) in keep_order else 99)
not_laid = [e for e in held_first if e.get("held")] + rest

with_pieces = sum(1 for l in L if l.get("pieces"))
n_rows_not_landed = pin["form_rows_not_landed"]["lines"]
new = {}
for k in ["schema_version", "rule_id"]: new[k] = pin[k]
new["what"] = (f"the corpus lane's spelling bridge: the {len(L):,} places where our text spells a word otherwise than the Leningrad text STEP and MACULA follow, each with its class and, at {with_pieces:,} of them, STEP's pieces cut onto our letters. "
    f"Kept here byte for byte in the folders the lane keeps them in: v1 (relay v202) with its rule, its receipt and, beside it, the lane's list of the {n_rows_not_landed} form rows not landed; and v1.1 (relay v214), v1's lines with each piece's part of STEP's column as STEP writes it, with its rule and its receipt. "
    "tools/apply-spelling-bridge-v1.mjs lays the place's pieces on the zone at the kinds named under `laid`, and the reader draws the place's line from them as it does at every place that carries pieces. What a zone carries for a place is said once, in tools/spelling-bridge-v1.mjs")
for k in ["relay", "of", "letter", "from", "folder", "rule", "receipt", "places", "form_rows_not_landed", "form_rows"]: new[k] = pin[k]
new["v1_1"] = {
    "relay": "v214", "of": "21 November 2026",
    "letter": "r2:mishkan/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v214.md",
    "from": "r2:mishkan/v2/ledgers/all/spelling-bridge/bridge-v1.1/ (the private store)",
    "folder": "bridge-v1.1", "extends": pin["folder"],
    "what": "v1's lines in v1's order, every v1 field as v1 wrote it, with three fields more: on each piece its part of STEP's Translation column as STEP writes it (english_tahot_as_written, brackets and the space after the stroke kept) and where it comes from (english_tahot_as_written_from), and on each line its rows' columns whole (translation_columns_as_tahot_writes_them). Read only where each line, its added fields taken off, is v1's line",
    "rule": rule, "receipt": receipt, "places": places,
    "not_kept": not_kept,
    "why_not_kept": "as for v1: the lane's folder also holds its answer, its builder, its second count with that count's receipt and two runs, and its checker's recount; no tool reads them, and each is named here by the bytes and sha256 the relay's letter gives",
}
new["held_with_call_4"] = {**CALL4, "why": "the places call 4 holds as they rest are read where the hold itself is read: call 4's landing in the audit calls' pin, while it still holds the class of STEP's words written with « | », and the list it names, the same bytes the default picks' bake reads through its own pin (held_split_v189); every place whose STEP's words hold « | », the bake's own rule; and, while that landing lands the action stands_action, every place of the list with that action whose STEP's words hold no « | », where STEP's own reading stands. Never a list of places of its own (22 November 2026)"}
new["laid"] = laid
new["not_laid"] = not_laid
new["named_readings"] = pin["named_readings"]
tags = pin["tags"]
ADD = " Ship 17 (22 November 2026) writes none at the places it lays, for the same reason: a zone's tag is the lattice's, and teaching the projector and the entry gate the bridge is a ship of its own"
new["tags"] = tags if tags.endswith(ADD) else tags + ADD
new["lifted_by"] = pin["lifted_by"]
new["note"] = ("every sha256 here is the one the relay's letter names for the file (v202's for bridge-v1, v214's for bridge-v1.1), and the lane's receipts name the lists by the same; v1.1's receipt also names v1's files it was built from, by the same. "
    "Which kinds are laid is the page lane's decision, set here as data so neither the tool nor the check carries a list of its own; the counts beside each kind are the list's, recounted by both. "
    "A kind is a class, its use and, for a place of new pieces, what holds it within its class (`held`, said in tools/spelling-bridge-v1.mjs). "
    "The 206 places ship 11d laid on 21 November are worded by their form rows (`words`: form_row), each form row's part held to v1.1's part byte for byte; the places ship 17 lays on 22 November by v1.1's parts (`words`: as_written)")

def fmt(v, ind):
    if isinstance(v, list) and v and all(isinstance(x, dict) for x in v):
        return "[\n" + ",\n".join(" " * (ind + 1) + json.dumps(x, ensure_ascii=False) for x in v) + "\n" + " " * ind + "]"
    if isinstance(v, dict) and any(isinstance(x, (dict, list)) for x in v.values()) and ind == 1:
        return "{\n" + ",\n".join(" " * (ind + 2) + json.dumps(k) + ": " + fmt(x, ind + 2) for k, x in v.items()) + "\n" + " " * ind + "}"
    return json.dumps(v, ensure_ascii=False)
text = "{\n" + ",\n".join(" " + json.dumps(k) + ": " + fmt(v, 1) for k, v in new.items()) + "\n}\n"
json.loads(text)
io.open(PIN, "w", encoding="utf-8", newline="\n").write(text)
print("pin written: laid " + ", ".join(f"{e['class']} {e['places']} ({e['words']})" for e in laid) + " · held " + ", ".join(f"{e['class']} {e['held']} {e['places']}" for e in not_laid if e.get("held")) + f" · v1.1 list {places['sha256'][:12]}, {places['lines']} lines")
