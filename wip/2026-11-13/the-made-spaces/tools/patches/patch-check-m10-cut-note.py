# M10 also reads the note the card prints when a reading is a piece cut out of its record: for the rows it picks
# (whole rows, their closed reading standing on them alone) the note stands exactly where the store marks the row
# as a piece. Each text replaced must stand exactly once.
import sys
p = sys.argv[1]
s = open(p, encoding="utf8").read()
pairs = [
    ("""        printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), was: [...stale.get(w.k)] });""",
     """        printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), piece: row[5] === 1, was: [...stale.get(w.k)] });"""),
    ("""          let record = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text");
            record = d ? d.textContent : null;
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, found: !!mine };""",
     """          let record = null, cut = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text");
            record = d ? d.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, found: !!mine };"""),
    ("""        if (got.record !== pick.record) faults.push(`${where}: under «${pick.printed.slice(0, 40)}» the record prints «${String(got.record).slice(0, 60)}», and as printed it is «${pick.record.slice(0, 60)}»`);""",
     """        if (got.record !== pick.record) faults.push(`${where}: under «${pick.printed.slice(0, 40)}» the record prints «${String(got.record).slice(0, 60)}», and as printed it is «${pick.record.slice(0, 60)}»`);
        // the reading is the row's whole route as it prints, so the card calls it a piece of its record only where the store marks the row as one
        if (got.cut !== pick.piece) faults.push(`${where}: the card ${got.cut ? "says" : "does not say"} «${pick.printed.slice(0, 40)}» is a piece cut out of its record, and the store ${pick.piece ? "marks" : "does not mark"} the row as one`);"""),
    ("""//       the closed reading stands on a pill credited to its source, and the
//       record under that pill is the definition as it prints""",
     """//       the closed reading stands on a pill credited to its source, the
//       record under that pill is the definition as it prints, and the card
//       calls the reading a piece of its record only where the store does"""),
    ("""the closed reading stands on a pill of its source, and the record under it is the definition as it prints", faults.length === 0 && seenOn.length > 0,""",
     """the closed reading stands on a pill of its source, the record under it is the definition as it prints, and it is called a piece only where the store marks it one", faults.length === 0 && seenOn.length > 0,"""),
]
for a, b in pairs:
    assert s.count(a) == 1, (s.count(a), a[:70])
    s = s.replace(a, b)
open(p, "w", encoding="utf8").write(s)
print("patched")
