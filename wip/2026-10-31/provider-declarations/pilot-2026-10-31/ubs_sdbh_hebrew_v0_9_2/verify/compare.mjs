// node compare.mjs → compare.out.json : re-run of the v3 comparison, written here (own packSplit, imported senseSplit).
import { writeFileSync } from "node:fs";
import { load, SCRATCH } from "./lib.mjs";
const { senseSplit } = await import(`${SCRATCH}/ghp/reader/tools/sense-split-v1.mjs`);

// ';' at parenthesis depth 0 packs senses; a closer with nothing open does not go below 0 (as gloss-store-v1.mjs states)
const packSplit = (t) => {
  const out = []; let st = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] === "(") d += 1; else if (t[i] === ")") { if (d > 0) d -= 1; } else if (t[i] === ";" && d === 0) { out.push(t.slice(st, i)); st = i + 1; }
  }
  out.push(t.slice(st));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
const v3 = (route) => { const r = []; for (const sense of packSplit(route)) { const x = senseSplit(sense); if (x.damaged) continue; r.push(...x.readings); } return r; };
const alone = (route) => { const x = senseSplit(route); return x.damaged ? [] : x.readings; };

const rows = load();
const routesByKey = new Map();
for (const r of rows) { if (!routesByKey.has(r.key)) routesByKey.set(r.key, new Set()); routesByKey.get(r.key).add(r.route.trim()); }
const tally = (fn) => {
  const c = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_prints_nothing: 0 };
  let pills = 0, notRoute = 0, notes = 0, labels = 0, labelsLoose = 0, man = 0, alsoRoute = 0, alsoRouteCI = 0;
  const sub = { semicolon_only: 0, comma_only: 0, both: 0, final_semicolon_only: 0, damaged_sense: 0 };
  for (const r of rows) {
    c.fields_compared += 1;
    const whole = r.route.trim();
    const got = fn(r.route);
    if (got.length === 0) c.v3_prints_nothing += 1;
    else if (got.length === 1 && got[0] === whole) c.same_division += 1;
    else c.v3_divides_where_declaration_keeps_whole += 1; // the declaration prints the route whole; it never divides
    pills += got.length;
    for (const p of got) {
      if (p === whole) continue;
      notRoute += 1;
      if (/^[◄►≈]/u.test(p)) notes += 1;
      if (/^[^=]{0,40}:\s*=/u.test(p)) labels += 1;
      if (/^(literally|literaly|hence|therefore|possibly|probably|perhaps|meaning|exact meaning)[^=]{0,40}[:]?\s*=/iu.test(p) || /^[^=]{0,40}:\s*=/u.test(p)) labelsLoose += 1;
      if (p === "man") man += 1;
      if (routesByKey.get(r.key).has(p)) alsoRoute += 1;
      if ([...routesByKey.get(r.key)].some((t) => t.toLowerCase() === p.toLowerCase())) alsoRouteCI += 1;
    }
  }
  return { ...c, pills, pills_not_the_route: notRoute, open_with_note_marker: notes, open_with_label_colon_equals: labels, open_with_label_loose: labelsLoose, man_alone: man, also_a_route_on_key: alsoRoute, also_a_route_on_key_case_insensitive: alsoRouteCI };
};
const out = { engine_display_path_pack_then_v3: tally(v3), senseSplit_alone: tally(alone) };
writeFileSync(new URL("./compare.out.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
