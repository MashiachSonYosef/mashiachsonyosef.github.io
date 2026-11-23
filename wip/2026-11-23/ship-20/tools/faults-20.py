#!/usr/bin/env python3
# Ship 20 (23 November 2026): each law ship 20 changes, made to fail once by a deliberate fault on the sandbox, then the
# fault undone byte for byte (every file touched is held to its sha256 from before). Usage: faults-20.py <reader dir> <log>
import gzip, hashlib, json, os, shutil, subprocess, sys

R, LOG = sys.argv[1:3]
os.chdir(R)
ENV = dict(os.environ)
log = open(LOG, "w", encoding="utf-8")
def say(t): print(t); log.write(t + "\n"); log.flush()
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
def check(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, env=ENV)
    return r.returncode, [l for l in r.stdout.splitlines() if l.startswith("FAIL")]
def jload(p): return json.load(open(p, encoding="utf-8"))
def jsave(p, d, indent=1, end="\n"): open(p, "w", encoding="utf-8").write(json.dumps(d, indent=indent, ensure_ascii=False) + end)
def gzload(p): return json.loads(gzip.decompress(open(p, "rb").read()))
def gzsave(p, d): open(p, "wb").write(gzip.compress(json.dumps(d).encode("utf-8"), 9))
NAMES = ["node", "tools/check-names-gate-v1.mjs"]
BRIDGE = ["node", "tools/check-spelling-bridge-v1.mjs", "--node"]
def fault(name, law, cmd, files, made, apply):
    before = {f: sha(f) for f in files}
    for f in files: shutil.copyfile(f, f + ".fault-backup")
    try:
        apply()
        code, fails = check(cmd)
        say(f"deliberate fault ({law}): {name}")
        for l in fails: say("  " + l[:300])
        say(f"  check exit {code} · the law {'FAILS' if any(l.startswith('FAIL  ' + law) for l in fails) else 'DOES NOT FAIL'}")
    finally:
        for f in files: shutil.move(f + ".fault-backup", f)
        for f in made:
            if os.path.exists(f): os.remove(f)
    ok = all(sha(f) == h for f, h in before.items()) and not any(os.path.exists(f) for f in made)
    code, fails = check(cmd)
    say(f"  undone: {len(files)} file(s) byte for byte {'as before' if ok else 'NOT as before'}{', ' + str(len(made)) + ' made and taken away' if made else ''} · check exit {code}{' · ' + fails[0][:200] if fails else ''}")

PIN = "data/names/PIN.json"
# N1: relay v213's rule named as another file of its own bytes: the receipt names another rule than the pin
def n1():
    shutil.copyfile("data/names/names-v2/RULE.md", "data/names/names-landed-v1/RULE-fault.md")
    p = jload(PIN); e = p["more_name_rows"][0]; e["rule"] = {"file": "RULE-fault.md", "bytes": os.path.getsize("data/names/names-landed-v1/RULE-fault.md"), "sha256": sha("data/names/names-landed-v1/RULE-fault.md")}; jsave(PIN, p)
