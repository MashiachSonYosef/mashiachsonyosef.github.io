#!/usr/bin/env node
// Synthesis lane · toggle-push-rule-v1-the-driver-proposes-and-prints-and-never-chooses
// LEDGER: -
// no frame letter. This writes nothing into data/: it reads the queue
// (data/toggle-queue-v1.json), the lane state (data/lane-state-v1.json) and
// the zones on the shelf, and prints what the next command is. --fetch
// writes a delivery under build/ledgers/, which is scratch the next stage
// reads and never a record.
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
// receipt or off the queue, and the queue says where each of its values
// was read.
//
//   (default)      the plan: the queue against the shelf, as a checklist
//   --inventory    list the R2 prefixes the queue names and diff the listing
//                  against the queue, so a delivery the queue does not know
//                  is printed and nothing is quietly skipped
//   --fetch <id>   download that delivery into build/ledgers/<id>/ and hold
//                  it to its SHA256SUMS, refusing on any mismatch; without a
//                  sums file, print every object's sha256 for the projector's
//                  own pin
//
// R2 is reached the one way this tree already reaches it: the four env vars
// and the SigV4 GET of tools/restore-shelf-from-history-v1.mjs, copied here,
// plus a ListObjectsV2 GET signed the same way — the one call that tool does
// not make. The keys are read, never printed. Without them --inventory and
// --fetch say so and stop; the default mode needs none.
//
// Run: node tools/push-toggles-v1.mjs [--stamp YYYY-MM-DD] [--queue data/toggle-queue-v1.json]
//        [--zones data/zones] [--lane-state data/lane-state-v1.json]
//      node tools/push-toggles-v1.mjs --inventory [--prefix <r2 prefix>]
//      node tools/push-toggles-v1.mjs --fetch <queue id | r2 prefix | r2 object> [--jobs 4] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk, zonesServed, SERVE_GATE_RECEIPT } from "./zones-on-disk-v1.mjs";

