#!/usr/bin/env node
// A machine's guess prints as a guess, authored by name, or it does not print.
// GUARDS: suggested-title-rule-v1-a-guess-is-authored-by-name-and-witnessed-by-nothing
//
// The frame's provenance ladder gives titles four states: witnessed,
// editorial, suggested, absent. The suggested rung is the only one a machine
// can occupy, and the owner's ruling (2026-08-28) fixed its register: the
// sentence states the act plainly ("guesses"), states the gap plainly ("not
// witnessed by this work"), and its subject is the NAMED model — never an
// anonymous category — because an attribution that cannot be audited is not
// an attribution. The chip it wears is an attribution chip, dashed where a
// license chip is solid, and no license chip may ever stand in this
// register, because the absence of a license IS the register's honesty.
//
// No corpus suggestion exists yet, so this drives the register with a
// fixture zone — a served zone with title_suggestion attached by this check,
// never served — exactly the way the variant-site gate proves its
// presentation. What is asserted is the page's behavior, never a fact about
// the corpus. The claim register's precedence is structural (the guess lives
// only in the no-claim branch), and this check proves the no-claim side:
// the guess prints UNDER the bridge register, never as a claim.
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

// the fixture: a served zone, its own words untouched, a guess attached
const served = zonesOnDisk()[0];
const SUG = {
  text: "The Fixture Scroll",
  model: "fixture-model-1",
  run: "r-0001",
  date: "2026-08-28",
};
const FIXDIR = join(K3, "build", "sug-fixture");
mkdirSync(FIXDIR, { recursive: true });
const FIX = join(FIXDIR, "fixture-sug-v1.bin");
const SLUG = "fixture-sug-v1";
const zf = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${served}.bin`))).toString("utf8"));
zf.title_suggestion = SUG;
writeFileSync(FIX, gzipSync(Buffer.from(JSON.stringify(zf), "utf8")));

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".bin": "application/octet-stream" };
const srv = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
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

// 1 · the fixture zone: the guess prints, in the ruled sentence, by name
await p.goto(`${B}/zone.html?b=${SLUG}&fixture=1`, { waitUntil: "networkidle" });
await p.waitForSelector("#workTitle .t-sug", { timeout: 15000 }).catch(() => {});
check("the fixture zone renders without a page error", !pageErr, pageErr || "clean");
const got = await p.evaluate(() => {
  const line = document.querySelector("#workTitle .t-sug");
  if (!line) return { found: false };
  const chip = line.querySelector(".sug-chip");
  return {
    found: true,
    text: line.textContent,
    chip: chip ? chip.textContent : null,
    chipIsLicense: chip ? chip.classList.contains("lic-chip") : null,
    chipTitle: chip ? chip.title : "",
    licenseChipsInLine: line.querySelectorAll(".lic-chip").length,
    claimLabel: document.getElementById("enLab").textContent,
    bridgeNote: !!document.querySelector("#workTitle .t-note"),
  };
});
check("the guess prints", got.found);
check("in the ruled sentence — the act and the gap both plain",
  got.found && /guesses the title is/.test(got.text) && got.text.includes(SUG.text)
    && /but that is not witnessed by this work/.test(got.text),
  (got.text || "").slice(0, 110));
check("its subject is the named model, never an anonymous category",
  got.chip === SUG.model && !/artificial intelligence|the website/i.test(got.text),
  got.chip || "NO CHIP");
check("the chip is an attribution and says so — run and date ride on it",
  got.found && got.chipIsLicense === false && got.licenseChipsInLine === 0
    && got.chipTitle.includes(SUG.run) && got.chipTitle.includes(SUG.date)
    && /not a license/.test(got.chipTitle),
  got.chipTitle.slice(0, 80));
check("it stands under the bridge register, never as a claim",
  got.found && /recorded in the bridge as/.test(got.claimLabel) && got.bridgeNote,
  got.claimLabel);

// 2 · the same zone without a suggestion: the register does not exist
await p.goto(`${B}/${served}`, { waitUntil: "networkidle" });
const none = await p.evaluate(() => !!document.querySelector("#workTitle .t-sug"));
check("a zone carrying no suggestion prints no guess", !none);

// 3 · a guess coexisting with a witnessed title — the owner's ruling,
// 2026-08-28: "either keep them in the drawer or a level hidden." The
// surface is the witness's; the guess folds one level down and opens only
// on a press that names what it holds.
const FIX2 = join(FIXDIR, "fixture-sug-wit-v1.bin");
const SLUG2 = "fixture-sug-wit-v1";
const zf2 = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${served}.bin`))).toString("utf8"));
zf2.title_suggestion = SUG;
// a witnessed title, cut from the zone's own first words — real surfaces,
// real keys, nothing typed by this check
const w0 = zf2.sections[0].words.find((w) => w.k || w.w);
zf2.work_he_tokens = [w0.w ? { s: w0.s, k: w0.w[0].k } : { s: w0.s, k: w0.k }];
zf2.work_he = w0.s;
writeFileSync(FIX2, gzipSync(Buffer.from(JSON.stringify(zf2), "utf8")));
const srv2 = createServer((req, res) => {
  const p2 = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
  const path = p2 === `/data/zones/${SLUG2}.bin` ? FIX2 : join(K3, p2);
  try {
    const body = readFileSync(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv2.listen(0, "127.0.0.1", r));
await p.goto(`http://127.0.0.1:${srv2.address().port}/zone.html?b=${SLUG2}&fixture=1`, { waitUntil: "networkidle" });
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
check("beside a witnessed title, no guess stands on the surface", drawer.fold && !drawer.openLine);
check("the drawer names what it holds before it opens",
  drawer.fold && /machine's guess/.test(drawer.label || ""), drawer.label || "");
check("pressed, it reads the same ruled sentence",
  /guesses the title is/.test(drawer.shown || "") && /not witnessed by this work/.test(drawer.shown || ""),
  (drawer.shown || "").slice(0, 80));
check("pressed again, it folds away and the witness keeps the surface",
  drawer.closed && drawer.witnessShown);
srv2.close();

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
