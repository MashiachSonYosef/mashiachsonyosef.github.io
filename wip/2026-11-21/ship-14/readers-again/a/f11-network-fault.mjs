// Finding 11. Part 1: one request failed at load (aborted, as a dropped connection; or answered 503): what the page says.
// Part 2: a sidecar's first request failed once and every later one let through: is it ever asked for again in the
// visit (cards opened, a source chip pressed), and what the reader is left with.
// node f11-network-fault.mjs load|lattice|suggested|formof|none
import { chromium, BASE, ready, waitCard } from "./lib.mjs";
const part = process.argv[2] || "load";
const b = await chromium.launch();
const fresh = async () => { const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); return ctx.newPage(); };
if (part === "load") {
  for (const [what, pat, how] of [["nothing failing", null, null], ["the catalog's index aborted", "**/data/route-store/index.json", "abort"], ["the book's bin aborted", "**/data/zones/amos.bin*", "abort"], ["the book's bin answered 503", "**/data/zones/amos.bin*", "503"]]) {
    const p = await fresh();
    if (pat) await p.route(pat, (route) => (how === "abort" ? route.abort("connectionreset") : route.fulfill({ status: 503, body: "Service Unavailable" })));
    await p.goto(`${BASE}?b=amos`, { waitUntil: "networkidle" }).catch(() => {});
    await p.waitForTimeout(2500);
    const s = await p.evaluate(() => ({ meta: (document.getElementById("meta") || {}).textContent || "", sections: document.querySelectorAll("section.seg").length, title: document.title }));
    console.log(`${what}: ${s.sections} sections drawn; the page says: ${JSON.stringify(s.meta.slice(0, 150))}`);
    await p.context().close();
  }
} else {
  const PAT = { lattice: "**/data/zones/amos.lattice.bin*", suggested: "**/data/source-suggested/amos.json*", formof: "**/data/form-of-pills-v1.json*", none: "**/no-such-file" }[part];
  const RX = { lattice: /amos\.lattice\.bin/u, suggested: /source-suggested\/amos\.json/u, formof: /form-of-pills-v1\.json/u, none: /amos\.lattice\.bin|source-suggested\/amos\.json|form-of-pills-v1\.json/u }[part];
  const p = await fresh();
  let asked = 0, failed = 0;
  p.on("request", (r) => { if (RX.test(r.url())) asked += 1; });
  await p.route(PAT, (route) => { if (failed === 0) { failed += 1; route.abort("connectionreset"); } else route.continue(); });
  await p.goto(`${BASE}?b=amos`, { waitUntil: "networkidle" }); await ready(p); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({ pointing: window.__masorah, lattice: !!window.__latticeStore, suggested: window.__suggested || null, formOf: window.__formOf === undefined ? "not asked" : window.__formOf }));
  console.log(`after the load: asked ${asked} time(s), ${failed} failed;`, JSON.stringify(await st()));
  const card = async (si, n) => {
    await p.evaluate(({ si, n }) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); const wb = el.querySelectorAll(".he-text .wb")[n]; (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, { si, n });
    await waitCard(p); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => ({ pills: document.querySelectorAll("#hud .b-read .r-pills button").length, gradedBy: !!window.__cardGradedBy, notes: [...document.querySelectorAll("#hud .rows p")].map((x) => x.textContent.trim()).filter((t) => /pointed otherwise|not pointed|source suggested|BSB/iu.test(t)).map((t) => t.slice(0, 110)) }));
    await p.keyboard.press("Escape"); await p.waitForTimeout(400);
    return r;
  };
  console.log("card 1 (1:2 word 3):", JSON.stringify(await card(1, 2)), `| asked ${asked} time(s) so far`);
  console.log("card 2 (1:3 word 5):", JSON.stringify(await card(2, 4)), `| asked ${asked} time(s) so far`);
  await p.evaluate(() => document.querySelector('#sourcesRow button.dfp.on[data-key="openscriptures_bdb_1906"]').click()); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelector('#sourcesRow button.dfp[data-key="openscriptures_bdb_1906"]').click()); await p.waitForTimeout(2500);
  console.log("card 3, after a source chip pressed off and on:", JSON.stringify(await card(3, 2)), `| asked ${asked} time(s) so far`);
  console.log("at the end:", JSON.stringify(await st()), `| asked ${asked} time(s) in the whole visit, of which ${failed} failed`);
}
await b.close();