export const PUSH_RULE_ID = "toggle-push-rule-v1-the-driver-proposes-and-prints-and-never-chooses";
export const QUEUE_SCHEMA = "TOGGLE_QUEUE_V1";
export const QUEUE_BASIS = "TYPED_IN_THE_OPEN";
export const STATUSES = Object.freeze(["served", "candidate", "proposed", "waiting"]);
export const CARRIED_KINDS = Object.freeze(["zone_field", "sidecar", "sidecar_field", "store_file", "record", "none"]);
const REQUIRED = ["id", "feeds", "r2_prefix", "delivery_shape", "projection_tool", "status", "waits_on", "ruling_owed", "carried_by", "next", "stop"];
const KEYS_SAY = "R2_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID, the secret likewise, R2_ENDPOINT, R2_BUCKET";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(`--${n}`);
const rel = (p) => relative(K3, p) || ".";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const at = (o, path) => String(path).split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
const readBin = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
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
  if (q.basis !== QUEUE_BASIS) faults.push(`basis is ${q.basis}, not ${QUEUE_BASIS}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(q.recorded_on))) faults.push("recorded_on is not YYYY-MM-DD");
  if (!q.r2 || typeof q.r2.ledgers_root !== "string" || typeof q.r2.toggle_builds_root !== "string") faults.push("r2.ledgers_root and r2.toggle_builds_root must be strings");
  if (!q.staging || typeof q.staging.dir !== "string" || !q.staging.dir.includes("<id>")) faults.push("staging.dir must name <id>");
  if (!Array.isArray(q.entries) || !q.entries.length) { faults.push("entries is not a non-empty array"); return faults; }
  const ids = new Set();
  for (const e of q.entries) {
    const who = e && e.id ? e.id : "?";
    for (const f of REQUIRED) if (!e || !(f in e)) faults.push(`entry ${who}: missing ${f}`);
    if (!e) continue;
    if (ids.has(e.id)) faults.push(`entry ${who}: duplicate id`);
    ids.add(e.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(e.id))) faults.push(`entry ${who}: id is not lowercase kebab-case`);
    if (!STATUSES.includes(e.status)) faults.push(`entry ${who}: status ${e.status} is not one of ${STATUSES.join("/")}`);
    if (!Array.isArray(e.feeds)) faults.push(`entry ${who}: feeds is not an array`);
    if (typeof e.ruling_owed !== "boolean") faults.push(`entry ${who}: ruling_owed is not true/false`);
    if (typeof e.r2_prefix !== "string" || !(e.r2_prefix === "unknown" || e.r2_prefix.endsWith("/"))) faults.push(`entry ${who}: r2_prefix is neither 'unknown' nor a prefix ending in /`);
    if (!e.carried_by || !CARRIED_KINDS.includes(e.carried_by.kind)) faults.push(`entry ${who}: carried_by.kind is not one of ${CARRIED_KINDS.join("/")}`);
    else if (["zone_field", "sidecar_field", "store_file", "record"].includes(e.carried_by.kind) && typeof e.carried_by.path !== "string") faults.push(`entry ${who}: carried_by.path missing`);
    else if (["sidecar", "sidecar_field"].includes(e.carried_by.kind) && !/^\.[a-z]+\.bin$/.test(String(e.carried_by.suffix))) faults.push(`entry ${who}: carried_by.suffix is not .<kind>.bin`);
    if (!Array.isArray(e.next)) faults.push(`entry ${who}: next is not an array`);
  }
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
const stagingDir = (q, id) => join(K3, fill(q.staging.dir, { id }));
const loadLane = () => { try { return existsSync(LANE) ? JSON.parse(readFileSync(LANE, "utf8")) : null; } catch { return null; } };

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
  console.log(`— the queue · ${rel(QUEUE)} · recorded ${q.recorded_on} · ${q.entries.length} entries · basis ${q.basis} —`);
  console.log(`— the shelf · ${rel(ZONES)} · ${S.onDisk.length} zones on disk · ${S.served.size} served by data/${SERVE_GATE_RECEIPT}${S.unreadable.length ? ` · ${S.unreadable.length} unreadable: ${few(S.unreadable, 4)}` : ""} —`);
  if (lane) {
    const sh = lane.shelf || {}, sc = sh.sidecars || {};
    console.log(`— the lane state · ${rel(LANE)} · built ${lane.built_at} · ${sh.zones_served} served of ${sh.zones_on_disk} on disk · lattice on ${(sc.lattice || {}).on_served_books} served books · volume on ${(sc.volume || {}).on_served_books} · store ${(lane.store || {}).version} —`);
    if (sh.zones_on_disk !== S.onDisk.length) console.log(`  note: the lane state counts ${sh.zones_on_disk} zones on disk and the directory holds ${S.onDisk.length}; the state is what the last build saw (built_at above), the directory is now`);
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
    const objs = e.objects || [];
    if (!objs.length) console.log(`    objects: none to fetch`);
    else if (perZone && lacking.length && objs.some((o) => o.includes("<slug>"))) console.log(`    objects: for each of ${few(lacking, 4)}: ${objs.join(", ")}`);
    else console.log(`    objects: ${objs.join(", ")}${perZone && !lacking.length ? " (every zone carries the layer; the names are for a zone rebuilt after today)" : ""}`);
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
  console.log(`then the deploy tail, in the plan (TOGGLE-PUSH-PLAN-2026-10-02.md): the gate --write, the door, deploy-root to the root, the manifest, the lane state, the full suite, commit, push to main.`);
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

// ---- the inventory: the listing against the queue --------------------------
const inventory = async (q) => {
  const r = r2();
  if (!r) { console.log(`R2 inventory: skipped — no R2 keys in this environment (${KEYS_SAY})`); return 0; }
  const root = arg("prefix", q.r2.ledgers_root);
  const roots = [root];
  for (const e of q.entries) if (e.r2_prefix !== "unknown" && !roots.some((p) => e.r2_prefix.startsWith(p))) roots.push(e.r2_prefix);
  const notToggles = q.r2.known_prefixes_that_are_not_toggles || [];
  const seek = [...q.entries.filter((e) => e.r2_prefix === "unknown"), ...(q.owed_behind_live_rows_not_queued || [])]
    .flatMap((e) => (e.objects || []).map((name) => ({ who: e.id || e.row, name })));
  console.log(PUSH_RULE_ID);
  console.log();
  console.log(`— R2 inventory · bucket from R2_BUCKET${r.bucket === q.r2.bucket_as_the_sources_name_it ? "" : ` (not the name the sources write, ${q.r2.bucket_as_the_sources_name_it})`} · ${roots.length} prefix(es) · queue recorded ${q.recorded_on} —`);
  let unknown = 0;
  for (const prefix of roots) {
    let objects;
    try { objects = (await r.list(prefix)).filter((o) => !o.key.endsWith("/")); } catch (e) { die(1, `R2_LIST_FAILED ${prefix}: ${e.message}`); }
    console.log();
    console.log(`— ${prefix} · ${objects.length} objects · ${mb(objects)} —`);
    const groups = new Map();
    for (const o of objects) {
      const base = o.key.startsWith(q.r2.toggle_builds_root) ? q.r2.toggle_builds_root : prefix;
      const rest = o.key.slice(base.length);
      const folder = rest.includes("/") ? `${base}${rest.split("/")[0]}/` : base;
      if (!groups.has(folder)) groups.set(folder, []);
      groups.get(folder).push(o);
    }
    for (const [folder, objs] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
      const entries = q.entries.filter((e) => !e.is_template && e.r2_prefix !== "unknown" && (folder.startsWith(e.r2_prefix) || e.r2_prefix.startsWith(folder)));
      const not = notToggles.find((p) => folder.startsWith(p.prefix) || p.prefix.startsWith(folder));
      let verdict;
      if (entries.length) verdict = `→ ${entries.map((e) => `${e.id} (${e.status})`).join(", ")}`;
      else if (not) verdict = `→ not a toggle: ${not.what}`;
      else if (folder === q.r2.toggle_builds_root || folder === prefix) verdict = `→ the root itself: ${few(objs.map((o) => o.key.slice(folder.length)), 6)}`;
      else { unknown += 1; verdict = `→ UNKNOWN to the queue${folder.startsWith(q.r2.toggle_builds_root) ? ": a toggle Moses counted — the generic recipe (entry new-toggle-builds-folder)" : ""}`; }
      console.log(`  ${String(objs.length).padStart(5)} obj  ${mb(objs).padStart(9)}  ${folder}  ${verdict}`);
    }
    if (q.r2.toggle_builds_root.startsWith(prefix)) {
      const readmeKey = `${q.r2.toggle_builds_root}${q.r2.readme_at_toggle_builds_root}`;
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
  console.log(unknown ? `${unknown} delivery folder(s) the queue does not know: add each to ${rel(QUEUE)}, typed in the open, before fetching it` : "every folder listed is known to the queue");
  return 0;
};

// ---- the fetch: one delivery into build/ledgers/<id>/, held to its sums ----
const fetchDelivery = async (q, what) => {
  const r = r2();
  if (!r) { console.log(`R2 fetch: skipped — no R2 keys in this environment (${KEYS_SAY})`); return 0; }
  const entry = q.entries.find((e) => e.id === what);
  let prefix, id;
  if (entry) {
    if (entry.is_template) die(2, `${what} is the template entry: name the folder itself (--fetch <folder>)`);
    if (entry.r2_prefix === "unknown") die(1, `NO_PREFIX: the queue names no R2 prefix for ${what}; run --inventory, which searches the listing for its object names`);
    prefix = entry.r2_prefix; id = entry.id;
  } else if (what.includes("/")) { prefix = what; id = what.replace(/\/$/, "").split("/").pop(); }
  else { prefix = `${q.r2.toggle_builds_root}${what}/`; id = what; }
  let listed;
  try { listed = (await r.list(prefix)).filter((o) => !o.key.endsWith("/")); } catch (e) { die(1, `R2_LIST_FAILED ${prefix}: ${e.message}`); }
  // one object named outright lands under its own folder's name
  const single = !prefix.endsWith("/") ? listed.find((o) => o.key === prefix) : null;
  let objects;
  if (single) { objects = [single]; id = prefix.split("/").slice(-2, -1)[0] || id; }
  else { if (!prefix.endsWith("/")) prefix = `${prefix}/`; objects = listed.filter((o) => o.key.startsWith(prefix)); }
  if (!objects.length) die(1, `NOTHING_UNDER ${prefix}: R2 lists no object there`);
  const dir = stagingDir(q, id);
  const relOf = (key) => (single ? key.split("/").pop() : key.slice(prefix.length));
  for (const o of objects) if (relOf(o.key).split("/").includes("..")) die(1, `REFUSED: ${o.key} names a parent directory`);
  console.log(PUSH_RULE_ID);
  console.log();
  console.log(`— fetch ${id} · ${single ? "object" : "prefix"} ${prefix} · ${objects.length} object(s) · ${mb(objects)} → ${rel(dir)}/ —`);
  if (DRY) { for (const o of objects) console.log(`  ${String(o.size).padStart(11)}  ${relOf(o.key)}`); console.log("DRY — nothing written"); return 0; }
  mkdirSync(dir, { recursive: true });
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
      const p = join(dir, name);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, b);
      measured.set(name, sha(b));
      got += 1;
    }
  }));
  console.log(`  ${got} written exact to the listing · ${wrong} refused`);
  const names = [...measured.keys()].sort();
  const sums = names.find((n) => /^SHA256SUMS(\.txt)?$/.test(n));
  let failed = wrong > 0;
  if (sums) {
    const sumsText = readFileSync(join(dir, sums), "utf8");
    let listedN = 0, bad = 0, missing = 0;
    for (const line of sumsText.split("\n")) {
      const m = line.match(/^([0-9a-f]{64})\s+\*?(.+?)\s*$/);
      if (!m) continue;
      listedN += 1;
      const name = m[2].replace(/^\.\//, "");
      const p = join(dir, name);
      if (!existsSync(p)) { missing += 1; console.log(`  MISSING ${name}: listed in ${sums}, not in the delivery`); continue; }
      const have = measured.get(name) || sha(readFileSync(p));
      if (have !== m[1]) { bad += 1; console.log(`  MISMATCH ${name}: ${sums} says ${m[1].slice(0, 12)}…, the bytes say ${have.slice(0, 12)}…`); }
    }
    const unlisted = names.filter((n) => n !== sums && !sumsText.includes(n));
    if (bad || missing) { failed = true; console.log(`REFUSED: ${bad} mismatch, ${missing} missing against ${sums} — nothing here is a delivery until the sums and the bytes agree`); }
    else console.log(`verified: ${listedN} file(s) hold to ${sums}${unlisted.length ? ` · ${unlisted.length} object(s) the sums file does not list: ${few(unlisted, 5)}` : ""}`);
  } else {
    console.log(`UNVERIFIED by a sums file: no SHA256SUMS in this delivery. Every object's sha256, measured here, for the projector's own pin (the plan names it per toggle):`);
    for (const n of names) console.log(`  ${measured.get(n)}  ${n}`);
  }
  if (entry && (entry.next || []).length) {
    console.log();
    console.log(`next, in order (the plan's section for ${entry.id}):`);
    entry.next.forEach((s, k) => console.log(`  [ ] ${k + 1}. ${fill(s, { stamp: STAMP || "YYYY-MM-DD", id: entry.id })}`));
  }
  return failed ? 1 : 0;
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
