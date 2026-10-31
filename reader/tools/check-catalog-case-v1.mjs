#!/usr/bin/env node
// check-catalog-case-v1 · catalog-case-rule-v1-the-record-that-lists-the-work-spells-its-name
//
// The owner's ruling of 31 October 2026, on Tikkunei Zohar: the corpus lane's
// edition door counts as a source on record, so the masthead and the door
// print the catalog's own case — the door row's work_common_name — in place
// of the address read plainly. The rule reaches exactly as far as the record:
// a served zone whose walk carries a door row naming it prints that name in
// both places with the record beside it; a served zone with no such row and
// no attested Hebrew title still prints its address plainly with the note.
// Nothing here names a book: the zones are read off the shelf, the names off
// the records they carry, and the page is held to the record, not to me.
//
//   C1  every served zone the edition door names prints that name on the
//       door's row, as the row's link text, with the chip naming the door file
//   C2  and on its own masthead, under "listed in the catalog as", with the
//       chip naming the door file and no plain-words note
//   C3  the name keeps the catalog register's ink: it is not painted in the
//       claim register's blue (that register needs a licensed reading of a
//       Hebrew title)
//   C4  a served zone with no door row and no attested title prints its
//       address plainly, on the door and on the masthead, with the note — the
//       rule reaches no further than the record
//
// Needs the built site served (argv[2]'s origin, default http://127.0.0.1:8912):
// the door is its index.html and a work's page is /<slug>/. Where that origin
// serves no door (the suite runner serves the reader tree), the check is
// SKIPPED (exit 3), counted apart, never read as green.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";

const RULE = "catalog-case-rule-v1-the-record-that-lists-the-work-spells-its-name";
const ORIGIN = /^https?:/u.test(process.argv[2] || "") ? new URL(process.argv[2]).origin : "http://127.0.0.1:8912";
const K3 = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const ZONES = join(K3, "data", "zones");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// the same reading of the record the page and the door make: a plain Latin
// name (the name slot's standing law: letters, digits, spaces) on a door row
// naming this work, else nothing; the record named by its file, or by its
// fingerprint where it carries no file name
const doorNameOf = (z) => {
  const walk = (z.emitted_from || {}).walk || {};
  const d = walk.door, row = d && d.row;
  if (!row) return null;
  const name = String(row.work_common_name || "").trim();
  if (!name || !/^[a-z0-9 ]+$/i.test(name) || !/[a-z]/i.test(name)) return null;
  const wid = walk.edition && walk.edition.work_id;
  if (wid && row.work_id && String(row.work_id) !== String(wid)) return null;
  const file = String(d.file || ""), sha = String(d.sha256 || "");
  return { name, file, record: file || (sha ? `${sha.slice(0, 12)}\u2026` : "") };
};
const doorLabel = (door) => `the edition door${door.record ? `, ${door.record}` : ""}`;
// what a work no record names prints: its address read plainly where that is
// plain Latin text, else the absence said in words (the slot's law)
const NO_PLAIN_NAME = "none is recorded in plain letters";
const plainAddress = (slug) => { const t = slug.replace(/[-_]+/gu, " "); return /^[a-z0-9 ]+$/i.test(t) && /[a-z]/i.test(t) ? t : NO_PLAIN_NAME; };
const unescape = (t) => String(t).replace(/&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const reEsc = (t) => String(t).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const served = zonesServed(ZONES);
const named = [], unnamed = [], claimFirst = [];
for (const slug of served) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8"));
  const door = doorNameOf(z);
  const keyed = (z.work_he_tokens || []).some((t) => t.k);
  // a zone with a keyed Hebrew title is tried in the claim register first,
  // by the page and the door alike; its door row stands behind that and is
  // not held here (the claim's own checks hold it)
  if (door && keyed) claimFirst.push(slug);
  else if (door) named.push({ slug, door });
  else if (!keyed && !z.work_he) unnamed.push({ slug });
}
console.log(`— ${RULE} —`);
console.log(`${served.length} served · ${named.length} named by an edition door · ${claimFirst.length} door-named behind a keyed Hebrew title (held by the claim register's checks) · ${unnamed.length} with no door row and no Hebrew title · door ${ORIGIN}/`);

// nothing to hold is no verdict: a run with no assertion to make is SKIPPED
// (exit 3), counted apart by the suite runner, never read as green
if (!named.length && !unnamed.length) { console.log(`SKIPPED — no served work is named by an edition door and none stands without a door row and without a Hebrew title, so the rule has nothing to hold on this shelf`); process.exit(3); }

