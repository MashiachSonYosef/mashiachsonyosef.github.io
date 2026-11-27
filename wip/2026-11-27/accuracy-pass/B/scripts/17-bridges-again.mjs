// Make each book's identity bridge again from the served zone (the rows the serve tool wrote: one per verse, with the
// positions it holds), gzip it as the serve tool does, and compare with the sha256 the zone and pins-not-kept record.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const D = `${S}/base/reader/data`, W = `${S}/w39/out/B`;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const notKept = JSON.parse(readFileSync(`${D}/pins-not-kept-v1.json`, "utf8"));
const byName = new Map(notKept.files.map((f) => [f.name, f]));
const gate = JSON.parse(readFileSync(`${D}/serve-gate-receipt-v1.json`, "utf8"));
const out = ["zone\tbridge_file\tsha256_recorded_in_zone\tsha256_in_pins_not_kept\tsha256_made_again_today\tverdict\tnote"];
let same = 0, other = 0, skipped = 0;
for (const slug of gate.served) {
  const z = JSON.parse(gunzipSync(readFileSync(`${D}/zones/${slug}.bin`)).toString("utf8"));
  const walk = (z.emitted_from || {}).walk || {};
  if (!walk.restore_oracle) { skipped += 1; out.push([slug, (walk.identity || {}).bridge || "", (walk.identity || {}).bridge_sha256 || "", "", "", "NOT TRIED", "not a book of the restore route"].join("\t")); continue; }
  const work = (String((z.work_receipts || {}).b_n || "").match(/work_id=(\S+)/u) || [])[1];
  const lines = ["work_id,unit_id,c0_rows,min_c0_numeric_id,max_c0_numeric_id,b_id,n_id"];
  let at = 0;
  for (const sec of z.sections) { const n = sec.words.length; lines.push(`${work},${sec.unit},${n},${at + 1},${at + n},B-MAM-RESTORE-V5,N-POSITIONAL-PROTOTYPE`); at += n; }
  const csv = Buffer.from(lines.join("\n") + "\n", "utf8");
  const gz = gzipSync(csv);
  const tries = [["as gzipped here", gz]];
  for (const os of [0, 3, 10, 11, 255]) { const g = Buffer.from(gz); g[9] = os; tries.push([`gzip header's system byte set to ${os}`, g]); }
  const want = walk.identity.bridge_sha256;
  const hit = tries.find(([, g]) => sha(g) === want);
  const nk = byName.get(walk.identity.bridge);
  if (hit) same += 1; else other += 1;
  out.push([slug, walk.identity.bridge, want, nk ? nk.sha256 : "(not listed)", hit ? sha(hit[1]) : sha(gz), hit ? "MADE AGAIN, SAME BYTES" : "NOT THE SAME BYTES", hit ? hit[0] : `csv sha256 ${sha(csv)}`].join("\t"));
}
writeFileSync(`${W}/data/bridges-made-again.tsv`, out.join("\n") + "\n");
console.log({ same, other, skipped });
console.log(out.slice(1, 4).join("\n"));
