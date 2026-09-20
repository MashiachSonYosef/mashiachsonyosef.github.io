#!/usr/bin/env node
// Synthesis lane · toggle-design-rule-v1-the-page-about-the-switches-is-built-from-the-switches
// LEDGER: -
// no frame letter. This tool writes a page, not a record. It READS
// data/toggle-wording-proposals-v1.json and writes nothing back into data/;
// the proposals file is kept by hand as the owner rules on each wording.
//
// THE PAGE WHERE THE OVERLAY IS AGREED, NOT THE PAGE WHERE IT IS DOCUMENTED.
//
// This site puts four things over a licensed text: the reading line under a
// word, the card, the rail of switches, and the marks on words. Everything
// else a reader sees is the text itself. That overlay is the part this
// project actually wrote, so it is the part most worth arguing about before
// more of it is built — what it is allowed to do, and what it says in plain
// English.
//
// WHY THIS IS A TOOL AND NOT A WRITTEN PAGE. There was a written page. It
// stood at /toggles/ from 2026-09-09 and it described "The order switch",
// singular, because that was the only switch there was. Eight more arrived
// and the page never learned about one of them: it carried typed copies of
// what the rail said, and typed copies go stale the day after they are typed.
// The same rot put two statements on the live rail that had stopped being
// true — a branch announced as waiting that had already shipped, and a
// question asking for a ruling that had already been given.
//
// So this page holds no typed copy of any switch. It parses the rail's own
// TOGGLES out of zone.html and draws what it finds, and it photographs the
// live reader rather than describing it. A switch that changes its words
// changes them here on the next build, and a switch nobody has built yet
// cannot appear here at all.
//
// WHAT IT DRAWS FOR EACH SWITCH: the picture, the label, whose voice it
// speaks in, the sentence it says to a reader, and — for the ones that are
// dark — what they are waiting on, in the words the rail itself uses.
//
// Run: node tools/build-toggle-design-v1.mjs [--url http://127.0.0.1:8899/zone.html]
//      With no --url it photographs the first book the shelf holds.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

export const TOGGLE_DESIGN_RULE_ID = "toggle-design-rule-v1-the-page-about-the-switches-is-built-from-the-switches";

/** THE FOUR VOICES, read from the page rather than restated here — the rail
 *  carries the map and this parses it, so the two cannot drift apart. */
export function voicesFrom(page) {
  const m = /const VOICE = \{([\s\S]*?)\n  \};/u.exec(page);
  const out = {};
  if (!m) return out;
  for (const v of m[1].matchAll(/(\w+): \["([^"]*)", "([^"]*)"\]/gu)) out[v[1]] = { name: v[2], gloss: v[3] };
  return out;
}

/** THE SWITCHES, as the rail declares them. Nothing here is typed: an id, a
 *  voice, a label, a sentence, its positions, and whether the rail draws it
 *  live — all of it lifted from the one declaration the reader is served. */
