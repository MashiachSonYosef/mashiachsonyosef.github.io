#!/usr/bin/env node
// The front door, and the addresses it opens.
//
// The site's own root is a splash: the books that are finished, and nothing
// else clickable. Each is reached at a clean address derived from its work id —
// which serves the one reader itself, told in its own head which work it is
// and where the reader's files live. There is no second hop and no rewrite:
// the address in the bar is the work's own from the first byte, and this is
// the check that it stays that way — the page at the address, the readings
// arriving, and nothing rewriting anything.
//
// It serves the publication itself — the repository root is the deployed
// tree, address pages and reader and data exactly as Pages serves them — so
// what passes here is what a reader gets, not a replica of it. It takes no
// URL for the same reason.
// GUARDS: title-key-rule-v1-only-what-the-store-already-attests, front-door-rule-v1-the-door-lists-what-the-zones-carry
//
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { zonesOnDisk, zonesWithCommentary } from "./zones-on-disk-v1.mjs";
import { basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ENGINE = basename(K3);
// The works come from the tracked basis record — derived from the plan and
// the hold ledgers, present on every checkout — and the walk is the zones on
// disk: a withheld work's address answers, but there is no zone to walk.
const basis = JSON.parse(readFileSync(join(K3, "data", "work-basis-v1.json"), "utf8"));
const ALL_WORKS = Object.entries(basis.works).map(([slug, w]) => ({ published_as: slug, ...w }));
const ON_DISK = new Set(zonesOnDisk());
const plan = { works: ALL_WORKS.filter((w) => ON_DISK.has(w.published_as)) };
// What the masthead should say is not typed here: it is read out of the zone
// the page is about to load. A check that carries its own copy of a title is
// checking the page against me rather than against the chain.
const titleOf = (book) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${book}.bin`))).toString("utf8"));
  return [z.work_he || "", z.work || ""];
};
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const site = join(K3, "..");

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json" };
const srv = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  // the publication is served, the repository's plumbing is not
  if (/(^|[/\\])\./.test(p)) { res.writeHead(404); return res.end("no"); }
  // What was asked of the address travels with it. Pages keeps the query
  // across the directory redirect, and a stub that dropped it would report a
  // failure the real host does not have — the harness has to be the faithful
  // part or the check is testing the harness.
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  try {
    let file = join(site, p);
    if (!extname(p)) {
      // Pages answers a directory with its index.html; so does this.
      if (p.endsWith("/")) file = join(file, "index.html");
      else { res.writeHead(301, { Location: `${p}/${qs}` }); return res.end(); }
    }
    const body = await readFile(file);
    // shards arrive gzipped and are unpacked by the page, not the transport
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });

await p.goto(`${B}/`, { waitUntil: "networkidle" });
const splash = await p.evaluate(() => ({
  title: document.title,
  links: [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  body: document.body.textContent.replace(/\s+/g, " "),
  offscreen: document.documentElement.scrollWidth > window.innerWidth + 1,
  // A Hebrew name never stands by itself: whatever box carries it carries the
  // English too, so a reader who cannot read it still knows what it offers.
  he: [...document.querySelectorAll('[lang="he"]')].map((e) => {
    const box = e.closest("a, h1, h2");
    return { t: e.textContent.trim(), paired: !!box && /[A-Za-z]/.test(box.textContent.replace(e.textContent, "")) };
  }),
}));
console.log("— the splash —");
// What the site calls itself is read from the site's own record, never typed
// here. This line held the literal "Tabernacle", so the day the work moved to
// its own address the check failed a door that was correct — and worse, a
// door that had silently kept the wrong name would have passed it. The name
// is CNAME's when the site has an address of its own, and the working name
// until then; the same rule the door builder decides it by.
const SITE_NAME = (() => {
  const cname = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "CNAME");
  const named = existsSync(cname) ? readFileSync(cname, "utf8").trim().split(/\s+/)[0] : "";
  return named || "The Tabernacle";
})();
check("it names the site", splash.title.includes(SITE_NAME), `${splash.title} · expected to name ${SITE_NAME}`);
// Every way out of the front door lands on a finished book. There is more than
// one way to reach each of them now — the book itself, and the commentary
// carried on it, which opens inside that book because that is where a
// commentary is read. What must not appear is a destination that is not a
// finished book.
{
  // The finished books used to be typed here, then the curated plan's — five
  // works, while the fleet shelf carries thousands. The publishing authority
  // is the shelf itself: a zone on disk is a finished book, and the door is
  // built from exactly that directory, so this check and the page it checks
  // derive the same list from the same place.
  const { zonesOnDisk } = await import("./zones-on-disk-v1.mjs");
  const FINISHED = [...new Set([
    ...zonesOnDisk().map((slug) => `/${slug}`),
    ...plan.works.map((w) => `/${w.published_as}`),
  ])];
  // The door also points at its own counts receipt — a record of the door,
  // not a way out of it. It is the one non-book destination allowed.
  FINISHED.push("/front-door-counts-receipt-v1.json");
  // A destination is the address, not what is asked of it: /genesis and
  // /genesis?c=open are the same book, opened two ways. What must not appear
  // is a place that is not a finished book.
  const dest = (h) => String(h).split("?")[0];
  const stray = splash.links.filter((h) => !FINISHED.includes(dest(h)));
  check("every way off it lands on a finished book",
    stray.length === 0 && FINISHED.every((f) => splash.links.map(dest).includes(f)),
    `${splash.links.length} links · ${splash.links.join(" ")}${stray.length ? ` · stray: ${stray.join(" ")}` : ""}`);
  // The door is built from the zones, so what it offers is what is there. A
  // commentary the zones carry and the door does not mention is the fault this
  // whole generator exists to make impossible — and a commentary named on the
  // door that no zone carries would be the same fault in the other direction.
  // The expected set is the sidecars on disk, never a typed title.
  const offered = (splash.body || "").match(/Commentary on [A-Za-z -]+/g) || [];
  const carried = zonesWithCommentary();
  check("and the commentary is offered exactly where a zone carries one",
    offered.length === carried.length,
    `${offered.length} offered (${offered.join(" · ") || "none"}) for ${carried.length} sidecar(s) on disk`);
}
check("it does not run off the side", !splash.offscreen);
// Two kinds of text are allowed on our own surfaces: text from the chain,
// carrying its record, and plain English of ours that says what a thing is.
// Hebrew we typed is neither, and the site's own name was the worst place for
// it — the one string on the page with nothing behind it, at the top.
const framed = await p.evaluate(() => {
  const labOf = (e) => (e.closest(".row")?.querySelector(".lab")?.textContent || "").trim();
  return {
    inSiteName: document.querySelectorAll("h1 [lang='he']").length,
    hebrews: [...document.querySelectorAll('[lang="he"]')].map((e) => ({ t: e.textContent.trim(), lab: labOf(e) })),
    commons: [...document.querySelectorAll(".family summary .en")].map((e) => ({ t: e.textContent.trim(), lab: labOf(e),
      chip: (e.parentElement.querySelector(".chip") || {}).textContent || "" })),
    unnamed: [...document.querySelectorAll(".bookcard .he.none")].map((e) => e.textContent.trim()),
  };
});
check("the site's own name carries no Hebrew that nothing recorded",
  framed.inSiteName === 0, `${framed.inSiteName} found`);
// The door prints Hebrew from exactly two records and nothing else: a book's
// own title as its zone carries it, and a family's name as the family ledger
// gives it (each token store-verified by check-family-ledger-v1). Anything
// outside both sets is a character nobody recorded. An earlier form of this
// check knew only the zones — the family ledger's names are records too.
{
  // every zone on the shelf may carry its own claimed title to the door —
  // the fleet's zones included, by the same authority as the curated plan's:
  // the zone's own work_he, claimed from its own C0 under the title rule
  const carried = new Set(zonesOnDisk().map((slug) => titleOf(slug)[0]).filter(Boolean));
  const L = JSON.parse(readFileSync(join(K3, "data", "family-ledger-v1.json"), "utf8"));
  for (const lf of L.families || []) if (lf.he) { carried.add(lf.he); for (const t of lf.he_tokens || []) carried.add(t.s); }
  const strays = framed.hebrews.filter((x) => !carried.has(x.t));
  check("every Hebrew on the door is a zone's title or the family ledger's name, and nothing else",
    strays.length === 0,
    strays.length ? strays.map((x) => x.t).join(" · ") : `${framed.hebrews.length} names, all recorded`);
  // A work with no recorded title either shows the open slot or shows no
  // Hebrew at all — the stray check above already refuses an invented name.
  // What an open slot may never do is soften what it is.
  check("and an open title slot, where one stands, says none is recorded",
    framed.unnamed.every((t) => /none is recorded/.test(t)),
    framed.unnamed.length ? framed.unnamed.join(" · ") : "no open slots on this door");
}
// The register never softens, here least of all. English standing at a
// shelf's head says where it comes from: a family's name is a forced reading
// of the Hebrew above it, and the awaiting shelf's head is the bridge's own
// recorded value. Both say so; what is refused is English with no register.
check("and the English beside it says what register it stands in",
  framed.commons.length > 0 &&
    framed.commons.every((x) => /^commonly force read as$/i.test(x.lab) || /^recorded in the bridge as$/i.test(x.lab)),
  framed.commons.map((x) => `${x.t} under "${x.lab}"`).join(" · ").slice(0, 200));
// The owner's ruling on the name slot: it never dresses a record as prose.
// A slot under either register prints plain Latin text or says the absence
// in words — never a bridge id from another script read as if it were a
// name. Asserted over every name slot the door builds, because the census
// found 2,933 Hebrew bridge ids waiting to be printed the day the library
// fills.
{
  const NO_PLAIN = "none is recorded in plain letters";
  const slots = await p.evaluate(() =>
    [...document.querySelectorAll(".family summary .en, .bookcard .en, .atlas-row.built .aw")]
      .map((e) => e.textContent.trim()));
  const badSlots = slots.filter((t) => !(t === NO_PLAIN || (/^[a-z0-9 \u00b7·]+$/i.test(t) && /[a-z]/i.test(t))));
  check("every name slot is plain letters or says the absence in words",
    slots.length > 0 && badSlots.length === 0,
    badSlots.length ? badSlots.map((t) => JSON.stringify(t.slice(0, 40))).join(" · ").slice(0, 160) : `${slots.length} slots plain`);
}
// The owner's ruling, made at the liturgy shelf: the claim label prints only
// with the record's force license beside it — a claim with no chip is the
// exact fault this door carried.
check("and every claim label carries its force license",
  framed.commons.filter((x) => /^commonly force read as$/i.test(x.lab)).every((x) => x.chip && x.chip.length > 2),
  framed.commons.filter((x) => /^commonly force read as$/i.test(x.lab)).map((x) => `${x.t}: ${x.chip || "NO LICENSE"}`).join(" · ").slice(0, 200) || "no claim labels on this door");

// A directory address answers with or without its closing slash — the slash
// is the server's dress, not a second address.
const sameAddr = (got, want) => got === want || got === `${want}/`;


// What the masthead should say is not typed here: it is read out of the zone
// the page is about to load. A check that carries its own copy of a title is
// checking the page against me rather than against the chain.
// The walked addresses come from the same plan as the door, not a typed list
// — every published work gets its masthead read against its own zone.
// The zone's own section count rides with each row: the loaded page is
// checked against the bin it loads, not against a typed bound. An earlier
// form asserted sections > 100, which declared every small book broken —
// Ruth carries 85 sections and loads whole.
const sectionsOf = (book) =>
  JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${book}.bin`))).toString("utf8")).sections.length;
