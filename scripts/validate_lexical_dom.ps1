$ErrorActionPreference = 'Stop'

$samples = @(
  [pscustomobject]@{
    Label = 'Orot 70:5 HUD canary'
    WorkId = 'orot'
    UnitId = 'orot-lights-from-darkness-lights-of-rebirth-70-5'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\orot.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Orot punctuation sample'
    WorkId = 'orot'
    UnitId = 'orot-lights-from-darkness-war-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\orot.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Orot Land of Israel punctuation sample'
    WorkId = 'orot'
    UnitId = 'orot-lights-from-darkness-land-of-israel-1-2'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\orot.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Orot non-Lights-from-Darkness sample'
    WorkId = 'orot'
    UnitId = 'orot-the-process-of-ideals-in-israel-the-godly-and-the-national-ideal-in-the-individual-1'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\orot.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Ari School HUD sample'
    WorkId = 'pri-etz-chaim'
    UnitId = 'pri-etz-chaim-gate-of-prayer-introduction-1'
    HtmlPath = Join-Path $PSScriptRoot '..\ari\pri-etz-chaim\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\pri-etz-chaim.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\pri-etz-chaim.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Gra School HUD sample'
    WorkId = 'beur-hagra-on-shulchan-arukh-orach-chayim'
    UnitId = 'beur-hagra-on-shulchan-arukh-orach-chayim-1-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\gra\beur-hagra-on-shulchan-arukh-orach-chayim\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\beur-hagra-on-shulchan-arukh-orach-chayim.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\beur-hagra-on-shulchan-arukh-orach-chayim.manifest.json'
  },
  [pscustomobject]@{
    Label = 'Rav Kook School HUD sample'
    WorkId = 'maamar-hador'
    UnitId = 'maamar-hador-1'
    HtmlPath = Join-Path $PSScriptRoot '..\rav-kook\maamar-hador\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\maamar-hador.json'
    ManifestPath = Join-Path $PSScriptRoot '..\data\lexical\maamar-hador.manifest.json'
  }
)

$tokenIndexPath = Join-Path $PSScriptRoot '..\data\lexical\token-index.json'
$lexiconPath = Join-Path $PSScriptRoot '..\data\lexical\lexicon.json'

foreach ($path in @($tokenIndexPath, $lexiconPath)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required lexical validation file not found: $path"
  }
}

$tokenIndex = Get-Content -LiteralPath $tokenIndexPath -Raw -Encoding UTF8 | ConvertFrom-Json
$tokenIndexRows = @()
if ($tokenIndex.PSObject.Properties.Name -contains 'forms') {
  $tokenIndexRows = @($tokenIndex.forms)
}
if ($tokenIndexRows.Count -eq 0 -and $tokenIndex.PSObject.Properties.Name -contains 'work_indexes') {
  foreach ($indexFile in @($tokenIndex.work_indexes)) {
    if (-not $indexFile.path) { continue }
    $indexPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$indexFile.path)
    if (-not (Test-Path -LiteralPath $indexPath)) {
      throw "Required per-work token index file not found: $indexPath"
    }
    $workTokenIndex = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $tokenIndexRows += @($workTokenIndex.forms)
  }
}
$tokenRows = @{}
foreach ($row in @($tokenIndexRows)) {
  $tokenKey = [string]$row.token_index_id
  $tokenRows[$tokenKey] = $row
}

$lexicon = Get-Content -LiteralPath $lexiconPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lexiconEntries = @($lexicon.entries)
if ($lexiconEntries.Count -eq 0 -and $lexicon.PSObject.Properties.Name -contains 'layer_files') {
  foreach ($layer in @($lexicon.layer_files)) {
    if (-not $layer.path) { continue }
    $layerPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$layer.path)
    if (-not (Test-Path -LiteralPath $layerPath)) {
      throw "Required lexical source layer file not found: $layerPath"
    }
    $layerJson = Get-Content -LiteralPath $layerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $lexiconEntries += @($layerJson.entries)
  }
}
$entryIds = @{}
$entriesById = @{}
foreach ($entry in @($lexiconEntries)) {
  $entryIds[[string]$entry.entry_id] = $true
  $entriesById[[string]$entry.entry_id] = $entry
}

