#!/usr/bin/env node
// Synthesis lane · front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// The site's front door, built from the zones rather than typed — both of its
// faces: the page a reader arrives at, and the README somebody browsing the
// repository arrives at. Both said the same kind of thing and both went stale
// the same way, so both are now read out of the zones at build time.
//
// It was typed. Two books were named by hand with their section counts written
// out beside them, and when a third work arrived — the commentary, 181 units
// across 58 works on Genesis and 817 on I Kings — the door did not mention it,
// because nothing was going to notice that it should. A door somebody
// maintains by hand is a door that is out of date the moment it is not
// maintained, and nobody can tell by looking.
//
// So it reads the zones and says what is in them. Add a book and it appears.
// Add a commentary and it appears under its book with its own count.
//
// Two rules this page keeps, and keeps by construction rather than by memory:
//
//   1. It carries no records, so it cites nothing. A book's own title is
//      corpus text and needs a definition record and a licence beside it; this
//      page has neither, so it prints no Hebrew at all and names each book only
//      as it is commonly read. The title itself waits inside, where it opens.
//   2. Every number on it is counted from a zone at build time. There is no
//      figure here that somebody decided.
//
//   --zones  directory of built zones        (default data/zones)
//   --out    directory to write the door into (default deploy-root)
//
// Run: node tools/build-front-door-v1.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");
const OUT = arg("out", "deploy-root");

const read = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const has = (f) => existsSync(join(ZONES, f));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (x) => Number(x).toLocaleString("en-US");

// ---- what the zones carry ------------------------------------------------
//
// The books the door offers are named here, because "which books are
// published" is a decision and not a fact about a directory — a zone can exist
// and not be ready. Everything said about them is read out of the zone.
const BOOKS = [
  { slug: "genesis", zone: "genesis.bin", byline: "Miqra according to the Masorah" },
  { slug: "1kings", zone: "1kings.bin", byline: "Nevi'im · Miqra according to the Masorah" },
];

const books = [];
for (const b of BOOKS) {
  if (!has(b.zone)) continue;
  const z = read(join(ZONES, b.zone));
  const sections = (z.sections || []).length;
  const words = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  // its commentary, if any zone carries some for it
  let units = 0, worksCount = 0, grain = null;
  const side = `${b.slug}-commentary.bin`;
  if (has(side)) {
    const c = read(join(ZONES, side));
    const u = c.units || {};
    const seen = new Set();
    for (const unit of Object.values(u)) {
      for (const list of Object.values(unit.words || {}))
        for (const e of list) { units += 1; seen.add(e.family_en || e.ref); }
      for (const e of unit.section || []) { units += 1; seen.add(e.family_en || e.ref); }
      if (!grain) grain = (unit.words && Object.keys(unit.words).length) ? "word" : "section";
    }
    worksCount = (c.works && c.works.length) ? c.works.length : seen.size;
  }
  books.push({ ...b, en: z.work || b.slug, sections, words, units, works: worksCount, grain });
}
if (!books.length) throw new Error(`no zones found in ${ZONES} — refusing to write a door with nothing behind it`);

// ---- the door ------------------------------------------------------------
const bookCard = (b) => `    <a class="book" href="/${b.slug}">
      <span class="row"><span class="lab">commonly read as</span><span class="en">${esc(b.en)}</span></span>
      <span class="of">${n(b.sections)} sections · ${n(b.words)} words · ${esc(b.byline)}</span>
    </a>`;

const commentaryLine = (b) => (b.units
  ? `      <a class="sub-book" href="/${b.slug}"><span class="en">Commentary on ${esc(b.en)}</span><span class="of">${n(b.units)} attached${b.works ? ` from ${n(b.works)} work${b.works === 1 ? "" : "s"}` : ""}, opened where ${b.grain === "word" ? "the word it is on stands" : "the section it is on stands"}</span></a>`
  : null);

