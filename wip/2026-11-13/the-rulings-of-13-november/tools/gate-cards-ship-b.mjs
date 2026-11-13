// The gate's differing first cards, each pill accounted for by the two pointer maps. A pointer pill prints either
// its own text, or, where its map resolves it, the entry's English with the pointer beside it. So a pill that
// differs between the two builds must be one pointer under the two maps:
//   another English   both maps resolve it, to different English
//   gains an English  the old map did not resolve it, the new one does
//   its own words     the old map resolved it, the new map does not hold or does not resolve it; by the reason:
//                       a reading with English of its own (MIXED, ruling 5), or the new map's own "why"
// Anything else is printed as not accounted for. The three small functions are the page's own, word for word.
// node gate-cards-ship-b.mjs <the gate's diff file> <old data/form-of-pills-v1.json> <new data/form-of-pills-v1.json>
import { readFileSync } from "node:fs";
const [DIFF, OLD, NEW] = process.argv.slice(2);
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
const formOfTarget = (e) => {
  if (!e.at) return e.target;
  try { const b = new TextEncoder().encode(e.t); return new TextDecoder().decode(b.slice(e.at[0], e.at[1])) || e.target; } catch { return e.target; }
};
const formOfSays = (e) => (e && e.resolved ? `${e.resolved.text} (${e.relation} ${formOfTarget(e)})` : null);

// a map, by the pointer's text as it prints: every entry under that text, with what the page says for it
const read = (path) => {
  const map = JSON.parse(readFileSync(path, "utf8"));
  const byText = new Map();
  for (const [key, list] of Object.entries(map.keys)) for (const e of list) {
    const t = spanJoin(e.t);
    if (!byText.has(t)) byText.set(t, []);
    byText.get(t).push({ key, m: e.m, cls: e.class, says: formOfSays(e), why: e.why || null });
  }
  return byText;
};
const old = read(OLD), neu = read(NEW);
const saysOf = (byText, t) => new Set((byText.get(t) || []).map((e) => e.says).filter(Boolean));
const pointersSaying = (byText) => { const out = new Map(); for (const [t, list] of byText) for (const e of list) if (e.says) { if (!out.has(e.says)) out.set(e.says, new Set()); out.get(e.says).add(t); } return out; };
const oldSaying = pointersSaying(old), newSaying = pointersSaying(neu);

const bare = (s) => (s.startsWith("*") ? s.slice(1) : s);
const cards = readFileSync(DIFF, "utf8").split(/^== /m).slice(1);
const T = { cards: 0, "another English": 0, "gains an English": 0, "its own words: a reading with English of its own": 0, "its own words: the new map does not resolve it": 0,
  "its own words: the new map does not hold it": 0, "new pills not accounted for": 0, "old pills not accounted for": 0, "the pressed pill is another reading": 0, "cards with the same pills in another order": 0 };
const whys = new Map();
const seen = new Map();
for (const c of cards) {
  const [head, ...rest] = c.split("\n");
  let o = null, n = null;
  for (const line of rest) { if (line.startsWith("  old: ")) o = line.slice(7).split(" | "); if (line.startsWith("  new: ")) n = line.slice(7).split(" | "); }
  T.cards += 1;
  if (!o || !n) { console.log(`${head}: not read`); continue; }
  const O = o.map(bare), N = n.map(bare);
  const gone = O.filter((x) => !N.includes(x)), came = N.filter((x) => !O.includes(x));
  const used = new Set(), notes = [], pairs = new Map();
  for (const x of came) {
    let done = false;
    // the new pill is an English with its pointer: which pointer, and what did the old card print for it
    for (const t of newSaying.get(x) || []) {
      const was = gone.find((g) => !used.has(g) && (g === t || saysOf(old, t).has(g)));
      if (!was) continue;
      used.add(was); pairs.set(was, x);
      const kind = was === t ? "gains an English" : "another English";
      T[kind] += 1; notes.push(`    ${kind}: «${was.slice(0, 90)}» -> «${x.slice(0, 90)}»`); seen.set(`${kind}\u0001${t}`, 1); done = true; break;
    }
    if (done) continue;
    // the new pill is a pointer's own text: the old card printed an English for it
    const was = gone.find((g) => !used.has(g) && saysOf(old, x).has(g));
    if (was) {
      used.add(was); pairs.set(was, x);
      const wasOf = (old.get(x) || []).filter((e) => e.says === was), now = neu.get(x) || [];
      const kind = wasOf.every((e) => e.cls === "MIXED") ? "its own words: a reading with English of its own" : now.length ? "its own words: the new map does not resolve it" : "its own words: the new map does not hold it";
      T[kind] += 1; seen.set(`${kind}\u0001${x}`, 1);
      const why = [...new Set(now.map((e) => e.why).filter(Boolean))].join(", ");
      if (kind.endsWith("does not resolve it")) whys.set(why || "(no reason given)", (whys.get(why || "(no reason given)") || 0) + 1);
      notes.push(`    ${kind}${why ? ` (${why})` : ""}: «${was.slice(0, 90)}» -> «${x.slice(0, 90)}»`);
      continue;
    }
    T["new pills not accounted for"] += 1; notes.push(`    NEW, not accounted for: «${x.slice(0, 200)}»`);
  }
  for (const g of gone) if (!used.has(g)) { T["old pills not accounted for"] += 1; notes.push(`    OLD, not accounted for: «${g.slice(0, 200)}»`); }
  const pressedOld = o.filter((x) => x.startsWith("*")).map(bare), pressedNew = n.filter((x) => x.startsWith("*")).map(bare);
  if (pressedOld.map((x) => pairs.get(x) || x).join("\u0001") !== pressedNew.join("\u0001")) { T["the pressed pill is another reading"] += 1; notes.push(`    the pressed pill: «${pressedOld.join(" · ").slice(0, 80)}» -> «${pressedNew.join(" · ").slice(0, 80)}»`); }
  if (!gone.length && !came.length && O.join("\u0001") !== N.join("\u0001")) { T["cards with the same pills in another order"] += 1; notes.push("    the same pills, in another order"); }
  if (O.map((x) => pairs.get(x) || x).join("\u0001") !== N.join("\u0001") && (gone.length || came.length) && !notes.some((s) => s.includes("not accounted"))) notes.push("    (the pills, each put for its pair, stand in another order)");
  console.log(`${head}: ${o.length} pills -> ${n.length}`);
  for (const line of notes) console.log(line);
}
console.log("");
for (const [k, v] of Object.entries(T)) console.log(`${String(v).padStart(7)}  ${k}`);
const kinds = new Map();
for (const k of seen.keys()) { const kind = k.split("\u0001")[0]; kinds.set(kind, (kinds.get(kind) || 0) + 1); }
console.log("\ndistinct pointers, by what became of them:");
for (const [k, v] of kinds) console.log(`${String(v).padStart(7)}  ${k}`);
if (whys.size) { console.log("\nthe new map's reasons where it does not resolve:"); for (const [k, v] of whys) console.log(`${String(v).padStart(7)}  ${k}`); }
