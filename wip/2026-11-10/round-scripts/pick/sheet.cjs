// One sheet to pick from: node sheet.cjs <dir> <sheet id> <title> <out.png>
const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const [dir, sheet, title, out] = process.argv.slice(2);
  const meta = JSON.parse(fs.readFileSync(`${dir}/meta.json`, "utf8"));
  const ids = Object.keys(meta).filter((k) => meta[k].sheet === sheet);
  const img = (f) => "data:image/png;base64," + fs.readFileSync(`${dir}/${f}`).toString("base64");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const W = 372;
  const html = `<body style="margin:0;background:#fff;font:15px/1.35 Georgia,serif;color:#222"><div id="m" style="display:inline-block;padding:18px 18px 14px">
    <div style="font-size:21px;margin:0 0 4px 2px">${esc(title)}</div>
    <div style="display:flex;gap:14px;align-items:flex-start">${ids.map((id) => `<div style="width:${W}px">
      <div style="font-size:15px;font-weight:bold;margin:8px 2px 2px;min-height:2.7em">${esc(meta[id].name)}</div>
      <div style="font-size:12.5px;color:#555;margin:0 2px 8px;min-height:3.4em">${esc(meta[id].say)}</div>
      <img src="${img(id + "-line.png")}" style="width:${W}px;display:block;border:1px solid #bbb"><div style="height:10px"></div>
      <img src="${img(id + "-card.png")}" style="width:${W}px;display:block;border:1px solid #bbb"></div>`).join("")}</div></div>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1.5 });
  await p.setContent(html); await p.waitForTimeout(500);
  await (await p.$("#m")).screenshot({ path: out }); await b.close();
})();
