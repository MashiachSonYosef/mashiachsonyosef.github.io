// check-pairs-rulings-and-switches: a ketiv/qere pair's line and chip under a ruling and under the source switches
// (the mends of 21 November 2026; findings 1, 9 and 4 of the first reader's report).
//
//   F1   a one-word pair's ruling is asked under the pair's own memory key: the written half ruled on its card
//        keeps the line through a repaint, and a ruling on a plain word spelled like the ketiv leaves the pair alone
//   F1b  the same where the pair's read branch has several words and its written branch one
//   F9   the chip a ruled written form wears when it is ruled is the chip it wears after a repaint
//   F4   no pair's chip names a source the reader switched off, in a section drawn before or after the switch
//
// usage: node check.mjs --base http://127.0.0.1:<port> [--only F1,F9]
// Words are addressed by verse and word number. A repaint is any source chip pressed off and on again.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const BASE = String(arg("base", "http://127.0.0.1:8899")).replace(/\/+$/u, "");
const ONLY = arg("only", "") ? new Set(arg("only", "").split(",")) : null;
const LONG = Number(process.env.CHECK_WAIT || 180000);                    // other browsers may be working beside this one
const REPAINT_CHIP = "openscriptures_bdb_1906";
const STEP_CHIP = "stepbible_tahot_aligned_translation";
const STRONGS_FORMS_CHIP = "wikisource_strongs_explicit_forms";
// Hebrew letters in what is printed are masked; the class is built from code points, never typed
const HEBREW = new RegExp(`[${String.fromCharCode(0x590)}-${String.fromCharCode(0x5ff)}]+`, "gu");
const say = (t) => String(t == null ? "" : t).replace(HEBREW, "<he>");

