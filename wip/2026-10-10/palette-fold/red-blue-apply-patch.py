import sys
src = open(sys.argv[1], encoding='utf-8').read()
def rep(old, new):
    global src
    assert src.count(old) == 1, ('anchor not unique or missing', old[:80], src.count(old))
    src = src.replace(old, new)
rep('''    --shani-ink: #9d4355; --tekhelet-ink: #34649a;
    /* TWO BLUES, AS THE NAME HAS (the owner, 2026-10-03: "id avoid blue as a
       highlight. similar to our logo id have 2 blues: a bold and a regular,
       maybe the letters bold too not just the color"): a reading at rest is
       the regular blue; the reading pressed is this one, worn bold. Nothing
       is ever filled with a color ("we shouldnt ever have to full fill"). */
    --tekhelet-bold: #22508a;
''', '''    --shani-ink: var(--shani); --tekhelet-ink: var(--tekhelet);
    /* A REGULAR AND A DIM, AND NO BOLD (the owner, 2026-10-10: "personally i
       dont see a gain from more than 2/2/2/2 and 3 linen", then "id probably
       go regular and dim. i dont like our bold that much" and "but you get
       how uniform it can be and also all in the logo matching"). The red and
       the blue are two shades each, the same two the woven name is dyed in.
       The regular carries every word: the corpus's letters, every reading,
       and a reading pressed, which is the regular worn bold. The deeper blue
       a pressed reading wore since 2026-10-03 ("similar to our logo id have
       2 blues: a bold and a regular, maybe the letters bold too not just the
       color") is gone; the bold letters stay. The dim carries only what
       stands between pieces and beside them: the maqaf on a card's head, the
       + between a reading's parts, the red rail along a commentary. Nothing
       is ever filled with a color ("we shouldnt ever have to full fill"). */
''')
rep('''       linen darkens one step, and its letters are bold in their own ink, the
       bold blue for a reading, the purple for a control. */
    --press-wash: #dccbaa;
    --wash-shani: #eedcd6;
    /* the held word: its own wash, more opaque — never a third color (owner,
       2026-09-11: "move away from gold as the highlighting itself and move
       toward just a more opaque red and blue") */
    --held-shani: #dbb9b6;
    --held-tekhelet: #b9c6e6;
    --halo-shani: rgba(157, 67, 85, 0.75);
''', '''       linen darkens one step, and its letters are bold in their own ink: the
       regular blue, worn bold, for a reading; the purple for a control. */
    --press-wash: #dccbaa;
    /* the regular red and blue at three quarters, a glow for the halo accent
       (:root[data-accent="halo"]), which nothing turns on */
    --halo-shani: rgba(157, 67, 85, 0.75);
''')
rep('''    --tekhelet: #34649a; --tekhelet-dim: #7f8ba8;
    --wash-tekhelet: #dfe4f1;
''', '''    --tekhelet: #34649a; --tekhelet-dim: #7f8ba8;
''')
rep('''    --c-word: #9d4355; --en-word: #9d4355;''', '''    --c-word: var(--shani); --en-word: var(--shani);''')
rep('''  /* the pressed reading: the pressed-cell rule (--press-wash, above), its
     letters the bold blue */
  #hud .r-pills button[aria-pressed="true"] { color: var(--tekhelet-bold);''', '''  /* the pressed reading: the pressed-cell rule (--press-wash, above), its
     letters the regular blue, worn bold */
  #hud .r-pills button[aria-pressed="true"] { color: var(--tekhelet-ink);''')
rep('''  #hud .r-overflow select.on { color: var(--tekhelet-bold);''', '''  #hud .r-overflow select.on { color: var(--tekhelet-ink);''')
open(sys.argv[2], 'w', encoding='utf-8').write(src)
print('ok', len(src))
