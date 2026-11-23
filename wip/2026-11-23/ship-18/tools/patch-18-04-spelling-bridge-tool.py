# Ship 18, patch 4 (23 November 2026): tools/spelling-bridge-v1.mjs says of the class a_place_where_steps_reading_stands
# what the bridge's pin now says (patch 3): the owner ruled on 23 November 2026 («steps is fine»), STEP's reading
# governs the card at these places, and the pieces are not laid. Its reason in HELD and its comment both waited for the
# page lane's word. HELD's reasons are read by name only (the pin's why is not derived from them or checked against
# them), and the sentence is the pin's own, word for word. Exact replacements, each asserted to occur once; a tool that
# says it already is left. Usage: patch-18-04-spelling-bridge-tool.py <reader>
import io, sys
p = sys.argv[1] + "/tools/spelling-bridge-v1.mjs"
s = io.open(p, encoding="utf-8").read()
RULED = "The owner ruled on 23 November 2026 («steps is fine»): STEP's reading governs the card at these places, and the pieces are not laid"
if RULED in s:
    print("stands already tools/spelling-bridge-v1.mjs"); sys.exit(0)
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)
swap("""//            U8, Esther 9:18). The place waits until the page lane says how a
//            place both read is drawn. Read from the same record as the hold
""", """//            U8, Esther 9:18). The owner ruled on 23 November 2026 («steps is
//            fine»): STEP's reading governs the card at these places, and the
//            pieces are not laid. Read from the same record as the hold
""")
swap("""its card and a reading across words disagreeing with its line, until the page lane says how a place both read is drawn",
""", """its card and a reading across words disagreeing with its line. """ + RULED + """",
""")
assert RULED in s and "until the page lane says" not in s
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("patched tools/spelling-bridge-v1.mjs · a_place_where_steps_reading_stands: the owner's ruling of 23 November 2026, as the pin says it")
