$ErrorActionPreference = 'Stop'

$samples = @(
  [pscustomobject]@{
    Label = 'Orot 70:5 HUD canary'
    UnitId = 'orot-lights-from-darkness-lights-of-rebirth-70-5'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
  },
  [pscustomobject]@{
    Label = 'Orot punctuation sample'
    UnitId = 'orot-lights-from-darkness-war-1-1'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
  },
  [pscustomobject]@{
    Label = 'Orot Land of Israel punctuation sample'
    UnitId = 'orot-lights-from-darkness-land-of-israel-1-2'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
  },
  [pscustomobject]@{
    Label = 'Orot non-Lights-from-Darkness sample'
    UnitId = 'orot-the-process-of-ideals-in-israel-the-godly-and-the-national-ideal-in-the-individual-1'
    HtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
    OccurrencePath = Join-Path $PSScriptRoot '..\data\lexical\occurrences\orot.json'
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
$tokenRows = @{}
foreach ($row in @($tokenIndex.forms)) {
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

$laUmmah = @($tokenIndex.forms | Where-Object { $_.surface_word -eq $laUmmahSurface }) | Select-Object -First 1
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

$betor = @($tokenIndex.forms | Where-Object { $_.surface_word -eq $betorSurface }) | Select-Object -First 1
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

$shel = @($tokenIndex.forms | Where-Object { $_.normalized_word -eq $shelNormalized }) | Select-Object -First 1
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

foreach ($canary in $openingCanaryGroup) {
  $row = @($tokenIndex.forms | Where-Object { $_.surface_word -eq $canary.Surface }) | Select-Object -First 1
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
  if (@($pageLaUmmahEntry.secondary_source_row_ids).Count -ne 0) {
    throw "Expected la-ummah external secondary source rows to be empty after noise filtering."
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

  foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-config', 'data-lexical-slot', 'data-lexical-hud', 'data-hud-surface-renderings', 'data-hud-breakdown', 'Show other possible entries')) {
    if (-not $html.Contains($requiredPattern)) {
      throw "Generated page missing lexical renderer marker for $($Sample.Label): $requiredPattern"
    }
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
