#!/usr/bin/env node
// Synthesis lane · toggle-push-rule-v1-the-driver-proposes-and-prints-and-never-chooses
// LEDGER: -
// no frame letter. This writes nothing into data/: it reads the queue
// (data/toggle-queue-v1.json), the lane state (data/lane-state-v1.json), the
// records the queue points at and the zones on the shelf, and prints what the
// next command is. --fetch writes a delivery under build/ledgers/, which is
// scratch the next stage reads and never a record.
//
// THE TOGGLE PUSH SUITE, DRIVEN. A toggle is a ledger of Moses's, projected
// over a zone's own positions, re-glossed, re-pinned, drawn on the rail and
// ruled on by the owner (tools/TOGGLE-PIPELINE-v1.md, the six steps). This
// walks the queue the lane typed in the open against the receipts the zones
// already carry, and says, per toggle: which zones carry it, which do not,
// what it needs from R2, and the commands in order. It proposes and prints.
// It never projects, never re-glosses, never pins, never opens zone.html,
// never picks a default position and never records a ruling — a ruling is
// the owner's, written as a dated record. Every fact printed is read off a
// receipt, off a record the queue names, or off the queue, and the queue
// says where each of its values was read. The queue's own rule id is a
// constant here as well, so the manifest (which reads tools/ and never
// data/) sees it, and the queue is faulted when its rule line differs.
//
//   (default)      the plan: the queue against the shelf, as a checklist;
//                  per toggle and per zone that carries it, the receipt's
//                  verses_held, verses_absent_from_* and held_examples
//   --inventory    FIRST look for Moses's index of every ledger delivered —
//                  the ledger of ledgers — at the ledgers root, under the
//                  plain names the queue types, matched case-insensitively
//                  against the listing; fetch it to build/ledgers/ and print
//                  it when it is there, say so in one line when it is not;
//                  THEN list the R2 prefixes the queue names and diff the
//                  listing against the queue, so a delivery the queue does
//                  not know is printed and nothing is quietly skipped. A
//                  listing folder is tested against the roots before the
//                  entries, and an entry matches only when the folder is its
//                  prefix or sits under it
//   --fetch <id>   download that delivery into build/ledgers/<id>.incoming/
//                  and rename it into build/ledgers/<id>/ only once it holds
//                  to its SHA256SUMS; a refused delivery is deleted with its
//                  incoming directory, so nothing refused is ever at the path
//                  the next stage reads. Without a sums file every object is
//                  held to its listed size and renamed into place with every
//                  sha256 printed for the projector's own pin. An entry whose
//                  status is proposed or whose objects list is empty is
//                  refused by name, with its stop line
//
// R2 is reached the one way this tree already reaches it: the four env vars
// and the SigV4 GET of tools/restore-shelf-from-history-v1.mjs, copied here,
// plus a ListObjectsV2 GET signed the same way — the one call that tool does
// not make. The keys are read, never printed. R2_ENDPOINT is
// https://<account-id>.r2.cloudflarestorage.com, set in the cloud
// environment's settings and never pasted into a chat. Without all four,
// --inventory and --fetch say so and stop; the default mode needs none.
//
// Run: node tools/push-toggles-v1.mjs [--stamp YYYY-MM-DD] [--queue data/toggle-queue-v1.json]
//        [--zones data/zones] [--lane-state data/lane-state-v1.json]
//      node tools/push-toggles-v1.mjs --inventory [--prefix <r2 prefix>]
//      node tools/push-toggles-v1.mjs --fetch <queue id | r2 prefix | r2 object> [--jobs 4] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, renameSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk, zonesServed, SERVE_GATE_RECEIPT } from "./zones-on-disk-v1.mjs";

