"""The browser proofs summed by build and by kind of case list, from proofs-table.py's output.
usage: python3 -I proofs-sum.py <t6-table.txt>
"""
import re
import sys
from collections import defaultdict

PAT = re.compile(r"^\s+(before|after) · (.*?) · ([a-z-]+)-(m-reading|m-credit|x-reading|x-credit|cites-own|names-other-text|missing-characters|stale-characters|missing-corpus|stale-corpus|sample-80)\.json\s+asked\s+(\d+) found\s+(\d+) \| reading agree\s+(\d+) differ\s+(\d+) \| credit agree\s+(\d+) differ\s+(\d+) unread (\d+) \| run (\d+) several (\d+)")
tot = defaultdict(lambda: defaultdict(int))
books = defaultdict(set)
for line in open(sys.argv[1], encoding="utf8"):
    m = PAT.match(line)
    if not m:
        continue
    side, title, book, kind = m.group(1), m.group(2), m.group(3), m.group(4)
    asked, found, ra, rd, ca, cd, cu, run, several = (int(x) for x in m.groups()[4:])
    key = (kind, title.split(" · ")[0], side)
    t = tot[key]
    for name, v in (("asked", asked), ("found", found), ("reading_agree", ra), ("reading_differ", rd), ("credit_agree", ca), ("credit_differ", cd), ("credit_unread", cu), ("in_a_run", run), ("several_words", several)):
        t[name] += v
    books[key].add(book)
for key in sorted(tot):
    t = tot[key]
    print(f"{key[0]:18s} {key[2]:6s} {len(books[key])} book(s) · {key[1][:44]:44s} · judged {t['reading_agree'] + t['reading_differ']:3d}: reading agrees {t['reading_agree']:3d}, differs {t['reading_differ']:3d} · credit agrees {t['credit_agree']:3d}, differs {t['credit_differ']:3d}, unread {t['credit_unread']} · set aside: in a run {t['in_a_run']}, a card of several words {t['several_words']}")
