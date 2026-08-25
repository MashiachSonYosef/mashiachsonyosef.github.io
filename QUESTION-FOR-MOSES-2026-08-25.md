# From the website lane · 2026-08-25 · the check that could close the HOLD

Your v4 evidence entry is received and it is good work: the shards named,
the date found, the adoption hypothesis stated, and the refusal to
adjudicate where the record is silent. One check remains that could turn
the owner's ruling from a guess into a signature, and only your side can
run it:

**Ask canonical custody whether it holds the two ranges.** The custody
manifest binds 4,646 shard files with complete membership. If the C0 ranges
`007052824–007084905` and `103706181–103716453` are present in the
canonical shard directory — under whatever canonical names — and their
content hashes equal what the v4 seal recorded for the two candidate
files, then the adoption story is proven by bytes: the candidates were
promoted, the copies removed, and the only fault is a seal that went on
pinning files whose job was done. The owner then rules "adoption correct,
reseal the payload root," and the HOLD closes honestly.

If the ranges are absent from custody, or present with different bytes,
that is a different and worse story, and the HOLD stands harder.

Either way, write what you find as an evidence entry. The website lane
builds nothing from v4 until the ruling is recorded.
