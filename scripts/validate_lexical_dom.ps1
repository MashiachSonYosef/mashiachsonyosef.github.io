$ErrorActionPreference = 'Stop'

$unitId = 'orot-lights-from-darkness-lights-of-rebirth-70-5'
$htmlPath = Join-Path $PSScriptRoot '..\orot\index.html'
$lexicalPath = Join-Path $PSScriptRoot '..\data\lexical\orot-lights-from-darkness-lights-of-rebirth-70-5.json'

$expectedCodepoints = @(
  @('05D3', '05F3'),
  @('05E8', '05D5', '05D7'),
  @('05D0', '05E4', '05E0', '05D5'),
  @('05DE', '05E9', '05D9', '05D7')
)

function Get-Codepoints {
  param([string]$Text)

  $points = @()
  foreach ($char in $Text.ToCharArray()) {
    $points += ('{0:X4}' -f [int][char]$char)
  }
  return $points
}

function Assert-Codepoints {
  param(
    [string]$Label,
    [string[]]$Actual,
    [string[]]$Expected
  )

  $actualJoined = ($Actual -join ' ')
  $expectedJoined = ($Expected -join ' ')
  if ($actualJoined -ne $expectedJoined) {
    throw "$Label codepoint mismatch. Expected [$expectedJoined], got [$actualJoined]."
  }
}

if (-not (Test-Path -LiteralPath $htmlPath)) {
  throw "Generated Orot page not found: $htmlPath"
}
if (-not (Test-Path -LiteralPath $lexicalPath)) {
  throw "Lexical sample data not found: $lexicalPath"
}

$lexical = Get-Content -LiteralPath $lexicalPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lexicalWords = @($lexical.words)
if ($lexicalWords.Count -ne 4) {
  throw "Expected 4 lexical sample words, found $($lexicalWords.Count)."
}

for ($i = 0; $i -lt $expectedCodepoints.Count; $i++) {
  $actual = @(Get-Codepoints $lexicalWords[$i].hebrew_word)
  Assert-Codepoints "Lexical data word[$i]" $actual $expectedCodepoints[$i]
}

$html = Get-Content -LiteralPath $htmlPath -Raw -Encoding UTF8
$escapedUnitId = [regex]::Escape($unitId)
$unitPattern = "(?s)<section class=""unit"" id=""$escapedUnitId""[\s\S]*?(?=<section class=""unit"" id=""|</main>)"
$unitMatch = [regex]::Match($html, $unitPattern)
if (-not $unitMatch.Success) {
  throw "Unit section not found in generated Orot page: $unitId"
}

$spanPattern = '<span class="lexical-word"[^>]*data-lexical-token="[^"]+"[^>]*>(.*?)</span>'
$spanMatches = [regex]::Matches($unitMatch.Value, $spanPattern)
if ($spanMatches.Count -ne 4) {
  throw "Expected 4 generated lexical spans for $unitId, found $($spanMatches.Count)."
}

for ($i = 0; $i -lt $expectedCodepoints.Count; $i++) {
  $textContent = [System.Net.WebUtility]::HtmlDecode($spanMatches[$i].Groups[1].Value)
  $actual = @(Get-Codepoints $textContent)
  $expected = @(Get-Codepoints $lexicalWords[$i].hebrew_word)
  Assert-Codepoints "Generated DOM span[$i]" $actual $expected
}

Write-Host "Lexical DOM validation passed for $unitId."
