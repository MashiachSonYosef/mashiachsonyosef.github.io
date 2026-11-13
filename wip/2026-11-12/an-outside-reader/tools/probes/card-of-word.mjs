// One word's card as the page opens it, every pill listed: its text, its own reading where the pill prints more
// (a pointer), its title, the sources behind it, its grade. For seeing why two pills of one card read the same.
// node card-of-word.mjs <reader dir> <zone url base> <book> <section label> <word number> [--lift]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const LIFT = argv.includes("--lift"); if (LIFT) argv.splice(argv.indexOf("--lift"), 1);
const [reader, base, book, label, nArg] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
if (LIFT) { await p.evaluate(() => { localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.signs", "printed"); localStorage.setItem("fh.sources.off", "[]"); localStorage.setItem("fh.sources.shelve", "[]"); }); await p.reload({ waitUntil: "networkidle" }); }
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => window.__materialise());
await p.waitForTimeout(1500);
const got = await p.evaluate(async ({ label, n }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && String(s.__sec.label) === label);
  if (!sec) return { fault: "no such section" };
  const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
  if (!wb) return { fault: "no such word" };
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const hud = document.getElementById("hud");
  for (let i = 0; i < 400; i += 1) { const read = hud.querySelector(":scope > .rows > .b-read"); if (read && read.children.length && !read.querySelector(".r-wait")) break; await new Promise((r) => setTimeout(r, 25)); }
  const pills = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")];
  return { s: wb.__word.s, k: wb.__word.k, head: (hud.querySelector(".head") || {}).textContent, pool: [...(window.__pool || [])], pills: pills.map((x) => ({ text: x.textContent, pointer: x.dataset.pointer || "", title: x.title, by: x.dataset.by, grade: x.dataset.grade })) };
}, { label, n: Number(nArg) });
await b.close();
if (got.fault) { console.log(got.fault); process.exit(1); }
console.log(`${book} ${label}:${nArg} · ${got.s} · key ${got.k} · ${got.pills.length} pills`);
const seen = new Map();
got.pills.forEach((x, i) => { seen.set(x.text, [...(seen.get(x.text) || []), i]); });
if (process.env.EVERY_PILL) got.pills.forEach((x, i) => console.log(`  ${String(i + 1).padStart(3)} ${JSON.stringify(x.text.slice(0, 80))}${x.pointer ? ` <- its own reading ${JSON.stringify(x.pointer.slice(0, 90))}` : ""} · by ${x.by}`));
for (const [t, at] of seen) if (at.length > 1) for (const i of at) console.log(`  pill ${i + 1}: ${JSON.stringify(t)}\n      its own reading ${JSON.stringify(got.pills[i].pointer || got.pool[i])} · the page's account of it ${JSON.stringify(got.pool[i])}\n      title ${JSON.stringify(got.pills[i].title)} · by ${got.pills[i].by} · grade ${got.pills[i].grade}`);
