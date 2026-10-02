#!/usr/bin/env node
// GUARDS: declarations-branch-rule-v1-a-branch-is-what-the-source-says-about-itself-and-a-reserved-token-is-never-a-branch
//
// THE SOURCE BRANCH, HELD TO THE ONE RULE THAT DECIDES IT.
//
// The corpus lane's contract is emphatic and its reason is a scar: an earlier
// draft dropped reserved tokens BY SHAPE and deleted nineteen strings the
// sources themselves wrote — PBH (Sefaria's post-biblical Hebrew), YIVO (the
// Yiddish standard orthography), BDB (a whole lexicon row's title),
// NOT_IN_COPYRIGHT (archive.org's own rights statement, and the only value its
// row carried) — emptying two branches that hold a real declaration. So:
//
//   D1  the list this site drew by is TEN EXACT STRINGS, and it is the
//       contract's own list, carried with the contract's sha256
//   D2  the projector tests membership and nothing else: its value test is
//       reserved.has(...), and no regex, shape, prefix, suffix, bracket or
//       capitalisation rule is applied to a value anywhere in it
//   D3  the nineteen survive that test — run here, not quoted
//   D4  and the ten are dropped by it, so the rule is not vacuous
//   D5  every branch is one of the eleven aspects the contract's own table
//       names; everything else is carried beside them, never as a branch
//   D6  the flag is not the test: rows carry `dropped` independently of
//       `tail`, and the entry arithmetic adds up to the receipt
//   D7  the page never re-implements the rule — zone.html carries none of the
//       ten strings and no reserved list of its own; it draws what the
//       sidecar carries
//   D8  the sidecar is pinned by the store manifest that ships beside it
//   D9  in the browser: a source's branch opens, draws the source's own
//       values, and no value drawn is a reserved token
//
// SKIPS by name when the sidecar is not on the shelf.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { branchValues, DECLARATIONS_RULE_ID, DECLARATIONS_SCHEMA } from "./project-declarations-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const SIDE = "data/route-store/source-declarations-v1.bin", REC = "data/source-declarations-receipt-v1.json";
if (!existsSync(SIDE)) { console.log(`SKIPPED — no ${SIDE} on the shelf; nothing here to hold`); process.exit(3); }
const d = JSON.parse(gunzipSync(readFileSync(SIDE)).toString("utf8"));
const rec = existsSync(REC) ? JSON.parse(readFileSync(REC, "utf8")) : null;
console.log(`— ${SIDE} · ${d.counts.stems} stems · ${d.counts.branches} branches —`);

// D1
const RES = (d.the_rule || {}).reserved || [];
check("D1  the rule this site drew by is ten exact strings, carried with the contract they came from",
  Array.isArray(RES) && RES.length === 10 && new Set(RES).size === 10 && d.rule_id === DECLARATIONS_RULE_ID && d.schema_version === DECLARATIONS_SCHEMA && !!(d.source && d.source.contract && d.source.contract.sha256),
  `${RES.length} strings · contract ${(d.source && d.source.contract ? d.source.contract.sha256 : "").slice(0, 12)}… · ${(d.source && d.source.manifest ? d.source.manifest.files : "?")} ledger files pinned`);