export function togglesFrom(page) {
  const start = page.indexOf("const TOGGLES = [");
  if (start < 0) throw new Error("zone.html no longer declares TOGGLES where this page reads it");
  const blk = page.slice(start, page.indexOf("\n  ];", start));
  const out = [];
  // EACH ENTRY IS BOUNDED BY THE NEXT ONE. A fixed look-ahead spills into the
  // switch below and reads its liveness instead: the first build of this page
  // called two switches dark when the rail draws one. The starts are taken
  // first, and every entry ends where the next begins.
  const starts = [...blk.matchAll(/\{ id: "([a-z]+)", voice: "([a-z]+)", lab: "([^"]*)", why: "((?:[^"\\]|\\.)*)"/gu)];
  for (let si = 0; si < starts.length; si += 1) {
    const m = starts[si];
    const [, id, voice, lab, why] = m;
    const end = si + 1 < starts.length ? starts[si + 1].index : blk.length;
    const after = blk.slice(m.index, end);
    const pos = [...after.matchAll(/\{ id: "([a-z][a-z-]*)", lab: "((?:[^"\\]|\\.)*)" \}/gu)].map((p) => p[2].replace(/\\u([0-9a-f]{4})/giu, (_, h) => String.fromCharCode(parseInt(h, 16))));
    const dead = /live: \(\) => false/u.test(after);
    const waits = (/waits: "((?:[^"\\]|\\.)*)"/u.exec(after) || [])[1] || "";
    const un = (s) => String(s || "").replace(/\\u([0-9a-f]{4})/giu, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\"/gu, '"');
    out.push({ id, voice, lab: un(lab), why: un(why), positions: pos, dead, waits: un(waits) });
  }
  return out;
}

/** THE ORDER THE SWITCHES ARE MET IN, WHICH IS AN ARGUMENT AND NOT A LIST.
 *
 *  The rail draws them in the order they were built. A page meant to settle
 *  what the overlay IS should draw them in the order that explains it, and the
 *  voices already carry that order: a reader meets someone else's words first,
 *  then what the scribes themselves put in the text, then the ways this site
 *  arranges those two, and last the single place where this project says
 *  something on its own account.
 *
 *  Least us to most us. The sources lead because they are the easiest thing
 *  here to understand and because they are what this site is for (owner,
 *  2026-09-20: "sources are the easiest to understand and lead concept"). The
 *  project's own claim comes last because it should have to be reached.
 */
export const VOICE_ORDER = Object.freeze(["them", "text", "arrange", "claim"]);
export const VOICE_LEDE = Object.freeze({
  them: "Someone else wrote these. Every one of them is a dictionary, and the switch decides which of them are asked — never what any of them said.",
  text: "The scribes put these in the text. Nobody is interpreting anything: the switch decides which of two things the ink already carries the English follows.",
  arrange: "These are ours, and they only ever move the order. Nothing is hidden by any of them, and no reading is added or taken away.",
  claim: "This one is a statement this project makes. It is the only switch here that is not somebody else's material, or our arrangement of it, and it is marked so a reader can refuse it.",
});

const esc = (s) => String(s).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

if (import.meta.url === `file://${process.argv[1]}`) {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const PAGE = readFileSync(join(HERE, "..", "zone.html"), "utf8");
  const OUT = arg("--out", join(HERE, "..", "..", "toggles"));
  const SHOTS = join(OUT, "shots");
  // The book is asked of the shelf, never named here. A tool that types a slug
  // goes dormant the day that work is withdrawn, and a dormant tool reports
  // nothing, which reads exactly like green (check-scope-derived-v1 S1).
  const URL = arg("--url", `http://127.0.0.1:8899/zone.html?b=${zonesOnDisk()[0]}`);
  const toggles = togglesFrom(PAGE), voices = voicesFrom(PAGE);
  // THE OPEN QUESTION, AS A FILE THAT EMPTIES. A proposal is wording this lane
  // suggests for a switch; it is drawn beside what the rail says today and is
  // not live anywhere. When the owner accepts one it is written into TOGGLES
  // and deleted from here, so the length of this file is the size of what is
  // still unsettled, and the page is a decision instrument rather than a
  // description of itself.
  const PROP = join(HERE, "..", "data", "toggle-wording-proposals-v1.json");
  const props = existsSync(PROP) ? JSON.parse(readFileSync(PROP, "utf8")) : {};
  mkdirSync(SHOTS, { recursive: true });

  // ── the pictures, of the live reader, not of a mock ───────────────────────
  const { loadPlaywright, launchOptions } = await import("./playwright-v1.mjs");
  const pw = await loadPlaywright();
  const b = await pw.chromium.launch(launchOptions());
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  let shotErr = null;
  p.on("pageerror", (e) => { shotErr = e.message; });
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(700);
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r) r.open = true; });
  await p.waitForTimeout(400);
  const drew = [];
  for (const t of toggles) {
    const el = await p.$(`.rail .row[data-toggle="${t.id}"]`);
    if (!el) continue;
    await el.screenshot({ path: join(SHOTS, `row-${t.id}.png`) });
    drew.push(t.id);
  }
  await b.close();
  if (shotErr) throw new Error(`the reader threw while being photographed, so the pictures cannot be trusted: ${shotErr}`);
  const missing = toggles.filter((t) => !drew.includes(t.id));
  if (missing.length) throw new Error(`the rail drew no row for ${missing.map((t) => t.id).join(", ")} — refusing to publish a page about switches it could not photograph`);

  const live = toggles.filter((t) => !t.dead), dark = toggles.filter((t) => t.dead);
  const openCount = toggles.filter((t) => props[t.id]).length;
  const card = (t) => {
    const pr = props[t.id];
    return `<section class="sw${pr ? " open" : ""}" id="${esc(t.id)}">
  <h3>${esc(t.lab)}${pr ? `<em class="flag">wording open</em>` : ""}</h3>
  <p class="shot"><img src="shots/row-${esc(t.id)}.png" alt="the ${esc(t.lab)} row of the rail, as a reader sees it" loading="lazy"></p>
  ${t.positions.length ? `<p class="pos">it offers · ${t.positions.map((x) => `<b>${esc(x)}</b>`).join(" · ")}</p>` : ""}
  ${t.dead ? `<p class="dark">drawn, and dark. It waits on ${esc(t.waits)}.</p>` : ""}
  ${pr ? `<div class="prop">
    <p class="ph">proposed instead</p>
    <p class="pl"><b>${esc(pr.lab)}</b> — ${esc(pr.why)}</p>
    <p class="pn">${esc(pr.note || "")}</p>
  </div>` : `<p class="settled">wording settled — this is what the rail says and what it should say.</p>`}
  <p class="voice-note">${esc((voices[t.voice] || {}).gloss || "")}</p>
</section>`;
  };

  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>the switches</title>