const withCommentary = books.map(commentaryLine).filter(Boolean);
const totalUnits = books.reduce((t, b) => t + b.units, 0);

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Tabernacle</title>
<meta name="description" content="A Hebrew reader built on a sealed chain: every reading traceable to the record that carries it, and every record to the licence it was released under.">
<style>
  :root { --bg:#0b1017; --panel:#111a26; --line:#22303f; --ink:#e8dcc0; --muted:#9fb0c2;
          --faint:#6b7f93; --gold:#e0b64f; --gold-dim:#b28f3c; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink);
         font:16px/1.6 Georgia,"Times New Roman",serif; display:flex; align-items:center;
         justify-content:center; padding:2rem 1.25rem; overflow-x:hidden; }
  main { width:100%; max-width:40rem; }
  h1 { margin:0 0 .35rem; font-size:2.1rem; letter-spacing:.02em; color:var(--gold); }
  p.sub { margin:0 0 2rem; color:var(--muted); font-size:.95rem; }
  .books { display:flex; flex-direction:column; gap:.7rem; }
  a.book { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;
           border:1px solid var(--line); border-radius:.7rem; background:var(--panel);
           padding:1rem 1.15rem; text-decoration:none; color:var(--ink); }
  a.book:hover { border-color:var(--gold-dim); }
  /* The title is the book's own. The English beside it is not a translation of
     it and must not be able to be read as one — it is how a reader who does not
     read Hebrew finds and refers to the book. So each line says which of the
     two it is before the thing itself. The labels are ours; the title is not. */
  a.book .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  a.book .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
                text-transform:uppercase; color:var(--faint); }
  a.book .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim); }
  a.book .of { margin-top:.45rem; color:var(--faint); font-size:.8rem; }
  /* The commentary is not a third book. It arrives shut, and what is behind it
     is one entry per book, each going to the book it belongs to — because that
     is where a commentary is read. */
  details.group { border:1px solid var(--line); border-radius:.7rem; background:var(--panel); }
  details.group > summary { list-style:none; cursor:pointer; padding:1rem 1.15rem;
    display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  details.group > summary::-webkit-details-marker { display:none; }
  details.group > summary::after { content:"\\25be"; margin-left:auto; color:var(--gold-dim);
    transform:rotate(-90deg); transition:transform 140ms; }
  details.group[open] > summary::after { transform:none; }
  details.group > summary .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
    text-transform:uppercase; color:var(--faint); }
  details.group > summary .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim); }
  details.group > summary .of { flex:1 0 100%; margin-top:.45rem; color:var(--faint); font-size:.8rem; }
  a.sub-book { display:block; padding:.85rem 1.15rem; border-top:1px solid var(--line);
    text-decoration:none; color:var(--ink); }
  a.sub-book:hover { background:rgba(224,182,79,.06); }
  a.sub-book .en { display:block; font-size:.98rem; color:var(--gold-dim); }
  a.sub-book .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }
  footer { margin-top:2.2rem; color:var(--faint); font-size:.78rem; }
  footer a { color:var(--gold-dim); }
</style>
</head>
<body>
<main>
  <!-- Built by tools/build-front-door-v1.mjs from the zones. Every count below
       is read out of a zone; nothing here is typed twice. -->
  <h1>The Tabernacle</h1>
  <p class="sub">A Hebrew reader on a sealed chain. Every reading traces to the record that carries it, and every record to the licence it was released under.</p>
  <nav class="books">
${books.map(bookCard).join("\n")}
${withCommentary.length ? `    <details class="group">
      <summary><span class="lab">also carried</span><span class="en">Commentary</span><span class="of">${n(totalUnits)} attached across ${withCommentary.length} book${withCommentary.length === 1 ? "" : "s"} · each opens inside the book it is on, at the words it is on</span></summary>
${withCommentary.join("\n")}
    </details>` : ""}
  </nav>
  <!-- A book's own title is corpus text and is not printed here. This page
       carries no records, so it can cite nothing; it says only how each book is
       commonly named, and the title itself waits inside, where it opens. -->
  <footer>A book's own title is printed where it can be opened — inside the reader, out of the ledger, with the records behind it. This page names each book only as it is commonly read. The Hebrew of each book carries its own licence, named on the page it is read from and in anything exported from it.</footer>
