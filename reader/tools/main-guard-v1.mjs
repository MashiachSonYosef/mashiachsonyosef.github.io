// Synthesis lane · is this file the program, or was it imported
// LEDGER: -
// no frame letter. This reads the process's own arguments and decides
// nothing about the corpus.
//
// A tool that exports a function and also runs as a program has to know
// which of the two is happening, or importing it runs it: the lane state's
// check once regenerated the very file it was about to verify, and passed
// eleven clauses against itself. Each such tool asked by comparing two
// strings, import.meta.url against "file://" + process.argv[1]. Node writes
// the first as a URL of the real path and leaves the second as typed, so
// from a checkout whose path holds a space, or is reached through a link,
// the two never matched: the tool wrote nothing and exited 0, and the round
// shipped the file from the round before (the review of 10 November 2026).
//
// One question, asked one way: the file this module's URL names is the file
// the process was started on, whatever spelling of its path was typed.
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** True when the module at `metaUrl` (pass import.meta.url) is the file this
 *  process was started on. False when it was imported, and false, never a
 *  throw, when the process has no script path at all. */
export const startedAs = (metaUrl) => {
  try { return !!process.argv[1] && metaUrl === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
};
