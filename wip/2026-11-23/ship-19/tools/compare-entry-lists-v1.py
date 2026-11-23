#!/usr/bin/env python3
"""Ship 19: the two reissues of English Wiktionary's list name the same rows, line by line (23 November 2026).

English Wiktionary's entry list (relay v203) has two reissues. Relay v211 widened STEP's letters (t) and said it keeps
v203's nine columns untouched but for t inside facts_under_entry_ledger, adding three columns (t_v203, t_added,
t_added_why). Relay v218 changed n and b on 126 lines named in its changes-v1.1.jsonl, with what_changes and class, and
said every other line is v203's byte for byte, t as v203 gave it. Ship 19 lands t from v211's list and n and b from
v218's. That is sound only if the two lists name the same rows in the same order and each differs from v203 only where
its relay says. This holds every line of all three to that, and v218's reissue of the other list (relay v204) to v204's
the same way. It stops at the first kind of difference and says where; it decides nothing.

It also proves what the landing needs of the two read together: every letter v211 gives stands on a number v218's
line gives (a lettered tag is of a number the row carries).

Usage: python3 -I compare-entry-lists-v1.py <v203 list> <v211 list> <v218 English Wiktionary list> <v204 list>
       <v218 list for v204> <v218 changes-v1.1.jsonl> <out.json>
"""
import json
import sys
from collections import Counter

V203, V211, V218W, V204, V218C, CHANGES, OUT = sys.argv[1:8]
faults = []
report = {}


def fault(why):
    faults.append(why)
    if len(faults) >= 20:
        finish()


def finish():
    report["faults"] = faults
    report["verdict"] = "THE SAME ROWS, AND EACH DIFFERS ONLY WHERE ITS RELAY SAYS" if not faults else "STOP: THEY DO NOT"
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(report["verdict"])
    for x in faults[:20]:
        print("  " + x)
    sys.exit(0 if not faults else 1)


def read(path):
    b = open(path, "rb").read()
    t = b.decode("utf-8")
    assert t.endswith("\n"), path
    head, *body = t[:-1].split("\n")
    return head.split("\t"), [line.split("\t") for line in body], b


def facts(cell):
    return json.loads(cell)


def without(f, keys):
    return {k: v for k, v in f.items() if k not in keys}


changes = [json.loads(l) for l in open(CHANGES, encoding="utf-8")]
by_list = {"v203": {}, "v204": {}}
for c in changes:
    by_list[c["list"]][c["line"]] = c

# ---- English Wiktionary: v203, v211, v218 -------------------------------------------------------------------------
h3, b3, _ = read(V203)
h11, b11, _ = read(V211)
h18, b18, _ = read(V218W)
NINE = ["key", "rank", "m_id", "sha16", "route_text", "facts_now", "facts_under_entry_ledger", "what_changes", "class"]
if h3 != NINE:
    fault(f"v203's header is not the nine columns: {h3}")
if h18 != h3:
    fault(f"v218's header is not v203's: {h18}")
if h11[:9] != h3 or h11[9:] != ["t_v203", "t_added", "t_added_why"]:
    fault(f"v211's header is not v203's nine and its three: {h11}")
if not (len(b3) == len(b11) == len(b18) == 54261):
    fault(f"lines: v203 {len(b3)}, v211 {len(b11)}, v218 {len(b18)}; each relay says 54,261")
# the line numbers in v218's changes: find whether they count the header
line_base = None
for base in (1, 2):
    if all(0 <= ln - base < len(b3) and b3[ln - base][0] == c["key"] and int(b3[ln - base][1]) == c["rank"] and b3[ln - base][2] == c["m"] and b3[ln - base][3] == c["sha16"] for ln, c in by_list["v203"].items()):
        line_base = base
        break
if line_base is None:
    fault("v218's changes name v203 lines that are not the rows they say at either count")
    finish()
report["changes_line_numbers"] = "the body's own count, the header not counted" if line_base == 1 else "the file's count, the header counted"
tally = Counter()
t_not_on_a_number = []
for i, (c3, c11, c18) in enumerate(zip(b3, b11, b18)):
    at = f"line {i + 2} of the files"
    if len(c3) != 9 or len(c18) != 9 or len(c11) != 12:
        fault(f"{at}: fields v203 {len(c3)}, v211 {len(c11)}, v218 {len(c18)}")
        continue
    # the same row, by every column a row is named by: key, rank, m id, sha16, route text, and the facts it then carried
    for j, name in enumerate(NINE[:6]):
        if not (c3[j] == c11[j] == c18[j]):
            fault(f"{at}: {name} differs between the lists")
    tally["rows named alike"] += 1
    f3, f11, f18 = facts(c3[6]), facts(c11[6]), facts(c18[6])
    # v211: only t, and its t_v203 is v203's t
    if without(f11, {"t"}) != without(f3, {"t"}):
        fault(f"{at}: v211 changes a fact other than t")
    if c11[7] != c3[7] or c11[8] != c3[8]:
        fault(f"{at}: v211 changes what_changes or class")
    if json.loads(c11[9] or "null") != f3.get("t"):
        if not (c11[9] in ("", "[]", "null") and "t" not in f3):
            fault(f"{at}: v211's t_v203 is not v203's t")
    if f11.get("t") != f3.get("t"):
        tally["lines whose t v211 widens"] += 1
    # v218: the line is v203's byte for byte unless its changes name it; then n and b only, with what_changes and class
    ch = by_list["v203"].get(i + line_base)
    if ch is None:
        if c18 != c3:
            fault(f"{at}: v218 changes a line its changes do not name")
        continue
    tally["lines v218 changes"] += 1
    tally[f"lines v218 changes by {ch['rule']}"] += 1
    if ch["route_text"] != c3[4]:
        fault(f"{at}: v218's changes name another route text")
    if c3[6] != ch["v1"]["facts"] or c3[7] != ch["v1"]["what_changes"] or c3[8] != ch["v1"]["class"]:
        fault(f"{at}: v218's changes say v203 gave otherwise")
    if c18[6] != ch["v1_1"]["facts"] or c18[7] != ch["v1_1"]["what_changes"] or c18[8] != ch["v1_1"]["class"]:
        fault(f"{at}: v218's line is not what its changes say")
    if without(f18, {"n", "b"}) != without(f3, {"n", "b"}):
        fault(f"{at}: v218 changes a fact other than n and b (t stays v203's)")
    for k in ("n", "b"):
        if f18.get(k) != f3.get(k):
            tally[f"lines whose {k} v218 changes"] += 1
    if c18[7] != c3[7]:
        tally["lines whose what_changes v218 changes"] += 1
    if c18[8] != c3[8]:
        tally["lines whose class v218 changes"] += 1
    if "t" in f11 and f11.get("t") != f3.get("t"):
        tally["lines both reissues change (t by v211, n or b by v218)"] += 1
