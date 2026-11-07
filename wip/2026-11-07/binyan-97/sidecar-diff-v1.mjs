// the shureq grade's effect, read off the sidecars: the grades before (zones-before) and after (data/zones), per surface
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const T = { books: 0, surfaces: 0, surfaces_with_a_grade_moved: 0, grades: 0, n_to_m: 0, n_to_x: 0, x_to_m: 0, other: 0, attested_before: 0, attested_after: 0, newly_attested: 0, withheld_before: 0, withheld_after: 0, leader_l_moved: 0, leader_l_bare_before: 0, leader_l_bare_after: 0, nl_before: 0, nl_after: 0 };
for (const f of readdirSync(`${S}/v15/zones-before`)) {
  if (!f.endsWith(".lattice.bin")) continue;
  const a = JSON.parse(gunzipSync(readFileSync(`${S}/v15/zones-before/${f}`)).toString("utf8"));
  const b = JSON.parse(gunzipSync(readFileSync(`${S}/pt/reader/data/zones/${f}`)).toString("utf8"));
  T.books += 1;
  for (const [s, ga] of Object.entries(a.grades || {})) {
    const gb = (b.grades || {})[s]; if (!gb) continue;
    T.surfaces += 1;
    const A = ga.g, B = gb.g; let moved = false;
    for (let i = 0; i < Math.min(A.length, B.length); i += 1) { T.grades += 1; if (A[i] !== B[i]) { moved = true; const k = `${A[i]}_to_${B[i]}`; if (k in T) T[k] += 1; else T.other += 1; } }
    if (moved) T.surfaces_with_a_grade_moved += 1;
    const atA = A.includes("m"), atB = B.includes("m");
    if (atA) T.attested_before += 1; if (atB) T.attested_after += 1; if (!atA && atB) T.newly_attested += 1;
    if (atA) T.withheld_before += [...A].filter((c) => c === "x").length;
    if (atB) T.withheld_after += [...B].filter((c) => c === "x").length;
    const la = ga.o && ga.o.l, lb = gb.o && gb.o.l;
    if (!la) T.leader_l_bare_before += 1; if (!lb) T.leader_l_bare_after += 1;
    if ((la ? la[0] : null) !== (lb ? lb[0] : null)) T.leader_l_moved += 1;
    if (ga.nl) T.nl_before += 1; if (gb.nl) T.nl_after += 1;
  }
}
console.log(JSON.stringify(T, null, 1));
