#!/usr/bin/env python3
# Ship 20's measure (23 November 2026), read-only: what moves, as a table of tab-separated lines and its counts.
#   names    every placing (a word's key, or a piece's key on the word) of the 28 rows ship 20 marks where the names
#            gate's verdict moves (stands -> withheld at a place that is not a name), and names v2's rows at the place
#            relay v219 adds (withheld -> stands); with whether every other gate of the card leaves the row there, the
#            resting line over the word before (main, S/old) and after (the sandbox), and the card at rest (and with
#            the dictionaries that rest shut opened) before and after where it was read
#   line     every resting line that moves, all works (S/s7w/lines-diff.mjs)
#   commentary  every commentary zone's key whose baked line moves (ship 16's commentary-gloss-diff)
#   bridge   every place bridge v1.2 lays that v1.1 did not (none), and the 42 places held for STEP's «}+» tag, by the
#            hold they stand under now
# Usage: make-what-moves-20.py <old reader> <new reader> <log dir>
import gzip, json, os, sys, collections

OLD, NEW, LOGS = sys.argv[1:4]
J = lambda p: json.load(open(p, encoding="utf-8"))
flips = J(os.path.join(LOGS, "name-flips.json"))
recs = {}
def rec(root, book):
    k = (root, book)
    if k not in recs:
        p = os.path.join(root, "data", "resting-lines", f"{book}.json.gz")
        recs[k] = json.loads(gzip.decompress(open(p, "rb").read())) if os.path.exists(p) else None
    return recs[k]
def unit(root, book, label, e):
    r = rec(root, book)
    if not r: return None
    for lab, units in r.get("sections", []):
        if lab == label:
            for u in units or []:
                if u[0] <= e < u[0] + max(1, u[1]): return u
    return None
cards = {}
for state in ("rest", "open"):
    for when in ("before", "after"):
        for pre in ("cards", "cards2"):
            p = os.path.join(LOGS, f"{pre}-{when}-{state}.json")
            if os.path.exists(p):
                for c in J(p):
                    if "si" in c: cards[(when, state, c["book"], c["si"], c["e"])] = c
def card(when, state, p):
    c = cards.get((when, state, p["book"], p["si"], p["e"]))
    if not c: return ""
    if c.get("fault"): return "fault: " + c["fault"]
    return f"pressed {'/'.join(c.get('pressed') or []) or '-'} · {len(c.get('pills') or [])} pills · {c.get('held', '')}"
rows, counts = [], collections.OrderedDict()
H = ["what", "book", "place", "entry", "key", "how", "relay", "m", "rank", "row", "name_place_before", "name_place_after", "gate_before", "gate_after", "entry_gate", "other_gates_leave_it",
     "line_before", "credit_before", "line_after", "credit_after", "line_moved", "card_rest_before", "card_rest_after", "card_open_before", "card_open_after"]
def out(what, p, extra):
    ua, ub = unit(OLD, p["book"], p["label"], p["e"]), unit(NEW, p["book"], p["label"], p["e"])
    moved = (ua or [None] * 4)[2:4] != (ub or [None] * 4)[2:4]
    rows.append([what, p["book"], f"{p['label']}:{p['n']}", str(p["e"]), p["k"], p["how"], extra.get("relay", ""), p["m"], str(p["rank"]), p["text"], str(p["name_place_before"]), str(p["name_place_after"]),
                 p["gate_before"], p["gate_after"], str(p.get("entry")), str(p["other_gates_leave_it"]), ua[2] if ua else "", ua[3] if ua else "", ub[2] if ub else "", ub[3] if ub else "", str(moved),
                 card("before", "rest", p), card("after", "rest", p), card("before", "open", p), card("after", "open", p)])
    return moved
