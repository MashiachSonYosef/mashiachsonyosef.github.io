# Agent 5 External Research Notes

Generated: 2026-05-31

## Question

Does external practice support a "more is better" HUD, or does it point toward minimal visible UI?

Conclusion: more is better for this product because it is a workbench, not a translation publication. The external lesson is not "hide the complexity." It is "separate the kinds of complexity so dense display does not become false certainty." Mature Hebrew and linguistic systems preserve many layers, but they separate the base text, word/token layer, morphology, syntax, lexeme/gloss, usage evidence, and query/audit layer.

## Patterns Found

### 1. Mature Hebrew corpora are layered, not single-answer widgets

BHSA/ETCBC exposes separate feature groups for sections, lexemes, words, morphology, morphemes, linguistic units, and relationships. Word-level features include orthography and lexical fields; morphology includes gender, number, state, stem, tense; morpheme fields include nominal endings, preformatives, pronominal suffixes, final elements, verbal endings, and root formation.

Control implication:

- Agent 2 should own route-card data as a versioned linguistic layer.
- Agent 4 should render layers progressively.
- Agent 3 should not be pushed into the definition layer.

Sources:

- https://etcbc.github.io/bhsa/features/0_home/
- https://etcbc.github.io/shebanq/

### 2. Serious tools keep query/audit power separate from reader display

SHEBANQ stores the Hebrew Bible plus ETCBC linguistic annotations and specializes in query sharing/publishing. It does not imply that every annotation should be visible in the main reading line.

Control implication:

- Our HUD can be dense by default because this is a workbench.
- Density must be typed: answer candidates, morphology, usage evidence, and audit rows need distinct visual lanes.
- "Show all" is acceptable if the UI makes uncertainty, source class, and answer eligibility obvious.

Source:

- https://etcbc.github.io/shebanq/

### 3. Hebrew tokenization requires two layers: surface token and syntactic/morphological parts

Universal Dependencies explicitly separates orthographic tokens from syntactic words in languages like Hebrew where whitespace-delimited tokens can be ambiguous. Ancient Hebrew UD separates prepositions, possessive/object pronouns, conjunction ו, and definite ה into tokens. Modern Hebrew UD also notes ambiguity where prefixed ב or ל may or may not include a covert definite marker.

Control implication:

- Agent 4 must preserve whole clickable surface tokens while displaying prefix/suffix segmentation as analysis, not by physically splitting rendered Hebrew words.
- The split-token guard is not cosmetic; it is a necessary surface-token versus analysis-token invariant.

Sources:

- https://universaldependencies.org/u/overview/tokenization.html
- https://universaldependencies.org/he/index.html
- https://universaldependencies.org/hbo/index.html

### 4. Interlinear glossing is compact but explicitly not a complete analysis

Leipzig glossing rules support morpheme-by-morpheme display and hyphen correspondence, but the rules themselves warn that glossing does not decide between morphological analyses and is rarely a complete morphological description.

Control implication:

- Under-word microglosses can be powerful and should be allowed as a workbench mode.
- They must be marked as gloss/analysis, not final definition.
- The product can show compact morphology under words while keeping uncertainty and provenance one click away in the HUD.

Source:

- https://www.eva.mpg.de/lingua/resources/glossing-rules.php?branch_used=true

### 5. OpenScriptures and MACULA show the "integrated facets" model

OpenScriptures frames its Hebrew Bible project as an integration of text, lexicon, morphology, and cantillation. MACULA combines WLC text, Open Scriptures morphology, syntax trees, word sense data, glosses, semantic roles, and participant referents, with multiple file shapes for NLP, query, display, and simpler word-level data.

Control implication:

- The better product thesis is not "one HUD to rule everything." It is an integrated facet stack.
- Our competitive edge can be a reader-first UI over a transparent multi-facet evidence graph.

Sources:

- https://hb.openscriptures.org/
- https://github.com/Clear-Bible/macula-hebrew

### 6. Westminster morphology shows the scale of "finished"

The Groves Center describes Westminster Hebrew Morphology as word-by-word analysis of every word in the Hebrew Bible, continuously developed since 1991.

Control implication:

- Agent 2 cannot "finish Hebrew morphology" in the general sense. He can finish a release-candidate route layer.
- Scope control matters more than trying to solve the whole language.

