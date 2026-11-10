# Write a copy of the reduced reading-rows probe that prints the readings' row geometry at every step.
# python3 -I make-probe2.py <probe in> <probe out>
import sys
s = open(sys.argv[1], encoding="utf-8").read()
old = "      return { rows: rows.length, whole, clear, moved: Number(document.getElementById(\"hud\").dataset.moved || 0) };"
new = ("      return { rows: rows.length, whole, clear, moved: Number(document.getElementById(\"hud\").dataset.moved || 0), "
       "dbg: { first: rows.slice(0, 4).map((x) => [Math.round(x.t * 100) / 100, Math.round(x.b * 100) / 100]), client: box.clientHeight, st: box.scrollTop, max: box.style.maxHeight, "
       "ds: JSON.stringify({ ...document.getElementById(\"hud\").dataset }), hudMax: document.getElementById(\"hud\").style.maxHeight, wbBottom: wb.bottom, "
       "region: (() => { const r = document.querySelector(\"#hud > .rows\"); return [r.clientHeight, r.scrollHeight, r.scrollTop]; })(), n: box.children.length } };")
assert s.count(old) == 1, "return line"
s = s.replace(old, new)
old2 = "    if (!r) continue;\n    opened += 1;"
new2 = "    if (!r) continue;\n    console.log(`at ${at}: whole ${r.whole} of ${r.rows} · ${JSON.stringify(r.dbg)}`);\n    opened += 1;"
assert s.count(old2) == 1, "continue line"
s = s.replace(old2, new2)
open(sys.argv[2], "w", encoding="utf-8").write(s)
print("written", sys.argv[2])
