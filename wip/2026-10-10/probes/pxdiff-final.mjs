// Counts the pixels that differ between each shot's "before" and "after"
// picture, and where (the left half is the word before the action, the
// right half after it), so the report can say which shots differ.
import { readFileSync } from "node:fs";
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";
const D = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/follow";
const { chromium } = await loadPlaywright();
const br = await chromium.launch(launchOptions());
const pg = await br.newPage();
for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
  const a = readFileSync(`${D}/shot-${n}-before.png`).toString("base64");
  const b = readFileSync(`${D}/shot-${n}-after.png`).toString("base64");
  const r = await pg.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
    const [ia, ib] = [await load(a), await load(b)];
    if (ia.width !== ib.width || ia.height !== ib.height) return { sizes: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
    const px = (im) => { const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
    const da = px(ia), db = px(ib);
    let left = 0, right = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 30) { if (((i / 4) % ia.width) < ia.width / 2) left += 1; else right += 1; }
    }
    return { left, right };
  }, [a, b]);
  console.log(n, JSON.stringify(r));
}
await br.close();
