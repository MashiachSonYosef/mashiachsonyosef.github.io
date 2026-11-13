# M10 presses words of two kinds: a row whose route closes (the pill itself changes) and a row whose route does not
# close and whose definition does (the pill is as it was and the record under it changes; every row of the second
# listed source is of this kind). A pick is a row that is the oldest carrier of its reading among the store's rows,
# and its record is judged only where the card's own source line names the row's source: with every switch lifted
# an older row of a dictionary beside the store can stand first under the same pill, and then the record shown is
# that row's. Each text replaced must stand exactly once.
import sys
p = sys.argv[1]
s = open(p, encoding="utf8").read()
a0 = "// served words whose card holds a row of a listed source that the ledger leaves whole, whose route closes, and\n"
a1 = "if (!picks.length) check(\"M10 on the page, a card that holds such a row prints it closed\", false, \"no served word carries a whole row whose route closes and whose closed reading stands on it alone\");\n"
assert s.count(a0) == 1 and s.count(a1) == 1, (s.count(a0), s.count(a1))
i, j = s.index(a0), s.index(a1) + len(a1)
new_picks = """// served words whose card holds a row of a listed source that the ledger leaves whole and that is the oldest of
// the store's rows carrying its reading, so the record under its pill is that row's unless an older row of a
// dictionary beside the store stands first there. Two kinds: a row whose route closes, where the pill itself
// changes; and a row whose route does not close and whose definition does, where the pill is as it was and the
// record under it changes (every row of a source whose routes hold no made space is of this kind)
const KINDS = [
  { name: "route", most: 6, of: (r) => !!r[CLOSES_SLOT][0] && readingKey(String(r[1]).trim()) !== readingKey(routePrinted(r).trim()) },
  { name: "record", most: 6, of: (r) => !r[CLOSES_SLOT][0] && !!r[CLOSES_SLOT][1] && !!r[2] && printedForm(String(r[2])) !== printedForm(recordPrinted(r)) },
];
const picks = [];
{
  const seen = new Set(), found = Object.fromEntries(KINDS.map((kind) => [kind.name, 0]));
  outer: for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
      if (!w.k || w.w || seen.has(w.k)) continue;
      const rows = (store.routesFor(w.k) || []).filter((r) => index.m_sources[r[3]]);
      for (const kind of KINDS) {
        if (found[kind.name] >= kind.most) continue;
        const row = rows.find((r) => LISTED.has(String(r[3])) && r.length > CLOSES_SLOT && !Array.isArray(r[7]) && !Array.isArray(r[8]) && kind.of(r)
          && store.carriersOf(rows, routePrinted(r).trim())[0] === r);
        if (!row) continue;
        seen.add(w.k); found[kind.name] += 1;
        picks.push({ kind: kind.name, book: b, section: si, entry: e, label: sec.label, key: w.k, m: String(row[3]), source: index.m_sources[row[3]].label,
          printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), piece: row[5] === 1, was: [...(stale.get(w.k) || [])] });
        break;
      }
      if (KINDS.every((kind) => found[kind.name] >= kind.most)) break outer;
    }
  }
}
const lacking = KINDS.filter((kind) => !picks.some((pick) => pick.kind === kind.name)).map((kind) => kind.name);
if (lacking.length) check("M10 on the page, a card that holds such a row prints it closed", false, `no served word carries a whole row of the kind: ${lacking.join(", ")}`);
"""
s = s[:i] + new_picks + s[j:]
pairs = [
    ("""  const faults = [], seenOn = [];
  let pills = 0;""",
     """  const faults = [], seenOn = [], judged = Object.fromEntries(KINDS.map((kind) => [kind.name, 0]));
  let pills = 0;"""),
    ("""          let record = null, cut = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text");
            record = d ? d.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, found: !!mine };""",
     """          let record = null, cut = null, credited = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text"), att = hud.querySelector(".d-card .d-foot .att");
            record = d ? d.textContent : null;
            credited = att ? att.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, credited, found: !!mine };"""),
    ("""        if (!got.found) continue;   // the card opened on a division of the word, where the whole form's rows are a press away
        seenOn.push(where);""",
     """        if (!got.found) continue;   // the card opened on a division of the word, where the whole form's rows are a press away
        // the record shown is the oldest carrier's: judged where the card's own source line names this row's source
        if (!String(got.credited || "").startsWith(`${pick.source} \\u00b7 `)) continue;
        seenOn.push(where); judged[pick.kind] += 1;"""),
    ("""faults.length === 0 && seenOn.length > 0,
    faults.length ? `${faults.length} · ${first(faults)}` : !seenOn.length ? `${picks.length} words pressed and none of their cards offered the row` : `${picks.length} words pressed · ${nf(pills)} pills read · the closed reading and its record stood on ${seenOn.length} of the cards (${seenOn[0]})`);""",
     """faults.length === 0 && KINDS.every((kind) => judged[kind.name] > 0),
    faults.length ? `${faults.length} · ${first(faults)}` : `${picks.length} words pressed · ${nf(pills)} pills read · the record was read under ${KINDS.map((kind) => `${judged[kind.name]} of ${picks.filter((pick) => pick.kind === kind.name).length} rows whose ${kind.name} closes`).join(" and ")}${seenOn.length ? ` (${seenOn[0]})` : ""}`);"""),
    ("""//   M10 on the page: words whose cards hold such a row are pressed with every
//       switch lifted; no pill prints a reading as it stood before closing,""",
     """//   M10 on the page: words whose cards hold such a row are pressed with every
//       switch lifted, rows whose route closes and rows whose definition
//       alone does; no pill prints a reading as it stood before closing,"""),
]
for a, b in pairs:
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)
assert s.count("else {\n  const tree = await serveTree(K3);") == 1
open(p, "w", encoding="utf8").write(s)
print("patched")
