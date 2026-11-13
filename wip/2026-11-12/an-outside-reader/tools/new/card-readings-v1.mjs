// Synthesis lane · what a word's card prints when a reader presses the word, read off the page that draws it
//
// RULE: chain-book-rule-v2-the-same-book-with-the-meaning-taken-out-and-the-links-under-a-word-are-what-its-card-prints-read-off-the-page
// LEDGER: -
// no frame letter. This reads what the page drew and decides nothing: no
// reading is chosen, ordered, joined or credited here.
//
// WHY THIS IS A FILE. The chain republishes a book with every visible thing
// replaced by the fingerprint of its own bytes. Until 13 November 2026 its
// builder took the links under a word from the route store's pool for the
// word's key, by the store reader's own function, while its page said a link
// was "the reading's English text as the card prints it". An outside reader
// hashed what the cards print and looked for it in the chain (12 November,
// the first six verses of one book): of 1,915 pills 171 were no link, and 62
// of the rest named another source than the card credits. The card shows the
// dictionaries beside the store as rows like the store's; it prints a
// reading with its closing stop off and its pieces joined; it opens a word
// the sources divide on the place's own reading; and it credits the oldest
// of the rows the reader's switches keep. The builder did none of that, and
// the check that guarded it recomputed each link with the builder's own
// function and never opened a card.
//
// The card is drawn by some thousands of lines of the page. A second copy of
// that in a builder is what drifted, so there is no second copy. The word is
// pressed as a reader presses it, the card the page opens is read off the
// page, and the chain is a recording: tools/build-chain-book-v2.mjs writes
// it and refuses to publish one that is not of the tree it builds from, and
// tools/check-chain-book-v2.mjs opens the cards again.
//
// WHAT IS READ, here and nowhere else.
//
//   the press    the word is pressed and nothing else is. The card read is
//                the card the page opens for that press: a word standing
//                alone opens its own; a word of a run one card joins opens
//                the card the page gives it (its own with the run's rows
//                above it, or the run's where the run reads as one); a word
//                written one way and read another opens on the half the
//                page chooses.
//   the rows     the card's rows of buttons, each button's text as it
//                prints and which one stands pressed: the forms (what the
//                source transmits, or the written and the read), the run's
//                divisions and the run's words, the word's divisions, and
//                the blocks of the division that is open. A division or a
//                block the card offers and does not open on is named here
//                and its readings are a press away: they are not read.
//   the lines    what the card prints above its pills as a source's reading
//                of this place: "here the source reads", and the suggested
//                source's rendering of the whole word where it has one.
//   the pills    every pill in the card's own order: its text, the year and
//                the source its title says, the sources that stand behind
//                it, and whether it is the one pressed.
//   the place    the words the card's own head says it stands on, which
//                must hold the word that was pressed.
//
// IN TWO STATES, each a visit of its own: at rest, as a first visit finds
// the page, nothing kept on the device; and lifted, with every switch that
// withholds a reading lifted (LIFTED below). A pill at rest is not always a
// pill lifted, letter for letter: one reading prints in the spelling of the
// first row the switches keep, and that row can differ. So neither state is
// derived from the other. Both are read.
//
// OPENING A CARD RULES NOTHING, AND THAT IS HELD: after the walk the lines
// under the words are read again and must be the lines read before it, and
// no word may wear the mark of a ruling.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { linesInPage, linesOnPage } from "./resting-lines-v1.mjs";

export const CHAIN_RULE_ID = "chain-book-rule-v2-the-same-book-with-the-meaning-taken-out-and-the-links-under-a-word-are-what-its-card-prints-read-off-the-page";

/** THE TWO STATES. `keep` is what a visit keeps on the device before the page
 *  draws: nothing at rest; for lifted, the page's own switches at the
 *  positions that withhold no reading. `holds` is what the page must then
 *  report of itself, read off it and never assumed. */
export const STATES = {
  rest: {
    says: "at rest: a first visit, nothing kept on the device, every switch where the page sets it",
    keep: null,
    holds: null,
  },
  lifted: {
    says: "lifted: every switch that withholds a reading lifted — the pointing kept whatever a source points, a source's own signs printed, every source on",
    keep: { "fh.masorah": "keep", "fh.signs": "printed", "fh.sources.off": "[]", "fh.sources.shelve": "[]" },
    holds: { pointing: "keep", signs: "printed", sources_off: [] },
  },
};

/** IN THE PAGE. The cards of the words of sections [from, to), each opened by
 *  a press on its word and read when its readings have arrived. Handed to
 *  the browser whole, so it names nothing outside itself. A word whose card
 *  could not be read carries `fault`, in words; nothing is guessed. */
