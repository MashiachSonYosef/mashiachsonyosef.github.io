#!/usr/bin/env node
// The pair is presented as MAM writes it, and a branch choice moves nothing.
//
// Built against the construction lane's sealed candidate bundle: a fixture
// zone of every source-marked site is rendered in the real reader, and the
// page is held to the presentation law the candidate itself declares —
// PRINT_EXACT_MAM_CARRIER, SELECTORS_CHANGE_DEFINITIONAL_FOCUS_ONLY:
//   - every carrier prints exactly, both halves, brackets and order as
//     the source wrote them, no markup shown as text
//   - each branch is pressable and opens its own record — the ketiv its
//     own, the qere its own
//   - opening and choosing branches moves no character of the line
//   - the fixture zone itself satisfies the pair-law contract the zone
//     gate holds served zones to (policy declared, q in [ ], k in ( ))
// The fixture is scratch under build/ and is never served.
// GUARDS: kq-rule-v1-both-halves-as-written
//
// Run: node tools/check-kq-presentation-v1.mjs --bundle <dir>
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createServer } from "node:http";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BUNDLE = arg("bundle", null);
if (!BUNDLE || !existsSync(join(BUNDLE, "candidate", "mam-reader-overlay-v1.jsonl"))) {
  console.log("SKIPPED — the MAM presentation candidate bundle is not here; the fixture cannot be built");
  process.exit(3);
}
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// 1 · the fixture, fresh from the sealed candidate
// the fixture's name is derived from its own path, typed once — the scope
// guard's law: a check never names a zone twice, so a rename cannot desync
const FIX = join(K3, "build", "kq-fixture", "kq-fixture-v1.bin");
// split on either separator: join() emits backslashes on Windows, and the
// corpus lane runs this check there — its counter-verification found both
// of these seams
const SLUG = FIX.split(/[\\/]/).pop().replace(/\.bin$/, "");
execFileSync("node", [join(HERE, "make-kq-fixture-zone-v1.mjs"), "--bundle", BUNDLE, "--out", FIX], { stdio: "pipe", cwd: K3 });
const zone = JSON.parse(gunzipSync(readFileSync(FIX)).toString("utf8"));
const overlay = readFileSync(join(BUNDLE, "candidate", "mam-reader-overlay-v1.jsonl"), "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));

// 2 · the zone gate's own pair contract, held against the fixture bin
check("the fixture declares how it carries the pair",
  zone.emitted_from?.kq_policy === "BOTH_HALVES_AS_WRITTEN", String(zone.emitted_from?.kq_policy));
const pairs = zone.sections.flatMap((s) => s.words).filter((w) => w.kq);
const broken = pairs.filter((p) => !/\[.+\]/.test(p.kq.q) || !/\(.+\)/.test(p.kq.k));
check(`every pair carries both halves, brackets as written (${pairs.length} pairs)`,
  pairs.length > 0 && broken.length === 0, broken.length ? `${broken.length} unbracketed` : "whole");

// 3 · the reader renders it under the presentation law
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".bin": "application/octet-stream" };
const srv = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "")
    .replace(/\\/g, "/");   // normalize() emits backslashes on Windows; URLs never do
  const path = p === `/data/zones/${SLUG}.bin` ? FIX : join(K3, p);
  try {
    const body = readFileSync(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
let pageErr = null; p.on("pageerror", (e) => { pageErr = e.message; });
// fixture=1: the reader shows a test instrument only when asked as one —
// this fixture's Hebrew is the sealed candidate's licensed text, but its
// posture is still candidate-only, so the fixture door is the honest door.
await p.goto(`${B}/zone.html?b=${SLUG}&fixture=1`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
check("the fixture zone renders without a page error", !pageErr, pageErr || "clean");

// the book fills in as it is read; a claim about every site is a claim
// about a page that has finished arriving
await p.evaluate(async () => {
  let guard = 0;
  while (guard < 2000) {
    const next = document.querySelector("section.seg.seg-wait");
    if (!next) break;
    next.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 8));
    guard += 1;
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 80));
});
const carriers = overlay.map((r) => r.presentation.exact_mam_carrier.exact_presentation_text);
const rendered = await p.evaluate(() =>
  [...document.querySelectorAll("section.seg .he-text .wb .w")].map((w) => w.textContent));
check(`every carrier prints exactly as the source wrote it (${carriers.length} sites)`,
  carriers.length === rendered.length && carriers.every((c, i) => rendered[i] === c),
  carriers.length === rendered.length ? "all exact" : `${rendered.length} of ${carriers.length} rendered`);
check("no markup is shown as text", rendered.every((t) => !/mam-kq|class="|[<>]/.test(t)));

// 4 · each branch opens its own record; the line never moves
const kqProof = await p.evaluate(async () => {
  const wb = [...document.querySelectorAll("section.seg .he-text .wb.kq")][0];
  if (!wb) return { found: false };
  const lineBefore = wb.querySelector(".w").textContent;
  const segs = [...wb.querySelectorAll(".wr")];
  const heads = [];
  for (const seg of segs) {
    seg.click();
    await new Promise((r) => setTimeout(r, 900));
    const head = document.querySelector("#hud .head b");
    heads.push({
      pressed: seg.textContent,
      headText: head ? head.textContent : null,
      litInHead: head ? [...head.querySelectorAll("span")].filter((x) =>
        getComputedStyle(x).color !== "" && x.textContent === seg.textContent).length > 0 : false,
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 250));
  }
  return { found: true, segs: segs.length, heads, lineAfter: wb.querySelector(".w").textContent, lineBefore };
});
check("a pair's branches are each their own pressable way in",
  kqProof.found && kqProof.segs === 2, kqProof.found ? `${kqProof.segs} branches` : "no kq word rendered");
check("each branch opens a card about the whole occurrence",
  kqProof.found && kqProof.heads.every((h) => h.headText && h.headText.includes(h.pressed)),
  kqProof.found ? kqProof.heads.map((h) => `${h.pressed}→${h.headText ? "card" : "nothing"}`).join(" · ") : "");
check("choosing branches moved no character of the line",
  kqProof.found && kqProof.lineAfter === kqProof.lineBefore);

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
