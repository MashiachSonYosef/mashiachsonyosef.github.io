// Synthesis lane · a zone written after its build says who wrote it, one way
// LEDGER: -
// no frame letter. This writes a receipt about a write; it decides nothing
// about the text, the store or a reading.
//
// THE RULE IT KEEPS (single-pass-exemption-v1): a zone is built in one pass,
// and a tool that writes a zone afterwards types its write ON the zone, in
// emitted_from.post_build — who wrote, which fields, why, and when the
// exemption expires — so the receipts check counts the write instead of
// faulting it as anonymous patching.
//
// WHY THIS IS A FILE. Ten tools write a zone after its build, and each typed
// this receipt with its own copy of the same dozen lines. By 10 November 2026
// the copies kept three different rules (the review of that day, T5):
//   - six APPENDED themselves to the writers of a field they wrote;
//   - two OVERWROTE a field's writers with themselves, so a field two tools
//     write named only the last;
//   - one REPLACED the whole receipt, erasing every other tool's typed write.
// The rule is the first: a receipt of who wrote a zone names everyone who
// did. It is here once, and every tool that writes a zone after its build
// calls it.
//
// It also holds the one way a zone is written to disk: gzip at level 9 over
// the JSON as JSON.stringify gives it. A zone written at another level is the
// same zone in other bytes, and every pin and gate hash is of the bytes.
import { writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

export const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";

const joined = (was, mine, sep) => (was ? (String(was).includes(mine) ? was : `${was}${sep}${mine}`) : mine);

/** Type one tool's post-build write on a zone. Merged with what the zone
 *  already carries: the tool joins the writers (once), each field it wrote
 *  joins the list and names it among that field's writers, its reason and its
 *  expiry join the others' (each said once), and the day is this write's.
 *
 *    tool     "tools/<name>.mjs", as the receipt has always spelled it
 *    fields   the zone fields this run wrote, e.g. ["gloss_m", "emitted_from.toggles"]
 *    why      one sentence: why this write exists
 *    expires  one sentence: what rebuild retires the exemption
 *    stamp    the day of the round, YYYY-MM-DD
 */
export const typePostBuildWrite = (zone, { tool, fields, why, expires, stamp }) => {
  const ef = zone.emitted_from || (zone.emitted_from = {});
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID
    ? ef.post_build
    : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  pb.by = joined(pb.by, tool, " + ");
  for (const f of fields) {
    if (!pb.wrote.includes(f)) pb.wrote.push(f);
    pb.by_field[f] = joined(pb.by_field[f], tool, " + ");
  }
  pb.why = joined(pb.why, why, "; ");
  pb.expires = joined(pb.expires, expires, "; ");
  pb.on = stamp;
  ef.post_build = pb;
  return pb;
};

/** A zone's bytes: gzip level 9 over its JSON. */
export const zoneBytes = (zone) => gzipSync(Buffer.from(JSON.stringify(zone), "utf8"), { level: 9 });

/** Write a zone to disk and hand back the bytes written. */
export const writeZone = (path, zone) => { const body = zoneBytes(zone); writeFileSync(path, body); return body; };