const browser = await chromium.launch();
const visit = async (book) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(LONG);
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  await p.addInitScript(() => { try { if (!sessionStorage.getItem("check")) { localStorage.clear(); sessionStorage.setItem("check", "1"); } } catch { /* fresh */ } });
  await p.goto(`${BASE}/zone.html?b=${book}`, { waitUntil: "networkidle", timeout: LONG });
  await p.waitForSelector("section.seg .he-text .wb", { state: "attached", timeout: LONG });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: LONG }).catch(() => {});
  await p.waitForTimeout(1200);
  return { ctx, p, errors };
};
// the lines the switches read live have answered
const settled = async (p) => { await p.waitForTimeout(1500); await p.waitForFunction(() => !window.__livePending, null, { timeout: LONG }).catch(() => {}); await p.waitForTimeout(1000); };
// a verse scrolled to, its section built
const goto = async (p, verse) => {
  const si = await p.evaluate((verse) => { const si = window.__zone.sections.findIndex((s) => s.label === verse); const el = document.getElementById(`s${si}`); if (el) el.scrollIntoView({ block: "center" }); return si; }, verse);
  if (si < 0) throw new Error(`no verse ${verse} in this book`);
  await p.waitForSelector(`#s${si} .he-text .wb`, { state: "attached", timeout: LONG }).catch(() => { throw new Error(`the section of ${verse} was not drawn`); });
  await p.waitForTimeout(1500);
  return si;
};
// a word by verse and number: what stands under it
const read = (p, verse, n) => p.evaluate(({ verse, n }) => {
  const z = window.__zone, si = z.sections.findIndex((s) => s.label === verse), el = document.getElementById(`s${si}`);
  const word = si >= 0 ? z.sections[si].words[n - 1] : null;
  const wb = el && word ? [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === word) : null;
  if (!wb) return null;
  const run = wb.closest(".wjoin"), g = wb.querySelector(":scope > .g") || (run && run.querySelector(":scope > .g"));
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g.querySelector(".g-lic");
  const halves = [...wb.querySelectorAll(".w .wr")];
  return { pair: !!word.kq, line: c.textContent.trim(), chip: chip ? `${chip.textContent}/${chip.dataset.line || ""}` : "no chip", chipHtml: chip ? chip.outerHTML : "",
    under: halves.filter((x) => x.classList.contains("backs-en")).map((x) => (/^ketiv/u.test(x.title) ? "ketiv" : "qere")).join("+") || "neither",
    key: word.kq ? null : word.k, ketiv: word.kq ? ((word.w || []).filter((x) => x.role === "KETIV").map((x) => x.k)) : null };
}, { verse, n });
const show = (r) => (r ? `"${say(r.line)}" [${r.chip}]${r.pair ? ` ${r.under} underlined` : ""}` : "not drawn");
const same = (a, b) => !!a && !!b && a.line === b.line && a.chipHtml === b.chipHtml && a.under === b.under;
const cardUp = async (p) => { await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { state: "attached", timeout: LONG }).catch(() => { throw new Error("the card's rows did not arrive"); }); await p.waitForTimeout(900); };
// the first reading on the open card that is not the one lit, pressed; the card closed
const ruleNext = async (p) => {
  const pressed = await p.evaluate(() => {
    const lit = (x) => x.classList.contains("on") || x.getAttribute("aria-pressed") === "true";
    const x = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((y) => !lit(y));
    if (x) x.click();
    return x ? x.textContent : null;
  });
  await p.waitForTimeout(900);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(700);
  return pressed;
};
const openWord = async (p, verse, n) => {
  await p.evaluate(({ verse, n }) => {
    const z = window.__zone, si = z.sections.findIndex((s) => s.label === verse), el = document.getElementById(`s${si}`);
    const wb = [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === z.sections[si].words[n - 1]);
    (wb.querySelector(".w .wr.backs-en") || wb.querySelector(".w .wr") || wb.querySelector(".w span") || wb.querySelector(".w")).click();
  }, { verse, n });
  await cardUp(p);
};
// a pair's card moved to its written half, by the half in the card's head
const toWritten = async (p) => {
  for (let i = 0; i < 4; i += 1) {
    if (/^ketiv/u.test(await p.evaluate(() => (document.querySelector("#hud .head .kq-role") || {}).textContent || ""))) return true;
    await p.evaluate(() => { const x = document.querySelector('#hud .head b span[role=button][title*="ketiv"]'); if (x) x.click(); });
    await p.waitForTimeout(900);
    await cardUp(p);
  }
  return false;
};
const press = async (p, key, want) => {
  const did = await p.evaluate(({ key, want }) => {
    const x = document.querySelector(`#sourcesRow button.dfp[data-key="${key}"]`);
    if (!x || (want != null && x.classList.contains("on") !== want)) return false;
    x.click(); return true;
  }, { key, want: want == null ? null : want === "off" });
  if (!did) throw new Error(`no source chip ${key} to press ${want || ""}`);
  await settled(p);
};
const repaint = async (p) => { await press(p, REPAINT_CHIP, "off"); await press(p, REPAINT_CHIP, "on"); };
// every pair drawn on the page: how many wear a chip, and which name a source that is switched off
const census = (p) => p.evaluate(() => {
  const z = window.__zone, off = new Set(window.__sourcesOff || []); const out = { pairs: 0, chips: 0, bare: 0, naming: [], lines: [] };
  for (const wb of document.querySelectorAll("section.seg .he-text .wb.kq")) {
    const sec = wb.closest("section"), si = Number(sec.id.slice(1)), at = `${z.sections[si].label} word ${z.sections[si].words.indexOf(wb.__word) + 1}`;
    const g = wb.querySelector(":scope > .g"); if (!g) continue;
    const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
    const chip = g.querySelector(".g-lic"), ids = chip ? (chip.dataset.line || "").split(" ").filter(Boolean) : [];
    out.pairs += 1; if (chip) out.chips += 1; if (g.classList.contains("bare")) out.bare += 1;
    if (ids.some((id) => off.has(id))) out.naming.push(`${at} "${c.textContent.trim()}" [${ids.join(" ")}]`);
    out.lines.push(`${at}|${c.textContent}|${chip ? chip.outerHTML : ""}|${[...wb.querySelectorAll(".w .wr")].map((x) => (x.classList.contains("backs-en") ? "*" : "-")).join("")}`);
  }
  return out;
});