export const cardsInPage = async ([from, to, perCardMs = 15000]) => {
  const hud = document.getElementById("hud");
  // a turn of the event loop given back to the page, with no timer's floor under it
  const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
  const readBand = () => hud.querySelector(":scope > .rows > .b-read");
  // the readings have arrived when their band holds something and no longer says it is fetching
  const settled = () => { const read = readBand(); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  // a card is shut as a reader shuts it; the page empties the card when it does
  const shut = () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return hud.hidden && !hud.children.length; };
  const row = (q) => {
    const bs = [...hud.querySelectorAll(`:scope > .rows > ${q} .s-pills button`)];
    return bs.length ? { of: bs.map((x) => x.textContent), on: bs.map((x, i) => (x.getAttribute("aria-pressed") === "true" ? i : -1)).filter((i) => i >= 0) } : null;
  };
  const readCard = () => {
    const read = readBand();
    const pills = read.querySelector(":scope > .r-pills");
    return {
      forms: row(".b-q"), chain: row(".b-chain"), chain_words: row(".b-chain-cell"), divisions: row(".b-cut"), blocks: row(".b-cell"),
      // [which line, the reading it prints with any note of the page's own taken off, the name its chip carries, the chip's title, the reading's own title]
      here: [...read.querySelectorAll(":scope > .r-piece")].map((x) => {
        const b = x.querySelector(":scope > b"), chip = x.querySelector(".g-lic");
        const c = b ? b.cloneNode(true) : null;
        if (c) for (const n of c.querySelectorAll(".n")) n.remove();
        return [x.classList.contains("r-sug") ? "suggested" : "here", c ? c.textContent : "", chip ? (chip.dataset.line || "") : "", chip ? (chip.title || "") : "", b ? (b.title || "") : ""];
      }),
      // [the pill's text, its title, the sources behind it, pressed]
      pills: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => [x.textContent, x.title || "", x.dataset.by || "", x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [],
      unreached: !!read.querySelector(":scope > .r-unreachable"),
    };
  };
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  // the walk stops at the first card it cannot read: the caller refuses the
  // whole reading for it, and a page that has stopped answering would
  // otherwise be waited on once for every word left
  let halted = false;
  for (let i = from; i < Math.min(to, secs.length) && !halted; i += 1) {
    const he = secs[i].querySelector(".he-text");
    const wbs = he ? [...he.querySelectorAll(".wb")] : [];
    const rec = { i, label: (secs[i].querySelector(".vnum") || {}).textContent || "", built: !!he && !secs[i].classList.contains("seg-wait"), entries: wbs.length, cards: [] };
    const own = secs[i].__sec ? String(secs[i].__sec.label ?? "") : "";
    let n = 0;   // the word's number in its section, the marks not counted, as the card's head counts it
    for (let e = 0; e < wbs.length && !halted; e += 1) {
      const wb = wbs[e];
      if (wb.classList.contains("mark")) continue;
      n += 1;
      if (!shut()) { rec.cards.push({ e, fault: "the card before it did not shut" }); halted = true; continue; }
      // the press a reader makes, as the page itself presses a word again (reopenCard)
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const t0 = performance.now();
      while (!settled() && performance.now() - t0 < perCardMs) await turn();
      if (!settled()) { rec.cards.push({ e, fault: `its readings did not arrive in ${perCardMs / 1000} s` }); halted = true; continue; }
      const card = readCard();
      if (card.unreached) { rec.cards.push({ e, fault: "the card says the catalog could not be reached" }); halted = true; continue; }
      delete card.unreached;
      // THE CARD SAYS WHICH WORD IT STANDS ON, and it is asked: its head
      // prints the section's label and the word's number, or the first and
      // the last word of a run one card joins. A card that names another
      // place is another word's card, and is never read as this one's.
      const wn = hud.querySelector(":scope > .head .wn");
      const m = wn ? /^(?:(.*):)?(\d+)(?:–(\d+))? .$/u.exec(wn.textContent) : null;
      if (!m || (m[1] ?? "") !== own || !(Number(m[2]) <= n && n <= Number(m[3] || m[2]))) { rec.cards.push({ e, fault: `the card that opened says it stands on ${wn ? wn.textContent : "no word"}, and the word pressed is ${own}:${n}` }); halted = true; continue; }
      card.over = [Number(m[2]), Number(m[3] || m[2])];
      card.e = e;
      rec.cards.push(card);
    }
    out.push(rec);
  }
  shut();
  return {
    sections: out, of: secs.length,
    ruled: document.querySelectorAll(".wb.chosen, .wjoin.chosen").length,
    state: { reader: document.body.classList.contains("en") ? "the English reader" : "the Hebrew reader", pointing: window.__masorah || null, signs: window.__signs || null, names: window.__nonames || null, sources_off: [...(window.__sourcesOff || [])].sort() },
  };
};

/** Open a work in one of the two states and read every word's card, or the
 *  cards of the stretch of sections asked for. Throws, in words, where a
 *  card could not be read, where the page did not take the state, where it
 *  threw while it drew, or where the walk moved a line or ruled a word. */
export const readCards = async (browser, base, work, stateName, { from = 0, to = Infinity, batch = 12 } = {}) => {
  const state = STATES[stateName];
  if (!state) throw new Error(`no such state: ${stateName}`);
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  try {
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.goto(`${base}/zone.html?b=${work}`, { waitUntil: "networkidle" });
    if (state.keep) {
      await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, state.keep);
      await p.reload({ waitUntil: "networkidle" });
    }
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // every section built by the page's own function and its lines come to rest, as the resting lines are read
    const before = await linesOnPage(p, { from, to });
    const total = before.of;
    const last = Number.isFinite(to) ? Math.min(to, total) : total;
    if (state.holds) {
      const s = before.state;
      const off = JSON.stringify(s.sources_off) !== JSON.stringify(state.holds.sources_off);
      if (s.pointing !== state.holds.pointing || s.signs !== state.holds.signs || off) throw new Error(`the page did not take the lifted switches: it reports the pointing ${s.pointing}, signs ${s.signs}, sources off ${JSON.stringify(s.sources_off)}`);
    }
    const sections = [];
    let pageState = before.state, ruled = 0;
    for (let a = from; a < last; a += batch) {
      const got = await p.evaluate(cardsInPage, [a, Math.min(a + batch, last)]);
      sections.push(...got.sections);
      pageState = got.state; ruled = got.ruled;
      if (got.sections.some((s) => s.cards.some((c) => c.fault))) break;
    }
    for (const s of sections) {
      if (!s.built) throw new Error(`section ${s.i} was not built`);
      const bad = s.cards.find((c) => c.fault);
      if (bad) throw new Error(`${s.label}, entry ${bad.e}: ${bad.fault}`);
    }
    if (ruled) throw new Error(`opening the cards left ${ruled} word(s) marked as ruled`);
    const after = await p.evaluate(linesInPage, [from, last, false]);
    before.sections.forEach((s, x) => {
      if (JSON.stringify(s.units) !== JSON.stringify(after.sections[x].units)) throw new Error(`${s.label}: the lines under its words are not the lines that stood before its cards were opened`);
    });
    if (errors.length) throw new Error(`the page threw while its cards were read: ${errors[0]}`);
    return { state: pageState, sections, of: total };
  } finally { await ctx.close(); }
};