Source:

- https://grovescenter.org/file-downloads/

## Strategic Product Rule

Use "maximum evidence, maximum labeling, minimum false certainty."

Workbench reader surface:

- Dense by default is acceptable.
- Show best answer, alternatives, morphology, usage-evidence counts, and source status if the visual hierarchy is clear.
- Under-word glosses are acceptable as configurable workbench overlays.
- Ambiguous rows can be visible, but must be visibly ambiguous and must not occupy the same semantic slot as an accepted definition.
- No row should silently fall back to `undefined`, blank labels, or unlabeled evidence.

Expanded HUD:

- Definition candidate rows.
- Morphology analysis.
- Prefix/suffix/maqaf treatments.
- Usage evidence.
- Sources/licenses.
- Ranking/audit details.

Workbench/Agent 3:

- Not definitions.
- Observed usage commentary.
- Source-frame clusters.
- Hidden by default unless supported/candidate, or shown in a dedicated Usage evidence lane.

## New Lane Assignments

Agent 2:

- Stop thinking "more route families" until release stamp exists.
- Produce a frozen route-card generation with manifest/count reconciliation.

Agent 3:

- Stop broad meaning discovery.
- Produce selected, validated usage-evidence packages and a public handoff index.

Agent 4:

- Preserve whole surface tokens.
- Render morphology and usage evidence as separate facets.
- Avoid `undefined` by design: every lane has explicit empty/fallback text.

Agent 5:

- Own the "maximum evidence, maximum labeling, minimum false certainty" rule.
- Block release claims that collapse layers.
- Push for a dense workbench UX, not a sanitized translation UX.

## Control Refresh 2026-05-31T12:10:00-04:00

Fresh sources checked:

- Universal Dependencies Ancient Hebrew: https://universaldependencies.org/hbo/index.html
- BHSA/Text-Fabric feature documentation: https://etcbc.github.io/bhsa/features/otype/
- Sefaria API documentation: https://github.com/Sefaria/Sefaria-Project/wiki/API-Documentation/948bb3dcf283653163a2d0a6b88dca152cabaf76
- Logos Bible Word Study documentation: https://support.logos.com/hc/en-us/articles/360016688811-Studying-Words-Using-the-Bible-Word-Study-Guide
- Universal Dependencies v2 overview paper: https://arxiv.org/abs/2004.10643

Updated synthesis:

- UD Ancient Hebrew explicitly separates small syntactic/morphological units such as prefixed prepositions, conjunctions, determiners, and pronominal suffixes. That supports our need for segmentation metadata, but not runtime splitting of source surface tokens unless the UI clearly marks it as analysis.
- BHSA treats word occurrences as stable slots and keeps multiple textual representations rather than pretending one string is canonical. That supports storing stable occurrence IDs, surface form, consonantal/normalized lookup key, lexical key, and inter-word/trailer material separately.
- Sefaria's API model is reference/link centered. That supports making citation/source refs first-class in every workbench artifact, not optional display text.
- Logos' word-study workflow is faceted: lemma, translation, root, senses, example uses, clause participants, textual searches, and commentary-in-passage are separate sections. That supports a dense HUD/workbench, but only if each lane is typed and answer eligibility is explicit.
- The UD v2 overview frames serious linguistic annotation as word segmentation plus morphology plus syntax, not a single lexical answer. That supports our long-term translation-memory direction: future translation should compose over stored occurrence decisions and evidence facets, not rerun discovery.

Control decision:

- "More is better" remains correct for workbench mode.
- The product risk is not density. The risk is layer collapse.
- The architecture should require a typed lane for every datum that reaches the reader: surface token, segmentation, lemma/form, definition candidate, usage evidence, source/license, citation, ranking, and translation-memory status.

Near-term consequence:

- Agent 4's split-token problem is now an architecture issue, not just UI polish. The reader must preserve source-level surface tokens while optionally displaying segmented analysis underneath or in the HUD.
- Agent 2 should keep route cards answer-eligible typed, because faceted word-study products separate lemma/definition from translation/use/commentary.
- Agent 3 output belongs in usage/citation lanes and can be dense, but it should never be promoted into the Definition lane without a separate decision artifact.
