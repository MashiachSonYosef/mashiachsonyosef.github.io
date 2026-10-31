#!/usr/bin/env node
// Confirms that every provider string the declaration quotes as a literal (in declare.mjs prose) occurs
// in this provider's route or definition text, and counts where.
//   node checks/quoted-literals.mjs
import { readFileSync } from "node:fs";
const F = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/wikisource_strongs_explicit_forms.jsonl";
const rows = readFileSync(F, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const LIT = ["landmark. place", "Often unexpressed in English", "seven(-fold),-s", "circumcise(-ing), selves)", "lay & to (take a) pledge", "& presume", "(Superlative of", "Yrechow", "48 marg)", "irreg.)", "dwelling((-)place)", "be(-come), accomplished, committed, like)", "+ O that! what", "where?", "(-ing father)", "(deal, make)", "(depart)", "(put)", "enter(", "bring (forth, in, into, to pass)", "excrement; -dung"];
const out = {};
for (const s of LIT) {
  let routeExact = 0, routeHas = 0, defHas = 0; const keys = new Set();
  for (const r of rows) { if (r.route === s) routeExact++; if (r.route.includes(s)) { routeHas++; keys.add(r.key); } if (r.def.includes(s)) defHas++; }
  out[s] = { route_exact: routeExact, routes_containing: routeHas, rows_whose_definition_contains: defHas, first_keys: [...keys].slice(0, 3) };
}
// route texts exactly equal to a bare verse number, after a citation colon
const nums = {}; for (const r of rows) if (/^\d+$/.test(r.route)) nums[r.route] = (nums[r.route] || 0) + 1;
out.bare_number_routes = nums;
console.log(JSON.stringify(out, null, 1));
