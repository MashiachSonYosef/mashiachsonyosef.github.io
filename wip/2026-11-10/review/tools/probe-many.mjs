// Several small experiments on the page, one per reported fault, each printing what the page did.
// node probe-many.mjs <reader dir> <zone url base> [only: a,b,c...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, onlyArg] = process.argv.slice(2);
const only = onlyArg ? new Set(onlyArg.split(",")) : null;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const fresh = async (url, { errors = [] } = {}) => { const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const p = await ctx.newPage(); p.on("pageerror", (e) => errors.push(e.message)); await p.goto(url, { waitUntil: "networkidle" }).catch((e) => errors.push(`goto: ${e.message.split("\n")[0]}`)); return { p, ctx, errors }; };
const run = async (id, what, fn) => { if (only && !only.has(id)) return; try { console.log(`\n[${id}] ${what}`); await fn(); } catch (e) { console.log(`   the probe itself failed: ${e.message.split("\n")[0]}`); } };

await run("cindex", "a plain book page with a commentary sidecar: is the commentary index drawn, and does a hit open anything?", async () => {
  const { p, ctx, errors } = await fresh(`${base}?b=amos`);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  const r = await p.evaluate(() => { const ci = document.getElementById("cIndex"); if (!ci) return { drawn: false }; const cs = getComputedStyle(ci); const rect = ci.getBoundingClientRect(); return { drawn: true, display: cs.display, hidden: ci.hidden, h: Math.round(rect.height), top: Math.round(rect.top), text: ci.textContent.replace(/\s+/g, " ").trim().slice(0, 160), tag: ci.tagName, open: ci.open ?? null, firstInMain: ci.parentElement && ci.parentElement.firstElementChild === ci }; });
  console.log("   ", JSON.stringify(r));
  if (r.drawn) {
    const after = await p.evaluate(async () => { const ci = document.getElementById("cIndex"); if (ci.tagName === "DETAILS") ci.open = true; const s = ci.querySelector("summary"); if (s && !ci.open) s.click(); await new Promise((x) => setTimeout(x, 400)); const hits = [...ci.querySelectorAll("button, a, li")].filter((x) => x.offsetParent !== null); const hit = hits.find((x) => /\d/.test(x.textContent)) || hits[0]; const before = document.querySelectorAll(".c-inline").length; if (hit) hit.click(); await new Promise((x) => setTimeout(x, 1200)); return { hits: hits.length, pressed: hit ? hit.textContent.replace(/\s+/g, " ").trim().slice(0, 80) : null, inlineBefore: before, inlineAfter: document.querySelectorAll(".c-inline").length, bars: document.querySelectorAll(".c-bar").length }; });
    console.log("   ", JSON.stringify(after), errors.length ? `errors: ${errors.join(" | ")}` : "");
  }
  await ctx.close();
});

await run("hash", "an address whose hash is a cut percent escape", async () => {
  const errors = []; const { p, ctx } = await fresh(`${base}?b=amos#%`, { errors });
  await p.waitForTimeout(2500);
  console.log("   ", JSON.stringify(await p.evaluate(() => ({ sections: document.querySelectorAll("section.seg").length, words: document.querySelectorAll("section.seg .he-text .wb").length, nav: !!document.querySelector("#nav a, #nav button") }))), "errors:", errors.join(" | ") || "none");
  await ctx.close();
});

await run("only", "a work with no lattice, the whole rail asked for: press \"only this pointing\"", async () => {
  const { p, ctx } = await fresh(`${base}?b=tikkunei-zohar&rail=all`);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  const r = await p.evaluate(async () => { document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); const row = document.querySelector('.rail .row[data-toggle="masorah"]'); if (!row) return { row: false }; const btns = [...row.querySelectorAll(".dfp")]; const before = btns.map((x) => `${x.textContent.trim()}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.disabled ? "(dead)" : ""}`); const only = btns.find((x) => /only/i.test(x.textContent)); if (only) only.click(); await new Promise((x) => setTimeout(x, 900)); return { before, after: btns.map((x) => `${x.textContent.trim()}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`), inForce: window.__masorah }; });
  console.log("   ", JSON.stringify(r));
  await ctx.close();
});

await run("reset", "a first visit, nothing remembered: can reset be pressed, and what does it change?", async () => {
  const { p, ctx } = await fresh(`${base}?b=amos`);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  const read = () => p.evaluate(() => { const r = document.getElementById("resetPill"); const ls = {}; for (let i = 0; i < localStorage.length; i += 1) { const k = localStorage.key(i); if (/^fh\./.test(k)) ls[k] = localStorage.getItem(k).slice(0, 40); } return { disabled: r ? r.disabled : null, state: (document.getElementById("resetState") || {}).textContent, blobs: document.body.className.split(" ").filter((c) => /blob|nums|num/.test(c)).join(" "), stored: ls }; });
  const before = await read();
  await p.evaluate(() => { const r = document.getElementById("resetPill"); if (r && !r.disabled) r.click(); });
  await p.waitForTimeout(900);
  console.log("    before:", JSON.stringify(before)); console.log("    after: ", JSON.stringify(await read()));
  await ctx.close();
});

await run("search", "the search: the same word typed with and without its final letter form", async () => {
  const { p, ctx } = await fresh(`${base}?b=amos`);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  for (const q of ["מלכ", "מלך"]) {
    await p.fill("#searchIn", ""); await p.type("#searchIn", q, { delay: 40 }); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const out = document.getElementById("searchOut"); const first = out && out.firstElementChild; return { rows: out ? out.children.length : 0, first: first ? first.textContent.replace(/\s+/g, " ").trim().slice(0, 220) : null }; });
    console.log(`    typed ${[...q].map((c) => `U+${c.codePointAt(0).toString(16)}`).join(" ")}:`, JSON.stringify(r));
  }
  await ctx.close();
});

await run("railcount", "one dictionary chip switched off: what the rail's summary says", async () => {
  const { p, ctx } = await fresh(`${base}?b=genesis`);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  const r = await p.evaluate(async () => { document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); await new Promise((x) => setTimeout(x, 500)); const strip = document.querySelector(".src-strip"); if (!strip) return { strip: false }; const chips = [...strip.querySelectorAll(".src-row .dfp:not(.decl-bx)")]; const before = (document.querySelector(".rail summary, .rail .say, #railSay") || {}).textContent; const pick = chips.find((c) => /exact English translation/i.test(c.closest(".src-row").textContent)) || chips[chips.length - 1]; const name = pick.closest(".src-row").textContent.replace(/\s+/g, " ").trim().slice(0, 70); pick.click(); await new Promise((x) => setTimeout(x, 1500)); const says = [...document.querySelectorAll(".rail summary, .rail .say, #railSay, .rail .now")].map((x) => x.textContent.replace(/\s+/g, " ").trim().slice(0, 140)); return { chips: chips.length, pressed: name, idsOff: (window.__sourcesOff || []).length, before, says }; });
  console.log("   ", JSON.stringify(r));
  await ctx.close();
});

await b.close();
