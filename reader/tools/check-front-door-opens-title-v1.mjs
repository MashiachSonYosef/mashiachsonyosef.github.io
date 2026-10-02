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
// browser. The zone handed to this run is used when its title opens at its
// first token; otherwise the page half moves to the nearest zone whose title
// does, and says so. When no title on the shelf opens at its first token, the
// page half still runs, on the first title that can open at all, so that L4
// to L7 judge the press missing rather than not being asked. When the zone's
// title carries a single reading, the order law is asked again on a zone
// whose title carries several, because an order over one thing is not an
// order.
//
// WHERE THE BROWSER LOOKS. A url may be handed as the first bare argument.
// With no --page and no --serve-root, the url's host is asked; if it answers,
// the browser judges what that server serves, and the run says so, because a
// live server is not necessarily serving the file L1 quoted. If it does not
// answer, the reader directory is served here. With --page or --serve-root,
// the run never asks the url's host: it serves the named root itself, so a
// fixture pointed at by a flag is what the browser sees, whatever else is
// listening. When --zones is given, the served root answers data/zones/ from
// that directory, so the shelf the disk half read is the shelf the page
// loads.
//
// What this does NOT prove: that the readings shown are right, that the title
// key was attached lawfully (title-key-rule-v1 has its own check), or that the
// door itself sends ?t=open (the door's checks answer for the door). It
// watches one page arrive on one or two zones, and reads the shelf off disk
// for the rest.
//
// Run: node tools/check-front-door-opens-title-v1.mjs [zone-url]
//        [--zones data/zones] [--page <serve-root>/zone.html]
//        [--store data/route-store/index.json] [--serve-root .]
import { readFileSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, join, extname, normalize, resolve, relative, isAbsolute, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesOnDisk, zoneIdOf } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
// A flag with nothing after it is a flag with no value, not a value of
// undefined: it falls to the default rather than throwing in resolve().
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
// The one bare argument, if any, is the url. A flag's value is not a url, so
// the walk steps over every --flag and the value after it.
const FLAGS = new Set(["zones", "page", "store", "serve-root"]);
const positional = (() => {
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].startsWith("--")) { if (FLAGS.has(a[i].slice(2))) i += 1; continue; }
    return a[i];
  }
  return null;
})();
const ZONES_GIVEN = arg("zones", null);
const ZONES = ZONES_GIVEN ? resolve(ZONES_GIVEN) : join(K3, "data", "zones");
const STORE = arg("store", join(K3, "data", "route-store", "index.json"));
// The page and the root it is served from are one decision. Naming a root
// serves that root's zone.html; naming a page serves the page's own
// directory; naming neither serves the reader directory, which is what the
// suite serves at its root too.
const PAGE_GIVEN = arg("page", null);
const ROOT_GIVEN = arg("serve-root", null);
const SERVE_ROOT = ROOT_GIVEN ? resolve(ROOT_GIVEN) : PAGE_GIVEN ? dirname(resolve(PAGE_GIVEN)) : K3;
const PAGE = PAGE_GIVEN ? resolve(PAGE_GIVEN) : join(SERVE_ROOT, "zone.html");
// A flag that names where the page lives pins the browser to it.
const PINNED = !!(PAGE_GIVEN || ROOT_GIVEN);

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

const handed = defaultZoneUrl(positional, ZONES);
let handedUrl;
try { handedUrl = new URL(handed); } catch { console.log(`SKIPPED — ${JSON.stringify(handed)} is not a url this check can open`); process.exit(3); }
const handedSlug = zoneIdOf(handed);
// The zone the page half runs on: the handed one when its title opens at its
// first token; else the nearest that does, preferring one with several dated
// readings; else, when no title on the shelf opens at its first token, the
// first that can open at all, so the browser laws judge the press missing
// instead of going unasked.
let slug = handedSlug;
if (!opensFirst(slug)) {
  const next = openable.find(severalYears) || openable.find(opensFirst) || openable[0];
  const why = titles.has(slug) ? "carries a title that opens only past its first token" : "carries no title that opens";
  console.log(`  --  ${slug || "(no zone in the url)"} ${why}; the page half runs on ${next}${opensFirst(next) ? "" : ", whose title does not open at its first token either — no title on this shelf does"}`);
  slug = next;
}
const tok0 = titles.get(slug)[0] || {};

