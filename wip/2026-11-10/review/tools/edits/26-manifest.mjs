// The manifest knows the round as a build file, and reads off the published bins which tools built
// them and which wrote them after. node 26-manifest.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "pipeline-manifest-v1.mjs"), [
[`//   3. The stages build.sh actually runs, against the tools that exist.`,
 `//   3. The stages the build files actually run (build.sh, which builds the
//      plan tier's works from the corpus lane's workspace, and
//      tools/round-v1.sh, which projects the served shelf again over the
//      records this repository holds), against the tools that exist.
//   4. The served shelf, read off the bins themselves: every published bin
//      names the tool that built it and every tool that wrote it after, and
//      the table says which of those a build file runs. Until 10 November
//      2026 this file printed "6 published artifacts, none without a build
//      step" over a site of 147 bins, because table 2 lists the plan's tier
//      and the plan's tier holds one work.`],
[`import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";`,
 `import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";`],
[`const buildSh = files.get("build.sh") || "";`,
 `const BUILD_FILES = ["build.sh", "tools/round-v1.sh"].filter((f) => files.has(f));
const buildSh = BUILD_FILES.map((f) => files.get(f)).join("\\n");`],
[`  return tool ? tool[0] : "build.sh";
};`,
 `  return tool ? tool[0] : (BUILD_FILES.find((f) => files.get(f).split("\\n").some(hit)) || "build.sh");
};`],
[`// ---- write ---------------------------------------------------------------`,
 `// ---- 4 · the served shelf, read off the bins -----------------------------
// A bin says who made it: a zone names its builder (emitted_from.build) and
// its route, and every tool that wrote it after its build is typed on it
// (emitted_from.post_build.by, under single-pass-exemption-v1). Nothing is
// typed here; a kind of bin nobody names a maker for prints as unnamed.
const kindOf = (f) => (/\\.([a-z]+)\\.bin$/.exec(f) || [null, "zone"])[1];
const shelf = new Map(); // kind -> { bins, routes: Set, builders: Set, wrote: Map(tool -> bins) }
for (const f of (existsSync("data/zones") ? readdirSync("data/zones") : []).filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-")).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${f}\`)).toString("utf8")); } catch { continue; }
  const k = kindOf(f);
  if (!shelf.has(k)) shelf.set(k, { bins: 0, routes: new Set(), builders: new Set(), wrote: new Map() });
  const s = shelf.get(k), ef = z.emitted_from || {};
  s.bins += 1;
  s.routes.add(String(z.route || z.schema_version || "unnamed"));
  const builder = (ef.build && ef.build.builder) || z.projected_by || z.emitted_by || null;
  s.builders.add(builder || "unnamed");
  const pb = ef.post_build || {};
  const writers = new Set([...String(pb.by || "").split(" + "), ...Object.values(pb.by_field || {}).flatMap((v) => String(v).split(" + "))].map((t) => t.trim()).filter((t) => t.startsWith("tools/")));
  for (const t of writers) s.wrote.set(t, (s.wrote.get(t) || 0) + 1);
}
const inABuildFile = (tool) => BUILD_FILES.find((f) => files.get(f).includes(tool)) || null;

// ---- write ---------------------------------------------------------------`],
[`L.push(\`\\\`build.sh\\\` calls \${called.length} of the \${present.length} tools that are not checks.\`, "");`,
 `L.push(\`The build files (\${BUILD_FILES.map((f) => \`\\\`\${f}\\\`\`).join(", ")}) call \${called.length} of the \${present.length} tools that are not checks.\`, "");`],
[`writeFileSync(OUT, \`\${L.join("\\n")}\\n\`);`,
 `L.push("## The served shelf", "");
L.push("Read off the bins in \`data/zones\`: who each kind says built it, and every tool");
L.push("typed on it as having written it after its build. A tool no build file runs");
L.push("is run by hand when its own input arrives; the bins it wrote cannot be made");
L.push("again from a checkout by a build file alone.", "");
L.push("| kind | bins | route or schema | built by | written after its build by |");
L.push("|---|---|---|---|---|");
const shelfTools = new Set();
for (const [k, s] of shelf) {
  const wrote = [...s.wrote.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([t, n]) => { shelfTools.add(t); const bf = inABuildFile(t); return \`\${t} (\${n}; \${bf ? \`run by \${bf}\` : "**no build file runs it**"})\`; });
  const built = [...s.builders].map((b) => (b === "unnamed" ? "**unnamed**" : \`\${b}\${b.startsWith("tools/") && !inABuildFile(b) ? " (no build file runs it)" : ""}\`));
  L.push(\`| \${k} | \${s.bins} | \${[...s.routes].join(", ")} | \${built.join(", ")} | \${wrote.join("; ") || "—"} |\`);
}
L.push("");
writeFileSync(OUT, \`\${L.join("\\n")}\\n\`);`],
[`console.log(\`  stages     build.sh calls \${called.length} of \${present.length} non-check tools\`);`,
 `console.log(\`  stages     the build files (\${BUILD_FILES.join(", ")}) call \${called.length} of \${present.length} non-check tools\`);
{
  const bins = [...shelf.values()].reduce((n, s) => n + s.bins, 0);
  const outside = [...shelfTools].filter((t) => !inABuildFile(t)).sort();
  console.log(\`  shelf      \${bins} bins in data/zones · written after their build by \${shelfTools.size} tools · \${outside.length} of them in no build file\`);
  for (const t of outside) console.log(\`               \${t}\`);
}`],
]);