export const PUSH_RULE_ID = "toggle-push-rule-v1-the-driver-proposes-and-prints-and-never-chooses";
// the queue's rule, declared here as well: the manifest emitter scans tools/,
// zone.html and build.sh and never data/, so a rule typed only in the queue
// is a rule the pipeline cannot see
export const QUEUE_RULE_ID = "toggle-queue-rule-v1-a-delivery-is-named-in-the-open-until-a-receipt-can-name-it";
export const QUEUE_SCHEMA = "TOGGLE_QUEUE_V1";
export const QUEUE_BASIS = "TYPED_IN_THE_OPEN";
export const STATUSES = Object.freeze(["served", "candidate", "proposed", "waiting"]);
export const CARRIED_KINDS = Object.freeze(["zone_field", "sidecar", "sidecar_field", "store_file", "record", "none"]);
const REQUIRED = ["id", "feeds", "r2_prefix", "delivery_shape", "projection_tool", "status", "waits_on", "ruling_owed", "carried_by", "next", "stop"];
const KEYS_SAY = "R2_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID, the secret likewise, R2_ENDPOINT, R2_BUCKET";
const ENDPOINT_SAY = "R2_ENDPOINT is https://<account-id>.r2.cloudflarestorage.com, set in the cloud environment's settings and never pasted into a chat";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(`--${n}`);
const rel = (p) => relative(K3, p) || ".";
const sha = (b) => createHash("sha256").update(b).digest("hex");
// a dotted path into a record; a segment written name[key=value] picks the
// element of an array whose key equals value, so a ruling can be read off
// the rulings list by its id rather than by a position that may move
const at = (o, path) => String(path).split(".").reduce((x, k) => {
  if (x == null) return undefined;
  const m = k.match(/^([^[]+)\[([^=\]]+)=([^\]]*)\]$/);
  if (!m) return x[k];
  const list = x[m[1]];
  return Array.isArray(list) ? list.find((e) => e && String(e[m[2]]) === m[3]) : undefined;
}, o);
const readBin = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
const die = (code, msg) => { console.error(msg); process.exit(code); };
const few = (list, n = 8) => (list.length > n ? `${list.slice(0, n).join(", ")} … and ${list.length - n} more` : list.join(", "));
const mb = (objects) => `${(objects.reduce((n, o) => n + o.size, 0) / 1e6).toFixed(1)} MB`;
const clip = (s, n = 220) => { const t = String(s).replace(/\s+/g, " "); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
// the placeholders the queue writes; anything else in angle brackets is the
// running session's to fill (<name>, <folder>, <file>) and stays as written
const fill = (s, m) => String(s).replace(/<(slug|stamp|id)>/g, (w, k) => (m[k] == null ? w : m[k]));

const QUEUE = join(K3, arg("queue", "data/toggle-queue-v1.json"));
const ZONES = join(K3, arg("zones", "data/zones"));
const LANE = join(K3, arg("lane-state", "data/lane-state-v1.json"));
const STAMP = arg("stamp", null);
const JOBS = Math.max(1, Number(arg("jobs", "4")) || 1);
const DRY = has("dry");

// ---- the queue, held to its own schema before a line of it is trusted ----
export const faultsOf = (q) => {
  const faults = [];
  if (!q || typeof q !== "object") return ["not an object"];
  if (q.schema_version !== QUEUE_SCHEMA) faults.push(`schema_version is ${q.schema_version}, not ${QUEUE_SCHEMA}`);
  if (q.rule !== QUEUE_RULE_ID) faults.push(`rule is ${q.rule}, not ${QUEUE_RULE_ID}`);
  if (q.basis !== QUEUE_BASIS) faults.push(`basis is ${q.basis}, not ${QUEUE_BASIS}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(q.recorded_on))) faults.push("recorded_on is not YYYY-MM-DD");
  if (typeof q.runbook !== "string" || !q.runbook) faults.push("runbook must name the runbook file");
  if (!Array.isArray(q.deploy_tail) || !q.deploy_tail.length) faults.push("deploy_tail is not a non-empty array");
  if (!q.r2 || typeof q.r2.ledgers_root !== "string" || typeof q.r2.toggle_builds_root !== "string") faults.push("r2.ledgers_root and r2.toggle_builds_root must be strings");
  const lol = q.r2 && q.r2.ledger_of_ledgers;
  if (!lol || !Array.isArray(lol.names) || !lol.names.length || !Array.isArray(lol.extensions) || !lol.extensions.length) faults.push("r2.ledger_of_ledgers must carry names[] and extensions[]");
  if (!q.staging || typeof q.staging.dir !== "string" || !q.staging.dir.includes("<id>")) faults.push("staging.dir must name <id>");
  if (!Array.isArray(q.entries) || !q.entries.length) { faults.push("entries is not a non-empty array"); return faults; }
  const ids = new Set();
  let templates = 0;
  for (const e of q.entries) {
    const who = e && e.id ? e.id : "?";
    for (const f of REQUIRED) if (!e || !(f in e)) faults.push(`entry ${who}: missing ${f}`);
    if (!e) continue;
    if (ids.has(e.id)) faults.push(`entry ${who}: duplicate id`);
    ids.add(e.id);
    if (e.is_template) templates += 1;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(e.id))) faults.push(`entry ${who}: id is not lowercase kebab-case`);
    if (!STATUSES.includes(e.status)) faults.push(`entry ${who}: status ${e.status} is not one of ${STATUSES.join("/")}`);
    if (!Array.isArray(e.feeds)) faults.push(`entry ${who}: feeds is not an array`);
    if (typeof e.ruling_owed !== "boolean") faults.push(`entry ${who}: ruling_owed is not true/false`);
    if (typeof e.r2_prefix !== "string" || !(e.r2_prefix === "unknown" || e.r2_prefix.endsWith("/"))) faults.push(`entry ${who}: r2_prefix is neither 'unknown' nor a prefix ending in /`);
    if (!e.carried_by || !CARRIED_KINDS.includes(e.carried_by.kind)) faults.push(`entry ${who}: carried_by.kind is not one of ${CARRIED_KINDS.join("/")}`);
    else if (["zone_field", "sidecar_field", "store_file", "record"].includes(e.carried_by.kind) && typeof e.carried_by.path !== "string") faults.push(`entry ${who}: carried_by.path missing`);
    else if (["sidecar", "sidecar_field"].includes(e.carried_by.kind) && !/^\.[a-z]+\.bin$/.test(String(e.carried_by.suffix))) faults.push(`entry ${who}: carried_by.suffix is not .<kind>.bin`);
    if (!Array.isArray(e.next)) faults.push(`entry ${who}: next is not an array`);
    if (e.objects !== undefined && !Array.isArray(e.objects)) faults.push(`entry ${who}: objects is not an array`);
    if (e.record_pins !== undefined && !(Array.isArray(e.record_pins) && e.record_pins.every((r) => r && typeof r.file === "string" && Array.isArray(r.paths)))) faults.push(`entry ${who}: record_pins is not a list of { file, paths }`);
  }
  if (templates !== 1) faults.push(`exactly one entry is the template (is_template); found ${templates}`);
  return faults;
};
const loadQueue = () => {
  if (!existsSync(QUEUE)) die(1, `MALFORMED_QUEUE: no queue at ${rel(QUEUE)}`);
  let q;
  try { q = JSON.parse(readFileSync(QUEUE, "utf8")); } catch (e) { die(1, `MALFORMED_QUEUE: ${rel(QUEUE)} is not JSON — ${e.message}`); }
  const faults = faultsOf(q);
  if (faults.length) die(1, `MALFORMED_QUEUE: ${faults.join(" · ")}`);
  return q;
};
const templateOf = (q) => q.entries.find((e) => e.is_template);
const stagingDir = (q, id) => join(K3, fill(q.staging.dir, { id })).replace(/\/$/, "");
// the folder every delivery lands in, read off the staging pattern: what
// stands before <id>
const ledgersDir = (q) => join(K3, q.staging.dir.split("<id>")[0]);
const loadLane = () => (existsSync(LANE) ? readJson(LANE) : null);
// what --fetch may fetch: not the template, not a proposed entry, not an
// entry that names no object — those are refused by name with the stop line
const fetchable = (e) => !e.is_template && e.status !== "proposed" && (e.objects || []).length > 0;

// ---- the shelf, asked of the directory ------------------------------------
const census = () => {
  if (!existsSync(ZONES)) die(1, `NO_ZONE_DIRECTORY: ${rel(ZONES)} is not here; nothing to measure a toggle against`);
  const onDisk = zonesOnDisk(ZONES), served = new Set(zonesServed(ZONES));
  const zones = new Map(), unreadable = [];
  for (const slug of onDisk) { try { zones.set(slug, readBin(join(ZONES, `${slug}.bin`))); } catch { unreadable.push(slug); } }
  const sidecars = new Map();
  const sidecar = (slug, suffix) => {
    const k = `${slug}${suffix}`;
    if (!sidecars.has(k)) {
      const p = join(ZONES, k);
      let v = null;
      if (existsSync(p)) { try { v = readBin(p); } catch { v = null; } }
      sidecars.set(k, v);
    }
    return sidecars.get(k);
  };
  const carries = (e, slug) => {
    const c = e.carried_by;
    if (c.kind === "zone_field") return !!at(zones.get(slug), c.path);
    if (c.kind === "sidecar") return existsSync(join(ZONES, `${slug}${c.suffix}`));
    if (c.kind === "sidecar_field") return !!at(sidecar(slug, c.suffix), c.path);
    if (c.kind === "store_file" || c.kind === "record") return existsSync(join(K3, c.path));
    return false;
  };
  return { onDisk, served, zones, unreadable, carries };
};

// ---- the plan: the queue against the shelf --------------------------------
const plan = (q) => {
  const S = census();
  const lane = loadLane();
  const stamp = STAMP || "YYYY-MM-DD";
  const bucketSaid = q.r2.bucket_as_the_sources_name_it;
  console.log(PUSH_RULE_ID);
  console.log();
  console.log(`— the queue · ${rel(QUEUE)} · rule ${q.rule} · recorded ${q.recorded_on} · ${q.entries.length} entries · basis ${q.basis} · runbook ${q.runbook} —`);
  console.log(`— the shelf · ${rel(ZONES)} · ${S.onDisk.length} zones on disk · ${S.served.size} served by data/${SERVE_GATE_RECEIPT}${S.unreadable.length ? ` · ${S.unreadable.length} unreadable: ${few(S.unreadable, 4)}` : ""} —`);
  if (lane) {
    const sh = lane.shelf || {}, sc = sh.sidecars || {};
    console.log(`— the lane state · ${rel(LANE)} · built ${lane.built_at} · ${sh.zones_served} served of ${sh.zones_on_disk} on disk · lattice on ${(sc.lattice || {}).on_served_books} served books · volume on ${(sc.volume || {}).on_served_books} · store ${(lane.store || {}).version} —`);
    if (sh.zones_on_disk !== S.onDisk.length) console.log(`  note: the lane state counts ${sh.zones_on_disk} zones on disk and the directory holds ${S.onDisk.length}; the state is what the last build saw (built_at above), the directory is now — the shelf restore of the runbook's section 2 is what closes that gap, and every re-pin waits on it`);
  } else console.log(`— the lane state · ${rel(LANE)} is not here or not JSON; the shelf speaks for itself —`);
  console.log(`— stamp · ${stamp}${STAMP ? "" : " (pass --stamp YYYY-MM-DD: the day a projection is made is given, never read off the clock)"} —`);
  // the four variables the R2 step needs, by name and presence only; a value
  // is never printed. All four or the inventory and the fetch skip by name.
  const env = process.env;
  const four = [
    ["key", !!(env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID)],
    ["secret", !!(env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY)],
    ["R2_ENDPOINT", !!env.R2_ENDPOINT],
    ["R2_BUCKET", !!env.R2_BUCKET],
  ];
  const bucketNote = env.R2_BUCKET ? (env.R2_BUCKET === bucketSaid ? " (R2_BUCKET names it)" : " (R2_BUCKET names a different bucket)") : "";
  console.log(`— bucket · ${bucketSaid} as the sources name it${bucketNote} · R2 env: ${four.map(([n, ok]) => `${n} ${ok ? "set" : "ABSENT"}`).join(", ")} — ${four.every(([, ok]) => ok) ? "--inventory and --fetch can run" : "--inventory and --fetch will skip until all four are set"} —`);
  if (!env.R2_ENDPOINT) console.log(`  ${ENDPOINT_SAY}`);

  q.entries.forEach((e, i) => {
    const c = e.carried_by;
    const perZone = ["zone_field", "sidecar", "sidecar_field"].includes(c.kind);
    const carriers = c.kind === "none" || e.is_template ? [] : S.onDisk.filter((s) => S.carries(e, s));
    const lacking = c.kind === "none" || e.is_template ? [] : S.onDisk.filter((s) => !carriers.includes(s));
    console.log();
    console.log(`${i + 1} · ${e.id} · ${e.status}${e.is_template ? " · template" : ""} · feeds: ${e.feeds.length ? e.feeds.join(", ") : "no rail row"}${e.feeds_note ? ` (${e.feeds_note})` : ""}`);
    console.log(`    what: ${e.what}`);
    console.log(`    r2: ${e.r2_prefix}${e.r2_prefix_note ? ` — ${e.r2_prefix_note}` : ""}`);
    console.log(`    shape: ${e.delivery_shape}`);
    console.log(`    tool: ${e.projection_tool}${e.projection_scope ? ` — ${e.projection_scope}` : ""}`);
    if (e.landed) console.log(`    landed: ${e.landed}`);
    if (e.is_template) console.log(`    carried: not measured — a template; the folder --inventory finds gets its own entry, carried by ${c.path}`);
    else if (c.kind === "none") console.log(`    carried: by no zone — ${c.why}`);
    else if (!perZone) console.log(`    carried: ${carriers.length ? "yes" : "NO"} — ${c.path} ${carriers.length ? "is" : "is not"} on disk, one file for every zone`);
    else {
      const how = c.kind === "zone_field" ? c.path : c.kind === "sidecar" ? `<slug>${c.suffix}` : `<slug>${c.suffix} ${c.path}`;
      console.log(`    carried: ${carriers.length} of ${S.onDisk.length} zones on disk (${carriers.filter((s) => S.served.has(s)).length} of ${S.served.size} served) — ${how}`);
      console.log(`    not carried: ${lacking.length ? few(lacking) : "none"}`);
    }
    for (const f of e.receipt_pins || []) {
      for (const [slug, z] of S.zones) {
        const v = at(z, f);
        if (v === undefined) continue;
        console.log(`    receipt: ${f} = ${clip(JSON.stringify(v), 170)}  (read off ${slug}.bin)`);
        break;
      }
    }
    // the record pins: a date, a size or a count the queue could have typed
    // is read off the record it names instead, and printed with its source
    for (const rp of e.record_pins || []) {
      const rec = readJson(join(K3, rp.file));
      if (!rec) { console.log(`    record: ${rp.file} is not here or not JSON`); continue; }
      for (const f of rp.paths) { const v = at(rec, f); console.log(`    record: ${f} = ${v === undefined ? "(absent)" : clip(JSON.stringify(v), 170)}  (read off ${rp.file})`); }
    }
    // the held verses, per zone the toggle touched: a verse that did not
    // prove is held whole and counted on the receipt, and here it is read
    // off that receipt and printed — never patched, never re-run for
    if (c.kind === "zone_field" && carriers.length) {
      for (const slug of carriers) {
        const cnt = at(S.zones.get(slug), `${c.path}.counts`);
        if (!cnt || typeof cnt !== "object") continue;
        const absent = Object.keys(cnt).filter((k) => k.startsWith("verses_absent_from"));
        if (cnt.verses_held === undefined && !absent.length && cnt.held_examples === undefined) continue;
        const parts = [];
        if (cnt.verses_held !== undefined) parts.push(`verses_held ${cnt.verses_held}`);
        for (const k of absent) parts.push(`${k} ${cnt[k]}`);
        const ex = Array.isArray(cnt.held_examples) && cnt.held_examples.length ? ` · held_examples: ${clip(cnt.held_examples.join(" | "), 200)}` : "";
        console.log(`    held: ${slug} · ${parts.join(" · ")}${ex}`);
      }
    }
    const objs = e.objects || [];
    if (!objs.length) console.log(`    objects: none to fetch${e.is_template || e.status === "proposed" ? "" : " — --fetch refuses this entry by name"}`);
    else if (perZone && lacking.length && objs.some((o) => o.includes("<slug>"))) console.log(`    objects: for each of ${few(lacking, 4)}: ${objs.join(", ")}`);
    else console.log(`    objects: ${objs.join(", ")}${perZone && !lacking.length ? " (every zone carries the layer; the names are for a zone rebuilt after today)" : ""}`);
    if (e.objects_note) console.log(`    objects note: ${e.objects_note}`);
    const rf = String(e.ruling_receipt_field);
    let said = null;
    if (!/\s/.test(rf)) for (const [slug, z] of S.zones) { const v = at(z, rf); if (v !== undefined) { said = `${clip(v, 200)} (read off ${slug}.bin)`; break; } }
    console.log(`    ruling owed: ${e.ruling_owed ? "YES" : "no"} — ${e.ruling_what}`);
    console.log(`    ruling field: ${rf}${said ? ` — says: ${said}` : ""}`);
    console.log(`    waits on: ${e.waits_on}`);
    const next = (e.next || []).map((s) => fill(s, { stamp, id: e.id }));
    if (next.length) {
      console.log(`    next, in order${lacking.length ? ` (per zone, for each of: ${few(lacking, 6)})` : ""}:`);
      next.forEach((s, k) => console.log(`      [ ] ${k + 1}. ${s}`));
    } else console.log(`    next: nothing to run`);
    if ((e.guards || []).length) { console.log(`    guards:`); for (const g of e.guards) console.log(`      [ ] ${g}`); }
    console.log(`    stop: ${e.stop}`);
  });

  console.log();
  console.log(`— the loop every toggle walks (printed here, never run here) —`);
  (q.loop || []).forEach((s, k) => console.log(`  [ ] ${k + 1}. ${fill(s, { stamp })}`));
  console.log();
  console.log(`— never —`);
  for (const s of q.never || []) console.log(`  · ${s}`);
  if ((q.owed_behind_live_rows_not_queued || []).length) {
    console.log();
    console.log(`— owed behind live rows, not queued: nothing to fetch or project, the owner's —`);
    for (const o of q.owed_behind_live_rows_not_queued) console.log(`  · ${o.row}: ${o.what}`);
  }
  console.log();
  console.log(`— then the deploy tail, as the runbook (${q.runbook}) orders it —`);
  q.deploy_tail.forEach((s, k) => console.log(`  [ ] ${k + 1}. ${fill(s, { stamp })}`));
  if (q.report) { console.log(); console.log(`— the report · ${fill(q.report, { stamp })} —`); }
  return 0;
};

// ---- R2, the one way this tree reaches it ---------------------------------
// The signing below is tools/restore-shelf-from-history-v1.mjs's GET with a
// canonical query string added, which is what a list needs and a GET of one
// object does not. Region auto, service s3, path-style, unsigned payload.
const r2 = () => {
  const env = process.env;
  const KEY = env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
  const ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
  if (!(KEY && SECRET && ENDPOINT && BUCKET)) return null;
  const host = new URL(ENDPOINT).host;
  const hmac = (k, s) => createHmac("sha256", k).update(s).digest();
  const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const signedGet = async (key, query = {}) => {
    const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const day = now.slice(0, 8);
    const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
    const qs = Object.keys(query).sort().map((k) => `${enc(k)}=${enc(query[k])}`).join("&");
    const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now };
    const signed = Object.keys(headers).sort();
    const canon = ["GET", path, qs, ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
    const scope = `${day}/auto/s3/aws4_request`;
    const toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
    const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
    const sig = createHmac("sha256", kSign).update(toSign).digest("hex");
    return fetch(`https://${host}${path}${qs ? `?${qs}` : ""}`, { headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${sig}` } });
  };
  const get = async (key) => { const res = await signedGet(key); return res.ok ? Buffer.from(await res.arrayBuffer()) : null; };
  const unxml = (s) => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, "&");
  // ListObjectsV2: GET /<bucket>/?list-type=2&prefix=<prefix>, paged by the
  // continuation token; the XML is read for Key and Size and nothing else
  const list = async (prefix) => {
    const out = [];
    let token = null;
    for (;;) {
      const query = { "list-type": "2", prefix };
      if (token) query["continuation-token"] = token;
      const res = await signedGet("", query);
      if (!res.ok) throw new Error(`HTTP ${res.status} listing ${prefix}`);
      const xml = await res.text();
      for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
        const key = unxml((m[1].match(/<Key>([\s\S]*?)<\/Key>/) || [])[1] || "");
        const size = Number((m[1].match(/<Size>(\d+)<\/Size>/) || [])[1] || 0);
        if (key) out.push({ key, size });
      }
      const more = /<IsTruncated>true<\/IsTruncated>/.test(xml);
      token = more ? unxml((xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1] || "") : null;
      if (!more || !token) break;
    }
    return out;
  };
  return { bucket: BUCKET, get, list };
};

// ---- the ledger of ledgers: Moses's index, sought before the listing -------
// The owner says Moses keeps an index of every ledger delivered. Nothing in
// this tree has read it, so its name is tried: every plain name the queue
// types with every extension it types, matched case-insensitively against
// the objects that sit directly under the ledgers root. Found, it is fetched
// to the ledgers folder under build/, held to its listed size, and printed
// before the listing; absent, one line says so and the listing follows.
const ledgerOfLedgers = async (q, r, objects) => {
  const lol = q.r2.ledger_of_ledgers;
  const root = q.r2.ledgers_root;
  // its key is known since 2026-10-02 (the bucket root); fetched directly first
  if (lol.key) {
    const b = await r.get(lol.key).catch(() => null);
    if (b && b.length) {
      const landing = ledgersDir(q); mkdirSync(landing, { recursive: true });
      const p = join(landing, lol.key.split("/").pop()); writeFileSync(p, b);
      console.log();
      console.log(`— the ledger of ledgers · ${lol.key} · ${b.length} bytes → ${rel(p)} · printed here, before the listing —`);
      const lines = b.toString("utf8").replace(/\n$/, "").split("\n");
      for (const line of lines.slice(0, 400)) console.log(`  ${line}`);
      if (lines.length > 400) console.log(`  … and ${lines.length - 400} more line(s), in ${rel(p)}`);
      return;
    }
    console.log(`— the ledger of ledgers · ${lol.key} did not answer; trying the names under ${root} —`);
  }
  const wanted = new Set(lol.names.flatMap((n) => lol.extensions.map((x) => `${n}${x}`.toLowerCase())));
  const hits = objects.filter((o) => o.key.startsWith(root) && !o.key.slice(root.length).includes("/") && wanted.has(o.key.slice(root.length).toLowerCase()));
  console.log();
  if (!hits.length) {
    console.log(`— the ledger of ledgers · absent: none of ${lol.names.join(" / ")} with ${lol.extensions.join(" ")} sits directly under ${root} (matched case-insensitively against the listing); falling back to the listing —`);
    return;
  }
  const landing = ledgersDir(q);
  mkdirSync(landing, { recursive: true });
  for (const o of hits) {
    const name = o.key.slice(root.length);
    const b = await r.get(o.key).catch(() => null);
    if (!b || b.length !== o.size) { console.log(`— the ledger of ledgers · ${o.key}: ${b ? `${b.length} bytes arrived, the listing says ${o.size}` : "the object did not arrive"}; not written —`); continue; }
    const p = join(landing, name);
    writeFileSync(p, b);
    console.log(`— the ledger of ledgers · ${o.key} · ${o.size} bytes → ${rel(p)} · printed here, before the listing —`);
    const lines = b.toString("utf8").replace(/\n$/, "").split("\n");
    const cap = 400;
    for (const line of lines.slice(0, cap)) console.log(`  ${line}`);
    if (lines.length > cap) console.log(`  … and ${lines.length - cap} more line(s), in ${rel(p)}`);
  }
};

// ---- the inventory: the listing against the queue --------------------------
const inventory = async (q) => {
  const r = r2();
  if (!r) { console.log(`R2 inventory: skipped — no R2 keys in this environment (${KEYS_SAY}; ${ENDPOINT_SAY})`); return 0; }
  const ledgersRoot = q.r2.ledgers_root, buildsRoot = q.r2.toggle_builds_root;
  const root = arg("prefix", ledgersRoot);
  const roots = [root];
  for (const e of q.entries) if (e.r2_prefix !== "unknown" && !roots.some((p) => e.r2_prefix.startsWith(p))) roots.push(e.r2_prefix);
  const template = templateOf(q);
  const notToggles = q.r2.known_prefixes_that_are_not_toggles || [];
  const seek = [...q.entries.filter((e) => e.r2_prefix === "unknown"), ...(q.owed_behind_live_rows_not_queued || [])]
    .flatMap((e) => (e.objects || []).map((name) => ({ who: e.id || e.row, name })));
  console.log(PUSH_RULE_ID);
  console.log();
  console.log(`— R2 inventory · bucket from R2_BUCKET${r.bucket === q.r2.bucket_as_the_sources_name_it ? "" : ` (not the name the sources write, ${q.r2.bucket_as_the_sources_name_it})`} · ${roots.length} prefix(es) · queue recorded ${q.recorded_on} —`);
  // each prefix is listed once; the ledgers root is listed first whatever
  // --prefix says, because the index is sought there before anything else
  const listed = new Map();
  const listing = async (prefix) => {
    if (!listed.has(prefix)) { try { listed.set(prefix, (await r.list(prefix)).filter((o) => !o.key.endsWith("/"))); } catch (e) { die(1, `R2_LIST_FAILED ${prefix}: ${e.message}`); } }
    return listed.get(prefix);
  };
  await ledgerOfLedgers(q, r, await listing(ledgersRoot));
  let unknown = 0;
  for (const prefix of roots) {
    const objects = await listing(prefix);
    console.log();
    console.log(`— ${prefix} · ${objects.length} objects · ${mb(objects)} —`);
    const groups = new Map();
    for (const o of objects) {
      const base = o.key.startsWith(buildsRoot) ? buildsRoot : prefix;
      const rest = o.key.slice(base.length);
      const folder = rest.includes("/") ? `${base}${rest.split("/")[0]}/` : base;
      if (!groups.has(folder)) groups.set(folder, []);
      groups.get(folder).push(o);
    }
    for (const [folder, objs] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
      const names = objs.map((o) => o.key.slice(folder.length));
      let verdict;
      // the roots first: an object sitting at a root is the root's, not the
      // property of whichever entry lives beneath it
      if (folder === ledgersRoot || folder === buildsRoot) verdict = `→ the root itself: ${few(names, 6)}`;
      else {
        // an entry claims a folder only when the folder IS its prefix or sits
        // under it; never the other way round
        const entries = q.entries.filter((e) => !e.is_template && e.r2_prefix !== "unknown" && (folder === e.r2_prefix || folder.startsWith(e.r2_prefix)));
        const not = notToggles.find((p) => folder === p.prefix || folder.startsWith(p.prefix) || p.prefix.startsWith(folder));
        if (entries.length) verdict = `→ ${entries.map((e) => `${e.id} (${e.status})`).join(", ")}`;
        else if (not) verdict = `→ not a toggle: ${not.what}`;
        else if (folder === prefix) verdict = `→ the listed prefix itself: ${few(names, 6)}`;
        else { unknown += 1; verdict = `→ UNKNOWN to the queue${folder.startsWith(buildsRoot) ? `: a toggle Moses counted — the generic recipe (entry ${template.id})` : ""} · objects: ${few(names, 8)}`; }
      }
      console.log(`  ${String(objs.length).padStart(5)} obj  ${mb(objs).padStart(9)}  ${folder}  ${verdict}`);
    }
    if (buildsRoot.startsWith(prefix)) {
      const readmeKey = `${buildsRoot}${q.r2.readme_at_toggle_builds_root}`;
      const readme = objects.find((o) => o.key === readmeKey);
      console.log(`  ${readmeKey}: ${readme ? `present, ${readme.size} bytes — ${q.r2.readme_says}` : "ABSENT — the per-toggle rulings owed are not on R2 under that name"}`);
    }
    for (const e of q.entries)
      if (!e.is_template && e.r2_prefix !== "unknown" && e.r2_prefix.startsWith(prefix) && !objects.some((o) => o.key.startsWith(e.r2_prefix)))
        console.log(`  nothing under ${e.r2_prefix} → ${e.id} (${e.status}): ${e.status === "proposed" ? "never delivered, as the queue says" : "the delivery is not where the queue says"}`);
    for (const { who, name } of seek) {
      const re = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/<slug>/g, "[^/]+")}$`);
      const hits = objects.filter((o) => re.test(o.key.split("/").pop()));
      if (hits.length) console.log(`  ${who}: ${name} found ${hits.length}× under ${[...new Set(hits.map((o) => o.key.slice(0, o.key.lastIndexOf("/") + 1)))].join(", ")}`);
      else if (prefix === root) console.log(`  ${who}: ${name} not found under ${prefix}`);
    }
  }
  console.log();
  console.log(unknown ? `${unknown} delivery folder(s) the queue does not know: add each to ${rel(QUEUE)}, typed in the open, before fetching it (the runbook's generic recipe, entry ${template.id})` : "every folder listed is known to the queue");
  return 0;
};

// ---- the fetch: one delivery into build/ledgers/<id>/, held to its sums ----
const fetchDelivery = async (q, what) => {
  const r = r2();
  if (!r) { console.log(`R2 fetch: skipped — no R2 keys in this environment (${KEYS_SAY}; ${ENDPOINT_SAY})`); return 0; }
  const refuse = (e) => {
    const shares = q.entries.find((x) => x !== e && !x.is_template && x.r2_prefix === e.r2_prefix && fetchable(x));
    die(1, `REFUSED_BY_THE_QUEUE: ${e.id} is ${e.status}${(e.objects || []).length ? "" : " and names no object to fetch"}${shares ? ` — its prefix is ${shares.id}'s (${shares.status}); --fetch ${shares.id} is where a projector reads` : ""} · stop: ${e.stop}`);
  };
  let entry = q.entries.find((e) => e.id === what);
  let prefix, id;
  if (entry) {
    if (entry.is_template) die(2, `${what} is the template entry: its folder gets an entry of its own in ${rel(QUEUE)} first, then --fetch <that id>`);
    if (entry.r2_prefix === "unknown") die(1, `NO_PREFIX: the queue names no R2 prefix for ${what}; run --inventory, which searches the listing for its object names`);
    if (!fetchable(entry)) refuse(entry);
    prefix = entry.r2_prefix; id = entry.id;
  } else {
    if (what.includes("/")) { prefix = what; id = what.replace(/\/$/, "").split("/").pop(); }
    else { prefix = `${q.r2.toggle_builds_root}${what}/`; id = what; }
    // a prefix the queue already names belongs to its entry, whose stop line
    // holds whether the entry was named or its prefix was
    const sharing = q.entries.filter((e) => !e.is_template && e.r2_prefix === prefix);
    if (sharing.length) { entry = sharing.find(fetchable) || sharing[0]; if (!fetchable(entry)) refuse(entry); id = entry.id; }
  }
  let listedObjects;
  try { listedObjects = (await r.list(prefix)).filter((o) => !o.key.endsWith("/")); } catch (e) { die(1, `R2_LIST_FAILED ${prefix}: ${e.message}`); }
  // one object named outright lands under its own folder's name
  const single = !prefix.endsWith("/") ? listedObjects.find((o) => o.key === prefix) : null;
  let objects;
  if (single) { objects = [single]; id = prefix.split("/").slice(-2, -1)[0] || id; }
  else { if (!prefix.endsWith("/")) prefix = `${prefix}/`; objects = listedObjects.filter((o) => o.key.startsWith(prefix)); }
  if (!objects.length) die(1, `NOTHING_UNDER ${prefix}: R2 lists no object there`);
  const dir = stagingDir(q, id);
  const incoming = `${dir}.incoming`;
  const relOf = (key) => (single ? key.split("/").pop() : key.slice(prefix.length));
  for (const o of objects) if (relOf(o.key).split("/").includes("..")) die(1, `REFUSED: ${o.key} names a parent directory`);
  console.log(PUSH_RULE_ID);
  console.log();
  console.log(`— fetch ${id} · ${single ? "object" : "prefix"} ${prefix} · ${objects.length} object(s) · ${mb(objects)} → ${rel(incoming)}/, then ${rel(dir)}/ once it holds —`);
  if (DRY) { for (const o of objects) console.log(`  ${String(o.size).padStart(11)}  ${relOf(o.key)}`); console.log("DRY — nothing written"); return 0; }
  // a refusal deletes the incoming directory whole: nothing refused is ever
  // at the path the next stage reads, and a delivery already standing at
  // that path from an earlier verified fetch is left as it was
  const refuseAll = (why) => {
    rmSync(incoming, { recursive: true, force: true });
    console.log(`REFUSED: ${why} — ${rel(incoming)}/ deleted; nothing landed at ${rel(dir)}/${existsSync(dir) ? ` (what stands there is the earlier fetch, untouched)` : ""}`);
    return 1;
  };
  rmSync(incoming, { recursive: true, force: true });
  mkdirSync(incoming, { recursive: true });
  const measured = new Map();
  let got = 0, wrong = 0;
  const queue = [...objects];
  await Promise.all(Array.from({ length: JOBS }, async () => {
    while (queue.length) {
      const o = queue.shift();
      const name = relOf(o.key);
      const b = await r.get(o.key).catch(() => null);
      // written only when the bytes are the listing's bytes, as the restore
      // writes a bin only when it is its pin
      if (!b || b.length !== o.size) { wrong += 1; console.log(`  REFUSED ${name}: ${b ? `${b.length} bytes arrived, the listing says ${o.size}` : "the object did not arrive"}`); continue; }
      const p = join(incoming, name);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, b);
      measured.set(name, sha(b));
      got += 1;
    }
  }));
  console.log(`  ${got} written exact to the listing · ${wrong} refused`);
  if (wrong) return refuseAll(`${wrong} object(s) did not arrive at their listed size`);
  const names = [...measured.keys()].sort();
  const sums = names.find((n) => /^SHA256SUMS(\.txt)?$/.test(n));
  if (sums) {
    const sumsText = readFileSync(join(incoming, sums), "utf8");
    let listedN = 0, bad = 0, missing = 0;
    for (const line of sumsText.split("\n")) {
      const m = line.match(/^([0-9a-f]{64})\s+\*?(.+?)\s*$/);
      if (!m) continue;
      listedN += 1;
      const name = m[2].replace(/^\.\//, "");
      const p = join(incoming, name);
      if (!existsSync(p)) { missing += 1; console.log(`  MISSING ${name}: listed in ${sums}, not in the delivery`); continue; }
      const have = measured.get(name) || sha(readFileSync(p));
      if (have !== m[1]) { bad += 1; console.log(`  MISMATCH ${name}: ${sums} says ${m[1].slice(0, 12)}…, the bytes say ${have.slice(0, 12)}…`); }
    }
    const unlisted = names.filter((n) => n !== sums && !sumsText.includes(n));
    if (bad || missing) return refuseAll(`${bad} mismatch, ${missing} missing against ${sums}; nothing here is a delivery until the sums and the bytes agree`);
    console.log(`verified: ${listedN} file(s) hold to ${sums}${unlisted.length ? ` · ${unlisted.length} object(s) the sums file does not list: ${few(unlisted, 5)}` : ""}`);
  } else {
    console.log(`UNVERIFIED by a sums file: no SHA256SUMS in this delivery. Every object is its listed size; every sha256, measured here, for the projector's own pin (the runbook names it per toggle):`);
    for (const n of names) console.log(`  ${measured.get(n)}  ${n}`);
  }
  // into place: a verified delivery replaces what stood at the staging path;
  // a single object is moved into the folder that bears its parent's name
  if (single) {
    mkdirSync(dir, { recursive: true });
    for (const n of names) renameSync(join(incoming, n), join(dir, n));
    rmSync(incoming, { recursive: true, force: true });
  } else {
    rmSync(dir, { recursive: true, force: true });
    renameSync(incoming, dir);
  }
  console.log(`landed: ${rel(dir)}/ · ${names.length} file(s)${sums ? ` held to ${sums}` : " held to the listing's sizes; the projector's pin is the verification"}`);
  if (entry && (entry.next || []).length) {
    console.log();
    console.log(`next, in order (the runbook's section for ${entry.id}):`);
    entry.next.forEach((s, k) => console.log(`  [ ] ${k + 1}. ${fill(s, { stamp: STAMP || "YYYY-MM-DD", id: entry.id })}`));
  }
  return 0;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (STAMP !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(STAMP))) die(2, "--stamp must be YYYY-MM-DD");
  const q = loadQueue();
  let code = 0;
  if (has("inventory")) code = await inventory(q);
  else if (has("fetch")) {
    const what = arg("fetch", null);
    if (!what || what.startsWith("--")) die(2, "usage: --fetch <queue id | r2 prefix | r2 object>");
    code = await fetchDelivery(q, what);
  } else code = plan(q);
  process.exit(code);
}
