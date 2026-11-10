// Before and after, two readers: node sheet2.cjs <dir> <out>
const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const [dir, out] = process.argv.slice(2);
  const img = (f) => "data:image/png;base64," + fs.readFileSync(`${dir}/${f}`).toString("base64");
  const cell = (cap, f) => `<div style="width:372px"><div style="font-size:15px;font-weight:bold;margin:8px 2px 6px">${cap}</div><img src="${img(f)}" style="width:372px;display:block;border:1px solid #bbb"></div>`;
  const html = `<body style="margin:0;background:#fff;font:15px/1.35 Georgia,serif;color:#222"><div id="m" style="display:inline-block;padding:18px">
    <div style="font-size:21px;margin:0 0 4px 2px">The card numbers: this morning, and now</div>
    <div style="display:flex;gap:14px;align-items:flex-start">${cell("English reader · this morning: outside the card", "num-before-en.png")}${cell("English reader · now: in the card's corner", "num-after-en.png")}${cell("Hebrew reader · this morning", "num-before-he.png")}${cell("Hebrew reader · now", "num-after-he.png")}</div></div>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1.5 });
  await p.setContent(html); await p.waitForTimeout(500);
  await (await p.$("#m")).screenshot({ path: out }); await b.close();
})();
