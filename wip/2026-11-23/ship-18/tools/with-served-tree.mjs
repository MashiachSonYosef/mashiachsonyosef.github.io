// read-only helper (23 November 2026): serve a reader tree on a port the machine gives (serve-tree-v1) while one page
// check runs against it, the page's address handed as the check's first argument; then stop. Exits with the check's code.
// Usage: node with-served-tree.mjs <reader dir> <tools/check-...mjs> [more args]
import { spawn } from "node:child_process";
import { join } from "node:path";
const [R, CHECK, ...rest] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const tree = await serveTree(R);
const child = spawn(process.execPath, [CHECK, `${tree.base}/zone.html`, ...rest], { cwd: R, stdio: "inherit", env: { ...process.env, SERVE_BASE: tree.base } });
child.on("exit", async (code) => { await tree.close(); process.exit(code ?? 1); });
