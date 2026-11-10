// A witnessed column's re-credited keys stay typed on a second run (rule 1 of the re-gloss: run on its own
// output it writes that output again). A key whose struck credit this tool replaced from the store is listed on
// the column's receipt so the witnessed check can tell it from the corpus lane's own credit; a second run found
// the credit already replaced, touched nothing, and dropped the list.
// node 08-regloss-recredit-survives.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "regloss-zone.mjs"), [
  [`      const kept = {}; let struckOut = 0, recredited = 0; const recreditedKeys = [];
      for (const [k, m] of Object.entries(prevOM[o] || {})) {
        const ids = typeof m === "string" ? [m] : (m && Array.isArray(m.by) ? m.by : []);
        const altIds = m && m.alt && Array.isArray(m.alt.by) ? m.alt.by : [];
        const touched = [...ids, ...altIds].some((id) => !store.index.m_sources[id]);
        if (!touched) { kept[k] = m; continue; }`,
   `      const kept = {}; let struckOut = 0, recredited = 0; const recreditedKeys = [];
      // a key an earlier run of this tool re-credited stays typed as
      // re-credited while it stands in the column: its credit is still the
      // store's and not the lane's, whichever run replaced it
      const wcBefore = zone.emitted_from.witnessed_order && zone.emitted_from.witnessed_order.columns && zone.emitted_from.witnessed_order.columns[o];
      const recreditedBefore = new Set(wcBefore && Array.isArray(wcBefore.struck_credit_recredited_keys) ? wcBefore.struck_credit_recredited_keys : []);
      for (const [k, m] of Object.entries(prevOM[o] || {})) {
        const ids = typeof m === "string" ? [m] : (m && Array.isArray(m.by) ? m.by : []);
        const altIds = m && m.alt && Array.isArray(m.alt.by) ? m.alt.by : [];
        const touched = [...ids, ...altIds].some((id) => !store.index.m_sources[id]);
        if (!touched) { kept[k] = m; if (recreditedBefore.has(k) && table[k] !== undefined) { recredited += 1; recreditedKeys.push(k); } continue; }`],
]);
