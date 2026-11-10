const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const [dir, out] = process.argv.slice(2);
  const img = (f) => "data:image/png;base64," + fs.readFileSync(`${dir}/${f}`).toString("base64");
  const row = (cap, f) => `<div style="font-size:16px;font-weight:bold;margin:14px 2px 6px">${cap}</div><img src="${img(f)}" style="width:760px;display:block;border:1px solid #bbb">`;
  const html = `<body style="margin:0;background:#fff;font:15px/1.35 Georgia,serif;color:#222"><div id="m" style="display:inline-block;padding:18px">
    <div style="font-size:21px;margin:0 0 2px 2px">The points and accents: gold or scarlet? (Genesis 1:1, close up)</div>
    <div style="font-size:13px;color:#555;margin:0 2px 4px">gold marks 3.4:1 on the linen; scarlet marks 5.5:1, the letters' own color</div>
    ${row("M1 · gold, as today · English reader", "M1-close.png")}${row("M2 · scarlet, as the letters · English reader", "M2-close.png")}
    ${row("M1 · gold, as today · Hebrew reader", "M1-close-he.png")}${row("M2 · scarlet, as the letters · Hebrew reader", "M2-close-he.png")}</div>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
  await p.setContent(html); await p.waitForTimeout(500);
  await (await p.$("#m")).screenshot({ path: out }); await b.close();
})();
