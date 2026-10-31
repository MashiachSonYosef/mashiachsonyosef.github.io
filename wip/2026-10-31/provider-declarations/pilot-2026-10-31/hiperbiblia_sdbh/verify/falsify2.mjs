// Second-round falsification probes for the dividing shapes of the hiperbiblia_sdbh draft.
// Usage: node falsify2.mjs <by-source/hiperbiblia_sdbh.jsonl> <outdir>
import fs from "node:fs";
const [, , SRC, OUT] = process.argv;
const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const W = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const byKey = new Map(); for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, new Set()); byKey.get(r.key).add(r.route.trim()); }
const recs = new Map(); for (const r of rows) recs.set(r.key + "\u0000" + r.def, r);
const depth0Split = (s, ch) => { let d = 0, st = 0; const out = []; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === "(") d++; else if (c === ")") d--; else if (c === ch && d === 0) { out.push(s.slice(st, i)); st = i + 1; } } out.push(s.slice(st)); return out.map((x) => x.trim()); };
const P = {};
// 1. semicolon: items in a verb record ('to ' first item) that are bare verbs/verb phrases not starting 'to '
let verbRecs = 0, bareItems = 0; const bareEx = [];
for (const r of recs.values()) { const it = depth0Split(r.def, ";"); if (!it[0].startsWith("to ")) continue; verbRecs++; for (let k = 1; k < it.length; k++) if (!it[k].startsWith("to ") && it[k] !== "-") { bareItems++; if (bareEx.length < 25) bareEx.push(r.key + ": [" + W(it[k]) + "] after [" + W(it[k - 1]) + "]"); } }
P.semicolon_non_to_items_in_records_led_by_to = { records_led_by_to: verbRecs, non_to_items_after_first: bareItems, examples: bareEx };
// 2. routes on the key that a kept-whole comma route would yield if completed (does the provider write the completion elsewhere?)
const look = (key, list) => list.map((t) => [t, byKey.get(key)?.has(t) ?? false]);
P.of_head_completions_on_key = { "פה": look("פה", ["mouth of well", "mouth of cave", "mouth of pit", "cave", "pit", "well"]), "פם": look("פם", ["mouth of well", "mouth of cave", "mouth of pit", "cave", "pit"]) };
P.of_head_other_routes_on_key = { "פה": [...byKey.get("פה")].filter((t) => /mouth|opening|cave|pit/.test(t)).map(W) };
P.copula_completions_on_key = Object.fromEntries(["חלה", "תקן", "חלא", "ערם", "כעס"].map((k) => [k, [...byKey.get(k)].filter((t) => /^to (be|become)\b/.test(t)).map(W)]));
P.verb_head_later_piece_with_to_on_key = Object.fromEntries([["צלח", ["to grip", "to take control"]], ["עבד", ["to worship", "to worship (a deity)"]], ["פלח", ["to worship (a deity)", "to worship"]], ["פעל", ["to work"]], ["שאר", ["to be left"]], ["רקד", ["to jump", "to cause (mountains) to jump"]], ["צוה", ["to be ordered"]], ["שעה", ["to pay attention to"]], ["דרך", ["to set foot"]], ["שכן", ["to dwell"]]].map(([k, l]) => [k, look(k, l)]));
P.edge_paren_pieces_on_key = { "טחרים": [...byKey.get("טחרים")].map(W), "כפרת": [...byKey.get("כפרת")].map(W), "אנוש": [...byKey.get("אנוש")].map(W) };
P.question_series_pieces_on_key = { "עשת": look("עשת", ["plaque", "tablet", "panel", "block", "plaque?", "tablet?"]), "תקוע": look("תקוע", ["horn", "trumpet", "horn?", "trumpet?"]) };
P.exclamation_series_pieces_on_key = { "אי": look("אי", ["woe!", "alas!", "woe", "alas"]), "אברך": look("אברך", ["kneel!", "bow down!"]), "אחלי": look("אחלי", ["would that ...!", "if only ...!"]) };
P.colon_pieces_on_key = { "כשף": look("כשף", ["sorcerer", "sorceress"]), all: [...byKey.get("כשף")].map(W) };
P.slash_key_routes = { "חלמות": [...byKey.get("חלמות")].map(W), probe: look("חלמות", ["mallows", "juice of mallows", "purslane", "juice of purslane"]) };
P.nominal_defs = Object.fromEntries(["טרח", "עצרה", "טלא"].map((k) => [k, [...new Set(rows.filter((r) => r.key === k && /,/.test(r.route)).map((r) => W(r.def)))]]));
// 3. a '?' or '!' series anywhere else written with commas or semicolons instead (consistency of the provider's practice)
P.items_that_are_single_question_or_excl = rows.filter((r) => /^[^?!]+[?!]$/.test(r.route) && !/^(where|how|why|what|when|for what|from where|is|really|truly)\b/.test(r.route)).length;
fs.writeFileSync(OUT + "/falsify2.json", JSON.stringify(P, null, 1));
console.log(JSON.stringify(P, null, 0));