function Select-TokenRow {
  param(
    [string]$WorkId = 'orot',
    [AllowNull()][string]$Surface,
    [AllowNull()][string]$Normalized
  )

  $matches = @($tokenIndexRows | Where-Object {
    ($_.work_id -eq $WorkId) -and
    ((($Surface -ne $null) -and ($_.surface_word -eq $Surface)) -or (($Normalized -ne $null) -and ($_.normalized_word -eq $Normalized)))
  })
  if ($matches.Count -eq 0) {
    $matches = @($tokenIndexRows | Where-Object {
      ((($Surface -ne $null) -and ($_.surface_word -eq $Surface)) -or (($Normalized -ne $null) -and ($_.normalized_word -eq $Normalized)))
    })
  }
  return $matches | Select-Object -First 1
}

$laUmmahSurface = -join @([char]0x05DC, [char]0x05B8, [char]0x05D0, [char]0x05BB, [char]0x05DE, [char]0x05B8, [char]0x05BC, [char]0x05D4)
$ummahLemma = -join @([char]0x05D0, [char]0x05D5, [char]0x05DE, [char]0x05D4)
$betorSurface = -join @([char]0x05D1, [char]0x05B0, [char]0x05BC, [char]0x05EA, [char]0x05D5, [char]0x05B9, [char]0x05E8)
$betorNormalized = -join @([char]0x05D1, [char]0x05EA, [char]0x05D5, [char]0x05E8)
$betorPrefix = -join @([char]0x05D1, [char]0x05B0, [char]0x05BC, [char]0x05BE)
$betorBase = -join @([char]0x05EA, [char]0x05D5, [char]0x05B9, [char]0x05E8)
$shelNormalized = -join @([char]0x05E9, [char]0x05DC)
$einennahNormalized = -join @([char]0x05D0, [char]0x05D9, [char]0x05E0, [char]0x05E0, [char]0x05D4)
$openingCanaryGroup = @(
  [pscustomobject]@{
    Label = 'eretz'
    Surface = -join @([char]0x05D0, [char]0x05B6, [char]0x05E8, [char]0x05B6, [char]0x05E5)
    Codepoints = @(0x05D0, 0x05B6, 0x05E8, 0x05B6, 0x05E5)
    Normalized = -join @([char]0x05D0, [char]0x05E8, [char]0x05E6)
    LikelyEntryKey = 'openscriptures:H776'
    Renderings = @('land', 'earth')
  },
  [pscustomobject]@{
    Label = 'yisrael'
    Surface = -join @([char]0x05D9, [char]0x05B4, [char]0x05E9, [char]0x05B0, [char]0x05C2, [char]0x05E8, [char]0x05B8, [char]0x05D0, [char]0x05B5, [char]0x05DC)
    Codepoints = @(0x05D9, 0x05B4, 0x05E9, 0x05B0, 0x05C2, 0x05E8, 0x05B8, 0x05D0, 0x05B5, 0x05DC)
    Normalized = -join @([char]0x05D9, [char]0x05E9, [char]0x05E8, [char]0x05D0, [char]0x05DC)
    LikelyEntryKey = 'openscriptures:H3479'
    Renderings = @('Israel')
  },
  [pscustomobject]@{
    Label = 'einennah'
    Surface = -join @([char]0x05D0, [char]0x05B5, [char]0x05D9, [char]0x05E0, [char]0x05B6, [char]0x05E0, [char]0x05B8, [char]0x05BC, [char]0x05D4, [char]0x05BC)
    Codepoints = @(0x05D0, 0x05B5, 0x05D9, 0x05E0, 0x05B6, 0x05E0, 0x05B8, 0x05BC, 0x05D4, 0x05BC)
    Normalized = $einennahNormalized
    LikelyEntryKey = "grammar-form:$einennahNormalized"
    Renderings = @('is not', 'is not it', 'is not her')
  },
  [pscustomobject]@{
    Label = 'davar'
    Surface = -join @([char]0x05D3, [char]0x05B8, [char]0x05BC, [char]0x05D1, [char]0x05B8, [char]0x05E8)
    Codepoints = @(0x05D3, 0x05B8, 0x05BC, 0x05D1, 0x05B8, 0x05E8)
    Normalized = -join @([char]0x05D3, [char]0x05D1, [char]0x05E8)
    LikelyEntryKey = 'openscriptures:H1697'
    Renderings = @('thing', 'matter', 'word')
  },
  [pscustomobject]@{
    Label = 'hitzoni'
    Surface = -join @([char]0x05D7, [char]0x05B4, [char]0x05D9, [char]0x05E6, [char]0x05D5, [char]0x05B9, [char]0x05E0, [char]0x05B4, [char]0x05D9)
    Codepoints = @(0x05D7, 0x05B4, 0x05D9, 0x05E6, 0x05D5, 0x05B9, 0x05E0, 0x05B4, 0x05D9)
    Normalized = -join @([char]0x05D7, [char]0x05D9, [char]0x05E6, [char]0x05D5, [char]0x05E0, [char]0x05D9)
    LikelyEntryKey = 'wikidata:L210877'
    Renderings = @('external', 'exterior')
  }
)

