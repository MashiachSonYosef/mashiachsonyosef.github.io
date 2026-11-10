// Two checks whose own claim went stale: the disk's gloss field against the line, and the lattice
// orders' "same pool". Each is made to say what is true now. node 06-stale-checks-a.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");

// ---- check-disk-gloss-is-the-line-v1 ---------------------------------------
edit(join(T, "check-disk-gloss-is-the-line-v1.mjs"), [
[`//   L1  the page and the disk agree on every word of the opening screen
//   L2  and the agreement is not vacuous — the screen carried readings
//`,
`//   L1  the page and the disk agree on every word of the opening screen
//   L2  and the agreement is not vacuous — the screen carried readings
//
// UNDER WHICH ORDER (10 November 2026). The rule was written when the line
// had one order. Since 3 October the page opens "at this place", where a
// word's line is what the source reads at that very place (word.pg, held by
// check-line-reads-the-place-v1), and since 6 November the pointing may
// withhold a reading the field holds (the lattice sidecar's leader, held by
// check-pointing-gate-v1). So the field is the line under "oldest first" with
// the pointing kept, and that is where this holds it: both are set before the
// page loads. Run with nothing set, the check failed on 59 of 95 words of
// Amos's opening screen and went unseen for five weeks, because it stood in
// none of the round's chains. A count taken off zone.gloss is a count of what
// a reader meets under oldest first; under the page's own default, the place
// and the pointing are the other two records to read.
//`],
[`const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(\`\${BASE}?b=\${BOOK}\`, { waitUntil: "networkidle" });`,
`const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
// the order and the pointing position the field is the line under
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); } catch { /* a device that remembers nothing still reads */ } });
await p.goto(\`\${BASE}?b=\${BOOK}\`, { waitUntil: "networkidle" });`],
[`check("L1  the page and the disk agree on every word of the opening screen",`,
 `check("L1  under oldest first, the pointing kept, the page and the disk agree on every word of the opening screen",`],
[`  what this buys: a count taken off zone.gloss is a count of what a reader
  meets. Four wrong models were built in one day for want of this field.`,
`  what this buys: a count taken off zone.gloss is a count of what a reader
  meets under oldest first with the pointing kept. Four wrong models were
  built in one day for want of this field.`],
]);

// ---- check-lattice-orders-v1 ------------------------------------------------
edit(join(T, "check-lattice-orders-v1.mjs"), [
[`// Leningrad codex spells otherwise. Every position is a re-order of the same
// pool: the count of readings never changes.
//`,
`// Leningrad codex spells otherwise. Every position is a re-order of the same
// pool: the count of readings never changes.
//
// THE SAME POOL UNDER THE SAME POINTING (10 November 2026). Since 6 November
// the pointing's default follows the order: "only this pointing" under the
// two default orders, "keep" under a lattice order, and the two withhold
// differently, so a card held 100 readings oldest first and 119 under
// "masoretic" and this check, outside the round's chains, was red unseen.
// The claim is about the orders, so the pointing is pinned at "keep" before
// the page loads; what the pointing withholds is check-pointing-gate-v1's.
//`],
[`await p.addInitScript(() => { try { if (!localStorage.getItem("fh.def.order")) localStorage.setItem("fh.def.order", "oldest"); } catch { /* a device that remembers nothing still reads */ } });`,
 `await p.addInitScript(() => { try { if (!localStorage.getItem("fh.def.order")) localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); } catch { /* a device that remembers nothing still reads */ } });`],
]);
