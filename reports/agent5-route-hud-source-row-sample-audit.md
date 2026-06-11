# Agent 5 Route HUD Word Sample Audit

Generated: 2026-05-31T19:19:33.954Z

## Scope

- Pages: tanakh/genesis/index.html, tanakh/exodus/index.html, other/beer-hagolah/index.html
- Max tokens per page: 20
- Lookup manifest: data/definitions/hud-route-lookup/manifest.json
- This is a targeted sampler, not a full validator or browser render.

## Summary

- info: 60
- warning: 55

## Issue Counts

- maqaf_compound_lookup_note: 60
- ambiguous_answer_slot: 49
- non_exact_answer: 5
- form_reference_answer_text: 1

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
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p4 כׇּל־נֶ֛פֶשׁ (כל־נפש): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p4 כׇּל־נֶ֛פֶשׁ (כל־נפש): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p4 יֶֽרֶךְ־יַעֲקֹ֖ב (ירכ־יעקב): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p4 יֶֽרֶךְ־יַעֲקֹ֖ב (ירכ־יעקב): Answer slot suppresses definition because 3 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p5 וְכׇל־אֶחָ֔יו (וכל־אחיו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / non_exact_answer / tanakh/exodus/index.html p5 וְכׇל־אֶחָ֔יו (וכל־אחיו): Selected answer comes from a generated lookup candidate rather than exact token lookup.
- warning / form_reference_answer_text / tanakh/exodus/index.html p5 וְכׇל־אֶחָ֔יו (וכל־אחיו): Selected answer text looks like a form-reference rather than a definition.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p7 מֶֽלֶךְ־חָדָ֖שׁ (מלכ־חדש): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p7 מֶֽלֶךְ־חָדָ֖שׁ (מלכ־חדש): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p7 עַל־מִצְרָ֑יִם (על־מצרימ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p7 עַל־מִצְרָ֑יִם (על־מצרימ): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p7 לֹֽא־יָדַ֖ע (לא־ידע): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p7 לֹֽא־יָדַ֖ע (לא־ידע): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p7 אֶת־יוֹסֵֽף׃ (את־יוספ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p7 אֶת־יוֹסֵֽף׃ (את־יוספ׃): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p8 אֶל־עַמּ֑וֹ (אל־עמו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p8 אֶל־עַמּ֑וֹ (אל־עמו): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 פֶּן־יִרְבֶּ֗ה (פנ־ירבה): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 פֶּן־יִרְבֶּ֗ה (פנ־ירבה): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 כִּֽי־תִקְרֶ֤אנָה (כי־תקראנה): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 כִּֽי־תִקְרֶ֤אנָה (כי־תקראנה): Answer slot suppresses definition because 8 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 גַּם־הוּא֙ (גמ־הוא): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 גַּם־הוּא֙ (גמ־הוא): Answer slot suppresses definition because 7 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 עַל־שֹׂ֣נְאֵ֔ינוּ (על־שנאינו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 עַל־שֹׂ֣נְאֵ֔ינוּ (על־שנאינו): Answer slot suppresses definition because 3 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 וְנִלְחַם־בָּ֖נוּ (ונלחמ־בנו): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 וְנִלְחַם־בָּ֖נוּ (ונלחמ־בנו): Answer slot suppresses definition because 4 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p9 מִן־הָאָֽרֶץ׃ (מנ־הארצ׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p9 מִן־הָאָֽרֶץ׃ (מנ־הארצ׃): Answer slot suppresses definition because 2 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p10 אֶת־פִּתֹ֖ם (את־פתמ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p10 אֶת־פִּתֹ֖ם (את־פתמ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p10 וְאֶת־רַעַמְסֵֽס׃ (ואת־רעמסס׃): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p12 אֶת־בְּנֵ֥י (את־בני): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p12 אֶת־בְּנֵ֥י (את־בני): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p13 אֶת־חַיֵּיהֶ֜ם (את־חייהמ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p13 אֶת־חַיֵּיהֶ֜ם (את־חייהמ): Answer slot suppresses definition because 5 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p13 וּבְכׇל־עֲבֹדָ֖ה (ובכל־עבדה): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p13 וּבְכׇל־עֲבֹדָ֖ה (ובכל־עבדה): Answer slot suppresses definition because 3 close answer meanings compete.
- info / maqaf_compound_lookup_note / tanakh/exodus/index.html p13 כׇּל־עֲבֹ֣דָתָ֔ם (כל־עבדתמ): Token contains maqaf/hyphen. Runtime tokenizer preserves the compound, while lookup candidates also include component keys for audit.
- warning / ambiguous_answer_slot / tanakh/exodus/index.html p13 כׇּל־עֲבֹ֣דָתָ֔ם (כל־עבדתמ): Answer slot suppresses definition because 4 close answer meanings compete.

## Boundary

This script checks static rendered HTML and public route lookup JSON. It does not execute browser click handlers, does not load lexical chunks, and does not validate every page.

