// The runner: a skipped check is read from its own SKIPPED line (a check may print a heading first),
// and the Hebrew block is written as escapes, as every tool writes it.
// node 15-runner.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
const raw = `/[${String.fromCharCode(0x0590)}-${String.fromCharCode(0x05ff)}]/u`;
edit(join(T, "run-checks-v1.mjs"), [
[raw, "/[\\u0590-\\u05FF]/u", 2],
[`      else if (code === 3) { verdict = "skipped"; say = [(lines.find((l) => l.trim()) || "").replace(/^SKIPPED — /u, "")]; }`,
 `      // a check that could not reach its inputs says why on a line of its own
      // that begins SKIPPED; some print a heading above it
      else if (code === 3) { verdict = "skipped"; say = [(lines.find((l) => /^SKIPPED\\b/u.test(l)) || lines.find((l) => l.trim()) || "").replace(/^SKIPPED\\s*(—|-|:)?\\s*/u, "")]; }`],
]);
