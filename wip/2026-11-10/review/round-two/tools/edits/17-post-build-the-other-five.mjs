// The other five tools that write a zone after its build call tools/zone-post-build-v1.mjs too (the review's T5, T6).
// apply-span-ledger-v1 and project-piece-gloss-v1 already kept the rule; project-toggle-headword-v1 and
// respan-zone-v1 overwrote a field's writers with themselves; enrich-gloss-m-v1 replaced the whole receipt,
// dated it by the clock and wrote the zone at gzip's default level. None is a step of the round, and none
// is run here: what changes is the dozen lines each typed for itself, replaced by the one function the round's
// four are proven to write the same bytes through.
// node 17-post-build-the-other-five.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("apply-span-ledger-v1.mjs"), [
  [`import { join, basename } from "node:path";`, `import { join, basename } from "node:path";\nimport { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";`],
  [`function typePostBuild(zone, stamp) {
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/apply-span-ledger-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  for (const f of ["emitted_from.span_ledger"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me; }
  const why = "the zone's divisions are the corpus lane's span ledger, swapped in whole after the build, and its receipt names the ledger file";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run that reads the span ledger in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}`,
   `function typePostBuild(zone, stamp) {
  typePostBuildWrite(zone, {
    tool: "tools/apply-span-ledger-v1.mjs",
    fields: ["emitted_from.span_ledger"],
    why: "the zone's divisions are the corpus lane's span ledger, swapped in whole after the build, and its receipt names the ledger file",
    expires: "with this zone's rebuild by a build-zone run that reads the span ledger in its single pass",
    stamp,
  });
}`],
  [`    writeFileSync(zPath, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));
    typed += 1;`, `    writeZone(zPath, zone);
    typed += 1;`],
  [`  writeFileSync(zPath, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));`, `  writeZone(zPath, zone);`],
]);

edit(T("project-piece-gloss-v1.mjs"), [
  [`import { zonesServed } from "./zones-on-disk-v1.mjs";`, `import { zonesServed } from "./zones-on-disk-v1.mjs";\nimport { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";`],
  [`    {
      const ef = (zz.emitted_from = zz.emitted_from || {});
      const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID
        ? ef.post_build
        : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: STAMP };
      const me = "tools/project-piece-gloss-v1.mjs";
      pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
      for (const f of ["piece_gloss"]) {
        if (!pb.wrote.includes(f)) pb.wrote.push(f);
        pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me;
      }
      const why = "the piece gloss is the source's own English for each piece AT THIS POSITION, projected over this zone's own positions and joined by the running word index with the surface and the verse proved on every record";
      pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
      const exp = "with this zone's rebuild by a build-zone run that projects the piece gloss in its single pass";
      pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
      pb.on = STAMP;
      ef.post_build = pb;
    }
    writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(zz)), { level: 9 }));`,
   `    typePostBuildWrite(zz, {
      tool: "tools/project-piece-gloss-v1.mjs",
      fields: ["piece_gloss"],
      why: "the piece gloss is the source's own English for each piece AT THIS POSITION, projected over this zone's own positions and joined by the running word index with the surface and the verse proved on every record",
      expires: "with this zone's rebuild by a build-zone run that projects the piece gloss in its single pass",
      stamp: STAMP,
    });
    writeZone(path, zz);`],
]);

edit(T("project-toggle-headword-v1.mjs"), [
  [`import { createInterface } from "node:readline";`, `import { createInterface } from "node:readline";\nimport { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";`],
  [`{
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/project-toggle-headword-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  // the receipts check names a mark by its box: emitted_from.<key>
  for (const f of ["emitted_from.toggles"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = me; }
  const why = "the look-up-by toggle is Moses's headword ledger projected over this zone's own positions";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run that projects the toggle ledgers in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}

const body = JSON.stringify(zone);
writeFileSync(outPath, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));`,
   `// the receipts check names a mark by its box: emitted_from.<key>. Typed by
// the one rule (zone-post-build-v1): this tool joins the writers of the box;
// until 10 November 2026 it named itself the box's only writer, over the
// lattice's and the sources' projections that write there too.
typePostBuildWrite(zone, {
  tool: "tools/project-toggle-headword-v1.mjs",
  fields: ["emitted_from.toggles"],
  why: "the look-up-by toggle is Moses's headword ledger projected over this zone's own positions",
  expires: "with this zone's rebuild by a build-zone run that projects the toggle ledgers in its single pass",
  stamp,
});

const body = JSON.stringify(zone);
writeZone(outPath, zone);`],
]);

