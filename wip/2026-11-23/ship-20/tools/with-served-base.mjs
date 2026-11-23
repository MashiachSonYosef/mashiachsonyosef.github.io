// read-only helper (23 November 2026): serve a reader tree on a port the machine gives (serve-tree-v1) while one page
// check runs against it, told only by SERVE_BASE (the check builds its own address from it); then stop. Exits with the
// check's code. Usage: node with-served-base.mjs <reader dir> <tools/check-...mjs> [more args]
import { spawn } from "node:child_process";
import { join } from "node:path";
const [R, CHECK, ...rest] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const tree = await serveTree(R);
const child = spawn(process.execPath, [CHECK, ...rest], { cwd: R, stdio: "inherit", env: { ...process.env, SERVE_BASE: tree.base } });
child.on("exit", async (code) => { await tree.close(); process.exit(code ?? 1); });
