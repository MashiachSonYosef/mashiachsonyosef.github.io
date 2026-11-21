# Ship 13: the read words' pin takes the corpus lane's amendment (relay v192.1). The amended list, the one-line list of
# lost tags, the amendment's rule and its two receipts are kept byte for byte in the folder the lane keeps them in; the
# list of relay v192 they amend leaves the tree and stays named by its bytes. The hold at Psalms 10:10 is lifted: the
# amended line carries the edition's letters.
# python3 -I make-read-words-pin.py <reader dir> <the lane's read-words-v1.1 folder> <the letter of v192.1>
import sys, os, json, hashlib, shutil
reader, src, letter = sys.argv[1], sys.argv[2], sys.argv[3]
home = os.path.join(reader, "data", "read-words"); new = "read-words-v1.1"
pin_path = os.path.join(home, "PIN.json")
pin = json.load(open(pin_path, encoding="utf-8"))
if pin.get("amendment"): sys.exit("the pin carries an amendment already")
os.makedirs(os.path.join(home, new), exist_ok=True)
def named(f, lines=False):
    shutil.copyfile(os.path.join(src, f), os.path.join(home, new, f))
    b = open(os.path.join(home, new, f), "rb").read()
    d = {"file": f, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    if lines: d["lines"] = b.count(b"\n")
    return d
was = dict(pin["read_words"])
old_file = os.path.join(home, pin["folder"], was["file"])
ob = open(old_file, "rb").read()
if len(ob) != was["bytes"] or hashlib.sha256(ob).hexdigest() != was["sha256"]: sys.exit("the list of relay v192 on disk is not the bytes the pin names")
receipt = json.load(open(os.path.join(src, "receipt-v1.1.json"), encoding="utf-8"))
read = receipt["inputs"]["v192 list"]
if read["bytes"] != was["bytes"] or read["sha256"] != was["sha256"]: sys.exit("the amendment's receipt did not read the list the pin names")
held = pin.get("pieces_held") or []
if [(h["book"], h["ref"]) for h in held] != [("psalms", "10:10")]: sys.exit("the pin holds other places than Psalms 10:10")
out = {}
for k, v in pin.items():
    if k == "what":
        out[k] = ("the corpus lane's list of the read words at the 28 places written one way and read another whose read form holds two or three words: for each of the 57 read words, "
                  "the place's own word number, its main tag as TAHOT writes it and its pieces as TAHOT gives them (relay v192 as amended by relay v192.1: the word place on every line, and at Psalms 10:10 "
                  "the edition's letters on the piece TAHOT spells otherwise); beside it the lane's two facts for the stroke at each of the 16 places of relay v179; and the amendment's one-line list of "
                  "the tag a lattice piece lost (Genesis 14:17, where TAHOT writes its mark inside the word). Kept here byte for byte in the folders the lane keeps them in, with their rules, their "
                  "receipts and the counts. tools/apply-read-words-v1.mjs writes each read word's tag on its own region of the zone and, at the places the lattice gives no pieces, the pieces, and at a "
                  "lost tag's place TAHOT's words on the piece; tools/project-lattice-v12-v1.mjs reads a lost tag as the lattice piece's own; the reader asks each read word its own entry and draws "
                  "the place's line from the pieces. The stroke facts write nothing: they are held equal to the list data/paseq-place/PIN.json names, which the zones already carry")
    elif k == "read_words":
        out[k] = {"folder": new, **named("read-word-tags-v1.1.jsonl", lines=True), "relay": "v192.1",
                  "amends": {"relay": "v192", "file": was["file"], "bytes": was["bytes"], "sha256": was["sha256"], "lines": was["lines"],
                             "says": "the list of relay v192, which the amendment's own receipt names as the list it read; it is not kept in this tree"}}
        out["lost_tags"] = {"folder": new, **named("lost-tags-v1.1.jsonl", lines=True), "relay": "v192.1",
                            "says": "one line for each TAHOT row whose Hebrew goes on after its first backslash and that no read word reads: the lattice piece that lost TAHOT's tag and English, as it stands and as it is set"}
    elif k == "pieces_held":
        out[k] = []
        out["holds_lifted"] = [{"book": h["book"], "ref": h["ref"], "lattice_v12": h["lattice_v12"], "held": h["holds"], "from": "15 November 2026", "lifted_by": "relay v192.1",
                                "why": "the amended line's piece carries the edition's letters, TAHOT's spelling beside them, so the place's pieces spell its read words; its two tags land with its pieces"} for h in held]
    elif k == "counts":
        out[k] = v
        lb = open(letter, "rb").read()
        out["amendment"] = {"relay": "v192.1", "of": "20 November 2026", "letter": "r2:mishkan/v2/letters/moses-read-words-v1/FOR-ELIJAH-v192.1.md", "letter_sha256": hashlib.sha256(lb).hexdigest(),
                            "from": "r2:mishkan/v2/ledgers/all/read-words/read-words-v1.1/ (the private store)", "folder": new,
                            "rule": named("RULE.md"), "receipt": named("receipt-v1.1.json"), "verify_receipt": named("verify-receipt-v1.1.json"),
                            "says": "it amends the rule of relay v192 in three points and changes nothing else: a word place on every line, the edition's letters at Psalms 10:10, and the lost tag"}
    else:
        out[k] = v
os.remove(old_file)
open(pin_path, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
print("pinned:", out["read_words"]["file"], out["read_words"]["lines"], "lines ·", out["lost_tags"]["file"], out["lost_tags"]["lines"], "line · the hold at Psalms 10:10 lifted · the list of v192 left the tree")
