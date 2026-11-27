// one line per sampled placing of a set of samples2.json, for hand reading
import { readFileSync } from "node:fs";
const [set, only = "all"] = process.argv.slice(2);
let all = JSON.parse(readFileSync("samples2.json", "utf8")).filter((r) => r.set === set && !r.set_aside);
if (only === "new") all = all.filter((r) => r.replacement || r.i <= 60 && !("page" in r));
if (only === "replacement") all = all.filter((r) => r.replacement);
all.sort((a, b) => a.i - b.i);
const strip = (s) => String(s || "").replace(/[֑-ֽ֯]/gu, "");
for (const r of all) {
  const ctx = r.verse_en.split(" | "); const at = ctx.findIndex((x) => x.startsWith("【")); const near = ctx.slice(Math.max(0, at - 3), at + 4).join(" | ");
  console.log(`#${r.i} ${r.book} ${r.label}:${r.n} ${strip(r.word)} [${r.block_kind === "core piece" ? "P " + strip(r.block_pointed || r.block) : "W"}]${r.name_place ? " NAME" : ""}${r.aramaic_stretch ? " ARAM" : ""} «${r.step_line}» => «${String(r.reading).slice(0, 130)}» ${r.m} hw:${(r.headwords || []).map(strip).join(",").slice(0, 36)}${r.entry_verdict !== "none" ? " e:" + r.entry_verdict : ""}${r.davidson_kind ? " k:" + r.davidson_kind : ""}${r.definition_text && r.definition_text !== r.route_text ? " D:" + r.definition_text.replace(/\s+/gu, " ").slice(0, 90) : ""}${r.record_loc && /c0:/u.test(r.record_loc) ? " at:" + r.record_loc.replace(/^.*c0:/u, "").slice(0, 18) : ""} | ${near.slice(0, 130)}`);
}
