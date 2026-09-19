#!/usr/bin/env node
// Synthesis lane · chain-book-rule-v1-the-same-book-with-the-meaning-taken-out-so-only-the-joins-are-left
// LEDGER: -
// no frame letter. This serves no reading, changes no letter and decides
// nothing. It republishes a book this site already serves with every visible
// thing replaced by the fingerprint of its own bytes.
//
// THE POINT, WHICH IS NOT DECORATION. This project's whole claim is that a
// particular English is attached to a particular Hebrew by a stated rule, and
// that nothing in between was written, edited or chosen by us. Ordinarily a
// reader has to take that on trust: the page is in our typeface, our words
// sit beside theirs, and the join happens somewhere they cannot see.
//
// Take the meaning out and only the join is left. A word becomes a number. A
// reading becomes a number. The line between them is then a line between two
// fixed things, and a stranger can walk the whole book without reading a
// sentence of our prose or believing a word of it. If the shape here is the
// shape of the real book — same sections, same words, same order, same links
// — then the real book has nothing hidden in it, because this one could not
// hide anything: there is nothing here BUT structure.
//
// WHAT A FINGERPRINT IS COMPUTED FROM, exactly, so anyone can recompute it
// without asking us. Every hash below is sha256 over UTF-8 bytes, with no
// normalisation, no trimming and no case folding, printed as its first 12 hex
// digits and carried in full in the sidecar beside the page:
//
//   the word        the Hebrew AS THE PAGE PRINTS IT, vowels, cantillation
//                   and all — the licensed text, untouched
//   the key         the consonantal key that word is looked up under
//   a reading       the reading's English text as the card prints it
//   a source        the source's label as the catalog states it
//
// WHAT IT PROVES AND WHAT IT DOES NOT. It proves custody: that the bytes we
// serve are the bytes we received, and that the line from a word to a reading
// goes where we say it goes. It cannot prove a dictionary was right. A
// fingerprint is a fact about a file, never about the truth of what the file
// says, and a page that claimed otherwise would be worth nothing.
//
// Run: node tools/build-chain-book-v1.mjs --zone data/zones/amos.bin --out ../chain/amos
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { join } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";

export const CHAIN_RULE_ID = "chain-book-rule-v1-the-same-book-with-the-meaning-taken-out-so-only-the-joins-are-left";
export const CHAIN_SHORT = 12;
/** how many links the PAGE prints per word; the file beside it carries them all */
export const PAGE_SHOWS = 6;
/** the one function, stated in the page and used nowhere else: sha256 over the UTF-8 bytes, untouched */
export const fp = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");
export const shortFp = (s) => fp(s).slice(0, CHAIN_SHORT);

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const esc = (s) => String(s).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

