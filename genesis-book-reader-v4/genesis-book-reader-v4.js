(() => {
  "use strict";

  // V4 is an editorial descendant of the frozen V3 proof, not a replacement
  // renderer. The retained v3-* selector ABI is deliberate and validator-bound.
  const v4Ancestry = Object.freeze({
    parent: "genesis-book-reader-v3",
    parent_validation_id: "genesis-book-reader-v3-validation-2026-07-22",
    parent_sha256: Object.freeze({
      html: "2f20f39af2e3d31d7d1d38d5c722256487efebb4d210682298e6d8e9707b62f8",
      css: "e4167eeb299086a26a5ff098a99ba5085d7ab803df733b846659dfa11c07aed4",
      js: "51cb100fefefbfafa1eeeefdb7be4add27f42551e60484ee9c22f59f344ae4b2",
      validator:
        "aa3fd49f95638202e74bb1818de2e517c98c3b89f087d06d9290c98684843ca1",
      validation:
        "d5e0a7151f2fc6c91ddecb94d8c805070e5eeb3b995c120ba0396dba368d5fea",
    }),
    retained_selector_abi: "v3-*",
    scope: "bounded-genesis-1-1-through-1-2-editorial-proof-slice",
  });

  const v4EditorialLock = Object.freeze({
    lock_id: "genesis-book-reader-v4-primary-stager-lock-2026-07-23",
    status: "PRIMARY_STAGER_EXAMPLE",
    locked_css_sha256:
      "56ec803a046845329d74e7bdebba4e2b5bc36e0908b76dd2b7cb96aff79c4028",
    retained_selector_abi: "v3-*",
    locked_surfaces: Object.freeze([
      "dark_biblical_palette",
      "collapsible_toc",
      "hebrew_reader_and_english_workbench",
      "raw_hebrew_selected_gloss_selectable_hud",
      "one_aggregate_commentary_bubble_per_word",
      "conditional_commentary_workspace",
      "sources_and_licenses_drawer",
    ]),
    permitted_v4_work:
      "data expansion, validation, accessibility, and defect repair without structural redesign",
  });

  // V4.1 editorial amendment, owner-directed 2026-08-10: the commentary
  // workspace holds every attached unit of every track open at once, the
  // per-word HUD regains its D definition card, and the full witness ledger
  // presents all recorded works on the verse. The V4 lock's one-at-a-time
  // conditional workspace is superseded by the owner's directive to present
  // the received data whole.
  const v41EditorialAmendment = Object.freeze({
    amendment_id: "genesis-book-reader-v4-1-present-whole-2026-08-10",
    supersedes: "conditional_commentary_workspace (single active unit)",
    added_surfaces: Object.freeze([
      "stacked_commentary_workspace_all_tracks_open",
      "hud_d_definition_card",
      "full_witness_ledger_genesis_1_1",
    ]),
    display_discipline:
      "original-language text renders only where its license record clears display; held segments stay visible as metadata",
  });

  const readerAxisContract = Object.freeze({
    numbering_scope: "UNIT_LOCAL",
    authoritative_order: "C0_SPAN",
    canonical_dom_sequence: Object.freeze([1, 2, 3, 4, 5, 6, 7]),
    modes: Object.freeze({
      hebrew: Object.freeze({
        label: "Hebrew reader",
        layout_axis: "rtl",
        source_order: "1-7",
      }),
      english: Object.freeze({
        label: "English workbench",
        layout_axis: "ltr",
        source_order: "1-7",
      }),
    }),
  });

  // V6.6 · the policy now states what is actually true: this is a public,
  // non-commercial project. `public_release: false` was false on a site
  // that has been publicly deployed for weeks. `commercial_use: false` is
  // unchanged and is what opens every Creative Commons posture, including
  // NonCommercial — attribution still rides with each record, per source.
  const displayPolicy = Object.freeze({
    mode: "PUBLIC_NONCOMMERCIAL",
    public_release: true,
    commercial_use: false,
    base_text_display_authority: "RECORDED_PER_MATERIALIZED_SECTION",
  });

  const navigation = window.Y_GENESIS_NAVIGATION_V1;
  const titleHudFixture = window.Y_TITLE_HUD_FIXTURE;
  const baseFixture = window.GENESIS_1_1_FULL_HUD_FIXTURE;
  const commentaryData = window.GENESIS_1_1_COMMENTARY;
  const rashiFixture = window.NESTED_RASHI_HUD_FIXTURE;
  const onkelosFixture = window.NESTED_ONKELOS_HUD_FIXTURE;
  const attachmentMap = window.V2_GENESIS_1_1_ATTACHMENT_MAP;
  const generatedSectionRegistry =
    window.GENESIS_READER_SECTIONS || Object.create(null);
  const legacyProofCommentaryByRef = new Map(
    [
      ...(commentaryData?.commentary || []),
      ...(commentaryData?.targum || []),
    ].flatMap((index) =>
      (index.segments || []).map((segment) => [
        segment.ref,
        {
          ...segment,
          commentary_index:
            index.commentary_index ||
            index.targum_index ||
            index.family_title ||
            "",
        },
      ]),
    ),
  );

  const elements = {
    bookTitle: document.querySelector("#v3-book-title"),
    bookCounts: document.querySelector("#v3-book-counts"),
    chapterGrid: document.querySelector("#v3-chapter-grid"),
    chapterNavigation: document.querySelector("#v3-book-navigation"),
    chapterDrawerButton: document.querySelector(
      "#v3-chapter-drawer-button",
    ),
    closeChapters: document.querySelector("#v3-close-chapters"),
    currentChapter: document.querySelector("#v3-current-chapter"),
    currentVerseCount: document.querySelector("#v3-current-verse-count"),
    chapterPosition: document.querySelector("#v3-chapter-position"),
    chapterHeading: document.querySelector("#v3-chapter-heading"),
    previousChapter: document.querySelector("#v3-previous-chapter"),
    nextChapter: document.querySelector("#v3-next-chapter"),
    copyCanonical: document.querySelector("#v3-copy-canonical"),
    commentaryLayerToggle: document.querySelector(
      "#v3-commentary-layer-toggle",
    ),
    hebrewLicenseSummary: document.querySelector(
      "#v4-hebrew-license-summary",
    ),
    hebrewLicenseSummaryCompact: document.querySelector(
      "#v4-hebrew-license-summary-compact",
    ),
    readingPane: document.querySelector("#v3-reading-pane"),
    verseStream: document.querySelector("#v3-verse-stream"),
    commentaryPane: document.querySelector("#v3-commentary-pane"),
    commentaryHeading: document.querySelector("#v3-commentary-heading"),
    commentaryContent: document.querySelector("#v3-commentary-content"),
    commentaryStepper: document.querySelector("#v4-commentary-stepper"),
    commentaryPosition: document.querySelector("#v4-commentary-position"),
    previousCommentary: document.querySelector(
      "#v4-previous-commentary",
    ),
    nextCommentary: document.querySelector("#v4-next-commentary"),
    returnToSource: document.querySelector("#v3-return-to-source"),
    closeCommentary: document.querySelector("#v3-close-commentary"),
    axisLegend: document.querySelector("#v3-axis-legend"),
    navigationHud: document.querySelector("#v3-navigation-hud"),
    attributionButton: document.querySelector("#v3-attribution-button"),
    attributionDrawer: document.querySelector("#v3-attribution-drawer"),
    attributionContent: document.querySelector("#v3-attribution-content"),
    closeAttribution: document.querySelector("#v3-close-attribution"),
    drawerScrim: document.querySelector("#v3-drawer-scrim"),
    liveStatus: document.querySelector("#v3-live-status"),
    railToolbar: document.querySelector("#v5-rail-toolbar"),
    railWorkSelect: document.querySelector("#v5-rail-work"),
    railSnapState: document.querySelector("#v5-rail-snap-state"),
    railDivider: document.querySelector("#v5-rail-divider"),
    railB: document.querySelector("#v5-rail-b"),
    railBContent: document.querySelector("#v5-rail-b-content"),
    railBWorkSelect: document.querySelector("#v5-rail-b-work"),
    railBSnapState: document.querySelector("#v5-rail-b-snap-state"),
    railBHeading: document.querySelector("#v5-rail-b-heading"),
    openRailB: document.querySelector("#v5-open-rail-b"),
    closeRailB: document.querySelector("#v5-close-rail-b"),
    hebrewSmaller: document.querySelector("#v5-hebrew-smaller"),
    hebrewLarger: document.querySelector("#v5-hebrew-larger"),
    shareLink: document.querySelector("#v5-share-link"),
    deckToggle: document.querySelector("#v5-deck-toggle"),
  };

  const requiredData = [
    navigation,
    titleHudFixture,
    baseFixture,
    commentaryData,
    rashiFixture,
    onkelosFixture,
    attachmentMap,
  ];
  const requiredElements = Object.values(elements);

  const make = (tagName, className = "", text = "") => {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const setText = (node, text) => {
    if (node.textContent !== text) node.textContent = text;
  };

  const announce = (text) => setText(elements.liveStatus, text);

  if (
    requiredData.some((value) => !value) ||
    requiredElements.some((value) => !value)
  ) {
    if (elements.verseStream) {
      elements.verseStream.replaceChildren(
        make(
          "p",
          "v3-pane-status",
          "The book reader could not establish its exact local data contract.",
        ),
      );
    }
    return;
  }

  document.body.dataset.v3MobileWorkspace = "text";
  document.body.dataset.v3ReaderMode = "hebrew";
  document.body.dataset.v3CommentaryOpen = "false";
  document.body.dataset.v3CommentaryLayer = "on";
  document.body.dataset.v3AttributionOpen = "false";
  document.documentElement.dataset.readerVersion = "4-editorial-proof-slice";
  window.V4_READER_ANCESTRY = v4Ancestry;
  window.V4_EDITORIAL_LOCK = v4EditorialLock;
  window.V4_READER_AXIS_CONTRACT = readerAxisContract;
  window.V4_DISPLAY_POLICY = displayPolicy;

  const nodesById = new Map(
    navigation.nodes.map((node) => [node.y_node_id, node]),
  );
  const workNode = navigation.nodes.find(
    (node) => node.node_kind === "WORK" && node.branch_kind === "BASE",
  );
  const chapterNodes = navigation.nodes
    .filter(
      (node) =>
        node.node_kind === "CHAPTER" &&
        node.branch_kind === "BASE" &&
        node.parent_y_node_id === workNode?.y_node_id,
    )
    .sort((left, right) => left.order_path.localeCompare(right.order_path));
  const versesByChapterId = new Map();
  chapterNodes.forEach((chapter) => {
    versesByChapterId.set(
      chapter.y_node_id,
      navigation.nodes
        .filter(
          (node) =>
            node.node_kind === "SECTION" &&
            node.branch_kind === "BASE" &&
            node.parent_y_node_id === chapter.y_node_id,
        )
        .sort((left, right) =>
          left.order_path.localeCompare(right.order_path),
        ),
    );
  });

  const chapterNumber = (chapter) => {
    const match = /Genesis\s+(\d+)$/u.exec(chapter?.public_ref || "");
    return match ? Number(match[1]) : 0;
  };

  const verseNumber = (verse) => {
    const match = /Genesis\s+\d+:(\d+)$/u.exec(verse?.public_ref || "");
    return match ? Number(match[1]) : 0;
  };

  const chapterByNumber = new Map(
    chapterNodes.map((chapter) => [chapterNumber(chapter), chapter]),
  );
  const readerC0Projection = Object.freeze([
    {
      word_index: 1,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828900",
      end_c0_id: "C0-000000000000000069828901",
      c0_count: 2,
      c0_ids: [
        "C0-000000000000000069828900",
        "C0-000000000000000069828901",
      ],
    },
    {
      word_index: 2,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828902",
      end_c0_id: "C0-000000000000000069828902",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828902"],
    },
    {
      word_index: 3,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828903",
      end_c0_id: "C0-000000000000000069828903",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828903"],
    },
    {
      word_index: 4,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828904",
      end_c0_id: "C0-000000000000000069828904",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828904"],
    },
    {
      word_index: 5,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828905",
      end_c0_id: "C0-000000000000000069828905",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828905"],
    },
    {
      word_index: 6,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828906",
      end_c0_id: "C0-000000000000000069828906",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828906"],
    },
    {
      word_index: 7,
      unit_id: "genesis-1-1",
      start_c0_id: "C0-000000000000000069828907",
      end_c0_id: "C0-000000000000000069828907",
      c0_count: 1,
      c0_ids: ["C0-000000000000000069828907"],
    },
  ]);

  const attachmentAuthorityTargets = Object.freeze({
    "rashi-genesis-1-1-1-word-1": {
      kind: "C0_SPAN",
      start_c0_id: "C0-000000000000000069828900",
      end_c0_id: "C0-000000000000000069828901",
      c0_count: 2,
    },
    "onkelos-genesis-1-1-verse": {
      kind: "Y_NODE",
      y_node_id: "Y-GEN-001-001",
    },
  });

  // V6 synthesis lane: default glosses are never hand picks left in code.
  // Attested (human, recorded in synthesis/attestations with provenance)
  // outranks derived (rule v1, DERIVED_DRAFT, generated by
  // tools/derive-default-glosses.mjs). The legacy seven picks this map once
  // held are preserved only as dispute rows in the synthesis ledger.
  const synthesisDerivedDefaults =
    window.SYNTHESIS_DEFAULT_GLOSSES?.by_word_index || {};
  const synthesisAttestations =
    window.SYNTHESIS_GLOSS_ATTESTATIONS?.by_word_index || {};
  const preferredBaseGlosses = new Map();
  const baseGlossProvenance = new Map();
  Object.entries(synthesisDerivedDefaults).forEach(([index, entry]) => {
    if (!entry?.gloss) return;
    preferredBaseGlosses.set(Number(index), entry.gloss);
    baseGlossProvenance.set(Number(index), {
      status: "derived",
      signal: entry.signal || "",
      gloss: entry.gloss,
    });
  });
  Object.entries(synthesisAttestations).forEach(([index, entry]) => {
    if (!entry?.gloss) return;
    preferredBaseGlosses.set(Number(index), entry.gloss);
    baseGlossProvenance.set(Number(index), {
      status: "attested",
      signal: entry.attested_by || "attested",
      gloss: entry.gloss,
    });
  });

  const legacyGenesis11Bundle = Object.freeze({
    pipeline_id: "legacy-genesis-1-1-v4-adapter",
    ref: "Genesis 1:1",
    unit_id: "genesis-1-1",
    y_node_id: "Y-GEN-001-001",
    base: Object.freeze({
      source: Object.freeze({
        ref: "Genesis 1:1",
        version_title:
          "Hebrew Wikisource Miqra according to the Masorah - accented edition",
        source_url:
          "https://he.wikisource.org/w/index.php?title=%D7%A7%D7%98%D7%92%D7%95%D7%A8%D7%99%D7%94%3A%D7%91%D7%A8%D7%90%D7%A9%D7%99%D7%AA+%D7%90+%D7%90&oldid=2706236",
        license: "CC BY-SA 4.0",
        source_language: "he",
        source_attribution_required: true,
      }),
      words: baseFixture.words,
      reader_c0_projection: readerC0Projection,
      canonical_sequence: readerAxisContract.canonical_dom_sequence,
      preferred_glosses: Object.fromEntries(preferredBaseGlosses),
    }),
    attachment_map: attachmentMap,
    attachment_authority_targets: attachmentAuthorityTargets,
    commentaries: Object.freeze({
      [rashiFixture.source.ref]: Object.freeze({
        fixture: rashiFixture,
        registry: "NESTED_RASHI_HUD_WORDS",
        scope: "rashi-genesis-1-1-1",
      }),
      [onkelosFixture.source.ref]: Object.freeze({
        fixture: onkelosFixture,
        registry: "NESTED_ONKELOS_HUD_WORDS",
        scope: "onkelos-genesis-1-1",
      }),
    }),
  });

  const adaptGeneratedSection = (section) => {
    if (!section || !section.ref) return null;
    const commentaries =
      section.commentaries ||
      Object.fromEntries(
        (section.commentary_fixtures || []).map((fixture) => [
          fixture.source.ref,
          {
            fixture,
            registry:
              fixture.exact_hud.registry_global || "GENESIS_HUD_WORDS",
            scope: `commentary-${fixture.fixture_id}`,
          },
        ]),
      );
    return {
      ...section,
      base:
        section.base ||
        {
          words: section.base_words || [],
          source: section.base_source || null,
          reader_c0_projection: section.reader_c0_projection || [],
          canonical_sequence: section.canonical_dom_sequence || [],
          preferred_glosses:
            section.preferred_glosses?.by_word_index || {},
        },
      attachment_map:
        section.attachment_map ||
        {
          map_id: `${section.bundle_id}-attachment-map`,
          base_ref: section.ref,
          base_word_count: section.base_word_count,
          claims: section.attachment_claims || [],
        },
      attachment_authority_targets:
        section.attachment_authority_targets || {},
      commentaries,
    };
  };
  const generatedSections = Object.entries(generatedSectionRegistry)
    .map(([ref, section]) =>
      section?.ref === ref ? adaptGeneratedSection(section) : null,
    )
    .filter(
      (section) =>
        section?.base?.words?.length > 0 &&
        section?.attachment_map?.claims,
    );
  const sectionsByRef = new Map([
    [legacyGenesis11Bundle.ref, legacyGenesis11Bundle],
    ...generatedSections.map((section) => [section.ref, section]),
  ]);
  const orderedBaseSourceSections = navigation.nodes
    .filter(
      (node) =>
        node.node_kind === "SECTION" &&
        node.branch_kind === "BASE" &&
        node.public_ref,
    )
    .sort((left, right) => left.order_path.localeCompare(right.order_path));
  const sourceSectionOrderByRef = new Map(
    orderedBaseSourceSections.map((node, index) => [node.public_ref, index]),
  );
  const sourceSectionOrderByYNode = new Map(
    orderedBaseSourceSections.map((node, index) => [node.y_node_id, index]),
  );

  const resolveYRangeCoverage = (target) => {
    if (target?.kind !== "Y_RANGE") return null;
    const start = sourceSectionOrderByYNode.get(target.start_y_node_id);
    const end = sourceSectionOrderByYNode.get(target.end_y_node_id);
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
      return null;
    }
    return {
      start,
      end,
      nodes: orderedBaseSourceSections.slice(start, end + 1),
    };
  };

  const baseHebrewLicenses = [
    ...new Set(
      [...sectionsByRef.values()]
        .map((section) => section.base?.source?.license)
        .filter(Boolean),
    ),
  ];
  const fullBaseHebrewLicenseLabel =
    baseHebrewLicenses.length > 0
      ? baseHebrewLicenses.join(" + ")
      : "License unavailable";
  const compactBaseHebrewLicenseLabel =
    baseHebrewLicenses.length > 0
      ? baseHebrewLicenses
          .map((license) => {
            if (/^public domain$/iu.test(license)) return "PD";
            if (/^cc by-sa/iu.test(license)) return "CC BY-SA";
            if (/^cc by/iu.test(license)) return "CC BY";
            return license;
          })
          .join(" + ")
      : "Unavailable";
  // V6.5: the header states no licenses — every section footer carries its
  // own N record, and this button is only the door to the full records. The
  // union label survives solely as backend hover/reference data.
  elements.attributionButton.setAttribute(
    "aria-label",
    "Open source and license records.",
  );
  elements.attributionButton.title =
    `Sources · ${fullBaseHebrewLicenseLabel}`;
  void compactBaseHebrewLicenseLabel;

  const sectionRuntimeCache = new WeakMap();

  const sectionRuntime = (section) => {
    if (!sectionRuntimeCache.has(section)) {
      const projection = section?.base?.reader_c0_projection || [];
      const preferred = section?.base?.preferred_glosses || {};
      sectionRuntimeCache.set(section, {
        projectionByWordIndex: new Map(
          projection.map((span) => [Number(span.word_index), span]),
        ),
        orderedC0Ids: projection.flatMap((span) => span.c0_ids || []),
        wordByIndex: new Map(
          (section?.base?.words || []).map((word) => [
            Number(word.index),
            word,
          ]),
        ),
        preferredGlosses:
          preferred instanceof Map
            ? preferred
            : new Map(
                Array.isArray(preferred)
                  ? preferred.map((entry) => [
                      Number(entry.word_index),
                      entry.gloss || entry.preferred_gloss || "",
                    ])
                  : Object.entries(preferred).map(([index, gloss]) => [
                      Number(index),
                      gloss,
                    ]),
              ),
      });
    }
    return sectionRuntimeCache.get(section);
  };

  const sectionForClaim = (claim) =>
    sectionsByRef.get(claim?.source_anchor_ref) || null;

  const assertedTarget = (section, claim) =>
    section?.attachment_authority_targets?.[claim?.claim_id] || null;

  const c0TargetDomId = (target) =>
    `v3-${target.start_c0_id.toLocaleLowerCase().replace(/[^a-z0-9]+/gu, "-")}`;

  const resolveC0Coverage = (section, target) => {
    if (target?.kind !== "C0_SPAN") return null;
    const runtime = sectionRuntime(section);
    const start = runtime.orderedC0Ids.indexOf(target.start_c0_id);
    const end = runtime.orderedC0Ids.indexOf(target.end_c0_id);
    if (
      start < 0 ||
      end < start ||
      end - start + 1 !== target.c0_count
    ) {
      return null;
    }
    const targetIds = new Set(runtime.orderedC0Ids.slice(start, end + 1));
    const wordIndices = (section.base.reader_c0_projection || [])
      .filter((span) =>
        (span.c0_ids || []).some((c0Id) => targetIds.has(c0Id)),
      )
      .map((span) => Number(span.word_index));
    if (!wordIndices.length) return null;
    return {
      start,
      end,
      c0_ids: [...targetIds],
      word_indices: wordIndices,
    };
  };

  const baseWordsForC0Claim = (section, claim) => {
    const coverage = resolveC0Coverage(section, assertedTarget(section, claim));
    if (!coverage) return [];
    const runtime = sectionRuntime(section);
    return coverage.word_indices
      .map((index) => runtime.wordByIndex.get(index))
      .filter(Boolean);
  };

  const visualHintContainsWord = (claim, word) => {
    const hint = claim?.visual_hint;
    return Boolean(
      claim?.claim_state === "VISUAL_SUGGESTION_ONLY" &&
        // V5.4: an interior headword cue (the quoted word sits mid-verse,
        // e.g. Ramban's va-amar ELOHIM) is the same suggestion discipline
        // as an opening-phrase cue.
        (hint?.grain === "OPENING_PHRASE" ||
          hint?.grain === "INTERIOR_PHRASE") &&
        Number.isInteger(hint.start_word_index) &&
        Number.isInteger(hint.end_word_index) &&
        word.index >= hint.start_word_index &&
        word.index <= hint.end_word_index,
    );
  };

  const claimCoverageForBaseWord = (section, claim, word) => {
    const target = assertedTarget(section, claim);
    if (
      target?.kind === "C0_SPAN" &&
      claim.claim_state === "PROVEN_EDGE" &&
      resolveC0Coverage(section, target)?.word_indices.includes(word.index)
    ) {
      return "PROVEN_C0_SPAN";
    }
    if (
      target?.kind === "Y_NODE" &&
      claim.claim_state === "PROVEN_EDGE" &&
      nodesById.get(target.y_node_id)?.public_ref === section.ref
    ) {
      return "PROVEN_VERSE";
    }
    if (
      target?.kind === "Y_RANGE" &&
      claim.claim_state === "PROVEN_EDGE" &&
      (resolveYRangeCoverage(target)?.nodes || []).some(
        (node) => node.public_ref === section.ref,
      )
    ) {
      return "PROVEN_SECTION_RANGE";
    }
    if (visualHintContainsWord(claim, word)) return "VISUAL_HINT";
    return "";
  };

  const claimsForBaseWord = (section, word) =>
    (section?.attachment_map?.claims || []).filter((claim) =>
      Boolean(claimCoverageForBaseWord(section, claim, word)),
    );

  const yTargetDomId = (target) => {
    const node = nodesById.get(target?.y_node_id);
    return node?.dom_anchor ? `v3-${node.dom_anchor}` : "";
  };

  const sectionArticleDomId = (section) => {
    const node = nodesById.get(section?.y_node_id);
    return node?.dom_anchor
      ? `v3-${node.dom_anchor}`
      : `v3-${section?.unit_id || "section"}`;
  };

  const sourceTargetIdForClaim = (section, claim) => {
    const target = assertedTarget(section, claim);
    if (target?.kind === "C0_SPAN") {
      const firstWordIndex = resolveC0Coverage(section, target)?.word_indices[0];
      const span =
        sectionRuntime(section).projectionByWordIndex.get(firstWordIndex);
      if (span) return c0TargetDomId(span);
    }
    if (target?.kind === "Y_NODE") return yTargetDomId(target);
    if (target?.kind === "Y_RANGE") {
      return yTargetDomId({ y_node_id: target.start_y_node_id });
    }
    if (
      claim?.claim_state === "VISUAL_SUGGESTION_ONLY" &&
      Number.isInteger(claim.visual_hint?.start_word_index)
    ) {
      const span = sectionRuntime(section).projectionByWordIndex.get(
        claim.visual_hint.start_word_index,
      );
      if (span) return c0TargetDomId(span);
    }
    return sectionArticleDomId(section);
  };

  const compactHebrew = (value) =>
    String(value || "")
      .normalize("NFKD")
      .replace(/[\u0591-\u05c7]/gu, "")
      .replace(/[^\u05d0-\u05ea]/gu, "");

  const claimTargetResolves = (section, claim) => {
    const target = assertedTarget(section, claim);
    if (target?.kind === "C0_SPAN") {
      const coverage = resolveC0Coverage(section, target);
      const words = baseWordsForC0Claim(section, claim);
      const asserted = claim.asserted_edge;
      if (
        !coverage ||
        !words.length ||
        asserted?.start_word_index !== coverage.word_indices[0] ||
        asserted?.end_word_index !==
          coverage.word_indices[coverage.word_indices.length - 1]
      ) {
        return false;
      }
      const anchor = compactHebrew(
        asserted.normalized_anchor ||
          asserted.normalized_anchor_sequence?.join(""),
      );
      if (!anchor) return true;
      const coveredText = compactHebrew(
        words.map((word) => word.normalized).join(""),
      );
      return /COMPONENT_MATCH/u.test(asserted.proof_basis || "")
        ? coveredText.includes(anchor)
        : coveredText === anchor;
    }
    if (target?.kind === "Y_NODE") {
      return nodesById.get(target.y_node_id)?.public_ref === section.ref;
    }
    if (target?.kind === "Y_RANGE") {
      return Boolean(resolveYRangeCoverage(target));
    }
    return false;
  };

  const commentaryTrackForClaim = (claim) => {
    if (claim?.commentary_track) return claim.commentary_track;
    if (claim?.family_key) return claim.family_key;
    const ref = String(claim?.commentary_unit_ref || "").trim();
    const match = /^(.*?)(?:,\s*)?\s+\d+(?::\d+)*(?:-\d+(?::\d+)*)?$/u.exec(
      ref,
    );
    return (match?.[1] || ref || "Commentary").trim();
  };

  const compareSourcePositions = (left, right) => {
    const sectionDelta =
      Number(left?.section_order ?? -1) - Number(right?.section_order ?? -1);
    if (sectionDelta !== 0) return sectionDelta;
    return Number(left?.word_index ?? 0) - Number(right?.word_index ?? 0);
  };

  const sourcePosition = (sectionRef, wordIndex = 1) => ({
    section_ref: sectionRef,
    section_order: sourceSectionOrderByRef.get(sectionRef) ?? -1,
    word_index: Number(wordIndex) || 1,
  });

  const verifiedCommentaryEdges = [...sectionsByRef.values()].flatMap(
    (section) =>
      (section.attachment_map?.claims || []).flatMap((claim) => {
        if (
          claim.claim_state !== "PROVEN_EDGE" ||
          !claimTargetResolves(section, claim)
        ) {
          return [];
        }
        const target = assertedTarget(section, claim);
        const coverage =
          target?.kind === "C0_SPAN"
            ? resolveC0Coverage(section, target)?.word_indices || []
            : [];
        const yRange = resolveYRangeCoverage(target);
        const startSectionRef =
          yRange?.nodes[0]?.public_ref || section.ref;
        const endSectionRef =
          yRange?.nodes[yRange.nodes.length - 1]?.public_ref || section.ref;
        const endSection = sectionsByRef.get(endSectionRef);
        const startWord =
          target?.kind === "C0_SPAN" ? coverage[0] : 1;
        const endWord =
          target?.kind === "C0_SPAN"
            ? coverage[coverage.length - 1]
            : endSection?.base?.words?.length ||
              section.base?.words?.length ||
              1;
        if (!Number.isInteger(startWord) || !Number.isInteger(endWord)) {
          return [];
        }
        return [
          {
            claim,
            section,
            target,
            track: commentaryTrackForClaim(claim),
            start: sourcePosition(startSectionRef, startWord),
            end: sourcePosition(endSectionRef, endWord),
          },
        ];
      }),
  );

  const commentarySnapGroupsByTrack = new Map();
  const commentarySnapGroupByClaimRef = new Map();
  verifiedCommentaryEdges.forEach((edge) => {
    const groupKey = `${edge.track}::${edge.start.section_ref}::${edge.start.word_index}`;
    if (!commentarySnapGroupsByTrack.has(edge.track)) {
      commentarySnapGroupsByTrack.set(edge.track, []);
    }
    let group = commentarySnapGroupsByTrack
      .get(edge.track)
      .find((candidate) => candidate.key === groupKey);
    if (!group) {
      group = {
        key: groupKey,
        track: edge.track,
        section: edge.section,
        start: edge.start,
        edges: [],
      };
      commentarySnapGroupsByTrack.get(edge.track).push(group);
    }
    group.edges.push(edge);
    commentarySnapGroupByClaimRef.set(edge.claim.commentary_unit_ref, group);
  });
  commentarySnapGroupsByTrack.forEach((groups) => {
    groups.sort((left, right) =>
      compareSourcePositions(left.start, right.start),
    );
    groups.forEach((group) => {
      group.edges.sort(
        (left, right) =>
          Number(left.claim.display_order || 0) -
          Number(right.claim.display_order || 0),
      );
    });
  });

  const commentaryTrackUnitsByTrack = new Map();
  const commentaryTrackUnitByClaimRef = new Map();
  [...sectionsByRef.values()]
    .sort(
      (left, right) =>
        (sourceSectionOrderByRef.get(left.ref) ?? -1) -
        (sourceSectionOrderByRef.get(right.ref) ?? -1),
    )
    .forEach((section) => {
      (section.attachment_map?.claims || []).forEach((claim) => {
        const track = commentaryTrackForClaim(claim);
        const snapGroup = commentarySnapGroupByClaimRef.get(
          claim.commentary_unit_ref,
        );
        const suggestedWord = Number(
          claim.visual_hint?.start_word_index,
        );
        const unit = {
          track,
          section,
          claim,
          snapGroup: snapGroup || null,
          sourcePosition:
            snapGroup?.start ||
            sourcePosition(
              section.ref,
              Number.isInteger(suggestedWord) ? suggestedWord : 1,
            ),
        };
        if (!commentaryTrackUnitsByTrack.has(track)) {
          commentaryTrackUnitsByTrack.set(track, []);
        }
        commentaryTrackUnitsByTrack.get(track).push(unit);
        commentaryTrackUnitByClaimRef.set(
          claim.commentary_unit_ref,
          unit,
        );
      });
    });
  commentaryTrackUnitsByTrack.forEach((units) => {
    units.sort((left, right) => {
      const sourceDelta = compareSourcePositions(
        left.sourcePosition,
        right.sourcePosition,
      );
      return sourceDelta !== 0
        ? sourceDelta
        : Number(left.claim.display_order || 0) -
            Number(right.claim.display_order || 0);
    });
  });

  // V4.1: the workspace holds every attached unit at once, so stepping and
  // counting run over one canonical order across all tracks — source order
  // first, then the attachment map's display order.
  const allCommentaryUnitsOrdered = [...commentaryTrackUnitsByTrack.values()]
    .flat()
    .sort((left, right) => {
      const sourceDelta = compareSourcePositions(
        left.sourcePosition,
        right.sourcePosition,
      );
      return sourceDelta !== 0
        ? sourceDelta
        : Number(left.claim.display_order || 0) -
            Number(right.claim.display_order || 0);
    });

  const commentarySnapContract = Object.freeze({
    contract_id: "v4-sectioned-commentary-track-2026-07-25",
    driver: "BASE_HEBREW_PANE",
    track_policy: "USER_SELECTED_COMMENTARY_BOOK",
    transition_policy: "CROSS_NEXT_VERIFIED_ANCHOR",
    persistence_policy: "KEEP_UNIT_LOADED_UNTIL_VERIFIED_SNAP",
    gap_policy: "KEEP_LOADED__REMOVE_STRONG_ACTIVE_SOURCE",
    commentary_scroll_policy: "INDEPENDENT_OVERFLOW_ONLY",
    commentary_browse_policy:
      "FULL_TRACK__SOURCE_SECTIONS_COLLAPSED__ACTIVE_UNIT_EXPANDED",
    manual_override_policy:
      "PREVIOUS_NEXT_UNIT__SOURCE_POSITION_UNCHANGED",
    source_open_policy:
      "RESOLVE_CURRENT_SOURCE_SECTION__NEVER_SUBSTITUTE_PRIOR_SECTION",
    evidence_policy: "PROVEN_EDGE_ONLY__NO_VISUAL_SUGGESTION_SNAP",
    supported_target_kinds: Object.freeze([
      "C0_SPAN",
      "Y_NODE",
      "Y_RANGE",
    ]),
    source_color_policy:
      "ACTIVE_SOURCE_STRONG_SHANI__LINKED_RANGE_LIGHT_SHANI",
  });
  window.V4_COMMENTARY_SNAP_CONTRACT = commentarySnapContract;

  const state = {
    chapter: 1,
    readerMode: "hebrew",
    commentaryLayer: true,
    activeClaimRef: "",
    activeSectionRef: "Genesis 1:1",
    activeCommentaryTrack: "",
    activeSnapGroupKey: "",
    commentaryAlignmentRef: "",
    currentSourcePosition: null,
    manualSourceHoldUntil: 0,
    commentarySnapFrame: 0,
    commentaryRenderToken: 0,
    commentaryVisibleCount: 8,
    activeSourceTarget: "v3-genesis-1-1",
    lastCommentaryTrigger: null,
    titleView: null,
    wordViews: new Map(),
    wordContexts: new Map(),
    // V5 witness rail
    railWork: "",
    railItems: [],
    activeRailIndex: -1,
    snapMaster: "",
    snapMasterHoldUntil: 0,
    railLinked: false,
    railProgrammaticScrollUntil: 0,
    sourceProgrammaticScrollUntil: 0,
    railSnapFrame: 0,
    // V5.1 counter rail
    railBOpen: false,
    railBWork: "",
    railBItems: [],
    railBActiveIndex: -1,
    railBProgrammaticScrollUntil: 0,
  };

  let routeAttributionCounter = 0;

  const scriptLoads = new Map();
  const loadScript = (source) => {
    if (scriptLoads.has(source)) return scriptLoads.get(source);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.async = true;
      script.addEventListener("load", () => resolve(source), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`Could not load ${source}`)),
        { once: true },
      );
      document.head.append(script);
    });
    scriptLoads.set(source, promise);
    return promise;
  };

  const definitionForRoute = (route) =>
    route?.bundle?.definitions?.find(
      (definition) => definition.id === route.choice?.definitionId,
    ) || null;

  const sourcesForRoute = (route) =>
    definitionForRoute(route)?.mSources?.filter(Boolean) || [];

  const sourceHasLicenseRecord = (source) =>
    Boolean(
      source?.key &&
        source?.label &&
        source?.licensePosture &&
        source?.licensePointer,
    );

  const sourceYearLabel = (source) =>
    !source?.sourceYear || source.sourceYear === "S_NO_SOURCE_YEAR"
      ? "source year not supplied"
      : source.sourceYear;

  // V6.6 · a source has one license. The upstream posture vocabulary
  // carries seventeen strings for six licenses; the extra eleven encode
  // provenance notes ("underlying public domain", "document reformatted
  // source"), which are backend detail, not the license. The reader shows
  // the license; the posture stays on the element as data.
  const licenseName = (posture) => {
    const value = String(posture || "").toLowerCase();
    if (!value) return "License unrecorded";
    if (value.startsWith("cc0")) return "CC0";
    if (/_nc(?:_|$)/u.test(value)) {
      return /_sa(?:_|$)/u.test(value) ? "CC BY-NC-SA" : "CC BY-NC";
    }
    if (value.includes("by_sa") || value.includes("gfdl")) return "CC BY-SA";
    if (value.startsWith("public_domain")) return "Public Domain";
    if (value.startsWith("cc_by") || value.includes("wordnet")) return "CC BY";
    return posture;
  };

  const routeIsDisplayReady = (route) => {
    const definition = definitionForRoute(route);
    const sources = sourcesForRoute(route);
    return Boolean(
      definition &&
        sources.length > 0 &&
        sources.every(
          (source) =>
            sourceHasLicenseRecord(source) &&
            (!/_nc(?:_|$)/iu.test(source.licensePosture) ||
              displayPolicy.commercial_use === false),
        ),
    );
  };

  const makePointerLink = (pointer, label) => {
    if (/^https?:\/\//iu.test(pointer)) {
      const link = make("a", "", label);
      link.href = pointer;
      link.target = "_blank";
      link.rel = "noreferrer";
      return link;
    }
    return make("span", "", pointer ? `${label} · ${pointer}` : label);
  };

  const makeSourceLink = (source, label = "Source record") =>
    makePointerLink(
      source?.externalCitation ||
        source?.source_url ||
        source?.licensePointer ||
        "",
      label,
    );

  const appendSourcePointers = (host, source) => {
    const exactPointer = source?.externalCitation || source?.source_url || "";
    const licensePointer = source?.licensePointer || "";
    const pointers = [
      { pointer: exactPointer, label: "Exact entry" },
      { pointer: licensePointer, label: "License terms" },
    ].filter(
      ({ pointer }, index, allPointers) =>
        pointer &&
        allPointers.findIndex(
          (candidate) => candidate.pointer === pointer,
        ) === index,
    );
    pointers.forEach(({ pointer, label }, index) => {
      if (index > 0) host.append(document.createTextNode(" · "));
      host.append(makePointerLink(pointer, label));
    });
  };

  const appendRouteAttribution = (host, route) => {
    const attribution = make("div", "v3-route-attribution");
    attribution.id = `v3-route-attribution-${++routeAttributionCounter}`;
    attribution.dataset.v4RouteAttribution = "";
    const sources = sourcesForRoute(route);
    if (!routeIsDisplayReady(route)) {
      attribution.dataset.status = "held";
      attribution.append(
        make("b", "", "Route held"),
        make(
          "span",
          "",
          "An exact definition-to-source license record is not available.",
        ),
      );
      host.append(attribution);
      return attribution;
    }
    attribution.dataset.status = "ready";
    attribution.append(make("b", "", "Selected route attribution"));
    sources.forEach((source) => {
      const line = make("span");
      line.append(
        document.createTextNode(
          `${source.label} · ${licenseName(source.licensePosture)} · ${sourceYearLabel(source)} · `,
        ),
      );
      appendSourcePointers(line, source);
      attribution.append(line);
    });
    host.append(attribution);
    return attribution;
  };

  const exactRoutesForCell = (cell) => {
    const routes = [];
    const seen = new Set();
    (cell?.lBundle?.choices || []).forEach((choice) => {
      const bundle = (cell.lBundle.pBundles || []).find(
        (candidate) => candidate.id === choice.pBundleId,
      );
      const helpers = bundle?.helperRoutes?.length
        ? bundle.helperRoutes
        : [{ text: choice.text, key: choice.id }];
      helpers.forEach((route) => {
        const text = route.text?.trim();
        const normalized = text?.toLocaleLowerCase();
        if (!text || seen.has(normalized)) return;
        seen.add(normalized);
        const candidate = {
          key: `${choice.id}:${route.key || text}`,
          text,
          choice,
          bundle,
        };
        if (routeIsDisplayReady(candidate)) routes.push(candidate);
      });
    });
    // V6.8 · evidence-only definitions become selectable.
    //
    // These are the verse-ALIGNED records (STEP Bible TAHOT) — the only
    // rows in the fixture that know which verse this is; everything else
    // is a dictionary entry matched by form. They carry full CC BY 4.0
    // source records and were being dropped on the floor, so "the earth"
    // and "and <obj.>" were unreachable while "Palestine" and "and thou"
    // led.
    //
    // They are added to the pool, NOT promoted to lead. Measured before
    // deciding: leading with them fixes words 6 and 7, regresses word 2
    // (בָּרָא's aligned record reads "field/ the"), and replaces two
    // already-correct glosses with clumsier text. A rule that improves
    // two words and damages three is not a rule worth declaring. The
    // attested antiquity rule keeps ordering them — they are 2026 rows,
    // so they sort into the recent tier, which is honest. Wanting one to
    // lead on a given word is what the unsigned override file is for.
    (cell?.lBundle?.evidenceOnlyDefinitions || []).forEach(
      (definition, index) => {
        const text = definition?.text?.trim();
        const normalized = text?.toLocaleLowerCase();
        if (!text || seen.has(normalized)) return;
        const bundle = {
          id: `${cell.lBundle.id || "L"}-EOD`,
          label: "Verse-aligned evidence",
          definitions: [definition],
        };
        const choice = {
          id: `${bundle.id}-C-${index + 1}`,
          text,
          definitionId: definition.id,
          pBundleId: bundle.id,
          firstLedgerPosition: definition.firstLedgerPosition,
        };
        const candidate = { key: choice.id, text, choice, bundle };
        if (!routeIsDisplayReady(candidate)) return;
        seen.add(normalized);
        routes.push(candidate);
      },
    );
    return routes;
  };

  // V6.8 · draft clitic splits are not offered as readings.
  //
  // Six of the seven Genesis 1:1 words carry
  // `splitConfidence: "draft_candidate"` on a `split span` shape, and the
  // splits are half wrong: ב + ראשית, ו + את and ה + ארץ are sound, but
  // ברא → ב + רא cuts through the root and השמים → ה + ש + מ + ים is four
  // loose letters. The flag is identical on all six, so the data cannot
  // separate the good from the bad — it only says none of them is proven.
  //
  // The reader presented them as peers of the whole-span reading, which
  // asserts a morphological analysis the pipeline explicitly disclaims.
  // Everywhere else this project holds what it cannot prove, so the draft
  // shapes are withheld — never at the cost of the word itself: a draft
  // shape still counts when nothing else about the word is usable.
  const shapeIsDraftSplit = (word, shape) =>
    word?.splitConfidence === "draft_candidate" &&
    shape?.kind === "split span";

  const usableShapeIndices = (word) => {
    const usable = (word?.shapes || [])
      .map((shape, index) => ({ shape, index }))
      .filter(
        ({ shape }) =>
          shape.cells?.length > 0 &&
          shape.cells.every((cell) => exactRoutesForCell(cell).length > 0),
      );
    const proven = usable.filter(
      ({ shape }) => !shapeIsDraftSplit(word, shape),
    );
    return (proven.length ? proven : usable).map(({ index }) => index);
  };

  const wordIsUsable = (word) => usableShapeIndices(word).length > 0;

  const wordViewKey = (scope, occurrenceId) => `${scope}:${occurrenceId}`;

  const initialWordView = (word, preferredGloss = "") => {
    const usable = usableShapeIndices(word);
    const shapeIndex = usable[0] ?? 0;
    const shape = word.shapes?.[shapeIndex];
    const cellRoutes = new Map();
    (shape?.cells || []).forEach((cell) => {
      const routes = exactRoutesForCell(cell);
      const preferred = routes.find(
        (route) =>
          route.text.toLocaleLowerCase() ===
          preferredGloss.trim().toLocaleLowerCase(),
      );
      cellRoutes.set(cell.compcellTemplateId, preferred || routes[0]);
    });
    return { shapeIndex, cellRoutes };
  };

  const ensureWordView = (
    scope,
    occurrenceId,
    word,
    preferredGloss = "",
  ) => {
    const key = wordViewKey(scope, occurrenceId);
    if (!state.wordViews.has(key)) {
      state.wordViews.set(key, initialWordView(word, preferredGloss));
    }
    const view = state.wordViews.get(key);
    state.wordContexts.set(key, { word, view });
    return view;
  };

  const selectedGloss = (word, view) => {
    const shape = word.shapes?.[view.shapeIndex];
    return (shape?.cells || [])
      .map((cell) => view.cellRoutes.get(cell.compcellTemplateId)?.text || "")
      .filter(Boolean)
      .join(" + ");
  };

  const setWordModuleAriaLabel = (button, word, view) => {
    const occurrenceId = Number(button.dataset.occurrenceId);
    const setSize = Number(button.dataset.unitSetSize) || 0;
    const gloss = selectedGloss(word, view);
    if (button.dataset.v6DefaultGloss) {
      button.dataset.v6DefaultActive = String(
        gloss === button.dataset.v6DefaultGloss,
      );
    }
    button.setAttribute(
      "aria-label",
      state.readerMode === "english"
        ? `Workbench source unit ${occurrenceId}${setSize ? ` of ${setSize}` : ""}. ${word.hebrew}. Selected gloss: ${gloss}. Open choices.`
        : `${word.hebrew}. Selected gloss: ${gloss}. Open choices.`,
    );
  };

  const conciseRoutes = (cell, currentRoute, limit = 8) => {
    const allRoutes = exactRoutesForCell(cell);
    const front = allRoutes.filter(
      (route) => route.choice?.presentation?.headPill,
    );
    const ordered = [currentRoute, ...front, ...allRoutes].filter(Boolean);
    const seen = new Set();
    return ordered.filter((route) => {
      const key = route.text.toLocaleLowerCase();
      if (seen.has(key) || seen.size >= limit) return false;
      seen.add(key);
      return true;
    });
  };

  // V6.1 · antiquity ordering (rule attested by Kyle, 2026-08-10):
  // oldest attesting source year first; sources after 1940 or without a
  // recorded year form the last tier; ties break by ledger position.
  const V6_LASTUARY_AFTER = 1940;

  const v6RouteYear = (route) => {
    let minYear = Infinity;
    sourcesForRoute(route).forEach((source) => {
      const year = Number.parseInt(source?.sourceYear, 10);
      if (Number.isInteger(year)) minYear = Math.min(minYear, year);
    });
    return minYear;
  };

  const v6RouteTier = (route) => {
    const year = v6RouteYear(route);
    return Number.isFinite(year) && year <= V6_LASTUARY_AFTER ? 0 : 1;
  };

  const v6RouteLedger = (route) =>
    Number.isInteger(route?.choice?.firstLedgerPosition)
      ? route.choice.firstLedgerPosition
      : 9e9;

  const v6OrderRoutes = (cell, currentRoute) => {
    const all = exactRoutesForCell(cell);
    const seen = new Set();
    const pool = [];
    all.forEach((route) => {
      const key = route.text.toLocaleLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      pool.push(route);
    });
    const currentKey = currentRoute?.text?.toLocaleLowerCase() || "";
    const rest = pool.filter(
      (route) => route.text.toLocaleLowerCase() !== currentKey,
    );
    rest.sort(
      (a, b) =>
        v6RouteTier(a) - v6RouteTier(b) ||
        v6RouteYear(a) - v6RouteYear(b) ||
        v6RouteLedger(a) - v6RouteLedger(b),
    );
    return currentRoute ? [currentRoute, ...rest] : rest;
  };

  // All D+M records attesting a route's text, oldest source first — one
  // pill may rest on one record or five hundred; every one is reachable.
  const v6RecordsForRoute = (cell, route) => {
    const lb = cell?.lBundle;
    if (!lb || !route?.text) return [];
    const text = route.text.toLocaleLowerCase();
    const records = [];
    const seen = new Set();
    const primary = definitionForRoute(route);
    const push = (definition) => {
      if (!definition?.id || seen.has(definition.id)) return;
      seen.add(definition.id);
      let year = Infinity;
      (definition.mSources || []).forEach((source) => {
        const parsed = Number.parseInt(source?.sourceYear, 10);
        if (Number.isInteger(parsed)) year = Math.min(year, parsed);
      });
      records.push({ definition, year });
    };
    if (primary) push(primary);
    (lb.pBundles || []).forEach((bundle) =>
      (bundle.definitions || []).forEach((definition) => {
        const matches = (definition.exactRoutes || []).some(
          (exact) => exact.text?.toLocaleLowerCase() === text,
        );
        if (matches) push(definition);
      }),
    );
    records.sort((a, b) => a.year - b.year);
    return records;
  };

  const markCopyableHebrew = (button, raw) => {
    raw.dataset.v4CopyableHebrew = "";
    button.addEventListener(
      "click",
      (event) => {
        if (event.detail <= 0) return;
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          return;
        }
        try {
          if (selection.getRangeAt(0).intersectsNode(raw)) {
            event.stopImmediatePropagation();
          }
        } catch {
          // A stale selection range must never make the word module unusable.
        }
      },
      true,
    );
  };

  const createWordButton = ({
    word,
    scope,
    occurrenceId,
    preferredGloss = "",
    controls,
    commentary = false,
    setSize = 0,
  }) => {
    const view = ensureWordView(scope, occurrenceId, word, preferredGloss);
    const button = make("button", "v3-word-module");
    button.type = "button";
    button.dataset.v3WordModule = "";
    button.dataset.v4HebrewUnit = "";
    button.dataset.scope = scope;
    button.dataset.occurrenceId = String(occurrenceId);
    button.dataset.displayWordIndex = String(occurrenceId);
    button.dataset.numberingScope = "UNIT_LOCAL";
    button.dataset.wordKey = word.normalized;
    button.dataset.moduleKind = commentary ? "commentary" : "base";
    if (setSize) button.dataset.unitSetSize = String(setSize);
    button.setAttribute("aria-controls", controls);
    button.setAttribute("aria-expanded", "false");
    setWordModuleAriaLabel(button, word, view);

    const sequence = make("span", "v3-word-sequence", String(occurrenceId));
    sequence.dir = "ltr";
    sequence.setAttribute("aria-hidden", "true");
    const raw = make("span", "v3-word-source", word.hebrew);
    raw.lang = "he";
    raw.dir = "rtl";
    raw.dataset.v3HebrewToken = "";
    raw.dataset.v3WordSource = "";
    raw.dataset.v4RawHebrew = "";
    markCopyableHebrew(button, raw);
    const gloss = make("span", "v3-word-gloss", selectedGloss(word, view));
    gloss.id = `v3-selected-gloss-${scope}-${occurrenceId}`.replace(
      /[^a-z0-9-]+/giu,
      "-",
    );
    gloss.lang = "en";
    gloss.dir = "ltr";
    gloss.dataset.v3SelectedGloss = "";
    gloss.dataset.v4SelectedGloss = "";
    button.append(sequence, raw, gloss);
    return button;
  };

  const closeWordShelf = (shelf, scopeSelector) => {
    shelf.hidden = true;
    shelf.removeAttribute("aria-labelledby");
    shelf.style.removeProperty("--v4-hud-available-inline");
    shelf.style.removeProperty("--v4-hud-shift-x");
    delete shelf.dataset.controllerId;
    delete shelf.dataset.v4HudPosition;
    shelf.replaceChildren();
    document.querySelectorAll(scopeSelector).forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  };

  const dockBaseWordShelf = (shelf, sourceButton, commentary) => {
    if (commentary) return;
    const slot = sourceButton.closest(".v3-word-slot");
    const commentaryBubble = slot?.querySelector(
      "[data-v3-commentary-bubble]",
    );
    if (!slot || !commentaryBubble) return;
    slot.insertBefore(shelf, commentaryBubble);
    shelf.dataset.v4HudDock = "selected-gloss-to-commentary";
    shelf.dataset.controllerId = sourceButton.id;
  };

  const positionBaseHudPanel = (shelf, sourceButton) => {
    const panel = shelf.querySelector(".v4-base-hud-panel");
    const wordRun = sourceButton?.closest(".v3-word-run");
    if (!panel || !wordRun || shelf.hidden) return;

    const viewportWidth =
      document.documentElement.clientWidth || window.innerWidth;
    const readingBounds = elements.readingPane.getBoundingClientRect();
    const runBounds = wordRun.getBoundingClientRect();
    const gutter = viewportWidth <= 620 ? 8 : 12;
    const leftBound =
      Math.max(0, readingBounds.left, runBounds.left) + gutter;
    const rightBound =
      Math.min(viewportWidth, readingBounds.right, runBounds.right) - gutter;
    const available = Math.floor(rightBound - leftBound);
    if (available <= 0) return;

    shelf.style.setProperty(
      "--v4-hud-available-inline",
      `${available}px`,
    );
    shelf.style.setProperty("--v4-hud-shift-x", "0px");

    const sourceBounds = sourceButton.getBoundingClientRect();
    const shelfBounds = shelf.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    const desiredLeft =
      sourceBounds.left + (sourceBounds.width - panelBounds.width) / 2;
    const maximumLeft = Math.max(leftBound, rightBound - panelBounds.width);
    const clampedLeft = Math.min(
      Math.max(desiredLeft, leftBound),
      maximumLeft,
    );
    shelf.style.setProperty(
      "--v4-hud-shift-x",
      `${clampedLeft - shelfBounds.left}px`,
    );
    shelf.dataset.v4HudPosition = "reading-pane-clamped";
  };

  const positionOpenBaseHudPanels = () => {
    document
      .querySelectorAll(".v3-word-hud-shelf:not([hidden])")
      .forEach((shelf) => {
        const sourceButton = shelf.dataset.controllerId
          ? document.getElementById(shelf.dataset.controllerId)
          : null;
        positionBaseHudPanel(shelf, sourceButton);
      });
  };

  let baseHudPositionFrame = 0;
  const scheduleOpenBaseHudPanelPosition = () => {
    if (baseHudPositionFrame) cancelAnimationFrame(baseHudPositionFrame);
    baseHudPositionFrame = requestAnimationFrame(() => {
      baseHudPositionFrame = 0;
      positionOpenBaseHudPanels();
    });
  };

  const renderWordShelf = ({
    shelf,
    word,
    scope,
    occurrenceId,
    sourceButton,
    preferredGloss = "",
    commentary = false,
    sourceRef = "",
  }) => {
    const view = ensureWordView(scope, occurrenceId, word, preferredGloss);
    const shape = word.shapes[view.shapeIndex];
    const scopeSelector = `[data-v3-word-module][data-scope="${scope}"]`;
    if (!commentary) {
      document.querySelectorAll(".v3-word-hud-shelf").forEach((candidate) => {
        if (candidate !== shelf) {
          candidate.hidden = true;
          candidate.removeAttribute("aria-labelledby");
          candidate.replaceChildren();
        }
      });
      document
        .querySelectorAll(
          '[data-v3-word-module][data-module-kind="base"]',
        )
        .forEach((button) => button.setAttribute("aria-expanded", "false"));
    }
    document.querySelectorAll(scopeSelector).forEach((button) => {
      button.setAttribute(
        "aria-expanded",
        String(button === sourceButton),
      );
    });

    shelf.className = commentary
      ? "v3-commentary-hud-shelf"
      : "v3-word-hud-shelf";
    dockBaseWordShelf(shelf, sourceButton, commentary);
    const selectedGlossNode = sourceButton.querySelector(
      "[data-v3-selected-gloss]",
    );
    if (selectedGlossNode?.id) {
      shelf.setAttribute("aria-labelledby", selectedGlossNode.id);
    }
    shelf.hidden = false;
    shelf.replaceChildren();
    const hudHost = commentary
      ? shelf
      : make("div", "v4-base-hud-panel");
    if (!commentary) shelf.append(hudHost);

    const heading = make("header", "v3-hud-heading");
    const headingCopy = make("div");
    headingCopy.append(
      make(
        "p",
        "",
        commentary ? "Commentary word" : `${sourceRef || "Genesis"} word`,
      ),
      make(
        "h3",
        "",
        selectedGloss(word, view),
      ),
    );
    const close = make("button", "v3-hud-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close word choices");
    close.addEventListener("click", () => {
      closeWordShelf(shelf, scopeSelector);
      sourceButton.focus();
    });
    heading.append(headingCopy, close);
    hudHost.append(heading);

    const usable = usableShapeIndices(word);
    if (usable.length > 1) {
      const tabs = make("div", "v3-shape-tabs");
      tabs.setAttribute("aria-label", "Word shape");
      usable.forEach((shapeIndex) => {
        const shapeOption = word.shapes[shapeIndex];
        const spanDescriptor =
          shapeOption.kind === "whole span"
            ? "whole span"
            : `${shapeOption.cells.length}-part span`;
        const tab = make("button", "", shapeOption.label);
        tab.type = "button";
        tab.title = spanDescriptor;
        tab.setAttribute(
          "aria-label",
          `${shapeOption.label}, ${spanDescriptor}`,
        );
        tab.setAttribute(
          "aria-pressed",
          String(shapeIndex === view.shapeIndex),
        );
        tab.addEventListener("click", () => {
          view.shapeIndex = shapeIndex;
          view.cellRoutes = initialWordView(word).cellRoutes;
          const nextShape = word.shapes[shapeIndex];
          const nextRoutes = new Map();
          nextShape.cells.forEach((cell) => {
            nextRoutes.set(cell.compcellTemplateId, exactRoutesForCell(cell)[0]);
          });
          view.cellRoutes = nextRoutes;
          const nextGloss = selectedGloss(word, view);
          setText(
            sourceButton.querySelector("[data-v3-selected-gloss]"),
            nextGloss,
          );
          setWordModuleAriaLabel(sourceButton, word, view);
          renderWordShelf({
            shelf,
            word,
            scope,
            occurrenceId,
            sourceButton,
            preferredGloss: nextGloss,
            commentary,
            sourceRef,
          });
          refreshAttributionDrawer();
        });
        tabs.append(tab);
      });
      hudHost.append(tabs);
    }

    shape.cells.forEach((cell) => {
      const cellSection = make("section", "v3-hud-cell");
      cellSection.append(
        make(
          "p",
          "",
          shape.cells.length > 1
            ? `${cell.spanRole}: ${cell.surface}`
            : "Exact selectable routes",
        ),
      );
      const choices = make("div", "v3-route-choices");
      const current = view.cellRoutes.get(cell.compcellTemplateId);
      // V6.1 (rule attested by Kyle): pills sort by antiquity — oldest
      // attesting source first, post-1940 and unyeared sources last —
      // with the selected route always leading. Past ten pills the rest
      // fold into a filterable panel.
      const makeRouteButton = (route) => {
        const routeButton = make("button", "", route.text);
        routeButton.type = "button";
        routeButton.dataset.v3HudRoute = "";
        const routeYear = v6RouteYear(route);
        const routeSources = sourcesForRoute(route);
        routeButton.title = [
          Number.isFinite(routeYear) ? String(routeYear) : "no source year",
          routeSources[0]?.label || "",
        ]
          .filter(Boolean)
          .join(" · ");
        routeButton.setAttribute(
          "aria-pressed",
          String(route.text === current?.text),
        );
        routeButton.addEventListener("click", () => {
          view.cellRoutes.set(cell.compcellTemplateId, route);
          const nextGloss = selectedGloss(word, view);
          const glossNode = sourceButton.querySelector(
            "[data-v3-selected-gloss]",
          );
          setText(glossNode, nextGloss);
          setWordModuleAriaLabel(sourceButton, word, view);
          renderWordShelf({
            shelf,
            word,
            scope,
            occurrenceId,
            sourceButton,
            preferredGloss: nextGloss,
            commentary,
            sourceRef,
          });
          refreshAttributionDrawer();
        });
        return routeButton;
      };
      const orderedRoutes = v6OrderRoutes(cell, current);
      orderedRoutes
        .slice(0, 10)
        .forEach((route) => choices.append(makeRouteButton(route)));
      cellSection.append(choices);
      if (orderedRoutes.length > 10) {
        const moreWrap = make("div", "v6-route-more");
        const moreToggle = make(
          "button",
          "v6-route-more-toggle",
          `▾ ${orderedRoutes.length - 10} more routes`,
        );
        moreToggle.type = "button";
        moreToggle.setAttribute("aria-expanded", "false");
        const panel = make("div", "v6-route-panel");
        panel.hidden = true;
        const filter = make("input", "v6-route-filter");
        filter.type = "search";
        filter.placeholder = "Filter routes…";
        filter.setAttribute(
          "aria-label",
          "Filter the full route list",
        );
        const panelList = make("div", "v6-route-panel-list");
        orderedRoutes.forEach((route) => {
          const button = makeRouteButton(route);
          button.dataset.v6RouteText = route.text.toLowerCase();
          panelList.append(button);
        });
        filter.addEventListener("input", () => {
          const query = filter.value.trim().toLowerCase();
          panelList.querySelectorAll("button").forEach((button) => {
            button.hidden = Boolean(
              query && !button.dataset.v6RouteText.includes(query),
            );
          });
        });
        moreToggle.addEventListener("click", () => {
          panel.hidden = !panel.hidden;
          moreToggle.setAttribute(
            "aria-expanded",
            String(!panel.hidden),
          );
          if (!panel.hidden) filter.focus();
        });
        panel.append(filter, panelList);
        moreWrap.append(moreToggle, panel);
        cellSection.append(moreWrap);
      }
      if (current) {
        // V4.1: the D card returns. The selected route's exact dictionary
        // definition (its D record) rides under the choices with its
        // source attribution, instead of attribution alone.
        const definition = definitionForRoute(current);
        const dCard = make("section", "v4-hud-d-card");
        dCard.dataset.v4DCard = "";
        if (definition?.text) {
          const dHead = make("header");
          const bundleLabel = current.bundle?.label?.trim() || "";
          dHead.append(
            make("b", "", "D · Definition"),
            make(
              "span",
              "",
              bundleLabel && bundleLabel !== definition.text.trim()
                ? bundleLabel
                : "Exact dictionary record",
            ),
          );
          const dText = make("p", "v4-hud-d-text", definition.text);
          dText.dir = "auto";
          dCard.append(dHead, dText);
        }
        const attribution = appendRouteAttribution(dCard, current);
        // V6.1: one pill may rest on many D+M records. The oldest renders
        // above; the full stack is browsable beneath it.
        const records = v6RecordsForRoute(cell, current);
        if (records.length > 1) {
          const stack = make("details", "v6-record-stack");
          const summary = make("summary");
          const oldest = records.find((record) =>
            Number.isFinite(record.year),
          );
          summary.append(
            make(
              "b",
              "",
              `${records.length} source records for this route`,
            ),
            make(
              "span",
              "",
              oldest ? `oldest ${oldest.year}` : "years unrecorded",
            ),
          );
          const list = make("div", "v6-record-list");
          if (records.length > 12) {
            const recordFilter = make("input", "v6-route-filter");
            recordFilter.type = "search";
            recordFilter.placeholder = "Filter records…";
            recordFilter.setAttribute(
              "aria-label",
              "Filter the source records",
            );
            recordFilter.addEventListener("input", () => {
              const query = recordFilter.value.trim().toLowerCase();
              list.querySelectorAll(".v6-record").forEach((node) => {
                node.hidden = Boolean(
                  query &&
                    !(node.dataset.v6RecordText || "").includes(query),
                );
              });
            });
            stack.append(summary, recordFilter, list);
          } else {
            stack.append(summary, list);
          }
          records.forEach((record) => {
            const item = make("article", "v6-record");
            item.dataset.v6RecordText = [
              record.definition.text || "",
              ...(record.definition.mSources || []).map(
                (source) => source.label || "",
              ),
            ]
              .join(" ")
              .toLowerCase();
            const head = make("header");
            head.append(
              make(
                "b",
                "",
                Number.isFinite(record.year)
                  ? String(record.year)
                  : "no year",
              ),
              make(
                "span",
                "",
                record.definition.mSources?.[0]?.label || "Source unrecorded",
              ),
            );
            const body = make("p", "", record.definition.text || "");
            body.dir = "auto";
            item.append(head, body);
            list.append(item);
          });
          dCard.append(stack);
        }
        cellSection.append(dCard);
        choices.querySelectorAll("button").forEach((button) => {
          if (button.getAttribute("aria-pressed") === "true") {
            button.setAttribute("aria-describedby", attribution.id);
          }
        });
      }
      hudHost.append(cellSection);
    });
    if (!commentary) {
      positionBaseHudPanel(shelf, sourceButton);
    }
  };

  const scopeLabel = (section, claim) => {
    const target = assertedTarget(section, claim);
    const sectionVerse = verseNumber(nodesById.get(section?.y_node_id));
    if (target?.kind === "C0_SPAN") {
      const indices = resolveC0Coverage(section, target)?.word_indices || [];
      if (indices.length === 1) {
        const position =
          indices[0] === 1 ? "first word" : `word ${indices[0]}`;
        return `Points to: ${position} of verse ${sectionVerse}`;
      }
      if (indices.length > 1) {
        return `Points to: words ${indices[0]}–${
          indices[indices.length - 1]
        } of verse ${sectionVerse}`;
      }
    }
    if (target?.kind === "Y_NODE") {
      const node = nodesById.get(target.y_node_id);
      if (node?.node_kind === "SECTION") return "Parallel to: whole verse";
    }
    if (target?.kind === "Y_RANGE") {
      const coverage = resolveYRangeCoverage(target);
      const first = coverage?.nodes[0]?.public_ref;
      const last = coverage?.nodes[coverage.nodes.length - 1]?.public_ref;
      if (first && last) {
        return first === last
          ? `Points to: ${first}`
          : `Points to: continuous range ${first}–${last}`;
      }
    }
    if (
      claim?.claim_state === "VISUAL_SUGGESTION_ONLY" &&
      Number.isInteger(claim.visual_hint?.start_word_index) &&
      Number.isInteger(claim.visual_hint?.end_word_index)
    ) {
      const start = claim.visual_hint.start_word_index;
      const end = claim.visual_hint.end_word_index;
      return `Suggested across words ${start}–${end} · not yet an asserted edge`;
    }
    return `On verse ${sectionVerse} · exact word or span not yet bound`;
  };

  const compactClaimTitle = (claim) => {
    if (claim?.display_title) return claim.display_title;
    if (/^Onkelos Genesis/u.test(claim?.commentary_unit_ref || "")) {
      return claim.commentary_unit_ref.replace(/^Onkelos Genesis /u, "Onkelos · Verse ");
    }
    const match = /Genesis (\d+):(\d+):(\d+)$/u.exec(
      claim?.commentary_unit_ref || "",
    );
    return match
      ? `Rashi · ${match[1]}:${match[2]}:${match[3]}`
      : "Commentary";
  };

  const closeCommentaryChoosers = ({ returnFocus = false } = {}) => {
    let returnTarget = null;
    document
      .querySelectorAll("[data-v3-commentary-choice-shelf]")
      .forEach((shelf) => {
        if (!shelf.hidden) {
          const controllerId = shelf.dataset.controllerId;
          returnTarget =
            returnTarget ||
            (controllerId ? document.querySelector(`#${controllerId}`) : null);
        }
        shelf.hidden = true;
        shelf.removeAttribute("data-controller-id");
        shelf.replaceChildren();
      });
    document
      .querySelectorAll("[data-v3-commentary-bubble]")
      .forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (returnFocus) returnTarget?.focus?.();
  };

  const createCommentaryChoice = (section, claim, sourceButton) => {
    const button = make(
      "button",
      `v3-commentary-choice${
        claim.claim_state === "PROVEN_EDGE" ? "" : " is-suggested"
      }`,
    );
    button.type = "button";
    button.dataset.v3CommentaryPill = "";
    button.dataset.commentaryUnitRef = claim.commentary_unit_ref;
    button.dataset.claimState = claim.claim_state;
    button.dataset.edgeAssertion = String(
      claim.claim_state === "PROVEN_EDGE",
    );
    button.setAttribute("aria-controls", elements.commentaryPane.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute(
      "aria-label",
      `${compactClaimTitle(claim)}. ${scopeLabel(section, claim)}. Open commentary.`,
    );
    button.append(
      make("b", "", compactClaimTitle(claim)),
      make("span", "", scopeLabel(section, claim)),
    );
    button.addEventListener("click", () => {
      closeCommentaryChoosers();
      selectCommentary(section, claim, sourceButton);
    });
    return button;
  };

  const renderCommentaryChooser = ({
    shelf,
    word,
    claims,
    sourceButton,
    section,
  }) => {
    closeCommentaryChoosers();
    const heading = make("header", "v3-commentary-choice-heading");
    const raw = make("span", "", word.hebrew);
    raw.lang = "he";
    raw.dir = "rtl";
    heading.append(
      raw,
      make(
        "span",
        "",
        `${claims.length} commentar${claims.length === 1 ? "y" : "ies"} · all stay open in the workspace`,
      ),
    );
    const choices = make("div", "v3-commentary-choice-list");
    choices.setAttribute("role", "list");
    // V5.5: at full attachment the first word carries a three-digit claim
    // count, so the chooser groups by work — a plain header per work, its
    // claims beneath, the whole list scrollable.
    const byTrack = new Map();
    claims.forEach((claim) => {
      const track = commentaryTrackForClaim(claim);
      if (!byTrack.has(track)) byTrack.set(track, []);
      byTrack.get(track).push(claim);
    });
    byTrack.forEach((trackClaims, track) => {
      if (byTrack.size > 1) {
        const groupHead = make("p", "v5-choice-group-head");
        groupHead.append(
          make("b", "", track),
          make(
            "span",
            "",
            `${trackClaims.length} unit${
              trackClaims.length === 1 ? "" : "s"
            }`,
          ),
        );
        choices.append(groupHead);
      }
      trackClaims.forEach((claim) =>
        choices.append(
          createCommentaryChoice(section, claim, sourceButton),
        ),
      );
    });
    shelf.dataset.controllerId = sourceButton.id;
    shelf.replaceChildren(heading, choices);
    shelf.hidden = false;
    sourceButton.setAttribute("aria-expanded", "true");
    choices.querySelector("button")?.focus();
  };

  const createWordCommentaryBubble = ({ section, word, claims, shelf }) => {
    const button = make("button", "v3-commentary-bubble");
    button.id = `v3-commentary-bubble-${section.unit_id}-word-${word.index}`;
    button.type = "button";
    button.dataset.v3CommentaryBubble = "";
    button.dataset.wordIndex = String(word.index);
    button.dataset.commentaryCount = String(claims.length);
    button.dataset.commentaryRefs = JSON.stringify(
      claims.map((claim) => claim.commentary_unit_ref),
    );
    button.setAttribute("aria-controls", shelf.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute(
      "aria-label",
      `${claims.length} commentar${
        claims.length === 1 ? "y" : "ies"
      } covering word ${word.index}.`,
    );
    button.title = `${claims.length} commentar${
      claims.length === 1 ? "y" : "ies"
    } covering this word`;
    button.append(
      make("span", "v3-commentary-bubble-mark", "C"),
      make("span", "v3-commentary-bubble-count", String(claims.length)),
    );
    button.addEventListener("click", () => {
      if (claims.length === 1) {
        closeCommentaryChoosers();
        selectCommentary(section, claims[0], button);
        return;
      }
      if (!shelf.hidden && shelf.dataset.controllerId === button.id) {
        closeCommentaryChoosers({ returnFocus: true });
        return;
      }
      renderCommentaryChooser({
        shelf,
        word,
        claims,
        sourceButton: button,
        section,
      });
    });
    return button;
  };

  const renderTitleModule = () => {
    const titleIndex = titleHudFixture.exact_hud.word_index.find(
      (entry) => entry.normalized === workNode?.label_normalized_sequence,
    );
    if (!workNode || !titleIndex) {
      elements.bookTitle.replaceChildren(
        make("span", "v3-loading-label", "Genesis"),
      );
      return;
    }

    const details = make("details", "v3-title-module");
    details.dataset.v3TitleModule = "";
    details.dataset.v4HebrewUnit = "";
    details.dataset.yNodeId = workNode.y_node_id;
    const summary = make("summary");
    const raw = make("span", "v3-title-source", workNode.label_hebrew);
    raw.lang = "he";
    raw.dir = "rtl";
    raw.dataset.v3HebrewToken = "";
    raw.dataset.v4RawHebrew = "";
    const descriptor = make(
      "span",
      "v3-title-gloss",
      titleIndex.default_selected_gloss,
    );
    descriptor.lang = "en";
    descriptor.dir = "ltr";
    descriptor.dataset.v4SelectedGloss = "";
    const action = make("span", "v3-title-action", "Genesis · title choices");
    // V6.4: on phones the long action label is hidden; the same ▾ mark the
    // word modules use marks the title as definable there instead.
    const actionCompact = make("span", "v3-title-action-compact", "▾");
    actionCompact.setAttribute("aria-hidden", "true");
    summary.append(raw, descriptor, action, actionCompact);
    const hud = make("div", "v3-title-hud");
    hud.id = "v3-work-title-hud";
    summary.setAttribute("aria-controls", hud.id);
    hud.append(
      make("p", "", "Open the lexical reading carried by the Hebrew title."),
    );
    details.append(summary, hud);
    details.addEventListener("toggle", async () => {
      if (!details.open || details.dataset.hudLoaded === "true") return;
      hud.replaceChildren(
        make("p", "", "Loading the exact title-word choices…"),
      );
      try {
        await loadScript(titleIndex.script);
        const word = window.Y_TITLE_HUD_WORDS?.[titleIndex.normalized];
        if (!wordIsUsable(word)) throw new Error("Title HUD is incomplete");
        const view = initialWordView(
          word,
          titleIndex.default_selected_gloss,
        );
        state.titleView = { word, view };
        const renderLoadedTitleHud = () => {
          const selected = make(
            "p",
            "",
            `Selected lexical gloss · ${selectedGloss(word, view)}`,
          );
          const routes = make("div", "v3-route-choices");
          const cell = word.shapes[view.shapeIndex].cells[0];
          const current = view.cellRoutes.get(cell.compcellTemplateId);
          conciseRoutes(cell, current).forEach((route) => {
            const choice = make("button", "", route.text);
            choice.type = "button";
            choice.dataset.v3HudRoute = "";
            choice.addEventListener("click", () => {
              view.cellRoutes.set(cell.compcellTemplateId, route);
              setText(descriptor, selectedGloss(word, view));
              renderLoadedTitleHud();
              refreshAttributionDrawer();
            });
            choice.setAttribute(
              "aria-pressed",
              String(route.text === current?.text),
            );
            routes.append(choice);
          });
          hud.replaceChildren(selected, routes);
          if (current) {
            const attribution = appendRouteAttribution(hud, current);
            routes.querySelectorAll("button").forEach((button) => {
              if (button.getAttribute("aria-pressed") === "true") {
                button.setAttribute("aria-describedby", attribution.id);
              }
            });
          }
        };
        renderLoadedTitleHud();
        details.dataset.hudLoaded = "true";
      } catch {
        hud.replaceChildren(
          make(
            "p",
            "",
            "The raw Hebrew title remains visible; its selectable HUD is held until the exact title-word routes can be loaded.",
          ),
        );
      }
      publishAudit();
    });
    elements.bookTitle.replaceChildren(details);
  };

  const detailCoverageLabel = (mode, section) =>
    mode === "english"
      ? `Proven detail slice · ${
          sectionRuntime(section).orderedC0Ids.length
        } C0 rows → ${section.base.words.length} numbered workbench cards`
      : "Proven detail slice · canonical right-to-left Hebrew";

  // Canonical source order for one section — the same words the chapter
  // copy uses, scoped to a single N record.
  const canonicalTextForSection = (section) => {
    const runtime = sectionRuntime(section);
    return section.base.canonical_sequence
      .map((index) => runtime.wordByIndex.get(Number(index))?.hebrew || "")
      .filter(Boolean)
      .join(" ");
  };

  // V6.7 · the gate is on export, and the gate is attribution. Text that
  // leaves the reader carries the edition and license it came from, so a
  // CC BY or CC BY-SA obligation travels with the words instead of being
  // stranded on a page the recipient never saw. Public-domain text carries
  // its record too — naming a source costs nothing and is the point.
  const exportAttributionForSection = (section) => {
    const record = section.base?.source;
    if (!record?.license && !record?.version_title) return "";
    const parts = [
      section.ref,
      record.version_title || "Edition unrecorded",
      record.license || "License unrecorded",
    ];
    if (record.source_url) parts.push(record.source_url);
    return parts.join(" · ");
  };

  const withExportAttribution = (blocks) => {
    const body = blocks.map(({ text }) => text).filter(Boolean).join("\n");
    const credits = [
      ...new Set(blocks.map(({ credit }) => credit).filter(Boolean)),
    ];
    if (!credits.length) return body;
    return `${body}\n\n${credits.map((line) => `— ${line}`).join("\n")}`;
  };

  const createExactVerse = (verse, section) => {
    const numberValue = verseNumber(verse);
    const unitScope = `base-${section.unit_id}`;
    const runtime = sectionRuntime(section);
    const canonicalSequence =
      section.base.canonical_sequence ||
      section.base.words.map((word) => Number(word.index));
    const orderedWords = canonicalSequence
      .map((index) => runtime.wordByIndex.get(Number(index)))
      .filter(Boolean);
    const article = make("article", "v3-verse");
    article.id = sectionArticleDomId(section);
    article.dataset.verseRef = verse.public_ref;
    article.dataset.yNodeId = verse.y_node_id;
    article.dataset.v4SectionRef = section.ref;
    article.dataset.v4SectionUnit = section.unit_id;
    article.dataset.detailedReading = "ready";
    const inner = make("div", "v3-verse-inner");
    const number = make("span", "v3-verse-number", String(numberValue));
    number.setAttribute("aria-label", `Verse ${numberValue}`);
    const content = make("div");
    const detailCoverage = make(
      "p",
      "v3-detail-coverage",
      detailCoverageLabel(state.readerMode, section),
    );
    detailCoverage.dataset.sectionRef = section.ref;
    detailCoverage.dataset.c0Rows = String(runtime.orderedC0Ids.length);
    detailCoverage.dataset.cardCount = String(orderedWords.length);
    content.append(detailCoverage);
    const run = make("div", "v3-word-run");
    run.setAttribute(
      "aria-label",
      `${section.ref} canonical Hebrew word reading`,
    );
    run.dir = readerAxisContract.modes[state.readerMode].layout_axis;
    run.dataset.v4CanonicalSequence = canonicalSequence.join(",");
    run.dataset.sectionRef = section.ref;
    const shelf = make("section", "v3-word-hud-shelf");
    shelf.id = `v3-base-word-hud-${section.unit_id}`;
    shelf.hidden = true;
    const commentaryChoiceShelf = make(
      "section",
      "v3-commentary-choice-shelf",
    );
    commentaryChoiceShelf.id =
      `v3-commentary-choice-shelf-${section.unit_id}`;
    commentaryChoiceShelf.dataset.v3CommentaryChoiceShelf = "";
    commentaryChoiceShelf.setAttribute(
      "aria-label",
      "Commentary choices for the selected word",
    );
    commentaryChoiceShelf.hidden = true;

    orderedWords.forEach((word) => {
      const c0Span = runtime.projectionByWordIndex.get(word.index);
      if (!c0Span) return;
      const slot = make("div", "v3-word-slot");
      slot.dataset.sectionRef = section.ref;
      slot.dataset.wordIndex = String(word.index);
      const attachedClaims = claimsForBaseWord(section, word);
      const preferred = runtime.preferredGlosses.get(word.index) || "";
      const usable = wordIsUsable(word);
      const wordButton = usable
        ? createWordButton({
            word,
            scope: unitScope,
            occurrenceId: word.index,
            preferredGloss: preferred,
            controls: shelf.id,
            setSize: orderedWords.length,
          })
        : createHeldCommentaryWordButton({
            word: {
              ...word,
              hold_reason:
                "The exact C0 source word is preserved, but the current ledger build does not provide one fully selectable COMPcell shape. No gloss has been invented.",
            },
            occurrence: {
              occurrence_index: word.index,
              surface: word.hebrew,
              exact_key: word.normalized,
            },
            scope: unitScope,
            shelf,
            setSize: orderedWords.length,
            commentary: false,
            sourceRef: section.ref,
          });
      wordButton.id = c0TargetDomId(c0Span);
      wordButton.dataset.c0StartId = c0Span.start_c0_id;
      wordButton.dataset.c0EndId = c0Span.end_c0_id;
      wordButton.dataset.c0Count = String(c0Span.c0_count);
      // V6: carry the default gloss's provenance on the module, so a
      // derived draft is distinguishable from an attested or user-chosen
      // gloss without opening the HUD.
      const glossProvenance =
        section.ref === "Genesis 1:1"
          ? baseGlossProvenance.get(word.index)
          : null;
      if (glossProvenance) {
        // Backend-only provenance: inspectable in the DOM and the audit,
        // never explained in the visible UI. The rule is the explanation.
        wordButton.dataset.v6DefaultProvenance = glossProvenance.status;
        wordButton.dataset.v6DefaultGloss = glossProvenance.gloss;
        wordButton.dataset.v6DefaultActive = "true";
      }
      const activateSourceWord = () =>
        updateCommentarySourcePosition(section.ref, word.index, {
          origin: "word-activation",
        });
      wordButton.addEventListener("focus", activateSourceWord);
      wordButton.addEventListener("click", activateSourceWord);
      if (usable) {
        wordButton.addEventListener("click", () => {
          const scopeSelector = `[data-v3-word-module][data-scope="${unitScope}"]`;
          if (
            wordButton.getAttribute("aria-expanded") === "true" &&
            !shelf.hidden
          ) {
            closeWordShelf(shelf, scopeSelector);
            publishAudit();
            return;
          }
          renderWordShelf({
            shelf,
            word,
            scope: unitScope,
            occurrenceId: word.index,
            sourceButton: wordButton,
            preferredGloss: preferred,
            sourceRef: section.ref,
          });
          publishAudit();
        });
      }
      slot.append(wordButton);
      slot.append(
        createWordCommentaryBubble({
          section,
          word,
          claims: attachedClaims,
          shelf: commentaryChoiceShelf,
        }),
      );
      run.append(slot);
    });

    content.append(run, commentaryChoiceShelf, shelf);
    // V5.5: the N record rides with its section. One aggregate chip in the
    // book bar cannot speak for sections that carry different editions and
    // licenses (1:1 is Wikisource CC BY-SA 4.0; 1:2 is tanach.us Public
    // Domain), so each materialized section states its own record.
    const nRecord = section.base?.source;
    if (nRecord?.license || nRecord?.version_title) {
      const licenseLine = make("footer", "v5-section-license");
      licenseLine.dataset.v5SectionLicense = section.ref;
      licenseLine.append(
        make(
          "span",
          "",
          `Hebrew text · ${nRecord.version_title || "Edition unrecorded"} · ${
            nRecord.license || "License unrecorded"
          }`,
        ),
      );
      if (nRecord.source_url) {
        licenseLine.append(
          makePointerLink(nRecord.source_url, "Exact source"),
        );
      }
      // V6.4: copy rides per section — each N record's canonical text is
      // copyable on its own, alongside the chapter-level copy.
      const shortRef = section.ref.replace(/^Genesis\s+/u, "");
      const sectionCopy = make("button", "v5-section-copy", `⧉ Copy ${shortRef}`);
      sectionCopy.type = "button";
      sectionCopy.dataset.v5SectionCopy = section.ref;
      sectionCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(
            withExportAttribution([
              {
                text: canonicalTextForSection(section),
                credit: exportAttributionForSection(section),
              },
            ]),
          );
          announce(
            `${section.ref} copied in canonical source order, with its source record.`,
          );
          setText(sectionCopy, "⧉ Copied");
          window.setTimeout(() => {
            setText(sectionCopy, `⧉ Copy ${shortRef}`);
          }, 1600);
        } catch {
          announce("Copy is unavailable in this browser context.");
        }
      });
      licenseLine.append(sectionCopy);
      content.append(licenseLine);
    }
    inner.append(number, content);
    article.append(inner);
    return article;
  };

  const createLazyVerse = (verse) => {
    const numberValue = verseNumber(verse);
    const article = make("article", "v3-verse v3-lazy-verse");
    article.id = `v3-${verse.dom_anchor}`;
    article.dataset.verseRef = verse.public_ref;
    article.dataset.detailedReading = "not-loaded";
    const button = make("button", "v3-lazy-verse-button");
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    const number = make("span", "v3-verse-number", String(numberValue));
    const ref = make("b", "", `Verse ${numberValue}`);
    const stateLabel = make(
      "span",
      "",
      `${verse.content_c0_rows} source rows · detailed text not loaded`,
    );
    button.append(number, ref, stateLabel);
    const status = make(
      "p",
      "v3-lazy-verse-status",
      `${verse.public_ref} is present in the full book spine. Detailed text is not loaded in this mockup; no Hebrew, gloss, or HUD has been invented.`,
    );
    status.hidden = true;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(expanded));
      status.hidden = !expanded;
    });
    article.append(button, status);
    return article;
  };

  const renderNavigationHud = (chapter, sourceButton) => {
    const number = chapterNumber(chapter);
    elements.chapterGrid.querySelectorAll("[data-chapter]").forEach((button) => {
      button.setAttribute("aria-expanded", String(button === sourceButton));
    });
    elements.navigationHud.hidden = false;
    elements.navigationHud.replaceChildren();

    const heading = make("header");
    const copy = make("div");
    copy.append(
      make("p", "", "Y navigation label"),
      make("h3", "", `Chapter ${number} label`),
    );
    const close = make("button", "", "Close details");
    close.type = "button";
    close.addEventListener("click", () => {
      elements.navigationHud.hidden = true;
      sourceButton.setAttribute("aria-expanded", "false");
      sourceButton.focus();
    });
    heading.append(copy, close);

    const reading = make("div", "v3-navigation-reading");
    reading.append(
      make("span", "", "Selected contextual reading"),
      make("b", "", `Chapter ${number}`),
    );
    const note = make(
      "p",
      "v3-navigation-note",
      "The raw Hebrew numeral is exact in Y. Lexical word routes are not promoted here because they do not establish the numeral's chapter sense.",
    );
    const actions = make("div", "v3-navigation-actions");
    const open = make("button", "", `Open chapter ${number}`);
    open.type = "button";
    open.addEventListener("click", () => selectChapter(number));
    const stay = make("button", "", "Keep browsing chapters");
    stay.type = "button";
    stay.addEventListener("click", () => sourceButton.focus());
    actions.append(open, stay);
    elements.navigationHud.append(heading, reading, note, actions);
    elements.navigationHud.scrollIntoView({ block: "nearest" });
    publishAudit();
  };

  const renderChapterNavigation = () => {
    const fragment = document.createDocumentFragment();
    chapterNodes.forEach((chapter) => {
      const number = chapterNumber(chapter);
      const button = make("button", "v3-chapter-button");
      button.type = "button";
      button.dataset.chapter = String(number);
      button.dataset.v4HebrewUnit = "";
      button.dataset.yNodeId = chapter.y_node_id;
      button.setAttribute(
        "aria-label",
        `Chapter ${number}. Hebrew label ${chapter.label_hebrew}. Open contextual label HUD.`,
      );
      button.setAttribute("aria-current", String(number === state.chapter));
      button.setAttribute("aria-controls", elements.navigationHud.id);
      button.setAttribute("aria-expanded", "false");
      const englishNumber = make("span", "v3-chapter-number", String(number));
      englishNumber.dir = "ltr";
      const raw = make("span", "v3-chapter-hebrew", chapter.label_hebrew);
      raw.lang = "he";
      raw.dir = "rtl";
      raw.dataset.v3HebrewToken = "";
      raw.dataset.v4RawHebrew = "";
      const gloss = make("span", "v3-chapter-gloss", `Chapter ${number}`);
      gloss.lang = "en";
      gloss.dir = "ltr";
      gloss.dataset.v4SelectedGloss = "";
      button.append(englishNumber, raw, gloss);
      button.addEventListener("click", () => renderNavigationHud(chapter, button));
      fragment.append(button);
    });
    elements.chapterGrid.replaceChildren(fragment);
  };

  const selectChapter = (
    number,
    { alignCommentary = true } = {},
  ) => {
    const chapter = chapterByNumber.get(number);
    if (!chapter) return;
    const commentaryWasOpen =
      document.body.dataset.v3CommentaryOpen === "true";
    closeCommentaryChoosers();
    state.chapter = number;
    state.streamStart = number;
    state.appendedThrough = number;
    const verses = versesByChapterId.get(chapter.y_node_id) || [];
    setText(elements.currentChapter, String(number));
    setText(elements.currentVerseCount, String(verses.length));
    setText(elements.chapterHeading, `Chapter ${number}`);
    elements.copyCanonical.disabled = !verses.some((verse) =>
      sectionsByRef.has(verse.public_ref),
    );
    elements.previousChapter.disabled = number <= 1;
    elements.nextChapter.disabled = number >= chapterNodes.length;
    elements.chapterGrid
      .querySelectorAll("[data-chapter]")
      .forEach((button) => {
        button.setAttribute(
          "aria-current",
          String(Number(button.dataset.chapter) === number),
        );
      });
    const fragment = document.createDocumentFragment();
    verses.forEach((verse) => {
      const section = sectionsByRef.get(verse.public_ref);
      fragment.append(
        section
          ? createExactVerse(verse, section)
          : createLazyVerse(verse),
      );
    });
    elements.verseStream.replaceChildren(fragment);
    elements.verseStream
      .querySelectorAll("[data-v3-commentary-pill]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.commentaryUnitRef === state.activeClaimRef),
        );
    });
    // V6.5 (hostile-review repair): the smooth-animated reset to the top
    // passes through the near-bottom zone and was silently appending the
    // next chapters during a jump. Appends stay quiet until the reset
    // settles.
    state.sourceStreamSuppressUntil = Date.now() + 900;
    elements.readingPane.scrollTop = 0;
    const firstSectionRef = verses[0]?.public_ref || "";
    if (firstSectionRef) {
      state.currentSourcePosition = sourcePosition(firstSectionRef, 1);
    }
    closeChapterDrawer();
    setMobileWorkspace("text");
    announce(`Genesis chapter ${number}, ${verses.length} verses.`);
    if (
      alignCommentary &&
      commentaryWasOpen &&
      state.activeCommentaryTrack &&
      firstSectionRef
    ) {
      requestAnimationFrame(() => {
        alignCommentaryTrackToSource(firstSectionRef, 1, {
          origin: "source-open",
          openPane: true,
        });
      });
    }
    scheduleCommentarySnapFromScroll();
    publishAudit();
  };

  // ── V6.4 · continuous source stream ────────────────────────────────────
  // Reaching the end of a chapter continues into the next one in the same
  // stream — the reading does not stop at a chapter boundary. The chapter
  // chrome (heading, count, copy scope, jumper) follows the scroll. Jumping
  // from the chapter drawer or the arrows still resets the stream to that
  // chapter alone.
  const appendNextChapter = () => {
    const nextNumber = (state.appendedThrough || state.chapter) + 1;
    if (nextNumber > chapterNodes.length) return false;
    const chapter = chapterByNumber.get(nextNumber);
    if (!chapter) return false;
    const verses = versesByChapterId.get(chapter.y_node_id) || [];
    if (!verses.length) return false;
    const divider = make("header", "v5-chapter-divider");
    divider.dataset.v5ChapterDivider = String(nextNumber);
    divider.append(make("h2", "", `Chapter ${nextNumber}`));
    const fragment = document.createDocumentFragment();
    fragment.append(divider);
    verses.forEach((verse) => {
      const section = sectionsByRef.get(verse.public_ref);
      fragment.append(
        section
          ? createExactVerse(verse, section)
          : createLazyVerse(verse),
      );
    });
    elements.verseStream.append(fragment);
    state.appendedThrough = nextNumber;
    publishAudit();
    return true;
  };

  const chapterNumberFromRef = (sectionRef) => {
    const match = /^Genesis\s+(\d+):/u.exec(String(sectionRef || ""));
    return match ? Number(match[1]) : null;
  };

  // Chrome-only follow: no stream rebuild, no scroll reset.
  const syncChapterChrome = (number) => {
    if (!Number.isInteger(number) || number === state.chapter) return;
    const chapter = chapterByNumber.get(number);
    if (!chapter) return;
    state.chapter = number;
    const verses = versesByChapterId.get(chapter.y_node_id) || [];
    setText(elements.currentChapter, String(number));
    setText(elements.currentVerseCount, String(verses.length));
    setText(elements.chapterHeading, `Chapter ${number}`);
    elements.copyCanonical.disabled = !verses.some((verse) =>
      sectionsByRef.has(verse.public_ref),
    );
    elements.previousChapter.disabled = number <= 1;
    elements.nextChapter.disabled = number >= chapterNodes.length;
    elements.chapterGrid
      .querySelectorAll("[data-chapter]")
      .forEach((button) => {
        button.setAttribute(
          "aria-current",
          String(Number(button.dataset.chapter) === number),
        );
      });
    publishAudit();
  };

  let sourceStreamFrame = 0;
  const sourceStreamScrollCheck = () => {
    sourceStreamFrame = 0;
    const pane = elements.readingPane;
    if (!pane) return;
    // Continue the stream shortly before the reader runs out of it — but
    // not while a chapter jump's animated reset is still passing through
    // the near-bottom zone.
    if (
      Date.now() > (state.sourceStreamSuppressUntil || 0) &&
      pane.scrollTop + pane.clientHeight >=
        pane.scrollHeight - Math.max(560, pane.clientHeight * 0.75)
    ) {
      appendNextChapter();
    }
    // Follow the chapter under the reading line.
    const probeY =
      pane.getBoundingClientRect().top + Math.min(160, pane.clientHeight / 3);
    const articles = pane.querySelectorAll(".v3-verse");
    let currentRef = null;
    for (const article of articles) {
      if (article.getBoundingClientRect().top > probeY) break;
      currentRef = article.dataset.verseRef || currentRef;
    }
    const number = chapterNumberFromRef(currentRef);
    if (number) syncChapterChrome(number);
  };
  const scheduleSourceStreamCheck = () => {
    if (sourceStreamFrame) return;
    sourceStreamFrame = requestAnimationFrame(sourceStreamScrollCheck);
  };

  const resolveCommentaryTrackRequest = (request) => {
    const requested = String(request || "")
      .trim()
      .toLocaleLowerCase();
    if (!requested) return "";
    const tracks = [...commentaryTrackUnitsByTrack.keys()];
    return (
      tracks.find((track) => track.toLocaleLowerCase() === requested) ||
      tracks.find((track) =>
        track.toLocaleLowerCase().startsWith(requested),
      ) ||
      tracks.find((track) =>
        requested.startsWith(track.toLocaleLowerCase()),
      ) ||
      ""
    );
  };

  const parseSourceAddress = (value) => {
    const match = /^Genesis\s+(\d+):(\d+)(?::(\d+))?$/iu.exec(
      String(value || "").trim(),
    );
    if (!match) return null;
    const chapter = Number(match[1]);
    const verse = Number(match[2]);
    const wordIndex = Number(match[3] || 1);
    const sectionRef = `Genesis ${chapter}:${verse}`;
    if (
      !chapterByNumber.has(chapter) ||
      !sourceSectionOrderByRef.has(sectionRef) ||
      !Number.isInteger(wordIndex) ||
      wordIndex < 1
    ) {
      return null;
    }
    return { chapter, verse, wordIndex, sectionRef };
  };

  const openAlignedSource = ({
    sourceRef,
    commentaryTrack,
    showCommentary = true,
  }) => {
    const address = parseSourceAddress(sourceRef);
    const track = resolveCommentaryTrackRequest(commentaryTrack);
    if (!address || !track) return false;
    state.manualSourceHoldUntil = Date.now() + 1200;
    selectChapter(address.chapter, { alignCommentary: false });
    state.activeCommentaryTrack = track;
    state.currentSourcePosition = sourcePosition(
      address.sectionRef,
      address.wordIndex,
    );
    requestAnimationFrame(() => {
      alignCommentaryTrackToSource(
        address.sectionRef,
        address.wordIndex,
        {
          origin: "source-address",
          openPane: showCommentary,
        },
      );
      if (showCommentary) setMobileWorkspace("commentary");
      const sourceNode = orderedBaseSourceSections.find(
        (node) => node.public_ref === address.sectionRef,
      );
      const target = sourceNode?.dom_anchor
        ? document.querySelector(`#v3-${sourceNode.dom_anchor}`)
        : null;
      target?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return true;
  };
  window.V4_OPEN_ALIGNED_SOURCE = openAlignedSource;

  const commentaryFixtureForClaim = (section, claim) => {
    const entry = section?.commentaries?.[claim?.commentary_unit_ref];
    return entry?.fixture?.source?.ref === claim?.commentary_unit_ref
      ? entry
      : null;
  };

  // V7 · route-store-rule-v1-catalog-compact-top5.
  //
  // The definition factory's sealed compact layer (definition-poc frame 38:
  // 140,532 exact K values, top-5 selected routes, catalog-v86 primary D/M)
  // is published as 256 static gzip shards under data/route-store/. When a
  // word module would render HELD — the fixture carries no fully selectable
  // shape — the reader now asks that layer for the word's byte-exact
  // kNormalizedKey: sha256(K) names one shard, fetch() gets ~30 KB,
  // DecompressionStream("gzip") unpacks it in the browser. A hit becomes an
  // ordinary word module whose routes carry the factory's full M license
  // record, so routeIsDisplayReady gates them exactly like fixture routes.
  //
  // Laws carried over unchanged: exact K only (no folding, no derivation —
  // FRAME.md), the UI never explains itself (provenance rides in dataset
  // and the audit, not in visible text), and a miss stays honestly held.
  const routeStore = {
    enabled:
      typeof DecompressionStream === "function" &&
      typeof crypto !== "undefined" &&
      !!crypto.subtle,
    indexPromise: null,
    index: null,
    shards: new Map(),
    lookups: 0,
    hits: 0,
    woken: 0,
  };
  const routeStoreIndex = () => {
    routeStore.indexPromise =
      routeStore.indexPromise ||
      fetch("data/route-store/index.json")
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
        .then((index) => {
          routeStore.index = index;
          return index;
        });
    return routeStore.indexPromise;
  };
  const routeStoreShardFor = async (key) => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(key),
    );
    const shard = new Uint8Array(digest)[0].toString(16).padStart(2, "0");
    if (!routeStore.shards.has(shard)) {
      routeStore.shards.set(
        shard,
        (async () => {
          const res = await fetch(`data/route-store/shards/${shard}.bin`);
          if (!res.ok) throw new Error(String(res.status));
          const unpacked = res.body.pipeThrough(
            new DecompressionStream("gzip"),
          );
          return JSON.parse(await new Response(unpacked).text());
        })().catch(() => null),
      );
    }
    return routeStore.shards.get(shard);
  };
  // One synthesized word per hit: a single whole-word shape whose bundle
  // carries one choice/pBundle per stored route, rank order preserved.
  const routeStoreWord = (surface, key, routes, mSources) => {
    const base = `RS-${key}`;
    const pBundles = [];
    const choices = [];
    routes.forEach(([rank, routeText, definitionText, mId, year], i) => {
      const m = mSources[mId];
      if (!m || !routeText || !definitionText) return;
      const pbId = `${base}-PB-${i + 1}`;
      const dId = `${base}-D-${i + 1}`;
      pBundles.push({
        id: pbId,
        label: m.label,
        firstLedgerPosition: rank,
        helperRoutes: [{ key: `${pbId}-R`, text: routeText }],
        definitions: [
          {
            id: dId,
            text: definitionText,
            firstLedgerPosition: rank,
            helperRoutes: [],
            exactRoutes: [{ text: routeText }],
            mSources: [
              {
                key: m.key,
                label: m.label,
                licensePosture: m.licensePosture,
                licensePointer: m.licensePointer,
                sourceYear: year || m.sourceYear || "S_NO_SOURCE_YEAR",
                externalCitation: m.licensePointer,
              },
            ],
          },
        ],
      });
      choices.push({
        id: `${base}-C-${i + 1}`,
        key: `${base}-C-${i + 1}`,
        text: routeText,
        firstLedgerPosition: rank,
        sourceYears: year && year !== "S_NO_SOURCE_YEAR" ? [year] : [],
        pBundleId: pbId,
        definitionId: dId,
      });
    });
    if (!choices.length) return null;
    return {
      id: base,
      hebrew: surface,
      normalized: key,
      provenance: {
        rule_id: "route-store-rule-v1-catalog-compact-top5",
        source: "definition-poc frame 38 · catalog v86 compact top-5 routes",
      },
      shapes: [
        {
          kind: "whole word",
          label: "Ledger route store",
          cells: [
            {
              displayIndex: 1,
              compcellTemplateId: `${base}-CELL`,
              surface,
              kind: "whole word",
              spanRole: "maximal",
              kNormalizedKey: key,
              lBundleId: `${base}-L`,
              matchBasis: "exact_k_route_store",
              lBundle: { id: `${base}-L`, choices, pBundles },
            },
          ],
        },
      ],
    };
  };
  const armRouteStoreWake = ({
    button,
    occurrence,
    scope,
    shelf,
    setSize,
    commentary,
    sourceRef,
  }) => {
    if (!routeStore.enabled || !occurrence.exact_key) return;
    routeStore.lookups += 1;
    void (async () => {
      const [index, shard] = await Promise.all([
        routeStoreIndex(),
        routeStoreShardFor(occurrence.exact_key),
      ]);
      const routes = shard?.[occurrence.exact_key];
      if (!index?.m_sources || !routes?.length) return;
      routeStore.hits += 1;
      if (!button.isConnected) return;
      const word = routeStoreWord(
        occurrence.surface,
        occurrence.exact_key,
        routes,
        index.m_sources,
      );
      if (!word || !wordIsUsable(word)) return;
      const replacement = createWordButton({
        word,
        scope,
        occurrenceId: occurrence.occurrence_index,
        controls: shelf.id,
        commentary,
        setSize,
      });
      // The held button may carry caller-set identity (C0 target ids,
      // provenance datasets). Those move whole to the replacement.
      if (button.id) replacement.id = button.id;
      Object.entries(button.dataset).forEach(([k, v]) => {
        if (!(k in replacement.dataset)) replacement.dataset[k] = v;
      });
      replacement.dataset.v7RouteStore = "catalog-v86-top5";
      replacement.addEventListener("click", () => {
        renderWordShelf({
          shelf,
          word,
          scope,
          occurrenceId: occurrence.occurrence_index,
          sourceButton: replacement,
          commentary,
          sourceRef,
        });
        publishAudit();
      });
      button.replaceWith(replacement);
      routeStore.woken += 1;
      publishAudit();
    })();
  };

  const createHeldCommentaryWordButton = ({
    word,
    occurrence,
    scope,
    shelf,
    setSize,
    commentary = true,
    sourceRef = "",
  }) => {
    const button = make("button", "v3-word-module is-hud-held");
    button.type = "button";
    button.dataset.v3WordModule = "";
    button.dataset.v4HebrewUnit = "";
    button.dataset.v4HeldHud = "";
    button.dataset.scope = scope;
    button.dataset.occurrenceId = String(occurrence.occurrence_index);
    button.dataset.displayWordIndex = String(occurrence.occurrence_index);
    button.dataset.numberingScope = "UNIT_LOCAL";
    button.dataset.wordKey = occurrence.exact_key;
    button.dataset.moduleKind = commentary ? "commentary" : "base";
    button.dataset.unitSetSize = String(setSize);
    button.setAttribute("aria-controls", shelf.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute(
      "aria-label",
      `${occurrence.surface}. Exact selectable HUD routes are held. Open status.`,
    );

    const sequence = make(
      "span",
      "v3-word-sequence",
      String(occurrence.occurrence_index),
    );
    sequence.dir = "ltr";
    sequence.setAttribute("aria-hidden", "true");
    const raw = make("span", "v3-word-source", occurrence.surface);
    raw.lang = "he";
    raw.dir = "rtl";
    raw.dataset.v3HebrewToken = "";
    raw.dataset.v3WordSource = "";
    raw.dataset.v4RawHebrew = "";
    markCopyableHebrew(button, raw);
    const status = make("span", "v3-word-gloss", "HUD held");
    status.id = `v3-selected-gloss-${scope}-${occurrence.occurrence_index}`.replace(
      /[^a-z0-9-]+/giu,
      "-",
    );
    status.lang = "en";
    status.dir = "ltr";
    status.dataset.v3SelectedGloss = "";
    status.dataset.v4SelectedGloss = "";
    button.append(sequence, raw, status);

    button.addEventListener("click", () => {
      const scopeSelector = `[data-v3-word-module][data-scope="${scope}"]`;
      if (
        !commentary &&
        button.getAttribute("aria-expanded") === "true" &&
        !shelf.hidden
      ) {
        closeWordShelf(shelf, scopeSelector);
        publishAudit();
        return;
      }
      if (!commentary) {
        document
          .querySelectorAll(".v3-word-hud-shelf")
          .forEach((candidate) => {
            if (candidate !== shelf) {
              candidate.hidden = true;
              candidate.removeAttribute("aria-labelledby");
              candidate.replaceChildren();
            }
          });
        document
          .querySelectorAll(
            '[data-v3-word-module][data-module-kind="base"]',
          )
          .forEach((candidate) =>
            candidate.setAttribute("aria-expanded", "false"),
          );
      }
      document.querySelectorAll(scopeSelector).forEach((candidate) => {
        candidate.setAttribute(
          "aria-expanded",
          String(candidate === button),
        );
      });
      shelf.className = commentary
        ? "v3-commentary-hud-shelf"
        : "v3-word-hud-shelf";
      dockBaseWordShelf(shelf, button, commentary);
      shelf.setAttribute("aria-labelledby", status.id);
      shelf.hidden = false;
      const heading = make("header", "v3-hud-heading");
      const headingCopy = make("div");
      headingCopy.append(
        make(
          "p",
          "",
          commentary ? "Commentary word" : `${sourceRef || "Genesis"} word`,
        ),
        make("h3", "", "Exact HUD held"),
      );
      const close = make("button", "v3-hud-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close word status");
      close.addEventListener("click", () => {
        closeWordShelf(shelf, scopeSelector);
        button.focus();
      });
      heading.append(headingCopy, close);
      const held = make("section", "v3-hud-cell");
      held.append(
        make("p", "", occurrence.surface),
        make(
          "span",
          "",
          word?.hold_reason ||
            word?.unavailable_reason ||
            "The raw source word is preserved, but no exact selectable COMPcell route is available. No gloss has been invented.",
        ),
      );
      if (commentary) {
        shelf.replaceChildren(heading, held);
      } else {
        const panel = make("div", "v4-base-hud-panel");
        panel.append(heading, held);
        shelf.replaceChildren(panel);
        positionBaseHudPanel(shelf, button);
      }
      publishAudit();
    });
    armRouteStoreWake({
      button,
      occurrence,
      scope,
      shelf,
      setSize,
      commentary,
      sourceRef,
    });
    return button;
  };

  // V6.3 · dibbur hamatchil presentation. The licensed Rosenbaum–Silbermann
  // text opens each comment with its headword followed by a period — the
  // print convention for the dibbur hamatchil, not a punctuation defect.
  // Presentation marks that opening (headword plus its period) so the
  // convention reads as intended. The text itself is never mutated: the
  // wrap re-parents the exact characters and adds none.
  const V5_LEMMA_MAX_CHARS = 40;
  const applyLemmaPresentation = (node) => {
    const text = node.textContent || "";
    const stop = text.indexOf(".");
    if (stop <= 0 || stop > V5_LEMMA_MAX_CHARS) return;
    const lemma = make("span", "v5-lemma", text.slice(0, stop + 1));
    lemma.dataset.v5Lemma = "";
    lemma.dataset.v5LemmaBasis = "TEXT_OWN_HEADWORD_PERIOD_CONVENTION";
    node.replaceChildren(lemma, document.createTextNode(text.slice(stop + 1)));
  };

  // The character offset just past the comment's opening headword, or 0
  // when the paragraph does not open with the period convention.
  const lemmaBoundaryOffset = (paragraphText) => {
    const stop = String(paragraphText || "").indexOf(".");
    return stop > 0 && stop <= V5_LEMMA_MAX_CHARS ? stop : 0;
  };

  const renderCommentaryWords = async ({
    claim,
    fixture,
    registry,
    scope,
    host,
    count,
    renderToken: providedToken = null,
  }) => {
    // V4.1: sibling records render concurrently in the stacked workspace, so
    // a caller-provided pass token must not be re-incremented per record —
    // that would cancel the other records of the same pass.
    const renderToken =
      providedToken ?? ++state.commentaryRenderToken;
    const total = fixture.paragraph.occurrences.length;
    const occurrences = fixture.paragraph.occurrences.slice(0, count);
    host.replaceChildren(
      make(
        "p",
        "v3-pane-status",
        `Preparing ${occurrences.length} exact commentary word modules…`,
      ),
    );
    const indexByKey = new Map(
      fixture.exact_hud.word_index.map((entry) => [entry.normalized, entry]),
    );
    const scripts = [
      ...new Set(
        occurrences
          .map((occurrence) => indexByKey.get(occurrence.exact_key)?.script)
          .filter(Boolean),
      ),
    ];
    // V5.4: probe one shard first. The shards share a folder — when the
    // first is missing the folder is unpublished, and firing sixty more
    // doomed requests serves nobody.
    if (scripts.length) {
      try {
        await loadScript(scripts[0]);
        await Promise.allSettled(scripts.slice(1).map(loadScript));
      } catch {
        // Fall through — the usable-word check below presents the exact
        // proof text instead.
      }
    }
    if (renderToken !== state.commentaryRenderToken) return;

    const wordRegistry = window[registry] || {};
    // V5.4 defect repair: the per-word shard files this fixture references
    // were never published in any branch of the repository. When not a
    // single word is usable, a wall of held stubs serves nobody — the
    // comment's exact original-language proof text rides instead, clearly
    // marked, with nothing invented.
    const usableOccurrences = occurrences.filter((occurrence) =>
      wordIsUsable(wordRegistry[occurrence.exact_key]),
    ).length;
    if (usableOccurrences === 0) {
      const proofSegment = legacyProofCommentaryByRef.get(
        claim.commentary_unit_ref,
      );
      if (proofSegment?.he?.proof_text) {
        const reading = make("div");
        const raw = make(
          "p",
          "v4-commentary-raw-proof",
          proofSegment.he.proof_text,
        );
        raw.lang = "he";
        raw.dir = "rtl";
        applyLemmaPresentation(raw);
        const heldNote = make("p", "v5-shard-held-note");
        heldNote.append(
          make("b", "", "Word-level detail held"),
          make(
            "span",
            "",
            " · The per-word HUD files for this comment are not published, so the exact proof text is presented whole. No gloss has been invented.",
          ),
        );
        reading.append(raw, heldNote);
        host.replaceChildren(reading);
        publishAudit();
        return;
      }
    }
    const run = make("div", "v3-commentary-word-run");
    run.dir = readerAxisContract.modes[state.readerMode].layout_axis;
    run.setAttribute("aria-label", `${compactClaimTitle(claim)} word reading`);
    const shelf = make("section", "v3-commentary-hud-shelf");
    shelf.id = `v3-commentary-hud-${scope}`;
    shelf.hidden = true;
    // The word run presents words without the paragraph's punctuation, so
    // the opening dibbur hamatchil is marked on its word module(s) instead
    // of by its period.
    const lemmaBoundary = lemmaBoundaryOffset(fixture.paragraph?.hebrew);
    const markLemmaButton = (button, occurrence) => {
      if (
        lemmaBoundary > 0 &&
        Number.isInteger(occurrence.character_offset) &&
        occurrence.character_offset < lemmaBoundary
      ) {
        button.classList.add("v5-lemma-word");
        button.dataset.v5Lemma = "";
      }
    };
    occurrences.forEach((occurrence) => {
      const registryWord = wordRegistry[occurrence.exact_key];
      const word = registryWord
        ? { ...registryWord, hebrew: occurrence.surface }
        : {
            normalized: occurrence.exact_key,
            hebrew: occurrence.surface,
            hold_reason:
              "The exact word shard did not load. The raw source word remains visible and no gloss has been invented.",
          };
      if (!wordIsUsable(word)) {
        const heldButton = createHeldCommentaryWordButton({
          word,
          occurrence,
          scope,
          shelf,
          setSize: total,
        });
        markLemmaButton(heldButton, occurrence);
        run.append(heldButton);
        return;
      }
      const wordButton = createWordButton({
        word,
        scope,
        occurrenceId: occurrence.occurrence_index,
        controls: shelf.id,
        commentary: true,
        setSize: total,
      });
      markLemmaButton(wordButton, occurrence);
      wordButton.addEventListener("click", () => {
        renderWordShelf({
          shelf,
          word,
          scope,
          occurrenceId: occurrence.occurrence_index,
          sourceButton: wordButton,
          commentary: true,
        });
        publishAudit();
      });
      run.append(wordButton);
    });
    host.replaceChildren(run, shelf);
    if (occurrences.length < total) {
      const more = make(
        "button",
        "v3-commentary-more",
        `Show the next ${Math.min(8, total - occurrences.length)} words`,
      );
      more.type = "button";
      more.addEventListener("click", () => {
        state.commentaryVisibleCount = Math.min(total, count + 8);
        void renderCommentaryWords({
          claim,
          fixture,
          registry,
          scope,
          host,
          count: state.commentaryVisibleCount,
          renderToken: state.commentaryRenderToken,
        });
      });
      host.append(more);
    }
    publishAudit();
  };

  const commentaryTrackSections = (track) => {
    const sections = [];
    const byRef = new Map();
    (commentaryTrackUnitsByTrack.get(track) || []).forEach((unit) => {
      let entry = byRef.get(unit.section.ref);
      if (!entry) {
        entry = {
          section: unit.section,
          units: [],
        };
        byRef.set(unit.section.ref, entry);
        sections.push(entry);
      }
      entry.units.push(unit);
    });
    return sections;
  };

  // V5: the stepper walks the rail — every item of the flowing work in
  // canonical order, attached units and ledger segments alike.
  const activeCommentaryTrackIndex = () => state.activeRailIndex;

  const railItemLabel = (item) =>
    item
      ? item.kind === "unit"
        ? compactClaimTitle(item.unit.claim)
        : item.ref
      : "";

  const commentaryStepTargetIndex = (delta) => {
    const items = state.railItems;
    if (!items.length) return -1;
    if (state.activeRailIndex >= 0) {
      const candidate = state.activeRailIndex + delta;
      return candidate >= 0 && candidate < items.length ? candidate : -1;
    }
    if (!state.currentSourcePosition) {
      return delta > 0 ? 0 : items.length - 1;
    }
    const positionOf = (item) =>
      sourcePosition(item.sectionRef, item.start);
    if (delta > 0) {
      return items.findIndex(
        (item) =>
          compareSourcePositions(
            positionOf(item),
            state.currentSourcePosition,
          ) >= 0,
      );
    }
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (
        compareSourcePositions(
          positionOf(items[index]),
          state.currentSourcePosition,
        ) <= 0
      ) {
        return index;
      }
    }
    return -1;
  };

  const updateCommentaryStepper = () => {
    const items = state.railItems;
    const activeIndex = state.activeRailIndex;
    const previousIndex = commentaryStepTargetIndex(-1);
    const nextIndex = commentaryStepTargetIndex(1);
    elements.commentaryStepper.hidden = items.length === 0;
    setText(
      elements.commentaryPosition,
      activeIndex >= 0
        ? `${activeIndex + 1} of ${items.length}`
        : `— of ${items.length}`,
    );
    elements.previousCommentary.disabled = previousIndex < 0;
    elements.nextCommentary.disabled = nextIndex < 0;
    elements.previousCommentary.setAttribute(
      "aria-label",
      previousIndex >= 0
        ? `Previous rail item, ${railItemLabel(items[previousIndex])}`
        : "No previous rail item",
    );
    elements.nextCommentary.setAttribute(
      "aria-label",
      nextIndex >= 0
        ? `Next rail item, ${railItemLabel(items[nextIndex])}`
        : "No next rail item",
    );
  };

  const appendCommentaryRecord = (host, unit, origin, renderToken = null) => {
    const { section, claim } = unit;
    const exactFixture = commentaryFixtureForClaim(section, claim);
    const record = make("article", "v3-commentary-record");
    record.dataset.commentaryUnitRef = claim.commentary_unit_ref;
    record.dataset.commentaryTrack = unit.track;
    record.dataset.snapOrigin = origin;
    record.dataset.claimState = claim.claim_state;
    record.dataset.edgeAssertion = String(
      claim.claim_state === "PROVEN_EDGE",
    );
    record.dataset.attachmentGrain =
      claim.claim_state === "PROVEN_EDGE"
        ? claim.asserted_edge.grain
        : "UNASSERTED";
    const header = make("header");
    header.append(
      make("p", "", scopeLabel(section, claim)),
      make("h3", "", compactClaimTitle(claim)),
      make(
        "span",
        "",
        `${claim.commentary_unit_ref} · ${
          claim.topic ||
          claim.visible_headword ||
          claim.anchor_label ||
          "attached commentary"
        }`,
      ),
    );
    record.append(header);

    if (exactFixture) {
      const meta = make("div", "v3-commentary-meta");
      meta.append(
        make("span", "", exactFixture.fixture.source.version_title),
        make(
          "span",
          "",
          `License · ${exactFixture.fixture.source.license}`,
        ),
        makeSourceLink(exactFixture.fixture.source, "Exact source"),
      );
      record.append(meta);
      const reading = make("section", "v3-commentary-reading");
      record.append(reading);
      host.append(record);
      const fullCount =
        exactFixture.fixture.paragraph.occurrences.length;
      state.commentaryVisibleCount = fullCount;
      void renderCommentaryWords({
        claim,
        ...exactFixture,
        host: reading,
        count: fullCount,
        renderToken,
      });
      return;
    }

    const proofSegment = legacyProofCommentaryByRef.get(
      claim.commentary_unit_ref,
    );
    if (proofSegment?.he?.proof_text) {
      const meta = make("div", "v3-commentary-meta");
      meta.append(
        make(
          "span",
          "",
          proofSegment.he.version_title || "Original-language proof text",
        ),
        make(
          "span",
          "",
          `License · ${proofSegment.he.license || "Unavailable"}`,
        ),
        makeSourceLink(
          { source_url: proofSegment.source_url },
          "Exact source",
        ),
      );
      const reading = make("section", "v3-commentary-reading");
      const raw = make(
        "p",
        "v4-commentary-raw-proof",
        proofSegment.he.proof_text,
      );
      raw.lang = "he";
      raw.dir = "rtl";
      applyLemmaPresentation(raw);
      // V4.1 defect repair: proof-text witnesses are display-only original
      // language, not selectable-HUD word units, so they must not carry the
      // hebrew-token/raw-unit markers. V4.0 tagged them and therefore failed
      // its own visible-Hebrew contract whenever a proof-text unit was the
      // active selection.
      reading.append(raw);
      record.append(meta, reading);
      host.append(record);
      return;
    }

    const status = make("section", "v3-commentary-fail-closed");
    status.append(
      make("p", "", "Exact commentary word modules are not materialized."),
      make(
        "span",
        "",
        "This comment remains English metadata only. Its opening phrase may orient a reader, but the interface does not claim an exact word or span.",
      ),
    );
    record.append(status);
    host.append(record);
  };

  const scrollCommentaryUnitIntoView = (origin) => {
    const active = elements.commentaryContent.querySelector(
      ".v5-rail-item.is-active, .v5-rail-item.is-rail-focus, .v4-commentary-unit.is-active",
    );
    if (!active) {
      if (origin !== "rail-work" && origin !== "initial") {
        elements.commentaryPane.scrollTop = 0;
      }
      return;
    }
    state.railProgrammaticScrollUntil = Date.now() + 900;
    const paneRect = elements.commentaryPane.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const stickyHeight = v5StickyOffset(elements.commentaryPane);
    const top =
      elements.commentaryPane.scrollTop +
      activeRect.top -
      paneRect.top -
      stickyHeight -
      10;
    elements.commentaryPane.scrollTo({
      top: Math.max(0, top),
      behavior:
        origin === "manual-step" || origin === "manual-track"
          ? "smooth"
          : "auto",
    });
  };

  // V4.1: the full witness ledger presents every recorded work on the verse,
  // not only the units the attachment map has proven. Original-language text
  // displays only where its license record clears display; every other
  // segment stays visible as held metadata. The node is built once so open
  // ledger sections survive workspace re-renders.
  let witnessLedgerNode = null;

  const witnessSegmentDisplayable = (segment) =>
    Boolean(
      segment?.he?.proof_text &&
        segment?.he?.source_text_present &&
        (segment?.he?.license_disposition === "OPEN_OR_PUBLIC_DOMAIN" ||
          (segment?.he?.license_disposition === "NONCOMMERCIAL_REVIEW" &&
            displayPolicy.commercial_use === false)),
    );

  const appendWitnessSegments = (host, family) => {
    (family.segments || []).forEach((segment) => {
      const article = make("article", "v4-witness-segment");
      const head = make("header");
      head.append(
        make("b", "", segment.ref),
        make("span", "", segment.he_ref || ""),
      );
      article.append(head);
      if (witnessSegmentDisplayable(segment)) {
        const proof = make(
          "p",
          "v4-commentary-raw-proof v4-witness-proof",
          segment.he.proof_text,
        );
        proof.lang = "he";
        proof.dir = "rtl";
        applyLemmaPresentation(proof);
        article.append(proof);
        const meta = make("div", "v3-commentary-meta");
        meta.append(
          make(
            "span",
            "",
            segment.he.version_title || "Original-language proof text",
          ),
          make("span", "", `License · ${segment.he.license || "Recorded"}`),
          makeSourceLink({ source_url: segment.source_url }, "Exact source"),
        );
        article.append(meta);
      } else {
        article.dataset.status = "held";
        const held = make("div", "v4-witness-held");
        held.append(
          make("b", "", "Held · text not cleared for display"),
          make(
            "span",
            "",
            "The mapping stays visible as metadata; its license record does not clear original-language display in this proof.",
          ),
          makeSourceLink({ source_url: segment.source_url }, "Exact source"),
        );
        article.append(held);
      }
      host.append(article);
    });
  };

  const buildWitnessLedger = () => {
    if (witnessLedgerNode) return witnessLedgerNode;
    const families = [
      ...(commentaryData?.commentary || []),
      ...(commentaryData?.targum || []),
    ];
    if (!families.length) return null;
    const attachedTracks = new Set(commentaryTrackUnitsByTrack.keys());
    const segmentTotal = families.reduce(
      (sum, family) => sum + (family.segments?.length || 0),
      0,
    );
    const displayableTotal = families.reduce(
      (sum, family) =>
        sum +
        (family.segments || []).filter(witnessSegmentDisplayable).length,
      0,
    );
    const ledger = make("section", "v4-witness-ledger");
    ledger.dataset.v4WitnessLedger = "";
    const heading = make("header", "v4-witness-ledger-heading");
    heading.append(
      make("p", "", "Full witness ledger"),
      make("h3", "", commentaryData?.base?.ref || "Genesis 1:1"),
      make(
        "span",
        "",
        `${families.length} recorded works · ${segmentTotal} segments · ${displayableTotal} carry cleared original-language text. Every witness this proof holds for the verse, presented whole.`,
      ),
    );
    ledger.append(heading);
    families.forEach((family) => {
      const familyKey =
        family.commentary_index || family.family_title || "";
      const details = make("details", "v4-witness-family");
      details.dataset.witnessFamilyKey = family.family_key || familyKey;
      if (family.commentary_kind === "TARGUM") {
        details.dataset.witnessKind = "targum";
      }
      const summary = make("summary");
      const titles = make("span", "v4-witness-family-titles");
      const he = make(
        "b",
        "",
        family.collective_title_he || family.collective_title_en || familyKey,
      );
      he.lang = "he";
      he.dir = "rtl";
      titles.append(
        he,
        make(
          "span",
          "",
          family.collective_title_en || family.family_title || familyKey,
        ),
      );
      const marks = make("span", "v4-witness-family-marks");
      if (attachedTracks.has(familyKey)) {
        const attached = make("i", "", "Attached to the text");
        attached.title =
          "This work also has proven attachments in the reading pane.";
        marks.append(attached);
      }
      marks.append(
        make(
          "span",
          "",
          `${family.segments?.length || 0} segment${
            (family.segments?.length || 0) === 1 ? "" : "s"
          }`,
        ),
      );
      // V5: any witness can flow in the rail beside the text — or in the
      // counter rail, arguing from the other side.
      const flow = make("button", "v5-witness-flow-button", "Flow");
      flow.type = "button";
      flow.title = `Flow ${family.collective_title_en || familyKey} in the witness rail`;
      flow.setAttribute(
        "aria-label",
        `Flow ${family.collective_title_en || familyKey} in the witness rail beside the text`,
      );
      flow.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        v5SetRailWork(familyKey, { origin: "rail-work" });
      });
      const counter = make(
        "button",
        "v5-witness-flow-button v5-witness-counter-button",
        "Counter",
      );
      counter.type = "button";
      counter.title = `Flow ${family.collective_title_en || familyKey} in the counter rail`;
      counter.setAttribute(
        "aria-label",
        `Flow ${family.collective_title_en || familyKey} in the counter-commentary rail`,
      );
      counter.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        v5OpenRailB(familyKey);
      });
      marks.append(flow, counter);
      summary.append(titles, marks);
      const body = make("div", "v4-witness-family-body");
      details.append(summary, body);
      details.addEventListener("toggle", () => {
        // V7.1 · loadout rule: one witness family open at a time. Opening
        // a second dropdown unloads the first, like changing zones.
        if (details.open) {
          details.parentElement
            ?.querySelectorAll("details.v4-witness-family[open]")
            .forEach((other) => {
              if (other !== details) other.open = false;
            });
        }
        if (!details.open || details.dataset.segmentsLoaded === "true") {
          return;
        }
        details.dataset.segmentsLoaded = "true";
        appendWitnessSegments(body, family);
      });
      ledger.append(details);
    });
    witnessLedgerNode = ledger;
    return ledger;
  };

  // ── V5 · the two-rail spine ────────────────────────────────────────────
  // The verse is the spine. The source pane and the witness rail both
  // project onto it. Alignment is dibbur-hamatchil shaped: proven headword
  // edges from the attachment maps, auto-suggested headword matches from
  // each segment's own opening words, and verse-level anchors for
  // discursive segments that do not open with a quotation.

  const v5Normalize = (text) =>
    String(text || "")
      .replace(/[֑-ׇ׳״]/gu, "")
      .replace(/־/gu, " ")
      .replace(/[^א-ת ]/gu, "")
      .replace(/\s+/gu, " ")
      .trim();

  const v5SectionWordSequences = new Map();
  const v5SectionWords = (section) => {
    if (!section?.ref) return [];
    if (v5SectionWordSequences.has(section.ref)) {
      return v5SectionWordSequences.get(section.ref);
    }
    const runtime = sectionRuntime(section);
    const words = [];
    for (let index = 1; index <= 200; index += 1) {
      const word = runtime.wordByIndex?.get(index);
      if (!word) break;
      words.push(
        v5Normalize(word.normalized || word.hebrew || word.surface || ""),
      );
    }
    v5SectionWordSequences.set(section.ref, words);
    return words;
  };

  // Match a segment's opening words against a section's word sequence.
  // Returns a 1-based inclusive span, or null when no headword match holds.
  const v5MatchHeadword = (proofText, sectionWords) => {
    if (!proofText || !sectionWords.length) return null;
    const headRaw =
      (String(proofText).split(".")[0] || "").trim() || String(proofText);
    const allHeadWords = v5Normalize(headRaw)
      .split(" ")
      .filter(Boolean)
      .slice(0, 6);
    if (!allHeadWords.length) return null;
    // Up to two non-quotation lead words may be skipped — commentators
    // often preface the quoted headword ("ve-amar Elohim…").
    for (let skip = 0; skip <= 2; skip += 1) {
      const headWords = allHeadWords.slice(skip, skip + 4);
      if (!headWords.length) break;
      for (let len = Math.min(headWords.length, 4); len >= 1; len -= 1) {
        for (
          let start = 0;
          start + len <= sectionWords.length;
          start += 1
        ) {
          let holds = true;
          for (let offset = 0; offset < len; offset += 1) {
            const verseWord = sectionWords[start + offset];
            const headWord = headWords[offset];
            if (verseWord !== headWord && !verseWord.endsWith(headWord)) {
              holds = false;
              break;
            }
          }
          if (holds) return { start: start + 1, end: start + len };
        }
      }
    }
    return null;
  };

  // V6.8 · a work's composition year, from the ledger's own
  // `composition_date_evidence` (a [start, end] range, or a single year).
  // The earliest evidence in the family wins; a work with none is undated
  // and sorts last — the same lastuary shape the attested rule uses for
  // sources without a year. Nothing is inferred: no date, no guess.
  const v5FamilyComposedYear = (segments) => {
    let earliest = Infinity;
    (segments || []).forEach((segment) => {
      const evidence = segment?.composition_date_evidence;
      if (evidence === undefined || evidence === null) return;
      const values = (Array.isArray(evidence) ? evidence : [evidence])
        .map((value) => Number.parseInt(value, 10))
        .filter(Number.isInteger);
      values.forEach((value) => {
        if (value < earliest) earliest = value;
      });
    });
    return Number.isFinite(earliest) ? earliest : null;
  };

  const v5WitnessFamilies = (() => {
    const families = new Map();
    [
      ...(commentaryData?.commentary || []),
      ...(commentaryData?.targum || []),
    ].forEach((family) => {
      const key = family.commentary_index || family.family_title || "";
      if (!key || families.has(key)) return;
      families.set(key, {
        key,
        en: family.collective_title_en || family.family_title || key,
        he: family.collective_title_he || "",
        kind: family.commentary_kind || "COMMENTARY",
        segments: family.segments || [],
        // V6.8: the ledger carries composition_date_evidence on every
        // segment, populated for 65 of 81 works and internally consistent
        // (one value per work). It had never been read. This is the
        // chronology the attested antiquity rule was always about — Rashi
        // 1075, Ramban 1246, Or HaChaim 1718 — applied to works rather
        // than to dictionary entries.
        composed: v5FamilyComposedYear(family.segments || []),
      });
    });
    // Attached tracks without a ledger family (future sections) still flow.
    [...commentaryTrackUnitsByTrack.keys()].forEach((track) => {
      if (!families.has(track)) {
        families.set(track, {
          key: track,
          en: track,
          he: "",
          kind: /targum|onkelos/iu.test(track) ? "TARGUM" : "COMMENTARY",
          segments: [],
          composed: null,
        });
      }
    });
    return families;
  })();

  const v5DefaultRailWork = () => {
    const attached = [...commentaryTrackUnitsByTrack.keys()];
    const onkelosAttached = attached.find((track) =>
      /onkelos/iu.test(track),
    );
    if (onkelosAttached) return onkelosAttached;
    const onkelosFamily = [...v5WitnessFamilies.keys()].find((key) =>
      /onkelos/iu.test(key),
    );
    return onkelosFamily || attached[0] || [...v5WitnessFamilies.keys()][0] || "";
  };

  const v5ClaimSpan = (claim) => {
    if (claim?.claim_state === "PROVEN_EDGE" && claim.asserted_edge) {
      const edge = claim.asserted_edge;
      if (Number.isInteger(edge.start_word_index)) {
        return {
          start: edge.start_word_index,
          end: edge.end_word_index || edge.start_word_index,
          anchorClass: "proven",
          wholeSection:
            edge.grain === "VERSE" || edge.grain === "Y_NODE",
        };
      }
      return { start: 1, end: 1, anchorClass: "proven", wholeSection: true };
    }
    if (
      Number.isInteger(claim?.visual_hint?.start_word_index) &&
      Number.isInteger(claim?.visual_hint?.end_word_index)
    ) {
      return {
        start: claim.visual_hint.start_word_index,
        end: claim.visual_hint.end_word_index,
        anchorClass: "hint",
        wholeSection: false,
      };
    }
    return { start: 1, end: 1, anchorClass: "verse", wholeSection: true };
  };

  // Build the rail's item list for one flowing work: attached units first
  // (they carry proofs and word modules), then ledger segments that are not
  // already attached, each with an auto-suggested or verse-level anchor.
  const v5BuildRailItems = (workKey) => {
    const items = [];
    const attachedRefs = new Set();
    (commentaryTrackUnitsByTrack.get(workKey) || []).forEach((unit) => {
      attachedRefs.add(unit.claim.commentary_unit_ref);
      const span = v5ClaimSpan(unit.claim);
      items.push({
        kind: "unit",
        unit,
        ref: unit.claim.commentary_unit_ref,
        sectionRef: unit.section.ref,
        start: span.start,
        end: span.end,
        anchorClass: span.anchorClass,
        wholeSection: span.wholeSection,
      });
    });
    const family = v5WitnessFamilies.get(workKey);
    (family?.segments || []).forEach((segment) => {
      if (attachedRefs.has(segment.ref)) return;
      const sectionRef = segment.source_anchor_ref || "Genesis 1:1";
      const section = sectionsByRef.get(sectionRef);
      let start = 1;
      let end = 1;
      let anchorClass = "verse";
      let wholeSection = true;
      if (section && segment.he?.proof_text) {
        const match = v5MatchHeadword(
          segment.he.proof_text,
          v5SectionWords(section),
        );
        if (match) {
          start = match.start;
          end = match.end;
          anchorClass = "suggested";
          wholeSection = false;
        }
      }
      items.push({
        kind: "segment",
        segment,
        ref: segment.ref,
        sectionRef,
        start,
        end,
        anchorClass,
        wholeSection,
      });
    });
    items.sort((left, right) => {
      const orderDelta =
        (sourceSectionOrderByRef.get(left.sectionRef) ?? 9e9) -
        (sourceSectionOrderByRef.get(right.sectionRef) ?? 9e9);
      if (orderDelta !== 0) return orderDelta;
      if (left.start !== right.start) return left.start - right.start;
      return left.end - right.end;
    });
    return items;
  };

  const v5AnchorChipText = (item) => {
    const span =
      item.wholeSection || (item.start === 1 && item.end >= 199)
        ? "whole verse"
        : item.start === item.end
          ? `word ${item.start}`
          : `words ${item.start}–${item.end}`;
    if (item.anchorClass === "proven") return `${span} · proven`;
    if (item.anchorClass === "hint") return `${span} · hinted`;
    if (item.anchorClass === "suggested")
      return `${span} · suggested by opening words`;
    return "whole verse";
  };

  const renderCommentaryTrack = ({ origin = "manual" } = {}) => {
    const renderToken = ++state.commentaryRenderToken;
    if (!state.railWork) state.railWork = v5DefaultRailWork();
    const family = v5WitnessFamilies.get(state.railWork);
    state.railItems = v5BuildRailItems(state.railWork);
    if (state.activeClaimRef) {
      state.activeRailIndex = state.railItems.findIndex(
        (item) => item.ref === state.activeClaimRef,
      );
    }
    if (state.activeRailIndex >= state.railItems.length) {
      state.activeRailIndex = -1;
    }

    setText(
      elements.commentaryHeading,
      family ? family.en : state.railWork || "Commentary",
    );
    if (elements.railToolbar) {
      elements.railToolbar.hidden = false;
      if (
        elements.railWorkSelect &&
        elements.railWorkSelect.value !== state.railWork
      ) {
        elements.railWorkSelect.value = state.railWork;
      }
    }
    updateCommentaryStepper();

    const fragment = document.createDocumentFragment();

    if (!state.railItems.length) {
      const empty = make("section", "v3-commentary-empty");
      empty.append(
        make("p", "", `${family?.en || state.railWork} has no loaded segments.`),
        make(
          "span",
          "",
          "Pick another work below — every recorded witness is in the ledger.",
        ),
      );
      fragment.append(empty);
    }

    let currentSectionRef = "";
    let flowHost = null;
    state.railItems.forEach((item, index) => {
      if (item.sectionRef !== currentSectionRef) {
        currentSectionRef = item.sectionRef;
        const marker = make("header", "v5-rail-section-marker");
        marker.dataset.railSectionRef = currentSectionRef;
        marker.append(
          make("b", "", currentSectionRef),
          make("span", "", family?.he || ""),
        );
        fragment.append(marker);
        flowHost = make("div", "v5-rail-flow");
        fragment.append(flowHost);
      }
      const isActiveUnit =
        item.kind === "unit" &&
        item.ref === state.activeClaimRef;
      const article = make(
        "article",
        `v5-rail-item${isActiveUnit ? " is-active" : ""}`,
      );
      article.dataset.railIndex = String(index);
      article.dataset.railAnchorClass = item.anchorClass;
      article.dataset.railSectionRef = item.sectionRef;
      article.dataset.railStartWord = String(item.start);
      if (item.kind === "unit") {
        article.dataset.commentaryUnitRef = item.ref;
      }
      if (index === state.activeRailIndex) {
        article.classList.add("is-rail-focus");
      }
      const head = make("button", "v5-rail-item-head");
      head.type = "button";
      head.append(
        make(
          "b",
          "",
          item.kind === "unit"
            ? compactClaimTitle(item.unit.claim)
            : item.ref,
        ),
        make("span", "v5-rail-anchor-chip", v5AnchorChipText(item)),
      );
      head.setAttribute(
        "aria-label",
        `Align the text to ${item.ref}, ${v5AnchorChipText(item)}`,
      );
      head.addEventListener("click", () => {
        v5ActivateRailItem(index, { origin: "rail-item" });
      });
      article.append(head);
      const body = make("div", "v5-rail-item-body");
      article.append(body);
      if (item.kind === "unit") {
        appendCommentaryRecord(body, item.unit, origin, renderToken);
      } else {
        appendWitnessSegments(body, { segments: [item.segment] });
      }
      flowHost?.append(article);
    });

    const ledger = buildWitnessLedger();
    if (ledger) fragment.append(ledger);

    elements.commentaryContent.replaceChildren(fragment);
    requestAnimationFrame(() => scrollCommentaryUnitIntoView(origin));
  };

  const clearCommentarySourceStyling = () => {
    document
      .querySelectorAll(
        ".is-commentary-target, .is-commentary-span-hint, .is-commentary-range, .is-commentary-active-source",
      )
      .forEach((node) =>
        node.classList.remove(
          "is-commentary-target",
          "is-commentary-span-hint",
          "is-commentary-range",
          "is-commentary-active-source",
        ),
      );
  };

  const articleForSourceRef = (sectionRef) =>
    [...document.querySelectorAll(".v3-verse")].find(
      (article) => article.dataset.verseRef === sectionRef,
    ) || null;

  const wordModuleForPosition = (sectionRef, wordIndex) =>
    articleForSourceRef(sectionRef)
      ?.querySelector(`.v3-word-slot[data-word-index="${wordIndex}"]`)
      ?.querySelector(".v3-word-module") || null;

  const markWholeSectionRange = (sectionRef, currentPosition) => {
    const article = articleForSourceRef(sectionRef);
    if (!article) return;
    article.classList.add("is-commentary-range");
    article.querySelectorAll(".v3-word-module").forEach((wordModule) => {
      wordModule.classList.add("is-commentary-range");
    });
    if (currentPosition?.section_ref === sectionRef) {
      wordModuleForPosition(sectionRef, currentPosition.word_index)?.classList.add(
        "is-commentary-active-source",
      );
    }
  };

  const highlightSourceTarget = (
    section,
    targetId,
    claim = null,
    currentPosition = state.currentSourcePosition,
  ) => {
    clearCommentarySourceStyling();
    const target = assertedTarget(section, claim);
    if (
      target?.kind === "C0_SPAN" &&
      claim?.claim_state === "PROVEN_EDGE"
    ) {
      const indices = resolveC0Coverage(section, target)?.word_indices || [];
      indices.forEach((index) => {
        const span =
          sectionRuntime(section).projectionByWordIndex.get(index);
        const sourceWord = span
          ? document.querySelector(`#${c0TargetDomId(span)}`)
          : null;
        sourceWord?.classList.add("is-commentary-range");
      });
      if (
        currentPosition?.section_ref === section.ref &&
        indices.includes(currentPosition.word_index)
      ) {
        wordModuleForPosition(
          section.ref,
          currentPosition.word_index,
        )?.classList.add("is-commentary-active-source");
      }
      return;
    }
    if (
      target?.kind === "Y_NODE" &&
      claim?.claim_state === "PROVEN_EDGE"
    ) {
      const linkedRef = nodesById.get(target.y_node_id)?.public_ref;
      if (linkedRef) markWholeSectionRange(linkedRef, currentPosition);
      return;
    }
    if (
      target?.kind === "Y_RANGE" &&
      claim?.claim_state === "PROVEN_EDGE"
    ) {
      (resolveYRangeCoverage(target)?.nodes || []).forEach((node) =>
        markWholeSectionRange(node.public_ref, currentPosition),
      );
      return;
    }
    if (
      claim?.claim_state === "VISUAL_SUGGESTION_ONLY" &&
      Number.isInteger(claim.visual_hint?.start_word_index) &&
      Number.isInteger(claim.visual_hint?.end_word_index)
    ) {
      for (
        let index = claim.visual_hint.start_word_index;
        index <= claim.visual_hint.end_word_index;
        index += 1
      ) {
        const span =
          sectionRuntime(section).projectionByWordIndex.get(index);
        const hintedWord = span
          ? document.querySelector(`#${c0TargetDomId(span)}`)
          : null;
        hintedWord?.classList.add("is-commentary-span-hint");
      }
      return;
    }
    const sourceTarget = document.querySelector(`#${targetId}`);
    sourceTarget?.classList.add("is-commentary-target");
    sourceTarget
      ?.closest(".v3-verse")
      ?.classList.add("is-commentary-target");
  };

  const activeClaimContext = () => {
    const section = sectionsByRef.get(state.activeSectionRef);
    const claim = (section?.attachment_map?.claims || []).find(
      (candidate) =>
        candidate.commentary_unit_ref === state.activeClaimRef,
    );
    return section && claim ? { section, claim } : null;
  };

  const refreshActiveCommentaryHighlight = () => {
    const context = activeClaimContext();
    if (!context) {
      clearCommentarySourceStyling();
      return;
    }
    highlightSourceTarget(
      context.section,
      state.activeSourceTarget,
      context.claim,
      state.currentSourcePosition,
    );
  };

  const triggerSourcePosition = (section, claim, sourceButton) => {
    const slot = sourceButton?.closest?.(".v3-word-slot");
    if (
      slot?.dataset.sectionRef === section.ref &&
      Number.isInteger(Number(slot.dataset.wordIndex))
    ) {
      return sourcePosition(section.ref, Number(slot.dataset.wordIndex));
    }
    const group = commentarySnapGroupByClaimRef.get(
      claim.commentary_unit_ref,
    );
    if (group) return group.start;
    if (Number.isInteger(claim.visual_hint?.start_word_index)) {
      return sourcePosition(section.ref, claim.visual_hint.start_word_index);
    }
    return sourcePosition(section.ref, 1);
  };

  const sourceButtonForSnap = (group, claim) => {
    const snapSection =
      sectionsByRef.get(group.start.section_ref) || group.section;
    const bubble = document.querySelector(
      `#v3-commentary-bubble-${snapSection.unit_id}-word-${group.start.word_index}`,
    );
    return bubble || state.lastCommentaryTrigger;
  };

  const claimForSnapGroup = (group) => {
    const retained = group.edges.find(
      (edge) => edge.claim.commentary_unit_ref === state.activeClaimRef,
    );
    return (retained || group.edges[0])?.claim || null;
  };

  const commentaryGroupForSource = (track, position) => {
    const groups = commentarySnapGroupsByTrack.get(track) || [];
    if (!position || !groups.length) return null;
    const containing = groups
      .filter((group) =>
        group.edges.some(
          (edge) =>
            compareSourcePositions(edge.start, position) <= 0 &&
            compareSourcePositions(position, edge.end) <= 0,
        ),
      )
      .sort((left, right) =>
        compareSourcePositions(right.start, left.start),
      );
    if (containing.length) return containing[0];

    const sameSection = groups.filter(
      (group) => group.start.section_ref === position.section_ref,
    );
    if (!sameSection.length) return null;
    const passed = sameSection.filter(
      (group) =>
        compareSourcePositions(group.start, position) <= 0,
    );
    return passed[passed.length - 1] || sameSection[0];
  };

  const clearCommentaryAlignmentAtSource = (
    track,
    position,
    { origin = "source-open", openPane = true } = {},
  ) => {
    state.activeClaimRef = "";
    state.activeSectionRef = position.section_ref;
    state.activeCommentaryTrack = track;
    state.activeSnapGroupKey = "";
    state.commentaryAlignmentRef = position.section_ref;
    state.currentSourcePosition = position;
    const sourceNode = orderedBaseSourceSections.find(
      (node) => node.public_ref === position.section_ref,
    );
    state.activeSourceTarget = sourceNode?.dom_anchor
      ? `v3-${sourceNode.dom_anchor}`
      : "";
    document.body.dataset.v4CommentaryTrack = track;
    document.body.dataset.v4CommentarySnapOrigin = origin;
    document
      .querySelectorAll("[data-v3-commentary-pill]")
      .forEach((button) => {
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-expanded", "false");
      });
    document
      .querySelectorAll("[data-v3-commentary-bubble]")
      .forEach((button) => button.classList.remove("is-active"));
    clearCommentarySourceStyling();
    elements.returnToSource.hidden = false;
    if (openPane) {
      openCommentaryWorkspace(state.lastCommentaryTrigger, {
        followOnMobile: false,
        rememberTrigger: false,
      });
    }
    renderCommentaryTrack({ origin });
    announce(
      `${track} has no verified unit loaded at ${position.section_ref}. No earlier section was substituted.`,
    );
    refreshAttributionDrawer();
    publishAudit();
  };

  const alignCommentaryTrackToSource = (
    sectionRef,
    wordIndex = 1,
    { origin = "source-open", openPane = true } = {},
  ) => {
    const track = state.activeCommentaryTrack;
    if (!track) return false;
    const position = sourcePosition(sectionRef, wordIndex);
    if (position.section_order < 0) return false;
    state.currentSourcePosition = position;
    if (
      origin === "source-open" ||
      origin === "source-address" ||
      origin === "workspace-open"
    ) {
      state.manualSourceHoldUntil = Date.now() + 900;
    }
    const group = commentaryGroupForSource(track, position);
    const claim = group ? claimForSnapGroup(group) : null;
    if (!group || !claim) {
      clearCommentaryAlignmentAtSource(track, position, {
        origin,
        openPane,
      });
      return false;
    }
    selectCommentary(
      group.section,
      claim,
      sourceButtonForSnap(group, claim),
      {
        origin,
        preserveSourcePosition: true,
        openPane,
      },
    );
    return true;
  };

  const moveCommentaryUnit = (delta) => {
    const targetIndex = commentaryStepTargetIndex(delta);
    if (targetIndex < 0) return;
    v5ActivateRailItem(targetIndex, { origin: "manual-step" });
  };

  // ── V5 snap controller ─────────────────────────────────────────────────
  // Magnetic, not welded: whichever pane the reader last touched is the
  // master; the other follows on settle. Programmatic scrolls are stamped
  // so a follow never steals mastery back and causes a feedback loop.

  const v5ClaimSnapMaster = (which) => {
    const now = Date.now();
    if (which === "source" && now < state.sourceProgrammaticScrollUntil) {
      return;
    }
    if (which === "rail" && now < state.railProgrammaticScrollUntil) return;
    if (which === "railB" && now < state.railBProgrammaticScrollUntil) {
      return;
    }
    state.snapMaster = which;
    state.snapMasterHoldUntil = now + 1100;
  };

  const v5UpdateSnapStateLabel = (item) => {
    if (!elements.railSnapState) return;
    setText(
      elements.railSnapState,
      !state.railLinked
        ? "Free scroll"
        : item
          ? `Snapped · ${item.sectionRef} · ${v5AnchorChipText(item)}`
          : "",
    );
  };

  // V7.1 · the rail link becomes a real switch, and V7.2 makes FREE the
  // default. Commentaries are separate works — discrete authored records
  // anchored by claims — not parallel texts, so nothing scrolls in
  // sympathy unless asked. Selecting a claim still aligns once (that is
  // navigation, not connection). Linked mode remains one click away for
  // reading a verse-parallel witness like Onkelos in step with the text.
  const v5SetRailLinked = (linked) => {
    state.railLinked = Boolean(linked);
    if (elements.railLinkToggle) {
      elements.railLinkToggle.setAttribute(
        "aria-pressed",
        String(state.railLinked),
      );
      setText(elements.railLinkToggle, state.railLinked ? "Linked" : "Free");
    }
    document.body.dataset.v7RailLinked = String(state.railLinked);
    v5UpdateSnapStateLabel(state.railItems[state.activeRailIndex] || null);
    if (state.railLinked && state.currentSourcePosition) {
      v5FollowSource(state.currentSourcePosition, 0);
    }
    publishAudit();
  };
  if (elements.railSnapState && !elements.railLinkToggle) {
    const toggle = make("button", "v5-witness-flow-button v7-rail-link");
    toggle.type = "button";
    toggle.title =
      "Linked: rails and text scroll together. Free: each pane scrolls alone.";
    toggle.setAttribute("aria-pressed", String(state.railLinked));
    setText(toggle, state.railLinked ? "Linked" : "Free");
    document.body.dataset.v7RailLinked = String(state.railLinked);
    toggle.addEventListener("click", () =>
      v5SetRailLinked(!state.railLinked),
    );
    elements.railSnapState.insertAdjacentElement("beforebegin", toggle);
    elements.railLinkToggle = toggle;
  }

  // V5.2 snap-feel repair: followers move the MINIMUM distance, and only
  // when their matched item is not already usefully visible. No more
  // top-align yanks past a long Ramban body.
  const v5StickyOffset = (pane) => {
    let offset = 0;
    pane
      .querySelectorAll(
        ".v3-commentary-heading, .v5-rail-toolbar, .v5-rail-b-heading, .v5-rail-b-toolbar",
      )
      .forEach((node) => {
        if (getComputedStyle(node).position === "sticky") {
          offset += node.getBoundingClientRect().height;
        }
      });
    return offset;
  };

  const v5MinimalAlign = (pane, node, stampProgrammatic) => {
    if (!pane || !node) return false;
    const offset = v5StickyOffset(pane);
    const paneRect = pane.getBoundingClientRect();
    const viewTop = paneRect.top + offset;
    const viewBottom = paneRect.bottom;
    const viewHeight = Math.max(1, viewBottom - viewTop);
    const rect = node.getBoundingClientRect();
    const visible =
      Math.min(rect.bottom, viewBottom) - Math.max(rect.top, viewTop);
    if (visible >= Math.min(rect.height, viewHeight) * 0.35) {
      return false;
    }
    stampProgrammatic?.();
    pane.scrollTo({
      top: Math.max(0, pane.scrollTop + rect.top - viewTop - 8),
      behavior: "smooth",
    });
    return true;
  };

  const v5ClampDirectional = (target, current, direction) => {
    if (target < 0 || current < 0 || !direction) return target;
    return direction > 0
      ? Math.max(target, current)
      : Math.min(target, current);
  };

  const v5RefreshRailFocus = ({ scrollRail = false } = {}) => {
    const items = elements.commentaryContent.querySelectorAll(
      ".v5-rail-item",
    );
    let focused = null;
    items.forEach((node) => {
      const isFocus =
        Number(node.dataset.railIndex) === state.activeRailIndex;
      node.classList.toggle("is-rail-focus", isFocus);
      node.classList.toggle(
        "is-active",
        Boolean(
          state.activeClaimRef &&
            node.dataset.commentaryUnitRef === state.activeClaimRef,
        ),
      );
      if (isFocus) focused = node;
    });
    if (scrollRail && focused) {
      v5MinimalAlign(elements.commentaryPane, focused, () => {
        state.railProgrammaticScrollUntil = Date.now() + 900;
      });
    }
    v5UpdateReturnChip();
  };

  const v5SyncPillsAndBubbles = () => {
    document
      .querySelectorAll("[data-v3-commentary-pill]")
      .forEach((button) => {
        const pressed =
          Boolean(state.activeClaimRef) &&
          button.dataset.commentaryUnitRef === state.activeClaimRef;
        button.setAttribute("aria-pressed", String(pressed));
        button.setAttribute("aria-expanded", String(pressed));
      });
    document
      .querySelectorAll("[data-v3-commentary-bubble]")
      .forEach((button) => {
        let refs = [];
        try {
          refs = JSON.parse(button.dataset.commentaryRefs || "[]");
        } catch {
          refs = [];
        }
        button.classList.toggle(
          "is-active",
          Boolean(state.activeClaimRef) &&
            refs.includes(state.activeClaimRef),
        );
      });
  };

  const v5HighlightItem = (item) => {
    const section = sectionsByRef.get(item.sectionRef);
    if (!section) return;
    if (item.kind === "unit") {
      highlightSourceTarget(
        section,
        sourceTargetIdForClaim(section, item.unit.claim),
        item.unit.claim,
        state.currentSourcePosition,
      );
      return;
    }
    clearCommentarySourceStyling();
    if (item.wholeSection) {
      markWholeSectionRange(item.sectionRef, state.currentSourcePosition);
      return;
    }
    const runtime = sectionRuntime(section);
    for (let index = item.start; index <= item.end; index += 1) {
      const span = runtime.projectionByWordIndex.get(index);
      const word = span
        ? document.querySelector(`#${c0TargetDomId(span)}`)
        : null;
      word?.classList.add("is-commentary-span-hint");
    }
  };

  const v5ScrollSourceToItem = (item) => {
    const target =
      (!item.wholeSection &&
        wordModuleForPosition(item.sectionRef, item.start)) ||
      articleForSourceRef(item.sectionRef);
    if (!target) return;
    // Minimal motion: leave the source alone when the anchor is already
    // usefully on screen.
    const paneRect = elements.readingPane.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const visible =
      Math.min(rect.bottom, paneRect.bottom) -
      Math.max(rect.top, paneRect.top);
    if (
      visible >=
      Math.min(rect.height, paneRect.height) * 0.45
    ) {
      return;
    }
    state.sourceProgrammaticScrollUntil = Date.now() + 900;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const v5LightFocusItem = (
    index,
    { scrollRail = false, scrollSource = false } = {},
  ) => {
    const item = state.railItems[index];
    if (!item) return;
    state.activeRailIndex = index;
    state.activeSectionRef = item.sectionRef;
    state.activeCommentaryTrack = state.railWork;
    state.commentaryAlignmentRef = "";
    // V5.3: scroll focus never steals the selection. The red-ring claim you
    // clicked stays yours; only an explicit click reassigns it.
    document.body.dataset.v4CommentaryTrack = state.railWork;
    v5HighlightItem(item);
    elements.returnToSource.hidden = false;
    if (scrollSource) v5ScrollSourceToItem(item);
    v5RefreshRailFocus({ scrollRail });
    updateCommentaryStepper();
    v5UpdateSnapStateLabel(item);
    publishAudit();
  };

  const v5ItemIndexForPosition = (items, position) => {
    if (!items.length || !position) return -1;
    const sectionItems = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.sectionRef === position.section_ref);
    if (sectionItems.length) {
      const passed = sectionItems.filter(
        ({ item }) =>
          item.wholeSection || item.start <= position.word_index,
      );
      const spanning = passed.filter(
        ({ item }) =>
          item.wholeSection ||
          (item.start <= position.word_index &&
            item.end >= position.word_index),
      );
      const wordSpanning = spanning.filter(
        ({ item }) => !item.wholeSection,
      );
      return (
        wordSpanning[wordSpanning.length - 1]?.index ??
        passed[passed.length - 1]?.index ??
        sectionItems[0].index
      );
    }
    const positionOrder =
      sourceSectionOrderByRef.get(position.section_ref) ?? -1;
    let before = -1;
    for (let index = 0; index < items.length; index += 1) {
      const order =
        sourceSectionOrderByRef.get(items[index].sectionRef) ?? 9e9;
      if (order <= positionOrder) before = index;
      else break;
    }
    return before >= 0 ? before : 0;
  };

  const v5FollowSource = (position, direction = 0) => {
    const index = v5ClampDirectional(
      v5ItemIndexForPosition(state.railItems, position),
      state.activeRailIndex,
      direction,
    );
    v5BFollowPosition(position, direction);
    if (index < 0) return;
    if (index === state.activeRailIndex) {
      refreshActiveCommentaryHighlight();
      return;
    }
    v5LightFocusItem(index, { scrollRail: true, scrollSource: false });
  };

  const v5RailProbeIndex = (pane, content) => {
    const paneRect = pane.getBoundingClientRect();
    const stickyHeight =
      pane
        .querySelector(".v3-commentary-heading, .v5-rail-b-heading")
        ?.getBoundingClientRect().height || 0;
    const probeY =
      paneRect.top + stickyHeight + Math.min(150, paneRect.height * 0.25);
    const nodes = [...content.querySelectorAll(".v5-rail-item")];
    if (!nodes.length) return -1;
    let candidate = nodes[0];
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top <= probeY) candidate = node;
    });
    const index = Number(candidate.dataset.railIndex);
    return Number.isInteger(index) ? index : -1;
  };

  const v5FollowRail = () => {
    if (!state.railLinked) return;
    if (document.body.dataset.v3CommentaryOpen !== "true") return;
    if (Date.now() < state.railProgrammaticScrollUntil) return;
    if (state.snapMaster !== "rail") return;
    const index = v5RailProbeIndex(
      elements.commentaryPane,
      elements.commentaryContent,
    );
    if (index < 0 || index === state.activeRailIndex) return;
    const direction = Math.sign(index - state.activeRailIndex);
    v5LightFocusItem(index, { scrollRail: false, scrollSource: true });
    const item = state.railItems[index];
    if (item) {
      const position = sourcePosition(item.sectionRef, item.start);
      state.currentSourcePosition = position;
      v5BFollowPosition(position, direction);
    }
  };

  const v5ActivateRailItem = (index, { origin = "manual" } = {}) => {
    const item = state.railItems[index];
    if (!item) return;
    if (item.kind === "unit") {
      state.activeRailIndex = index;
      selectCommentary(
        item.unit.section,
        item.unit.claim,
        state.lastCommentaryTrigger,
        {
          origin:
            origin === "manual-step" ? "manual-step" : "manual-track",
          preserveSourcePosition: true,
        },
      );
      v5ScrollSourceToItem(item);
      return;
    }
    v5LightFocusItem(index, { scrollRail: true, scrollSource: true });
    announce(
      `${item.ref} aligned. ${v5AnchorChipText(item)}.`,
    );
  };

  const v5SetRailWork = (
    workKey,
    { focusRef = "", origin = "rail-work" } = {},
  ) => {
    if (
      !v5WitnessFamilies.has(workKey) &&
      !commentaryTrackUnitsByTrack.has(workKey)
    ) {
      return;
    }
    state.railWork = workKey;
    state.activeCommentaryTrack = workKey;
    document.body.dataset.v4CommentaryTrack = workKey;
    state.activeRailIndex = -1;
    if (!focusRef) state.activeClaimRef = "";
    renderCommentaryTrack({ origin });
    if (focusRef) {
      const index = state.railItems.findIndex(
        (item) => item.ref === focusRef,
      );
      if (index >= 0) {
        requestAnimationFrame(() =>
          v5LightFocusItem(index, { scrollRail: true }),
        );
      }
    }
    announce(
      `${v5WitnessFamilies.get(workKey)?.en || workKey} is flowing in the witness rail.`,
    );
    publishAudit();
  };

  // ── V5.1 · the counter rail ────────────────────────────────────────────
  // Main text, commentary, counter-commentary: a second independent rail on
  // the same verse spine. It follows the spine like the first, leads the
  // spine when the reader scrolls it, and never disturbs the first rail's
  // selection state.

  const v5BUpdateSnapLabel = (item) => {
    if (!elements.railBSnapState) return;
    setText(
      elements.railBSnapState,
      item
        ? `Snapped · ${item.sectionRef} · ${v5AnchorChipText(item)}`
        : "",
    );
  };

  const v5BRefreshFocus = ({ scrollRailB = false } = {}) => {
    if (!elements.railBContent) return;
    let focused = null;
    elements.railBContent
      .querySelectorAll(".v5-rail-item")
      .forEach((node) => {
        const isFocus =
          Number(node.dataset.railIndex) === state.railBActiveIndex;
        node.classList.toggle("is-rail-focus", isFocus);
        if (isFocus) focused = node;
      });
    if (scrollRailB && focused && elements.railB) {
      v5MinimalAlign(elements.railB, focused, () => {
        state.railBProgrammaticScrollUntil = Date.now() + 900;
      });
    }
  };

  const v5BLightFocus = (
    index,
    { scrollRailB = false, scrollSource = false } = {},
  ) => {
    const item = state.railBItems[index];
    if (!item) return;
    state.railBActiveIndex = index;
    if (scrollSource) v5ScrollSourceToItem(item);
    v5BRefreshFocus({ scrollRailB });
    v5BUpdateSnapLabel(item);
    publishAudit();
  };

  const v5BFollowPosition = (position, direction = 0) => {
    if (!state.railBOpen || !state.railBItems.length) return;
    const index = v5ClampDirectional(
      v5ItemIndexForPosition(state.railBItems, position),
      state.railBActiveIndex,
      direction,
    );
    if (index < 0 || index === state.railBActiveIndex) return;
    v5BLightFocus(index, { scrollRailB: true, scrollSource: false });
  };

  const v5BFollowScroll = () => {
    if (!state.railLinked) return;
    if (!state.railBOpen) return;
    if (Date.now() < state.railBProgrammaticScrollUntil) return;
    if (state.snapMaster !== "railB") return;
    const index = v5RailProbeIndex(elements.railB, elements.railBContent);
    if (index < 0 || index === state.railBActiveIndex) return;
    const direction = Math.sign(index - state.railBActiveIndex);
    const item = state.railBItems[index];
    v5BLightFocus(index, { scrollRailB: false, scrollSource: true });
    if (item) {
      const position = sourcePosition(item.sectionRef, item.start);
      state.currentSourcePosition = position;
      const railIndex = v5ClampDirectional(
        v5ItemIndexForPosition(state.railItems, position),
        state.activeRailIndex,
        direction,
      );
      if (railIndex >= 0 && railIndex !== state.activeRailIndex) {
        v5LightFocusItem(railIndex, {
          scrollRail: true,
          scrollSource: false,
        });
      }
    }
  };

  const v5RenderRailB = () => {
    if (!elements.railBContent) return;
    const renderToken = state.commentaryRenderToken;
    const family = v5WitnessFamilies.get(state.railBWork);
    state.railBItems = v5BuildRailItems(state.railBWork);
    if (state.railBActiveIndex >= state.railBItems.length) {
      state.railBActiveIndex = -1;
    }
    setText(
      elements.railBHeading,
      family ? family.en : state.railBWork || "Counter-commentary",
    );
    if (
      elements.railBWorkSelect &&
      elements.railBWorkSelect.value !== state.railBWork
    ) {
      elements.railBWorkSelect.value = state.railBWork;
    }
    const fragment = document.createDocumentFragment();
    if (!state.railBItems.length) {
      const empty = make("section", "v3-commentary-empty");
      empty.append(
        make(
          "p",
          "",
          `${family?.en || state.railBWork} has no loaded segments.`,
        ),
        make("span", "", "Pick another counter work above."),
      );
      fragment.append(empty);
    }
    let currentSectionRef = "";
    let flowHost = null;
    state.railBItems.forEach((item, index) => {
      if (item.sectionRef !== currentSectionRef) {
        currentSectionRef = item.sectionRef;
        const marker = make("header", "v5-rail-section-marker");
        marker.append(
          make("b", "", currentSectionRef),
          make("span", "", family?.he || ""),
        );
        fragment.append(marker);
        flowHost = make("div", "v5-rail-flow");
        fragment.append(flowHost);
      }
      const article = make("article", "v5-rail-item");
      article.dataset.railIndex = String(index);
      article.dataset.railAnchorClass = item.anchorClass;
      article.dataset.railSectionRef = item.sectionRef;
      if (index === state.railBActiveIndex) {
        article.classList.add("is-rail-focus");
      }
      const head = make("button", "v5-rail-item-head");
      head.type = "button";
      head.append(
        make(
          "b",
          "",
          item.kind === "unit"
            ? compactClaimTitle(item.unit.claim)
            : item.ref,
        ),
        make("span", "v5-rail-anchor-chip", v5AnchorChipText(item)),
      );
      head.setAttribute(
        "aria-label",
        `Align the text to ${item.ref}, ${v5AnchorChipText(item)}`,
      );
      head.addEventListener("click", () => {
        v5ClaimSnapMaster("railB");
        v5BLightFocus(index, { scrollRailB: true, scrollSource: true });
      });
      article.append(head);
      const body = make("div", "v5-rail-item-body");
      article.append(body);
      if (item.kind === "unit") {
        appendCommentaryRecord(body, item.unit, "rail-b", renderToken);
      } else {
        appendWitnessSegments(body, { segments: [item.segment] });
      }
      flowHost?.append(article);
    });
    elements.railBContent.replaceChildren(fragment);
    publishAudit();
  };

  const v5SetRailBWork = (workKey) => {
    if (
      !v5WitnessFamilies.has(workKey) &&
      !commentaryTrackUnitsByTrack.has(workKey)
    ) {
      return;
    }
    state.railBWork = workKey;
    state.railBActiveIndex = -1;
    v5RenderRailB();
    if (state.currentSourcePosition) {
      v5BFollowPosition(state.currentSourcePosition);
    }
    announce(
      `${v5WitnessFamilies.get(workKey)?.en || workKey} is flowing in the counter rail.`,
    );
  };

  const v5DefaultCounterWork = () => {
    const keys = [...v5WitnessFamilies.keys()];
    const prefer = [/Ramban/iu, /Siftei Chakhamim/iu, /Ibn Ezra/iu];
    for (const pattern of prefer) {
      const found = keys.find(
        (key) => pattern.test(key) && key !== state.railWork,
      );
      if (found) return found;
    }
    return keys.find((key) => key !== state.railWork) || "";
  };

  const v5OpenRailB = (workKey = "") => {
    state.railBOpen = true;
    document.body.dataset.v5RailB = "true";
    if (elements.railB) {
      elements.railB.setAttribute("aria-hidden", "false");
      elements.railB.inert = false;
    }
    elements.openRailB?.setAttribute("aria-pressed", "true");
    v5SetRailBWork(
      workKey || state.railBWork || v5DefaultCounterWork(),
    );
  };

  const v5CloseRailB = () => {
    state.railBOpen = false;
    document.body.dataset.v5RailB = "false";
    if (elements.railB) {
      elements.railB.setAttribute("aria-hidden", "true");
      elements.railB.inert = true;
    }
    elements.openRailB?.setAttribute("aria-pressed", "false");
    publishAudit();
  };

  // ── V5.3 · legibility set ──────────────────────────────────────────────
  // Return-to-selection chip, stacked/split phone deck, Hebrew text size,
  // and shareable alignment links.

  const v5ReturnDock = (() => {
    if (!elements.railToolbar) return null;
    const dock = make("div", "v5-return-dock");
    dock.hidden = true;
    const button = make("button", "v5-return-chip");
    button.type = "button";
    button.title = "Scroll the rail back to your selected comment";
    dock.append(button);
    elements.railToolbar.after(dock);
    button.addEventListener("click", () => {
      const index = state.railItems.findIndex(
        (item) => item.ref === state.activeClaimRef,
      );
      if (index < 0) return;
      state.activeRailIndex = index;
      v5RefreshRailFocus({ scrollRail: true });
      updateCommentaryStepper();
      v5UpdateSnapStateLabel(state.railItems[index]);
    });
    return { dock, button };
  })();

  const v5UpdateReturnChip = () => {
    if (!v5ReturnDock) return;
    const selectionIndex = state.activeClaimRef
      ? state.railItems.findIndex(
          (item) => item.ref === state.activeClaimRef,
        )
      : -1;
    const show =
      selectionIndex >= 0 && selectionIndex !== state.activeRailIndex;
    v5ReturnDock.dock.hidden = !show;
    if (show) {
      const item = state.railItems[selectionIndex];
      setText(
        v5ReturnDock.button,
        `↩ ${item ? railItemLabel(item) : "selection"}`,
      );
    }
  };

  const v5SetDeckMode = (mode) => {
    document.body.dataset.v5Deck = mode;
    elements.deckToggle?.setAttribute(
      "aria-pressed",
      String(mode === "split"),
    );
    if (elements.deckToggle) {
      setText(
        elements.deckToggle,
        mode === "split" ? "⇆ Stacked" : "⇆ Side-by-side",
      );
    }
  };

  const v5HebrewScaleSteps = [0.85, 1, 1.15, 1.3, 1.5];
  let v5HebrewScaleIndex = 1;
  const v5ApplyHebrewScale = () => {
    const scale = v5HebrewScaleSteps[v5HebrewScaleIndex];
    document.documentElement.style.setProperty(
      "--v5-hebrew-scale",
      String(scale),
    );
    if (elements.hebrewSmaller) {
      elements.hebrewSmaller.disabled = v5HebrewScaleIndex === 0;
    }
    if (elements.hebrewLarger) {
      elements.hebrewLarger.disabled =
        v5HebrewScaleIndex === v5HebrewScaleSteps.length - 1;
    }
    announce(
      `Hebrew text scale ${Math.round(scale * 100)} percent.`,
    );
  };

  const v5StepHebrewScale = (delta) => {
    const next = Math.min(
      v5HebrewScaleSteps.length - 1,
      Math.max(0, v5HebrewScaleIndex + delta),
    );
    if (next === v5HebrewScaleIndex) return;
    v5HebrewScaleIndex = next;
    v5ApplyHebrewScale();
  };

  const v5BuildShareLink = () => {
    const url = new URL(window.location.href);
    url.search = "";
    const position = state.currentSourcePosition;
    const sectionRef =
      position?.section_ref || state.activeSectionRef || "Genesis 1:1";
    url.searchParams.set("v5ref", sectionRef);
    if (Number.isInteger(position?.word_index)) {
      url.searchParams.set("v5word", String(position.word_index));
    }
    if (state.railWork) url.searchParams.set("v5work", state.railWork);
    if (state.railBOpen && state.railBWork) {
      url.searchParams.set("v5counter", state.railBWork);
    }
    if (state.activeClaimRef) {
      url.searchParams.set("v5unit", state.activeClaimRef);
    }
    return url.toString();
  };

  const v5CopyShareLink = async () => {
    const link = v5BuildShareLink();
    let copied = false;
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
    } catch {
      copied = false;
    }
    if (!copied) {
      try {
        window.prompt("Copy this alignment link:", link);
        copied = true;
      } catch {
        copied = false;
      }
    }
    announce(
      copied
        ? "Alignment link copied. It reopens this exact spread."
        : "The link could not be copied automatically.",
    );
    if (elements.shareLink) {
      const restore = elements.shareLink.textContent;
      setText(elements.shareLink, copied ? "✓ Copied" : "⧉ Link");
      window.setTimeout(() => {
        setText(elements.shareLink, "⧉ Link");
      }, 1600);
      void restore;
    }
  };

  const v5ApplyShareParams = () => {
    const parameters = new URLSearchParams(window.location.search);
    const work = parameters.get("v5work") || "";
    const counter = parameters.get("v5counter") || "";
    const unitRef = parameters.get("v5unit") || "";
    const sectionRef = parameters.get("v5ref") || "";
    const wordIndex = Number.parseInt(
      parameters.get("v5word") || "",
      10,
    );
    if (!work && !counter && !sectionRef && !unitRef) return;
    if (work) v5SetRailWork(work, { focusRef: unitRef });
    if (counter) v5OpenRailB(counter);
    if (sectionRef) {
      const position = sourcePosition(
        sectionRef,
        Number.isInteger(wordIndex) && wordIndex > 0 ? wordIndex : 1,
      );
      if (position.section_order >= 0) {
        state.currentSourcePosition = position;
        openCommentaryWorkspace(null, {
          followOnMobile: false,
          rememberTrigger: false,
        });
        requestAnimationFrame(() => {
          const target =
            wordModuleForPosition(sectionRef, position.word_index) ||
            articleForSourceRef(sectionRef);
          state.sourceProgrammaticScrollUntil = Date.now() + 1200;
          target?.scrollIntoView({ block: "center", behavior: "auto" });
          v5FollowSource(position, 0);
        });
      }
    }
  };

  function updateCommentarySourcePosition(
    sectionRef,
    wordIndex,
    { origin = "scroll" } = {},
  ) {
    const nextPosition = sourcePosition(sectionRef, wordIndex);
    if (nextPosition.section_order < 0) return;
    const previousPosition = state.currentSourcePosition;
    const direction = previousPosition
      ? compareSourcePositions(nextPosition, previousPosition)
      : 0;
    state.currentSourcePosition = nextPosition;
    if (origin === "word-activation") {
      state.manualSourceHoldUntil = Date.now() + 450;
    }
    // V5: the source pane, when master, pulls the rail along the spine.
    if (
      document.body.dataset.v3CommentaryOpen !== "true" ||
      !state.railItems.length ||
      !previousPosition ||
      direction === 0 ||
      Date.now() < state.sourceProgrammaticScrollUntil ||
      (state.snapMaster === "rail" &&
        Date.now() < state.snapMasterHoldUntil)
    ) {
      refreshActiveCommentaryHighlight();
      return;
    }
    if (!state.railLinked) {
      refreshActiveCommentaryHighlight();
      return;
    }
    v5FollowSource(nextPosition, direction);
  }

  const commentarySnapFromScroll = () => {
    state.commentarySnapFrame = 0;
    if (
      Date.now() < state.manualSourceHoldUntil ||
      Date.now() < state.sourceProgrammaticScrollUntil ||
      document.body.dataset.v3CommentaryOpen !== "true" ||
      !state.railItems.length
    ) {
      return;
    }
    const paneRect = elements.readingPane.getBoundingClientRect();
    const probeY =
      paneRect.top + Math.min(180, Math.max(92, paneRect.height * 0.28));
    const visibleArticles = [...elements.verseStream.querySelectorAll(".v3-verse")]
      .map((article) => ({ article, rect: article.getBoundingClientRect() }))
      .filter(
        ({ rect }) => rect.bottom > paneRect.top && rect.top < paneRect.bottom,
      );
    if (!visibleArticles.length) return;
    const activeArticle =
      visibleArticles.find(
        ({ rect }) => rect.top <= probeY && rect.bottom >= probeY,
      ) ||
      visibleArticles.sort(
        (left, right) =>
          Math.abs(left.rect.top - probeY) -
          Math.abs(right.rect.top - probeY),
      )[0];
    const sectionRef = activeArticle.article.dataset.verseRef;
    if (!sectionRef) return;
    const sectionGroups = (
      commentarySnapGroupsByTrack.get(state.activeCommentaryTrack) || []
    ).filter((group) => group.start.section_ref === sectionRef);
    if (!sectionGroups.length) {
      updateCommentarySourcePosition(sectionRef, 1, { origin: "scroll" });
      return;
    }
    const positionedGroups = sectionGroups
      .map((group) => ({
        group,
        top:
          wordModuleForPosition(sectionRef, group.start.word_index)
            ?.getBoundingClientRect().top ?? activeArticle.rect.top,
      }))
      .sort((left, right) => {
        const rowDelta = left.top - right.top;
        return Math.abs(rowDelta) > 3
          ? rowDelta
          : compareSourcePositions(left.group.start, right.group.start);
      });
    const passed = positionedGroups.filter(
      (entry) => entry.top <= probeY + 4,
    );
    const rowTop = passed.length
      ? Math.max(...passed.map((entry) => entry.top))
      : positionedGroups[0].top;
    const rowGroups = positionedGroups.filter(
      (entry) => Math.abs(entry.top - rowTop) <= 3,
    );
    const snapGroup = rowGroups.sort((left, right) =>
      compareSourcePositions(left.group.start, right.group.start),
    )[0].group;
    updateCommentarySourcePosition(
      sectionRef,
      snapGroup.start.word_index,
      { origin: "scroll" },
    );
  };

  const scheduleCommentarySnapFromScroll = () => {
    if (state.commentarySnapFrame) return;
    state.commentarySnapFrame = requestAnimationFrame(
      commentarySnapFromScroll,
    );
  };

  function openCommentaryWorkspace(
    sourceButton,
    { followOnMobile = true, rememberTrigger = true } = {},
  ) {
    if (rememberTrigger) {
      state.lastCommentaryTrigger =
        sourceButton || state.lastCommentaryTrigger;
    }
    closeChapterDrawer({ returnFocus: false });
    closeAttributionDrawer({ returnFocus: false });
    document.body.dataset.v3CommentaryOpen = "true";
    elements.commentaryPane.setAttribute("aria-hidden", "false");
    elements.commentaryPane.inert = false;
    if (
      followOnMobile &&
      window.matchMedia("(max-width: 960px)").matches
    ) {
      setMobileWorkspace("commentary");
    }
  }

  function closeCommentaryWorkspace({ returnFocus = true } = {}) {
    closeCommentaryChoosers();
    document.body.dataset.v3CommentaryOpen = "false";
    elements.commentaryPane.setAttribute("aria-hidden", "true");
    elements.commentaryPane.inert = true;
    clearCommentarySourceStyling();
    setMobileWorkspace("text");
    document
      .querySelectorAll("[data-v3-commentary-pill]")
      .forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (returnFocus) state.lastCommentaryTrigger?.focus?.();
    publishAudit();
  }

  function selectCommentary(
    section,
    claim,
    sourceButton,
    {
      origin = "manual",
      preserveSourcePosition = false,
      openPane = true,
    } = {},
  ) {
    const track = commentaryTrackForClaim(claim);
    const snapGroup = commentarySnapGroupByClaimRef.get(
      claim.commentary_unit_ref,
    );
    // V5: choosing a claim flows its work in the rail.
    state.railWork = track;
    state.activeClaimRef = claim.commentary_unit_ref;
    state.activeSectionRef = section.ref;
    state.activeCommentaryTrack = track;
    state.activeSnapGroupKey = snapGroup?.key || "";
    state.commentaryAlignmentRef = "";
    if (!preserveSourcePosition) {
      state.currentSourcePosition = triggerSourcePosition(
        section,
        claim,
        sourceButton,
      );
      state.manualSourceHoldUntil = Date.now() + 600;
    }
    document.body.dataset.v4CommentaryTrack = track;
    document.body.dataset.v4CommentarySnapOrigin = origin;
    if (openPane) {
      openCommentaryWorkspace(sourceButton, {
        followOnMobile: origin === "manual",
        rememberTrigger: origin === "manual",
      });
    }
    document
      .querySelectorAll("[data-v3-commentary-pill]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.commentaryUnitRef === state.activeClaimRef),
        );
        button.setAttribute(
          "aria-expanded",
          String(button.dataset.commentaryUnitRef === state.activeClaimRef),
        );
      });
    document
      .querySelectorAll("[data-v3-commentary-bubble]")
      .forEach((button) => {
        let commentaryRefs = [];
        try {
          commentaryRefs = JSON.parse(
            button.dataset.commentaryRefs || "[]",
          );
        } catch {
          commentaryRefs = [];
        }
        button.classList.toggle(
          "is-active",
          commentaryRefs.includes(state.activeClaimRef),
        );
        button.setAttribute("aria-expanded", "false");
      });
    elements.returnToSource.hidden = false;
    state.activeSourceTarget = sourceTargetIdForClaim(section, claim);
    highlightSourceTarget(
      section,
      state.activeSourceTarget,
      claim,
      state.currentSourcePosition,
    );

    renderCommentaryTrack({ origin });
    // V5: keep the rail's snap label truthful for pill/step selections too.
    v5UpdateSnapStateLabel(
      state.railItems[state.activeRailIndex] || null,
    );
    v5UpdateReturnChip();
    if (origin === "manual") {
      requestAnimationFrame(() => elements.commentaryPane.focus());
    }
    announce(
      origin === "snap"
        ? `${compactClaimTitle(claim)} snapped at its next verified source anchor.`
        : `${compactClaimTitle(claim)} selected. ${scopeLabel(section, claim)}.`,
    );
    refreshAttributionDrawer();
    publishAudit();
  }

  const setCommentaryLayer = (enabled) => {
    state.commentaryLayer = Boolean(enabled);
    document.body.dataset.v3CommentaryLayer = enabled ? "on" : "off";
    elements.commentaryLayerToggle.setAttribute(
      "aria-pressed",
      String(enabled),
    );
    elements.commentaryLayerToggle.setAttribute(
      "aria-label",
      enabled ? "Hide commentary bubbles" : "Show commentary bubbles",
    );
    elements.commentaryLayerToggle.title = enabled
      ? "Hide commentary bubbles"
      : "Show commentary bubbles";
    if (!enabled) {
      closeCommentaryChoosers();
      if (state.lastCommentaryTrigger?.matches?.("[data-v3-commentary-bubble]")) {
        state.lastCommentaryTrigger = elements.commentaryLayerToggle;
      }
    }
    announce(`Commentary bubbles ${enabled ? "shown" : "hidden"}.`);
    publishAudit();
  };

  const setMobileWorkspace = (workspace) => {
    document.body.dataset.v3MobileWorkspace = workspace;
    document.querySelectorAll("[data-v3-workspace]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.v3Workspace === workspace),
      );
    });
  };

  const setReaderMode = (mode) => {
    if (!readerAxisContract.modes[mode]) return;
    state.readerMode = mode;
    document.body.dataset.v3ReaderMode = mode;
    document.querySelectorAll("[data-v3-reader-mode]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.v3ReaderMode === mode),
      );
    });
    const axis = readerAxisContract.modes[mode].layout_axis;
    document
      .querySelectorAll(".v3-word-run, .v3-commentary-word-run")
      .forEach((run) => {
        run.dir = axis;
      });
    document.querySelectorAll("[data-v3-word-module]").forEach((module) => {
      const context = state.wordContexts.get(
        wordViewKey(module.dataset.scope, module.dataset.occurrenceId),
      );
      if (context) setWordModuleAriaLabel(module, context.word, context.view);
    });
    elements.verseStream
      .querySelectorAll(".v3-detail-coverage[data-section-ref]")
      .forEach((detailCoverage) => {
        const section = sectionsByRef.get(
          detailCoverage.dataset.sectionRef,
        );
        if (section) {
          setText(detailCoverage, detailCoverageLabel(mode, section));
        }
      });
    setText(
      elements.axisLegend,
      mode === "english"
        ? "English Workbench · left-to-right cards · numbered inside each section · Hebrew remains right-to-left"
        : "Hebrew Reader · canonical right-to-left reading",
    );
    announce(
      mode === "english"
        ? "English Workbench selected. Cards run left to right; Hebrew inside each card remains right to left."
        : "Hebrew Reader selected. Cards follow the canonical right-to-left axis.",
    );
    scheduleCommentarySnapFromScroll();
    publishAudit();
  };

  const attributionCard = (title, status = "ready") => {
    const card = make("section", "v3-attribution-card");
    card.dataset.status = status;
    card.append(make("h3", "", title));
    return card;
  };

  const uniqueSources = (sources) => {
    const seen = new Set();
    return sources.filter((source) => {
      const key = `${source.key || source.label}:${source.licensePosture || source.license}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const selectedWorkbenchRouteSources = () => {
    const sources = [];
    document.querySelectorAll("[data-v3-word-module]").forEach((module) => {
      if (module.closest('[hidden], [aria-hidden="true"]')) return;
      const key = wordViewKey(
        module.dataset.scope,
        module.dataset.occurrenceId,
      );
      const context = state.wordContexts.get(key);
      if (!context) return;
      const { word, view } = context;
      const shape = word.shapes[view.shapeIndex];
      shape.cells.forEach((cell) => {
        sources.push(...sourcesForRoute(view.cellRoutes.get(cell.compcellTemplateId)));
      });
    });
    if (state.titleView) {
      const { word, view } = state.titleView;
      const shape = word.shapes[view.shapeIndex];
      shape.cells.forEach((cell) => {
        sources.push(...sourcesForRoute(view.cellRoutes.get(cell.compcellTemplateId)));
      });
    }
    return uniqueSources(sources);
  };

  const appendSourceList = (card, sources) => {
    const list = make("ul");
    sources.forEach((source) => {
      const item = make("li");
      item.append(
        make("b", "", source.label || source.version_title || source.ref),
        make(
          "span",
          "",
          `${licenseName(source.licensePosture || source.license)} · ${sourceYearLabel(source)} · `,
        ),
      );
      appendSourcePointers(item, source);
      list.append(item);
    });
    card.append(list);
  };

  function refreshAttributionDrawer() {
    if (document.body.dataset.v3AttributionOpen !== "true") return;
    const fragment = document.createDocumentFragment();

    const boundary = attributionCard("Base Hebrew text", "ready");
    boundary.append(
      make(
        "p",
        "",
        "Each materialized Genesis section carries its exact C0 identity together with the selected source edition and that edition’s own license. Dictionary sources license only their English gloss choices; they do not license the Hebrew base text.",
      ),
    );
    appendSourceList(
      boundary,
      uniqueSources(
        [...sectionsByRef.values()]
          .map((section) => section.base?.source)
          .filter(Boolean),
      ),
    );
    fragment.append(boundary);

    const glosses = attributionCard("Current workbench gloss routes", "ready");
    glosses.append(
      make(
        "p",
        "",
        "Each selected definition keeps its source terms verbatim. NC, SA, GFDL, attribution, and public-domain postures are not flattened into a generic open label.",
      ),
    );
    const workbenchSources = selectedWorkbenchRouteSources();
    if (workbenchSources.length) appendSourceList(glosses, workbenchSources);
    fragment.append(glosses);

    const commentary = attributionCard("Materialized commentary text", "ready");
    commentary.append(
      make(
        "p",
        "",
        "Each materialized commentary source keeps its own edition, source pointer, and license. Public Domain and attribution-required material are not flattened into one generic permission label.",
      ),
    );
    appendSourceList(
      commentary,
      uniqueSources(
        [...sectionsByRef.values()].flatMap((section) =>
          Object.values(section.commentaries || {})
            .map((entry) => entry.fixture?.source)
            .filter(Boolean),
        ),
      ),
    );
    fragment.append(commentary);

    const presentation = attributionCard("Presentation notice", "ready");
    presentation.append(
      make(
        "p",
        "",
        "English Workbench changes only the visual card axis. Hebrew characters remain internally right-to-left, source order remains numbered inside each section, and canonical copy uses that source sequence. The palette uses digital tekhelet, argaman, shani, zahav, and warm shesh (fine-linen) roles; it is not an archaeological dye or textile reconstruction.",
      ),
    );
    fragment.append(presentation);

    const posture = attributionCard("What this drawer proves", "ready");
    posture.append(
      make(
        "p",
        "",
        "This is a local, noncommercial editorial proof—not a blanket publication clearance. Unresolved definition-to-source joins are not selectable; unresolved base-text display authority is called out rather than inferred.",
      ),
    );
    fragment.append(posture);
    elements.attributionContent.replaceChildren(fragment);
  }

  const syncScrim = () => {
    const overlayOpen =
      elements.chapterNavigation.classList.contains("is-open") ||
      document.body.dataset.v3AttributionOpen === "true";
    elements.drawerScrim.hidden = !overlayOpen;
  };

  function openAttributionDrawer() {
    closeChapterDrawer({ returnFocus: false });
    document.body.dataset.v3AttributionOpen = "true";
    elements.attributionButton.setAttribute("aria-expanded", "true");
    elements.attributionDrawer.setAttribute("aria-hidden", "false");
    elements.attributionDrawer.inert = false;
    refreshAttributionDrawer();
    syncScrim();
    requestAnimationFrame(() => elements.attributionDrawer.focus());
  }

  function closeAttributionDrawer({ returnFocus = true } = {}) {
    document.body.dataset.v3AttributionOpen = "false";
    elements.attributionButton.setAttribute("aria-expanded", "false");
    elements.attributionDrawer.setAttribute("aria-hidden", "true");
    elements.attributionDrawer.inert = true;
    syncScrim();
    if (returnFocus) elements.attributionButton.focus();
  }

  const openChapterDrawer = () => {
    closeAttributionDrawer({ returnFocus: false });
    elements.chapterNavigation.classList.add("is-open");
    elements.chapterDrawerButton.setAttribute("aria-expanded", "true");
    elements.chapterNavigation.setAttribute("aria-hidden", "false");
    elements.chapterNavigation.inert = false;
    syncScrim();
    requestAnimationFrame(() => {
      const current = elements.chapterGrid.querySelector(
        '[data-chapter][aria-current="true"]',
      );
      current?.focus();
    });
  };

  const closeChapterDrawer = ({ returnFocus = false } = {}) => {
    elements.chapterNavigation.classList.remove("is-open");
    elements.chapterDrawerButton.setAttribute("aria-expanded", "false");
    elements.chapterNavigation.setAttribute("aria-hidden", "true");
    elements.chapterNavigation.inert = true;
    elements.navigationHud.hidden = true;
    elements.chapterGrid.querySelectorAll("[data-chapter]").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
    syncScrim();
    if (returnFocus) elements.chapterDrawerButton.focus();
  };

  const visibleHebrewContract = () => {
    const tokens = [...document.querySelectorAll("[data-v3-hebrew-token]")].filter(
      (token) => !token.hidden && !token.closest("[hidden]"),
    );
    const violations = tokens.filter((token) => {
      const module = token.closest("[data-v4-hebrew-unit]");
      if (!module) return true;
      const control = module.hasAttribute("aria-controls")
        ? module
        : module.querySelector("[aria-controls]");
      return !(
        module.querySelectorAll("[data-v4-raw-hebrew]").length === 1 &&
        module.querySelectorAll("[data-v4-selected-gloss]").length === 1 &&
        control?.hasAttribute("aria-controls")
      );
    });
    return { count: tokens.length, violations: violations.length };
  };

  function publishAudit() {
    const activeChapter = chapterByNumber.get(state.chapter);
    const activeVerses = versesByChapterId.get(activeChapter?.y_node_id) || [];
    // V6.4: the source stream may hold several appended chapters; the
    // rendered-verse contract covers the full appended range, not only the
    // chrome's current chapter.
    const streamStart = state.streamStart || state.chapter;
    const streamEnd = state.appendedThrough || state.chapter;
    let streamVerseCount = 0;
    for (let number = streamStart; number <= streamEnd; number += 1) {
      const chapter = chapterByNumber.get(number);
      streamVerseCount +=
        (versesByChapterId.get(chapter?.y_node_id) || []).length;
    }
    const sectionEntries = [...sectionsByRef.values()];
    const claimEntries = sectionEntries.flatMap((section) =>
      (section.attachment_map?.claims || []).map((claim) => ({
        section,
        claim,
      })),
    );
    const chapterButtons = elements.chapterGrid.querySelectorAll(
      "[data-chapter]",
    );
    const renderedVerses = elements.verseStream.querySelectorAll(
      "[data-verse-ref]",
    );
    const suggestionsPromoted = claimEntries.filter(
      ({ claim }) =>
        claim.claim_state === "VISUAL_SUGGESTION_ONLY" &&
        (claim.asserted_edge !== null ||
          document.querySelector(
            `[data-commentary-unit-ref="${claim.commentary_unit_ref}"][data-edge-assertion="true"]`,
          )),
    );
    const unresolvedProvenTargets = claimEntries.filter(
      ({ section, claim }) =>
        claim.claim_state === "PROVEN_EDGE" &&
        !claimTargetResolves(section, claim),
    );
    const hebrewContract = visibleHebrewContract();
    const expectedAxis = readerAxisContract.modes[state.readerMode].layout_axis;
    const detailedArticles = [
      ...elements.verseStream.querySelectorAll(
        '[data-detailed-reading="ready"][data-v4-section-ref]',
      ),
    ];
    const sectionAudits = detailedArticles.map((article) => {
      const section = sectionsByRef.get(article.dataset.v4SectionRef);
      const cards = [
        ...article.querySelectorAll(
          '[data-v3-word-module][data-module-kind="base"]',
        ),
      ];
      const sequence = cards.map((card) =>
        Number(card.dataset.displayWordIndex),
      );
      const expectedSequence = (
        section?.base?.canonical_sequence || []
      ).map(Number);
      const bubbles = [
        ...article.querySelectorAll("[data-v3-commentary-bubble]"),
      ];
      const bubbleCounts = bubbles.map((button) =>
        Number(button.dataset.commentaryCount),
      );
      const expectedBubbleCounts = expectedSequence.map((wordIndex) => {
        const word = sectionRuntime(section).wordByIndex.get(wordIndex);
        return word ? claimsForBaseWord(section, word).length : 0;
      });
      const slots = [...article.querySelectorAll(".v3-word-slot")];
      return {
        ref: section?.ref || article.dataset.v4SectionRef,
        card_sequence: sequence,
        expected_card_sequence: expectedSequence,
        bubble_counts: bubbleCounts,
        expected_bubble_counts: expectedBubbleCounts,
        cards_ready:
          Boolean(section) &&
          sequence.join(",") === expectedSequence.join(","),
        bubbles_ready:
          bubbles.length === expectedSequence.length &&
          bubbleCounts.join(",") === expectedBubbleCounts.join(",") &&
          slots.every(
            (slot) =>
              slot.querySelectorAll("[data-v3-commentary-bubble]").length ===
              1,
          ),
        axis_ready: article.querySelector(".v3-word-run")?.dir === expectedAxis,
      };
    });
    const exactSliceReady = sectionAudits.every(
      (audit) => audit.cards_ready && audit.axis_ready,
    );
    const commentaryBubbleCoverageReady = sectionAudits.every(
      (audit) => audit.bubbles_ready,
    );
    const commentaryBubbles = [
      ...elements.verseStream.querySelectorAll(
        "[data-v3-commentary-bubble]",
      ),
    ];
    const audit = {
      status:
        chapterNodes.length === 50 &&
        navigation.nodes.filter(
          (node) =>
            node.node_kind === "SECTION" && node.branch_kind === "BASE",
        ).length === 1533 &&
        chapterButtons.length === 50 &&
        renderedVerses.length === streamVerseCount &&
        hebrewContract.violations === 0 &&
        exactSliceReady &&
        commentaryBubbleCoverageReady &&
        suggestionsPromoted.length === 0 &&
        unresolvedProvenTargets.length === 0
          ? "PASS"
          : "FAIL",
      work_nodes: workNode ? 1 : 0,
      chapter_nodes: chapterNodes.length,
      verse_nodes: navigation.nodes.filter(
        (node) =>
          node.node_kind === "SECTION" && node.branch_kind === "BASE",
      ).length,
      active_chapter: state.chapter,
      active_chapter_verse_count: activeVerses.length,
      rendered_verse_count: renderedVerses.length,
      visible_hebrew_tokens: hebrewContract.count,
      visible_hebrew_contract_violations: hebrewContract.violations,
      reader_mode: state.readerMode,
      layout_axis: expectedAxis,
      exact_card_sequences: Object.fromEntries(
        sectionAudits.map((entry) => [entry.ref, entry.card_sequence]),
      ),
      section_audits: sectionAudits,
      numbering_scope: readerAxisContract.numbering_scope,
      commentary_open:
        document.body.dataset.v3CommentaryOpen === "true",
      commentary_layer: document.body.dataset.v3CommentaryLayer,
      commentary_bubble_count: commentaryBubbles.length,
      commentary_bubble_counts: Object.fromEntries(
        sectionAudits.map((entry) => [entry.ref, entry.bubble_counts]),
      ),
      commentary_snap_model:
        "SECTIONED_FULL_TRACK__RANGE_LATCHED__VERIFIED_ANCHORS_ONLY",
      commentary_track: state.activeCommentaryTrack || null,
      commentary_track_unit_index:
        activeCommentaryTrackIndex() >= 0
          ? activeCommentaryTrackIndex() + 1
          : null,
      commentary_track_unit_counts: Object.fromEntries(
        [...commentaryTrackUnitsByTrack.entries()].map(([track, units]) => [
          track,
          units.length,
        ]),
      ),
      commentary_track_section_counts: Object.fromEntries(
        [...commentaryTrackUnitsByTrack.keys()].map((track) => [
          track,
          commentaryTrackSections(track).length,
        ]),
      ),
      commentary_alignment_ref:
        state.commentaryAlignmentRef || state.activeSectionRef || null,
      commentary_snap_group: state.activeSnapGroupKey || null,
      commentary_snap_origin:
        document.body.dataset.v4CommentarySnapOrigin || null,
      commentary_source_position: state.currentSourcePosition,
      verified_commentary_snap_edges: verifiedCommentaryEdges.length,
      verified_commentary_snap_groups: Object.fromEntries(
        [...commentarySnapGroupsByTrack.entries()].map(([track, groups]) => [
          track,
          groups.length,
        ]),
      ),
      active_commentary_range_nodes: document.querySelectorAll(
        ".is-commentary-range",
      ).length,
      active_commentary_source_nodes: document.querySelectorAll(
        ".is-commentary-active-source",
      ).length,
      held_commentary_hud_count: document.querySelectorAll(
        "[data-v4-held-hud]",
      ).length,
      toc_open: elements.chapterNavigation.classList.contains("is-open"),
      attribution_open:
        document.body.dataset.v3AttributionOpen === "true",
      active_materialized_detailed_sections: detailedArticles.length,
      materialized_detailed_sections: sectionsByRef.size,
      commentary_workspace_model:
        "V5_TWO_RAIL__VERSE_SPINE__MAGNETIC_SNAP__DIBBUR_HAMATCHIL_ANCHORS",
      commentary_units_total: allCommentaryUnitsOrdered.length,
      rail_work: state.railWork || null,
      rail_item_count: state.railItems.length,
      rail_active_index:
        state.activeRailIndex >= 0 ? state.activeRailIndex + 1 : null,
      rail_anchor_classes: state.railItems.reduce(
        (tally, item) => {
          tally[item.anchorClass] = (tally[item.anchorClass] || 0) + 1;
          return tally;
        },
        {},
      ),
      rail_snap_master: state.snapMaster || null,
      rail_linked: state.railLinked,
      rail_b_open: state.railBOpen,
      rail_b_work: state.railBOpen ? state.railBWork || null : null,
      rail_b_item_count: state.railBOpen ? state.railBItems.length : 0,
      hud_d_cards_rendered: document.querySelectorAll(
        "[data-v4-d-card]",
      ).length,
      witness_ledger_present: Boolean(
        elements.commentaryContent.querySelector(
          "[data-v4-witness-ledger]",
        ),
      ),
      v4_1_amendment_id: v41EditorialAmendment.amendment_id,
      synthesis_default_rule:
        window.SYNTHESIS_DEFAULT_GLOSSES?.rule_id || null,
      synthesis_defaults_attested: Object.keys(synthesisAttestations)
        .length,
      synthesis_defaults_derived: Object.keys(synthesisDerivedDefaults)
        .length,
      v3_parent_validation_id: v4Ancestry.parent_validation_id,
      work_antiquity: {
        rule: "oldest composition first; undated works last",
        source_field: "composition_date_evidence",
        works_dated: [...v5WitnessFamilies.values()].filter((f) =>
          Number.isInteger(f.composed),
        ).length,
        works_total: v5WitnessFamilies.size,
      },
      draft_splits_withheld: true,
      source_stream: {
        continuous_scroll: true,
        stream_start: streamStart,
        appended_through: streamEnd,
        stream_verse_count: streamVerseCount,
        chrome_follows_scroll: true,
        section_copy_controls: document.querySelectorAll(
          "[data-v5-section-copy]",
        ).length,
      },
      commentary_word_shards: {
        rashi_registry_words: Object.keys(
          window.NESTED_RASHI_HUD_WORDS || {},
        ).length,
        rashi_usable_words: Object.values(
          window.NESTED_RASHI_HUD_WORDS || {},
        ).filter((word) => wordIsUsable(word)).length,
        shard_rule:
          Object.values(window.NESTED_RASHI_HUD_WORDS || {})[0]?.provenance
            ?.rule_id || null,
      },
      route_store: {
        enabled: routeStore.enabled,
        rule: "route-store-rule-v1-catalog-compact-top5",
        index_loaded: !!routeStore.index,
        shards_fetched: routeStore.shards.size,
        lookups: routeStore.lookups,
        hits: routeStore.hits,
        words_woken: routeStore.woken,
        woken_modules: document.querySelectorAll("[data-v7-route-store]")
          .length,
      },
      lemma_presentation: {
        proof_text_lemmas: document.querySelectorAll("span.v5-lemma").length,
        word_module_lemmas:
          document.querySelectorAll(".v5-lemma-word").length,
        basis: "TEXT_OWN_HEADWORD_PERIOD_CONVENTION",
        text_mutation: false,
      },
      suggestion_promotions: suggestionsPromoted.map(
        ({ claim }) => claim.commentary_unit_ref,
      ),
      unresolved_proven_targets: unresolvedProvenTargets.map(
        ({ claim }) => claim.commentary_unit_ref,
      ),
    };
    window.V4_BOOK_READER_AUDIT = Object.freeze(audit);
    document.documentElement.dataset.v4Audit = audit.status;
  }

  elements.previousChapter.addEventListener("click", () => {
    selectChapter(Math.max(1, state.chapter - 1));
  });
  elements.nextChapter.addEventListener("click", () => {
    selectChapter(Math.min(chapterNodes.length, state.chapter + 1));
  });
  elements.copyCanonical.addEventListener("click", async () => {
    const chapter = chapterByNumber.get(state.chapter);
    const verses = versesByChapterId.get(chapter?.y_node_id) || [];
    const materialized = verses
      .map((verse) => sectionsByRef.get(verse.public_ref))
      .filter(Boolean);
    if (!materialized.length) {
      announce("No canonical source text is materialized in this chapter.");
      return;
    }
    // Each section carries its own edition, so a multi-section copy can
    // carry more than one credit line — they ride together, deduped.
    const canonical = withExportAttribution(
      materialized.map((section) => ({
        text: canonicalTextForSection(section),
        credit: exportAttributionForSection(section),
      })),
    );
    try {
      await navigator.clipboard.writeText(canonical);
      announce(
        `${materialized.map((section) => section.ref).join("–")} copied in canonical source order, with source records.`,
      );
    } catch {
      announce("Canonical copy is ready, but this local browser did not grant clipboard access.");
    }
  });
  elements.commentaryLayerToggle.addEventListener("click", () => {
    setCommentaryLayer(!state.commentaryLayer);
  });
  elements.chapterDrawerButton.addEventListener("click", () => {
    if (elements.chapterNavigation.classList.contains("is-open")) {
      closeChapterDrawer({ returnFocus: true });
    } else {
      openChapterDrawer();
    }
  });
  elements.closeChapters.addEventListener("click", () =>
    closeChapterDrawer({ returnFocus: true }),
  );
  document.querySelectorAll("[data-v3-reader-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setReaderMode(button.dataset.v3ReaderMode);
    });
  });
  document.querySelectorAll("[data-v3-workspace]").forEach((button) => {
    button.addEventListener("click", () => {
      if (
        button.dataset.v3Workspace === "commentary" &&
        state.activeCommentaryTrack &&
        state.currentSourcePosition
      ) {
        alignCommentaryTrackToSource(
          state.currentSourcePosition.section_ref,
          state.currentSourcePosition.word_index,
          {
            origin: "workspace-open",
            openPane: true,
          },
        );
      }
      setMobileWorkspace(button.dataset.v3Workspace);
    });
  });
  elements.previousCommentary.addEventListener("click", () =>
    moveCommentaryUnit(-1),
  );
  elements.nextCommentary.addEventListener("click", () =>
    moveCommentaryUnit(1),
  );
  elements.closeCommentary.addEventListener("click", () =>
    closeCommentaryWorkspace(),
  );
  elements.attributionButton.addEventListener("click", () => {
    if (document.body.dataset.v3AttributionOpen === "true") {
      closeAttributionDrawer();
    } else {
      openAttributionDrawer();
    }
  });
  elements.closeAttribution.addEventListener("click", () =>
    closeAttributionDrawer(),
  );
  elements.drawerScrim.addEventListener("click", () => {
    if (document.body.dataset.v3AttributionOpen === "true") {
      closeAttributionDrawer();
    } else if (elements.chapterNavigation.classList.contains("is-open")) {
      closeChapterDrawer({ returnFocus: true });
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (
      document.querySelector(
        '[data-v3-commentary-choice-shelf]:not([hidden])',
      )
    ) {
      closeCommentaryChoosers({ returnFocus: true });
    } else if (document.body.dataset.v3AttributionOpen === "true") {
      closeAttributionDrawer();
    } else if (elements.chapterNavigation.classList.contains("is-open")) {
      closeChapterDrawer({ returnFocus: true });
    } else if (document.body.dataset.v3CommentaryOpen === "true") {
      closeCommentaryWorkspace();
    }
  });
  if ("ResizeObserver" in window) {
    const baseHudResizeObserver = new ResizeObserver(
      scheduleOpenBaseHudPanelPosition,
    );
    baseHudResizeObserver.observe(elements.readingPane);
  }
  window.addEventListener("resize", scheduleOpenBaseHudPanelPosition, {
    passive: true,
  });
  elements.readingPane.addEventListener(
    "scroll",
    scheduleCommentarySnapFromScroll,
    { passive: true },
  );
  elements.readingPane.addEventListener(
    "scroll",
    scheduleSourceStreamCheck,
    { passive: true },
  );
  window.addEventListener("resize", scheduleCommentarySnapFromScroll, {
    passive: true,
  });

  // ── V5 wiring · masters, rail follow, work selector, divider ──────────
  ["wheel", "touchstart", "pointerdown"].forEach((type) => {
    elements.readingPane.addEventListener(
      type,
      () => v5ClaimSnapMaster("source"),
      { passive: true },
    );
    elements.commentaryPane.addEventListener(
      type,
      () => v5ClaimSnapMaster("rail"),
      { passive: true },
    );
  });
  let v5RailSettleTimer = 0;
  elements.commentaryPane.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(v5RailSettleTimer);
      v5RailSettleTimer = window.setTimeout(v5FollowRail, 90);
    },
    { passive: true },
  );

  const v5PopulateWorkSelect = (select) => {
    if (!select) return;
    const attachedGroup = make("optgroup");
    attachedGroup.label = "Attached works";
    const targumGroup = make("optgroup");
    targumGroup.label = "Targums";
    const commentaryGroup = make("optgroup");
    commentaryGroup.label = "Commentaries";
    const attached = new Set(commentaryTrackUnitsByTrack.keys());
    [...v5WitnessFamilies.values()]
      // V6.8 · oldest work first; undated works form the last tier and
      // fall back to alphabetical among themselves. Same shape as the
      // attested antiquity rule, applied to works.
      .sort((left, right) => {
        const leftDated = Number.isInteger(left.composed);
        const rightDated = Number.isInteger(right.composed);
        if (leftDated !== rightDated) return leftDated ? -1 : 1;
        if (leftDated && left.composed !== right.composed) {
          return left.composed - right.composed;
        }
        return left.en.localeCompare(right.en);
      })
      .forEach((family) => {
        const label = family.he ? `${family.en} · ${family.he}` : family.en;
        const option = make(
          "option",
          "",
          Number.isInteger(family.composed)
            ? `${label} · ${family.composed}`
            : label,
        );
        option.value = family.key;
        if (Number.isInteger(family.composed)) {
          option.dataset.composed = String(family.composed);
        }
        if (attached.has(family.key)) attachedGroup.append(option);
        else if (family.kind === "TARGUM") targumGroup.append(option);
        else commentaryGroup.append(option);
      });
    [attachedGroup, targumGroup, commentaryGroup].forEach((group) => {
      if (group.children.length) select.append(group);
    });
  };
  v5PopulateWorkSelect(elements.railWorkSelect);
  v5PopulateWorkSelect(elements.railBWorkSelect);
  elements.railWorkSelect?.addEventListener("change", () => {
    v5SetRailWork(elements.railWorkSelect.value);
  });
  elements.railBWorkSelect?.addEventListener("change", () => {
    v5SetRailBWork(elements.railBWorkSelect.value);
  });
  elements.openRailB?.addEventListener("click", () => {
    if (state.railBOpen) v5CloseRailB();
    else v5OpenRailB();
  });
  elements.closeRailB?.addEventListener("click", () => v5CloseRailB());
  elements.hebrewSmaller?.addEventListener("click", () =>
    v5StepHebrewScale(-1),
  );
  elements.hebrewLarger?.addEventListener("click", () =>
    v5StepHebrewScale(1),
  );
  elements.shareLink?.addEventListener("click", () => {
    void v5CopyShareLink();
  });
  elements.deckToggle?.addEventListener("click", () => {
    v5SetDeckMode(
      document.body.dataset.v5Deck === "split" ? "stack" : "split",
    );
  });
  v5SetDeckMode("stack");
  if (elements.railB) {
    elements.railB.inert = true;
    ["wheel", "touchstart", "pointerdown"].forEach((type) => {
      elements.railB.addEventListener(
        type,
        () => v5ClaimSnapMaster("railB"),
        { passive: true },
      );
    });
    let v5RailBSettleTimer = 0;
    elements.railB.addEventListener(
      "scroll",
      () => {
        window.clearTimeout(v5RailBSettleTimer);
        v5RailBSettleTimer = window.setTimeout(v5BFollowScroll, 90);
      },
      { passive: true },
    );
  }

  if (elements.railDivider) {
    const shell = document.querySelector("#v3-reader-shell");
    const setRailSize = (fraction) => {
      const clamped = Math.min(0.78, Math.max(0.2, fraction));
      shell?.style.setProperty(
        "--v5-rail-size",
        `${(clamped * 100).toFixed(1)}%`,
      );
    };
    let dividerDragging = false;
    elements.railDivider.addEventListener("pointerdown", (event) => {
      dividerDragging = true;
      try {
        elements.railDivider.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is a nicety; dragging works without it.
      }
    });
    elements.railDivider.addEventListener("pointermove", (event) => {
      if (!dividerDragging || !shell) return;
      const rect = shell.getBoundingClientRect();
      if (rect.height <= 0) return;
      setRailSize((rect.bottom - event.clientY) / rect.height);
    });
    ["pointerup", "pointercancel"].forEach((type) => {
      elements.railDivider.addEventListener(type, () => {
        dividerDragging = false;
      });
    });
    elements.railDivider.addEventListener("keydown", (event) => {
      if (!shell) return;
      const current =
        Number.parseFloat(
          shell.style.getPropertyValue("--v5-rail-size"),
        ) || 46;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setRailSize((current + 6) / 100);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setRailSize((current - 6) / 100);
      }
    });
  }

  elements.returnToSource.addEventListener("click", () => {
    setMobileWorkspace("text");
    const sourceSectionRef = state.activeSectionRef;
    const sourceTargetId = state.activeSourceTarget;
    const activeGroup = commentarySnapGroupByClaimRef.get(
      state.activeClaimRef,
    );
    const sourceChapter = Number(
      /^Genesis\s+(\d+):/u.exec(sourceSectionRef)?.[1],
    );
    if (
      Number.isInteger(sourceChapter) &&
      state.chapter !== sourceChapter
    ) {
      selectChapter(sourceChapter, { alignCommentary: false });
    }
    state.currentSourcePosition =
      activeGroup?.start || sourcePosition(sourceSectionRef, 1);
    refreshActiveCommentaryHighlight();
    requestAnimationFrame(() => {
      const target = document.querySelector(`#${sourceTargetId}`);
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      target?.scrollIntoView({ block: "center", behavior });
      target?.focus?.({ preventScroll: true });
    });
  });

  renderTitleModule();
  renderChapterNavigation();
  elements.chapterNavigation.inert = true;
  elements.commentaryPane.inert = true;
  elements.commentaryPane.setAttribute("aria-hidden", "true");
  elements.attributionDrawer.inert = true;
  setText(
    elements.bookCounts,
    `${chapterNodes.length} chapters · ${workNode.content_unit_count.toLocaleString("en-US")} verses`,
  );
  setReaderMode("hebrew");
  const initialParameters = new URLSearchParams(window.location.search);
  const initialSourceRef =
    initialParameters.get("ref") ||
    initialParameters.get("source") ||
    "";
  const initialCommentaryTrack =
    initialParameters.get("commentary") || "";
  const openedInitialAlignment =
    initialSourceRef &&
    initialCommentaryTrack &&
    openAlignedSource({
      sourceRef: initialSourceRef,
      commentaryTrack: initialCommentaryTrack,
      showCommentary: true,
    });
  if (!openedInitialAlignment) {
    const initialAddress = parseSourceAddress(initialSourceRef);
    selectChapter(initialAddress?.chapter || 1, {
      alignCommentary: false,
    });
    if (initialAddress) {
      state.currentSourcePosition = sourcePosition(
        initialAddress.sectionRef,
        initialAddress.wordIndex,
      );
      requestAnimationFrame(() => {
        const sourceNode = orderedBaseSourceSections.find(
          (node) => node.public_ref === initialAddress.sectionRef,
        );
        const target = sourceNode?.dom_anchor
          ? document.querySelector(`#v3-${sourceNode.dom_anchor}`)
          : null;
        target?.scrollIntoView({ block: "start", behavior: "auto" });
      });
    }
  }
  setCommentaryLayer(true);
  // V4.1: materialize the stacked workspace and witness ledger from first
  // paint, so the pane presents the whole record before any pill is chosen.
  renderCommentaryTrack({ origin: "initial" });
  // V5.3: shareable alignment links reopen an exact spread.
  v5ApplyShareParams();
})();
