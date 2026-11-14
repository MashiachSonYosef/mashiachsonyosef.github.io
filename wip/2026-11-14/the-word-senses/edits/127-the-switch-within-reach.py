# zone.html, word-senses-rule-v1: the review of 14 November 2026, the reader's side.
#  1. The switch stands in the page's row of pills, «word senses», beside «framed»: the card's own "show" sits in a
#     line a tight card folds away, which on a phone is most cards, so most readers could not reach the switch.
#  2. The card's press keeps one name, "word senses", with aria-pressed saying where it stands, and keeps the focus
#     when the card is built again under it.
#  3. The rail and the switches page credit the switch to this project's claim, not to the sources: Jastrow does not
#     say which bracket is a sense; the corpus lane's list, under the owner's ruling, does.
#  4. The rule's comment says what moves: the resting line is the store's and no switch moves it; a word sense the
#     reader pressed prints on its line and goes back when the switch goes off.
# Refused unless each text stands once.
# python3 -I 127-the-switch-within-reach.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
# 1. the pill
one("""    <!-- RESET TO DEFAULT (the owner, 2026-10-18: "maybe we need a reset to""", """    <!-- THE WORD SENSES PILL (word-senses-rule-v1; the owner, 2026-11-13:
         "toggle on word senses"). Off, where it rests, a note Jastrow sets in
         brackets on a word's sense is held back from the card; on, each prints
         as "word sense, not definition: ..." in purple. The card's own "show"
         sits in a line a tight card folds away, most cards on a phone (the
         review of 2026-11-14), so the switch stands here too, where nothing
         folds it. Kept on this device. -->
    <span class="mode-pick"><button type="button" class="blob-btn" id="sensesPill" aria-pressed="false" aria-describedby="sensesState" title="Jastrow&#8217;s notes in square brackets on a word&#8217;s sense: held back from the card, or shown as word senses, never as definitions">word senses</button><span class="mode-dir" id="sensesState"></span></span>
    <!-- RESET TO DEFAULT (the owner, 2026-10-18: "maybe we need a reset to""")
one("""title="the switches back to their default (English off, framed off, card numbering on, the concordance hud off) and""",
    """title="the switches back to their default (English off, framed off, card numbering on, the concordance hud off, word senses off) and""")
one("""  const dictPill = document.getElementById("dictPill"), dictState = document.getElementById("dictState");
""", """  // the word senses pill: on or off, as the switch stands (chooseSenses, which
  // answers through reopenForSenses, paints it again)
  const sensesPill = document.getElementById("sensesPill"), sensesState = document.getElementById("sensesState");
  const paintSensesPill = () => {
    const on = sensesPref === "on";
    sensesPill.classList.toggle("on", on); sensesPill.setAttribute("aria-pressed", String(on));
    sensesState.textContent = "";
  };
  sensesPill.addEventListener("click", (e) => { e.stopPropagation(); chooseSenses(sensesPref === "on" ? "off" : "on"); });
  paintSensesPill();
  const dictPill = document.getElementById("dictPill"), dictState = document.getElementById("dictState");
""")
one("""  reopenForSenses = () => {
    if (sensesPref !== "on") forgetSensePicks();
    if (document.getElementById("railRows")) railSwitch();
    reopenCard();
  };""", """  reopenForSenses = () => {
    if (sensesPref !== "on") forgetSensePicks();
    paintSensesPill();
    if (document.getElementById("railRows")) railSwitch();
    reopenCard();
  };""")
# 2. the card's press: one name, and the focus kept
one("""            b.setAttribute("aria-pressed", String(!pool.withheldBySense));
            b.addEventListener("click", (e) => { e.stopPropagation(); chooseSenses(pool.withheldBySense ? "on" : "off"); });
            parts.push(b);""", """            // one name whatever it shows, and aria-pressed says where it stands;
            // pressed, the card is built again under it and the focus comes back
            // to it there (the review of 14 November 2026)
            b.setAttribute("aria-label", "word senses");
            b.setAttribute("aria-pressed", String(!pool.withheldBySense));
            b.addEventListener("click", (e) => { e.stopPropagation(); sensesFocus = true; chooseSenses(pool.withheldBySense ? "on" : "off"); });
            if (sensesFocus) { sensesFocus = false; requestAnimationFrame(() => { if (b.isConnected) b.focus({ preventScroll: true }); }); }
            parts.push(b);""")
one("""  let reopenForSenses = () => {};       // the switch answered on the page (set after the sections' relay, below)
""", """  let reopenForSenses = () => {};       // the switch answered on the page (set after the sections' relay, below)
  let sensesFocus = false;              // the card's press was the switch: its rebuilt press takes the focus
""")
# 3. the voice
one("""    { id: "senses", voice: "them", lab: "word senses",""", """    { id: "senses", voice: "claim", lab: "word senses",""")
# 4. the comment
one("""  // with a press that shows them. On, it prints as SENSE_PRINTS and its
  // route, a pill of its own beside the definitions. The line is the
  // store's, so no line moves either way. Kept on this device; ?senses= sets
  // it for one load (the checks ask it).""", """  // with a press that shows them; the switch also stands in the row of pills
  // («word senses»). On, it prints as SENSE_PRINTS and its route, a pill of
  // its own beside the definitions, purple. The resting line is the store's,
  // and no switch moves it; a word sense the reader presses prints on its
  // line as any pill pressed does, and goes back when the switch goes off
  // (forgetSensePicks). Kept on this device; ?senses= sets it for one load
  // (the checks ask it).""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the switch within reach")