const WALK = plan.works.map((w) => [`/${w.published_as}`, ...titleOf(w.published_as), sectionsOf(w.published_as)]);
for (const [href, ...expected] of WALK) {
  const [heTitle, en, expectSections] = expected;
  console.log(`— ${href} —`);
  await p.goto(`${B}/`, { waitUntil: "networkidle" });
  // A seated work's row stands behind its group's fold. Opening the fold is
  // the reader's own gesture — the summary is the control — so the walk makes
  // it before reaching for the row, exactly as a finger would.
  await p.evaluate((h) => {
    const a = document.querySelector(`a[href="${h}"]`);
    // every enclosing fold — a group's fold can stand inside a family's
    for (let d = a && a.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
  }, href);
  await Promise.all([p.waitForURL(new RegExp(`\\${href}/?$`), { timeout: 20000 }), p.click(`a[href="${href}"]`)]);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const he = document.querySelector("#workTitle .he-t"), enEl = document.querySelector("#workTitle .en-t");
    const labOf = (e2) => (e2.closest(".t-row")?.querySelector(".t-lab")?.textContent || "").trim();
    return { addr: location.pathname + location.search, title: document.title,
      he: (he.querySelector(".w") || he).textContent.trim(), en: enEl.textContent.trim(),
      heLab: labOf(he), enLab: labOf(enEl), heUnnamed: he.classList.contains("unnamed"),
      lic: (() => { const c = document.getElementById("workLic"); return c && !c.hidden ? c.textContent.trim() : ""; })(),
      enNote: (document.querySelector("#workTitle .t-note")?.textContent || "").trim(),
      titleOpens: !!document.querySelector("#workTitle .he-t .wb"),
      words: document.querySelectorAll("section.seg .he-text .wb").length,
      glossed: [...document.querySelectorAll("section.seg .he-text .wb .g")].filter((g) => g.textContent.trim()).length,
      sections: document.querySelectorAll("section.seg").length,
      // The header offers one thing: the way out. A book offers its own text;
      // the door offers the books, and a reader goes through the door.
      nav: [...document.querySelectorAll("header.top nav a")].map((a) => a.getAttribute("href")),
      navHe: document.querySelectorAll('header.top nav [lang="he"]').length,
      navLab: (document.querySelector("#home .nav-lab")?.textContent || "").trim(),
      navRight: (() => {
        const a = document.querySelector("#home a.home"), h = document.querySelector("header.top");
        if (!a || !h) return false;
        const ar = a.getBoundingClientRect(), hr = h.getBoundingClientRect();
        return hr.right - ar.right < hr.width / 3 && ar.top - hr.top < 90;
      })() };
  });
  check("  the bar keeps the clean address", sameAddr(r.addr.replace(/[?].*$/, ""), href), r.addr);
  check("  the tab names the book in both", r.title.includes(en) && (!heTitle || r.title.includes(heTitle)), r.title);
  check("  the masthead carries the book's own title, said to be the title",
    /^book title$/i.test(r.heLab) && (heTitle ? r.he === heTitle && !r.heUnnamed
      : r.heUnnamed && /ledger/i.test(r.he)), `"${r.heLab}": ${r.he}`);
  // And it is a word of the corpus, not a caption: it opens the same catalogue
  // every other word of the book opens.
  check("  and it opens like any word of the text", heTitle ? r.titleOpens : !r.titleOpens,
    r.titleOpens ? "pressable" : "not pressable");
  // The label is a claim and follows the evidence — the owner's ruling,
  // which overruled the law this block used to state ("the label never
  // softens"). "commonly force read as" may head an English only when a
  // licensed record reads the title's own form that way, the force license
  // riding beside it; where none does, the row is the bridge's value read
  // plainly under the register that says so, with the note naming what the
  // English is waiting on. Two lawful states, nothing between them.
  const addrPlain = href.replace(/^\//, "").replace(/[-_]+/g, " ");
  check("  the claim label stands only where a record backs the claim",
    r.lic ? /^commonly force read as$/i.test(r.enLab) && r.en === en
          : /^recorded in the bridge as$/i.test(r.enLab) && r.en === addrPlain,
    `"${r.enLab}": ${r.en}`);
  check("  with a force license on the claim, and the note on the record",
    r.lic ? r.lic.length > 2 && !r.enNote : /waits on a licensed record/.test(r.enNote),
    `${r.enLab} · ${r.lic || r.enNote || "no license and no note"}`);
  check("  the zone still loads under the rewritten bar", r.sections === expectSections && r.words > 3, `${r.sections} of ${expectSections} sections`);
  check("  and its readings came with it", r.glossed > 0, `${r.glossed} of ${r.words} words glossed`);

  // Navigation carries coordinates. A title is corpus text and belongs in the
  // masthead, out of the ledger, where it can be tapped and defined — a copy of
  // it typed into a link would be the one string on the page with nothing
  // behind it.
  check("  the header offers one way out and nothing else",
    r.nav.length === 1 && r.nav[0] === "/", r.nav.join(" ") || "nothing");
  check("  it says what it is, in plain English", /home/i.test(r.navLab), r.navLab || "unsaid");
  check("  and it sits in the corner the eye goes to", r.navRight);
  check("  the nav prints no title, only where to go", r.navHe === 0, `${r.navHe} Hebrew in the nav`);

  // The store is fetched shard by shard as words are pressed — long after the
  // bar stopped saying where the page came from. The word pressed is the
  // first one the zone itself says is glossed: a first word the store has
  // nothing for is a fact about that word, not a failed page — the Aramaic
  // Targum to Ruth opens on such a word — and this check is about the wire
  // to the store, so it presses where the zone says the wire answers.
  await p.evaluate(() => {
    const w = [...document.querySelectorAll("section.seg .he-text .wb")]
      .find((x) => (x.querySelector(".g")?.textContent || "").trim()) ||
      document.querySelector("section.seg .he-text .wb");
    w.click();
  });
  await p.waitForTimeout(1000);
  const card = await p.evaluate(() => {
    const h = document.getElementById("hud");
    return { open: !h.hidden, readings: h.querySelectorAll(".r-pills button").length,
      lic: (h.querySelector(".d-card .d-foot")?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 52) };
  });
  check("  a word still reaches the store and opens its record",
    card.open && card.readings > 0, `${card.readings} readings · ${card.lic}`);
  await p.keyboard.press("Escape");
}

