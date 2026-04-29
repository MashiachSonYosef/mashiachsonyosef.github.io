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
$entryIds = @{}
$entriesById = @{}
foreach ($entry in @($lexicon.entries)) {
  $entryIds[[string]$entry.entry_id] = $true
  $entriesById[[string]$entry.entry_id] = $entry
}

$laUmmahSurface = -join @([char]0x05DC, [char]0x05B8, [char]0x05D0, [char]0x05BB, [char]0x05DE, [char]0x05B8, [char]0x05BC, [char]0x05D4)
$ummahLemma = -join @([char]0x05D0, [char]0x05D5, [char]0x05DE, [char]0x05D4)
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

$orotHtmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
if (Test-Path -LiteralPath $orotHtmlPath) {
  $orotHtml = Get-Content -LiteralPath $orotHtmlPath -Raw -Encoding UTF8
  $tokenMarker = 'data-lexical-token-index>'
  $tokenStart = $orotHtml.IndexOf($tokenMarker)
  if ($tokenStart -lt 0) { throw "Orot page missing embedded token-index JSON." }
  $tokenStart += $tokenMarker.Length
  $tokenEnd = $orotHtml.IndexOf('</script>', $tokenStart)
  $pageTokenIndex = $orotHtml.Substring($tokenStart, $tokenEnd - $tokenStart) | ConvertFrom-Json
  $pageLaUmmah = @($pageTokenIndex.forms | Where-Object { $_.surface_word -eq $laUmmahSurface }) | Select-Object -First 1

  $lexiconMarker = 'data-lexical-lexicon>'
  $lexiconStart = $orotHtml.IndexOf($lexiconMarker)
  if ($lexiconStart -lt 0) { throw "Orot page missing embedded lexicon JSON." }
  $lexiconStart += $lexiconMarker.Length
  $lexiconEnd = $orotHtml.IndexOf('</script>', $lexiconStart)
  $pageLexicon = $orotHtml.Substring($lexiconStart, $lexiconEnd - $lexiconStart) | ConvertFrom-Json
  $pageLaUmmahEntry = @($pageLexicon.entries | Where-Object { $_.entry_id -eq $pageLaUmmah.lexicon_entry_id }) | Select-Object -First 1
  $pageLaUmmahSources = @($pageLaUmmahEntry.source_rows)
  if ($pageLaUmmahSources.Count -ne 1 -or $pageLaUmmahSources[0].source_id -ne 'L63772') {
    throw "Expected la-ummah embedded default source rows to include only Wikidata L63772."
  }
  if (@($pageLaUmmahEntry.secondary_source_rows).Count -ne 0) {
    throw "Expected la-ummah embedded secondary source rows to be empty after noise filtering."
  }
  foreach ($noise in @('L65883', 'L204490', 'H519', 'H520', 'H522', 'H4965')) {
    if ($orotHtml.Contains($noise) -and @($pageLaUmmahSources.source_id) -contains $noise) {
      throw "la-ummah default sources still include noisy candidate: $noise"
    }
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

  foreach ($requiredPattern in @('data-lexical-occurrences', 'data-lexical-token-index', 'data-lexical-lexicon', 'data-lexical-slot', 'data-lexical-hud', 'data-hud-surface-renderings', 'data-hud-breakdown', 'Show other possible entries')) {
    if (-not $html.Contains($requiredPattern)) {
      throw "Generated page missing lexical renderer marker for $($Sample.Label): $requiredPattern"
    }
  }
  foreach ($forbiddenHudPattern in @('data-hud-transliteration', 'data-hud-root', 'data-hud-root-transliteration', 'data-hud-root-meaning')) {
    if ($html.Contains($forbiddenHudPattern)) {
      throw "Generated page still foregrounds removed HUD field for $($Sample.Label): $forbiddenHudPattern"
    }
  }

  foreach ($requiredRendererText in @('.lexical-word { display: inline;', 'direction: inherit;', 'unicode-bidi: normal;', 'span.dataset.lexicalIndex = tokenIndexId || "";', 'const tokenRow = tokenRows.get(button.dataset.lexicalIndex) || {};', 'const groupedEntries = new Map();')) {
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