function Assert-Codepoints {
  param(
    [string]$Label,
    [string]$Value,
    [int[]]$Expected
  )

  $actual = @()
  foreach ($char in $Value.ToCharArray()) {
    $actual += [int][char]$char
  }
  $expectedHex = ($Expected | ForEach-Object { $_.ToString('X4') }) -join ' '
  $actualHex = ($actual | ForEach-Object { $_.ToString('X4') }) -join ' '
  if ($actualHex -ne $expectedHex) {
    throw "$Label codepoints mismatch. Expected $expectedHex, got $actualHex"
  }
}

$laUmmah = Select-TokenRow -WorkId 'orot' -Surface $laUmmahSurface
if ($null -eq $laUmmah) {
  throw "Expected lexical disambiguation canary token not found: la-ummah"
}
$laUmmahEntry = $entriesById[[string]$laUmmah.lexicon_entry_id]
if ($null -eq $laUmmahEntry) {
  throw "Expected lexical disambiguation canary entry not found for token: la-ummah"
}
$likelyLaUmmah = @($laUmmahEntry.possible_entries | Where-Object { $_.context_role -eq 'likely_contextual' }) | Select-Object -First 1
if ($null -eq $likelyLaUmmah -or $likelyLaUmmah.lemma -ne $ummahLemma -or -not (@($likelyLaUmmah.strict_renderings) -contains 'nation')) {
  throw "Expected la-ummah to keep ummah/nation as the likely contextual entry."
}
$mergedBadRenderings = @($laUmmahEntry.strict_renderings | Where-Object { $_ -match 'maid|slave|mother|nut|cubit' })
if ($mergedBadRenderings.Count -gt 0) {
  throw "la-ummah top-level renderings still merge unrelated homographs: $($mergedBadRenderings -join ', ')"
}
$otherLaUmmah = @($laUmmahEntry.possible_entries | Where-Object { $_.context_role -eq 'other_possible' })
if ($otherLaUmmah.Count -lt 1) {
  throw "Expected la-ummah homographs to remain available as other possible entries."
}
$expectedSurfaceRenderings = @('to the nation', 'for the nation', 'belonging to the nation', 'of the nation')
if ($laUmmah.surface_transliteration -ne 'la-ummah') {
  throw "Expected la-ummah token row to preserve full-form transliteration la-ummah."
}
foreach ($rendering in $expectedSurfaceRenderings) {
  if (-not (@($laUmmah.surface_renderings) -contains $rendering)) {
    throw "Expected la-ummah full surface rendering missing: $rendering"
  }
}
if ($laUmmah.surface_context_status -ne 'resolved_prefix_base') {
  throw "Expected la-ummah to be resolved as prefix plus base, not lemma-only."
}
$laUmmahBreakdown = @($laUmmah.breakdown)
if ($laUmmahBreakdown.Count -ne 2) {
  throw "Expected la-ummah breakdown to contain prefix and base rows."
}
$expectedPrefix = -join @([char]0x05DC, [char]0x05B8, [char]0x05BE)
$expectedBase = -join @([char]0x05D0, [char]0x05BB, [char]0x05DE, [char]0x05B8, [char]0x05BC, [char]0x05D4)
if ($laUmmahBreakdown[0].hebrew -ne $expectedPrefix -or -not (@($laUmmahBreakdown[0].strict_renderings) -contains 'to') -or -not (@($laUmmahBreakdown[0].strict_renderings) -contains 'for')) {
  throw "Expected la-ummah first breakdown row to preserve lamed-prefix meanings."
}
if ($laUmmahBreakdown[1].hebrew -ne $expectedBase -or -not (@($laUmmahBreakdown[1].strict_renderings) -contains 'nation') -or -not (@($laUmmahBreakdown[1].strict_renderings) -contains 'people')) {
  throw "Expected la-ummah second breakdown row to preserve ummah as nation/people."
}

