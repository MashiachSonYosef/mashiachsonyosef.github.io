// A sidecar names its writer as emitted_from.projected_by; the manifest reads it there too.
// node 28-manifest-projected-by.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "pipeline-manifest-v1.mjs"), [
[`  const builder = (ef.build && ef.build.builder) || z.projected_by || z.emitted_by || null;`,
 `  const builder = (ef.build && ef.build.builder) || ef.projected_by || z.projected_by || z.emitted_by || null;`],
[`  const built = [...s.builders].map((b) => (b === "unnamed" ? "**unnamed**" : \`\${b}\${b.startsWith("tools/") && !inABuildFile(b) ? " (no build file runs it)" : ""}\`));`,
 `  const built = [...s.builders].map((b) => (b === "unnamed" ? "**unnamed**" : \`\${b} (\${b.startsWith("tools/") && inABuildFile(b) ? \`run by \${inABuildFile(b)}\` : "no build file runs it"})\`));`],
]);
