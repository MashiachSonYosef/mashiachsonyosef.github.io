// THE LICENSE CHIP AND THE BLOB FOLLOW THE READING SHOWN: a truth table.
//
// The owner's ruling, 2026-10-10: "the license ledger main purpose is to try
// to politely shove you into showing the license when i change the english
// showing" and "same with blobs it should apply when changed too". So on
// every path that changes the English shown under a word (or under a maqaf
// chain or a run), the chip under that line must be the chip of the reading
// now shown, and the word's blob (svg.wj-tie, split at each "+") must be
// drawn again from the reading now shown.
//
// This probe REPRODUCES; it changes nothing. It opens the bare reader
// (reader/zone.html?b=<book>&blobs=every) on the local site, drives each
// change path with the reader's own controls (the rail's buttons, the
// sources row's chips, the word card's R pills and the card's half switch,
// the mode buttons), and before and after each action reads, for a fixed set
// of real words and runs:
//   - the English shown (the line's text, the license chip left out),
//   - the chip (.g-lic): its text and its title,
//   - the blob: the svg.wj-tie paths for that word (count, data-n,
//     data-piece, data-en), the split row (.g-pcs) if any, and whether the
//     drawn English boxes still sit where the English now stands.
// It then resolves the shown reading's own identity from the zone data the
// page holds (window.__zone, the lattice sidecar, the route-store index,
// the pick the probe itself pressed), following the map in
// place/understand.json: a TAHOT or MACULA piece is PIECE:TAHOT or
// PIECE:MACULA by the piece's own s; a baked line is gloss_m at the key whose
// reading is shown (label within its carriers); a headword line is word.hm
// (label + posture); an order column is gloss_m_orders; a lattice leader is
// its [text, label, posture, year]; a pressed pill is its lead row's m_id; a
// live line under the source switches is the live pool's first reading (read
// off the card after the line is measured). "Follows" means the chip's text
// is that reading's license name and its title names that reading's source,
// and the blob has one piece per "+" part where the word's own division
// answers the parts (else one piece), drawn where the English now stands.
//
// It never calls a repaint itself before measuring. After measuring it does
// call window.__drawAllTies() once and reads the blob again ("forced"), to
// tell a blob that was simply not drawn again from one that is drawn wrong.
//
// Run:  node probe.mjs [--books ruth,genesis] [--only <path-id,...>] [--site http://127.0.0.1:8912]
// Writes probe-result.json beside itself and prints the table.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const SITE = arg("site", "http://127.0.0.1:8912");
const BOOKS = arg("books", "ruth,genesis").split(",");
const ONLY = arg("only", "") ? new Set(arg("only", "").split(",")) : null;

// ---- the words, by verse and word index (the Hebrew is read off the zone) ----
const TARGETS = {
  ruth: [
    { id: "days", at: "1:1", i: 1, why: "h differs from k and has no hg: the headword line reads gloss[h]" },
    { id: "two", at: "1:1", i: 17, why: "TAHOT says and + [the] two (2 pieces); oldest first says one piece; hg two" },
    { id: "say", at: "3:5", i: 4, why: "its pg is MACULA's, not TAHOT's" },
    { id: "said", at: "3:17", i: 7, why: "its pg is MACULA's, not TAHOT's" },
    { id: "kq-deal", at: "1:8", i: 9, why: "ketiv/qere pair; TAHOT's pieces spell the qere" },
    { id: "kq-me", at: "3:5", i: 5, why: "qere-only pair; its pg is MACULA's" },
    { id: "kq-rel", at: "2:1", i: 1, why: "pair whose halves read under different licenses (ketiv CC BY-SA 4.0, qere CC BY 4.0)" },
    { id: "chain-a", at: "1:2", i: 19, why: "maqaf chain, first word" },
    { id: "chain-b", at: "1:2", i: 20, why: "maqaf chain, second word" },
    { id: "run-a", at: "1:13", i: 3, why: "named license run (hud-runs), first word" },
    { id: "run-b", at: "1:13", i: 4, why: "named license run (hud-runs), second word" },
    { id: "death", at: "1:17", i: 12, why: "a sign-only piece (<the>) the signs switch drops or keeps" },
    { id: "mil", at: "1:14", i: 6, why: "three pieces, the first a sign" },
    { id: "obj-a", at: "1:6", i: 13, why: "maqaf chain whose first word is a sign (<obj.>)" },
    { id: "obj-b", at: "1:6", i: 14, why: "maqaf chain, second word, two pieces" },
  ],
  genesis: [
    { id: "earth", at: "1:2", i: 0, why: "three pieces; hg earth" },
    { id: "was", at: "1:2", i: 1, why: "TAHOT <it> was; the baked line is MACULA's" },
    { id: "tohu", at: "1:2", i: 2, why: "order columns differ" },
    { id: "bohu", at: "1:2", i: 3, why: "the owner's blob word: and + emptiness; h emptiness" },
    { id: "dark", at: "1:2", i: 4, why: "two pieces; hg darkness" },
    { id: "over", at: "1:2", i: 5, why: "maqaf chain, first word" },
    { id: "face", at: "1:2", i: 6, why: "maqaf chain, second word" },
    { id: "deep", at: "1:2", i: 7, why: "one piece, order columns differ" },
    { id: "waters", at: "1:2", i: 13, why: "two pieces" },
  ],
};
// the word each card path presses, per book: "word" is a lone word whose
// card offers a reading that splits otherwise; "division" a lone word whose
// card offers another division of it
// A PATH THE FIRST PROBE LACKED (added 2026-10-10, after its re-run): the
// corroboration chips on the word's card ("the same record, carried by N
// more witnesses of this reading"). Pressing one chooses that witness's
// record, so the line's chip must become that witness's. The family carries
// its own word, measured in that family alone, so every other family's rows
// stay exactly as the first probe made them.
const ALSO = { genesis: { id: "called", at: "1:5", i: 0, why: "its reading is carried by a second witness under another license (a corroboration chip on its card)" } };
const PRESS = { ruth: { word: "two", division: "two", chain: "chain-b", run: "run-b", kq: "kq-rel", open: ["say", "days"], src: "two" },
  genesis: { word: "waters", division: "dark", chain: "face", run: "tohu", kq: null, open: ["bohu", "was"], src: "tohu" } };

// ---- the reader's own controls ------------------------------------------------
const rail = (toggle, lab) => ({ kind: "rail", toggle, lab, say: `rail: "${toggle}" row, press "${lab}"` });
const source = (sel, lab) => ({ kind: "source", sel, lab, say: `rail: sources row, press the chip of ${lab}` });
const card = (tid, mode) => ({ kind: "card", tid, mode });
const mode = (m) => ({ kind: "mode", m, say: `press "${m === "en" ? "English reader" : "Hebrew reader"}"` });

