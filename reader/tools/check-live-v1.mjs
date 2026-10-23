// THE LIVE SITE IS THIS BUILD (the rebuild, 2026-10-23: nothing confirmed a
// ship live; the build container cannot reach the public site). Run against
// the public origin after a deploy, from anywhere that can reach it, with
// this checkout as the build it should be serving.
//   L1  the live manifest is this checkout's manifest, byte for byte (waited
//       for, up to --wait seconds, since a deploy lands after its push)
//   L2  the live lane state is this checkout's: the same build time
//   L3  the first served book's chapter page is live, carries its pins, and
//       its bin arrives with the sha256 the page's pin names
//   L4  the live door is this checkout's door, byte for byte
// No browser; fetch and hash only. Usage: node tools/check-live-v1.mjs <origin> [--wait 600]
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesServed } from "./zones-on-disk-v1.mjs";
const ORIGIN = /^https?:/u.test(process.argv[2] || "") ? process.argv[2].replace(/\/$/u, "") : "";
if (!ORIGIN) { console.log("SKIPPED — the public origin to check is given as the first argument"); process.exit(3); }
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const WAIT = Number(arg("wait", "600"));
const ENGINE = dirname(dirname(fileURLToPath(import.meta.url))), SITE = join(ENGINE, ".."), HOME = ENGINE.split("/").pop();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const get = async (path) => { const r = await fetch(`${ORIGIN}${path}`, { cache: "no-store", headers: { "cache-control": "no-cache" } }); return { ok: r.ok, status: r.status, bytes: Buffer.from(await r.arrayBuffer()) }; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// L1: the manifest, waited for
const mine = readFileSync(join(ENGINE, "PIPELINE-MANIFEST.md"));
const t0 = Date.now();
let live = null, tries = 0;
while (Date.now() - t0 < WAIT * 1000) {
  tries += 1;
  try { live = await get(`/${HOME}/PIPELINE-MANIFEST.md`); } catch (e) { live = { ok: false, status: String(e.message || e).slice(0, 60), bytes: Buffer.alloc(0) }; }
  if (live.ok && live.bytes.equals(mine)) break;
  await sleep(Math.min(30000, WAIT * 1000));
}
check("L1 the live manifest is this checkout's manifest, byte for byte", !!live && live.ok && live.bytes.equals(mine), `${tries} read(s) over ${Math.round((Date.now() - t0) / 1000)} s · live ${live ? (live.ok ? `${live.bytes.length} bytes, sha ${sha(live.bytes).slice(0, 12)}` : `status ${live.status}`) : "unread"} · mine ${mine.length} bytes, sha ${sha(mine).slice(0, 12)}`);
// L2: the lane state
const laneMine = JSON.parse(readFileSync(join(ENGINE, "data", "lane-state-v1.json"), "utf8"));
const laneLive = await get(`/${HOME}/data/lane-state-v1.json`).then((r) => (r.ok ? JSON.parse(r.bytes.toString("utf8")) : null)).catch(() => null);
check("L2 the live lane state is this checkout's: the same build time", !!laneLive && laneLive.built_at === laneMine.built_at, `live ${laneLive ? laneLive.built_at : "unread"} · mine ${laneMine.built_at}`);
// L3: a chapter page, its pins and its bin
const BOOK = zonesServed().find((z) => existsSync(join(SITE, z, "1", "index.html")));
if (BOOK) {
  const page = await get(`/${BOOK}/1/`).catch(() => ({ ok: false, status: "no answer", bytes: Buffer.alloc(0) }));
  const html = page.bytes.toString("utf8");
  const m = /<meta name="reader-zone-pins" content="([^"]*)"/u.exec(html);
  const pins = m ? JSON.parse(m[1].replace(/&quot;/g, "\"").replace(/&amp;/g, "&")) : null;
  const pin = pins && pins.pins && pins.pins[`${BOOK}.bin`];
  const bin = pin ? await get(`/${HOME}/data/zones/${BOOK}.bin`).catch(() => ({ ok: false, bytes: Buffer.alloc(0) })) : null;
  const got = bin && bin.ok ? sha(bin.bytes) : "";
  check("L3 the first served book's chapter page is live with its pins, and its bin arrives with the sha256 the pin names", page.ok && !!pin && !!bin && bin.ok && got === pin.sha256 && bin.bytes.length === pin.bytes,
    `${BOOK}: page ${page.ok ? "200" : page.status} · pin ${pin ? pin.sha256.slice(0, 12) : "absent"} · bin ${bin && bin.ok ? `${bin.bytes.length} bytes, sha ${got.slice(0, 12)}` : "unread"}`);
} else check("L3 a served book has a chapter page", false, "none on disk");
// L4: the door, byte for byte
const door = await get("/").catch(() => ({ ok: false, status: "no answer", bytes: Buffer.alloc(0) }));
const doorMine = readFileSync(join(SITE, "index.html"));
check("L4 the live door is this checkout's door, byte for byte", door.ok && door.bytes.equals(doorMine), `status ${door.ok ? 200 : door.status} \u00b7 live ${door.bytes.length} bytes, sha ${sha(door.bytes).slice(0, 12)} \u00b7 mine ${doorMine.length} bytes, sha ${sha(doorMine).slice(0, 12)}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
