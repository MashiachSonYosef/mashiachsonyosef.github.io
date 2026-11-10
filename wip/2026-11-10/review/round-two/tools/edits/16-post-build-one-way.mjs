// A zone written after its build is typed and written one way (the review's T5 and T6): the nine tools that
// write a zone after its build call tools/zone-post-build-v1.mjs, where the receipt's rule and the zone's bytes
// (gzip level 9) are stated once. Six of them already kept the rule and write the same bytes as before (the
// round's four are proven so by the round itself). Three did not:
//   project-toggle-headword-v1 and respan-zone-v1 overwrote a field's writers with themselves;
//   enrich-gloss-m-v1 replaced the whole receipt, dated it by the clock and wrote the zone at gzip's default level.
// They keep the rule now. None of the three is a step of the round.
// node 16-post-build-one-way.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);
const IMPORT = `import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";`;

// ---- the round's four ----
edit(T("bake-witnessed-order-v1.mjs"), [
  [`import { openRouteStore } from "./gloss-store-v1.mjs";`, `import { openRouteStore } from "./gloss-store-v1.mjs";\n${IMPORT}`],
  [`{
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: STAMP };
  const me = "tools/bake-witnessed-order-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  for (const f of ["gloss_orders", "gloss_m_orders", "emitted_from.witnessed_order"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me; }
  const why = "the owner selected the corpus lane's witnessed order (2026-09-25); its three columns are baked as shipped over this zone's own keys";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run, after which the columns are baked again";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = STAMP;
  ef.post_build = pb;
}
writeFileSync(OUT || ZONE, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));`,
   `typePostBuildWrite(zone, {
  tool: "tools/bake-witnessed-order-v1.mjs",
  fields: ["gloss_orders", "gloss_m_orders", "emitted_from.witnessed_order"],
  why: "the owner selected the corpus lane's witnessed order (2026-09-25); its three columns are baked as shipped over this zone's own keys",
  expires: "with this zone's rebuild by a build-zone run, after which the columns are baked again",
  stamp: STAMP,
});
writeZone(OUT || ZONE, zone);`],
]);

edit(T("regloss-zone.mjs"), [
  [`import { wordListsOf } from "./zone-walk-v1.mjs";`, `import { wordListsOf } from "./zone-walk-v1.mjs";\n${IMPORT}`],
  [`{
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/regloss-zone.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  for (const f of ["gloss_layer.reprojected", "gloss_m", "emitted_from.toggles", "gloss_orders", "emitted_from.licence_orders_layer", "emitted_from.reader_orders_layer", "gloss_names", "emitted_from.proper_names_layer", "emitted_from.no_names_layer", ...(ordersM ? ["gloss_m_orders", "emitted_from.gloss_m_orders_layer"] : []), ...(witnessedDrops ? ["emitted_from.witnessed_order"] : [])]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me; }
  const why = "the gloss layer is a projection of the route store over this zone's own keys, re-run here at cell grain after the component layer was projected";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run that writes its gloss layer in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}
const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });
writeFileSync(outPath, body);`,
   `typePostBuildWrite(zone, {
  tool: "tools/regloss-zone.mjs",
  fields: ["gloss_layer.reprojected", "gloss_m", "emitted_from.toggles", "gloss_orders", "emitted_from.licence_orders_layer", "emitted_from.reader_orders_layer", "gloss_names", "emitted_from.proper_names_layer", "emitted_from.no_names_layer", ...(ordersM ? ["gloss_m_orders", "emitted_from.gloss_m_orders_layer"] : []), ...(witnessedDrops ? ["emitted_from.witnessed_order"] : [])],
  why: "the gloss layer is a projection of the route store over this zone's own keys, re-run here at cell grain after the component layer was projected",
  expires: "with this zone's rebuild by a build-zone run that writes its gloss layer in its single pass",
  stamp,
});
const body = writeZone(outPath, zone);`],
  [`import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";`,
   `import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";`],
  // a comment that described the witnessed receipt as it was before the bake wrote it whole each round
  [`        // TYPED BESIDE THE BAKE COUNT. The witnessed receipt's "baked" is the
        // bake's own fact and is not rewritten; the drop is appended to that
        // column's receipt and never replaced. This layer's own receipt is
        // replaced whole on every projection, so a count kept only there is
        // lost by the next run (the 2026-10-17 drops, gone by 2026-10-23).
        // check-witnessed-order-v1 W1 reads baked less these drops.`,
   `        // TYPED BESIDE THE BAKE COUNT. The witnessed receipt's "baked" is the
        // bake's own fact and is not rewritten; the drop is typed on that
        // column's receipt beside it. The bake writes the receipt whole on
        // every round and lays the shipped credits again, so the drop is made
        // and typed again by the projection that follows it, with that
        // round's day. check-witnessed-order-v1 W1 reads baked less these
        // drops.`],
]);

edit(T("project-lattice-v12-v1.mjs"), [
  [`import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";`, `import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";\n${IMPORT}`],
  [`const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
`, ``],
  [`{
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/project-lattice-v12-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
  for (const f of ["emitted_from.toggles"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me; }
  const why = "the lattice's grades, headword order and edition differences are projected over this zone's own positions";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
  const exp = "with this zone's rebuild by a build-zone run that projects the lattice in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}
writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(zone), "utf8"), { level: 9 }));`,
   `typePostBuildWrite(zone, {
  tool: "tools/project-lattice-v12-v1.mjs",
  fields: ["emitted_from.toggles"],
  why: "the lattice's grades, headword order and edition differences are projected over this zone's own positions",
  expires: "with this zone's rebuild by a build-zone run that projects the lattice in its single pass",
  stamp,
});
writeZone(outPath, zone);`],
]);

edit(T("restamp-zone-v1.mjs"), [
  [`import { countStampOf } from "./count-stamp-v1.mjs";`, `import { countStampOf } from "./count-stamp-v1.mjs";\nimport { typePostBuildWrite, zoneBytes } from "./zone-post-build-v1.mjs";`],
  [`const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const ef = zone.emitted_from || (zone.emitted_from = {});
const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: STAMP };
const me = "tools/restamp-zone-v1.mjs";
pb.by = pb.by ? (pb.by.includes(me) ? pb.by : \`\${pb.by} + \${me}\`) : me;
for (const f of ["count_stamp"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (String(pb.by_field[f]).includes(me) ? pb.by_field[f] : \`\${pb.by_field[f]} + \${me}\`) : me; }
const why = "the count stamp is set again from the witness record as it now stands, by the builder's own rule over this zone's own measure, after the record was corrected";
pb.why = pb.why ? (pb.why.includes(why) ? pb.why : \`\${pb.why}; \${why}\`) : why;
const exp = "with this zone's rebuild by a build-zone run that reads the corrected witness record in its single pass";
pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : \`\${pb.expires}; \${exp}\`) : exp;
pb.on = STAMP;
ef.post_build = pb;
zone.count_stamp = now;

const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });`,
   `typePostBuildWrite(zone, {
  tool: "tools/restamp-zone-v1.mjs",
  fields: ["count_stamp"],
  why: "the count stamp is set again from the witness record as it now stands, by the builder's own rule over this zone's own measure, after the record was corrected",
  expires: "with this zone's rebuild by a build-zone run that reads the corrected witness record in its single pass",
  stamp: STAMP,
});
zone.count_stamp = now;

const body = zoneBytes(zone);`],
  [`import { gunzipSync, gzipSync } from "node:zlib";`, `import { gunzipSync } from "node:zlib";`],
]);