// Each family runs in a fresh page; its steps run in order, each measured
// before and after. A step marked setup is measured too and reported apart.
const FAMILIES = (book) => {
  const P = PRESS[book];
  const F = [];
  F.push({ id: "card", steps: [
    { id: "pill-press", act: card(P.word, "differ"), say: `tap the word, press another R pill on its card, close the card` },
    { id: "pill-press-back", act: card(P.word, "original"), say: `tap the word again, press the R pill that reads what the line first read, close` },
    { id: "ruled-then-oldest", act: rail("reads", "oldest first"), say: `with that ruling standing, rail "the line reads" -> "oldest first"` },
    { id: "ruled-then-place", act: rail("reads", "the source here"), say: `rail "the line reads" -> "the source here"` },
  ] });
  F.push({ id: "open", steps: [
    ...P.open.map((t) => ({ id: "card-open-default", act: card(t, "none"), say: `tap the word (default view), press nothing, close` })),
    { id: "card-division-only", act: card(P.division, "division"), say: `tap the word, press the card's other division (the whole form) and no reading, close` },
    { id: "lookup-headword", setup: true, act: rail("lookup", "the headword"), say: `rail "look up by" -> "the headword"` },
    ...P.open.map((t) => ({ id: "card-open-headword", act: card(t, "none"), say: `under the headword lookup, tap the word, press nothing, close` })),
  ] });
  F.push({ id: "runcard", steps: [
    { id: "chain-pill-press", act: card(P.chain, "differ"), say: `tap a word of the maqaf chain, press another R pill for it on the run card, close` },
    ...(P.run ? [{ id: "run-pill-press", act: card(P.run, "differ"), say: `tap a word of the named run, press another R pill for it, close` }] : []),
  ] });
  if (P.kq) F.push({ id: "kq", steps: [
    { id: "pairs-qere-at-place", act: rail("pairs", "read (qere)"), say: `rail "pairs" -> "read (qere)" (default line: the source here)` },
    { id: "pairs-ketiv-at-place", act: rail("pairs", "written (ketiv)"), say: `rail "pairs" -> "written (ketiv)"` },
    { id: "order-oldest", setup: true, act: rail("reads", "oldest first"), say: `rail "the line reads" -> "oldest first"` },
    { id: "pairs-qere", act: rail("pairs", "read (qere)"), say: `under oldest first, rail "pairs" -> "read (qere)"` },
    { id: "pairs-source", act: rail("pairs", "as the source sets them"), say: `rail "pairs" -> "as the source sets them"` },
    { id: "pairs-ketiv", act: rail("pairs", "written (ketiv)"), say: `rail "pairs" -> "written (ketiv)"` },
    { id: "kq-half-card", act: card(P.kq, "half"), say: `tap the pair, on its card press the other half in the head, close` },
    { id: "kq-pill-press", act: card(P.kq, "differ"), say: `tap the pair, press another R pill for the half open, close` },
  ] });
  F.push({ id: "order", steps: [
    { id: "order-oldest", act: rail("reads", "oldest first"), say: `rail "the line reads" -> "oldest first"` },
    { id: "order-characters", act: rail("order", "characters"), say: `rail fold "reads first" -> "characters"` },
    { id: "order-corpus", act: rail("order", "corpus"), say: `rail fold "reads first" -> "corpus"` },
    { id: "order-witnessed-entry", act: rail("order", "witnessed in entry"), say: `rail fold "reads first" -> "witnessed in entry"` },
    { id: "order-witnessed-here", act: rail("order", "witnessed here"), say: `rail fold "reads first" -> "witnessed here"` },
    { id: "order-masoretic", act: rail("order", "masoretic"), say: `rail fold "reads first" -> "masoretic" (lattice)` },
    { id: "order-cites", act: rail("order", "cites here"), say: `rail fold "reads first" -> "cites here" (lattice)` },
    { id: "order-vowels-differ", act: rail("order", "vowels differ"), say: `rail fold "reads first" -> "vowels differ" (lattice)` },
    { id: "order-place", act: rail("reads", "the source here"), say: `rail "the line reads" -> "the source here" (TAHOT at this place)` },
  ] });
  F.push({ id: "licence", steps: [
    { id: "licence-pd", act: rail("licence", "public domain"), say: `rail "license" -> "public domain"` },
    { id: "licence-by", act: rail("licence", "CC BY"), say: `rail "license" -> "CC BY"` },
    { id: "licence-by-sa", act: rail("licence", "CC BY-SA"), say: `rail "license" -> "CC BY-SA"` },
    { id: "licence-any", act: rail("licence", "any"), say: `rail "license" -> "any"` },
  ] });
  F.push({ id: "lookup", steps: [
    { id: "lookup-headword", act: rail("lookup", "the headword"), say: `rail fold "look up by" -> "the headword"` },
    { id: "lookup-form", act: rail("lookup", "the form"), say: `rail fold "look up by" -> "the form"` },
    { id: "order-oldest", setup: true, act: rail("reads", "oldest first"), say: `rail "the line reads" -> "oldest first"` },
    { id: "lookup-headword-oldest", act: rail("lookup", "the headword"), say: `under oldest first, "look up by" -> "the headword"` },
    { id: "lookup-form-oldest", act: rail("lookup", "the form"), say: `under oldest first, "look up by" -> "the form"` },
  ] });
  F.push({ id: "masorah", steps: [
    { id: "masorah-only", act: rail("masorah", "only this pointing"), say: `rail fold "the pointing" -> "only this pointing"` },
    { id: "masorah-letters", act: rail("masorah", "the letters only"), say: `rail fold "the pointing" -> "the letters only"` },
    { id: "masorah-keep", act: rail("masorah", "keep"), say: `rail fold "the pointing" -> "keep"` },
  ] });
  F.push({ id: "sources", steps: [
    { id: "tahot-off", act: source({ id: "M4" }, "STEP TAHOT (M4)"), say: `rail sources row: switch off the STEP TAHOT chip (M4), the place reading's source` },
    { id: "tahot-on", act: source({ id: "M4" }, "STEP TAHOT (M4)"), say: `switch the STEP TAHOT chip back on` },
    { id: "order-oldest", setup: true, act: rail("reads", "oldest first"), say: `rail "the line reads" -> "oldest first"` },
    { id: "source-off-live", act: source({ chipOf: P.src }, `the source credited on the ${P.src} line`), say: `under oldest first, switch off the chip of the source the line credits (the live pool, repaintLive)` },
    { id: "source-on-live", act: source({ again: true }, "the same source"), say: `switch that source back on` },
  ] });
  F.push({ id: "overlays", steps: [
    { id: "jastrow-off", act: source({ overlay: "jastrow" }, "Jastrow"), say: `rail sources row: switch off the Jastrow chip(s)` },
    { id: "jastrow-on", act: source({ overlay: "jastrow" }, "Jastrow"), say: `switch Jastrow back on` },
    { id: "samaritan-off", act: source({ overlay: "samaritan" }, "Samaritan"), say: `rail sources row: switch off the Samaritan chips` },
    { id: "samaritan-on", act: source({ overlay: "samaritan" }, "Samaritan"), say: `switch the Samaritan chips back on` },
  ] });
  F.push({ id: "relay", steps: [
    { id: "maqaf-pieces", act: rail("maqaf", "as separate words"), say: `rail fold "joined words" -> "as separate words"` },
    { id: "maqaf-written", act: rail("maqaf", "as written"), say: `rail fold "joined words" -> "as written"` },
    { id: "runs-off", act: rail("runs", "off"), say: `rail fold "license runs" -> "off"` },
    { id: "runs-all", act: rail("runs", "any naming"), say: `rail fold "license runs" -> "any naming"` },
    { id: "runs-own", act: rail("runs", "the entry’s own"), say: `rail fold "license runs" -> "the entry's own"` },
  ] });
  F.push({ id: "signs", steps: [
    { id: "signs-printed", act: rail("signs", "as printed"), say: `rail "source signs" -> "as printed"` },
    { id: "signs-below", act: rail("signs", "after plain readings"), say: `rail "source signs" -> "after plain readings"` },
    { id: "signs-off", act: rail("signs", "off"), say: `rail "source signs" -> "off"` },
  ] });
  F.push({ id: "mode", steps: [
    { id: "mode-en", act: mode("en"), say: `press "English reader"` },
    { id: "lookup-headword-en", act: rail("lookup", "the headword"), say: `in the English reader, rail fold "look up by" -> "the headword"` },
    { id: "mode-he", act: mode("he"), say: `press "Hebrew reader"` },
    { id: "lookup-form", act: rail("lookup", "the form"), say: `rail fold "look up by" -> "the form"` },
  ] });
  if (ALSO[book]) F.push({ id: "also", targets: [ALSO[book]], steps: [
    { id: "order-oldest", setup: true, act: rail("reads", "oldest first"), say: `rail "the line reads" -> "oldest first"` },
    { id: "also-pill", setup: true, act: card(ALSO[book].id, "alsoPill"), say: `tap the word, press the first R pill whose card offers a corroborating witness under another license, close` },
    { id: "also-press", act: card(ALSO[book].id, "also"), say: `tap the word again, press the corroboration chip of the witness under another license, close` },
  ] });
  F.push({ id: "bsb", steps: [
    { id: "bsb-on", setup: true, act: rail("suggested", "the BSB"), say: `rail fold "source suggested" -> "the BSB"` },
    { id: "bsb-card", act: card(P.word, "bsb"), say: `tap the word; read the BSB line on the card and its chip; close` },
  ] });
  return F;
};

