// The runner prints the manifest's three summary lines by what they are, not by their position.
// node 27-runner-manifest-lines.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "run-checks-v1.mjs"), [
[`.filter((l, i) => i === 1 || i === 2 || /NO BUILD STEP/u.test(l))) console.log(\`  \${l}\`);`,
 `.filter((l) => /^\\s+(rules|published|shelf)\\b|NO BUILD STEP/u.test(l))) console.log(\`  \${l}\`);`],
]);
