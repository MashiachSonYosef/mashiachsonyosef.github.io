#!/usr/bin/env node
// GUARDS: front-door-rule-v2
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RULE. zone.html declares it directly above the press it governs:
//
//   "front-door-rule-v2 · ?t=open lands the reader inside the title's own
//    record. The door shows a book's Hebrew name to readers who cannot read
//    it — 'gibberish', as its owner puts it — and the answer to gibberish in
//    this project is never the force-read: it is the word's own record.
//    Pressing the title on the door arrives here with that word already open,
//    its readings sorted oldest source first, exactly as any word in the text
//    opens. It presses what a finger would press — the first openable title
//    token — and waits for it to exist rather than assuming the page is done."
//
// WHY IT EXISTS. The door lists every book under its Hebrew name. A reader
// who cannot read that name presses it and is owed what any word on any page
// gives: the card, open on that word, with the catalog's readings in the
// order the reader's law puts them. A door that dropped the reader at the top
// of the book with the card shut would deliver them to the thing they asked
// about and leave them to go and find it. The page knows one way to open a
// word, the way every word in the text opens, and the press goes through
// that one way. This check watches the press land.
//
// The order it checks for is the page's own, stated where the pool is built:
// "oldest source leads, post-1940 and unyeared sources last." So a source
// dated 1940 or earlier leads by year, and later or undated sources follow.
// The year and the source ride on each pill's hover text, which is what this
// check reads back.
//
// The laws:
//
//   L1  the page still declares the rule and still presses the title on ?t=open
//   L2  the shelf carries titles that can open: zones whose title tokens carry
//       a key, attached only where the store answers (title-key-rule-v1)
//   L3  on every such zone the FIRST title token is the openable one, so the
//       press as written lands on a word and not on a token that opens nothing
//   L4  with ?t=open the card is open once the page has settled
//   L5  it is open on the title's first token: that token is marked pressed
//       and the card's head reads the token's surface as the bin records it
//   L6  the readings on the card stand oldest source first, in the page's own
//       stated order
//   L7  without ?t=open the card stays shut after the same wait and no title
//       token is marked pressed
//
// L1 to L3 read the page and the shelf off disk. L4 to L7 open a page in a
// browser. The zone handed to this run is used when its title can open; a
// zone with no Hebrew title has no door of this kind, so the page half then
// moves to the nearest zone whose title does open, and says so. When the
// handed zone's title carries a single reading, the order law is asked again
// on a zone whose title carries several, because an order over one thing is
// not an order.
//
// What this does NOT prove: that the readings shown are right, that the title
// key was attached lawfully (title-key-rule-v1 has its own check), or that the
// door itself sends ?t=open (the door's checks answer for the door). It
// watches one page arrive on one or two zones, and reads the shelf off disk
// for the rest.
//
// Run: node tools/check-front-door-opens-title-v1.mjs [zone-url]
//        [--zones data/zones] [--page zone.html]
//        [--store data/route-store/index.json] [--serve-root .]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesOnDisk, zoneIdOf } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const PAGE = arg("page", join(K3, "zone.html"));
const STORE = arg("store", join(K3, "data", "route-store", "index.json"));
// The directory served when the url's host does not answer. The suite serves
// the reader directory at its root, so that is the default here too.
const SERVE_ROOT = arg("serve-root", K3);

const RULE = "front-door-rule-v2";
const PRESS = 'QUERY.get("t") === "open"';
const TOKEN = '"#workTitle .he-t .wb"';
// The page's own tier line, quoted from where the pool is sorted. A check
// that chose its own cutoff would pass against a page that had moved it.
const CUTOFF = 1940;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ── the page's text ───────────────────────────────────────────────────────
if (!existsSync(PAGE)) { console.log(`SKIPPED — no page at ${PAGE}, so the rule this check enforces cannot be quoted`); process.exit(3); }
const pageLines = readFileSync(PAGE, "utf8").split("\n");
const lineOf = (needle) => pageLines.findIndex((l) => l.includes(needle)) + 1;
const declaredAt = lineOf(RULE), pressAt = lineOf(PRESS), tokenAt = lineOf(TOKEN);

// L1 — the rule is still declared and the press it governs is still there.
check("L1  the page still declares the rule and presses the title on ?t=open",
  declaredAt > 0 && pressAt > 0 && tokenAt > 0,
  declaredAt > 0
    ? `declared at line ${declaredAt} · press at ${pressAt || "(gone)"} · on #workTitle .he-t .wb at ${tokenAt || "(gone)"}`
    : `${RULE} is gone from the page — this check has no authority until it is back`);