</main>
</body>
</html>
`;

// ---- the other face of the door ------------------------------------------
//
// The README described a proof slice of two verses with two commentators on it,
// months after the two books and their commentary had shipped whole. Nobody
// lied; it was written once and never had a reason to change. So it is written
// from the same counts as the page.
const readme = `# The Tabernacle

A Hebrew reader on a sealed chain. Every reading printed under a word traces to
the record that carries it, and every record to the licence it was released
under. No English is forced: a word offers every reading its sources attest, one
at a time, and the reader chooses.

Live site: https://mashiachsonyosef.github.io/

## What is published

${books.map((b) => `- **${esc(b.en)}** — ${n(b.sections)} sections, ${n(b.words)} words` +
  (b.units ? `, with ${n(b.units)} commentary units from ${n(b.works)} work${b.works === 1 ? "" : "s"} attached at the ${b.grain}` : "")).join("\n")}

Commentary is not a separate book. It is carried by the book it comments on and
opens where it attaches — at the word, or across the whole section, depending on
what the chain records for it.

## What is in here

- \`index.html\` — the front door. Built by \`tools/build-front-door-v1.mjs\`; do not edit.
- \`genesis-book-reader-v4/zone.html\` — the reader. One page serves every book.
- \`genesis-book-reader-v4/data/zones/\` — the books and their commentary, as built zones.
- \`genesis-book-reader-v4/data/route-store/\` — the readings, keyed by exact form.
- \`genesis-book-reader-v4/tools/\` — every build step and every check.
- \`genesis-book-reader-v4/PIPELINE-MANIFEST.md\` — generated: every rule the code
  declares and which check guards it, and every published file and what builds it.

## Building and checking

\`\`\`
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
\`\`\`

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source, and
end by printing what they do not cover.

## Two lanes

The corpus lane acquires, verifies and seals the text, the definition records
and the identity ledgers. Nothing in this repository reaches past what that lane
has sealed. The synthesis lane — this repository — builds the reader from those
artifacts and may not add a character to them.

## Licensing

There is no single licence. Every work carries its own, computed from its own
records and named on the page it is read from and in anything exported from it.
Nothing inherits a licence from the book it sits in.

Served from the \`gh-pages\` branch.
`;

const redirect = (b) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.en)} · The Tabernacle</title>
<link rel="canonical" href="/${b.slug}">
<!-- One reader, reached by a clean address. The reader rewrites the bar back to
     /${b.slug} once it has loaded, so this path is what a reader sees, keeps and
     returns to — and this file is what makes returning to it work. -->
<meta http-equiv="refresh" content="0; url=/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1017;
  color:#9fb0c2;font:16px Georgia,serif} a{color:#e0b64f}</style>
</head>
<body><p>Opening ${esc(b.en)} — <a href="/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">continue</a></p>
<script>location.replace("/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}");</script>
</body>
</html>
`;

// A page that carries no records may print no corpus text. Checked here rather
// than trusted, because this file is generated and a generator can drift too.
const HEBREW = /[֐-׿]/;
if (HEBREW.test(doc)) throw new Error("the front door printed a character of the text — refusing output");

if (HEBREW.test(readme)) throw new Error("the README printed a character of the text — refusing output");

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), doc);
writeFileSync(join(OUT, "README.md"), readme);
for (const b of books) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  const r = redirect(b);
  if (HEBREW.test(r)) throw new Error(`${b.slug}: the address page printed a character of the text — refusing output`);
  writeFileSync(join(OUT, b.slug, "index.html"), r);
}

console.log(`${OUT}/index.html + README.md · ${books.length} books · ${n(totalUnits)} commentary units`);
for (const b of books)
  console.log(`  ${b.slug.padEnd(9)} ${n(b.sections)} sections · ${n(b.words)} words` +
    (b.units ? ` · ${n(b.units)} commentary from ${b.works} works, at the ${b.grain}` : " · no commentary"));
