// Synthesis lane · a file another lane wrote is read only as the bytes its pin names
// LEDGER: -
// no frame letter. It reads a pinned file and writes nothing.
//
// A FILE ANOTHER LANE WROTE IS READ ONLY AS THE BYTES ITS PIN NAMES.
//
// The corpus lane's lists, maps and rulings are kept in this tree byte for
// byte, each beside a PIN.json that names it by its size and its sha256 (the
// figures the lane's own letter gives). A tool that builds from one, and a
// check that judges one, reads it through here: the file is opened, weighed
// against its pin, and handed over only if it is those bytes. A file that is
// missing or is other bytes is said in words (PinFault), and the caller
// decides what that means: a tool refuses and writes nothing, a check counts
// a fault and goes on.
//
//   pin entry   { file, bytes, sha256 }, and `lines` for a file of JSON lines
//   readPinned(path, entry, name)        -> Buffer
//   readPinnedLines(path, entry, name)   -> one parsed value per line
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

export const sha256Of = (bytes) => createHash("sha256").update(bytes).digest("hex");
export class PinFault extends Error {}

export const readPinned = (path, entry, name = entry.file) => {
  if (!existsSync(path)) throw new PinFault(`${name} is named in its pin and is not here`);
  const bytes = readFileSync(path);
  const sha = sha256Of(bytes);
  if (bytes.length !== entry.bytes || sha !== entry.sha256) throw new PinFault(`${name} is not the bytes its pin names (${bytes.length} bytes, ${sha}; the pin: ${entry.bytes}, ${entry.sha256})`);
  return bytes;
};

// a pinned file of JSON lines: it ends in a line end, and holds the number of lines its pin says
export const readPinnedLines = (path, entry, name = entry.file) => {
  const text = readPinned(path, entry, name).toString("utf8");
  if (!text.endsWith("\n")) throw new PinFault(`${name} does not end in a line end`);
  const raw = text.slice(0, -1).split("\n");
  if (raw.length !== entry.lines) throw new PinFault(`${name} holds ${raw.length} lines and its pin says ${entry.lines}`);
  return raw.map((s, at) => { try { return JSON.parse(s); } catch (e) { throw new PinFault(`${name} line ${at + 1} is not JSON (${e.message})`); } });
};