if (import.meta.url === `file://${process.argv[1]}`) {
  const ZONE = arg("--zone"), STORE = arg("--store", "data/route-store");
  if (!ZONE) { console.error("missing --zone data/zones/<slug>.bin"); process.exit(2); }
  const slug = ZONE.split("/").pop().replace(/\.bin$/u, "");
  const OUT = arg("--out", join("..", "chain", slug));
  const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
  const store = openRouteStore(STORE);
  const ms = store.index.m_sources;

  const full = {};                      // short -> the whole 64, so nothing is only truncated
  const keep = (s) => { const h = fp(s); full[h.slice(0, CHAIN_SHORT)] = h; return h.slice(0, CHAIN_SHORT); };

  let words = 0, linked = 0, links = 0, bare = 0;
  const rows = [];
  for (const sec of zone.sections || []) {
    const cells = [];
    for (const w of (sec.words || [])) {
      words += 1;
      const surface = String(w.s ?? "");
      const key = String(w.k ?? "");
      const wf = keep(surface), kf = key ? keep(key) : null;
      // the readings this word's key stands on, in the order the card offers
      // them: the store's own pool, oldest first — the same call the page makes
      const rrows = key ? (store.routesFor(key) || []).filter((r) => ms[r[3]]) : [];
      const pool = rrows.length ? store.readingPool(rrows, "oldest") : [];
      if (pool.length) linked += 1; else bare += 1;
      const reads = pool.map((p) => {
        links += 1;
        // WHO CARRIES IT. The pool names its carriers in `by` — every m id
        // whose record stands behind this reading. The chain prints the
        // OLDEST of them, because that is the one the card credits, and
        // carries the rest in the file: a link with no carrier named is a
        // link a reader cannot follow back to anybody.
        const carriers = [...(p.by || [])].filter((m) => ms[m]);
        const oldest = carriers.map((m) => ({ m, y: Number.parseInt(ms[m].sourceYear, 10) }))
          .sort((a, b) => (Number.isFinite(a.y) ? a.y : Infinity) - (Number.isFinite(b.y) ? b.y : Infinity))[0];
        return {
          r: keep(p.text),
          s: oldest ? keep(ms[oldest.m].label) : null,
          by: carriers.length > 1 ? carriers.map((m) => keep(ms[m].label)) : undefined,
          y: Number.isFinite(p.year) ? p.year : null,
        };
      });
      cells.push({ w: wf, k: kf, reads, mark: w.mark ? keep(w.mark.kind) : null });
    }
    rows.push({ label: String(sec.label ?? ""), lf: keep(String(sec.label ?? "")), cells });
  }

  const sidecar = {
    schema_version: "CHAIN_BOOK_V1", rule_id: CHAIN_RULE_ID, work: slug,
    recipe: {
      function: "sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding",
      printed: `the first ${CHAIN_SHORT} hex digits; the whole 64 for every one of them is in full_by_short below`,
      inputs: {
        word: "the Hebrew as the page prints it — vowels, cantillation and all, the licensed text untouched",
        key: "the consonantal key the word is looked up under",
        reading: "the reading's English text as the card prints it",
        source: "the source's label as the catalog states it",
        section: "the section's label as the page prints it",
      },
      recompute: "take the string, sha256 it, compare the first 12 hex digits. Nothing here needs this site's code to check.",
    },
    what_this_proves: "custody: that the bytes served are the bytes received, and that the line from a word to a reading goes where this site says it goes",
    what_this_does_not_prove: "that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.",
    store: { dir: STORE, store_version: store.index.store_version, schema: store.index.schema_version },
    counts: { sections: rows.length, words, words_with_a_reading: linked, words_with_none: bare, links, distinct_fingerprints: Object.keys(full).length },
    full_by_short: full,
    sections: rows,
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "chain-v1.json.gz"), gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));

  // ── the page ──────────────────────────────────────────────────────────────
  const body = rows.map((sec) => {
    const cells = sec.cells.map((c) => {
      // THE PAGE IS A WINDOW ON THE FILE, and says so. A word can carry a
      // hundred and sixty-five readings; printing every one of them for every
      // word makes a four-megabyte page nobody opens on a phone. So the page
      // shows the first few and names how many it did not show, and the file
      // beside it carries every link with no window at all. The auditor wants
      // the file; the page is for seeing what shape the file is in.
      const shown = c.reads.slice(0, PAGE_SHOWS);
      const reads = shown.map((r) => `<li><b>${r.r}</b>${r.s ? `<i>${r.s}</i>` : ""}</li>`).join("");
      const rest = c.reads.length - shown.length;
      const more = rest > 0 ? `<li class="more">and ${rest.toLocaleString()} more link${rest === 1 ? "" : "s"}, in the file</li>` : "";
      return `<div class="w"><p class="k">${c.w}${c.k ? `<span>${c.k}</span>` : ""}</p>${reads ? `<ul>${reads}${more}</ul>` : `<p class="none">no reading</p>`}</div>`;
    }).join("");
    return `<section><h2>${sec.lf}<i>${esc(sec.label)}</i></h2><div class="ws">${cells}</div></section>`;
  }).join("\n");

  const c = sidecar.counts;
  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(slug)} · the same book with the meaning taken out</title>
