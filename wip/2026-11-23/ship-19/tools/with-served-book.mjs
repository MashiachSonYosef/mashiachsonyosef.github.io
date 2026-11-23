// read-only helper (23 November 2026): serve a reader tree on a port the machine gives (serve-tree-v1) while one page
// check runs against it, handed the page of its first served book (zone.html?b=<book>) as its first argument; then
// stop. Exits with the check's code. Ship 18's with-served-tree.mjs hands zone.html with no book, which a check that
// opens the page it is given draws empty. Usage: node with-served-book.mjs <reader dir> <tools/check-...mjs> [more args]
import { spawn } from "node:child_process";
import { join } from "node:path";
const [R, CHECK, ...rest] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { zonesServed } = await import(join(R, "tools", "zones-on-disk-v1.mjs"));
const tree = await serveTree(R);
const [first] = zonesServed(join(R, "data", "zones"));
const child = spawn(process.execPath, [CHECK, `${tree.base}/zone.html?b=${first}`, ...rest], { cwd: R, stdio: "inherit", env: { ...process.env, SERVE_BASE: tree.base } });
child.on("exit", async (code) => { await tree.close(); process.exit(code ?? 1); });
