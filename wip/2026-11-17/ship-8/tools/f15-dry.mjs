// F15 of check-form-of-v1, alone, over the resting lines on disk (a dry run before the lines are recorded again)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const rec = JSON.parse(readFileSync("data/form-of-pills-v1.json", "utf8"));
const plain = (t) => String(t).trim().replace(/\.$/u, "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
const faults = []; let lines = 0, books = 0;
for (const f of readdirSync("data/resting-lines").filter((x) => x.endsWith(".json.gz")).sort()) {
  const book = f.replace(/\.json\.gz$/u, "");
  if (!existsSync(`data/zones/${book}.bin`)) continue;
  const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.bin`)).toString("utf8"));
  const rl = JSON.parse(gunzipSync(readFileSync(`data/resting-lines/${f}`)).toString("utf8"));
  const secs = new Map((z.sections || []).map((s) => [s.label, s.words || []]));
  books += 1;
  for (const [label, entries] of rl.sections || []) {
    const words = secs.get(label) || [];
    for (const [i, , text] of entries) {
      const w = words[i];
      if (!w || !w.k || !rec.keys[w.k]) continue;
      lines += 1;
      const e = rec.keys[w.k].find((x) => x.resolved && !x.resolved.name && plain(x.t) === plain(text));
      if (e) faults.push(`${book} ${label} word ${i + 1}: «${text}» (${e.m}) -> «${e.resolved.text}»`);
    }
  }
}
console.log(books, "books", lines, "lines at keys the map holds;", faults.length, "faults"); for (const x of faults) console.log(" ", x);
