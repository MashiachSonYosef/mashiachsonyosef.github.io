# wire the corpus lane's seven reissues of 6 November night into data/ledgers-v1 and the manifest
import json, hashlib, shutil, os, sys
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
D = f"{S}/dl-moses2/corpus-lane-builds/moses-provider-declarations-v1"
R = f"{S}/pt/reader"
relays = [("v110.2", "wikisource_strongs_explicit_forms", "v1.1-r3"), ("v124.2", "classical_hebrew_words", "v1.1-r3"), ("v118.1", "hiperbiblia_sdbh", "v1.1-r2"),
          ("v113.1", "conceptnet_5_7_hebrew_english_cc_by_sa_4_0", "v1.1-r2"), ("v128.2", "conceptnet_5_7_hebrew_english_cc_by_4_0", "v1.1-r3"),
          ("v111.1", "kaikki_wiktionary_hebrew", "v1.1-r2"), ("v129.1", "kaikki_wiktionary_aramaic", "v1.1-r2")]
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
mp = f"{R}/data/ledgers-v1/manifest.json"
m = json.load(open(mp, encoding="utf-8"))
moved = []
for relay, key, folder in relays:
    src = f"{D}/{key}/{folder}"
    dst = f"{R}/data/ledgers-v1/{key}"
    os.makedirs(dst, exist_ok=True)
    shutil.copyfile(f"{src}/{key}.declaration.json", f"{dst}/declaration.json")
    shutil.copyfile(f"{src}/{key}.classifier.mjs", f"{dst}/classifier.mjs")
    decl = json.load(open(f"{dst}/declaration.json", encoding="utf-8"))
    e = m["ledgers"][key]
    was = {"relay": e["relay"], "shapes": e["shapes"], "branches": e["branches"], "routes_declared": e["routes_declared"]}
    e["relay"] = relay
    e["declaration"] = {"file": f"data/ledgers-v1/{key}/declaration.json", "sha256": sha(f"{dst}/declaration.json")}
    e["classifier"] = {"file": f"data/ledgers-v1/{key}/classifier.mjs", "sha256": sha(f"{dst}/classifier.mjs")}
    e["m_ids_declared"] = list(decl.get("m_ids") or [])
    e["shapes"] = len(decl.get("shapes") or [])
    e["branches"] = [b["id"] for b in (decl.get("branches") or [])]
    e["routes_declared"] = decl.get("routes")
    if relay == "v128.2":
        e["note"] = "a note in place of a ledger (v128.2): after the retext of 6 November no served route of this source holds a mark, so there are 0 shapes and no branch; every row prints whole"
    moved.append((key, was, {"relay": relay, "shapes": e["shapes"], "branches": e["branches"], "routes_declared": e["routes_declared"]}))
m["reissued_on_2026_11_07"] = {relay: key for relay, key, _ in relays}
json.dump(m, open(mp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(mp, "a", encoding="utf-8").write("\n")
for key, was, now in moved:
    print(f"{key}: {was['relay']} -> {now['relay']} · shapes {was['shapes']} -> {now['shapes']} · branches {len(was['branches'])} -> {len(now['branches'])} · routes {was['routes_declared']} -> {now['routes_declared']}")
