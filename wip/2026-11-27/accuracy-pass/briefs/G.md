# Helper G: the chain pages, link by link

The site serves a «chain» page for each of the twelve minor prophets (`S/base/chain/<book>/index.html`, built by `reader/tools/build-chain-book-v2.mjs`, guarded by `reader/tools/check-chain-book-v1.mjs`): for every word, the chain from the Hebrew word through its entry to the reading printed, each link naming its source. An outside reader once audited Obadiah's and found the chain and the card disagreeing (the page lane's record: `/home/user/mashiachsonyosef.github.io/wip/` — search for «chain book and the card disagree»).

**Question.** On every chain page: does each link say what the card of the same word says, does each link name the right source, and does the chain as a whole tell the truth about how the reading under the word was reached?

1. Read the builder and the check: what a chain is made of, what the check proves, what it does not.
2. By machine, all twelve books, every word: the chain's reading against `data/resting-lines/<book>.json.gz` (the line the page prints); the chain's source against the line's credit; each link's entry (Strong's number, STEP's tag) against what `tools/entry-gate-v1.mjs` gives for the place. Count agreements and list every disagreement.
3. By hand, 20 words per book across chapters: open the chain page and the word's card in a browser; read the chain link by link against the card (the pressed reading, its source, its record). Note anything a reader would stumble on: a link that names an internal term, a step that is skipped, a source named differently on the two pages.
4. The plain words: the chain pages' own labels and sentences, read once by the owner's taste test (bitter: a harmful sense; sour: our working language leaking, or padding). List candidates; change nothing.

Output: `findings.md`, `chain-disagreements.tsv`, `chain-read-by-hand.tsv`.
