// Scratch (builder H2): does reading a gzip file of the card's data through DecompressionStream end its request as
// aborted? One page, a few files, each read once as the block reads it; the requests that end failed are listed.
import { join } from "node:path";
const [SITE] = process.argv.slice(2);
const { serveTree } = await import(join(SITE, "reader", "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(SITE, "reader", "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try { const page = await (await browser.newContext()).newPage(); const failed = [];
  page.on("requestfailed", (r) => failed.push(`${r.url().replace(tree.base, "")} ${(r.failure() || {}).errorText}`));
  await page.goto(`${tree.base}/reader/place.html?b=ruth&c=1`, { waitUntil: "networkidle" });
  const got = await page.evaluate(async () => { const out = []; for (const f of ["entries/t/160.json.gz", "entries/u/089.json.gz", "entries/t/040.json.gz"]) { const r = await fetch("data/place-answers-v1/page/" + f); const j = await new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).json(); out.push([f, Object.keys(j).length]); } return out; });
  await page.waitForTimeout(1000); console.log(JSON.stringify(got)); console.log(failed.join("\n") || "(no request failed)"); }
finally { await browser.close(); await tree.close(); }
