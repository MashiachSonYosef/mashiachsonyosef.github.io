#!/usr/bin/env node
// A machine's title suggestion is a pointer at the work's own words, or it
// is nothing at all.
// GUARDS: suggested-title-rule-v1-a-guess-is-authored-by-name-and-witnessed-by-nothing
//
// FRAME v2.7 (owner, 2026-08-29): X is retired, and the machine's title
// suggestion is a DASHED PROTO-Y ROW inside Y's own machinery — never free
// text, never Z. The cargo is a C0 INTERVAL: the machine points at words of
// the work itself (the incipit model), the Hebrew displayed is the zone's
// words verbatim — surface and key — and the English arrives the way every
// English on this site arrives, through the ordinary route store, on words
// pressable to their witnesses and licenses. The dashed chip marks the one
// thing the machine actually did: SELECT the interval. Free English never
// prints (v2.6: extractive, not generative); a token that is not the work's
// own word never prints (the Hebrew anchor law, structural); an anonymous
// selector never prints (the authorship ruling, 2026-08-28). Graduation is
// a human confirming the pointer; until then the row stays dashed.
//
// No corpus suggestion exists yet, so this drives the register with fixture
// zones — served zones with title_suggestion attached by this check, never
// served — exactly the way the variant-site gate proves its presentation.
// What is asserted is the page's behavior, never a fact about the corpus.
//
// Run: node tools/check-suggested-title-v1.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// the fixture: a served zone, its own words untouched, a pointer attached.
// The interval is cut from the zone's own words — real surfaces, real keys,
// nothing typed by this check (the Hebrew anchor law, obeyed by the fixture
// the same way the cargo will have to obey it).
const served = zonesOnDisk()[0];
const zSrc = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${served}.bin`))).toString("utf8"));
const ownTokens = [];
outer: for (const sec of zSrc.sections || [])
  for (const w of sec.words || []) {
    if (w.s && w.k) ownTokens.push({ s: w.s, k: w.k });
    else if (Array.isArray(w.w) && w.w[0] && w.w[0].s && w.w[0].k) ownTokens.push({ s: w.w[0].s, k: w.w[0].k });
    if (ownTokens.length >= 2) break outer;
  }
if (ownTokens.length < 2) { console.log("SKIPPED — the first zone on disk offers fewer than two keyed words to point at"); process.exit(3); }
const SUG = {
  tokens: ownTokens,
  model: "fixture-model-1",
  run: "r-0001",
  date: "2026-08-28",
};
const FIXDIR = join(K3, "build", "sug-fixture");
mkdirSync(FIXDIR, { recursive: true });
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".bin": "application/octet-stream" };
const serveFixture = (slug, mutate) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${served}.bin`))).toString("utf8"));
  mutate(z);
  const file = join(FIXDIR, `${slug}.bin`);
  writeFileSync(file, gzipSync(Buffer.from(JSON.stringify(z), "utf8")));
  const srv = createServer((req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
    const path = p === `/data/zones/${slug}.bin` ? file : join(K3, p);
    try {
      const body = readFileSync(path);
      res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end("no"); }
  });
  return new Promise((r) => srv.listen(0, "127.0.0.1", () => r(srv)));
};

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
let pageErr = null; p.on("pageerror", (e) => { pageErr = e.message; });

