// screenshot a page of the reader: node shot.mjs <url> <out.png> [width] [height] [fullPage]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, out, w = "412", h = "915", full = ""] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: !!full });
await b.close();