$betor = Select-TokenRow -WorkId 'orot' -Surface $betorSurface
if ($null -eq $betor) {
  throw "Expected fixed-expression token not found: betor"
}
Assert-Codepoints -Label 'betor clicked token' -Value $betor.surface_word -Expected @(0x05D1, 0x05B0, 0x05BC, 0x05EA, 0x05D5, 0x05B9, 0x05E8)
if ($betor.normalized_word -ne $betorNormalized -or $betor.surface_context_status -ne 'resolved_fixed_expression') {
  throw "Expected betor to resolve through the fixed-expression layer before normal lemma fallback."
}
foreach ($rendering in @('as', 'in the capacity of', 'in the role of')) {
  if (-not (@($betor.surface_renderings) -contains $rendering)) {
    throw "Expected betor fixed-expression rendering missing: $rendering"
  }
}
$betorBreakdown = @($betor.breakdown)
if ($betorBreakdown.Count -ne 2) {
  throw "Expected betor breakdown to contain prefix and base rows."
}
Assert-Codepoints -Label 'betor prefix breakdown' -Value $betorBreakdown[0].hebrew -Expected @(0x05D1, 0x05B0, 0x05BC, 0x05BE)
Assert-Codepoints -Label 'betor base breakdown' -Value $betorBreakdown[1].hebrew -Expected @(0x05EA, 0x05D5, 0x05B9, 0x05E8)
$betorEntry = $entriesById[[string]$betor.lexicon_entry_id]
if ($null -eq $betorEntry -or $betorEntry.hebrew_word -ne $betorNormalized -or $betorEntry.disambiguation_status -ne 'likely') {
  throw "Expected betor lexicon entry to be a likely fixed-expression entry."
}
$betorLikely = @($betorEntry.possible_entries | Where-Object { $_.context_role -eq 'likely_contextual' }) | Select-Object -First 1
if ($null -eq $betorLikely -or $betorLikely.lemma -ne $betorNormalized -or -not (@($betorLikely.strict_renderings) -contains 'as')) {
  throw "Expected betor likely contextual entry to be the fused expression, not the base noun."
}
if (@($betorEntry.source_rows).Count -ne 1 -or @($betorEntry.source_rows)[0].source_family -ne 'workspace') {
  throw "Expected betor fixed-expression entry to use only the workspace expression source row."
}

$shel = Select-TokenRow -WorkId 'orot' -Normalized $shelNormalized
if ($null -eq $shel) {
  throw "Expected grammar particle token not found: shel"
}
if ($shel.status -ne 'matched' -or $shel.match_method -ne 'direct') {
  throw "Expected shel to resolve directly through the workspace grammar-particle rule."
}
foreach ($rendering in @('of', 'belonging to')) {
  if (-not (@($shel.surface_renderings) -contains $rendering)) {
    throw "Expected shel grammar-particle rendering missing: $rendering"
  }
}
$shelEntry = $entriesById[[string]$shel.lexicon_entry_id]
$shelSourceId = "grammar-particle:$shelNormalized"
if ($null -eq $shelEntry -or @($shelEntry.source_rows).Count -ne 1 -or @($shelEntry.source_rows)[0].source_id -ne $shelSourceId) {
  throw "Expected shel lexicon entry to use only the workspace grammar-particle source row."
}

$rakNormalized = -join @([char]0x05E8, [char]0x05E7)
$rak = Select-TokenRow -WorkId 'orot' -Normalized $rakNormalized
if ($null -eq $rak -or $rak.status -ne 'matched') {
  throw "Expected rak canary to remain matched."
}
$rakEntry = $entriesById[[string]$rak.lexicon_entry_id]
$rakVisibleRenderings = @($rak.surface_renderings) + @($rakEntry.strict_renderings)
foreach ($rendering in @('only', 'merely', 'just')) {
  if (-not ($rakVisibleRenderings -contains $rendering)) {
    throw "Expected rak strict Hebrew rendering missing: $rendering"
  }
}

$delaNormalized = -join @([char]0x05D3, [char]0x05DC, [char]0x05D0)
$dela = Select-TokenRow -Normalized $delaNormalized
if ($null -eq $dela -or $dela.status -ne 'matched') {
  throw "Expected dela Aramaic canary to remain matched."
}
$delaEntry = $entriesById[[string]$dela.lexicon_entry_id]
if ($null -eq $delaEntry -or -not (@($delaEntry.source_rows)[0].source_id -eq 'project-aramaic:dela')) {
  throw "Expected dela to resolve through the project Aramaic grammar layer."
}
foreach ($rendering in @('that not', 'which does not', 'without')) {
  $delaVisibleRenderings = @($dela.surface_renderings) + @($delaEntry.strict_renderings)
  if (-not ($delaVisibleRenderings -contains $rendering)) {
    throw "Expected dela strict Aramaic rendering missing: $rendering"
  }
}