// D2 — the projector's own source: membership, and no pattern on a value
const src = readFileSync("tools/project-declarations-v1.mjs", "utf8");
const fn = /export const branchValues = ([\s\S]*?);\n/u.exec(src);
const body = fn ? fn[1] : "";
const usesMembership = /reserved\.has\(String\(v\.value\)\)/u.test(body);
// a pattern applied to a value is the error this guard exists for
const patternOnValue = /(\.test\(|\.match\(|RegExp|\/\^|startsWith\(|endsWith\(|toUpperCase\(\)\s*===)/u.test(body);
check("D2  the projector's value test is membership, and no pattern is applied to a value",
  usesMembership && !patternOnValue, usesMembership ? (patternOnValue ? "a pattern appears in the value test" : "reserved.has(String(v.value)), and nothing else") : "branchValues does not read as membership");

// D3 / D4 — run the rule, do not quote it
const reserved = new Set(RES);
const NINETEEN = (d.the_rule || {}).nineteen_that_must_survive || [];
const asRow = (vals) => ({ values: vals.map((v) => ({ value: v, n: 1 })) });
const survived = branchValues(asRow(NINETEEN), reserved).map((v) => v.value);
check("D3  the nineteen strings a shape test deleted all survive this rule, run here",
  NINETEEN.length === 19 && survived.length === 19,
  `${survived.length} of ${NINETEEN.length} survive${survived.length !== NINETEEN.length ? " · lost: " + NINETEEN.filter((v) => !survived.includes(v)).join(", ") : ""}`);
const dropped = branchValues(asRow(RES), reserved);
check("D4  and the ten are dropped by it, so the rule is not vacuous", dropped.length === 0, `${RES.length - dropped.length} of ${RES.length} dropped`);

// D5 — the eleven, and everything else beside them
const ELEVEN = new Set((d.the_branches || {}).eleven || []);
const allB = Object.values(d.stems).flatMap((s) => s.branches), allC = Object.values(d.stems).flatMap((s) => s.channels);
const strayB = [...new Set(allB.filter((b) => !ELEVEN.has(b.aspect)).map((b) => b.aspect))];
const strayC = [...new Set(allC.filter((b) => ELEVEN.has(b.aspect) && !b.klass).map((b) => b.aspect))];
check("D5  every branch is one of the eleven the contract's own table names; everything else stands beside them",
  ELEVEN.size === 11 && strayB.length === 0 && strayC.length === 0,
  `${ELEVEN.size} named · ${allB.length} branches · ${allC.length} beside them${strayB.length ? " · drawn as a branch but not one of the eleven: " + strayB.join(", ") : ""}${strayC.length ? " · set aside though it is one of the eleven: " + strayC.join(", ") : ""}`);

// D6 — the flag never decided anything
const withDropped = allB.concat(allC).filter((b) => b.dropped);
const withTail = allB.concat(allC).filter((b) => b.tail);
const droppedNoTail = withDropped.filter((b) => !b.tail).length;
const tailNoDropped = withTail.filter((b) => !b.dropped).length;
check("D6  the flag is not the test: a dropped entry and a partial list are recorded independently",
  withDropped.length > 0 && (rec ? rec.counts.entries_dropped_as_reserved === d.counts.entries_dropped_as_reserved : true) && d.counts.source_values_dropped === 0 && d.counts.rows_the_rule_empties_completely === 0,
  `${withDropped.length} rows dropped an entry (${droppedNoTail} of them carry no partial flag) · ${withTail.length} rows are partial (${tailNoDropped} of them dropped nothing) · rows emptied ${d.counts.rows_the_rule_empties_completely} · source values dropped ${d.counts.source_values_dropped}`);

// D7 — the page draws, it does not decide
const page = readFileSync("zone.html", "utf8");
// as a QUOTED LITERAL, which is what re-implementing the rule looks like —
// a bare substring scan matches `append(none)` and calls the page a liar
const quoted = (t) => page.includes(JSON.stringify(t)) || page.includes(`'${t}'`) || page.includes(`\`${t}\``);
const inPage = RES.filter(quoted);
check("D7  the page never re-implements the rule: it carries none of the ten and no list of its own",
  inPage.length === 0 && !/RESERVED\s*=\s*new Set/u.test(page),
  inPage.length ? `zone.html carries ${inPage.length}: ${inPage.slice(0, 4).join(", ")}` : "the page draws what the sidecar carries");

// D8 — pinned where it is served
const man = existsSync("data/route-store/store-manifest-v1.json") ? JSON.parse(readFileSync("data/route-store/store-manifest-v1.json", "utf8")) : null;
const pins = man ? (man.files || man.entries || man.pins || {}) : null;
const named = pins ? (Array.isArray(pins) ? pins.some((f) => String(f.file || f.path || "").endsWith("source-declarations-v1.bin")) : Object.keys(pins).some((k) => k.endsWith("source-declarations-v1.bin"))) : false;
check("D8  the sidecar is pinned by the store manifest that ships beside it", named, named ? "pinned" : "the store manifest does not name it — run tools/emit-store-manifest-v1.mjs");

// D9 — the branch, opened
const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
const pw = await loadPlaywright();
// a zone whose source row is live: the switch costs must be baked on it, or
// there are no chips to open a branch from
const ZONE = zonesServed().find((z) => {
  try { const zz = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); return !!(zz.emitted_from && zz.emitted_from.toggles && zz.emitted_from.toggles.sources && zz.emitted_from.toggles.sources.sources); } catch { return false; }
});
if (!ZONE) { console.log("  --  D9  no served zone carries the source-switch receipt, so no branch can be opened"); console.log(bad ? `\n${bad} FAILED` : "\nall checks passed"); process.exit(bad ? 1 : 0); }
const BASE = `${defaultZoneUrl().split("?")[0]}?b=${ZONE}`;
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(BASE, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(500);
const opened = await p.evaluate(async () => {
  const r = document.getElementById("rail"); if (r && !r.open) r.open = true;
  const row = document.querySelector('.rail .row[data-toggle="sources"]'); if (!row) return { why: "no sources row" };
  const opens = [...row.querySelectorAll(".decl-open")]; if (!opens.length) return { why: "no branch opener" };
  opens[0].click();
  return { key: opens[0].dataset.key, openers: opens.length };
});
if (opened.why) check("D9  a source's branch opens and draws the source's own values", false, opened.why);
else {
  await p.waitForFunction(() => !!document.querySelector(".rail .decl"), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(400);
  const drew = await p.evaluate(() => {
    const d2 = document.querySelector(".rail .decl"); if (!d2) return null;
    return {
      key: d2.dataset.key,
      values: [...d2.querySelectorAll(".decl-v")].map((x) => x.firstChild ? x.firstChild.textContent.trim() : x.textContent.trim()),
      branches: d2.querySelectorAll(".decl-branch").length,
      wheres: [...d2.querySelectorAll(".decl-where")].filter((x) => x.textContent.trim()).length,
    };
  });
  const stem = drew ? d.stems[drew.key] : null;
  const tokenDrawn = drew ? drew.values.filter((v) => reserved.has(v)) : [];
  const expect = stem ? (stem.branches.length + stem.channels.length) : -1;
  check("D9  a source's branch opens, draws the source's own values, and draws no reserved token",
    !!drew && drew.branches === expect && tokenDrawn.length === 0 && drew.wheres === drew.branches,
    drew ? `${drew.key}: ${drew.branches} of ${expect} lines · ${drew.values.length} values · every line carries its address · tokens drawn ${tokenDrawn.length}` : "nothing drew");
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
