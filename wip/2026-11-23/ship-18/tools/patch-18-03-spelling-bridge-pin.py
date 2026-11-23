# Ship 18, patch 3 (23 November 2026): the spelling bridge's pin, the class a_place_where_steps_reading_stands (724
# places). Its reason ended in a wait for the page lane's word on how a place both read is drawn. The owner ruled on 23
# November 2026 («steps is fine»): STEP's reading governs the card at those places, and the pieces are not
# laid. That one sentence is reworded to say so; nothing else of the pin changes. An exact replacement, asserted to
# occur once; a pin that says it already is left. Usage: patch-18-03-spelling-bridge-pin.py <reader>
import io, json, sys
p = sys.argv[1] + "/data/spelling-bridge/PIN.json"
s = io.open(p, encoding="utf-8").read()
OLD = "The place waits until the page lane says how a place both read is drawn (22 November 2026)."
NEW = "The owner ruled on 23 November 2026 («steps is fine»): STEP's reading governs the card at these places, and the pieces are not laid."
if NEW in s:
    print("stands already data/spelling-bridge/PIN.json"); sys.exit(0)
assert s.count(OLD) == 1, s.count(OLD)
s = s.replace(OLD, NEW)
pin = json.loads(s)
held = [x for x in pin["not_laid"] if x.get("held") == "a_place_where_steps_reading_stands"]
assert len(held) == 1 and held[0]["places"] == 724 and NEW in held[0]["why"], held
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("patched data/spelling-bridge/PIN.json · a_place_where_steps_reading_stands (724 places): the owner's ruling of 23 November 2026")
