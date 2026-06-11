# Agent 5 Route HUD Word Sample Audit

Generated: 2026-06-01T06:14:20.741Z

## Scope

- Pages: tanakh/genesis/index.html, ari/sefer-etz-chaim/index.html, other/beer-hagolah/index.html, halakhah/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat/index.html
- Max tokens per page: 80
- Lookup manifest: data/definitions/hud-route-lookup/manifest.json
- This is a targeted sampler, not a full validator or browser render.

## Summary

- info: 121
- warning: 250

## Issue Counts

- ambiguous_answer_slot: 152
- maqaf_compound_lookup_note: 121
- non_exact_answer: 56
- evidence_without_answer: 24
- no_route_cards: 18

## Error Findings

- None.

## Warning Samples

- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p1 עַל־פְּנֵ֣י (על־פני): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p1 עַל־פְּנֵ֣י (על־פני): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p1 עַל־פְּנֵ֥י (על־פני): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p1 עַל־פְּנֵ֥י (על־פני): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p2 וַֽיְהִי־אֽוֹר׃ (ויהי־אור׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p2 וַֽיְהִי־אֽוֹר׃ (ויהי־אור׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p3 אֶת־הָא֖וֹר (את־האור): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p3 אֶת־הָא֖וֹר (את־האור): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p3 כִּי־ט֑וֹב (כי־טוב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p3 כִּי־ט֑וֹב (כי־טוב): Answer slot suppresses definition because 11 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p4 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p4 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p4 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p4 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p6 אֶת־הָרָקִ֒יעַ֒ (את־הרקיע): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p6 אֶת־הָרָקִ֒יעַ֒ (את־הרקיע): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p6 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p6 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p7 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p7 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p7 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p7 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p8 אֶל־מָק֣וֹם (אל־מקומ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p8 אֶל־מָק֣וֹם (אל־מקומ): Answer slot suppresses definition because 9 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p8 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p8 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p9 כִּי־טֽוֹב׃ (כי־טוב׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p9 כִּי־טֽוֹב׃ (כי־טוב׃): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p10 זַרְעוֹ־ב֖וֹ (זרעו־בו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / non_exact_answer / tanakh/genesis/index.html p10 זַרְעוֹ־ב֖וֹ (זרעו־בו): Selected answer comes from a generated lookup candidate rather than exact token lookup.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p10 עַל־הָאָ֑רֶץ (על־הארצ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p10 עַל־הָאָ֑רֶץ (על־הארצ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p10 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p10 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p11 עֹֽשֶׂה־פְּרִ֛י (עשה־פרי): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p11 עֹֽשֶׂה־פְּרִ֛י (עשה־פרי): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p11 זַרְעוֹ־ב֖וֹ (זרעו־בו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / non_exact_answer / tanakh/genesis/index.html p11 זַרְעוֹ־ב֖וֹ (זרעו־בו): Selected answer comes from a generated lookup candidate rather than exact token lookup.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p11 כִּי־טֽוֹב׃ (כי־טוב׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p11 כִּי־טֽוֹב׃ (כי־טוב׃): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p12 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p12 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p12 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p12 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p14 עַל־הָאָ֑רֶץ (על־הארצ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p14 עַל־הָאָ֑רֶץ (על־הארצ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p14 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p14 וַֽיְהִי־כֵֽן׃ (ויהי־כנ׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p15 אֶת־שְׁנֵ֥י (את־שני): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p15 אֶת־שְׁנֵ֥י (את־שני): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p15 אֶת־הַמָּא֤וֹר (את־המאור): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p15 אֶת־הַמָּא֤וֹר (את־המאור): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p15 וְאֶת־הַמָּא֤וֹר (ואת־המאור): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / non_exact_answer / tanakh/genesis/index.html p15 וְאֶת־הַמָּא֤וֹר (ואת־המאור): Selected answer comes from a generated lookup candidate rather than exact token lookup.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p16 עַל־הָאָֽרֶץ׃ (על־הארצ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p16 עַל־הָאָֽרֶץ׃ (על־הארצ׃): Answer slot suppresses definition because 3 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p17 כִּי־טֽוֹב׃ (כי־טוב׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p17 כִּי־טֽוֹב׃ (כי־טוב׃): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p18 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p18 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p18 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p18 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p19 עַל־הָאָ֔רֶץ (על־הארצ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p19 עַל־הָאָ֔רֶץ (על־הארצ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p19 עַל־פְּנֵ֖י (על־פני): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p19 עַל־פְּנֵ֖י (על־פני): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p20 אֶת־הַתַּנִּינִ֖ם (את־התנינמ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p20 אֶת־הַתַּנִּינִ֖ם (את־התנינמ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p20 כׇּל־נֶ֣פֶשׁ (כל־נפש): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p20 כׇּל־נֶ֣פֶשׁ (כל־נפש): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p20 כׇּל־ע֤וֹף (כל־עופ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p20 כׇּל־ע֤וֹף (כל־עופ): Answer slot suppresses definition because 3 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p20 כִּי־טֽוֹב׃ (כי־טוב׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p20 כִּי־טֽוֹב׃ (כי־טוב׃): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p21 אֶת־הַמַּ֙יִם֙ (את־המימ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p21 אֶת־הַמַּ֙יִם֙ (את־המימ): Answer slot suppresses definition because 6 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p22 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p22 וַֽיְהִי־עֶ֥רֶב (ויהי־ערב): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/genesis/index.html p22 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/genesis/index.html p22 וַֽיְהִי־בֹ֖קֶר (ויהי־בקר): Answer slot suppresses definition because 5 close answer meanings compete.

## Boundary

This script checks static rendered HTML and public route lookup JSON. It does not execute browser click handlers, does not load lexical chunks, and does not validate every page.

