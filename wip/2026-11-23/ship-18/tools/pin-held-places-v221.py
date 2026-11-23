# Ship 18 (23 November 2026): the corpus lane's resting call for the translation tables' rows, relay v221, kept in the
# tree as the house keeps a list of this kind: the list (kept gzipped, weighed as what it holds), its rule, the lane's
# answer, its receipt and second count, the known misfires, the two rows' verdicts and the empty strike list, each
# the bytes the letter names, in data/held-places/two-table-rows-v1/, beside data/held-places/PIN.json. The pin also
# names, from the zones this tree serves, the works of the list's held places that no zone serves, each with its
# reason. Run again over a tree that carries all of it, it writes nothing.
# Usage: pin-held-places-v221.py <reader> <the lane's folder two-table-rows-v1> <the letter>
import gzip, hashlib, io, json, os, sys

R, D, LETTER = sys.argv[1], sys.argv[2], sys.argv[3]
HOME = os.path.join(R, "data", "held-places")
FOLDER = "two-table-rows-v1"
# the bytes the letter of relay v221 names for each file (its section 9)
NAMED = {
    "RULE.md": (34255, "aa770466a9198ea1782ec4061850ac0e0a2a06662f1f76ec3d004c00d751d53b"),
    "ANSWER.md": (16067, "01a50ceb434e07926753ebd91fe3a534a9e37246da10da76da7f24ae7446f37e"),
    "receipt-v3.1.json": (70854, "17cb450eca12a09711a9fd3a4307868951a8fcb798005246bd3f078ccad58c49"),
    "verify-receipt-v3.1.json": (1894, "36e409eed91e6b597b181552ca58405e4c1e29670a073c32c4ef5b9e4a9f8516"),
    "places-v3.1.jsonl": (2265249, "8f1e506f8f8d693bc8e5325b575f6908a95d6c5a9849e5341d61e68c43a843b3"),
    "known-misfires-v3.1.json": (5510, "166d8df37988c6f8bed3208b7511e9ac109e75e7e8999dd338cb13d0950fa97e"),
    "two-rows-v3.1.json": (9447, "56bd6889e26795f20a98c9f39ae9c30f6c8fea7f1a8bfafd3c53cf75bf7cfcd6"),
    "strike-list-v3.1.json": (130, "cb3e0ae48339952d4b1f58998370cfcccf94d9af223c5a1e560bc0b491e8cced"),
}
GZ = {"places-v3.1.jsonl"}

def die(why):
    print("REFUSED -- " + why)
    sys.exit(1)

sha = lambda b: hashlib.sha256(b).hexdigest()
got = {}
for f, (n, h) in NAMED.items():
    b = open(os.path.join(D, f), "rb").read()
    if len(b) != n or sha(b) != h:
        die(f"{f} is not the bytes the letter of relay v221 names ({len(b)} bytes, {sha(b)})")
    got[f] = b
letter = open(LETTER, "rb").read()
if b"v221" not in letter[:200]:
    die("the letter given is not relay v221's")

places = [json.loads(x) for x in got["places-v3.1.jsonl"].decode("utf-8").splitlines()]
if len(places) != 4065:
    die(f"the list holds {len(places)} row-places, and the letter says 4,065")
held = [p for p in places if p["at_rest"] == "held"]
if len(held) != 134:
    die(f"the list holds {len(held)} places at rest held, and the letter says 109 + 12 + 13 = 134")

# the works this tree serves the lane's zones in: each commentary zone's works, and the Tikkunei Zohar's zone
Z = os.path.join(R, "data", "zones")
served = {}
for f in sorted(os.listdir(Z)):
    if f.endswith(".commentary.bin") and not f.startswith("fixture-"):
        z = json.loads(gzip.decompress(open(os.path.join(Z, f), "rb").read()))
        for w in z.get("works", []):
            served[w["id"]] = "data/zones/" + f
if os.path.exists(os.path.join(Z, "tikkunei-zohar.bin")):
    served["kabbalah/tikkunei-zohar"] = "data/zones/tikkunei-zohar.bin"
TARGUM = ("the page serves no zone of this work: the Targum it serves stands beside a book as that book's commentary zone "
          "(data/zones/<book>.commentary.bin), and no commentary zone of this tree names this work")
ZOHAR = ("the page serves no zone of this work: of the Zohar it serves the Tikkunei Zohar alone "
         "(data/zones/tikkunei-zohar.bin)")
not_served = {}
for p in held:
    if p["work"] in served:
        continue
    w = not_served.setdefault(p["work"], {"zone": p["zone"], "places_held": 0,
                                         "why": ZOHAR if p["zone"] == "zohar" else TARGUM})
    w["places_held"] += 1