edit(T("respan-zone-v1.mjs"), [
  [`import { require_ } from "./zone-lib-v1.mjs";`, `import { require_ } from "./zone-lib-v1.mjs";\nimport { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";`],
  [`{
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = out.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/respan-zone-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  for (const f of ["span_layer.projected_on", "span_layer.projected_by", "span_layer.projected_away_from", "span_layer.gloss_layer_owed", "span_layer.held_for_a_double_answer"]) {
    if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = me;
  }
  const why = "the component layer is a projection of the COMPspan template over this zone's own keys, run here because the zone was built without --spans";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run given --spans";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}
const body = JSON.stringify(out);
writeFileSync(outPath, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));`,
   `typePostBuildWrite(out, {
  tool: "tools/respan-zone-v1.mjs",
  fields: ["span_layer.projected_on", "span_layer.projected_by", "span_layer.projected_away_from", "span_layer.gloss_layer_owed", "span_layer.held_for_a_double_answer"],
  why: "the component layer is a projection of the COMPspan template over this zone's own keys, run here because the zone was built without --spans",
  expires: "with this zone's rebuild by a build-zone run given --spans",
  stamp,
});
const body = JSON.stringify(out);
writeZone(outPath, out);`],
]);

edit(T("enrich-gloss-m-v1.mjs"), [
  [`// Run: node tools/enrich-gloss-m-v1.mjs [--zones data/zones]`,
   `// Run: node tools/enrich-gloss-m-v1.mjs --stamp YYYY-MM-DD [--zones data/zones]
//
// WHERE IT STANDS (10 November 2026). Every served zone carries the M its
// builder wrote, so this pass finds nothing to serve and leaves every zone
// alone; and regloss-zone derives gloss_m, with each reading's carriers and
// its alternate, on every projection. It is kept for a zone built before
// 2 September 2026 that might come back onto the shelf. Until that day it
// replaced a zone's whole post-build receipt (erasing every other tool's
// typed write), dated it by the clock and wrote the zone at gzip's default
// level; it types and writes through tools/zone-post-build-v1.mjs now.`],
  [`import { isSidecar } from "./zones-on-disk-v1.mjs";`, `import { isSidecar } from "./zones-on-disk-v1.mjs";\nimport { typePostBuildWrite, writeZone, EXEMPTION_RULE_ID } from "./zone-post-build-v1.mjs";\nexport { EXEMPTION_RULE_ID };`],
  [`export const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const WROTE = ["gloss_m", "gloss_layer.store_version"];`,
   `const WROTE = ["gloss_m", "gloss_layer.store_version"];
// the day of the round that runs this; asked for only when a zone is written
const STAMP = arg("stamp", null);`],
  [`  const wrote = [...WROTE];
  const byField = Object.fromEntries(WROTE.map((f) => [f, "tools/enrich-gloss-m-v1.mjs"]));
  if (gl.language_admission) { wrote.push("gloss_layer.language_admission"); byField["gloss_layer.language_admission"] = "tools/redrive-zone-gloss-v1.mjs"; }
  ef.post_build = {
    rule_id: EXEMPTION_RULE_ID,
    by: "tools/enrich-gloss-m-v1.mjs",
    wrote,
    by_field: byField,
    store_version: STORE.index.store_version || null,
    why: "this zone was built before build-zone wrote gloss_m in its single pass (2026-09-02); its M is derived here from the store now on disk, the same derivation the builder runs",
    expires: "with this zone's rebuild by a build-zone that writes gloss_m (gloss_layer.m_layer present)",
    on: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(z), "utf8")));`,
   `  if (!/^\\d{4}-\\d{2}-\\d{2}$/u.test(String(STAMP || ""))) { console.error(\`\${f}: this zone would be written, and a zone is written under the day of its round: --stamp YYYY-MM-DD\`); process.exit(2); }
  const pb = typePostBuildWrite(z, {
    tool: "tools/enrich-gloss-m-v1.mjs",
    fields: WROTE,
    why: "this zone was built before build-zone wrote gloss_m in its single pass (2026-09-02); its M is derived here from the store now on disk, the same derivation the builder runs",
    expires: "with this zone's rebuild by a build-zone that writes gloss_m (gloss_layer.m_layer present)",
    stamp: STAMP,
  });
  pb.store_version = STORE.index.store_version || null;
  // the redrive's own mark, named to its writer and to no other
  if (gl.language_admission) {
    const f2 = "gloss_layer.language_admission";
    if (!pb.wrote.includes(f2)) pb.wrote.push(f2);
    if (!pb.by_field[f2]) pb.by_field[f2] = "tools/redrive-zone-gloss-v1.mjs";
  }
  writeZone(path, z);`],
]);
