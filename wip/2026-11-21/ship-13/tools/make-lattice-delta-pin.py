# Ship 13: the pin of the corpus lane's lattice delta (relay v208). Copies the rule and the two receipts into the tree
# byte for byte and names the three lists by the bytes the lane's letter and receipt name.
# python3 -I make-lattice-delta-pin.py <reader dir> <the lane's delta-v13-v1 folder> <the letter>
import sys, os, json, hashlib, gzip, shutil
reader, src, letter = sys.argv[1], sys.argv[2], sys.argv[3]
home = os.path.join(reader, "data", "lattice-delta"); folder = "delta-v13-v1"
os.makedirs(os.path.join(home, folder), exist_ok=True)
def named(path, lines=False):
    b = open(path, "rb").read()
    d = {"file": os.path.basename(path), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    if lines:
        t = gzip.decompress(b) if path.endswith(".gz") else b
        d["lines"] = t.count(b"\n")
    return d
kept = {}
for k, f in (("rule", "RULE.md"), ("receipt", "receipt-v1.json"), ("verify_receipt", "verify-receipt-v1.json")):
    shutil.copyfile(os.path.join(src, f), os.path.join(home, folder, f)); kept[k] = named(os.path.join(home, folder, f))
receipt = json.load(open(os.path.join(src, "receipt-v1.json"), encoding="utf-8"))
said = {o["file"]: o for o in receipt["outputs"]}
lists = {}
for k, f, lands, says in (
    ("names_this_verse", "names-this-verse-delta-v1.jsonl.gz", True,
     "one line for each entry or span card of lattice v12 that gains a name: the whole widened list of the cards that name the verse (TAHOT's and MACULA's readings at the verse, each by the row it was read from). The projection reads a listed entry's list in place of lattice v12's"),
    ("grade_v5", "grade-v5-delta-v1.jsonl.gz", True,
     "one line for each entry of lattice v12 some card of which the page's pointing grade v5 grades otherwise than the lattice: each card, its grade in the lattice and its grade by the page's rule. The projection moves each named card to the page's grade"),
    ("untagged_places", "untagged-places-v1.jsonl", False,
     "one line for each place of lattice v12 whose core carries no tag, with the entries of MACULA's lemma as the lane reads them from this lane's rule"),
):
    d = named(os.path.join(src, f), lines=True)
    o = said.get(f)
    if not o or o["bytes"] != d["bytes"] or o["sha256"] != d["sha256"]: sys.exit("the lane's receipt does not name " + f + " by these bytes")
    d["lands"] = lands; d["says"] = says
    if not lands: d["why_not"] = "this lane's projection writes the entries of MACULA's lemma itself (te, entry-by-lemma-rule-v1, 18 November 2026) from the store as served, at a word that carries a headword of its own; the list was read from the store of 20 November, so it is counted beside the zones and written nowhere. The list also names a lemma at 105 plain words the zones give no headword (the places our text spells otherwise than the text MACULA follows). Asking those places the entries of that lemma was measured on 21 November 2026 and not landed: the reading that leads there would move at 32 of them, and mostly for the worse (Genesis 19:20 «and/ she» to «and/ he», Esther 4:1 «great» to «loud»), because a row of the place's entry stands whatever its points and these places carry no pieces of their own to lead. They wait for their pieces (the spelling bridge, relay v202)"
    lists[k] = d
lb = open(letter, "rb").read()
pin = {
    "schema_version": "LATTICE_DELTA_PIN_V1",
    "what": "the corpus lane's delta over lattice v12 (relay v208): three lists keyed to the lattice's own lines by book, position (j) and entry. The rule and the two receipts are kept here byte for byte in the folder the lane keeps them in. The lists stay on the lane's store, as the lattice does, and are read through --lattice-delta only as the bytes named here. tools/project-lattice-v12-v1.mjs applies the lists that land as it reads each position, and each book's sidecar says what it applied",
    "relay": "v208",
    "of": "20 November 2026",
    "letter": "r2:mishkan/v2/letters/moses-lattice-delta-v1/FOR-ELIJAH-v208.md",
    "letter_sha256": hashlib.sha256(lb).hexdigest(),
    "from": "r2:mishkan/v2/ledgers/all/lattice-delta/delta-v13-v1/ (the private store)",
    "over": "lattice v12 (r2:mishkan/moses-ledgers/lattice-v12/), each book's files as its own receipt names them",
    "folder": folder,
    **kept,
    "lists": lists,
}
open(os.path.join(home, "PIN.json"), "w", encoding="utf-8").write(json.dumps(pin, ensure_ascii=False, indent=1) + "\n")
print("pinned:", {k: (v["lines"], v["lands"]) for k, v in lists.items()})
