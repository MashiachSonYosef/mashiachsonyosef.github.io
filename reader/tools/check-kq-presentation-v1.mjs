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
      roleSaid: (document.querySelector("#hud .kq-role") || {}).textContent || "",
      keySaid: (document.querySelector("#hud .kq-key") || {}).textContent || "",
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
// the roles are said on the card in words — hover titles do not exist on a
// phone; the ketiv branch says ketiv, the qere says qere
check("each branch's card says which half it is, in words",
  kqProof.found
    && kqProof.heads.some((h) => /^ketiv/.test(h.roleSaid))
    && kqProof.heads.some((h) => /^qere/.test(h.roleSaid)),
  kqProof.found ? kqProof.heads.map((h) => h.roleSaid || "(silent)").join(" · ") : "");
// the notation's key sits beside the selector on every branch card — both
// mappings at once, the marks teaching their own meaning
check("the card carries the notation's key, both mappings",
  kqProof.found && kqProof.heads.every((h) =>
    /\( \).*ketiv/.test(h.keySaid) && /\[ \].*qere/.test(h.keySaid)),
  kqProof.found ? (kqProof.heads[0].keySaid || "(absent)").slice(0, 70) : "");
// and the scribes' story, mechanism only — the received letters unchanged,
// the reading recorded beside them — because the motive is disputed and the
// card prints only what is attested
check("the card says why the pair exists, in one attested sentence",
  kqProof.found && kqProof.heads.every((h) =>
    /scribes changed nothing/.test(h.keySaid) && /recorded beside/.test(h.keySaid)),
  kqProof.found ? "mechanism stated, motive left to the record" : "");

// 5 · the provenance mark: the half the shown English reads from wears the
// mark, and a ruling on a branch moves the mark to that branch — while the
// carrier itself never changes by a byte. The mark is provenance of the
// gloss, never a choice about the text.
const markProof = await p.evaluate(async () => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb.kq")];
  const pillsOf = () => [...document.querySelectorAll("#hud .r-pills button")];
  const esc = async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await new Promise((r) => setTimeout(r, 250)); };
  for (const wb of wbs) {
    const segs = [...wb.querySelectorAll(".wr")];
    if (segs.length !== 2) continue;
    const lineBefore = wb.querySelector(".w").textContent;
    const rulings = [];
    for (let i = 0; i < 2; i += 1) {
      segs[i].click();
      await new Promise((r) => setTimeout(r, 900));
      const pills = pillsOf();
      if (!pills.length) { await esc(); continue; }
      pills[0].click();
      await new Promise((r) => setTimeout(r, 350));
      rulings.push({
        idx: i,
        marked: segs.map((s) => s.classList.contains("backs-en")),
        gloss: (wb.querySelector(".g") || {}).textContent || "",
        pill: pills[0].textContent,
      });
      await esc();
    }
    if (rulings.length) return {
      found: true, rulings,
      lineAfter: wb.querySelector(".w").textContent, lineBefore,
    };
  }
  return { found: false };
});
check("ruling on a branch marks that half as the English's source",
  markProof.found && markProof.rulings.every((r) =>
    r.marked[r.idx] === true && r.marked[1 - r.idx] === false && r.gloss === r.pill),
  markProof.found
    ? markProof.rulings.map((r) => `branch ${r.idx}: marked ${r.marked.join("/")} · gloss "${r.gloss.slice(0, 24)}"`).join(" · ")
    : "no pair with pooled readings to rule on");
check("the mark moves between halves when the ruling moves",
  markProof.found && (markProof.rulings.length < 2
    || markProof.rulings[0].marked.join() !== markProof.rulings[1].marked.join()),
  markProof.found ? `${markProof.rulings.length} branch(es) poolable` : "");
check("the provenance mark moved no character of the carrier",
  markProof.found && markProof.lineAfter === markProof.lineBefore);

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