// The server. With --page or --serve-root the named root is served here, and
// the url's host is not asked, so the flag governs what the browser sees.
// Without them, the url's host is used if it answers; if not, the reader
// directory is served here. Either way a server started here is stopped when
// the run ends, so a silent port reads as nothing more than a silent port.
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" };
const underRoot = (() => { const r = relative(SERVE_ROOT, PAGE); return r && !r.startsWith("..") && !isAbsolute(r); })();
const pagePath = underRoot ? `/${relative(SERVE_ROOT, PAGE).split(sep).join("/")}` : handedUrl.pathname;
let srv = null;
let base = `${handedUrl.origin}${handedUrl.pathname}`;
const answers = PINNED ? false : await fetch(base, { signal: AbortSignal.timeout(2000) }).then((r) => r.ok).catch(() => false);
if (answers) {
  console.log(`  --  ${handedUrl.origin} answers; the browser judges what that server serves at ${handedUrl.pathname}, which is not necessarily ${PAGE}`);
} else {
  srv = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    try {
      let file = join(SERVE_ROOT, p);
      // the shelf the disk half read is the shelf the page loads
      if (ZONES_GIVEN && /^[/\\]data[/\\]zones[/\\][^/\\]+\.bin$/.test(p)) file = join(ZONES, basename(p));
      if (!extname(p)) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end("no"); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${srv.address().port}${pagePath}`;
  const reason = PINNED ? `--${ROOT_GIVEN ? "serve-root" : "page"} given, so ${handedUrl.origin} was not asked` : `${handedUrl.origin} did not answer`;
  console.log(`  --  ${reason}; serving ${SERVE_ROOT} at ${base}${ZONES_GIVEN ? ` with data/zones/ answered from ${ZONES}` : ""}`);
  if (!underRoot) console.log(`  --  note: ${PAGE} is not under ${SERVE_ROOT}; L1 quoted that file, the browser judges ${pagePath} under the root`);
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
  // An order read off nothing is no order: if no pill's hover text yields a
  // year, every reading fell into the undated tier and any sequence would
  // have passed. The law needs at least one year actually read.
  const dated = seq.filter((r) => Number.isFinite(r.yr)).length;
  return { seq, breaks, dated };
};

const got = await arrive(slug, true);

// L4 — the card is open.
check("L4  with ?t=open the card is open once the page has settled",
  got.open,
  got.open ? `open on ${slug}` : `shut on ${slug} · ${got.drawn} title token(s) drawn${got.drawn ? "" : " — nothing to press"}`);

// L5 — and open on the title's first token, which the bin names.
const onTitle = got.open && got.activeIndex === 0 && got.head === String(tok0.s ?? "").trim();
check("L5  it is open on the title's first token",
  onTitle,
  onTitle
    ? `token 0 is marked pressed and the card head reads ${got.head}`
    : `pressed token index ${got.activeIndex} (${got.activeAnywhere} marked anywhere) · head ${JSON.stringify(got.head)} · bin says ${JSON.stringify(tok0.s ?? null)}${tok0.k ? "" : " with no key"} · page draws ${JSON.stringify(got.firstText)}`);

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
const { seq, breaks, dated } = orderOf(ordered.pills);
const lead = seq.slice(0, 3).map((r) => r.title).join(" | ");
// and the year the page leads with is a year the store itself holds for that
// zone, so hover text that stopped carrying years, or carries invented ones,
// cannot pass as an order
const storeYears = yearsFor(((titles.get(ordered.slug) || [])[0] || {}).k);
const leadYear = seq.length ? seq[0].yr : Infinity;
const leadKnown = Number.isFinite(leadYear) ? storeYears.has(leadYear) : storeYears.size === 0;
check("L6  the readings on the card stand oldest source first",
  seq.length > 1 && breaks.length === 0 && dated > 0 && leadKnown,
  seq.length > 1
    ? (breaks.length ? `${breaks.length} out of order — ${breaks.slice(0, 2).join(" · ")}`
      : dated === 0 ? `${seq.length} readings on ${ordered.slug} and no pill carries a year in its hover text — an order was not read`
      : !leadKnown ? `${ordered.slug} leads with ${leadYear}, a year its store holds no reading under (store years: ${[...storeYears].sort().join(", ") || "none"})`
      : `${seq.length} readings on ${ordered.slug}, ${dated} dated · leads ${lead}`)
    : `${seq.length} reading(s) on ${ordered.slug} — ${ordered.label || "no readings row"} ${ordered.note ? "· " + ordered.note : ""}— an order over one thing was not shown`);

// L7 — the negative: the same zone, no ?t=open, and the card stays shut.
const plain = await arrive(slug, false);
check("L7  without ?t=open the card stays shut and no title token is pressed",
  !plain.open && plain.activeAnywhere === 0 && plain.drawn > 0,
  !plain.open && plain.activeAnywhere === 0 && plain.drawn > 0
    ? `${plain.drawn} title token(s) drawn, none pressed, card shut`
    : plain.drawn === 0 && !plain.open && plain.activeAnywhere === 0
      ? `no title token drawn on ${slug} — a card that stays shut over nothing shows nothing`
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
