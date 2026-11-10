// Two laws for the lattice projection, so what this round mended stays mended:
//   L4b  every order's leader is credited to a carrier of its reading under the store's own rule (carriersOf),
//        and under the three orders that sort the whole pool, to the OLDEST carrier. On the build before this
//        round it is red: the projector matched carriers by the text as written.
//   L4c  the citations are the verse's: a surface's per-verse entries are well formed, and, where the corpus
//        lane's lattice is on the machine (--lattice <dir> or LATTICE_DIR), every graded word place reads the
//        list of cards that name ITS verse. Where the lattice is not here the law says it was not judged.
// node 23-lattice-check-laws.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-lattice-projection-v1.mjs"), [
  [`//   L5  the fingerprints join the store: for the keys the sidecar carries,`,
   `//   L4b every order's leader is credited to a row that carries its reading
//       under the store's own rule (carriersOf: the printed form), with that
//       row's wording year; under the orders that sort the whole pool
//       (masoretic, vowels differ, cites here) it is the OLDEST such row —
//       the source the card credits for the same pill. (Until 10 November
//       2026 the projector found carriers by the text as written, and 16,816
//       leaders on the 39 books stood on part of their carriers.)
//   L4c the citations are the verse's: a surface's entry for another verse
//       (v[<verse>]) lists cards of its key, differs from the first verse's
//       list, and names a leader the store holds; and where the corpus
//       lane's lattice is on this machine (--lattice <dir>, or LATTICE_DIR)
//       every graded word place reads exactly the cards that name its own
//       verse. Without the lattice that half says it was not judged.
//   L5  the fingerprints join the store: for the keys the sidecar carries,`],
  [`import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";`,
   `import { readFileSync, readdirSync, existsSync, createReadStream } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";`],
  [`const ZONES = arg("zones", join(K3, "data", "zones"));`,
   `const ZONES = arg("zones", join(K3, "data", "zones"));
// the corpus lane's lattice, where this machine holds it (it is too large to
// keep beside the door): L4c's second half reads it
const LATTICE = arg("lattice", process.env.LATTICE_DIR || null);`],
  [`const l2 = [], l3 = [], l4 = [], l5 = [], l6 = [], l8 = [];`,
   `const l2 = [], l3 = [], l4 = [], l4b = [], l4c = [], l5 = [], l6 = [], l8 = [];
let leadersHeld = 0, versesOwn = 0, placesRead = 0, booksRead = 0;
const labelOfRow = (row) => (store.index.m_sources[row[3]] || {}).label;
const yearOfRow = (row) => { const y = store.wordingYear(row); return Number.isFinite(y) ? y : null; };`],
  [`  if (badLen) note(l4, \`\${slug}: \${badLen} surfaces grade a different number of cards than their key carries\`);`,
   `  // L4b — who a leader is credited to
  {
    let notACarrier = 0, notTheOldest = 0;
    const WHOLE_POOL = new Set(["m", "x", "c"]);
    const judge = (k, ch, first) => {
      if (!Array.isArray(first)) return;
      leadersHeld += 1;
      const carriers = store.carriersOf(store.routesFor(k) || [], first[0]);
      if (!carriers.some((row) => labelOfRow(row) === first[1] && yearOfRow(row) === (first[3] ?? null))) { notACarrier += 1; return; }
      if (WHOLE_POOL.has(ch) && !(labelOfRow(carriers[0]) === first[1] && yearOfRow(carriers[0]) === (first[3] ?? null))) notTheOldest += 1;
    };
    for (const gr of Object.values(grades)) {
      for (const [ch, first] of Object.entries(gr.o || {})) judge(gr.k, ch, first);
      for (const own of Object.values(gr.v || {})) judge(gr.k, "c", own && own.c);
    }
    if (notACarrier) note(l4b, \`\${slug}: \${notACarrier} leaders credited to a row that does not carry the reading\`);
    if (notTheOldest) note(l4b, \`\${slug}: \${notTheOldest} leaders of a whole-pool order credited to another carrier than the oldest\`);
  }
  // L4c — the verse's own citations, as written
  {
    let malformed = 0;
    for (const gr of Object.values(grades)) {
      const r = routes[gr.k];
      for (const own of Object.values(gr.v || {})) {
        versesOwn += 1;
        const ok = own && Array.isArray(own.n) && r && own.n.every((ix) => Number.isInteger(ix) && ix >= 0 && ix < r.f.length)
          && JSON.stringify(own.n) !== JSON.stringify(gr.n || [])
          && (own.c === null || (Array.isArray(own.c) && own.c.length === 4 && labels.has(own.c[1])))
          && (own.n.length > 0 || own.c === null);
        if (!ok) malformed += 1;
      }
    }
    if (malformed) note(l4c, \`\${slug}: \${malformed} per-verse entries are not a list of the key's cards that differs from the first verse's, with a leader the store holds\`);
  }
  // ... and against the lattice itself, place by place, where it is here
  if (LATTICE && existsSync(join(LATTICE, \`positions-\${slug}-v12.jsonl.gz\`))) {
    booksRead += 1;
    let wrong = 0;
    const rl = createInterface({ input: createReadStream(join(LATTICE, \`positions-\${slug}-v12.jsonl.gz\`)).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      const p = JSON.parse(line);
      if (p.c0 !== "ON") continue;
      for (const m of p.megacompspan || []) {
        const gr = grades[m.surface], rg = m.route_grades, r = routes[m.key];
        if (!gr || !rg || !r) continue;
        placesRead += 1;
        const theirs = (rg.names_this_verse || []).filter((ix) => ix < r.f.length);
        const ours = gr.v && Object.prototype.hasOwnProperty.call(gr.v, p.ref) ? gr.v[p.ref].n : (gr.n || []);
        if (JSON.stringify(theirs) !== JSON.stringify(ours)) wrong += 1;
      }
    }
    if (wrong) note(l4c, \`\${slug}: \${wrong} graded word places read another verse's citing cards\`);
  }
  if (badLen) note(l4, \`\${slug}: \${badLen} surfaces grade a different number of cards than their key carries\`);`],
  [`check("L5  the fingerprints join the store", !l5.length && joinHits > 0,`,
   `check("L4b every leader is credited to a carrier of its reading by the store's own rule, and under a whole-pool order to the oldest", !l4b.length,
  l4b.length ? few(l4b) : \`\${leadersHeld.toLocaleString("en-US")} leaders\`);
check("L4c the citations are the verse's: every per-verse entry lists its key's cards, differs from the first verse's, and names a held leader", !l4c.length,
  l4c.length ? few(l4c) : \`\${versesOwn.toLocaleString("en-US")} verses carry their own list beside their surface's first\${booksRead ? \`; \${placesRead.toLocaleString("en-US")} graded word places on \${booksRead} books read against the lattice, each its own verse's cards\` : ""}\`);
if (!booksRead) console.log(\`  --  L4c's second half was not judged here: the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR), so no word place was read against the lattice's own list for its verse\`);
else if (booksRead < layered.length) console.log(\`  --  L4c's second half was not judged for \${layered.length - booksRead} of \${layered.length} books: their positions file is not in \${LATTICE}\`);
check("L5  the fingerprints join the store", !l5.length && joinHits > 0,`],
]);