# the two read together, as ship 19 lands them: t from v211, n and b from v218
for i, (c11, c18) in enumerate(zip(b11, b18)):
    f11, f18 = facts(c11[6]), facts(c18[6])
    n = set(f18.get("n") or [])
    for t in f11.get("t") or []:
        digits = t[1:].rstrip("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").lstrip("0")
        if f"H{digits}" not in n:
            t_not_on_a_number.append(f"line {i + 2}: {t}")
    landed = {k: v for k, v in (("n", f18.get("n")), ("t", f11.get("t")), ("b", f18.get("b"))) if v}
    tally["lines giving n"] += 1 if landed.get("n") else 0
    tally["lines giving t"] += 1 if landed.get("t") else 0
    tally["lines giving b"] += 1 if landed.get("b") else 0
    tally["lines giving b and no n"] += 1 if landed.get("b") and not landed.get("n") else 0
    tally["lines giving nothing that lands"] += 0 if landed else 1
if t_not_on_a_number:
    fault(f"{len(t_not_on_a_number)} letters of v211 stand on no number v218's line gives: {t_not_on_a_number[:5]}")
report["english_wiktionary"] = {"v203": V203, "v211": V211, "v218": V218W, "lines": len(b3), **dict(sorted(tally.items()))}

# ---- the other list: v204 and v218's reissue -------------------------------------------------------------------------
h4, b4, _ = read(V204)
h4n, b4n, _ = read(V218C)
t2 = Counter()
if h4n != h4:
    fault(f"v218's reissue of v204's list opens with another header: {h4n}")
if not (len(b4) == len(b4n) == 9192):
    fault(f"lines: v204 {len(b4)}, v218 {len(b4n)}; each relay says 9,192")
iF = h4.index("facts_under_entry_ledger_v1") if "facts_under_entry_ledger_v1" in h4 else None
for i, (c4, c4n) in enumerate(zip(b4, b4n)):
    at = f"line {i + 2} of the files"
    if c4[:5] != c4n[:5]:
        fault(f"{at}: the row (key, rank, m id, route text, facts then) differs")
    ch = by_list["v204"].get(i + line_base)
    if ch is None:
        if c4n != c4:
            fault(f"{at}: v218 changes a line of v204's its changes do not name")
        continue
    t2["lines v218 changes"] += 1
    t2[f"lines v218 changes by {ch['rule']}"] += 1
    if c4[0] != ch["key"] or int(c4[1]) != ch["rank"] or c4[2] != ch["m"] or c4[3] != ch["route_text"]:
        fault(f"{at}: v218's changes name another row of v204's list")
    if c4[iF] != ch["v1"]["facts"] or c4n[iF] != ch["v1_1"]["facts"] or c4n[6] != ch["v1_1"]["what_changes"] or c4n[7] != ch["v1_1"]["class"]:
        fault(f"{at}: the line is not what v218's changes say")
    f4, f4n = facts(c4[iF]), facts(c4n[iF])
    if without(f4n, {"n", "b"}) != without(f4, {"n", "b"}):
        fault(f"{at}: v218 changes a fact other than n and b")
for c4n in b4n:
    f = facts(c4n[iF])
    t2["lines giving n"] += 1 if f.get("n") else 0
    t2["lines giving b"] += 1 if f.get("b") else 0
    t2["lines giving t"] += 1 if f.get("t") else 0
    t2["lines giving b and no n"] += 1 if f.get("b") and not f.get("n") else 0
report["classical_and_hebrew_wiktionary"] = {"v204": V204, "v218": V218C, "lines": len(b4), **dict(sorted(t2.items()))}
named = sum(1 for c in changes if c["list"] == "v203") + sum(1 for c in changes if c["list"] == "v204")
report["changes_named"] = named
if tally["lines v218 changes"] + t2["lines v218 changes"] != named:
    fault(f"v218's changes name {named} lines and {tally['lines v218 changes'] + t2['lines v218 changes']} were met")
finish()