P = [p for p in flips["places"] if "fault" not in p]
moving = [p for p in P if p["gate_before"] != p["gate_after"]]
lm = 0
for p in moving: lm += out("names", p, p)
for p in flips["v2_at_added"]: lm += out("names v2 at the added place", p, {"relay": "v198"})
counts["names"] = {
    "placings_of_the_28_rows": len(P),
    "places_of_the_28_rows": len({(p["book"], p["label"], p["n"]) for p in P}),
    "verdict_moves_placings": len(moving),
    "verdict_moves_places": len({(p["book"], p["label"], p["n"]) for p in moving}),
    "verdict_moves_by_row": dict(collections.Counter(f"{p['relay']} {p['m']} rank {p['rank']} {p['text']}" for p in moving).most_common()),
    "verdict_moves_where_the_entry_gate_leaves_the_row_placings": sum(1 for p in moving if p.get("entry") != "other"),
    "verdict_moves_where_the_entry_gate_leaves_the_row_places": len({(p["book"], p["label"], p["n"]) for p in moving if p.get("entry") != "other"}),
    "verdict_moves_where_every_other_gate_leaves_the_row_placings": sum(1 for p in moving if p["other_gates_leave_it"]),
    "verdict_moves_where_every_other_gate_leaves_the_row_places": len({(p["book"], p["label"], p["n"]) for p in moving if p["other_gates_leave_it"]}),
    "rows_standing_where_they_stood": len(P) - len(moving),
    "names_v2_rows_at_the_added_place": len(flips["v2_at_added"]),
    "of_these_placings_whose_resting_line_moves": lm,
}
ld = J(os.path.join(LOGS, "round", "lines-diff.json"))
for m in ld["moved"]:
    rows.append(["line", m["where"].split(" ")[0], m["where"], "", m.get("k") or "", "", "", "", "", "", "", "", "", "", "", "", (m["was"] or ["", ""])[0], (m["was"] or ["", ""])[1], (m["now"] or ["", ""])[0], (m["now"] or ["", ""])[1], "True", "", "", "", ""])
def differs(st, p):
    a, b = cards.get(("before", st, p["book"], p["si"], p["e"])), cards.get(("after", st, p["book"], p["si"], p["e"]))
    if not a or not b: return None
    return {"line": a.get("line") != b.get("line"), "pills": [x[0] for x in a.get("pills") or []] != [x[0] for x in b.get("pills") or []], "pressed": a.get("pressed") != b.get("pressed"), "held": a.get("held") != b.get("held")}
seenp = {}
for p in moving + flips["v2_at_added"]: seenp[(p["book"], p["si"], p["e"])] = p
for st in ("rest", "open"):
    ds = [d for d in (differs(st, p) for p in seenp.values()) if d]
    counts["names"][f"cards_read_{st}"] = {"places": len(ds), "line_moves": sum(d["line"] for d in ds), "pills_move": sum(d["pills"] for d in ds), "pressed_moves": sum(d["pressed"] for d in ds), "held_back_line_moves": sum(d["held"] for d in ds)}
counts["lines"] = {"totals": ld["totals"], "by_credit": ld["by_credit"]}
cm = [l.rstrip("\n").split("\t") for l in open(os.path.join(LOGS, "round", "commentary.log"), encoding="utf-8") if "\t" in l]
for c in cm: rows.append(["commentary", c[0], c[3] if len(c) > 3 else "", "", c[1], "", "", "", "", c[2], "", "", "", "", "", "", "", "", "", "", "True", "", "", "", ""])
counts["commentary"] = {"keys_moved": len(cm)}
b = J(os.path.join(LOGS, "bridge-held.json"))
for x in b["each"]:
    rows.append(["bridge", x["book"], x["place"], "", "", "", "v220", "", "", f"{x['cls']} · {x['use']}", "", "", f"held: {x['was']}", f"held: {x['now']}", "", "", "", "", "", "", "False", "", "", "", ""])
counts["bridge"] = {"places_v1_2_lays_that_v1_1_did_not": b["newly_laid"], "the_42_by_the_hold_they_stand_under_now": b["by"], "laid": b["laid"], "zones_whose_record_moves_to_v1_2": b["zones_rewritten"]}
with open(os.path.join(LOGS, "what-moves.tsv"), "w", encoding="utf-8") as f:
    f.write("\t".join(H) + "\n")
    for r in rows: f.write("\t".join(x.replace("\t", " ").replace("\n", " ") for x in r) + "\n")
json.dump(counts, open(os.path.join(LOGS, "what-moves-counts.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(counts, ensure_ascii=False, indent=1))
