// Finding 4: a pair's line and chip under the source switches. A pair whose line is read from the baked table
// (the place's own source does not read it), every carrier of that reading switched off on the main rail;
// beside it a plain word of the book with the same key, for what an ordinary line does under the same switches.
// node f4-pair-switches.mjs <book> <section index> [tahot]   (tahot: also switch STEP TAHOT off, for a pair the place reads)
import { open, T, U } from "./lib.mjs";
const [book, SIs, alsoTahot] = process.argv.slice(2);
const SI = Number(SIs);
const { b, p, errors } = await open(book);
const goto = (si) => p.evaluate(async (si) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500)); }, si);
const lineOf = (sel) => p.evaluate((sel) => {
  const wb = document.querySelector(sel); if (!wb) return "not drawn";
  const run = wb.closest(".wjoin"); const g = wb.querySelector(":scope > .g") || (run && run.querySelector(":scope > .g"));
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g.querySelector(".g-lic");
  const halves = [...wb.querySelectorAll(".w .wr")].map((x) => `${/^ketiv/.test(x.title) ? "ketiv" : "qere"}${x.classList.contains("backs-en") ? "*" : ""}`);
  return `line=${JSON.stringify(c.textContent.trim())} chip=${chip ? `${chip.textContent}/${chip.dataset.line || ""} «${(chip.title || "").split(" — ")[0].slice(0, 60)}»` : "NONE"}${halves.length ? ` underlined=${halves.join(",")}` : ""}${g.dataset.off ? ` off=${g.dataset.off}` : ""}${g.dataset.live ? ` live=${g.dataset.live}` : ""}`;
}, sel);
await goto(SI);
const PAIR = `#s${SI} .he-text .wb.kq`;
console.log("pair at rest:   ", await lineOf(PAIR));
// the key the pair's line reads from, its carriers in the bake, and a plain word of the same key
const facts = await p.evaluate((si) => {
  const z = window.__zone, sec = z.sections[si], w = sec.words.find((x) => x.kq);
  const wbs = [...document.querySelectorAll(`#s${si} .he-text .wb.kq .w .wr`)];
  const i = wbs.findIndex((x) => x.classList.contains("backs-en"));
  const r = w.w[i >= 0 ? i : 0]; const gm = z.gloss_m[r.k] || {};
  let plain = null;
  z.sections.some((s, sj) => s.words.some((x, wi) => { if (!x.kq && x.k === r.k && !(x.pg && x.pg.length)) { plain = { si: sj, wi, label: s.label }; return true; } return false; }));
  if (!plain) z.sections.some((s, sj) => s.words.some((x, wi) => { if (!x.kq && x.k === r.k) { plain = { si: sj, wi, label: s.label }; return true; } return false; }));
  return { label: sec.label, role: r.role, k: r.k, by: gm.by || null, m: gm.m || null, alt: gm.alt ? { by: gm.alt.by, text: gm.alt.text } : null, gloss: z.gloss[r.k], plain };
}, SI);
console.log("the half the line reads:", facts.label, facts.role, U(facts.k), "| baked:", JSON.stringify(facts.gloss), "| carriers:", JSON.stringify(facts.by), "| alternate:", JSON.stringify(facts.alt));
if (facts.plain) {
  await goto(facts.plain.si);
  await p.evaluate(({ si, wi }) => { const z = window.__zone; const wb = [...document.querySelectorAll(`#s${si} .he-text .wb`)].find((x) => x.__word === z.sections[si].words[wi]); if (wb) wb.dataset.probe = "plain"; }, facts.plain);
  console.log(`plain word of the same key (${facts.plain.label} word ${facts.plain.wi + 1}) at rest:`, await lineOf('[data-probe="plain"]'));
}
const ids = [...(facts.by || []), ...(alsoTahot ? ["PIECE:TAHOT"] : [])];
const pressed = await p.evaluate((ids) => {
  const out = [];
  for (const x of document.querySelectorAll("#sourcesRow button.dfp.on")) { const mine = (x.dataset.ids || "").split(" "); if (ids.some((id) => mine.includes(id))) { x.click(); out.push(x.dataset.key); } }
  return { out, off: window.__sourcesOff };
}, ids);
console.log("source chips pressed off:", JSON.stringify(pressed.out), "| off now:", JSON.stringify(pressed.off));
await p.waitForTimeout(1500);
await p.waitForFunction(() => !window.__livePending, null, { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500);
if (facts.plain) console.log("plain word, carriers off:", await lineOf('[data-probe="plain"]'));
await goto(SI); await p.waitForFunction(() => !window.__livePending, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(1000);
console.log("pair, carriers off:     ", await lineOf(PAIR));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
