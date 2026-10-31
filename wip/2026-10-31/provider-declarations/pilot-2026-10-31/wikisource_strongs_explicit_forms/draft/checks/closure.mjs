#!/usr/bin/env node
// Closure test of declaration.json, the way declaration-v1.mjs's readingOf computes unknownMarks:
// every route character that is not a letter, digit or whitespace must be a declared mark.
//   node checks/closure.mjs
import { readFileSync } from "node:fs";
const HERE = new URL(".", import.meta.url).pathname;
const F = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/wikisource_strongs_explicit_forms.jsonl";
const decl = JSON.parse(readFileSync(HERE + "../declaration.json", "utf8")).providers.wikisource_strongs_explicit_forms;
const declared = new Set(Object.keys(decl.marks));
let routes = 0, routesWithUnknown = 0; const unknown = {};
for (const l of readFileSync(F, "utf8").split("\n")) {
  if (!l) continue; routes++;
  const R = JSON.parse(l).route;
  const u = [...new Set([...R].filter((c) => !/[\p{L}\p{N}\s]/u.test(c) && !declared.has(c)))];
  if (u.length) { routesWithUnknown++; for (const c of u) unknown[c] = (unknown[c] || 0) + 1; }
}
console.log(JSON.stringify({ routes, declared_marks: declared.size, routes_with_an_undeclared_mark: routesWithUnknown, undeclared: unknown }));
