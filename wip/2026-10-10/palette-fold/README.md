# The palette fold: a regular and a dim per color, three linens (draft, not live)

The owner, 10 October 2026: "personally i dont see a gain from more than 2/2/2/2 and 3 linen"; "id probably go regular and dim. i dont like our bold that much"; "but you get how uniform it can be and also all in the logo matching"; "the purple and gold while not bold are fairly electric which is fine just my take". Also: "i am really not a colors person dont change everything by my eye", and "my main point is uniform coloring between logo and site".

The rule: every color is a regular and a dim, with no bold color. Titles take the regular and running text the dim, and the dim must still read as body text. Use only values the site already has. The woven logo is dyed in the same pairs.

## What the agents proposed (fold-results.json holds all of it)

| Family | Regular | Dim | Reviewed |
|---|---|---|---|
| Red | #9d4355 | #b76670 | already so; no change |
| Blue | #34649a | #7f8ba8 (bold #22508a folds into the regular) | skeptic: does NOT hold, see below |
| Gold | #93661a (the old --line) | #a06c10 (the old --gold; borders, marks, the name) | not reviewed (the run was stopped to save tokens) |
| Purple | #561f86 | #6c359e (every other purple folds in) | not reviewed |
| Linen | #ebdec3 ground, the cell glaze (about #e1d4b8), #dccbaa pressed | | not reviewed |

## Open before shipping

1. **Blue (blocker).** Without the bold blue, a pressed reading on the card falls to 3.83:1 at 12px bold, under the 4.5:1 floor. Either accept it, keep the pressed reading's own treatment, or take the dims from the logo's own light threads (#ab5f6b red, #547ba5 blue): the skeptic's alternative B. The .com dot's thread overlay in build-wordmark-v1.py (lines 187-193) also mixes a darker blue.
2. **Gold.** The proposal moves the name's "and" from #c4921c to #a06c10. The logo drafts showed this reads visibly deeper and browner. The owner likes the electric gold and said "just not that dark gold".
3. **Purple.** The owner leans to the electric #772ba3 as the regular. The proposal keeps #561f86. Both pairs pass for text with #6c359e as the dim.
4. **Linen.** The commentary parchment folds into the ground, which fails check-color-channels-v1's "a commentary does not sit on the text's own surface". That check needs a ruling, or the commentary keeps the pressed linen.
5. Review gold, purple and linen (the skeptics never ran), then apply. purple-zone.diff, purple-door.diff and the patch scripts are here. Then the door build, which rewrites the 976 pages and census/ and demonstrations/. Then one suite, then push.
6. **Logo.** Re-weave from the settled pairs. logo/ holds two earlier drafts' builder diffs and contact sheets (both scored 6/10, drawn before the regular-and-dim rule) and the full results.

shots/ holds the before/after the owner saw.
