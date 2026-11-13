// The leader under "only this pointing", place by place, on two builds. The line under a word at rest is the place's
// own reading wherever the place has one, so the resting lines do not show what the gates do to the leader: it shows
// where the place has no reading of its own, and wherever a reader chooses "oldest first". This reads the leader each
// build's sidecar gives every word place of a book (the build with the gates: the leaders at the word's kind of
// place where the sidecar holds them, else the surface's own; the build before: the surface's own) and counts the
// places where the two differ, with the first pairs by places. It measures; it changes nothing.
// node leaders-before-and-after.mjs <reader dir before> <reader dir with the gates> [--list=N]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [A, B] = process.argv.slice(2);
const LIST = Number((process.argv.find((a) => a.startsWith("--list=")) || "--list=40").slice(7));
const { onlyLeaders } = await import(pathToFileURL(join(B, "tools", "place-leaders-v1.mjs")).href);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const text = (l) => (Array.isArray(l) && typeof l[0] === "string" ? l[0] : null);
const T = { books: 0, "word places": 0, "places whose surface the sidecar grades on both builds": 0, "places with a leader on both builds": 0, "  the same leader": 0, "  another leader": 0, "  of those, places that have a reading of their own (the leader shows only under oldest first)": 0, "  and places with none (the leader is the line at rest)": 0,
  "places that gain a leader": 0, "places that lose their leader": 0 };
const pairs = new Map(), words = new Map(), gained = new Map(), lost = new Map();
const dirB = join(B, "data", "zones"), dirA = join(A, "data", "zones");
for (const f of readdirSync(dirB).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const z = f.slice(0, -".lattice.bin".length);
  if (!existsSync(join(dirA, f))) continue;
  const zone = gz(join(dirB, `${z}.bin`)), sideB = gz(join(dirB, f)), sideA = gz(join(dirA, f));
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  T.books += 1;
  for (const sec of zone.sections) for (const w of sec.words || []) {
    if (w.mark) continue;
    T["word places"] += 1;
    if (typeof w.s !== "string") continue;
    const ga = (sideA.grades || {})[w.s], gb = (sideB.grades || {})[w.s];
    if (!ga || !gb) continue;
    T["places whose surface the sidecar grades on both builds"] += 1;
    const before = text(ga.o && ga.o.l);
    const after = text(onlyLeaders(gb, w.tg || null, !namesRead || !!w.np).l);
    if (!before && !after) continue;
    const here = `${w.k}${w.tg ? ` at ${[].concat(w.tg).join(" ")}` : ", no tag"}`;
    if (!before) { T["places that gain a leader"] += 1; gained.set(`${here}: «${after}»`, (gained.get(`${here}: «${after}»`) || 0) + 1); continue; }
    if (!after) { T["places that lose their leader"] += 1; lost.set(`${here}: «${before}»`, (lost.get(`${here}: «${before}»`) || 0) + 1); continue; }
    T["places with a leader on both builds"] += 1;
    if (before === after) { T["  the same leader"] += 1; continue; }
    T["  another leader"] += 1;
    const own = Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => String((p && p.g) || "").trim());
    T[own ? "  of those, places that have a reading of their own (the leader shows only under oldest first)" : "  and places with none (the leader is the line at rest)"] += 1;
    const id = `«${before}» → «${after}»`;
    pairs.set(id, (pairs.get(id) || 0) + 1);
    const wid = `${w.k}${w.tg ? ` at ${[].concat(w.tg).join(" ")}` : ""}: ${id}`;
    words.set(wid, (words.get(wid) || 0) + 1);
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${v.toLocaleString("en-US").padStart(9)}  ${k}`);
for (const [name, m] of [["places that lose their leader, by key and the leader they had", lost], ["places that gain a leader, by key and the leader", gained]]) {
  const list = [...m].sort((a, b) => b[1] - a[1]);
  console.log(`\n${name}: ${list.length.toLocaleString("en-US")} kinds. The first ${Math.min(LIST, list.length)}:`);
  for (const [id, n] of list.slice(0, LIST)) console.log(`  ${String(n).padStart(6)} places · ${id.slice(0, 200)}`);
}
for (const [name, m] of [["pairs of leaders", pairs], ["keys under their tags", words]]) {
  const list = [...m].sort((a, b) => b[1] - a[1]);
  console.log(`\n${list.length.toLocaleString("en-US")} ${name} where the leader is another. The first ${Math.min(LIST, list.length)} by places:`);
  for (const [id, n] of list.slice(0, LIST)) console.log(`  ${String(n).padStart(6)} places · ${id.slice(0, 200)}`);
}
