// The levels check asks its commentary clauses of a page that asks for commentary. node 08-levels.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "tools", "check-levels-v1.mjs"), [
[`// stronger than what stood here: the clause used to hold only for whichever
// work the run happened to be pointed at.`,
`// stronger than what stood here: the clause used to hold only for whichever
// work the run happened to be pointed at.
// AND OF A PAGE THAT ASKS FOR IT (10 November 2026). Commentary has waited
// behind the address since 16 October (?commentary=on), so the plain page of
// a book that carries one draws no line, and these four clauses were red,
// outside the round's chains, from that day (noted on 30 October and left).`],
[`  await page.goto(\`\${URL.split("?")[0]}?b=\${cmBook}\`, { waitUntil: "networkidle" });`,
 `  await page.goto(\`\${URL.split("?")[0]}?b=\${cmBook}&commentary=on\`, { waitUntil: "networkidle" });`],
]);