// ── the shelf ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const slugs = zonesOnDisk(ZONES);
if (!slugs.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

// slug -> the title tokens the bin carries, for every zone whose title can open
const titles = new Map();
let zonesRead = 0;
for (const s of slugs) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${s}.bin`))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const T = Array.isArray(z.work_he_tokens) ? z.work_he_tokens : [];
  if (T.some((t) => t && t.k)) titles.set(s, T);
}
const openable = [...titles.keys()];
const opensFirst = (s) => titles.has(s) && !!((titles.get(s)[0] || {}).k);
const firstShut = openable.filter((s) => !opensFirst(s));

console.log(`\n— ${zonesRead} zones · ${openable.length} titles can open —\n`);

// L2 — there is something for the door to press.
check("L2  the shelf carries titles that can open",
  openable.length > 0,
  openable.length
    ? `${openable.length} of ${zonesRead} zones carry a keyed title token; ${zonesRead - openable.length} carry no Hebrew title or no key`
    : "no title on this shelf carries a key, so ?t=open lands nowhere on every book");

// L3 — the press as written takes the first token. Where the first token is
// not the openable one, the door presses something that opens nothing.
check("L3  on every zone whose title can open, the first title token is the one that opens",
  firstShut.length === 0,
  firstShut.length
    ? `${firstShut.length} title(s) open only past their first token — ${firstShut.slice(0, 4).join(" · ")}`
    : `every one of the ${openable.length} presses lands on a keyed token`);

// ── the store, for choosing a title worth ordering ────────────────────────
// A title token's readings, as the store holds them, so the page half can be
// pointed at a title carrying more than one dated source. The shard rule is
// the store's own: sha256 of the key, first two hex characters.
const mHeld = new Set();
if (existsSync(STORE)) {
  try { for (const k of Object.keys(JSON.parse(readFileSync(STORE, "utf8")).m_sources || {})) mHeld.add(k); } catch { /* no store to ask */ }
}
const SHARDS = join(dirname(STORE), "shards");
const shardCache = new Map();
const yearsFor = (key) => {
  if (!mHeld.size) return new Set();
  const shard = createHash("sha256").update(String(key), "utf8").digest("hex").slice(0, 2);
  if (!shardCache.has(shard)) {
    let d = null;
    try { d = JSON.parse(gunzipSync(readFileSync(join(SHARDS, `${shard}.bin`))).toString("utf8")); } catch { d = null; }
    shardCache.set(shard, d);
  }
  const rows = (shardCache.get(shard) || {})[key] || [];
  return new Set(rows.filter((r) => mHeld.has(r[3])).map((r) => Number.parseInt(r[4], 10)).filter(Number.isInteger));
};
const severalYears = (s) => opensFirst(s) && yearsFor(titles.get(s)[0].k).size > 1;

// ── the page ──────────────────────────────────────────────────────────────
if (!openable.length) {
  console.log("\nSKIPPED the page half — no title on this shelf can open, so there is nothing to watch land");
  console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
  process.exit(bad ? 1 : 0);
}

const handed = defaultZoneUrl(process.argv[2], ZONES);
const handedUrl = new URL(handed);
const handedSlug = zoneIdOf(handed);
let slug = handedSlug;
if (!opensFirst(slug)) {
  const next = openable.find(severalYears) || openable.find(opensFirst);
  console.log(`  --  ${slug || "(no zone in the url)"} carries no title that opens; the page half runs on ${next}`);
  slug = next;
}

// The server. If the url's host answers it is used; if not, one is started
// here on the reader directory and stopped when the run ends, so a silent
// port reads as nothing more than a silent port.
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" };
let srv = null;
let base = `${handedUrl.origin}${handedUrl.pathname}`;
const answers = await fetch(base, { signal: AbortSignal.timeout(2000) }).then((r) => r.ok).catch(() => false);
if (!answers) {
  srv = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    try {
      let file = join(SERVE_ROOT, p);
      if (!extname(p)) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end("no"); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${srv.address().port}${handedUrl.pathname}`;
  console.log(`  --  ${handedUrl.origin} did not answer; serving ${SERVE_ROOT} at ${base}`);
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const p = await browser.newPage({ viewport: { width: 412, height: 915 } });
const pageErrors = [];
p.on("pageerror", (e) => pageErrors.push(e.message));

// One arrival. The title is drawn after the bin lands, so nothing can be
// pressed before it exists; with ?t=open the wait continues until the card
// is open and its readings row has settled one way or the other.
const arrive = async (zoneSlug, withT) => {
  const url = `${base}?b=${encodeURIComponent(zoneSlug)}${withT ? "&t=open" : ""}`;
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("#workTitle .he-t .wb", { timeout: 30000 }).catch(() => {});
  if (withT) {
    await p.waitForFunction(() => { const h = document.getElementById("hud"); return !!h && !h.hidden; }, null, { timeout: 30000 }).catch(() => {});
    await p.waitForFunction(() => !!document.querySelector("#hud .r-pills button")
      || [...document.querySelectorAll("#hud .b-read p")].some((x) => /route in the catalog/.test(x.textContent)),
    null, { timeout: 30000 }).catch(() => {});
  } else {
    // the press, when there is one, polls every 60ms for up to 4s after load;
    // a card still shut well past that is a card that was never opened
    await p.waitForTimeout(2500);
  }
  return p.evaluate(() => {
    const hud = document.getElementById("hud");
    const toks = [...document.querySelectorAll("#workTitle .he-t .wb")];
    const first = toks[0] || null;
    const head = document.querySelector("#hud .head b");
    return {
      drawn: toks.length,
      open: !!hud && !hud.hidden,
      firstText: first ? (first.querySelector(".w") || first).textContent.trim() : null,
      activeIndex: toks.findIndex((t) => t.classList.contains("active")),
      activeAnywhere: document.querySelectorAll(".wb.active").length,
      head: head ? head.textContent.trim() : null,
      readLabel: ((document.querySelector("#hud .b-read .r-label") || {}).textContent || "").trim(),
      pills: [...document.querySelectorAll("#hud .r-pills button")].map((b) => ({ text: b.textContent.trim(), title: b.title })),
      note: [...document.querySelectorAll("#hud .b-read p:not(.r-label)")].map((x) => x.textContent.trim()).join(" "),
    };
  });
};

// The order the page states, read back off the pills' hover text: year and
// source, or "no source year" and source.
const orderOf = (pills) => {
  const seq = pills.map((b) => {
    const y = Number.parseInt(String(b.title).split(" · ")[0], 10);
    const yr = Number.isInteger(y) ? y : Infinity;
    return { yr, tier: yr <= CUTOFF ? 0 : 1, title: b.title };
  });
  const breaks = [];
  for (let i = 1; i < seq.length; i += 1) {
    const a = seq[i - 1], b = seq[i];
    if (b.tier < a.tier || (b.tier === a.tier && b.yr < a.yr)) breaks.push(`${a.title} stands before ${b.title}`);
  }
  return { seq, breaks };
};

const tok0 = titles.get(slug)[0];
const got = await arrive(slug, true);

// L4 — the card is open.
check("L4  with ?t=open the card is open once the page has settled",
  got.open,
  got.open ? `open on ${slug}` : `shut on ${slug} · ${got.drawn} title token(s) drawn${got.drawn ? "" : " — nothing to press"}`);

// L5 — and open on the title's first token, which the bin names.
const onTitle = got.open && got.activeIndex === 0 && got.head === String(tok0.s).trim();
check("L5  it is open on the title's first token",
  onTitle,
  onTitle
    ? `token 0 is marked pressed and the card head reads ${got.head}`
    : `pressed token index ${got.activeIndex} (${got.activeAnywhere} marked anywhere) · head ${JSON.stringify(got.head)} · bin says ${JSON.stringify(tok0.s)} · page draws ${JSON.stringify(got.firstText)}`);

// L6 — the readings stand oldest source first. Asked of the handed zone when
// its title carries several readings; otherwise of a zone whose title does.
let ordered = { slug, pills: got.pills, label: got.readLabel, note: got.note };
if (got.pills.length < 2) {
  const richer = openable.find((s) => s !== slug && severalYears(s));
  if (richer) {
    console.log(`  --  ${slug}'s title carries ${got.pills.length} reading(s); the order law is asked of ${richer}`);
    const again = await arrive(richer, true);
    ordered = { slug: richer, pills: again.pills, label: again.readLabel, note: again.note };
  }
}
const { seq, breaks } = orderOf(ordered.pills);
const lead = seq.slice(0, 3).map((r) => r.title).join(" | ");
check("L6  the readings on the card stand oldest source first",
  seq.length > 1 && breaks.length === 0,
  seq.length > 1
    ? (breaks.length ? `${breaks.length} out of order — ${breaks.slice(0, 2).join(" · ")}` : `${seq.length} readings on ${ordered.slug} · leads ${lead}`)
    : `${seq.length} reading(s) on ${ordered.slug} — ${ordered.label || "no readings row"} ${ordered.note ? "· " + ordered.note : ""}— an order over one thing was not shown`);

// L7 — the negative: the same zone, no ?t=open, and the card stays shut.
const plain = await arrive(slug, false);
check("L7  without ?t=open the card stays shut and no title token is pressed",
  !plain.open && plain.activeAnywhere === 0 && plain.drawn > 0,
  !plain.open && plain.activeAnywhere === 0
    ? `${plain.drawn} title token(s) drawn, none pressed, card shut`
    : `card ${plain.open ? "open" : "shut"} · ${plain.activeAnywhere} token(s) marked pressed on a plain load`);

await browser.close();
if (srv) srv.close();
if (pageErrors.length) {
  console.log(`\n  note: the page raised ${pageErrors.length} error(s) while this ran — ${pageErrors.slice(0, 2).join(" · ").slice(0, 200)}`);
}

console.log("\n  what this does not say: that the door sends ?t=open, or that the readings");
console.log("  shown are true, or that the title key was lawfully attached. It says that a");
console.log("  page asked to open on its title does, on that word, in the stated order,");
console.log("  and that a page not asked to does not.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
