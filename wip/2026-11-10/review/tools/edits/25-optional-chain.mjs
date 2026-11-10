// Two checks read a line's first text node and trimmed it; a line with no text node threw inside the
// page instead of reading as empty. node 25-optional-chain.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "check-masorah-toggle-v1.mjs"), [
[`return { line: (g ? g.childNodes[0]?.textContent : "").trim(), bare:`, `return { line: ((g && g.childNodes[0] && g.childNodes[0].textContent) || "").trim(), bare:`],
]);
edit(join(T, "check-proper-name-v1.mjs"), [
[`lineText: (g ? g.childNodes[0]?.textContent : "").trim(), now:`, `lineText: ((g && g.childNodes[0] && g.childNodes[0].textContent) || "").trim(), now:`],
]);
