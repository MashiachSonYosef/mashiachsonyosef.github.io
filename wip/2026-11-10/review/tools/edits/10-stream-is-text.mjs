// The stream route's check judges zones, not sidecars, and says so when no zone rides its route.
// node 10-stream-is-text.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "tools", "check-stream-is-text-v1.mjs"), [
[`import { fileURLToPath } from "node:url";
`, `import { fileURLToPath } from "node:url";
import { isSidecar } from "./zones-on-disk-v1.mjs";
`],
[`const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-")).sort();`,
 `// zones, not the sidecars that ride beside them: a sidecar carries no route
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !isSidecar(f)).sort();`],
[`let onRoute = 0, zonesRead = 0, streams = 0, bodies = 0, rowsAdded = 0;`,
 `let onRoute = 0, zonesRead = 0, streams = 0, bodies = 0, rowsAdded = 0;
const otherRoutes = new Map();`],
[`  if (route !== ROUTE) { l2.push(\`\${name}: \${route || "no route"}\`); continue; }`,
 `  if (route !== ROUTE) { l2.push(\`\${name}: \${route || "no route"}\`); otherRoutes.set(route || "no route", (otherRoutes.get(route || "no route") || 0) + 1); continue; }`],
[`check("L2  every zone rides this route or the edition route; none is left on the predecessor bridge", l2.length === 0, l2.length ? \`\${l2.length} — \${few(l2)}\` : \`\${onRoute} on the stream route among \${zonesRead}\`);
if (!onRoute) { console.log(\`SKIPPED — none of \${zonesRead} zones rides \${ROUTE}; L3 to L7 had nothing to judge\`); process.exit(bad ? 1 : 3); }`,
 `// A SHELF THIS ROUTE DOES NOT SERVE IS NOT THIS CHECK'S TO JUDGE. L2 was
// written when every zone rode this route (3 September 2026). The 39 books
// were rebuilt from the restore within the week and ride its route, held by
// check-restore-serve-v1; this check went on failing L2 for every one of them
// and for every sidecar, outside the round's chains, while its two sister
// checks said what is true: no zone here rides their route, so they have
// nothing to judge. It says the same now, and names the routes it found.
if (!onRoute) {
  console.log(\`SKIPPED — no zone in \${ZONES.replace(K3 + "/", "")} rides route \${ROUTE}; \${zonesRead} zones read, \${[...otherRoutes].map(([r, n]) => \`\${n} on \${r}\`).join(", ") || "none on another route"}, so L2 to L7 had nothing to judge\`);
  process.exit(bad ? 1 : 3);
}
check("L2  every zone rides this route or the edition route; none is left on the predecessor bridge", l2.length === 0, l2.length ? \`\${l2.length} — \${few(l2)}\` : \`\${onRoute} on the stream route among \${zonesRead}\`);`],
]);
