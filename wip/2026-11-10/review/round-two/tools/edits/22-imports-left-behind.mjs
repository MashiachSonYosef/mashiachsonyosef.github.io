// What edits 16 and 17 left unread: the imports and two constants the tools used only in the dozen lines that
// are now one call (found by the linter over every tool this round changed, against its copy before the round).
// node 22-imports-left-behind.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);
const RULE = `const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";\n`;

edit(T("apply-span-ledger-v1.mjs"), [
  [`import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";\nimport { gunzipSync, gzipSync } from "node:zlib";`,
   `import { readFileSync, readdirSync, existsSync } from "node:fs";\nimport { gunzipSync } from "node:zlib";`],
]);
edit(T("bake-witnessed-order-v1.mjs"), [
  [`import { readFileSync, writeFileSync, existsSync } from "node:fs";`, `import { readFileSync, existsSync } from "node:fs";`],
  [`import { gzipSync, gunzipSync } from "node:zlib";`, `import { gunzipSync } from "node:zlib";`],
]);
edit(T("enrich-gloss-m-v1.mjs"), [
  [`import { readFileSync, writeFileSync, readdirSync } from "node:fs";\nimport { gzipSync, gunzipSync } from "node:zlib";`,
   `import { readFileSync, readdirSync } from "node:fs";\nimport { gunzipSync } from "node:zlib";`],
]);
edit(T("project-piece-gloss-v1.mjs"), [
  [`import { readFileSync, writeFileSync, existsSync } from "node:fs";\nimport { gunzipSync, gzipSync } from "node:zlib";`,
   `import { readFileSync, existsSync } from "node:fs";\nimport { gunzipSync } from "node:zlib";`],
  [RULE, ``],
]);
edit(T("project-toggle-headword-v1.mjs"), [
  [`import { readFileSync, writeFileSync, createReadStream, statSync } from "node:fs";`, `import { readFileSync, createReadStream, statSync } from "node:fs";`],
  [`import { gzipSync, gunzipSync, createGunzip } from "node:zlib";`, `import { gunzipSync, createGunzip } from "node:zlib";`],
  [RULE, ``],
  [`\nconst body = JSON.stringify(zone);\nwriteZone(outPath, zone);`, `\nwriteZone(outPath, zone);`],
]);
edit(T("respan-zone-v1.mjs"), [
  [`import { readFileSync, writeFileSync } from "node:fs";`, `import { readFileSync } from "node:fs";`],
  [`import { gzipSync, gunzipSync } from "node:zlib";`, `import { gunzipSync } from "node:zlib";`],
]);