/** THE YEAR AND THE SOURCE A PILL'S TITLE SAYS. The title is the year, a
 *  middle dot, the source's label. The label is found, never cut by guess:
 *  it is the longest label an index holds that the title ends in. Returns
 *  { year, mark, label }, the year a number or null where the title says the
 *  source gives none, the mark any words the title sets beside the year; or
 *  null where the title is not of that shape. */
export const titleOf = (title, knownLongestFirst) => {
  const t = String(title || "");
  const label = knownLongestFirst.find((l) => t === l || t.endsWith(` · ${l}`));
  if (label === undefined) return null;
  const said = t === label ? "" : t.slice(0, t.length - label.length - 3);
  if (said === "" || said === "no source year") return { year: null, mark: "", label };
  const m = /^(-?\d{1,4})(?: \((.+)\))?$/u.exec(said);
  return m ? { year: Number(m[1]), mark: m[2] || "", label } : null;
};

/** THE SOURCE A LINE'S CHIP NAMES IN ITS OWN WORDS: the longest label an
 *  index holds that the chip's title opens with, a dash after it. */
export const chipLabelOf = (title, knownLongestFirst) => knownLongestFirst.find((l) => String(title || "").startsWith(`${l} — `)) ?? null;

/** WHAT THE SUGGESTED SOURCE'S LINE HOLDS. The page prints the source's cell
 *  trimmed, and where the cell is empty prints words of its own in its
 *  place; the cell itself, byte for byte, is in the reading's title. Returns
 *  the cell, or null where the title carries none (the page then says the
 *  source has no rendering here, which is no reading). */
export const suggestedCellOf = (readingTitle) => {
  const m = /byte for byte: ("(?:[^"\\]|\\.)*")/u.exec(String(readingTitle || ""));
  return m ? JSON.parse(m[1]) : null;
};

