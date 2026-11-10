// The suggested-title check's fixture stands in the register it tests: a work with no witnessed title.
// node 12-suggested-title.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "tools", "check-suggested-title-v1.mjs"), [
[`  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", \`\${served}.bin\`))).toString("utf8"));
  mutate(z);`,
`  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", \`\${served}.bin\`))).toString("utf8"));
  // THE FIXTURE STANDS IN THE REGISTER UNDER TEST: A WORK WITH NO WITNESSED
  // TITLE. A pointer prints in the open only where the masthead has no
  // witnessed title to show (the page's own branch). When this check was
  // written the first zone on the shelf had none; every served zone carries
  // one now, so the pointer never printed and four clauses were red, outside
  // the round's chains, until the whole suite was run on 10 November 2026.
  // The fixture's title tokens are taken off before each case lays its own
  // (case 3 lays a witnessed title back to test the fold beside one).
  delete z.work_he_tokens; delete z.work_he;
  mutate(z);`],
[`  got.found && got.chipTitle.includes(SUG.run) && got.chipTitle.includes(SUG.date)
    && /selected the interval/.test(got.chipTitle),
  got.chipTitle.slice(0, 80));`,
`  got.found && got.chipTitle.includes(SUG.run) && got.chipTitle.includes(SUG.date)
    && /selected the interval/.test(got.chipTitle),
  String(got.chipTitle || "").slice(0, 80));`],
[`  got.words === SUG.tokens.length && got.heWords.join(" ") === SUG.tokens.map((t) => t.s).join(" "),
  got.heWords.join(" "));`,
`  got.found && got.words === SUG.tokens.length && got.heWords.join(" ") === SUG.tokens.map((t) => t.s).join(" "),
  (got.heWords || []).join(" "));`],
]);
