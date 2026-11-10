// Lay images side by side at a chosen height with captions: node montage2.cjs <out.png> <height px> <caption=file>...
const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const [out, h, ...items] = process.argv.slice(2);
  const cells = items.map((it) => { const i = it.indexOf("="); return { cap: it.slice(0, i), src: "data:image/png;base64," + fs.readFileSync(it.slice(i + 1)).toString("base64") }; });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1900, height: 1000 } });
  await p.setContent(`<body style="margin:0;background:#fff;font:15px sans-serif"><div id="m" style="display:inline-flex;flex-wrap:wrap;gap:12px;padding:12px;align-items:flex-start;max-width:1880px">${cells.map((c) => `<figure style="margin:0"><img src="${c.src}" style="height:${h}px;display:block"><figcaption style="padding:5px 0">${c.cap}</figcaption></figure>`).join("")}</div></body>`);
  await p.waitForTimeout(300);
  await (await p.$("#m")).screenshot({ path: out }); await b.close();
})();