<style>
 :root { --ink:#2b2622; --faint:#9b9186; --muted:#6f655c; --line:#d8cdbc; --paper:#f6f1e7; --sel:#7a5c2e;
   --tekhelet:#34649a; --shani:#8b5560; --argaman:#6b3f8f; }
 @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink:#e8e0d4; --faint:#7d746a; --muted:#a49a8e; --line:#3a352f; --paper:#17150f; --sel:#c9a24a; --tekhelet:#8fa9d6; --shani:#c99; --argaman:#b394d6; } }
 * { box-sizing: border-box; }
 body { margin:0; padding:1.2rem 16px 4rem; background:var(--paper); color:var(--ink);
   font:16px/1.65 Georgia,"Times New Roman",serif; }
 .wrap { max-width: 44rem; margin: 0 auto; }
 h1 { font-size:1rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin:0 0 .8rem; }
 h1 a { color:var(--sel); text-decoration:none; }
 .lede { color:var(--muted); margin:0 0 .7rem; }
 .lede b { color:var(--ink); }
 .law { border-inline-start:2px solid var(--sel); padding:.1rem 0 .1rem .9rem; margin:1.2rem 0; }
 .law p { margin:.35rem 0; }
 .law .big { font-size:1.05rem; color:var(--ink); }
 ol.voices { list-style:none; margin:.6rem 0 0; padding:0; }
 ol.voices li { margin:.3rem 0; font-size:.92rem; color:var(--muted); }
 ol.voices b { font-size:.7rem; letter-spacing:.08em; text-transform:uppercase; }
 .v-them b, .them { color:var(--tekhelet); } .v-text b, .text { color:var(--shani); }
 .v-arrange b, .arrange { color:var(--muted); } .v-claim b, .claim { color:var(--ink); }
 .grp { margin:2.2rem 0 0; }
 .gh { font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; margin:0; color:var(--muted); }
 .gh.v-them { color:var(--tekhelet); } .gh.v-text { color:var(--shani); } .gh.v-claim { color:var(--ink); }
 .gl { margin:.3rem 0 .2rem; font-size:.9rem; color:var(--muted); }
 section.sw { border-top:1px solid var(--line); padding:1.1rem 0 .4rem; }
 section.sw h3 { font-size:1.05rem; margin:0 0 .15rem; color:var(--ink); font-weight:600; }
 section.sw h3 em.flag { font-style:normal; font-size:.58rem; letter-spacing:.08em; text-transform:uppercase;
   color:var(--sel); padding-inline-start:.55rem; }
 section.sw h2 { font-size:1.05rem; margin:0 0 .15rem; color:var(--ink); font-weight:600; }
 section.sw h2 i { font-style:normal; font-size:.62rem; letter-spacing:.09em; text-transform:uppercase;
   padding-inline-start:.6rem; color:var(--faint); }
 h2 i.v-them { color:var(--tekhelet); } h2 i.v-text { color:var(--shani); } h2 i.v-claim { color:var(--ink); }
 .says { margin:.25rem 0 .6rem; color:var(--muted); }
 .shot { margin:.6rem 0; }
 .shot img { width:100%; max-width:24rem; border:1px solid var(--line); border-radius:.4rem; display:block; }
 .pos { font-size:.82rem; color:var(--faint); margin:.4rem 0 0; }
 .pos b { color:var(--muted); font-weight:400; }
 .dark { font-size:.85rem; color:var(--sel); margin:.4rem 0 0; }
 .voice-note { font-size:.78rem; color:var(--faint); font-style:italic; margin:.3rem 0 0; }
 section.sw h2 em.flag { font-style:normal; font-size:.58rem; letter-spacing:.08em; text-transform:uppercase;
   color:var(--sel); padding-inline-start:.55rem; }
 .prop { border-inline-start:2px solid var(--sel); padding:.1rem 0 .1rem .8rem; margin:.7rem 0 .2rem; }
 .prop .ph { font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; color:var(--sel); margin:0 0 .2rem; }
 .prop .pl { margin:0; color:var(--ink); }
 .prop .pn { margin:.35rem 0 0; font-size:.82rem; color:var(--faint); }
 .settled { font-size:.82rem; color:var(--faint); margin:.6rem 0 0; }
 footer { margin-top:2.4rem; border-top:1px solid var(--line); padding-top:.9rem; font-size:.82rem; color:var(--faint); }
 a { color:var(--sel); }
</style></head><body><div class="wrap">
<h1><a href="/">The Tabernacle</a> · the switches</h1>

<p class="lede">This site puts <b>four things</b> over a licensed text: the reading line under a word, the card that opens when you press one, this rail of switches, and the marks on words. Everything else you see is the text.</p>

<div class="law">
<p class="big">Those four are the only part of this site this project wrote. So they are the part worth arguing about.</p>
<p>The law over all of them: <b>none of them writes on the Hebrew.</b> The text is a floor, not a surface. Every switch here acts inside the card or in the space around the line, and the letters do not move when you press one.</p>
</div>

<p class="lede">And every control says <b>whose statement it is</b>, because a reader should never have to guess whether they are reading a dictionary's opinion, a scribe's mark, this site's arrangement, or a claim this project is making on its own account. The switches below are grouped that way and run in that order — <b>least us to most us</b>.</p>

<p class="lede" style="margin-top:1.1rem">${live.length} switch${live.length === 1 ? "" : "es"} a reader can press today${dark.length ? `, and ${dark.length} drawn and dark` : ""}. Each picture is the rail itself, photographed; this page holds no typed copy of any switch.</p>
<p class="lede"><b>${openCount} of ${toggles.length} have their wording open.</b> Where a switch is marked so, this lane is proposing different words and the ruling is the owner's. An accepted proposal is written into the reader and deleted from <code>data/toggle-wording-proposals-v1.json</code>, so that file empties as the language settles and its length is the size of what is still unsettled.</p>

${VOICE_ORDER.filter((v) => toggles.some((t) => t.voice === v)).map((v) => `<div class="grp" id="voice-${esc(v)}">
<h2 class="gh v-${esc(v)}">${esc((voices[v] || {}).name || v)}</h2>
<p class="gl">${esc(VOICE_LEDE[v] || (voices[v] || {}).gloss || "")}</p>
${toggles.filter((t) => t.voice === v).map(card).join("\n")}
</div>`).join("\n")}
${toggles.some((t) => !VOICE_ORDER.includes(t.voice)) ? `<div class="grp"><h2 class="gh">not yet placed in a voice</h2>
${toggles.filter((t) => !VOICE_ORDER.includes(t.voice)).map(card).join("\n")}</div>` : ""}

<footer>Built by <code>tools/build-toggle-design-v1.mjs</code>, which parses the switches out of the reader itself and photographs the live rail. An earlier page here carried typed copies and described one switch while the rail carried nine; nothing on this page is typed, so it cannot fall behind that way again. The pictures are of ${esc(String(URL).split("?").pop())}.</footer>
</div></body></html>`;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "index.html"), page);
  console.log(`${join(OUT, "index.html")} · ${toggles.length} switches (${live.length} live, ${dark.length} dark) · ${drew.length} photographed · ${(page.length / 1024).toFixed(0)} KB`);
}
