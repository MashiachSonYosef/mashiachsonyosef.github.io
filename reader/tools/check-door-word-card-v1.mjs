#!/usr/bin/env node
// A word on the door opens its own record, and a word that titles a book
// carries the way into that book as a layer of the same card.
// GUARDS: front-door-rule-v1-the-door-lists-what-the-zones-carry, title-key-rule-v1-only-what-the-store-already-attests
//
// The door prints corpus words — family names, and the Hebrew title of every
// book whose ledger records one. Every one of them is pressable and answers
// out of the same route store the reader reads, by the same law: the readings
// its sources attest, oldest first, each with the license of the record it is
// cited from. None of that had a check. The door's main gesture was the one
// thing on this site nobody was watching.
//
// The book layer is the newer half. A title used to be a link: press it and
// you were inside the book before you had read the word, which made the title
// the only corpus word on the page a reader could not question. Now the book
// rides on the word as a band of its card — the record first, the way in
// under it — and a title of several words gives that layer to each of them.
//
// Today no served book has a ledger title, so no title word exists to press.
// Rather than skip the mechanism entirely, this attaches the layer to a real
// word itself and holds the page to what it must then do — an instrument,
// declared as one, the same way the store gate deliberately corrupts a byte
// to watch the refusal work. What is asserted is the page's behavior, never
// a fact about the corpus.
//
// Run: node tools/check-door-word-card-v1.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const SITE = join(K3, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json" };
const srv = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  try {
    let file = join(SITE, p);
    if (!extname(p)) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${B}/`, { waitUntil: "networkidle" });

// 1 · a printed word opens its own record
const rec = await p.evaluate(async () => {
  const w = document.querySelector(".fam-he .fw[data-k]");
  if (!w) return { found: false };
  const pressed = w.textContent;
  w.click();
  await new Promise((r) => setTimeout(r, 1500));
  const card = document.getElementById("wcard");
  return {
    found: true, pressed,
    open: !card.hidden,
    head: card.querySelector(".head b").textContent,
    reading: card.querySelector(".r-now .v").textContent.trim(),
    pills: card.querySelectorAll(".r-pills button").length,
    prov: card.querySelector(".prov").textContent.trim(),
  };
});
check("a word the door prints opens its own record", rec.found && rec.open,
  rec.found ? `pressed ${rec.pressed}` : "the door printed no pressable word");
check("the card is about the word that was pressed", rec.found && rec.head === rec.pressed, rec.head);
check("it answers out of the store, with routes to select",
  rec.found && rec.pills > 0 && /route store|store/.test(rec.prov),
  rec.found ? `${rec.pills} routes · ${rec.prov.slice(0, 60)}` : "");

// 2 · a word that titles no book offers no way into one
const bare = await p.evaluate(async () => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 200));
  const w = [...document.querySelectorAll(".fam-he .fw[data-k]")].find((x) => !x.hasAttribute("data-book"));
  if (!w) return { found: false };
  w.click();
  await new Promise((r) => setTimeout(r, 900));
  const band = document.querySelector("#wcard .w-open");
  return { found: true, hidden: band.hidden, empty: band.querySelector(".slot").children.length === 0 };
});
check("a word that titles no book offers no way into one",
  bare.found && bare.hidden && bare.empty);

// 3 · the book layer, driven by this check rather than by the corpus
const served = zonesOnDisk()[0];
const layer = await p.evaluate(async (slug) => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 200));
  const w = document.querySelector(".fam-he .fw[data-k]");
  w.setAttribute("data-book", `/${slug}`);
  w.setAttribute("data-bookname", slug.replace(/-/g, " "));
  w.click();
  await new Promise((r) => setTimeout(r, 1200));
  const card = document.getElementById("wcard");
  const band = card.querySelector(".w-open");
  const a = band.querySelector("a.wo-link");
  const rows = [...card.children];
  return {
    shown: !band.hidden,
    href: a && a.getAttribute("href"),
    says: a && a.textContent,
    label: band.querySelector(".lab").textContent,
    note: (band.querySelector(".of") || {}).textContent || "",
    aboveReadings: rows.indexOf(band) < rows.indexOf(card.querySelector(".r-now")),
    readingsStillThere: !!card.querySelector(".r-now") && card.querySelectorAll(".r-pills button").length > 0,
  };
}, served);
check("a word that titles a book carries the way into it", layer.shown && layer.href === `/${served}`,
  `${layer.says} → ${layer.href}`);
// The owner's rulings, both: the name itself is the link — a separate
// function from the title's words, which open records — and the label is a
// claim that follows the evidence. This pass attached no force license, so
// the band must stand in the bridge's register with the awaiting note.
check("an unbacked name stands in the bridge's register, with the note",
  /recorded in the bridge as/.test(layer.label || "") && layer.says === served.replace(/-/g, " ")
    && /awaits an attested usage/.test(layer.note || ""),
  `${layer.label} · ${layer.says} · ${layer.note || "(no note)"}`);
// and with an attestation attached, the claim label prints with its chip —
// who attests the usage, never who permits it (FRAME v2.7: a name is an
// identification, not licensed expression)
const claimed = await p.evaluate(async () => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 200));
  const w = document.querySelector(".fam-he .fw[data-k][data-book]");
  w.setAttribute("data-bookatt", "attested: the fixture's instrument witness");
  w.setAttribute("data-bookatttitle", "the fixture's instrument witness — attests this usage");
  w.click();
  await new Promise((r) => setTimeout(r, 900));
  const band = document.querySelector("#wcard .w-open");
  return { label: band.querySelector(".lab").textContent,
           chip: (band.querySelector(".chip") || {}).textContent || "" };
});
check("a backed name takes the claim label with its attestation beside it",
  /commonly force read as/.test(claimed.label) && claimed.chip === "attested: the fixture's instrument witness",
  `${claimed.label} · ${claimed.chip || "NO CHIP"}`);
check("the record is read first and the book entered under it", layer.aboveReadings);
check("and the word's own routes are still there beneath it", layer.readingsStillThere);

// 4 · pressing the force-read name lands in the book itself
await Promise.all([
  p.waitForNavigation({ waitUntil: "domcontentloaded" }),
  p.click("#wcard .w-open a.wo-link"),
]);
const landed = await p.evaluate(() => location.pathname);
check("pressing it opens right to the book", landed.replace(/\/$/, "") === `/${served}`, landed);
await p.goBack({ waitUntil: "networkidle" });

// 5 · the card lets go
const shut = await p.evaluate(async () => {
  const w = document.querySelector(".fam-he .fw[data-k]");
  w.click();
  await new Promise((r) => setTimeout(r, 600));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 300));
  return { card: document.getElementById("wcard").hidden, shade: document.getElementById("wshade").hidden };
});
check("the card closes and gives the page back", shut.card && shut.shade);

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