const results = [];
const law = async (id, sentence, run) => {
  if (ONLY && !ONLY.has(id)) return;
  let ok = false, saw = "";
  const open = [];
  try { const r = await run(async (book) => { const v = await visit(book); open.push(v); return v; }); ok = !!r.ok; saw = r.saw; const errs = open.flatMap((v) => v.errors); if (errs.length) { ok = false; saw += `  ·  page errors: ${errs.slice(0, 2).join(" | ")}`; } }
  catch (e) { ok = false; saw = `the check could not run its scenario: ${String(e && e.message).split("\n")[0]}`; }
  for (const v of open) await v.ctx.close().catch(() => {});
  results.push(ok);
  console.log(`${ok ? "  ok " : "FAIL "} ${id}  ${sentence}  ·  ${say(saw)}`);
};

// Daniel 2:43 word 1 is a one-word pair; Daniel 2:8 word 8 is a plain word of the ketiv's letters.
let danielRest = null;
const DAN = ["2:43", 1], DAN_PLAIN = ["2:8", 8];
await law("F1", "a ruling on a one-word pair's written half keeps the pair's line through a repaint, and a ruling on a plain word spelled like the ketiv does not take it", async (open) => {
  // the written half ruled on its card, then a repaint
  const a = await open("daniel");
  await goto(a.p, DAN[0]);
  const rest = danielRest = await read(a.p, ...DAN);
  await openWord(a.p, ...DAN);
  const moved = await toWritten(a.p);
  const pill = await ruleNext(a.p);
  const ruled = await read(a.p, ...DAN);
  await press(a.p, REPAINT_CHIP, "off");
  const off = await read(a.p, ...DAN);
  await press(a.p, REPAINT_CHIP, "on");
  const on = await read(a.p, ...DAN);
  const made = moved && !!pill && ruled.line !== rest.line && ruled.under === "ketiv";
  const kept = made && off.line === ruled.line && on.line === ruled.line && off.under === "ketiv" && on.under === "ketiv";
  // a plain word of the ketiv's letters ruled before the pair's section is drawn, then a repaint
  const b = await open("daniel");
  await goto(b.p, DAN_PLAIN[0]);
  const drawnEarly = await read(b.p, ...DAN);
  const plain0 = await read(b.p, ...DAN_PLAIN);
  await openWord(b.p, ...DAN_PLAIN);
  const pill2 = await ruleNext(b.p);
  const plain1 = await read(b.p, ...DAN_PLAIN);
  await goto(b.p, DAN[0]);
  const built = await read(b.p, ...DAN);
  await repaint(b.p);
  const again = await read(b.p, ...DAN);
  const spelled = !!built && !plain0.pair && built.ketiv.length === 1 && built.ketiv[0] === plain0.key;
  const plainRuled = spelled && !!pill2 && plain1.line !== plain0.line;
  const alone = plainRuled && same(built, rest) && same(again, rest);
  return { ok: kept && alone, saw: `at rest ${show(rest)}; its ketiv ruled ${show(ruled)}, after a source chip off ${show(off)} and on again ${show(on)}${made ? "" : " (the ruling was not made)"}  ·  ${DAN_PLAIN[0]} word ${DAN_PLAIN[1]} ruled "${say(plain1.line)}"${plainRuled ? "" : " (no plain ruling of the ketiv's letters was made)"}: the pair${drawnEarly ? "" : ", drawn after it,"} reads ${show(built)}, after a repaint ${show(again)}` };
});

await law("F9", "a ruled written form wears after a repaint the chip it wore when it was ruled", async (open) => {
  // with the plain word ruled first, the live page keeps the ruled ketiv on the line, so the chip alone is judged
  const a = await open("daniel");
  await goto(a.p, DAN_PLAIN[0]);
  await openWord(a.p, ...DAN_PLAIN);
  const pill0 = await ruleNext(a.p);
  await goto(a.p, DAN[0]);
  await openWord(a.p, ...DAN);
  const moved = await toWritten(a.p);
  const pill = await ruleNext(a.p);
  const ruled = await read(a.p, ...DAN);
  await press(a.p, REPAINT_CHIP, "off");
  const off = await read(a.p, ...DAN);
  await press(a.p, REPAINT_CHIP, "on");
  const on = await read(a.p, ...DAN);
  const made = !!pill0 && moved && !!pill && ruled.under === "ketiv" && !!ruled.chipHtml;
  const ok = made && off.line === ruled.line && on.line === ruled.line && off.chipHtml === ruled.chipHtml && on.chipHtml === ruled.chipHtml;
  return { ok, saw: `Daniel ${DAN[0]} word ${DAN[1]}, its ketiv ruled ${show(ruled)}${made ? "" : " (no ruling with a chip was made)"}; after a source chip off ${show(off)}, on again ${show(on)}` };
});

