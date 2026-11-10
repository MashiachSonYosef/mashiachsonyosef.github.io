// The commentary index waits with the commentary; its check holds the plain page and the asking page.
// node 01-commentary-index.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [[
`  const buildCommentaryIndex = () => {
    const units = (commentaryStore && commentaryStore.units) || null;
    if (!units) return null;`,
`  const buildCommentaryIndex = () => {
    // THE INDEX WAITS WITH THE COMMENTARY IT OPENS (COMMENTARY_ON). It was left
    // standing on every plain page of a book with a sidecar after 16 October,
    // a handle over buttons that scrolled to a verse and opened nothing there,
    // since nothing under it is built without the flag (found by review, 10
    // November 2026: "A book page draws no commentary bar, handle or switch
    // unless the address asks")
    if (!COMMENTARY_ON) return null;
    const units = (commentaryStore && commentaryStore.units) || null;
    if (!units) return null;`]]);
edit(join(R, "tools", "check-contents-shut-v1.mjs"), [
[`  await p.goto(\`\${BASE}?b=\${book}\`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(400);
  console.log(\`— \${book} —\`);`,
`  // THE COMMENTARY WAITS BEHIND THE ADDRESS (the owner, 2026-10-16), and its
  // index waits with it: a plain page of a book that carries one draws no
  // index (until 10 November 2026 it drew one whose hits opened nothing),
  // and the page that asks for commentary draws it, shut, as a handle.
  const asksCommentary = WITH_COMMENTARY.includes(book);
  if (asksCommentary) {
    await p.goto(\`\${BASE}?b=\${book}\`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    await p.waitForTimeout(400);
    const plain = await p.evaluate(() => ({ index: !!document.getElementById("cIndex"), bars: document.querySelectorAll(".c-bar, .c-mark").length }));
    console.log(\`— \${book}, as a reader opens it —\`);
    check("  a plain page draws no commentary index, bar or mark", !plain.index && plain.bars === 0, \`index \${plain.index ? "drawn" : "not drawn"} · \${plain.bars} bars and marks\`);
  }
  await p.goto(\`\${BASE}?b=\${book}\${asksCommentary ? "&commentary=on" : ""}\`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(400);
  console.log(\`— \${book}\${asksCommentary ? ", commentary asked for" : ""} —\`);`],
[`  if (shut.ciHead !== null) {
    check("  the book's commentary is a handle too", !shut.ciOpen &&
      /^C[\\d,]+ Commentary$/.test(shut.ciHead), shut.ciHead);
  }`,
`  if (asksCommentary) {
    check("  the book's commentary is a handle too", shut.ciHead !== null && !shut.ciOpen &&
      /^C[\\d,]+ Commentary$/.test(shut.ciHead || ""), String(shut.ciHead));
  }`],
]);