/** EVERY NAME A CARD CAN CARRY, with the label the catalog gives it: the
 *  store's sources, the dictionaries beside the store, the span store's own,
 *  the piece store's, and the suggested source, which names itself in its
 *  own index. `known` is every label, longest first, for finding a label in
 *  a title. Throws where two indexes label one name two ways. */
export const labelsFor = (readerDir) => {
  const byId = new Map();
  const put = (id, label, from) => {
    if (byId.has(id) && byId.get(id) !== label) throw new Error(`${id} is labelled two ways: "${byId.get(id)}" and, in ${from}, "${label}"`);
    byId.set(id, label);
  };
  const take = (rel) => {
    const p = join(readerDir, rel);
    if (!existsSync(p)) return;
    for (const [id, m] of Object.entries(JSON.parse(readFileSync(p, "utf8")).m_sources || {})) if (m && m.label) put(id, m.label, rel);
  };
  take("data/route-store/index.json");
  const ov = join(readerDir, "data/overlays");
  for (const d of (existsSync(ov) ? readdirSync(ov).sort() : [])) take(join("data/overlays", d, "index.json"));
  take("data/span-store/index.json");
  take("data/piece-store/index.json");
  const sg = join(readerDir, "data/source-suggested/index.json");
  if (existsSync(sg)) { const m = JSON.parse(readFileSync(sg, "utf8")).m; if (m && m.label && m.name) put(m.label, m.name, "data/source-suggested/index.json"); }
  const known = [...new Set(byId.values())].sort((x, y) => y.length - x.length || (x < y ? -1 : x > y ? 1 : 0));
  return { byId, known };
};

/** WHAT A CARD SAYS, from what was read off it: the same rows, lines and
 *  pills with each source named by its label. One reading of this, for the
 *  builder that fingerprints it and the check that holds the chain to it.
 *    rows    { forms, chain, chain_words, divisions, blocks }, each null or
 *            { of: [each button's text], on: the one pressed, or null }
 *    here    [{ is: "here" | "suggested", text, label }]; the suggested
 *            source's line only where it has a rendering (a cell that is not
 *            empty), and its text is then the cell as the page trims it
 *    pills   [{ text, label, year, mark, by: [every label behind it] }]
 *    on      the pill that stands pressed, or null
 *    over    [first, last]: the words of the section the card's head says
 *            it stands on, counted from 1, the marks not counted
 *  Throws, in words, where the card does not have the shape this reads. */
export const saidOf = (card, labels) => {
  const rows = {};
  for (const k of ["forms", "chain", "chain_words", "divisions", "blocks"]) {
    const r = card[k];
    if (!r) { rows[k] = null; continue; }
    if (r.on.length > 1) throw new Error(`${r.on.length} buttons stand pressed in one row (${k})`);
    rows[k] = { of: r.of, on: r.on.length ? r.on[0] : null };
  }
  const here = [];
  for (const [is, text, , chipTitle, readingTitle] of card.here) {
    if (is === "suggested") {
      const cell = suggestedCellOf(readingTitle);
      if (cell === null || !cell.trim()) continue;
      if (cell.trim() !== text) throw new Error(`the suggested source's line prints "${text}" and its cell is "${cell}"`);
    }
    const label = chipTitle ? chipLabelOf(chipTitle, labels.known) : null;
    if (chipTitle && label === null) throw new Error(`a line's chip opens with no label an index holds: "${chipTitle.slice(0, 90)}"`);
    here.push({ is, text, label });
  }
  const pressed = [];
  const pills = card.pills.map(([text, title, by, on], x) => {
    const t = titleOf(title, labels.known);
    if (!t) throw new Error(`a pill's title is not a year and a label an index holds: "${title.slice(0, 120)}"`);
    if (on) pressed.push(x);
    const behind = [];
    for (const id of String(by).split(" ").filter(Boolean)) {
      if (!labels.byId.has(id)) throw new Error(`a pill stands on ${id}, which no index here names`);
      const l = labels.byId.get(id);
      if (!behind.includes(l)) behind.push(l);
    }
    return { text, label: t.label, year: t.year, mark: t.mark, by: behind };
  });
  if (pressed.length > 1) throw new Error(`${pressed.length} pills stand pressed on one card`);
  if (pills.length && new Set(pills.map((x) => x.text)).size !== pills.length) throw new Error(`one text stands on two pills of one card ("${pills.map((x) => x.text).find((t, i, a) => a.indexOf(t) !== i)}")`);
  return { rows, here, pills, on: pressed.length ? pressed[0] : null, over: card.over };
};