// ---- in the page: reading, resolving, judging ------------------------------
const LIB = () => {
  const fp = {};
  window.__fp = fp;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const SJ = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
  const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
  const trimSigns = (ps) => { const keep = ps.filter((x) => !signOnly(x)); return keep.length ? keep : ps; };
  const HEB = /[א-ת]/u;
  const letters = (s) => [...String(s || "")].filter((c) => HEB.test(c)).join("");
  const ORDER_OF_LABEL = { "the source here": "place", "at this place": "place", "oldest first": "oldest" };
  const LATTICE_POS = { masoretic: "m", cites: "c", "vowels-differ": "x" };
  const LICENCE_COLS = { pd: "licence_pd", by: "licence_by", "by-sa": "licence_by_sa" };
  fp.load = async () => {
    if (fp.POST) return;
    const j = async (u) => { try { const r = await fetch(u); return r.ok ? r.json() : null; } catch { return null; } };
    fp.POST = await j("data/license-postures-v1.json");
    fp.IX = await j("data/route-store/index.json");
    fp.SUG = await j("data/source-suggested/index.json");
    fp.MS = { ...((fp.IX && fp.IX.m_sources) || {}) };
    for (const o of ["jastrow", "samaritan"]) { const x = await j(`data/overlays/${o}/index.json`); for (const [id, s] of Object.entries((x && x.m_sources) || {})) fp.MS[id] = { ...s, overlay: o }; }
  };
  fp.licName = (p) => { p = String(p || ""); if (!p) return "License unrecorded"; const r = fp.POST && fp.POST.postures && fp.POST.postures[p]; return (r && r.name) || p; };
  fp.idsOfLabel = (label) => Object.entries(fp.MS).filter(([, s]) => s.label === label).map(([id]) => id);
  // the state the page is in, from its own record of the reader's choices
  fp.state = () => {
    const ls = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
    const z = window.__zone;
    const hasPg = !!(z && z.sections.some((s) => s.words.some((w) => Array.isArray(w.pg) && w.pg.length)));
    const order = ls("fh.def.order") || (hasPg ? "place" : "oldest");
    const lookup = ls("fh.lookup") === "headword" ? "headword" : "form";
    const licence = ["any", "pd", "by", "by-sa"].includes(ls("fh.licence")) ? ls("fh.licence") : "any";
    const kq = ["KETIV", "QERE", "SOURCE"].includes(ls("fh.order.kq")) ? ls("fh.order.kq") : "KETIV";
    return { order: ORDER_OF_LABEL[order] || order, lookup, licence, kq, masorah: window.__masorah || "keep", signs: window.__signs || "off",
      maqaf: ls("fh.maqaf-join") === "pieces" ? "pieces" : "maqaf", runs: ls("fh.runs") || "own", off: [...(window.__sourcesOff || [])],
      en: document.body.classList.contains("en"), suggested: ls("fh.suggested") || "off", blobsEvery: new URLSearchParams(location.search).get("blobs") === "every" };
  };
  fp.word = (label, i) => { const z = window.__zone; const secs = z.sections.filter((s) => s.label === label); return secs.length ? secs[0].words[i] : null; };
  fp.wb = (word) => [...document.querySelectorAll(".he-text .wb")].find((x) => x.__word === word) || null;
  const textOf = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); };
  const unionOf = (rs) => rs.reduce((u, r) => (u ? { L: Math.min(u.L, r.left), R: Math.max(u.R, r.right), T: Math.min(u.T, r.top), B: Math.max(u.B, r.bottom) } : { L: r.left, R: r.right, T: r.top, B: r.bottom }), null);
  const rectOf = (el) => unionOf([...el.getClientRects()].filter((r) => r.width > 0));
  const textRect = (el) => {
    const tn = [...el.childNodes].find((n) => n.nodeType === 3 && n.data.trim());
    if (!tn) return null;
    let a = 0, b = tn.data.length; while (a < b && /\s/u.test(tn.data[a])) a += 1; while (b > a && /\s/u.test(tn.data[b - 1])) b -= 1;
    const rg = document.createRange(); rg.setStart(tn, a); rg.setEnd(tn, b);
    return unionOf([...rg.getClientRects()].filter((r) => r.width > 0));
  };
  // where a target's English stands and what is drawn behind it
  fp.locate = (label, i) => {
    const word = fp.word(label, i);
    const wb = word && fp.wb(word);
    if (!wb) return { word, missing: true };
    const run = wb.closest(".wjoin");
    if (run && run.__ink) {
      const wbs = [...run.__ink.querySelectorAll(":scope > .wb")];
      const wi = wbs.indexOf(wb);
      const g = run.querySelector(":scope > .g");
      const parts = !!(g && g.classList.contains("parts"));
      return { word, wb, run, wi, host: run, line: parts ? g.querySelector(`:scope > .g-part[data-wi="${wi}"]`) : g, kind: parts ? "run-part" : "run-whole",
        runKey: run.__key || null, chain: !!run.__chain, form: g && g.dataset.form ? g.dataset.form : null };
    }
    return { word, wb, run: null, wi: 0, host: wb, line: wb.querySelector(":scope > .g"), kind: wb.classList.contains("kq") ? "kq" : "word" };
  };
  fp.read = (label, i) => {
    const L = fp.locate(label, i);
    if (L.missing) return { missing: true };
    const lineEl = L.line;
    const chip = lineEl ? lineEl.querySelector(":scope > .g-lic") : null;
    const shown = lineEl ? textOf(lineEl) : null;
    const svg = L.host.querySelector(":scope > svg.wj-tie");
    const paths = svg ? [...svg.querySelectorAll("path[data-wi]")].filter((p) => (L.kind === "run-part" ? Number(p.dataset.wi) === L.wi : true)) : [];
    paths.sort((p, q) => Number(p.dataset.piece) - Number(q.dataset.piece));
    const row = lineEl ? lineEl.querySelector(":scope > .g-pcs") : null;
    const pcs = row ? [...row.querySelectorAll(":scope > .g-pc")].map((x) => x.textContent.trim()) : null;
    // the English boxes as the line sets them now, in the blob host's frame,
    // padded as drawPairs pads them (2 px across, 1 px up and down)
    let geom = null;
    if (paths.length && lineEl) {
      const H = L.host.getBoundingClientRect();
      const boxes = row && paths.length === pcs.length && paths.length > 1 ? [...row.querySelectorAll(":scope > .g-pc")].map(rectOf) : [row ? rectOf(row) : textRect(lineEl)];
      if (boxes.length === paths.length && boxes.every(Boolean)) {
        let d = 0;
        paths.forEach((p, k) => {
          const [l, r] = String(p.dataset.en || "").split(",").map(Number);
          d = Math.max(d, Math.abs(l - (boxes[k].L - H.left - 2)), Math.abs(r - (boxes[k].R - H.left + 2)));
        });
        geom = Math.round(d * 10) / 10;
      } else if (boxes.length === 1 && boxes[0]) {
        // pieces drawn over English that now stands whole: the drawn pieces'
        // span against the English's own span
        const ls = paths.map((p) => String(p.dataset.en || "").split(",").map(Number));
        const l = Math.min(...ls.map((x) => x[0])), r = Math.max(...ls.map((x) => x[1]));
        geom = `${paths.length} pieces over one whole English (span off by ${Math.round(Math.max(Math.abs(l - (boxes[0].L - H.left - 2)), Math.abs(r - (boxes[0].R - H.left + 2))) * 10) / 10}px)`;
      } else geom = `boxes ${boxes.filter(Boolean).length} vs paths ${paths.length}`;
    }
    return {
      he: L.word.s, k: L.word.k, kind: L.kind, wi: L.wi, runKey: L.runKey || null, chain: !!L.chain, form: L.form || null,
      shown, bare: !lineEl || !shown || (lineEl.classList && lineEl.classList.contains("bare")), hasLine: !!lineEl,
      chip: chip ? { text: chip.textContent.replace(/\s+/g, " ").trim(), title: chip.title } : null,
      blob: { paths: paths.length, n: [...new Set(paths.map((p) => p.dataset.n))].join(","), pieces: paths.map((p) => p.dataset.piece).join(","), geom, svg: !!svg },
      pcs, pcsCounts: row ? row.dataset.counts : null,
    };
  };
  // ---- identities -----------------------------------------------------------
  fp.pieceId = (s) => {
    const W = (((((window.__zone || {}).emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {};
    const w = W[`english_${s}`];
    const map = `PIECE:${String(s || "none").toUpperCase()}`;
    if (!w) return { map, lic: "?", label: `no witness english_${s}` };
    const m = fp.MS[w.m];
    return { map, lic: fp.licName(w.licence), label: (m && m.label) || w.label, mId: w.m };
  };
  fp.gmId = (gm, where) => {
    if (!gm) return { map: `${where}: none`, lic: null, label: null };
    const by = Array.isArray(gm.by) ? gm.by : [];
    const ids = fp.idsOfLabel(gm.m).filter((id) => by.includes(id));
    return { map: ids.join("|") || `label:${gm.m}`, lic: gm.lic, label: gm.m, where };
  };
  fp.lpId = (label, posture, where) => {
    const ids = Object.entries(fp.MS).filter(([, s]) => s.label === label && s.licensePosture === posture).map(([id]) => id);
    return { map: ids.join("|") || `label+posture:${String(label).slice(0, 40)}|${posture}`, lic: fp.licName(posture), label, where };
  };
  fp.mIdOf = (mId, hint) => { const s = fp.MS[mId]; return { map: mId, lic: s ? fp.licName(s.licensePosture) : "?", label: s ? s.label : hint || mId }; };
  const soffLine = (st, text) => (st.signs === "off" ? trimSigns(String(text).split(" + ")).join(" + ") : String(text));
  // the place's reading under the state, as placeLine/placeShown read it, its
  // identity taken piece by piece from each piece's own source
  fp.placeOf = (word, st) => {
    const z = window.__zone;
    if (st.order !== "place" || !word || !Array.isArray(word.pg) || !word.pg.length) return null;
    if (st.lookup === "headword" || st.licence !== "any" || st.masorah === "only" || st.masorah === "letters") return null;
    const W = ((((z.emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {};
    if (W.english_tahot && st.off.includes(W.english_tahot.m)) return null;
    const parts = word.pg.map((p) => String((p && p.g) || "").trim());
    if (parts.some((t) => !t)) return null;
    let keep = parts.map((_, j) => j);
    if (st.signs === "off") { const k2 = keep.filter((j) => !signOnly(parts[j])); if (k2.length) keep = k2; }
    return { why: "place", moved: true, text: soffLine(st, SJ(keep.map((j) => parts[j]).join("/"))), ids: keep.map((j) => fp.pieceId(word.pg[j].s)) };
  };
  // a lone word's line under the state: the page's precedence (wordBlock,
  // lineUnder), with the identity of what is shown
  fp.expectWord = (word, st, picks) => {
    const z = window.__zone, LS = window.__latticeStore, off = new Set(st.off);
    const k = word.k;
    if (k && picks[k]) return { why: "ruled", text: soffLine(st, SJ(picks[k].text)), ids: [fp.mIdOf(picks[k].mId, picks[k].label)] };
    if (st.lookup === "headword" && word.hg && word.h && z.gloss[word.h])
      return { why: "headword-hg", moved: true, text: soffLine(st, SJ(word.hg)), ids: word.hm ? [fp.lpId(word.hm.m, word.hm.lic, "word.hm")] : [] };
    const pl = fp.placeOf(word, st);
    if (pl) return pl;
    const lk = st.lookup === "headword" && word.h && z.gloss[word.h] ? word.h : k;
    let e = null;
    if (off.size && z.gloss_m && k) {
      const gm = z.gloss_m[lk];
      if (gm && Array.isArray(gm.by) && gm.by.length && gm.by.every((m) => off.has(m))) {
        const alt = gm.alt;
        e = alt && Array.isArray(alt.by) && !alt.by.every((m) => off.has(m))
          ? { why: "sources-alt", moved: true, text: soffLine(st, SJ(alt.text)), ids: [fp.gmId(alt, "gloss_m.alt")] }
          : { why: "sources-bare", moved: true, text: "", ids: [] };
      }
    }
    if (!e && st.licence !== "any" && z.gloss_orders && k) {
      const colId = LICENCE_COLS[st.licence], col = colId ? z.gloss_orders[colId] : null;
      if (col && Object.prototype.hasOwnProperty.call(col, lk)) {
        const gm = z.gloss_m_orders && z.gloss_m_orders[colId] ? z.gloss_m_orders[colId][lk] : null;
        const allOff = !!(gm && Array.isArray(gm.by) && gm.by.length && gm.by.every((m) => off.has(m)));
        if (!allOff) e = { why: `licence:${colId}`, moved: true, text: soffLine(st, SJ(col[lk])), ids: [fp.gmId(gm, `gloss_m_orders.${colId}`)] };
      }
    }
    if (!e && st.masorah === "only" && LS && LS.grades && word.s) {
      const gr = LS.grades[word.s], first = gr && gr.o && gr.o.l;
      if (first) e = { why: "masorah-only", moved: true, text: soffLine(st, SJ(first[0])), ids: [fp.lpId(first[1], first[2], "lattice o.l")] };
      else if (gr && gr.o && Object.prototype.hasOwnProperty.call(gr.o, "l")) e = { why: "masorah-bare", moved: true, text: "", ids: [] };
    }
    if (!e && st.masorah === "letters") {
      const gr = LS && LS.grades && word.s ? LS.grades[word.s] : null, first = gr && gr.o && gr.o.x;
      if (first) e = { why: "letters", moved: true, text: soffLine(st, SJ(first[0])), ids: [fp.lpId(first[1], first[2], "lattice o.x")] };
    }
    if (!e && st.masorah !== "letters" && LATTICE_POS[st.order] && LS && LS.grades && word.s) {
      const gr = LS.grades[word.s], first = gr && gr.o && gr.o[LATTICE_POS[st.order]];
      if (first) e = { why: `lattice:${st.order}`, moved: true, text: soffLine(st, SJ(first[0])), ids: [fp.lpId(first[1], first[2], `lattice o.${LATTICE_POS[st.order]}`)] };
    }
    if (!e) {
      const g = z.gloss[lk];
      e = g ? { why: lk === k ? "baked" : "headword-gloss", text: soffLine(st, SJ(g)), ids: [fp.gmId(z.gloss_m && z.gloss_m[lk], lk === k ? "gloss_m[k]" : "gloss_m[h]")] }
        : { why: "no-reading", text: "", ids: [] };
    }
    // the live pool under the source switches (partNeedsLive)
    if (off.size) {
      let need = false;
      if (e.moved) need = e.why.startsWith("sources") || e.ids.some((x) => x.label && fp.idsOfLabel(x.label).some((id) => off.has(id)));
      else { const gm = z.gloss_m && z.gloss_m[lk]; need = !!(gm && (Array.isArray(gm.by) && gm.by.length ? gm.by.some((id) => off.has(id)) : gm.m && fp.idsOfLabel(gm.m).some((id) => off.has(id)))); }
      if (need) e = { ...e, live: true };
    }
    return e;
  };
  // a pair's line: kqPick and paintPairs
  fp.expectKq = (word, st, picks) => {
    const z = window.__zone;
    const regions = (word.w || []).filter((r) => !String((r && (r.s || r.k)) || "").includes("־"));
    const parts = regions.map((r) => (picks[r.k] ? SJ(picks[r.k].text) : z.gloss[r.k] ? SJ(z.gloss[r.k]) : "—"));
    const usable = (j) => j >= 0 && parts[j] && parts[j] !== "—";
    let i = regions.findIndex((r) => picks[r.k]), at = null;
    if (i < 0) {
      const pl = fp.placeOf(word, st);
      if (pl) { const spelled = word.pg.map((x) => (x && x.k) || "").join(""); const j = regions.findIndex((r) => r.k === spelled); if (j >= 0) { i = j; at = pl; } }
    }
    if (i < 0) {
      const wanted = st.kq === "QERE" ? regions.findIndex((r) => r.role !== "KETIV") : st.kq === "SOURCE" ? 0 : regions.findIndex((r) => r.role === "KETIV");
      i = usable(wanted) ? wanted : regions.findIndex((r, j) => j !== wanted && usable(j));
    }
    if (i < 0) return { why: "kq-bare", text: "", ids: [] };
    if (at) return { ...at, why: `kq-place:${regions[i].role}` };
    if (picks[regions[i].k]) return { why: `kq-ruled:${regions[i].role}`, text: soffLine(st, parts[i]), ids: [fp.mIdOf(picks[regions[i].k].mId, picks[regions[i].k].label)] };
    return { why: `kq:${regions[i].role}`, text: soffLine(st, parts[i]), ids: [fp.gmId(z.gloss_m && z.gloss_m[regions[i].k], `gloss_m[${regions[i].role}]`)] };
  };
  // every reading the zone holds for a word, with its identity: where the
  // page's precedence (expect) names one reading and the line shows another,
  // the line's own reading is found here by its text
  fp.candidates = (word, st, picks) => {
    const z = window.__zone, LS = window.__latticeStore, out = [];
    const add = (why, text, ids) => { if (text) out.push({ why, text: soffLine(st, SJ(text)), ids }); };
    const keys = [word.k, ...((word.w || []).map((r) => r.k))].filter(Boolean);
    for (const k of keys) if (picks[k]) add(`pick[${k}]`, picks[k].text, [fp.mIdOf(picks[k].mId, picks[k].label)]);
    if (Array.isArray(word.pg) && word.pg.length && word.pg.every((p) => String((p && p.g) || "").trim())) {
      const parts = word.pg.map((p) => String(p.g).trim());
      let keep = parts.map((_, j) => j);
      if (st.signs === "off") { const k2 = keep.filter((j) => !signOnly(parts[j])); if (k2.length) keep = k2; }
      add("place", keep.map((j) => parts[j]).join("/"), keep.map((j) => fp.pieceId(word.pg[j].s)));
    }
    if (word.hg && word.hm) add("word.hg", word.hg, [fp.lpId(word.hm.m, word.hm.lic, "word.hm")]);
    for (const k of [...keys, word.h].filter(Boolean)) {
      if (z.gloss[k]) add(`gloss[${k === word.h && k !== word.k ? "h" : "k"}]`, z.gloss[k], [fp.gmId(z.gloss_m && z.gloss_m[k], "gloss_m")]);
      const alt = z.gloss_m && z.gloss_m[k] && z.gloss_m[k].alt;
      if (alt && alt.text) add("gloss_m.alt", alt.text, [fp.gmId(alt, "gloss_m.alt")]);
      for (const [c, col] of Object.entries(z.gloss_orders || {})) if (col[k] != null) add(`gloss_orders.${c}`, col[k], [fp.gmId(z.gloss_m_orders && z.gloss_m_orders[c] && z.gloss_m_orders[c][k], `gloss_m_orders.${c}`)]);
    }
    const gr = LS && LS.grades && word.s ? LS.grades[word.s] : null;
    if (gr && gr.o) for (const [o, first] of Object.entries(gr.o)) if (Array.isArray(first)) add(`lattice o.${o}`, first[0], [fp.lpId(first[1], first[2], `lattice o.${o}`)]);
    // a ruling on a division reads each block of it as a form of its own
    // (ruledLine over m.cut): TAHOT's pieces or the book's span cells, each
    // read from the baked table under its own key
    const cutsOf = [Array.isArray(word.pg) ? word.pg.map((p) => p && p.k).filter(Boolean) : null, z.spans && word.k && Array.isArray((z.spans[word.k] || [])[0]) ? z.spans[word.k][0] : null];
    for (const cells of cutsOf) {
      if (!cells || cells.length < 2) continue;
      const read = cells.map((c) => (picks[c] ? SJ(picks[c].text) : z.gloss[c] ? SJ(z.gloss[c]) : "—"));
      if (read.every((x) => x === "—")) continue;
      out.push({ why: `division ${cells.join("+")} read block by block`, text: soffLine(st, read.join(" + ")),
        ids: cells.map((c) => (picks[c] ? fp.mIdOf(picks[c].mId, picks[c].label) : fp.gmId(z.gloss_m && z.gloss_m[c], `gloss_m[block]`))) });
    }
    return out;
  };
  fp.byText = (label, i, picks, shown) => {
    const L = fp.locate(label, i), st = fp.state();
    if (L.missing || !shown) return null;
    const hit = fp.candidates(L.word, st, picks).filter((c) => c.text.toLowerCase() === String(shown).toLowerCase());
    if (!hit.length) return null;
    const keys = new Set(hit.map((c) => c.ids.map((x) => `${x.lic}|${x.label}`).join(";")));
    return { ...hit[0], why: `${hit[0].why} (found by its text${keys.size > 1 ? `; ${keys.size} readings print it` : ""})` };
  };
  fp.expect = (label, i, picks) => {
    const L = fp.locate(label, i), st = fp.state();
    if (L.missing) return null;
    const word = L.word;
    if (L.kind === "run-whole") {
      const z = window.__zone;
      if (L.runKey && picks[`cut:${L.runKey}`]) return { why: "run-ruled-cut", text: picks[`cut:${L.runKey}`].text, ids: [] };
      if (L.form) return { why: "run-as-written", text: SJ(z.gloss[L.form] || ""), ids: [fp.gmId(z.gloss_m && z.gloss_m[L.form], "gloss_m[as written]")] };
    }
    if (L.kind === "run-part" && L.chain && L.runKey && picks[`${L.runKey}|${word.k}`]) {
      const p = picks[`${L.runKey}|${word.k}`];
      return { why: "run-ruled", text: soffLine(st, SJ(p.text)), ids: [fp.mIdOf(p.mId, p.label)] };
    }
    const e = word.kq ? fp.expectKq(word, st, picks) : fp.expectWord(word, st, picks);
    // a run under signs off leaves out a word whose whole reading is a sign,
    // where another word of the run carries a reading (refreshJoinGloss)
    if ((L.kind === "run-part" || L.kind === "run-whole") && st.signs === "off" && e && e.text && signOnly(e.text) && !L.line)
      return { ...e, why: `${e.why}+sign-dropped`, text: "", ids: [] };
    return e;
  };
  // the chip a reading's identities call for: chipOfMs's rule
  fp.chipFor = (ids) => {
    const uniq = [...new Map(ids.filter((x) => x && x.lic != null).map((x) => [`${x.lic} ${x.label}`, x])).values()];
    if (!uniq.length) return null;
    if (uniq.length === 1) return { text: uniq[0].lic, label: uniq[0].label };
    return { text: `${uniq.length} licenses`, labels: uniq.map((u) => u.label) };
  };
  // the blob a shown reading calls for: one piece per "+" part where the
  // word's own division answers the parts (divisionFor), else one piece
  fp.division = (word, parts) => {
    const z = window.__zone;
    if (!word || parts.length < 2 || word.kq) return null;
    const own = letters(word.s);
    const fits = (cells) => !!cells && cells.length === parts.length && cells.every(Boolean) && cells.join("") === own;
    const pg = Array.isArray(word.pg) ? word.pg.map((p) => letters(p && p.k)) : null;
    const said = Array.isArray(word.pg) && word.pg.length === parts.length && word.pg.every((p, j) => SJ(String((p && p.g) || "")) === parts[j]);
    if (said && fits(pg)) return pg.map((c) => c.length);
    const row = z && z.spans && word.k ? z.spans[word.k] : null;
    const cells = row && Array.isArray(row[0]) ? row[0].map(letters) : null;
    if (fits(cells)) return cells.map((c) => c.length);
    if (fits(pg)) return pg.map((c) => c.length);
    return null;
  };
  fp.piecesFor = (label, i, shown) => {
    const L = fp.locate(label, i), st = fp.state();
    if (L.missing || L.kind === "kq" || L.kind === "run-whole") return null;
    if (L.kind === "word" && !st.blobsEvery) return null;
    if (!shown) return 0;
    const parts = shown.split(" + ").map((x) => x.trim());
    if (parts.length < 2) return 1;
    return fp.division(L.word, parts) ? parts.length : 1;
  };
  // ---- the card ---------------------------------------------------------------
  fp.pills = () => {
    const bs = [...document.querySelectorAll("#hud .r-pills button")];
    const aligned = window.__pool && window.__poolLead && window.__pool.length === bs.length;
    return bs.map((b, j) => ({ j, text: b.textContent.replace(/\s+/g, " ").trim(), by: b.dataset.by || "", title: b.title, pressed: b.getAttribute("aria-pressed") === "true",
      lead: aligned ? window.__poolLead[j] : null, ov: aligned && window.__poolOv ? window.__poolOv[j] || "" : "" }));
  };
  // the source a pill is credited to, as the pill itself says it: its title
  // names the label of its first record (records[0][3], what a press stores),
  // narrowed to the ids it carries (data-by)
  fp.pillId = (p) => {
    const label = String(p.title || "").split(" · ").slice(1).join(" · ");
    const by = String(p.by || "").split(" ").filter(Boolean);
    const ids = fp.idsOfLabel(label).filter((id) => by.includes(id));
    const id = ids[0] || p.lead;
    return { ...fp.mIdOf(id, label), map: ids.join("|") || id, lead: p.lead };
  };
  // the card's divisions (the whole form, or TAHOT's pieces at this place)
  fp.cuts = () => [...document.querySelectorAll("#hud .b-cut button")].map((b, j) => ({ j, text: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") === "true" }));
  fp.pressCut = async (j) => {
    const b = document.querySelectorAll("#hud .b-cut button")[j];
    if (!b) return null;
    const sig = () => [...document.querySelectorAll("#hud .r-pills button")].map((x) => x.textContent).join("\u0001");
    const was = sig();
    b.click();
    // the division's readings come from the store: wait until they replace
    // the pills that stood
    const t0 = Date.now();
    while (Date.now() - t0 < 10000 && sig() === was) await sleep(100);
    await sleep(300);
    return fp.pills();
  };
  fp.waitPills = async (ms = 12000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const hud = document.getElementById("hud");
      if (hud && !hud.hidden && document.querySelector("#hud .r-pills button")) break;
      await sleep(80);
    }
    await sleep(300);
    return fp.pills();
  };
  fp.openCard = async (label, i) => {
    const L = fp.locate(label, i);
    if (L.missing) return { err: "word not built" };
    L.wb.scrollIntoView({ block: "center" });
    await sleep(200);
    (L.wb.querySelector(".w span") || L.wb.querySelector(".w") || L.wb).click();
    const pills = await fp.waitPills();
    return { pills, sug: fp.sug() };
  };
  fp.press = async (j) => { const b = document.querySelectorAll("#hud .r-pills button")[j]; if (!b) return false; b.click(); await sleep(500); return true; };
  fp.otherHalf = async () => {
    const seg = document.querySelector('#hud .head b span[role="button"]');
    if (!seg) return { err: "no other half in the card's head" };
    seg.click();
    const pills = await fp.waitPills();
    return { pills };
  };
  fp.sug = () => {
    const line = document.querySelector("#hud .r-sug");
    if (!line) return null;
    const chip = line.querySelector(".g-lic");
    const val = line.querySelector("b");
    return { text: val ? val.textContent.trim() : null, chip: chip ? { text: chip.textContent.replace(/\s+/g, " ").trim(), title: chip.title } : null };
  };
  // the corroboration chips under the card's record
  fp.also = () => [...document.querySelectorAll("#hud .d-also-m")].map((b, j) => {
    const lc = b.querySelector(".lic-chip");
    const lab = b.closest(".d-also") && b.closest(".d-also").querySelector(".d-also-lab");
    return { j, label: String(b.title || "").split(" \u2014 ")[0], lic: lc ? lc.textContent.trim() : null, same: !!(lab && /same record/.test(lab.textContent)) };
  });
  fp.pressAlso = async (j) => { const b = document.querySelectorAll("#hud .d-also-m")[j]; if (!b) return false; b.click(); await sleep(700); return true; };
  fp.close = async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await sleep(250); };
  // ---- the sources row -----------------------------------------------------
  fp.srcChips = () => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .src-row > .dfp[data-ids]')];
  fp.clickSources = (ids) => {
    const hit = fp.srcChips().filter((b) => b.dataset.ids.split(" ").some((id) => ids.includes(id)));
    // a chip is redrawn when its row is; press each one standing now, by its ids
    const keys = hit.map((b) => b.dataset.ids);
    for (const k of keys) { const b = fp.srcChips().find((x) => x.dataset.ids === k); if (b) b.click(); }
    return keys;
  };
  fp.rail = (toggle, lab) => {
    const row = document.querySelector(`.rail .row[data-toggle="${toggle}"]`);
    if (!row) return `no rail row ${toggle}`;
    const b = [...row.querySelectorAll(".dfp")].find((x) => x.textContent.trim() === lab);
    if (!b) return `no button "${lab}" in ${toggle}`;
    if (b.disabled) return `"${lab}" is drawn dead in ${toggle}: ${b.title || ""}`;
    b.click();
    return null;
  };
  return fp;
};

// ---- the judging, in node -------------------------------------------------------
const chipVerdict = (exp, act, shown) => {
  // a line that is only a dash or a joiner says no reading: it wears no chip
  if (!shown || !/[\p{L}\p{N}]/u.test(shown)) return act ? "chip-on-no-reading" : "ok";
  if (!exp) return act ? "chip-but-no-identity" : "ok";
  if (!act) return "missing";
  if (exp.labels) return act.text === exp.text && exp.labels.every((l) => (act.title || "").includes(l)) ? "ok" : "wrong";
  const textOk = act.text === exp.text, srcOk = (act.title || "").startsWith(exp.label);
  return textOk && srcOk ? "ok" : textOk ? "wrong-source" : "wrong";
};
const blobVerdict = (want, r) => {
  if (want == null) return "n/a";
  const b = r.blob;
  if (want === 0) return b.paths === 0 ? "ok" : `stale: ${b.paths} path(s) on an empty line`;
  if (b.paths !== want) return `pieces ${b.paths} (n=${b.n || "-"}), want ${want}`;
  if (b.n !== String(want)) return `data-n ${b.n}, want ${want}`;
  const parts = (r.shown || "").split(" + ").map((x) => x.trim());
  if (want > 1 && !(r.pcs && r.pcs.length === want && r.pcs.every((t, j) => t === parts[j]))) return `split row ${JSON.stringify(r.pcs)} vs shown ${JSON.stringify(parts)}`;
  if (want === 1 && r.pcs && r.pcs.length > 1) return `old split row kept: ${JSON.stringify(r.pcs)}`;
  if (typeof r.blob.geom === "string") return `drawn boxes do not match: ${r.blob.geom}`;
  if (r.blob.geom != null && r.blob.geom > 2.5) return `drawn where the English no longer stands (${r.blob.geom}px)`;
  return "ok";
};
const short = (s, n = 34) => (s == null ? "∅" : String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));
const chipSay = (c) => (c ? `${c.text} ‹${short((c.title || "").split(" — ")[0].split(" · ")[0], 26)}›` : "no chip");

// ---- the run ---------------------------------------------------------------------
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const rows = [];
const log = (...a) => console.log(...a);

const runFamily = async (book, fam) => {
  const steps = fam.steps.filter((s) => !ONLY || ONLY.has(s.id) || s.setup);
  if (!steps.some((s) => !s.setup)) return;
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(LIB);
  const page = await ctx.newPage();
  let inflight = 0;
  page.on("request", () => { inflight += 1; });
  page.on("requestfinished", () => { inflight = Math.max(0, inflight - 1); });
  page.on("requestfailed", () => { inflight = Math.max(0, inflight - 1); });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const settle = async () => {
    await page.waitForTimeout(350);
    await page.waitForFunction(() => !window.__livePending, null, { timeout: 120000 }).catch(() => {});
    const t0 = Date.now(); while (inflight > 0 && Date.now() - t0 < 30000) await page.waitForTimeout(100);
    await page.waitForFunction(() => !window.__livePending, null, { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(450);
  };
  await page.goto(`${SITE}/reader/zone.html?b=${book}&blobs=every`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.evaluate(() => window.__fp.load());
  // build every section of a small book; a large one keeps its first screens
  const targets = [...TARGETS[book], ...(fam.targets || [])];
  await page.evaluate(async (tg) => {
    const fp = window.__fp;
    for (let g = 0; g < 4000; g += 1) {
      if (tg.every((t) => !fp.locate(t.at, t.i).missing)) break;
      const n = document.querySelector("section.seg.seg-wait");
      if (!n) break;
      n.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 8));
    }
    window.scrollTo(0, 0);
  }, targets);
  await settle();
  const picks = {};
  const readAll = () => page.evaluate(([tg, pk]) => tg.map((t) => {
    const fp = window.__fp, r = fp.read(t.at, t.i);
    let e = r.missing ? null : fp.expect(t.at, t.i, pk);
    // the page's precedence names one reading and the line shows another:
    // the line's own reading, found by its text among the zone's readings
    if (e && r.shown && (e.text || "") !== r.shown && !e.live) {
      const f = fp.byText(t.at, t.i, pk, r.shown);
      if (f) e = { ...f, why: `${f.why}; precedence said ${e.why} "${e.text}"`, textResolved: true };
    }
    return { t: t.id, r, e, want: r.missing ? null : fp.piecesFor(t.at, t.i, r.shown), chipWant: e ? fp.chipFor(e.ids) : null };
  }), [targets, picks]);
  for (const step of steps) {
    const t0 = Date.now();
    const before = await readAll();
    const note = {};
    let cardPills = null;
    try {
      const a = step.act;
      if (a.kind === "rail") { const err = await page.evaluate(([t, l]) => window.__fp.rail(t, l), [a.toggle, a.lab]); if (err) note.err = err; }
      else if (a.kind === "mode") await page.click(a.m === "en" ? "#modeEn" : "#modeHe");
      else if (a.kind === "source") {
        let ids = [];
        if (a.sel.id) ids = [a.sel.id];
        else if (a.sel.overlay) ids = await page.evaluate((o) => Object.entries(window.__fp.MS).filter(([, s]) => s.overlay === o).map(([id]) => id), a.sel.overlay);
        else if (a.sel.chipOf) {
          const tg = targets.find((t) => t.id === a.sel.chipOf);
          ids = await page.evaluate(([at, i]) => { const fp = window.__fp, r = fp.read(at, i); const head = r.chip ? r.chip.title.split(" · ")[0].split(" — ")[0].trim() : null; return head ? fp.idsOfLabel(head) : []; }, [tg.at, tg.i]);
          note.sourceOff = ids.join(" ");
          fam.__lastIds = ids;
        } else if (a.sel.again) ids = fam.__lastIds || [];
        const pressed = await page.evaluate((x) => window.__fp.clickSources(x), ids);
        note.chips = pressed.length ? pressed.join(" / ") : `no chip carries ${ids.join(" ") || "(none)"}`;
      } else if (a.kind === "card") {
        const tg = targets.find((t) => t.id === a.tid);
        const pre = before.find((b) => b.t === a.tid);
        const opened = await page.evaluate(([at, i]) => window.__fp.openCard(at, i), [tg.at, tg.i]);
        cardPills = opened.pills || [];
        note.pills = cardPills.map((p) => `${p.pressed ? "*" : ""}${short(p.text, 22)}[${p.lead || "?"}]`).slice(0, 8).join(" | ");
        if (a.mode === "half") {
          const o = await page.evaluate(() => window.__fp.otherHalf());
          if (o.err) note.err = o.err; else { cardPills = o.pills; note.pills = `other half: ${cardPills.map((p) => `${p.pressed ? "*" : ""}${short(p.text, 22)}[${p.lead || "?"}]`).slice(0, 6).join(" | ")}`; }
        }
        if (a.mode === "bsb") { const s = await page.evaluate(() => window.__fp.sug()); note.bsb = s; }
        if (a.mode === "division") {
          const cuts = await page.evaluate(() => window.__fp.cuts());
          const c = cuts.find((x) => !x.pressed);
          if (!c) note.err = "the card offers no other division";
          else { const ps = await page.evaluate((cj) => window.__fp.pressCut(cj), c.j); cardPills = ps || []; note.division = c.text; note.pressed = `the division ${c.text} (no reading)`; note.pills = cardPills.map((p) => `${short(p.text, 22)}[${p.lead || "?"}]`).slice(0, 6).join(" | ") || "(no readings under it)"; }
        }
        // a pill whose record another witness under another license carries:
        // press the pills in turn until the card shows one
        if (a.mode === "alsoPill") {
          // a press redraws the row in its new order, so each turn reads
          // the row again and takes the next pill not yet tried
          let hit = null;
          const tried = new Set();
          for (let n = 0; n < 12 && !hit; n += 1) {
            const ps = await page.evaluate(() => window.__fp.pills());
            const p = ps.find((q) => !q.ov && !tried.has(`${q.text}|${q.title}`));
            if (!p) break;
            tried.add(`${p.text}|${p.title}`);
            await page.evaluate((jj) => window.__fp.press(jj), p.j);
            const pid = await page.evaluate((pp) => window.__fp.pillId(pp), p);
            const also = await page.evaluate(() => window.__fp.also());
            if (also.some((x) => x.same && x.lic && x.lic !== pid.lic)) hit = { p, pid };
          }
          if (!hit) note.err = "no pill whose record a witness under another license carries";
          else {
            const k = await page.evaluate(([at, i]) => window.__fp.locate(at, i).word.k, [tg.at, tg.i]);
            picks[k] = { text: hit.p.text, mId: String(hit.pid.map).split("|")[0], label: hit.pid.label, lic: hit.pid.lic };
            note.pressed = `${short(hit.p.text, 30)} [credited ${hit.pid.map}, ${hit.pid.lic}]`;
          }
        }
        // the corroboration chip itself: the line now reads the same words,
        // credited to the witness pressed
        if (a.mode === "also") {
          const k = await page.evaluate(([at, i]) => window.__fp.locate(at, i).word.k, [tg.at, tg.i]);
          const also = await page.evaluate(() => window.__fp.also());
          const now = picks[k];
          const x = also.find((q) => q.same && q.lic && (!now || q.lic !== (now.lic || ""))) || also.find((q) => q.same);
          if (!x || !now) note.err = !now ? "no reading chosen to corroborate" : "no corroboration chip on the card";
          else {
            const ids = await page.evaluate(([label, lic]) => { const fp = window.__fp; return fp.idsOfLabel(label).filter((id) => fp.mIdOf(id).lic === lic); }, [x.label, x.lic]);
            await page.evaluate((jj) => window.__fp.pressAlso(jj), x.j);
            picks[k] = { text: now.text, mId: ids[0] || x.label, label: x.label };
            note.pressed = `the corroboration chip of ${short(x.label, 40)} [${ids.join("|") || "?"}, ${x.lic}] for "${short(now.text, 24)}"`;
          }
        }
        if (a.mode === "differ" || a.mode === "original") {
          const lineNow = (pre.r.shown || "").toLowerCase();
          const parts = (t) => t.split(" + ").length;
          const choose = (ps) => {
            if (a.mode === "original") {
              const orig = (fam.__orig && fam.__orig[a.tid] || pre.r.shown || "").toLowerCase();
              return ps.findIndex((p) => p.text.toLowerCase() === orig);
            }
            // a store reading first; an overlay's (Jastrow, Samaritan) where it
            // is all the division offers
            const all = ps.filter((p) => p.text.toLowerCase() !== lineNow);
            const differ = all.filter((p) => !p.ov).length ? all.filter((p) => !p.ov) : all;
            const pick = differ.find((p) => parts(p.text) !== parts(lineNow || "x")) || differ[0];
            return pick ? pick.j : -1;
          };
          if (a.mode === "differ") { fam.__orig = fam.__orig || {}; if (!fam.__orig[a.tid]) fam.__orig[a.tid] = pre.r.shown; }
          else note.wanted = fam.__orig && fam.__orig[a.tid];
          let j = choose(cardPills);
          // the reading is under another division of the word (under "the
          // source here" the card opens on TAHOT's pieces, whose one pill is
          // TAHOT's set): press the card's other divisions in turn, as a
          // reader would, until one offers it
          if (j < 0) {
            const cuts = await page.evaluate(() => window.__fp.cuts());
            for (const c of cuts.filter((x) => !x.pressed)) {
              const ps = await page.evaluate((cj) => window.__fp.pressCut(cj), c.j);
              if (!ps) continue;
              note.division = c.text;
              cardPills = ps;
              j = choose(cardPills);
              if (j >= 0) break;
            }
          }
          if (j < 0) note.err = `no pill to press (${a.mode})`;
          else {
            await page.evaluate((jj) => window.__fp.press(jj), j);
            const p = cardPills[j];
            const pid = await page.evaluate((pp) => window.__fp.pillId(pp), p);
            const label = pid.label;
            const loc = await page.evaluate(([at, i]) => { const L = window.__fp.locate(at, i); return { runKey: L.runKey || null, chain: !!L.chain, k: L.word.k, kq: !!L.word.kq }; }, [tg.at, tg.i]);
            let key = loc.k;
            if (loc.chain && loc.runKey) key = `${loc.runKey}|${loc.k}`;
            if (loc.kq) {
              // the half the card is open on: its key is the form whose pills these are
              const hk = await page.evaluate(([at, i]) => { const L = window.__fp.locate(at, i); const regs = (L.word.w || []).filter((r) => !String(r.s || r.k).includes("־")); const lit = [...document.querySelectorAll("#hud .head b > span")].filter((s) => !s.classList.contains("mq")); const j2 = lit.findIndex((s) => !s.style.color); return regs[j2] ? regs[j2].k : regs[0].k; }, [tg.at, tg.i]);
              key = hk;
            }
            picks[key] = { text: p.text, mId: String(pid.map).split("|")[0], label };
            note.pressed = `${short(p.text, 30)} [credited ${pid.map}${pid.lead && pid.lead !== String(pid.map).split("|")[0] ? `; the card's lead row ${pid.lead}` : ""}] as ${loc.kq ? `the half ${key}` : key === loc.k ? "the form" : "a cell of the chain"}${note.division ? ` under the division ${note.division}` : ""}`;
          }
        }
        await page.evaluate(() => window.__fp.close());
      }
    } catch (err) { note.err = String(err && err.message || err).slice(0, 200); }
    await settle();
    const after = await readAll();
    // the live pool's first reading, off the card, for a line the switches moved
    for (const x of after) {
      if (!(x.e && x.e.live) || x.r.missing) continue;
      const tg = targets.find((t) => t.id === x.t);
      const o = await page.evaluate(([at, i]) => window.__fp.openCard(at, i), [tg.at, tg.i]);
      await page.evaluate(() => window.__fp.close());
      // the line asks the store alone (poolFor storeOnly): the first pill no
      // overlay row stands behind by itself
      const top = (o.pills || []).find((p) => !p.ov);
      if (top) {
        const id = await page.evaluate((pp) => window.__fp.pillId(pp), top);
        x.e = { ...x.e, why: `${x.e.why}+live`, text: top.text, ids: [id] };
        x.chipWant = { text: id.lic, label: id.label };
      }
    }
    // a line a card repainted to what the card says: the card's pill that says it
    if (cardPills) for (const x of after) {
      if (!x.e || x.r.missing || x.e.text === x.r.shown) continue;
      const p = cardPills.find((q) => q.text.toLowerCase() === String(x.r.shown || "").toLowerCase());
      const tA = step.act.tid;
      if (p && x.t === tA) {
        const id = await page.evaluate((pp) => window.__fp.pillId(pp), p);
        x.e = { ...x.e, why: `${x.e.why}>card-shown`, text: p.text, ids: [id] };
        x.chipWant = { text: id.lic, label: id.label };
      }
    }
    // what a fresh draw of every tie would give, beside what the page drew
    await page.evaluate(() => window.__drawAllTies && window.__drawAllTies());
    await page.waitForTimeout(300);
    const forced = await page.evaluate((tg) => tg.map((t) => window.__fp.read(t.at, t.i)), targets);
    for (const [ix, x] of after.entries()) {
      const b = before[ix];
      if (x.r.missing) { rows.push({ book, family: fam.id, step: step.id, setup: !!step.setup, say: step.say, t: x.t, missing: true, note }); continue; }
      const changed = (b.r.shown || "") !== (x.r.shown || "");
      const chipChanged = JSON.stringify(b.r.chip) !== JSON.stringify(x.r.chip);
      const textMatch = x.e ? (x.e.text || "") === (x.r.shown || "") : null;
      const cv = chipVerdict(x.chipWant, x.r.chip, x.r.shown);
      const bv = blobVerdict(x.want, x.r);
      const fv = blobVerdict(x.want, forced[ix]);
      // the same judgment of the line as it stood before the action: a path
      // that leaves the words alone can still break what stood right
      const cvBefore = b.r.missing ? "n/a" : chipVerdict(b.chipWant, b.r.chip, b.r.shown);
      const bvBefore = b.r.missing ? "n/a" : blobVerdict(b.want, b.r);
      rows.push({ book, family: fam.id, step: step.id, setup: !!step.setup, say: step.say, t: x.t, he: x.r.he, kind: x.r.kind,
        cvBefore, bvBefore, chipBroke: cvBefore === "ok" && cv !== "ok", blobBroke: bvBefore === "ok" && bv !== "ok" && bv !== "n/a",
        before: { shown: b.r.shown, chip: b.r.chip, blob: b.r.blob, pcs: b.r.pcs },
        after: { shown: x.r.shown, chip: x.r.chip, blob: x.r.blob, pcs: x.r.pcs },
        changed, chipChanged, expect: x.e ? { why: x.e.why, text: x.e.text, ids: x.e.ids.map((d) => d.map) } : null, chipWant: x.chipWant, textMatch,
        chip: cv, wantPieces: x.want, blob: bv, forced: fv, forcedBlob: forced[ix].blob, forcedPcs: forced[ix].pcs, note });
    }
    // the BSB's suggested reading is a line on the card alone; its chip is
    // judged there, against the BSB's own record (public domain, credited by
    // its name)
    if (step.act.kind === "card" && step.act.mode === "bsb") {
      const want = await page.evaluate(() => { const fp = window.__fp, m = fp.SUG && fp.SUG.m; return m ? { text: fp.licName("public_domain"), label: m.credit_line || m.name } : null; });
      const s = note.bsb;
      const cv = s ? chipVerdict(want, s.chip, s.text) : "no BSB line on the card";
      rows.push({ book, family: fam.id, step: step.id, setup: false, say: step.say, t: `${step.act.tid}:bsb-line`, he: null, kind: "card-line",
        cvBefore: "n/a", bvBefore: "n/a", chipBroke: false, blobBroke: false,
        before: { shown: null, chip: null, blob: { paths: 0 }, pcs: null }, after: { shown: s ? s.text : null, chip: s ? s.chip : null, blob: { paths: 0 }, pcs: null },
        changed: true, chipChanged: true, expect: { why: "BSB source-suggested line", text: s ? s.text : null, ids: ["BSB (public_domain)"] }, chipWant: want, textMatch: true,
        chip: cv, wantPieces: null, blob: "n/a", forced: "n/a", forcedBlob: null, forcedPcs: null, note });
    }
    const mine = rows.filter((r) => r.book === book && r.step === step.id && r.family === fam.id);
    log(`\n[${book}] ${fam.id} › ${step.id}${step.setup ? " (setup)" : ""} (${((Date.now() - t0) / 1000).toFixed(1)} s): ${step.say}${note.err ? `  !! ${note.err}` : ""}${note.pressed ? `  → pressed ${note.pressed}` : ""}${note.chips ? `  → chips ${note.chips}` : ""}`);
    for (const r of mine) {
      if (r.missing) { log(`   ${r.t.padEnd(8)} not built`); continue; }
      if (!r.changed && !r.chipChanged && r.chip === "ok" && (r.blob === "ok" || r.blob === "n/a") && r.textMatch !== false) continue;
      log(`   ${r.t.padEnd(8)} ${r.kind.padEnd(8)} ${r.changed ? "CHANGED" : "same   "} "${short(r.before.shown, 26)}" → "${short(r.after.shown, 26)}"  chip ${chipSay(r.before.chip)} → ${chipSay(r.after.chip)}`);
      log(`   ${"".padEnd(17)} expect ${r.expect ? `${r.expect.why} "${short(r.expect.text, 24)}" ${r.expect.ids.join("+")}` : "-"} ⇒ chip ${r.chipWant ? `${r.chipWant.text} ‹${short(r.chipWant.label || (r.chipWant.labels || []).join("; "), 26)}›` : "none"}: ${r.chip.toUpperCase()}${r.textMatch === false ? " (text differs from the resolver's)" : ""}`);
      log(`   ${"".padEnd(17)} blob ${r.before.blob.paths}/${r.before.blob.n || "-"} → ${r.after.blob.paths}/${r.after.blob.n || "-"} pcs ${JSON.stringify(r.after.pcs)} geom ${r.after.blob.geom} want ${r.wantPieces}: ${r.blob.toUpperCase()}  (forced redraw: ${r.forced})`);
    }
    if (note.bsb !== undefined) log(`   BSB line on the card: ${JSON.stringify(note.bsb)}`);
    if (note.pills) log(`   card pills: ${note.pills}`);
  }
  if (errors.length) log(`   page errors: ${errors.slice(0, 3).join(" | ")}`);
  await ctx.close();
};

for (const book of BOOKS) for (const fam of FAMILIES(book)) {
  try { await runFamily(book, fam); } catch (e) { log(`[${book}] ${fam.id} FAILED: ${e && e.message}`); }
}
await browser.close();

// ---- the truth table -------------------------------------------------------------
// one line per change path: over the words whose English that path changed,
// does the chip follow (yes / partly / no) and does the blob (where the word
// wears one)
const byPath = new Map();
for (const r of rows) {
  if (r.setup || r.missing) continue;
  if (!byPath.has(r.step)) byPath.set(r.step, []);
  byPath.get(r.step).push(r);
}
const verdict = (oks, n) => (n === 0 ? "n/a" : oks === n ? "yes" : oks === 0 ? "no" : "partly");
const table = [];
for (const [step, rs] of byPath) {
  // the words this path touched: its English or its chip changed, or a chip
  // or a blob that stood right before it stands wrong after it
  const moved = rs.filter((r) => r.changed || r.chipChanged);
  const chipRows = rs.filter((r) => r.after.shown && (r.changed || r.chipChanged || r.chipBroke));
  const blobRows = rs.filter((r) => r.blob !== "n/a" && (r.changed || r.blobBroke || r.after.blob.paths !== r.before.blob.paths));
  const chipOk = chipRows.filter((r) => r.chip === "ok").length;
  const blobOk = blobRows.filter((r) => r.blob === "ok").length;
  const wrongStill = rs.filter((r) => !(r.changed || r.chipChanged) && r.after.shown && r.chip !== "ok" && !r.chipBroke);
  const tag = (r) => `${r.book}/${r.t}${r.changed ? "" : " (words unchanged)"}`;
  table.push({ path: step, say: rs[0].say, moved: moved.length, chip: verdict(chipOk, chipRows.length), chipOk, chipN: chipRows.length, blob: verdict(blobOk, blobRows.length), blobOk, blobN: blobRows.length,
    badChip: chipRows.filter((r) => r.chip !== "ok").map((r) => `${tag(r)}: chip ${r.chip} [${chipSay(r.after.chip)} for "${short(r.after.shown, 24)}", want ${r.chipWant ? `${r.chipWant.text} ‹${short(r.chipWant.label || "", 22)}›` : "none"} (${r.expect ? r.expect.why : "-"})]`),
    badBlob: blobRows.filter((r) => r.blob !== "ok").map((r) => `${tag(r)}: blob ${r.blob} (forced redraw: ${r.forced})`),
    unchangedWrong: wrongStill.map((r) => `${r.book}/${r.t}: ${r.chip}`) });
}
log("\n\nTRUTH TABLE (over the words each path touched: English or chip changed, or a right chip/blob broken)\n");
log(`${"path".padEnd(26)} ${"moved".padStart(5)}  ${"chip follows".padEnd(16)} ${"blob follows".padEnd(16)}`);
for (const t of table) {
  log(`${t.path.padEnd(26)} ${String(t.moved).padStart(5)}  ${`${t.chip} ${t.chipOk}/${t.chipN}`.padEnd(16)} ${`${t.blob} ${t.blobOk}/${t.blobN}`.padEnd(16)}`);
  for (const b of [...t.badChip, ...t.badBlob].slice(0, 8)) log(`${"".padEnd(34)}${b}`);
  if (t.unchangedWrong.length) log(`${"".padEnd(34)}(already wrong before, untouched: ${t.unchangedWrong.join("; ")})`);
}
writeFileSync(join(HERE, "probe-result.json"), JSON.stringify({ when: new Date().toISOString(), site: SITE, books: BOOKS, table, rows }, null, 1));
log(`\nwrote ${join(HERE, "probe-result.json")} (${rows.length} rows)`);
