// The projector asks the store who carries a reading (the review's T1; the fifth reader's finding 1).
// It matched a pooled reading's carriers by the text as written, lowercased, while the pool
// groups by the printed form: Strong's «Eden.» was not a carrier of «Eden», so a group's tier,
// its citing and its oldest record were read off part of its rows, and the leaders o.m, o.x and
// o.c could name a reading or a credit the card does not put first.
// node 02-projector-carriers.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  // the lowered-text index of each row's readings is gone: the store answers
  [`      const readingsOfRow = new Map(srows.map((row, i) => [i, new Set(store.readingsOf(row).map((t) => t.toLowerCase()))]));
      const pool = store.readingPool(srows, "oldest");`,
   `      const pool = store.readingPool(srows, "oldest");`],
  [`      const groupInfo = pool.map((grp) => {
        const key = grp.text.toLowerCase();
        const carriers = srows.map((row, i) => ({ row, i })).filter((x) => store.index.m_sources[x.row[3]] && readingsOfRow.get(x.i).has(key));
        let tier = 3, cites = 1;
        for (const x of carriers) { const t = TIER[gradeOfRow(x.row)]; if (t !== undefined && t < tier) tier = t; const ix = rowIx(x.row); if (ix >= 0 && names.includes(ix)) cites = 0; }
        return { text: grp.text, tier, cites, carriers };
      });`,
   `      // WHO CARRIES A GROUP is the store's answer (carriersOf: every admitted
      // row whose readings print as the group prints, oldest wording first),
      // the same rows the page puts behind the pill. Until 10 November 2026
      // this matched the reading as written, so a row that closes the reading
      // with a stop was not among its carriers.
      const groupInfo = pool.map((grp) => {
        const carriers = store.carriersOf(srows, grp.text);
        let tier = 3, cites = 1;
        for (const row of carriers) { const t = TIER[gradeOfRow(row)]; if (t !== undefined && t < tier) tier = t; const ix = rowIx(row); if (ix >= 0 && names.includes(ix)) cites = 0; }
        return { text: grp.text, tier, cites, carriers };
      });
      const credit = (text, row) => { const src = store.index.m_sources[row[3]]; const y = store.wordingYear(row); return [text, src.label, src.licensePosture, Number.isFinite(y) ? y : null]; };`],
  [`        // the M the card prints for that reading: its oldest record
        let best = null;
        for (const x of top.gi.carriers) { const y = Number.parseInt(x.row[4], 10); const yy = Number.isInteger(y) ? y : Infinity; if (!best || yy < best.y) best = { row: x.row, y: yy }; }
        if (!best) return null;
        const src = store.index.m_sources[best.row[3]];
        return [top.gi.text, src.label, src.licensePosture, Number.isFinite(best.y) ? best.y : null];`,
   `        // the M the card prints for that reading: its oldest record
        return top.gi.carriers.length ? credit(top.gi.text, top.gi.carriers[0]) : null;`],
  [`        // its M: the oldest kept row carrying the reading, as the card prints it
        let best = null;
        const by = new Set();
        for (const row of kept) {
          const carries = store.readingsOf(row).some((t) => readingKey(t) === readingKey(top.text));
          if (!carries) continue;
          by.add(String(row[3]));
          const y = Number.parseInt(row[4], 10); const yy = Number.isInteger(y) ? y : Infinity;
          if (!best || yy < best.y) best = { row, y: yy };
        }
        if (!best) return null;
        const src = store.index.m_sources[best.row[3]];
        const out = [top.text, src.label, src.licensePosture, Number.isFinite(best.y) ? best.y : null];
        return withBy ? [...out, [...by].sort()] : out;`,
   `        // its M: the oldest kept row carrying the reading, as the card prints it
        const carriers = store.carriersOf(kept, top.text);
        if (!carriers.length) return null;
        const out = credit(top.text, carriers[0]);
        return withBy ? [...out, [...new Set(carriers.map((row) => String(row[3])))].sort()] : out;`],
  // the name under "only": a kept row carries the name when it prints as the name prints
  [`      const nameText = zone.gloss_names && zone.gloss && Object.prototype.hasOwnProperty.call(zone.gloss_names, m.key) && zone.gloss[m.key] === zone.gloss_names[m.key]
        ? String(zone.gloss_names[m.key]).toLowerCase() : null;
      const nl = !!nameText && srows.some((row) => store.index.m_sources[row[3]] && (attested ? gradeOfRow(row) !== "x" : true) && !otherStem(row)
        && store.readingsOf(row).some((t) => t.toLowerCase() === nameText));`,
   `      const nameText = zone.gloss_names && zone.gloss && Object.prototype.hasOwnProperty.call(zone.gloss_names, m.key) && zone.gloss[m.key] === zone.gloss_names[m.key]
        ? String(zone.gloss_names[m.key]) : null;
      const nl = !!nameText && store.carriersOf(srows.filter((row) => (attested ? gradeOfRow(row) !== "x" : true) && !otherStem(row)), nameText).length > 0;`],
  [`import { openRouteStore, readingKey } from "./gloss-store-v1.mjs";`,
   `import { openRouteStore } from "./gloss-store-v1.mjs";`],
]);
