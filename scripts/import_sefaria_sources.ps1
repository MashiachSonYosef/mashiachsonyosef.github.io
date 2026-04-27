param(
  [string]$ConfigPath = 'data/work-imports.json',
  [string]$OutputDir = 'data/sources'
)

$ErrorActionPreference = 'Stop'

function New-Slug {
  param([string]$Text)
  $slug = $Text.ToLowerInvariant()
  $slug = $slug -replace '&', ' and '
  $slug = $slug -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if (-not $slug) { return 'section' }
  return $slug
}

function Read-Json {
  param([string]$Path)
  Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Write-Utf8Json {
  param(
    [string]$Path,
    [object]$Value
  )
  $parent = Split-Path -Path $Path -Parent
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  $json = $Value | ConvertTo-Json -Depth 30
  [System.IO.File]::WriteAllText((Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf), $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-Utf8Json {
  param([string]$Uri)

  $response = Invoke-WebRequest -Uri $Uri
  $stream = $response.RawContentStream
  $stream.Position = 0
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
  $json = $reader.ReadToEnd()
  $reader.Dispose()
  return $json | ConvertFrom-Json
}

function Get-SefariaIndex {
  param([string]$Ref)
  $encodedRef = [System.Uri]::EscapeDataString($Ref)
  Get-Utf8Json -Uri "https://www.sefaria.org/api/index/$encodedRef"
}

function Get-SefariaText {
  param([string]$Ref)
  $encodedRef = [System.Uri]::EscapeDataString($Ref)
  Get-Utf8Json -Uri "https://www.sefaria.org/api/texts/$encodedRef`?context=0&commentary=0"
}

function Get-PrimaryTitle {
  param(
    [object]$Node,
    [string]$Lang
  )
  $match = @($Node.titles | Where-Object { $_.lang -eq $Lang -and $_.primary } | Select-Object -First 1)[0]
  if ($match) { return $match.text }
  $fallback = @($Node.titles | Where-Object { $_.lang -eq $Lang } | Select-Object -First 1)[0]
  if ($fallback) { return $fallback.text }
  if ($Lang -eq 'he' -and $Node.heTitle) { return $Node.heTitle }
  if ($Node.title) { return $Node.title }
  if ($Node.key) { return $Node.key }
  return ''
}

function Get-HebrewParagraphs {
  param([object]$Value)
  if ($null -eq $Value) { return @() }
  if ($Value -is [string]) {
    if ($Value.Trim()) { return @($Value.Trim()) }
    return @()
  }

  $items = New-Object System.Collections.Generic.List[string]
  foreach ($child in @($Value)) {
    foreach ($paragraph in Get-HebrewParagraphs -Value $child) {
      $items.Add($paragraph)
    }
  }
  return @($items)
}

function Add-DepthOneUnits {
  param(
    [System.Collections.Generic.List[object]]$Units,
    [ref]$SequenceRef,
    [object]$Work,
    [hashtable]$GroupMeta,
    [hashtable]$SectionMeta,
    [object]$Payload
  )

  $paragraphs = Get-HebrewParagraphs -Value $Payload.he
  $paragraphNumber = 0
  foreach ($paragraph in $paragraphs) {
    $paragraphNumber += 1
    $SequenceRef.Value += 1
    $unitId = "$($Work.work_id)-$($GroupMeta.group_slug)-$($SectionMeta.section_slug)-$paragraphNumber"
    $Units.Add([ordered]@{
      work_id = $Work.work_id
      work_title = $Work.work_title
      group_title = $GroupMeta.group_title
      group_he_title = $GroupMeta.group_he_title
      group_slug = $GroupMeta.group_slug
      section_title = $SectionMeta.section_title
      section_he_title = $SectionMeta.section_he_title
      section_slug = $SectionMeta.section_slug
      chapter_number = $null
      paragraph_number = $paragraphNumber
      sequence = $SequenceRef.Value
      unit_id = $unitId
      anchor_id = $unitId
      source_ref = "$($Payload.ref):$paragraphNumber"
      sefaria_ref = "$($Payload.ref):$paragraphNumber"
      hebrew = @($paragraph)
      license = if ($Payload.heLicense) { $Payload.heLicense } else { 'unknown' }
      version_title = if ($Payload.heVersionTitle) { $Payload.heVersionTitle } else { 'unknown' }
      version_source = if ($Payload.heVersionSource) { $Payload.heVersionSource } else { '' }
      source_url = "https://www.sefaria.org/$($Payload.ref -replace ' ', '_' -replace ',', '%2C')"
      import_date = $importDate
    })
  }
}

function Add-DepthTwoUnits {
  param(
    [System.Collections.Generic.List[object]]$Units,
    [ref]$SequenceRef,
    [object]$Work,
    [hashtable]$GroupMeta,
    [hashtable]$SectionMeta,
    [int]$ChapterCount
  )

  for ($chapter = 1; $chapter -le $ChapterCount; $chapter += 1) {
    $chapterRef = "$($SectionMeta.section_ref) $chapter"
    Write-Host "Importing $chapterRef"
    $payload = Get-SefariaText -Ref $chapterRef
    $paragraphs = Get-HebrewParagraphs -Value $payload.he
    if ($paragraphs.Count -eq 0) {
      throw "No Hebrew returned for $chapterRef"
    }

    $paragraphNumber = 0
    foreach ($paragraph in $paragraphs) {
      $paragraphNumber += 1
      $SequenceRef.Value += 1
      $unitId = "$($Work.work_id)-$($GroupMeta.group_slug)-$($SectionMeta.section_slug)-$chapter-$paragraphNumber"
      $Units.Add([ordered]@{
        work_id = $Work.work_id
        work_title = $Work.work_title
        group_title = $GroupMeta.group_title
        group_he_title = $GroupMeta.group_he_title
        group_slug = $GroupMeta.group_slug
        section_title = $SectionMeta.section_title
        section_he_title = $SectionMeta.section_he_title
        section_slug = $SectionMeta.section_slug
        chapter_number = $chapter
        paragraph_number = $paragraphNumber
        sequence = $SequenceRef.Value
        unit_id = $unitId
        anchor_id = $unitId
        source_ref = "${chapterRef}:$paragraphNumber"
        sefaria_ref = "${chapterRef}:$paragraphNumber"
        hebrew = @($paragraph)
        license = if ($payload.heLicense) { $payload.heLicense } else { 'unknown' }
        version_title = if ($payload.heVersionTitle) { $payload.heVersionTitle } else { 'unknown' }
        version_source = if ($payload.heVersionSource) { $payload.heVersionSource } else { '' }
        source_url = "https://www.sefaria.org/$($chapterRef -replace ' ', '_' -replace ',', '%2C')"
        import_date = $importDate
      })
    }
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$config = Read-Json -Path $ConfigPath
$importDate = (Get-Date).ToString('yyyy-MM-dd')

foreach ($work in $config.works) {
  Write-Host "Building work-level import for $($work.sefaria_ref)"
  $index = Get-SefariaIndex -Ref $work.sefaria_ref
  $units = New-Object System.Collections.Generic.List[object]
  $outline = New-Object System.Collections.Generic.List[object]
  $sequence = 0

  foreach ($groupNode in @($index.schema.nodes)) {
    $groupTitle = Get-PrimaryTitle -Node $groupNode -Lang 'en'
    $groupHeTitle = Get-PrimaryTitle -Node $groupNode -Lang 'he'
    $groupSlug = New-Slug $groupTitle
    $groupRef = "$($work.sefaria_ref), $groupTitle"
    $groupMeta = @{
      group_title = $groupTitle
      group_he_title = $groupHeTitle
      group_slug = $groupSlug
    }

    $groupEntry = [ordered]@{
      group_title = $groupTitle
      group_he_title = $groupHeTitle
      group_slug = $groupSlug
      sections = @()
    }

    foreach ($sectionNode in @($groupNode.nodes)) {
      $sectionTitle = Get-PrimaryTitle -Node $sectionNode -Lang 'en'
      $sectionHeTitle = Get-PrimaryTitle -Node $sectionNode -Lang 'he'
      $sectionSlug = New-Slug $sectionTitle
      $sectionRef = "$groupRef, $sectionTitle"
      $sectionMeta = @{
        section_title = $sectionTitle
        section_he_title = $sectionHeTitle
        section_slug = $sectionSlug
        section_ref = $sectionRef
      }

      $groupEntry.sections += @([ordered]@{
        section_title = $sectionTitle
        section_he_title = $sectionHeTitle
        section_slug = $sectionSlug
        node_depth = $sectionNode.depth
        section_ref = $sectionRef
      })

      if ($sectionNode.depth -eq 1) {
        Write-Host "Importing $sectionRef"
        $payload = Get-SefariaText -Ref $sectionRef
        Add-DepthOneUnits -Units $units -SequenceRef ([ref]$sequence) -Work $work -GroupMeta $groupMeta -SectionMeta $sectionMeta -Payload $payload
      } elseif ($sectionNode.depth -eq 2) {
        $chapterCount = [int]$sectionNode.lengths[0]
        Add-DepthTwoUnits -Units $units -SequenceRef ([ref]$sequence) -Work $work -GroupMeta $groupMeta -SectionMeta $sectionMeta -ChapterCount $chapterCount
      } else {
        throw "Unsupported node depth $($sectionNode.depth) for $sectionRef"
      }
    }

    $outline.Add($groupEntry)
  }

  $source = [ordered]@{
    work_id = $work.work_id
    work_title = $work.work_title
    work_slug = $work.work_slug
    sefaria_ref = $work.sefaria_ref
    source_system = $work.source_system
    source_base_url = $work.source_base_url
    import_date = $importDate
    outline = $outline
    units = $units
  }

  Write-Utf8Json -Path (Join-Path $OutputDir "$($work.work_id).json") -Value $source
}
