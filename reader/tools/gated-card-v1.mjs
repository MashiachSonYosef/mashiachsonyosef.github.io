// Synthesis lane · one word's card read off the page, for the checks of the gates at a place
// LEDGER: -
// no frame letter. It opens the reader in a browser and reads what a card
// says; it writes nothing.
//
// ONE WORD'S CARD, AS THE GATES LEFT IT.
//
// The entry gate and the names gate are held on the page by pressing words
// found in the data and reading their cards (tools/check-entry-gate-v1.mjs,
// tools/check-names-gate-v1.mjs). Both ask the same things of a card: its
// pills with the sources behind each, what each gate withheld, the line that
// says so, what the card takes its place for, and the line under the word.
// This is that one reading. It also reads the card's notes (the words a
// dictionary opens a numbered sense with, sense-openings-rule-v1), for
// tools/check-sense-openings-v1.mjs.
//
//   plainWord(words, e)   whether the e-th entry of a section's words is a
//                         word of one region that its place does not divide
//                         and no maqaf joins, so its card opens on its whole
//                         form
//   openGatedCard(browser, base, pick, { masorah, sources })
//                         the card of pick = { zone, section, entry }, with
//                         a source's own signs printed (a pill then reads as
//                         its row prints), the oldest reading first (the
//                         line is then the pointing's leader), the pointing
//                         where the page sets it or as `masorah` says, and
//                         every source on (sources "all") or as the record
//                         rests them (sources "rest")
import { isPointed } from "./pointing-grade-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";

const MAQAF = "\u05BE";

export const plainWord = (words, e) => {
  const w = words[e], prev = e > 0 ? words[e - 1] : null;
  return !!w && !w.mark && !w.w && !w.kq && !!w.k && typeof w.s === "string" && isPointed(w.s) && !w.s.includes(MAQAF)
    && !(prev && String(prev.s || "").endsWith(MAQAF)) && !(Array.isArray(w.pg) && w.pg.length > 1);
};

/** IN THE PAGE. The card of one word, pressed as a reader presses it. Handed to the browser whole. */
export const cardInPage = async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return { fault: "the word is not on the page" };
  // what the last card said of its notes is not this card's
  window.__poolNotes = null;
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const t0 = performance.now();
  while (!settled() && performance.now() - t0 < 20000) await turn();
  if (!settled()) return { fault: "the card's readings did not arrive" };
  const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
  const out = {
    // [the pill's text, the sources behind it, its own reading where the pill prints another entry's English]
    said: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => [x.textContent, x.dataset.by || "", x.dataset.pointer || ""]) : [],
    data: pills ? { ...pills.dataset } : null,
    line: (hud.querySelector(".withheld-line") || {}).textContent || "",
    none: (hud.querySelector(":scope > .rows > .b-read > p.sources-withheld") || {}).textContent || "",
    entry: window.__cardEntry || "", name: window.__cardName || "",
    // the card's notes: what the page says they are, and the line that prints them ([source, entry, point, the
    // note as printed] for each), how many it says it holds, and whether it stands with the record or in the band
    notes: ((line) => ({ said: window.__poolNotes || [], counted: line ? Number(line.dataset.notes) : 0, text: line ? line.textContent : "",
      where: line ? (line.closest(".d-card") ? "record" : line.closest(".b-read") ? "band" : "elsewhere") : null,
      spans: line ? [...line.querySelectorAll(".sense-note")].map((x) => [x.dataset.m || "", x.dataset.entry || "", x.dataset.point || "", x.textContent]) : [] }))(hud.querySelector(".sense-notes")),
    state: { pointing: window.__masorah || null, sources_off: [...(window.__sourcesOff || [])] },
    // a word the page joins to its neighbors in one cell (a run one license names, a chain the scribes joined)
    // opens the cell's card, not its own: a law about one word's rows is not judged on it
    joined: !!wb.closest(".wjoin"),
  };
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return out;
};

/** The card of pick = { zone, section, entry } on the reader at `base`, and the line under its word (`under`). The
 *  page is opened once as a first visit opens it, which is when it takes the record's resting switches, and then
 *  again with the switches asked for kept on the device, as a reader who set them would find it. A fault is said
 *  in words (`fault`). `joined` says the page draws the word in one cell with its neighbors, so the card is the
 *  cell's and not the word's own. */
export const openGatedCard = async (browser, base, pick, { masorah = null, sources = "all" } = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  try {
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.goto(`${base}/zone.html?b=${pick.zone}`, { waitUntil: "networkidle" });
    await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); },
      { "fh.signs": "printed", "fh.def.order": "oldest", ...(sources === "all" ? { "fh.sources.off": "[]" } : {}), ...(masorah ? { "fh.masorah": masorah } : {}) });
    await p.reload({ waitUntil: "networkidle" });
    // a page that draws no word of the book within a minute is a fault said in words, not a throw: a law that
    // presses a card prints it and the check goes on to its other laws
    const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
    if (!drew) return { fault: `the page drew no word of ${pick.zone} within a minute${errors.length ? ` (it threw: ${errors[0]})` : ""}` };
    const lines = await linesOnPage(p, { from: pick.section, to: pick.section + 1 });
    const unit = (lines.sections[0].units || []).find((u) => u[0] === pick.entry) || null;
    const got = await p.evaluate(cardInPage, { section: pick.section, entry: pick.entry });
    return { ...got, under: unit ? unit[2] : null, fault: errors.length ? `the page threw: ${errors[0]}` : got.fault || (sources === "all" && got.state.sources_off.length ? "the page did not take every source on" : null) };
  } finally { await ctx.close(); }
};