$pnimiyutNormalized = -join @([char]0x05E4, [char]0x05E0, [char]0x05D9, [char]0x05DE, [char]0x05D9, [char]0x05D5, [char]0x05EA)
$pnimiyut = Select-TokenRow -WorkId 'orot' -Normalized $pnimiyutNormalized
if ($null -eq $pnimiyut -or $pnimiyut.status -ne 'matched' -or $pnimiyut.match_method -ne 'project_orot_technical') {
  throw "Expected pnimiyut to resolve through the Orot technical term layer."
}
$pnimiyutEntry = $entriesById[[string]$pnimiyut.lexicon_entry_id]
$pnimiyutVisibleRenderings = @($pnimiyut.surface_renderings) + @($pnimiyutEntry.strict_renderings)
foreach ($rendering in @('inner', 'internal', 'inward')) {
  if (-not ($pnimiyutVisibleRenderings -contains $rendering)) {
    throw "Expected pnimiyut strict Hebrew rendering missing: $rendering"
  }
}

$bSegulotSurface = -join @([char]0x05D1, [char]0x05B4, [char]0x05BC, [char]0x05E1, [char]0x05B0, [char]0x05D2, [char]0x05BB, [char]0x05DC, [char]0x05D5, [char]0x05B9, [char]0x05EA)
$bSegulot = Select-TokenRow -WorkId 'orot' -Surface $bSegulotSurface
if ($null -eq $bSegulot -or $bSegulot.status -ne 'matched' -or $bSegulot.match_method -ne 'project_orot_technical') {
  throw "Expected bisegulot to resolve through the Orot technical term layer."
}
Assert-Codepoints -Label 'bisegulot surface' -Value $bSegulot.surface_word -Expected @(0x05D1, 0x05B4, 0x05BC, 0x05E1, 0x05B0, 0x05D2, 0x05BB, 0x05DC, 0x05D5, 0x05B9, 0x05EA)
foreach ($rendering in @('with qualities', 'with properties', 'in qualities', 'by qualities')) {
  if (-not (@($bSegulot.surface_renderings) -contains $rendering)) {
    throw "Expected bisegulot strict Hebrew surface rendering missing: $rendering"
  }
}
$bSegulotBreakdown = @($bSegulot.breakdown)
if ($bSegulotBreakdown.Count -ne 2) {
  throw "Expected bisegulot breakdown to contain prefix and base rows."
}
Assert-Codepoints -Label 'bisegulot prefix breakdown' -Value $bSegulotBreakdown[0].hebrew -Expected @(0x05D1, 0x05B4, 0x05BC, 0x05BE)
Assert-Codepoints -Label 'bisegulot base breakdown' -Value $bSegulotBreakdown[1].hebrew -Expected @(0x05E1, 0x05B0, 0x05D2, 0x05BB, 0x05DC, 0x05D5, 0x05B9, 0x05EA)
foreach ($rendering in @('qualities', 'properties', 'special qualities')) {
  if (-not (@($bSegulotBreakdown[1].strict_renderings) -contains $rendering)) {
    throw "Expected bisegulot base breakdown rendering missing: $rendering"
  }
}

foreach ($canary in $openingCanaryGroup) {
  $row = Select-TokenRow -WorkId 'orot' -Surface $canary.Surface
  if ($null -eq $row) {
    throw "Expected Orot opening canary token not found: $($canary.Label)"
  }
  Assert-Codepoints -Label "opening canary $($canary.Label)" -Value $row.surface_word -Expected $canary.Codepoints
  if ($row.normalized_word -ne $canary.Normalized) {
    throw "Opening canary $($canary.Label) normalized key mismatch. Expected $($canary.Normalized), got $($row.normalized_word)"
  }
  if ($row.status -ne 'matched' -or -not $row.lexicon_entry_id) {
    throw "Opening canary $($canary.Label) is not matched."
  }
  $entry = $entriesById[[string]$row.lexicon_entry_id]
  if ($null -eq $entry) {
    throw "Opening canary $($canary.Label) references missing lexicon entry: $($row.lexicon_entry_id)"
  }
  $likely = @($entry.possible_entries | Where-Object { $_.context_role -eq 'likely_contextual' }) | Select-Object -First 1
  if ($null -eq $likely -or $likely.entry_key -ne $canary.LikelyEntryKey) {
    throw "Opening canary $($canary.Label) likely entry mismatch. Expected $($canary.LikelyEntryKey)."
  }
  $visibleRenderings = @($row.surface_renderings) + @($entry.strict_renderings) + @($likely.strict_renderings)
  foreach ($rendering in @($canary.Renderings)) {
    if (-not ($visibleRenderings -contains $rendering)) {
      throw "Opening canary $($canary.Label) missing visible rendering: $rendering"
    }
  }
}

$orotHtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
if (Test-Path -LiteralPath $orotHtmlPath) {
  $orotHtml = Get-Content -LiteralPath $orotHtmlPath -Raw -Encoding UTF8
  foreach ($requiredExternalMarker in @('data-lexical-config>', 'loadTokenRow', 'chunkPromises', 'fetchJson')) {
    if (-not $orotHtml.Contains($requiredExternalMarker)) {
      throw "Orot page missing external lexical payload marker: $requiredExternalMarker"
    }
  }
  foreach ($forbiddenEmbeddedMarker in @('data-lexical-token-index>', 'data-lexical-lexicon>')) {
    if ($orotHtml.Contains($forbiddenEmbeddedMarker)) {
      throw "Orot page still embeds full lexical payload marker: $forbiddenEmbeddedMarker"
    }
  }

  $manifestPath = Join-Path $PSScriptRoot '..\data\lexical\orot.manifest.json'
  if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Required external Orot lexical payload manifest not found: $manifestPath"
  }
  $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if (@($manifest.chunks).Count -lt 2) {
    throw "Expected Orot lexical payload to be split into multiple external chunks."
  }
  $chunkCache = @{}
  function Get-ChunkForTokenRow {
    param([object]$TokenRow)

    $tokenId = [string]$TokenRow.token_index_id
    if ($manifest.token_chunks.PSObject.Properties.Name -notcontains $tokenId) {
      throw "Orot manifest does not map token to a chunk: $tokenId"
    }
    $chunkId = [string]$manifest.token_chunks.$tokenId
    if (-not $chunkCache.ContainsKey($chunkId)) {
      $chunkMeta = @($manifest.chunks | Where-Object { $_.chunk_id -eq $chunkId }) | Select-Object -First 1
      if ($null -eq $chunkMeta -or -not $chunkMeta.url) {
        throw "Orot manifest chunk metadata missing for chunk: $chunkId"
      }
      $chunkPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$chunkMeta.url)
      if (-not (Test-Path -LiteralPath $chunkPath)) {
        throw "Required external Orot lexical payload chunk not found: $chunkPath"
      }
      $chunkCache[$chunkId] = Get-Content -LiteralPath $chunkPath -Raw -Encoding UTF8 | ConvertFrom-Json
    }
    return $chunkCache[$chunkId]
  }

  $chunk = Get-ChunkForTokenRow -TokenRow $laUmmah
  $pageTokenIndex = $chunk.token_index
  $pageLaUmmah = @($pageTokenIndex.forms | Where-Object { $_.token_index_id -eq $laUmmah.token_index_id }) | Select-Object -First 1
  if ($null -eq $pageLaUmmah) {
    throw "Orot manifest does not map la-ummah token to a chunk."
  }

  $pageLexicon = $chunk.lexicon
  $pageSourceRows = $chunk.source_rows
  $pageLaUmmahEntry = @($pageLexicon.entries | Where-Object { $_.entry_id -eq $pageLaUmmah.lexicon_entry_id }) | Select-Object -First 1
  $pageLaUmmahSources = @($pageLaUmmahEntry.source_row_ids | ForEach-Object { $pageSourceRows.PSObject.Properties[[string]$_].Value })
  if ($pageLaUmmahSources.Count -ne 1 -or $pageLaUmmahSources[0].source_id -ne 'L63772') {
    throw "Expected la-ummah external default source rows to include only Wikidata L63772."
  }
  foreach ($noise in @('L65883', 'L204490', 'H519', 'H520', 'H522', 'H4965')) {
    if ($orotHtml.Contains($noise) -and @($pageLaUmmahSources.source_id) -contains $noise) {
      throw "la-ummah default sources still include noisy candidate: $noise"
    }
  }

  $chunk = Get-ChunkForTokenRow -TokenRow $betor
  $pageTokenIndex = $chunk.token_index
  $pageLexicon = $chunk.lexicon
  $pageSourceRows = $chunk.source_rows
  $pageBetor = @($pageTokenIndex.forms | Where-Object { $_.token_index_id -eq $betor.token_index_id }) | Select-Object -First 1
  if ($null -eq $pageBetor) {
    throw "Orot manifest does not map betor token to a chunk."
  }
  Assert-Codepoints -Label 'page betor clicked token' -Value $pageBetor.surface_word -Expected @(0x05D1, 0x05B0, 0x05BC, 0x05EA, 0x05D5, 0x05B9, 0x05E8)
  Assert-Codepoints -Label 'page betor prefix breakdown' -Value @($pageBetor.breakdown)[0].hebrew -Expected @(0x05D1, 0x05B0, 0x05BC, 0x05BE)
  Assert-Codepoints -Label 'page betor base breakdown' -Value @($pageBetor.breakdown)[1].hebrew -Expected @(0x05EA, 0x05D5, 0x05B9, 0x05E8)
  $pageBetorEntry = @($pageLexicon.entries | Where-Object { $_.entry_id -eq $pageBetor.lexicon_entry_id }) | Select-Object -First 1
  if ($null -eq $pageBetorEntry -or @($pageBetorEntry.possible_entries).Count -ne 1 -or @($pageBetorEntry.secondary_source_row_ids).Count -ne 0) {
    throw "Expected generated betor payload to expose only the fixed-expression contextual entry by default."
  }
  $pageBetorSources = @($pageBetorEntry.source_row_ids | ForEach-Object { $pageSourceRows.PSObject.Properties[[string]$_].Value })
  if ($pageBetorSources.Count -ne 1 -or $pageBetorSources[0].source_family -ne 'workspace') {
    throw "Expected generated betor payload sources to be limited to the workspace fixed-expression rule."
  }
}

