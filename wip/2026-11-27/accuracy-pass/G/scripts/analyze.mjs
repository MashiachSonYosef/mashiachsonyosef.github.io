// Helper G · read-only analysis, every word of the chained books. Sets side by side, for each word:
//   the chain file (fingerprints)            base/chain/<book>/chain-v1.json.gz
//   the card as walked in the clear          walk-rest/<book>.jsonl.gz (walk.mjs)
//   the line the page prints                 base/reader/data/resting-lines/<book>.json.gz
//   the place's entry                        tools/entry-gate-v1.mjs over the zone's own tags
//   the rows behind each pill                the route store, read through the page's own reading of a row
// Writes per-word.tsv, chain-disagreements.tsv, summary.json beside this script. Hashes are taken here with node's
// sha256 over UTF-8 bytes; the builder's hash function is not imported.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const T = (f) => import(join(R, "tools", f));
const { labelsFor, saidOf, titleOf, chipLabelOf } = await T("card-readings-v1.mjs");
const { openRouteStore, signOnly, SIGN_GAP, joinDrawn } = await T("gloss-store-v1.mjs");
const { placeEntry, placeTags, bdbEntriesAt, entryVerdict, entrySaid, tagOf } = await T("entry-gate-v1.mjs");
const { pageReading } = await T("page-reading-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const sha12 = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const BOOKS = (process.argv[2] ? process.argv[2].split(",") : ["hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"]);
const STATE = process.argv[3] || "rest";

const labels = labelsFor(R);
const store = openRouteStore(join(R, "data/route-store"));
const MS = store.index.m_sources;
const PR = pageReading(readFileSync(join(R, "zone.html"), "utf8"), store.index);
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
const readingKey = (t) => spanJoin(t).toLowerCase();
// the twelve: the families the record of dictionary kinds files as kind "bible"
const kinds = JSON.parse(readFileSync(join(R, "data/dictionary-kinds-v1.json"), "utf8"));
const famOfKey = new Map();
for (const f of kinds.families) for (const k of f.keys || []) famOfKey.set(k, f);
const famOfM = (m) => { const s = MS[m]; return s ? famOfKey.get(s.key) || null : null; };
const isBibleM = (m) => { const f = famOfM(m); return !!f && f.kind === "bible"; };
const labelOfM = (m) => (labels.byId.get(m) ?? null);
// one source under two names: STEP's TAHOT is M4 in the store and PIECE:TAHOT at a place; MACULA is M3 and PIECE:MACULA
const SAME = { "PIECE:TAHOT": "M4", "PIECE:MACULA": "M3" };
const srcOf = (id) => SAME[id] || id;
const idsOfLabel = new Map();
for (const [id, l] of labels.byId) (idsOfLabel.get(l) || idsOfLabel.set(l, []).get(l)).push(id);

// a card as the chain should hold it, from what a card says, hashed here (as the site's check does it)
const cardHere = (said) => {
  const card = {};
  for (const [k, r] of Object.entries(said.rows)) if (r) card[k] = { of: r.of.map(sha12), on: r.on };
  if (said.here.length) card.here = said.here.map((h) => ({ is: h.is, r: sha12(h.text), s: h.label === null ? null : sha12(h.label) }));
  const list = said.pills.map((x) => ({ r: sha12(x.text), s: sha12(x.label), y: x.year, ...(x.by.length > 1 ? { by: x.by.map(sha12) } : {}), ...(x.mark ? { ym: sha12(x.mark) } : {}) }));
  return { card, list, on: said.on, over: said.over[1] > said.over[0] ? said.over : null };
};
const partsAt = (here, kept, pools) => {
  const { pool, on, over = null, ...rest } = kept;
  if (JSON.stringify(here.card) !== JSON.stringify(rest)) {
    const k = ["forms", "chain", "chain_words", "divisions", "blocks", "here"].find((x) => JSON.stringify(here.card[x] ?? null) !== JSON.stringify(rest[x] ?? null));
    return `its ${k === "here" ? "lines above the pills" : `row of ${String(k).replace("_", " ")}`} differ`;
  }
  const list = pool === null ? [] : pools[pool];
  if (here.list.length !== list.length) return `the card prints ${here.list.length} pills and the chain holds ${list.length} links`;
  const x = here.list.findIndex((l, i) => JSON.stringify(l) !== JSON.stringify(list[i]));
  if (x >= 0) return `pill ${x + 1} is not link ${x + 1}`;
  if (here.on !== on) return `pill ${here.on === null ? "none" : here.on + 1} stands pressed on the card and ${on === null ? "none" : on + 1} in the chain`;
  if (JSON.stringify(here.over) !== JSON.stringify(over)) return `the card stands on words ${JSON.stringify(here.over)} and the chain says ${JSON.stringify(over)}`;
  return "";
};

const tsv = (v) => String(v ?? "").replace(/[\t\n\r]+/gu, " ");
const perWord = [["book", "place", "word", "entry_index", "hebrew", "key", "kind_of_word", "blocks", "open_block", "open_role", "line_covers", "line", "line_is", "line_credit", "pressed_link", "pressed_link_source", "pressed_link_year", "pressed_is", "source_is", "here_line", "here_source", "here_is", "place_tags", "card_entry", "card_says_entry", "gated", "pills", "pills_this_entry", "pills_no_number", "pills_other_entry", "pills_place_own", "pills_beside_store", "pills_unmatched", "lines_not_in_chain", "card_vs_chain"]];
const UNMATCHED = [["book", "place", "word", "hebrew", "open_key", "pill", "title", "by"]];
const RESPELLED = [["book", "place", "word", "pill", "rows_print"]];
const NONUM = [["book", "place", "word", "hebrew", "place_entry", "pill", "family", "m", "row_facts", "row_headwords"]];
const dis = [["book", "place", "word", "hebrew", "kind", "chain_says", "page_says", "detail"]];
const summary = { state: STATE, books: {}, total: {}, pill_titles: {} };
const TITLES = summary.pill_titles;
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

for (const book of BOOKS) {
  const walkPath = join(OUT, `walk-${STATE}`, `${book}.jsonl.gz`);
  if (!existsSync(walkPath)) { console.log(`${book}: no walk`); continue; }
  const zone = gz(join(R, "data/zones", `${book}.bin`));
  const chain = gz(join(S, "base/chain", book, "chain-v1.json.gz"));
  const record = gz(join(R, "data/resting-lines", `${book}.json.gz`));
  const lines = gunzipSync(readFileSync(walkPath)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const meta = lines[0];
  const cards = new Map();
  for (const c of lines.slice(1)) cards.set(`${c.si}:${c.e}`, c);
  const B = summary.books[book] = { words: 0, state: meta.state, walk_notes: meta.notes, page_errors: meta.errors.length, ruled: meta.ruled, lines_moved: meta.moved.length };
  // the lines the walk's page drew against the record kept
  { let same = 0, off = 0;
    record.sections.forEach((sec, i) => { const live = meta.lines[i]; if (live && JSON.stringify(live.units) === JSON.stringify(sec[1])) same += 1; else off += 1; });
    B.record_sections_same_as_live = same; B.record_sections_not_same = off; }
  zone.sections.forEach((sec, si) => {
    const units = record.sections[si][1];
    const unitAt = (e) => units.find((u) => u[0] <= e && e < u[0] + u[1]) || null;
    let n = 0;
    (sec.words || []).forEach((w, e) => {
      if (w.mark) return;
      n += 1;
      B.words += 1;
      const place = `${sec.label}`;
      const c = cards.get(`${si}:${e}`);
      const heb = String(w.s ?? "");
      const cell = chain.sections[si].cells[e];
      if (!c || c.fault) { bump(B, "cards_not_walked"); dis.push([book, place, n, heb, "card-not-walked", "", "", c ? c.fault : "no card in the walk"]); return; }
      // ── the card against the chain ──
      let vs = "";
      try {
        const said = saidOf({ forms: c.forms, chain: c.chain, chain_words: c.chain_words, divisions: c.divisions, blocks: c.blocks, here: c.here.map((h) => h.slice(0, 5)), pills: c.pills.map((p) => p.slice(0, 4)), over: c.over }, labels);
        vs = partsAt(cardHere(said), cell[STATE === "rest" ? "rest" : "lifted"], chain.pools);
      } catch (err) { vs = `the card could not be read as the chain reads it: ${String(err.message || err)}`; }
      if (vs) { bump(B, "card_is_not_the_chain"); dis.push([book, place, n, heb, "card-vs-chain", "", "", vs]); } else bump(B, "card_is_the_chain");
      if (STATE !== "rest") { perWord.push([book, place, n, e, heb, w.k || "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", c.pills.length, "", "", "", "", "", "", "", vs || "same"]); return; }
      // ── the word ──
      const kq = Array.isArray(w.w);
      const pg = Array.isArray(w.pg) ? w.pg : [];
      const kindOfWord = kq ? "written-and-read" : c.over && c.over[1] > c.over[0] ? "in-a-run-one-card-joins" : pg.length > 1 ? "divided" : "whole";
      bump(B, `word_${kindOfWord}`);
      const blocks = c.blocks ? c.blocks.of : [];
      const openBlock = c.blocks && c.blocks.on.length ? c.blocks.of[c.blocks.on[0]] : "";
      const cores = pg.filter((x) => x && x.r === "core");
      const openPiece = pg.length > 1 && c.blocks && c.blocks.on.length && blocks.length === pg.length ? pg[c.blocks.on[0]] : null;
      const setWhole = !!c.blocks && blocks.length > 1 && !c.blocks.on.length;
      const openRole = !c.blocks ? "no-blocks" : blocks.length <= 1 ? "whole" : setWhole ? "the-division-whole" : openPiece ? openPiece.r : "?";
      // ── the line under the word ──
      const u = unitAt(e);
      const lineText = u ? u[2] : "", lineCredIds = u ? String(u[3]).split(" ").filter(Boolean) : [];
      const lineLabels = lineCredIds.map((id) => (record.sources[id] || {}).label || `?${id}`);
      const pressedAt = c.pills.findIndex((p) => p[3]);
      const pressed = pressedAt >= 0 ? c.pills[pressedAt] : null;
      const pt = pressed ? titleOf(pressed[1], labels.known) : null;
      const pressedLabel = pt ? pt.label : "";
      const hereLine = c.here.find((h) => h[0] === "here") || null;
      const hereLabel = hereLine && hereLine[3] ? chipLabelOf(hereLine[3], labels.known) : "";
      // what the place's own source gives: its pieces as the zone carries them, whole and for the open block
      const pieceTexts = pg.map((x) => String((x && x.g) ?? "").trim());
      const stepWhole = pieceTexts.join(" + ");
      const stepDrawn = pieceTexts.length ? joinDrawn(pieceTexts.every((x) => signOnly(x)) ? pieceTexts : pieceTexts.map((x) => (signOnly(x) ? SIGN_GAP : x))) : "";
      const lineIs = !u ? "no-line" : u[1] > 1 ? "one-line-over-several-words" : !pieceTexts.length ? "the-place-has-no-pieces" : lineText === stepWhole ? "the-places-pieces" : lineText === stepDrawn ? "the-places-pieces-a-sign-left-as-a-gap" : lineText.replace(/\u200b/gu, "").trim() === pieceTexts.filter((x) => !signOnly(x)).join(" + ") ? "the-places-pieces-a-sign-left-as-a-gap" : "NOT-the-places-pieces";
      bump(B, `line_${lineIs}`);
      const target = openPiece ? String(openPiece.g ?? "").trim() : stepWhole;
      let pressedIs = "";
      if (!pressed) pressedIs = "no-pill-pressed";
      else if (!pieceTexts.length) pressedIs = u && pressed[0] === lineText ? "the-line" : "the-place-has-no-pieces";
      else if (pressed[0] === target) pressedIs = openPiece ? "the-places-reading-of-the-open-block" : "the-places-reading";
      else if (readingKey(pressed[0]) === readingKey(target)) pressedIs = "the-places-reading-case-aside";
      else if (u && pressed[0] === lineText) pressedIs = "the-line";
      else if (signOnly(target) || target.split(" + ").every((x) => signOnly(x))) pressedIs = "ANOTHER-READING-the-places-is-a-sign-switched-off";
      else pressedIs = "ANOTHER-READING";
      bump(B, `pressed_${pressedIs}`);
      // the source: the line's credit against the source the pressed link names
      let sourceIs = "";
      const lineSrc = lineCredIds.map(srcOf);
      const titleIds = (idsOfLabel.get(pressedLabel) || []).map(srcOf);
      const byIds = pressed ? String(pressed[2]).split(" ").filter(Boolean) : [];
      if (!u || !pressed) sourceIs = "-";
      else if (titleIds.some((x) => lineSrc.includes(x))) sourceIs = "the-lines-credit";
      else if (byIds.some((x) => lineCredIds.includes(x))) sourceIs = "ANOTHER-SOURCE-the-lines-credit-stands-behind-the-link";
      else if (byIds.map(srcOf).some((x) => lineSrc.includes(x))) sourceIs = "ANOTHER-SOURCE-the-lines-source-stands-behind-under-its-store-name";
      else sourceIs = "ANOTHER-SOURCE-the-lines-credit-is-not-behind-the-link";
      bump(B, `source_${sourceIs}`);
      if (pressedIs.startsWith("ANOTHER") || pressedIs === "no-pill-pressed") dis.push([book, place, n, heb, "pressed-link-is-not-the-places-reading", pressed ? `${pressed[0]} [${pressedLabel}]` : "(no pill pressed)", `the place reads «${stepWhole}»; the line prints «${lineText}» [${lineLabels.join(" | ")}]`, `${pressedIs} · blocks ${blocks.join(" ")} · open ${openBlock} (${openRole})`]);
      if (lineIs === "NOT-the-places-pieces") dis.push([book, place, n, heb, "line-is-not-the-places-pieces", "", `the line prints «${lineText}» [${lineLabels.join(" | ")}]`, `the zone's pieces read «${stepWhole}» (${pg.map((x) => x.s).join(",")})`]);
      if (sourceIs.startsWith("ANOTHER")) dis.push([book, place, n, heb, "link-source-is-not-the-lines-credit", `${pressed[0]} [${pressedLabel}${pt && pt.year !== null ? `, ${pt.year}` : ""}] by ${byIds.join(" ")}`, `${lineText} [${lineCredIds.join(" ")}: ${lineLabels.join(" | ")}]`, sourceIs]);
      // the line said whole above the pills
      let hereIs = "";
      if (!hereLine) hereIs = "no-such-line";
      else if (!u) hereIs = "no-line-under-the-word";
      else if (hereLine[1] === lineText) hereIs = "the-line";
      else if (hereLine[1] === stepWhole) hereIs = "the-places-pieces-with-their-signs";
      else if (readingKey(hereLine[1]) === readingKey(lineText)) hereIs = "the-line-case-aside";
      else hereIs = "NOT-THE-LINE";
      const hereSrcSame = hereLine ? (hereLine[2] ? lineCredIds.includes(hereLine[2]) : lineLabels.includes(hereLabel)) : null;
      bump(B, `here_${hereIs}`);
      if (hereLine) bump(B, hereSrcSame ? "here_credit_is_the_lines" : "here_credit_is_ANOTHER");
      if (hereIs === "NOT-THE-LINE" || hereSrcSame === false) dis.push([book, place, n, heb, "line-above-the-pills-is-not-the-line", `${hereLine[1]} [${hereLine[2]}: ${hereLabel}]`, `${lineText} [${lineCredIds.join(" ")}: ${lineLabels.join(" | ")}]`, hereLine[5]]);
      // every pill: the label its title names, and the names behind it
      for (const pl of c.pills) {
        const t = titleOf(pl[1], labels.known);
        const lab = t ? t.label : "?";
        bump(TITLES, lab);
        if (/\(PIECE:/u.test(lab)) bump(B, "pills_whose_title_names_an_internal_id");
        const ids = String(pl[2]).split(" ").filter(Boolean);
        if (ids.some((x) => x.startsWith("PIECE:"))) bump(B, "pills_with_a_piece_name_behind");
        if (ids.includes("PIECE:TAHOT") && ids.includes("M4")) bump(B, "pills_with_step_behind_under_both_names");
      }
      // ── the entry ──
      const holder = kq ? null : w;
      const tags = holder ? placeTags(holder) : null;
      const placeE = tags ? placeEntry(tags) : null;
      const wantSaid = placeE ? entrySaid(placeE).join("|") : "";
      const cardTags = c.entry || "";
      const cardSaid = (c.ds && c.ds.entry) || "";
      // the tags the open form is asked by, as the page says it asks (the whole form or the one core piece: the word's; else none)
      const openKey = setWhole ? "" : (openBlock || w.k || "");
      const inRun = !!(c.over && c.over[1] > c.over[0]);
      const askedTags = kq || setWhole ? null : (openKey === w.k ? tags : cores.length === 1 && cores[0].k === openKey ? tags : null);
      const askedPlace = askedTags ? placeEntry(askedTags) : null;
      if (!kq) {
        if (inRun) bump(B, "entry_tags_of_a_runs_card_not_compared");
        else if ((tags ? tags.join(" ") : "") !== cardTags) { bump(B, "entry_tags_differ"); dis.push([book, place, n, heb, "entry-tags", "", `the card is gated by «${cardTags}»`, `the zone's tags for the place are «${tags ? tags.join(" ") : ""}»`]); } else bump(B, tags ? "entry_tags_same" : "entry_no_tags_at_the_place");
        const wantHere = askedPlace ? entrySaid(askedPlace).join("|") : "";
        if (wantHere !== cardSaid) { bump(B, "entry_said_differs"); dis.push([book, place, n, heb, "entry-said", "", `the card's pills are held to «${cardSaid}»`, `the entry gate gives «${wantHere}» for the open form ${openKey} (${openRole})`]); } else bump(B, askedPlace ? "entry_said_same" : "entry_not_asked_of_the_open_form");
      } else bump(B, "entry_written_and_read_not_compared");
      // ── each pill's rows, and their verdict at the place ──
      const all = (store.routesFor(openKey) || []).filter((r) => MS[r[3]]);
      const facts = all.map((r) => PR.factsOf(r));
      const bdbHere = askedPlace ? bdbEntriesAt(askedPlace, facts) : null;
      const printsOf = all.map((r) => { const nd = PR.isNoDerivs(MS[r[3]].licensePosture); return (nd ? [PR.routePrinted(r)] : PR.readingsOfRow(r)).map(readingKey); });
      const tally = { this: 0, none: 0, other: 0, place: 0, beside: 0, unmatched: 0 };
      c.pills.forEach((p, x) => {
        const by = String(p[2]).split(" ").filter(Boolean);
        // the text the pill's own rows give: a pointer's own text where the pill prints another entry's English
        const texts = [p[0]];
        if (p[5]) texts.push(p[5]);
        if (p[6]) texts.push(p[0].replace(/ \([^()]*\)$/u, ""));
        if (p[7]) texts.push(p[0].replace(/ \(read [^()]*\)$/u, ""));
        const keys = new Set(texts.map(readingKey));
        const rows = [];
        all.forEach((r, i) => { if (by.includes(String(r[3])) && printsOf[i].some((k) => keys.has(k))) rows.push(i); });
        // how the pill's text stands to the bytes of the rows behind it
        { let how;
          if (p[5] || p[6] || p[7]) how = "composed-by-the-page-a-pointer-or-a-read-word-beside-it";
          else if (!rows.length) how = "no-store-row-found";
          else if (rows.some((i) => String(all[i][1]) === p[0])) how = "a-rows-text-whole-byte-for-byte";
          else if (rows.some((i) => PR.readingsOfRow(all[i]).includes(p[0]) || PR.routePrinted(all[i]) === p[0])) how = "a-part-of-a-rows-text-as-its-ledger-cuts-it";
          else how = "a-rows-reading-respelled-by-the-page-stop-dropped-pieces-joined-or-case";
          bump(B, `pilltext_${how}`);
          if (how.startsWith("a-rows-reading-respelled") && RESPELLED.length < 400) RESPELLED.push([book, place, n, p[0], rows.map((i) => JSON.stringify(PR.readingsOfRow(all[i]))).join(" ; ").slice(0, 200)].map(tsv)); }
        const isPlace = c.poolPlace && c.poolPlace[x] === "1";
        const ov = c.poolOv && c.poolOv[x];
        if (isPlace) { tally.place += 1; return; }
        if (!rows.length) { if (ov || by.some((m) => !MS[m])) tally.beside += 1; else { tally.unmatched += 1; if (UNMATCHED.length < 300) UNMATCHED.push([book, place, n, heb, openKey, p[0], p[1], p[2]].map(tsv)); } return; }
        if (!askedPlace) { tally.none += 0; return; }
        const vs2 = rows.map((i) => entryVerdict(facts[i], askedPlace, bdbHere));
        // a pill stands on the rows the gate left: where a row of the place's entry prints it, it is that entry's; else
        // where a row with no number prints it, it stands by that row; only where every row that could print it is of
        // another entry is it a link of another entry
        const firstBible = rows.map((i) => String(all[i][3])).find(isBibleM);
        if (vs2.includes("this")) tally.this += 1;
        else if (vs2.includes("none")) {
          tally.none += 1;
          const i = rows.find((ri, j) => vs2[j] === "none");
          const fam = famOfM(String(all[i][3]));
          bump(B, `no_number_pills_of_${fam ? `${fam.kind}:${fam.id}` : "?"}`);
          if (fam && fam.kind === "bible") NONUM.push([book, place, n, heb, wantSaid, p[0], fam.id, String(all[i][3]), JSON.stringify(facts[i] || {}), JSON.stringify(all[i][6] || [])].map(tsv));
        } else { tally.other += 1; dis.push([book, place, n, heb, "link-of-another-entry", `${p[0]} [${titleOf(p[1], labels.known)?.label || ""}]`, `the place's entry is ${wantSaid}`, rows.map((i) => `${all[i][3]} ${JSON.stringify(facts[i])}`).join(" ; ").slice(0, 300)]); }
      });
      for (const k of Object.keys(tally)) bump(B, `pills_${k}`, tally[k]);
      bump(B, "pills", c.pills.length);
      if (askedPlace) bump(B, "pills_on_gated_cards", c.pills.length); else bump(B, "pills_on_cards_not_asked_an_entry", c.pills.length);
      // ── what the card prints above its pills that the chain does not hold ──
      const notInChain = c.dflt.length;
      bump(B, "lines_of_sources_at_the_place_not_in_the_chain", notInChain);
      if (notInChain) bump(B, "cards_with_such_lines");
      for (const d of c.dflt) bump(B, `dflt_line_${d[0]}`);
      for (const o of c.other) bump(B, `other_band_${String(o[0]).replace(/\s+/gu, ".")}`);
      perWord.push([book, place, n, e, heb, w.k || "", kindOfWord, blocks.join(" "), openBlock, openRole, u ? u[1] : 0, lineText, lineIs, lineCredIds.join(" "), pressed ? pressed[0] : "", pressedLabel, pt && pt.year !== null ? pt.year : "", pressedIs, sourceIs, hereLine ? hereLine[1] : "", hereLabel || "", hereIs, tags ? tags.join(" ") : "", cardTags, cardSaid, askedPlace ? "yes" : "no", c.pills.length, tally.this, tally.none, tally.other, tally.place, tally.beside, tally.unmatched, notInChain, vs || "same"].map(tsv));
    });
  });
  for (const [k, v] of Object.entries(B)) if (typeof v === "number") bump(summary.total, k, v);
  console.log(`${book}: ${B.words} words · card is the chain ${B.card_is_the_chain || 0}, is not ${B.card_is_not_the_chain || 0}`);
}
const sfx = STATE === "rest" ? "" : `-${STATE}`;
writeFileSync(join(OUT, `per-word${sfx}.tsv`), perWord.map((r) => r.join("\t")).join("\n") + "\n");
writeFileSync(join(OUT, `chain-disagreements${sfx}.tsv`), dis.map((r) => r.map(tsv).join("\t")).join("\n") + "\n");
if (STATE === "rest") writeFileSync(join(OUT, "pills-unmatched-sample.tsv"), UNMATCHED.map((r) => r.join("\t")).join("\n") + "\n");
if (STATE === "rest") writeFileSync(join(OUT, "pills-respelled-sample.tsv"), RESPELLED.map((r) => r.join("\t")).join("\n") + "\n");
if (STATE === "rest") writeFileSync(join(OUT, "links-with-no-number.tsv"), NONUM.map((r) => r.join("\t")).join("\n") + "\n");
writeFileSync(join(OUT, `summary${sfx}.json`), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary.total, null, 1));
