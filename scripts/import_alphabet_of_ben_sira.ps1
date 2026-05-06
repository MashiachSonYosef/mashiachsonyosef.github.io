param(
  [string]$OutputDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays'
)

$ErrorActionPreference = 'Stop'

function Write-Utf8Json {
  param(
    [string]$Path,
    [object]$Value
  )

  $parent = Split-Path -Path $Path -Parent
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  $json = $Value | ConvertTo-Json -Depth 40
  [System.IO.File]::WriteAllText((Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf), $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-Utf8Json {
  param([string]$Uri)

  try {
    $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing
    $stream = $response.RawContentStream
    $stream.Position = 0
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
    $json = $reader.ReadToEnd()
    $reader.Dispose()
  } catch {
    $previousUri = $env:SEFARIA_URI
    $env:SEFARIA_URI = $Uri
    $nodeScript = @'
const uri = process.env.SEFARIA_URI;
fetch(uri)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return response.text();
  })
  .then((text) => process.stdout.write(text))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
'@
    $jsonLines = & node -e $nodeScript
    if ($null -eq $previousUri) { Remove-Item Env:\SEFARIA_URI -ErrorAction SilentlyContinue } else { $env:SEFARIA_URI = $previousUri }
    if ($LASTEXITCODE -ne 0) { throw "Unable to fetch $Uri through Invoke-WebRequest or Node fetch." }
    $json = $jsonLines -join "`n"
  }

  return $json | ConvertFrom-Json
}

function Get-SefariaText {
  param([string]$Ref)

  $encodedRef = [System.Uri]::EscapeDataString($Ref)
  Get-Utf8Json -Uri "https://www.sefaria.org/api/texts/$encodedRef`?context=0&commentary=0"
}

function Get-HebrewVersionMeta {
  param([object]$Payload)

  $version = @($Payload.versions | Where-Object { $_.language -eq 'he' } | Select-Object -First 1)[0]
  [ordered]@{
    license = if ($Payload.heLicense) { $Payload.heLicense } elseif ($version -and $version.license) { $version.license } else { 'unknown' }
    version_title = if ($Payload.heVersionTitle) { $Payload.heVersionTitle } elseif ($version -and $version.versionTitle) { $version.versionTitle } else { 'unknown' }
    version_source = if ($Payload.heVersionSource) { $Payload.heVersionSource } elseif ($version -and $version.versionSource) { $version.versionSource } else { '' }
  }
}

$workId = 'alphabet-of-ben-sira'
$workTitle = 'Alphabet of Ben Sira'
$workSlug = 'midrash/alphabet-of-ben-sira'
$importDate = (Get-Date).ToString('yyyy-MM-dd')

$sections = @(
  [ordered]@{
    title = 'Introduction'
    he_title = ''
    slug = 'introduction'
    ref = 'Otzar Midrashim, The Aleph Bet of ben Sira, Introduction'
    chapter = $null
  },
  [ordered]@{
    title = 'Alphabet of Ben Sira'
    he_title = ''
    slug = 'main-text'
    ref = 'Otzar Midrashim, The Aleph Bet of ben Sira 1'
    chapter = 1
  },
  [ordered]@{
    title = 'Alternative Version'
    he_title = ''
    slug = 'alternative-version'
    ref = 'Otzar Midrashim, The Aleph Bet of ben Sira, The Alphabet of ben Sira, (alternative version)'
    chapter = $null
  }
)

$units = New-Object System.Collections.Generic.List[object]
$outlineSections = New-Object System.Collections.Generic.List[object]
$sequence = 0

foreach ($section in $sections) {
  Write-Host "Importing $($section.ref)"
  $payload = Get-SefariaText -Ref $section.ref
  $versionMeta = Get-HebrewVersionMeta -Payload $payload
  if ($versionMeta.license -ne 'Public Domain') {
    throw "Unsupported Hebrew source license '$($versionMeta.license)' for $($section.ref)"
  }

  $outlineSections.Add([ordered]@{
    section_title = $section.title
    section_he_title = $section.he_title
    section_slug = $section.slug
    section_ref = $payload.ref
    node_depth = if ($section.chapter) { 2 } else { 1 }
  })

  $paragraphs = @($payload.he | Where-Object { $_ -and $_.ToString().Trim() })
  for ($i = 0; $i -lt $paragraphs.Count; $i += 1) {
    $sequence += 1
    $paragraphNumber = $i + 1
    $unitSuffix = if ($section.chapter) { "$($section.chapter)-$paragraphNumber" } else { "$($section.slug)-$paragraphNumber" }
    $sourceRef = if ($section.chapter) { "$($payload.ref):$paragraphNumber" } else { "$($payload.ref):$paragraphNumber" }
    $unitId = "$workId-$($section.slug)-$unitSuffix"

    $units.Add([ordered]@{
      work_id = $workId
      work_title = $workTitle
      group_title = $workTitle
      group_he_title = ''
      group_slug = 'alphabet-of-ben-sira'
      section_title = $section.title
      section_he_title = $section.he_title
      section_slug = $section.slug
      chapter_number = $section.chapter
      paragraph_number = $paragraphNumber
      sequence = $sequence
      unit_id = $unitId
      anchor_id = $unitId
      source_ref = $sourceRef
      sefaria_ref = $sourceRef
      hebrew = @($paragraphs[$i].ToString().Trim())
      license = $versionMeta.license
      version_title = $versionMeta.version_title
      version_source = $versionMeta.version_source
      digitization = 'Sefaria API'
      source_url = "https://www.sefaria.org/$($sourceRef -replace ' ', '_' -replace ',', '%2C')"
      import_date = $importDate
    })
  }
}

$source = [ordered]@{
  work_id = $workId
  work_title = $workTitle
  work_slug = $workSlug
  sefaria_ref = 'Otzar Midrashim, The Aleph Bet of ben Sira'
  work_type = 'primary_text'
  source_system = 'Sefaria API'
  source_base_url = 'https://www.sefaria.org/api/'
  import_date = $importDate
  outline = @([ordered]@{
    group_title = $workTitle
    group_he_title = ''
    group_slug = 'alphabet-of-ben-sira'
    sections = $outlineSections.ToArray()
  })
  units = $units.ToArray()
}

Write-Utf8Json -Path (Join-Path $OutputDir "$workId.json") -Value $source

$overlayPath = Join-Path $OverlayDir "$workId.json"
if (-not (Test-Path $overlayPath)) {
  Write-Utf8Json -Path $overlayPath -Value ([ordered]@{
    work_id = $workId
    units = @{}
  })
}

Write-Host "Imported $($units.Count) Alphabet of Ben Sira units."