<style>
 :root { --ink:#2b2622; --faint:#9b9186; --muted:#6f655c; --line:#d8cdbc; --paper:#f6f1e7; --sel:#7a5c2e; --tekhelet:#2f4a7a; }
 @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink:#e8e0d4; --faint:#7d746a; --muted:#a49a8e; --line:#3a352f; --paper:#17150f; --sel:#c9a24a; --tekhelet:#8fa9d6; } }
 * { box-sizing: border-box; }
 body { margin:0; padding:1rem 16px 4rem; background:var(--paper); color:var(--ink);
   font:15px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
 .wrap { max-width: 58rem; margin: 0 auto; }
 h1 { font-size: 1rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin:0 0 .3rem; }
 .lede { font-size:.82rem; color:var(--muted); line-height:1.6; max-width:44rem; margin:0 0 .6rem; }
 .lede b { color: var(--ink); font-weight:600; }
 details.recipe { border:1px solid var(--line); border-radius:.5rem; padding:.5rem .7rem; margin:.8rem 0 1.2rem; }
 details.recipe > summary { cursor:pointer; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
 details.recipe dl { margin:.6rem 0 0; font-size:.76rem; }
 details.recipe dt { color:var(--sel); }
 details.recipe dd { margin:0 0 .45rem; color:var(--muted); }
 .nums { font-size:.74rem; color:var(--faint); margin:.2rem 0 0; }
 section { border-top:1px solid var(--line); padding:.7rem 0 .2rem; }
 h2 { font-size:.72rem; color:var(--sel); margin:0 0 .5rem; font-weight:600; letter-spacing:.04em; }
 h2 i { font-style:normal; color:var(--faint); padding-left:.5rem; }
 .ws { display:grid; grid-template-columns:repeat(auto-fill,minmax(14.5rem,1fr)); gap:.5rem .9rem; }
 .w { border-left:1px solid var(--line); padding:0 0 .35rem .5rem; }
 .w .k { margin:0; font-size:.8rem; color:var(--ink); }
 .w .k span { color:var(--faint); padding-left:.45rem; font-size:.74rem; }
 .w ul { list-style:none; margin:.15rem 0 0; padding:0; }
 .w li { font-size:.74rem; color:var(--tekhelet); line-height:1.45; }
 .w li b { font-weight:400; }
 .w li i { font-style:normal; color:var(--faint); padding-left:.4rem; font-size:.7rem; }
 .w .none { margin:.15rem 0 0; font-size:.72rem; color:var(--faint); }
 .w li.more { color:var(--faint); font-size:.7rem; }
 footer { margin-top:2rem; font-size:.72rem; color:var(--faint); line-height:1.6; max-width:44rem; }
 a { color:var(--sel); }
</style></head><body><div class="wrap">
<h1>${esc(slug)} · the chain</h1>
<p class="lede">This is the same book this site serves, with the meaning taken out. Every word is the fingerprint of its own bytes, every reading is the fingerprint of its own text, and the line between them is the line the reader is shown. <b>Nothing here is written by this project.</b> Strip the language away and only the joins are left, so you can walk the whole book without reading a sentence of our prose or believing any of it.</p>
<p class="nums">${c.sections.toLocaleString()} sections · ${c.words.toLocaleString()} words · ${c.words_with_a_reading.toLocaleString()} carry a reading · ${c.words_with_none.toLocaleString()} carry none · ${c.links.toLocaleString()} links · ${c.distinct_fingerprints.toLocaleString()} distinct fingerprints · route store ${esc(store.index.store_version)}</p>
<p class="nums">This page prints the first ${PAGE_SHOWS} links under each word and says how many it left out. <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside it carries all ${c.links.toLocaleString()}, with every fingerprint at its full 64 digits.</p>
<details class="recipe"><summary>how to recompute any number on this page</summary>
<dl>
<dt>the function</dt><dd>sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding. Printed as the first ${CHAIN_SHORT} hex digits; all 64 for every one of them are in <a href="chain-v1.json.gz">chain-v1.json.gz</a> beside this page.</dd>
<dt>a word</dt><dd>the Hebrew as the page prints it — vowels, cantillation and all, the licensed text untouched. The pale number beside it is its consonantal key.</dd>
<dt>a reading</dt><dd>the reading's English text as the card prints it. The pale number after it is the label of the oldest source carrying that reading; where more than one carries it, the file lists them all.</dd>
<dt>what it proves</dt><dd>custody: the bytes served are the bytes received, and the line from a word to a reading goes where this site says it goes.</dd>
<dt>what it does not prove</dt><dd>that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.</dd>
</dl></details>
${body}
<footer>Built by <code>tools/build-chain-book-v1.mjs</code> from the same zone and the same route store the reading page is built from, at the same moment, by the same code. If this book and that one ever disagree in shape — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>
</div></body></html>`;
  writeFileSync(join(OUT, "index.html"), page);
  console.log(`${join(OUT, "index.html")} · ${c.sections} sections · ${c.words.toLocaleString()} words · ${c.links.toLocaleString()} links · ${c.distinct_fingerprints.toLocaleString()} distinct fingerprints · ${(page.length / 1024).toFixed(0)} KB`);
}
