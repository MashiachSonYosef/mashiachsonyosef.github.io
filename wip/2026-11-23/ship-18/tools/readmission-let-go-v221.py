# Ship 18 (23 November 2026): the re-admission's record follows the landings' pin. Relay v221 lets go the two lines
# of M78 that the pin held by their line (let_go on each held line of the record's list), so, for each returning
# source, the lines its list's pin still holds by their line (held_by_their_line) and the lines it held so and let go
# (held_lines_let_go) are counted here from the pin, never typed, and the record's counts say the same; a note says
# by which relay. tools/readmit-sources-v1.mjs and tools/check-readmission-v1.mjs hold both counts to the pin. Run again
# over a record that says it, it writes nothing. Usage: readmission-let-go-v221.py <reader>
import io, json, os, sys

R = sys.argv[1]
rp = os.path.join(R, "data", "readmission-v1.json")
raw = io.open(rp, encoding="utf-8").read()
rec = json.loads(raw)
lay = lambda p: json.dumps(p, ensure_ascii=False, indent=1) + "\n"
assert lay(rec) == raw, "the record's layout is not the one this script writes"
pin = json.load(io.open(os.path.join(R, "data", "landings", "PIN.json"), encoding="utf-8"))
lists = {l["id"]: l for l in pin["lists"]}
held_now = held_go = 0
for s in rec["sources"]:
    hl = [h for h in (lists[s["list"]].get("held_lines") or []) if h and h["m"] == s["m"]]
    s["held_by_their_line"] = sum(1 for h in hl if not h.get("let_go"))
    go = [h for h in hl if h.get("let_go")]
    if go:
        s["held_lines_let_go"] = len(go)
    else:
        s.pop("held_lines_let_go", None)
    held_now += s["held_by_their_line"]
    held_go += len(go)
c = rec["counts"]
items = list(c.items())
c.clear()
for k, v in items:
    if k == "rows_held_by_their_line_let_go":
        continue
    c[k] = held_now if k == "rows_held_by_their_line" else v
    if k == "rows_held_by_their_line" and held_go:
        c["rows_held_by_their_line_let_go"] = held_go
if held_go:
    relays = sorted({h["let_go"]["relay"] for l in rec["lists"] for h in (lists[l].get("held_lines") or []) if h.get("let_go")})
    lands = sorted({h["let_go"]["lands_in"] for l in rec["lists"] for h in (lists[l].get("held_lines") or []) if h.get("let_go")})
    rec["let_go"] = {
        "relay": ", ".join(relays),
        "lands_in": lands,
        "what": ("lines of this record's list that its pin held by their line and let go: each lands in the list of the "
                 "pin that re-reads this record's list (re_reads), and its row is a landed line of the record's lists; "
                 "counted for each source as held_lines_let_go, and no longer as held_by_their_line"),
    }
else:
    rec.pop("let_go", None)
out = lay(rec)
if out != raw:
    io.open(rp, "w", encoding="utf-8", newline="\n").write(out)
    print(f"the re-admission's record: {held_now} line(s) held by their line, {held_go} let go, as the pin says")
else:
    print("the re-admission's record says what the pin says already: nothing to write")