console.log("— the addresses on their own —");
const LAST = plan.works[plan.works.length - 1].published_as;
const A0 = `/${LAST}`;
await p.goto(`${B}${A0}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
const typed = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length }));
check("a clean address typed in lands on the reader and stays",
  sameAddr(typed.addr, A0) && typed.secs === sectionsOf(LAST), `${typed.addr} · ${typed.secs} of ${sectionsOf(LAST)} sections`);

// A published address is a promise: every republished address in the history
// record still answers, as a redirect to where its work now lives.
{
  const histPath = join(K3, "data", "address-history-v1.json");
  if (existsSync(histPath)) {
    const hist = JSON.parse(readFileSync(histPath, "utf8"));
    const slugOfWork = new Map(ALL_WORKS.map((w) => [w.work_id, w.published_as]));
    for (const row of hist.republished || []) {
      const slug = slugOfWork.get(row.to_work_id);
      const target = `/${slug}`;
      await p.goto(`${B}/${row.from}`, { waitUntil: "networkidle" });
      if (ON_DISK.has(slug)) {
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
        const r2 = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length }));
        check(`the republished address /${row.from} still answers, at its work's new address`,
          sameAddr(r2.addr, target) && r2.secs === sectionsOf(slug), `/${row.from} → ${r2.addr} · ${r2.secs} sections`);
      } else {
        // the work behind the promise is withheld: the address must still
        // answer, saying who is holding the book — never a broken page
        const r2 = await p.evaluate(() => ({ addr: location.pathname, body: document.body.textContent.replace(/\s+/g, " ").trim() }));
        check(`the republished address /${row.from} still answers while its work is withheld`,
          r2.body.length > 40, `/${row.from} → ${r2.addr} · ${r2.body.slice(0, 60)}…`);
      }
    }
  }
}