// the door, read as served; no door at this origin is no verdict
let doorHtml = "";
try { doorHtml = await (await fetch(`${ORIGIN}/`)).text(); } catch { doorHtml = ""; }
if (!/class="atlas-row/u.test(doorHtml)) { console.log(`SKIPPED — no built door is served at ${ORIGIN}/ (the suite runner serves the reader tree; serve the site root to hold the door)`); process.exit(3); }
const rowOf = (slug) => {
  const m = doorHtml.match(new RegExp(`<a class="aw[^"]*" href="/${reEsc(slug)}" title="open this book">([^<]*)</a></span><span class="col-att">([\\s\\S]*?)</span></span><span class="pair pair-r">`, "u"));
  return m ? { text: unescape(m[1]), att: m[2] } : null;
};

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
const masthead = async (slug) => {
  await p.goto(`${ORIGIN}/${slug}/`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  // the masthead's English settles after the attribution is tried
  await p.waitForFunction(() => { const c = document.getElementById("workLic"); return (c && !c.hidden) || !!document.querySelector("#workTitle .t-note") || document.getElementById("enLab").textContent !== "listed in the catalog as"; }, null, { timeout: 20000 }).catch(() => {});
  return p.evaluate(() => {
    const enT = document.querySelector("#workTitle .en-t"), c = document.getElementById("workLic");
    const probe = document.createElement("span"); probe.style.color = "var(--tekhelet-ink)"; document.body.append(probe);
    const blue = getComputedStyle(probe).color; probe.remove();
    return { lab: document.getElementById("enLab").textContent.trim(), en: enT.textContent.trim(), unnamed: enT.classList.contains("unnamed"),
      color: getComputedStyle(enT).color, blue, chip: c && !c.hidden ? c.textContent.trim() : "", chipTitle: c && !c.hidden ? c.title : "",
      note: (document.querySelector("#workTitle .t-note") || {}).textContent || "" };
  });
};

for (const { slug, door } of named) {
  const row = rowOf(slug);
  check(`C1  the door's row prints the record's name  ·  ${slug}`, !!row && row.text === door.name, row ? `"${row.text}" · want "${door.name}"` : "no row on the door");
  check(`    with the chip naming the door's record`, !!row && /class="chip att"/u.test(row.att) && row.att.includes(`: ${doorLabel(door)}<`), row ? row.att.replace(/<[^>]+>/gu, "").slice(0, 80) || "(no attestation cell)" : "");
  const m = await masthead(slug);
  check(`C2  the masthead prints it under the catalog register  ·  ${slug}`, m.lab === "listed in the catalog as" && m.en === door.name && !m.unnamed, `"${m.lab}": ${m.en}`);
  check(`    with the chip naming the door's record, and no plain-words note`, m.chip === `attested: ${doorLabel(door)}` && (!door.record || m.chipTitle.includes(door.record)) && !m.note, `${m.chip || "(no chip)"} · ${m.note || "no note"}`);
  check(`C3  the name keeps the catalog register's ink`, m.color !== m.blue, `${m.color} · claim blue ${m.blue}`);
}
// an empty set is said, never passed over in silence: today every served
// work is either named by a record or carries an attested Hebrew title
if (!unnamed.length) console.log(`  --  C4  no served work stands without a record naming it and without a Hebrew title today — nothing to hold; the rule's reach is the count above`);
for (const { slug } of unnamed) {
  // the shelf lists what serves on its own row; a work seated with another
  // (a targum under its book) has no row of its own, and nothing to hold here
  const row = rowOf(slug);
  check(`C4  a work no record names prints its address plainly on the door, where the door lists it  ·  ${slug}`, !row || (row.text === plainAddress(slug) && !/class="chip/u.test(row.att)), row ? `"${row.text}"${/class="chip/u.test(row.att) ? " · a chip" : ""}` : "not listed on its own row");
  const m = await masthead(slug);
  check(`    and on the masthead, with the note`, m.lab === "listed in the catalog as" && m.en === plainAddress(slug) && !m.chip && /a source on record uses one/u.test(m.note), `"${m.lab}": ${m.en} · ${m.chip || m.note.trim().slice(0, 40)}`);
  check(`    the name slot in the catalog register, not the claim's`, m.unnamed === (plainAddress(slug) === NO_PLAIN_NAME), m.unnamed ? "absence said in words" : "address read plainly");
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
