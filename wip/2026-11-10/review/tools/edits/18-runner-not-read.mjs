// A law a check could not judge is neither a pass nor a failure, and the run names it. A check that
// passes without one judged law is shown saying what it said, not "0 assertions".
// node 18-runner-not-read.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "run-checks-v1.mjs"), [
[`// The verdicts are the checks' own exit codes: 0 passed, 3 could not reach
// its inputs here (counted apart, named, never as a pass), anything else
// failed. Three run at a time by default (--jobs); the chains this replaced
// ran three abreast for a month.`,
 `// The verdicts are the checks' own exit codes: 0 passed, 3 could not reach
// its inputs here (counted apart, named, never as a pass), anything else
// failed. Three run at a time by default (--jobs); the chains this replaced
// ran three abreast for a month.
//
// A LAW NOT JUDGED IS NAMED. A check that passes may still hold a law it
// could not judge on this machine (the zone it wanted is held off the door;
// no work of the kind it presses is on this disk). The checks print such a
// law, and their side notes, on a line that begins "  --  ", where a judged
// law begins "  ok  " or "FAIL  ". Of those lines the run lists, under its
// verdict, every one that says a law went unjudged (not judged, not read,
// not witnessed, not asked, skipped, not counted as passed): a law nobody
// judged is not a law that passed. The side notes stay in the check's own
// output.`],
[`      else if (code === 0) { verdict = "ok"; say = [\`\${lines.filter((l) => /^ {2}ok {2}/u.test(l)).length} assertions\`]; }`,
 `      // a check in another lane's style judges without an "ok" line; it is
      // shown saying what it said, never as "0 assertions"
      else if (code === 0) { verdict = "ok"; const n = lines.filter((l) => /^ {2}ok {1,2}/u.test(l)).length; say = [n ? \`\${n} assertions\` : \`no law printed as judged · \${(lines.filter((l) => l.trim()).pop() || "(it printed nothing)").trim()}\`]; }`],
[`      results.push({ label, name: j.name, verdict, say, seconds });`,
 `      const unjudged = lines.filter((l) => /^ {2}-- {2}/u.test(l) && /\\bnot (judged|read|witnessed|asked|counted as passed)\\b|\\bskipped\\b|\\bunread\\b/iu.test(l)).map((l) => l.trim().replace(/^--\\s+/u, ""));
      results.push({ label, name: j.name, verdict, say, seconds, unjudged });`],
[`  if (skipped.length) console.log(\`\${skipped.length} could not reach their inputs here: \${skipped.join(" ")}\`);`,
 `  if (skipped.length) console.log(\`\${skipped.length} could not reach their inputs here: \${skipped.join(" ")}\`);
  const partial = results.filter((r) => r.verdict !== "skipped" && r.unjudged.length).sort((a, b) => a.label.localeCompare(b.label));
  if (partial.length) {
    console.log(\`\${partial.reduce((n, r) => n + r.unjudged.length, 0)} law(s) not judged here, in \${partial.length} check(s) that ran:\`);
    for (const r of partial) for (const l of r.unjudged) console.log(\`  \${r.label} · \${l.slice(0, 260)}\`);
  }`],
]);
