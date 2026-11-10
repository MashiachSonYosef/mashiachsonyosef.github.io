// A verse the projection does not reach carries nothing of an earlier projection (the fifth reader's finding 22,
// latent: no verse is held today). The fields this tool writes on a word (hg, hm, ld, pc) were cleared inside the
// loop over a JOINED verse's words; a verse held whole, or absent from the lattice, kept whatever the run before
// had written, credited to a store that may have moved, while the receipt counted the verse as held.
// Also: a list kept "for the recount" that nothing reads leaves the file.
// On today's zones nothing moves: every verse joins.
// node 15-projector-held-verse.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  [`  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
  stats.verses += 1; stats.words_on += on.length;`,
   `  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
  // NOTHING OF AN EARLIER PROJECTION STANDS ON A WORD THIS ONE DOES NOT
  // REACH. What this tool writes on a word is cleared here, before the verse
  // is proved, so a verse held whole or absent from the lattice carries no
  // reading, credit or difference a run before this one wrote (until 10
  // November 2026 they were cleared only inside a joined verse).
  for (const w of on) { delete w.hg; delete w.hm; delete w.ld; delete w.pc; }
  stats.verses += 1; stats.words_on += on.length;`],
  [`    const p = rows[i];
    delete w.hg; delete w.hm; delete w.ld;
    // rule 4 · the grades, per pointed surface, over the lattice's own order`,
   `    const p = rows[i];
    // rule 4 · the grades, per pointed surface, over the lattice's own order`],
  [`    // rule 5 · the parts, for a word the catalog answers nothing for
    delete w.pc;
    const g = zone.gloss || {};`,
   `    // rule 5 · the parts, for a word the catalog answers nothing for
    const g = zone.gloss || {};`],
  [`const grades = {};          // pointed surface -> { k, g, n }
const wordsTouched = [];    // for the recount`,
   `const grades = {};          // pointed surface -> { k, g, n }`],
  [`      if (w.pc.every((x) => x.t && x.m)) stats.pc_both_witnesses += 1;
    }
    wordsTouched.push(w);
  });`,
   `      if (w.pc.every((x) => x.t && x.m)) stats.pc_both_witnesses += 1;
    }
  });`],
]);