not_served = dict(sorted(not_served.items()))

entry = lambda f, **kw: {"file": f + (".gz" if f in GZ else ""), **({"stored": "gzip"} if f in GZ else {}),
                         "bytes": NAMED[f][0], "sha256": NAMED[f][1], **kw}
pin = {
    "schema_version": "HELD_PLACES_PIN_V1",
    "rule_id": "place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place",
    "what": ("the corpus lane's resting call for every row of the translation tables at the places of the Targum and the Zohar "
             "(relay v221): a row names a spelling and no place, and where a dictionary the lane holds lists the spelling as two "
             "or more words, the lane says, place by place, whether the text's word there is the row's word or another word "
             "written alike. Kept here byte for byte in the folder the lane keeps it in, with its rule, its answer, its "
             "receipt and second count, the known misfires, the two rows' verdicts and the strike list. "
             "tools/apply-held-places-v1.mjs writes, on the word of each place the list marks held at rest, the rows held "
             "there and the line the place reads without them; the reader withholds those rows from the word's card there "
             "under «only this pointing», and they stand at every other place"),
    "relay": "v221",
    "of": "22 November 2026",
    "letter": "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v221.md",
    "letter_sha256": sha(letter),
    "from": "r2:mishkan/v2/ledgers/all/send-back/two-table-rows-v1/ (the private store)",
    "folder": FOLDER,
    "rule": entry("RULE.md"),
    "answer": entry("ANSWER.md"),
    "receipt": entry("receipt-v3.1.json"),
    "verify_receipt": entry("verify-receipt-v3.1.json"),
    "places": entry("places-v3.1.jsonl", lines=len(places)),
    "known_misfires": entry("known-misfires-v3.1.json"),
    "two_rows": entry("two-rows-v3.1.json"),
    "strike_list": entry("strike-list-v3.1.json"),
    "held_at_rest": {"field": "at_rest", "value": "held",
                     "says": "the lane's resting call (RULE.md, Amended 10): HELD_BY_CITATION, HELD_BY_POINTS and HELD_BY_CORPUS_ENTRY_WORD hold at rest; every other class stands",
                     "places": len(held),
                     "by_zone": {z: sum(1 for p in held if p["zone"] == z) for z in sorted({p["zone"] for p in held})}},
    "keyed_by": {"fields": ["m", "key", "route", "work", "unit", "class"],
                 "says": ("a place is found on our zone by its row (m, key and words), its work and its verse unit, and "
                          "carries its class; the lane's token row is its own edition's and is never read here (the letter, "
                          "section 4: our commentary text may be another edition)")},
    "branches_off_at_rest": {"labels": ["WIDE_HOLD", "BRANCH_HELD_BY_CORPUS_POINTS_TIE"],
                             "says": "labelled on the places they would hold (branches) and off at rest; turning one on is the lane's call, so nothing is held by them",
                             "places": {b: sum(1 for p in places if b in (p.get("branches") or [])) for b in ["WIDE_HOLD", "BRANCH_HELD_BY_CORPUS_POINTS_TIE"]}},
    "works_not_served": not_served,
    "works_not_served_says": ("the works of the list's held places that no zone of this tree serves, each with why, as read "
                              "from the zones when this pin was written; the hold writes nothing for them and its check "
                              "holds the list to the zones as they stand"),
    "not_found": [],
    "not_found_says": "a held place of a served work that its verse on our zone does not carry under its key: none (23 November 2026)",
    "note": "every sha256 here is the one the relay's letter names for the file; the list is kept gzipped and weighed as what it holds (tools/pinned-v1.mjs)",
}
want_pin = (json.dumps(pin, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
wrote = []
os.makedirs(os.path.join(HOME, FOLDER), exist_ok=True)
for f, b in got.items():
    p = os.path.join(HOME, FOLDER, f + (".gz" if f in GZ else ""))
    if os.path.exists(p):
        have = open(p, "rb").read()
        if (gzip.decompress(have) if f in GZ else have) == b:
            continue
    open(p, "wb").write(gzip.compress(b, compresslevel=9, mtime=0) if f in GZ else b)
    wrote.append(p)
pp = os.path.join(HOME, "PIN.json")
if not os.path.exists(pp) or open(pp, "rb").read() != want_pin:
    open(pp, "wb").write(want_pin)
    wrote.append(pp)
print(f"held places · relay v221 · {len(places)} row-places, {len(held)} held at rest "
      f"({sum(1 for p in held if p['work'] in served)} in works this tree serves, "
      f"{sum(v['places_held'] for v in not_served.values())} in {len(not_served)} works it does not) · "
      + (f"wrote {len(wrote)} file(s)" if wrote else "nothing to write"))
