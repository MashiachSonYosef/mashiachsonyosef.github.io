# Ship 8 item 4 (task 125): a check stopped for time under the suite's load runs again alone.
import sys
R = sys.argv[1]
p = R + '/tools/run-checks-v1.mjs'
s = open(p, encoding='utf8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)
rep('''// failed. Three run at a time by default (--jobs); the chains this replaced
// ran three abreast for a month.''', '''// failed. Three run at a time by default (--jobs); the chains this replaced
// ran three abreast for a month.
//
// A CHECK STOPPED FOR TIME UNDER LOAD RUNS AGAIN ALONE (task 125). Several
// checks drive a browser each, and three abreast they can starve one
// another: on 16 November 2026 check-run-card-forms-v1 gave no verdict in
// 1,500 s under the suite's load and passed every law alone in 39 s. A check
// the limit stops is run once more when the others are done, alone, under
// the same limit, and its verdict is that run's, said as such («alone, after
// no verdict under load»). A check that fails alone has failed; one that
// times out alone has failed; nothing is skipped or retried twice.''')
rep('''    let out = ""; let timedOut = false;''', '''    let out = ""; let timedOut = false;
    const again = !!j.alone;''')
rep('''      if (timedOut) { verdict = "FAILED"; say = [`    ¦ no verdict in ${TIMEOUT_S} s; stopped`]; }''',
    '''      if (timedOut) { verdict = "FAILED"; say = [`    ¦ no verdict in ${TIMEOUT_S} s${again ? " alone, after none under load" : ""}; stopped`]; }''')
rep('''      results.push({ label, name: j.name, verdict, say, seconds, unjudged });''',
    '''      if (again && verdict !== "FAILED") say = say.map((l, i) => (i ? l : `${l} · alone, after no verdict under load`));
      results.push({ label, name: j.name, verdict, say, seconds, unjudged, timedOut, job: j });''')
rep('''  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, worker));
  stop();''', '''  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, worker));
  // each check the limit stopped under load, once more, alone (above)
  const stopped = results.filter((r) => r.timedOut && !r.job.alone);
  if (stopped.length && JOBS > 1) {
    console.log(`\\n${stopped.length} check(s) gave no verdict under load; each runs again alone`);
    for (const r of stopped) { results.splice(results.indexOf(r), 1); await runOne({ ...r.job, alone: true }); }
  }
  stop();''')
open(p, 'w', encoding='utf8').write(s)
print("item 4 applied")
