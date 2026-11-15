// Synthesis lane · the moment a step that changes the store is recorded under
// LEDGER: -
// no frame letter. It reads the process's own arguments and the clock, and
// writes nothing.
//
// A STEP THAT CHANGES THE STORE WRITES WHEN IT RAN, AND MAY BE TOLD WHEN.
//
// The tools that change the store itself (a strike or a landing, the ledgers'
// divisions, the made spaces' closes) are run once, when their own input
// arrives, and each writes the moment it ran into what it leaves behind: the
// round in the row-strikes record, the move in the store's version history,
// its own receipt. Until 15 November 2026 that moment was always the clock's.
// So a step run a second time on the same store with the same list wrote
// other bytes than the first, and a step rehearsed on one tree could not be
// held, file by file, to the same step run on the tree that ships: every
// record differed, by its clock alone.
//
// From that day a step may be given its moment on the command line:
//
//   --on 2026-11-15T00:00:01.000Z
//
// The moment is written exactly as given, in the one form the clock itself
// writes (UTC, to the millisecond), and anything else is refused. With none
// given the step writes the clock's, as before. A given moment says when the
// step is recorded as run, which is the caller's to say; it changes nothing
// the step does to a row.
//
//   givenMoment()    the moment --on gives, or null where none was given;
//                    it throws, in words, on one that is not a moment
//   momentOf(given)  the moment a step writes: the one given, or the clock's
const MOMENT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

export const givenMoment = (argv = process.argv) => {
  const at = argv.indexOf("--on");
  if (at < 0) return null;
  const given = argv[at + 1];
  const read = typeof given === "string" && MOMENT.test(given) ? new Date(given) : null;
  if (!read || Number.isNaN(read.getTime()) || read.toISOString() !== given) throw new Error(`--on takes a moment as the clock writes it (2026-11-15T00:00:01.000Z), not ${JSON.stringify(given ?? null)}`);
  return given;
};

export const momentOf = (given) => given || new Date().toISOString();