// 1 · the fixture zone: the pointer prints — the work's own words, pressable,
// under the named model's dashed chip
const srv = await serveFixture("fixture-sug-v1", (z) => { z.title_suggestion = SUG; });
await p.goto(`http://127.0.0.1:${srv.address().port}/zone.html?b=fixture-sug-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForSelector("#workTitle .t-sug", { timeout: 15000 }).catch(() => {});
check("the fixture zone renders without a page error", !pageErr, pageErr || "clean");
const got = await p.evaluate(() => {
  const line = document.querySelector("#workTitle .t-sug");
  if (!line) return { found: false };
  const chip = line.querySelector(".sug-chip");
  const words = [...line.querySelectorAll(".title-row .wb")];
  return {
    found: true,
    text: line.textContent,
    chip: chip ? chip.textContent : null,
    chipTitle: chip ? chip.title : "",
    words: words.length,
    heWords: words.map((w) => (w.querySelector(".w") || w).textContent.trim()),
    glossed: words.filter((w) => { const g = w.querySelector(".g"); return g && g.textContent.trim(); }).length,
    pressable: words.filter((w) => w.style.cursor !== "default").length,
    licenseChipsInLine: line.querySelectorAll(".lic-chip").length,
    claimLabel: document.getElementById("enLab").textContent,
    bridgeNote: !!document.querySelector("#workTitle .t-note"),
  };
});
check("the pointer prints", got.found);
check("in the ruled sentence — a pointer, never a confirmation",
  got.found && /points at the work's own opening words as its title/.test(got.text)
    && /a pointer, not a confirmation/.test(got.text),
  (got.text || "").slice(0, 110));
check("its subject is the named model, never an anonymous category",
  got.chip === SUG.model && !/artificial intelligence|the website/i.test(got.text),
  got.chip || "NO CHIP");
check("the dashed chip marks the selection — run and date ride on it",
  got.found && got.chipTitle.includes(SUG.run) && got.chipTitle.includes(SUG.date)
    && /selected the interval/.test(got.chipTitle),
  got.chipTitle.slice(0, 80));
check("the interval is the work's own words, rendered as words",
  got.words === SUG.tokens.length && got.heWords.join(" ") === SUG.tokens.map((t) => t.s).join(" "),
  got.heWords.join(" "));
check("its English arrives by route, on the words themselves — no free text, no inline license",
  got.glossed > 0 && got.pressable > 0 && got.licenseChipsInLine === 0,
  `${got.glossed} of ${got.words} glossed · ${got.pressable} pressable`);
check("it stands under the bridge register, never as a claim",
  got.found && /recorded in the bridge as/.test(got.claimLabel) && got.bridgeNote,
  got.claimLabel);
srv.close();

// 1b · free English cargo — the retired shape — never prints: the machine
// does not author, and v2.6's law is extractive, not generative
const srvB = await serveFixture("fixture-sug-freetext-v1", (z) => {
  z.title_suggestion = { text: "The Fixture Scroll", model: "fixture-model-1", run: "r-0001",
    date: "2026-08-28", license: "TEST-LICENSE-1.0", m_label: "the fixture's instrument witness" };
});
await p.goto(`http://127.0.0.1:${srvB.address().port}/zone.html?b=fixture-sug-freetext-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
check("free English cargo — no interval — never prints",
  !(await p.evaluate(() => !!document.querySelector("#workTitle .t-sug"))));
srvB.close();

// 1c · tokens that are not the work's own words never print: the Hebrew
// anchor law is structural, and the page checks the interval against the
// zone's own words, surface and key, verbatim. The alien token is derived
// by mutation — a real surface doubled — so this file types no Hebrew.
const srvC = await serveFixture("fixture-sug-alien-v1", (z) => {
  z.title_suggestion = { ...SUG, tokens: [{ s: ownTokens[0].s + ownTokens[0].s, k: ownTokens[0].k }] };
});
await p.goto(`http://127.0.0.1:${srvC.address().port}/zone.html?b=fixture-sug-alien-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
check("tokens that are not the work's own words never print",
  !(await p.evaluate(() => !!document.querySelector("#workTitle .t-sug"))));
srvC.close();

// 1d · an anonymous selector never prints
const srvD = await serveFixture("fixture-sug-anon-v1", (z) => {
  z.title_suggestion = { tokens: SUG.tokens, run: "r-0001", date: "2026-08-28" };
});
await p.goto(`http://127.0.0.1:${srvD.address().port}/zone.html?b=fixture-sug-anon-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
check("an anonymous selector never prints", !(await p.evaluate(() => !!document.querySelector("#workTitle .t-sug"))));
srvD.close();

// 2 · the same zone without a suggestion: the register does not exist
const srvE = await serveFixture("fixture-sug-none-v1", () => {});
await p.goto(`http://127.0.0.1:${srvE.address().port}/zone.html?b=fixture-sug-none-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
check("a zone carrying no suggestion prints no pointer",
  !(await p.evaluate(() => !!document.querySelector("#workTitle .t-sug"))));
srvE.close();

// 3 · a pointer coexisting with a witnessed title — the owner's ruling,
// 2026-08-28: "either keep them in the drawer or a level hidden." The
// surface is the witness's; the pointer folds one level down and opens only
// on a press that names what it holds.
const srv2 = await serveFixture("fixture-sug-wit-v1", (z) => {
  z.title_suggestion = SUG;
  const w0 = z.sections[0].words.find((w) => w.k || w.w);
  z.work_he_tokens = [w0.w ? { s: w0.s, k: w0.w[0].k } : { s: w0.s, k: w0.k }];
  z.work_he = w0.s;
});
await p.goto(`http://127.0.0.1:${srv2.address().port}/zone.html?b=fixture-sug-wit-v1&fixture=1`, { waitUntil: "networkidle" });
await p.waitForSelector("#workTitle .sug-fold", { timeout: 15000 }).catch(() => {});
const drawer = await p.evaluate(async () => {
  const openLine = !!document.querySelector("#workTitle .t-sug");
  const fold = document.querySelector("#workTitle .sug-fold");
  if (!fold) return { fold: false, openLine };
  const label = fold.textContent;
  fold.click();
  await new Promise((r) => setTimeout(r, 150));
  const after = document.querySelector("#workTitle .t-sug");
  const shown = after ? after.textContent : "";
  fold.click();
  await new Promise((r) => setTimeout(r, 150));
  const closed = !document.querySelector("#workTitle .t-sug");
  return { fold: true, openLine, label, shown, closed,
           witnessShown: !!document.querySelector("#workTitle .he-t .wb") };
});
check("beside a witnessed title, no pointer stands on the surface", drawer.fold && !drawer.openLine);
check("the drawer names what it holds before it opens",
  drawer.fold && /machine's guess/.test(drawer.label || ""), drawer.label || "");
check("pressed, it reads the same ruled sentence",
  /points at the work's own opening words/.test(drawer.shown || "") && /a pointer, not a confirmation/.test(drawer.shown || ""),
  (drawer.shown || "").slice(0, 80));
check("pressed again, it folds away and the witness keeps the surface",
  drawer.closed && drawer.witnessShown);
srv2.close();

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