// Deuteronomy 33:2 word 15: the written branch is one word, the read branch two; 3:17 word 11 is a plain word of the
// written branch's letters. With the place's own source off the pair reads from the table, which is where a plain
// word's ruling could take it.
await law("F1b", "where a pair's read branch has several words, a ruling on a plain word spelled like its one written word does not take the pair's line", async (open) => {
  const PAIR = ["33:2", 15], PLAIN = ["3:17", 11];
  const a = await open("deuteronomy");
  await goto(a.p, PAIR[0]);
  const rest = await read(a.p, ...PAIR);
  await press(a.p, STEP_CHIP, "off");
  const off0 = await read(a.p, ...PAIR);
  await press(a.p, STEP_CHIP, "on");
  const back = await read(a.p, ...PAIR);
  await goto(a.p, PLAIN[0]);
  const plain0 = await read(a.p, ...PLAIN);
  await openWord(a.p, ...PLAIN);
  const pill = await ruleNext(a.p);
  const plain1 = await read(a.p, ...PLAIN);
  await goto(a.p, PAIR[0]);
  const ruledOn = await read(a.p, ...PAIR);
  await press(a.p, STEP_CHIP, "off");
  const off1 = await read(a.p, ...PAIR);
  const spelled = !plain0.pair && rest.ketiv.length === 1 && rest.ketiv[0] === plain0.key;
  const made = spelled && !!pill && plain1.line !== plain0.line && same(back, rest);
  return { ok: made && same(ruledOn, rest) && same(off1, off0), saw: `at rest ${show(rest)}, its place's source off ${show(off0)}; ${PLAIN[0]} word ${PLAIN[1]} ruled "${say(plain1.line)}"${made ? "" : " (no plain ruling of the written word's letters was made)"}: the pair reads ${show(ruledOn)}, its place's source off ${show(off1)}` };
});

await law("F4", "no pair's chip names a source the reader switched off, whether the pair was drawn before the switch moved or after", async (open) => {
  // every pair of Ruth drawn at rest, then the switches
  const a = await open("ruth");
  await a.p.evaluate(() => window.__materialise()); await settled(a.p);
  const rest = await census(a.p);
  await press(a.p, STEP_CHIP, "off");
  const step = await census(a.p);
  await press(a.p, STEP_CHIP, "on");
  const back = await census(a.p);
  await press(a.p, STRONGS_FORMS_CHIP, "off");
  const strongs = await census(a.p);
  const at45 = await read(a.p, "4:5", 13);
  // and the pairs drawn after the switch moved
  const b = await open("ruth");
  await press(b.p, STEP_CHIP, "off");
  await b.p.evaluate(() => window.__materialise()); await settled(b.p);
  const late = await census(b.p);
  const drawn = rest.pairs > 0 && rest.chips === rest.pairs && !rest.naming.length && step.pairs === rest.pairs && strongs.pairs === rest.pairs && late.pairs === rest.pairs;
  const restored = JSON.stringify(back.lines) === JSON.stringify(rest.lines);
  const ok = drawn && restored && !step.naming.length && !strongs.naming.length && !late.naming.length;
  const names = (c) => `${c.naming.length} of ${c.pairs} pairs name a source switched off${c.naming.length ? ` (${c.naming.slice(0, 2).join("; ")}${c.naming.length > 2 ? "; ..." : ""})` : ""}, ${c.chips} wear a chip, ${c.bare} are bare`;
  return { ok, saw: `Ruth at rest: ${rest.pairs} pairs, ${rest.chips} wear a chip  ·  STEP's translation off: ${names(step)}; on again: ${restored ? "every pair as at rest" : "NOT as at rest"}  ·  Strong's forms off: ${names(strongs)}, 4:5 word 13 reads ${show(at45)}  ·  STEP's translation off before the pairs are drawn: ${names(late)}` };
});

await browser.close();
if (!results.length) { console.log("no law was run"); process.exit(2); }
process.exit(results.every(Boolean) ? 0 : 1);
