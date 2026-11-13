// Synthesis lane · a folder served to a browser this tool opens itself, on a port nobody chose
//
// LEDGER: -
// no frame letter. This serves files as they stand and decides nothing.
//
// WHY THIS IS A FILE. A tool that reads a page (the bake of the resting
// lines) has to be handed the page by something. The checks are handed it by
// their runner, which keeps a server on a known port; a tool run by the
// round, or by hand, cannot assume that server is up or that the port is
// free, and a tool that starts a second server on a typed port fails the day
// the first one is running. So the folder is served here, on whatever port
// the machine gives, for as long as the tool runs.
//
// It serves what is on the disk, byte for byte, by the file's own name: no
// listing of a folder, no path that climbs out of the folder, no rewriting.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { resolve as pathOf, sep } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain; charset=utf-8",
};

/** Serve `dir` on 127.0.0.1. Answers { base, asked, close }: the address, the
 *  paths asked for and found so far (as the folder names them), and a way to
 *  stop. */
export const serveTree = (dir) => new Promise((ready, refused) => {
  const root = pathOf(dir) + sep;
  const asked = new Set();
  const server = createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(String(req.url || "/").split("?")[0].split("#")[0]); } catch { res.writeHead(400); res.end(); return; }
    if (rel.endsWith("/")) rel += "index.html";
    const full = pathOf(root, `.${rel.startsWith("/") ? rel : `/${rel}`}`);
    if (!full.startsWith(root)) { res.writeHead(403); res.end(); return; }
    let st = null;
    try { st = statSync(full); } catch { /* not here */ }
    if (!st || !st.isFile()) { res.writeHead(404, { "content-type": "text/plain" }); res.end("not here"); return; }
    asked.add(full.slice(root.length).split(sep).join("/"));
    const ext = full.slice(full.lastIndexOf("."));
    res.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream", "content-length": st.size, "cache-control": "no-store" });
    if (req.method === "HEAD") { res.end(); return; }
    createReadStream(full).pipe(res);
  });
  server.on("error", refused);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    ready({ base: `http://127.0.0.1:${port}`, asked, close: () => new Promise((done) => { if (server.closeAllConnections) server.closeAllConnections(); server.close(() => done()); }) });
  });
});