function Test-LexicalSample {
  param([object]$Sample)

  foreach ($path in @($Sample.HtmlPath, $Sample.OccurrencePath)) {
    if (-not (Test-Path -LiteralPath $path)) {
      throw "Required lexical validation file not found for $($Sample.Label): $path"
    }
  }

  $occurrences = Get-Content -LiteralPath $Sample.OccurrencePath -Raw -Encoding UTF8 | ConvertFrom-Json
  $unitOccurrence = $occurrences.units.PSObject.Properties[$Sample.UnitId].Value
  if ($null -eq $unitOccurrence) {
    throw "Unit occurrence not found for $($Sample.Label): $($Sample.UnitId)"
  }

  $expectedTokenIndexIds = @()
  foreach ($paragraph in @($unitOccurrence.paragraphs)) {
    if ($paragraph.PSObject.Properties.Name -contains 'tokens') {
      throw "Unit occurrence still contains verbose token objects for $($Sample.Label): $($Sample.UnitId)"
    }
    if ($paragraph.PSObject.Properties.Name -notcontains 'token_index_ids') {
      throw "Unit occurrence paragraph missing token_index_ids for $($Sample.Label): $($Sample.UnitId)"
    }
    foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
      $expectedTokenIndexIds += [string]$tokenIndexId
    }
  }
  if ($expectedTokenIndexIds.Count -eq 0) {
    throw "Unit occurrence has no lexical tokens for $($Sample.Label): $($Sample.UnitId)"
  }

  foreach ($tokenIndexId in $expectedTokenIndexIds) {
    if (-not $tokenRows.ContainsKey($tokenIndexId)) {
      throw "Unit occurrence references missing token_index_id $tokenIndexId for $($Sample.Label): $($Sample.UnitId)"
    }
    $tokenRow = $tokenRows[$tokenIndexId]
    if ($tokenRow.status -eq 'matched' -and -not $entryIds.ContainsKey([string]$tokenRow.lexicon_entry_id)) {
      throw "Matched token index row references missing lexicon_entry_id $($tokenRow.lexicon_entry_id): $tokenIndexId"
    }
  }

  if ($Sample.PSObject.Properties.Name -contains 'ManifestPath') {
    if (-not (Test-Path -LiteralPath $Sample.ManifestPath)) {
      throw "Required lexical manifest not found for $($Sample.Label): $($Sample.ManifestPath)"
    }
    $sampleManifest = Get-Content -LiteralPath $Sample.ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $firstTokenId = [string]$expectedTokenIndexIds[0]
    if ($sampleManifest.token_chunks.PSObject.Properties.Name -notcontains $firstTokenId) {
      throw "Manifest does not map first sample token to a chunk for $($Sample.Label): $firstTokenId"
    }
    $sampleChunkId = [string]$sampleManifest.token_chunks.$firstTokenId
    $sampleChunkMeta = @($sampleManifest.chunks | Where-Object { $_.chunk_id -eq $sampleChunkId }) | Select-Object -First 1
    if ($null -eq $sampleChunkMeta -or -not $sampleChunkMeta.url) {
      throw "Manifest chunk metadata missing for $($Sample.Label): $sampleChunkId"
    }
    $sampleChunkPath = Join-Path (Join-Path $PSScriptRoot '..\data\lexical') ([string]$sampleChunkMeta.url)
    if (-not (Test-Path -LiteralPath $sampleChunkPath)) {
      throw "Required lexical chunk not found for $($Sample.Label): $sampleChunkPath"
    }
  }

  $html = Get-Content -LiteralPath $Sample.HtmlPath -Raw -Encoding UTF8
  $escapedUnitId = [regex]::Escape($Sample.UnitId)
  $unitPattern = "(?s)<section class=""unit"" id=""$escapedUnitId""[\s\S]*?(?=<section class=""unit"" id=""|</main>)"
  $unitMatch = [regex]::Match($html, $unitPattern)
  if (-not $unitMatch.Success) {
    throw "Unit section not found in generated page for $($Sample.Label): $($Sample.UnitId)"
  }

  if (-not $unitMatch.Value.Contains('data-lexical-paragraph')) {
    throw "Generated unit is missing lexical paragraph markers for $($Sample.Label): $($Sample.UnitId)"
  }

  if ($unitMatch.Value.Contains('data-lexical-token')) {
    throw "Generated HTML contains pre-rendered lexical token spans for $($Sample.Label); wrapping should happen client-side."
  }

  foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-config', 'data-lexical-slot', 'data-lexical-hud', 'data-hud-breakdown', 'Potential options', 'Related options', 'Show potential options', 'Show related options')) {
    if (-not $html.Contains($requiredPattern)) {
      throw "Generated page missing lexical renderer marker for $($Sample.Label): $requiredPattern"
    }
  }
  if (-not ($html.Contains('data-hud-hebrew-strict') -or $html.Contains('data-hud-surface-renderings'))) {
    throw "Generated page missing lexical strict-rendering marker for $($Sample.Label)"
  }
  foreach ($forbiddenHudPattern in @('data-hud-transliteration', 'data-hud-root', 'data-hud-root-transliteration', 'data-hud-root-meaning')) {
    if ($html.Contains($forbiddenHudPattern)) {
      throw "Generated page still foregrounds removed HUD field for $($Sample.Label): $forbiddenHudPattern"
    }
  }

  foreach ($requiredRendererText in @('.lexical-word { display: inline;', 'direction: inherit;', 'unicode-bidi: normal;', 'span.dataset.lexicalIndex = tokenIndexId || "";', 'const tokenRow = await loadTokenRow(button.dataset.lexicalIndex);', 'const groupedEntries = new Map();')) {
    if (-not $html.Contains($requiredRendererText)) {
      throw "Generated page missing global bidi-safe lexical renderer rule for $($Sample.Label): $requiredRendererText"
    }
  }

  foreach ($forbiddenRendererText in @('.lexical-word { display: inline-block;', 'unicode-bidi: isolate;', 'span.dir = "rtl";', 'white-space: nowrap;')) {
    if ($html.Contains($forbiddenRendererText)) {
      throw "Generated page still contains token-level bidi isolating renderer rule for $($Sample.Label): $forbiddenRendererText"
    }
  }

  if ($html.Contains('data-lexical-json')) {
    throw "Generated page still contains stale per-occurrence lexical JSON for $($Sample.Label)."
  }

  return [pscustomobject]@{
    Label = $Sample.Label
    UnitId = $Sample.UnitId
    TokenCount = $expectedTokenIndexIds.Count
  }
}

$results = foreach ($sample in $samples) {
  Test-LexicalSample -Sample $sample
}

$summary = ($results | ForEach-Object { "$($_.Label): $($_.TokenCount) indexed token occurrences" }) -join '; '
Write-Host "Lexical DOM validation passed. $summary."