fault("relay v213's rule pinned as another file (names v2's RULE.md, its own bytes)", "N1", NAMES, [PIN], ["data/names/names-landed-v1/RULE-fault.md"], n1)
# N2: relay v219's list of rows pinned as its list of common-word table rows (its receipt names that file too)
def n2():
    src = os.environ["V219"] + "/common-word-rows-tables-v1.jsonl"
    shutil.copyfile(src, "data/names/places-at-bridge-v1/common-word-rows-tables-v1.jsonl")
    p = jload(PIN); e = p["more_name_rows"][1]; b = open(src, "rb").read(); e["name_rows"] = {"file": "common-word-rows-tables-v1.jsonl", "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest(), "lines": b.count(b"\n")}; jsave(PIN, p)
fault("relay v219's list of rows pinned as its common-word list of the tables (120 rows; its receipt names that file too)", "N2", NAMES, [PIN], ["data/names/places-at-bridge-v1/common-word-rows-tables-v1.jsonl"], n2)
# N3: the mark taken off one of relay v219's rows in the store
def find_shard(m, text):
    for f in sorted(os.listdir("data/route-store/shards")):
        d = gzload("data/route-store/shards/" + f)
        for k, rows in d.items():
            for row in rows:
                if str(row[3]) == m and row[1] == text and len(row) > 10 and isinstance(row[10], dict) and row[10].get("name") == 1: return f, k, row[0]
    return None
hit = find_shard("M78", "Christ")
def n3():
    f, k, rank = hit; p = "data/route-store/shards/" + f; d = gzload(p)
    for row in d[k]:
        if row[0] == rank and str(row[3]) == "M78": del row[10]["name"]
    gzsave(p, d)
fault(f"the mark taken off relay v219's row M78 «Christ» in the store (shard {hit[0] if hit else '?'})", "N3", NAMES, ["data/route-store/shards/" + hit[0]] if hit else [], [], n3)
# N4: the index's record of relay v219's list miscounts what it marked
IX = "data/route-store/index.json"
def n4():
    d = jload(IX); d["name_rows"]["more_lists"][1]["totals"]["rows_marked"] = 5; jsave(IX, d, end="")
fault("the index's record of relay v219's list says 5 rows marked, not 6", "N4", NAMES, [IX], [], n4)
# N5: the name mark taken off Ezekiel 27:6 word 11, the place relay v219 adds
def n5():
    p = "data/zones/ezekiel.bin"; d = gzload(p)
    sec = [s for s in d["sections"] if s["label"] == "27:6"][0]; ws = [w for w in sec["words"] if not w.get("mark")]; del ws[10]["np"]; gzsave(p, d)
fault("the name mark taken off Ezekiel 27:6 word 11 on its zone", "N5", NAMES, ["data/zones/ezekiel.bin"], [], n5)
# N7: one line of the addendum (rows names v1 counted and did not list) put on relay v219's list of rows, re-pinned
def n7():
    add = [json.loads(l) for l in open("data/names/names-v177-addendum-v1/names-v177-addendum-v1.jsonl", encoding="utf-8")][0]
    p = "data/names/places-at-bridge-v1/name-rows-tables-v1.jsonl"
    b = open(p, "rb").read() + (json.dumps({"k": add["k"], "rank": add["rank"], "m": add["m"], "sha": add["sha"]}, ensure_ascii=False) + "\n").encode("utf-8")
    open(p, "wb").write(b)
    d = jload(PIN); d["more_name_rows"][1]["name_rows"].update({"bytes": len(b), "sha256": hashlib.sha256(b).hexdigest(), "lines": b.count(b"\n")}); jsave(PIN, d)
fault("an addendum row's line put on relay v219's list of rows, the pin re-made to the bytes", "N7", NAMES, [PIN, "data/names/places-at-bridge-v1/name-rows-tables-v1.jsonl"], [], n7)
# B1: bridge v1.2 with one role set back to v1.1's (Numbers 33:35 word 4, piece 1), re-pinned
BP = "data/spelling-bridge/PIN.json"; BL = "data/spelling-bridge/bridge-v1.2/bridge-places-v1.2.jsonl"
def b1():
    ls = open(BL, encoding="utf-8").read().split("\n")
    for i, l in enumerate(ls):
        if '"book":"numbers"' in l and '"place":"33:35:4"' in l:
            d = json.loads(l); d["pieces"][0]["role"] = "core"; ls[i] = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    b = "\n".join(ls).encode("utf-8"); open(BL, "wb").write(b)
    s = open(BP, encoding="utf-8").read()
    s = s.replace('"places": {"file": "bridge-places-v1.2.jsonl", "bytes": 2234102, "sha256": "873c4df5ff14bb5ac2cc055d206dc3fdf49adc55405c8ecda53e9564a77d97aa"', '"places": {"file": "bridge-places-v1.2.jsonl", "bytes": %d, "sha256": "%s"' % (len(b), hashlib.sha256(b).hexdigest()))
    open(BP, "w", encoding="utf-8").write(s)
fault("bridge v1.2's Numbers 33:35 word 4, piece 1's role set back to v1.1's, the pin re-made to the bytes", "B1", BRIDGE, [BP, BL], [], b1)
# B3: one zone's record of the bridge names v1.1's list again
def b3():
    p = "data/zones/ezekiel.bin"; d = gzload(p); d["emitted_from"]["spelling_bridge"]["list"]["sha256"] = "9a0dc88362101a3400fc1bd886f35606f3d230a34277cde3b3f1e64bdf134460"; gzsave(p, d)
fault("Ezekiel's record of the bridge names v1.1's list again", "B3", BRIDGE, ["data/zones/ezekiel.bin"], [], b3)
# B6: one laid piece's words on its zone not its part as v1.2's line writes it
def b6():
    p = "data/zones/ezekiel.bin"; d = gzload(p)
    sec = [s for s in d["sections"] if s["label"] == "27:6"][0]; w = [x for x in sec["words"] if not x.get("mark")][10]
    if not isinstance(w.get("pg"), list) or not w["pg"]: raise SystemExit("Ezekiel 27:6 word 11 carries no pieces")
    w["pg"][0]["g"] = w["pg"][0]["g"] + " x"; gzsave(p, d)
fault("Ezekiel 27:6 word 11's laid piece's words changed on its zone", "B6", BRIDGE, ["data/zones/ezekiel.bin"], [], b6)
