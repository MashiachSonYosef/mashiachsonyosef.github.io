import { readFileSync } from "node:fs";
const win = {};
new Function("window", readFileSync(process.argv[2] + "/data/frame-record-v1.js", "utf8"))(win);
const L = win.FRAME_RECORD_V1.owner_stated_frame_2026_08_31.letters;
for (const [k, v] of Object.entries(L)) console.log(k, "·", JSON.stringify(v).slice(0, 230));