await p.goto(`${B}/${ENGINE}/zone.html?b=${zonesOnDisk()[0]}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
const raw = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length,
  glossed: [...document.querySelectorAll("section.seg .he-text .wb .g")].filter((g) => g.textContent.trim()).length }));
check("and the bare instrument at its own path is untouched by any of it",
  raw.addr === `/${ENGINE}/zone.html` && raw.secs === sectionsOf(zonesOnDisk()[0]) && raw.glossed > 0,
  `${raw.addr} · ${raw.secs} sections · ${raw.glossed} glossed`);

// ---- the door's commentary entries open a commentary --------------------
//
// "Commentary on Genesis" is offered on the door as its own way in. A way in
// that lands a reader at the top of a book with every commentary still shut is
// not one — they arrive at the thing they asked for and have to go find it. So
// the entry carries ?c=open, the address page carries it through, and the
// reader presses the first mark and the first work behind it.
console.log("— a commentary entry opens a commentary —");
await p.goto(`${B}/`, { waitUntil: "networkidle" });
const doorLinks = await p.evaluate(() => [...document.querySelectorAll("a.sub-book")]
  .map((a) => ({ href: a.getAttribute("href"), en: a.querySelector(".en")?.textContent || "" })));
const CARRIED = zonesWithCommentary().filter((z) => ON_DISK.has(z));
check("the door offers a commentary entry per book that carries one",
  doorLinks.length === CARRIED.length && doorLinks.every((l) => /\?c=open$/.test(l.href)),
  `${doorLinks.length} for ${CARRIED.length} sidecar(s) · ${doorLinks.map((l) => l.href).join(" · ") || "none"}`);

for (const slug of CARRIED) {
  const shape = (plan.works.find((w) => w.published_as === slug) || {}).basis === "SEALED_Y_LEDGER" ? "word" : "section";
  await p.goto(`${B}/${slug}?c=open`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({
    addr: location.pathname,
    panels: document.querySelectorAll("section.seg .c-mark-slot:not(.c-choose)").length,
    inline: [...document.querySelectorAll("section.seg .c-inline")].filter((x) => !x.hidden).length,
    said: (document.querySelector(".c-how-said, .c-att")?.textContent || "").replace(/\s+/g, " ").slice(0, 60),
  }));
  const opened = shape === "word" ? r.panels : r.inline;
  check(`  ${slug} arrives with a commentary already open`, opened > 0,
    `${r.panels} panel(s), ${r.inline} in line · "${r.said}…"`);
  check(`  and the address is still the clean one`, sameAddr(r.addr, `/${slug}`), r.addr);
}
// and the book's own entry still opens the book, not a commentary
{
  const first = plan.works[0].published_as;
  await p.goto(`${B}/${first}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
  await p.waitForTimeout(1200);
  const shut = await p.evaluate(() => document.querySelectorAll("section.seg .c-mark-slot:not(.c-choose)").length);
  check("  while the book's own entry opens the book with nothing pressed", shut === 0, `${shut} open`);
}

// Nothing rewrites the bar, on anyone's say-so: the clean= parameter of the
// old handshake is dead, and a hostile copy of it moves nothing.
await p.goto(`${B}/${ENGINE}/zone.html?b=${zonesOnDisk()[0]}&clean=..%2F..%2Fevil`, { waitUntil: "networkidle" });
const hostile = await p.evaluate(() => location.pathname);
check("a clean= from the retired handshake moves nothing",
  hostile === `/${ENGINE}/zone.html`, hostile);

await p.close(); await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
