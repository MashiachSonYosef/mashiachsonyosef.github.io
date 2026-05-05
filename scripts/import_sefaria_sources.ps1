param(
  [string]$ConfigPath = 'data/work-imports.json',
  [string]$OutputDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [string[]]$OnlyWorkIds = @(),
  [string]$OnlyWorkIdsPath = '',
  [switch]$SkipExisting
)

$ErrorActionPreference = 'Stop'

$AllowedHebrewSourceLicenses = @(
  'Public Domain',
  'CC0',
  'CC-BY',
  'CC BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC-BY-SA',
  'CC BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0'
)

function New-Slug {
  param([string]$Text)
  $slug = $Text.ToLowerInvariant()
  $slug = $slug -replace '&', ' and '
  $slug = $slug -replace "'", ''
  $slug = $slug -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if (-not $slug) { return 'text' }
  return $slug
}

function Read-Json {
  param([string]$Path)
  Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Test-AllowedHebrewSourceLicense {
  param([string]$License)
  if (-not $License) { return $false }
  return $AllowedHebrewSourceLicenses -contains $License.Trim()
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
  $json = $Value | ConvertTo-Json -Depth 40
  [System.IO.File]::WriteAllText((Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf), $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-Utf8Json {
  param([string]$Uri)
  try {
    $response = Invoke-WebRequest -Uri $Uri
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

function Get-NodeChildren {
  param([object]$Node)
  if ($null -eq $Node.nodes) { return @() }
  if ($Node.nodes -is [string]) { return @() }
  return @($Node.nodes)
}

function Get-LeafNodes {
  param(
    [object]$Node,
    [string[]]$TitlePath = @(),
    [string[]]$HeTitlePath = @()
  )

  $children = Get-NodeChildren -Node $Node
  if ($children.Count -gt 0) {
    $results = @()
    foreach ($child in $children) {
      $title = Get-PrimaryTitle -Node $child -Lang 'en'
      $heTitle = Get-PrimaryTitle -Node $child -Lang 'he'
      foreach ($leaf in Get-LeafNodes -Node $child -TitlePath ($TitlePath + @($title)) -HeTitlePath ($HeTitlePath + @($heTitle))) {
        $results += $leaf
      }
    }
    return $results
  }

  [pscustomobject]@{
    title_path = $TitlePath
    he_title_path = $HeTitlePath
    depth = [int]$Node.depth
    address_types = @($Node.addressTypes)
    section_names = @($Node.sectionNames)
    lengths = @($Node.lengths)
  }
}

function Get-HebrewTexts {
  param(
    [object]$Value,
    [int[]]$Address = @()
  )

  if ($null -eq $Value) { return @() }
  if ($Value -is [string]) {
    if ($Value.Trim()) {
      return @([pscustomobject]@{
        address = $Address
        text = $Value.Trim()
      })
    }
    return @()
  }

  $items = @()
  $index = 0
  foreach ($child in @($Value)) {
    $index += 1
    foreach ($text in Get-HebrewTexts -Value $child -Address ($Address + @($index))) {
      $items += $text
    }
  }
  return $items
}

function Get-AddressedValue {
  param(
    [object]$Value,
    [int[]]$Address = @()
  )

  $current = $Value
  foreach ($part in $Address) {
    if ($null -eq $current) { return $null }
    $items = @($current)
    $index = [int]$part - 1
    if ($index -lt 0 -or $index -ge $items.Count) { return $null }
    $current = $items[$index]
  }
  return $current
}

function Get-HebrewVersionMeta {
  param(
    [object]$Payload,
    [int[]]$Address = @()
  )

  $sourceTitle = Get-AddressedValue -Value $Payload.heSources -Address $Address
  if ($sourceTitle -is [array]) { $sourceTitle = ($sourceTitle -join ' / ') }
  if (-not $sourceTitle -and $Payload.heVersionTitle) { $sourceTitle = $Payload.heVersionTitle }

  $version = $null
  if ($sourceTitle -and $Payload.versions) {
    $version = @($Payload.versions | Where-Object { $_.language -eq 'he' -and $_.versionTitle -eq $sourceTitle } | Select-Object -First 1)[0]
  }
  if (-not $version -and $Payload.heVersionTitle -and $Payload.versions) {
    $version = @($Payload.versions | Where-Object { $_.language -eq 'he' -and $_.versionTitle -eq $Payload.heVersionTitle } | Select-Object -First 1)[0]
  }

  $license = if ($Payload.heLicense) { $Payload.heLicense } elseif ($version -and $version.license) { $version.license } else { 'unknown' }
  $versionTitle = if ($Payload.heVersionTitle) { $Payload.heVersionTitle } elseif ($sourceTitle) { $sourceTitle } elseif ($version -and $version.versionTitle) { $version.versionTitle } else { 'unknown' }
  $versionSource = if ($Payload.heVersionSource) { $Payload.heVersionSource } elseif ($version -and $version.versionSource) { $version.versionSource } else { '' }

  [ordered]@{
    license = $license
    version_title = $versionTitle
    version_source = $versionSource
  }
}

function Get-LeafRef {
  param(
    [string]$WorkRef,
    [string[]]$TitlePath
  )
  if ($TitlePath.Count -eq 0) { return $WorkRef }
  return "$WorkRef, $($TitlePath -join ', ')"
}

function Get-OutlineEntry {
  param(
    [object]$Work,
    [object]$Leaf
  )

  if ($Leaf.title_path.Count -eq 0) {
    $groupTitle = $Work.work_title
    $groupHeTitle = if ($Work.he_title) { $Work.he_title } else { $Work.work_title }
    $groupSlug = New-Slug $Work.work_title
    $sectionTitle = $Work.work_title
    $sectionHeTitle = $groupHeTitle
    $sectionSlug = 'text'
  } elseif ($Leaf.title_path.Count -eq 1) {
    $groupTitle = $Leaf.title_path[0]
    $groupHeTitle = $Leaf.he_title_path[0]
    $groupSlug = New-Slug $groupTitle
    $sectionTitle = $Leaf.title_path[0]
    $sectionHeTitle = $Leaf.he_title_path[0]
    $sectionSlug = New-Slug $sectionTitle
  } else {
    $groupTitle = $Leaf.title_path[0]
    $groupHeTitle = $Leaf.he_title_path[0]
    $groupSlug = New-Slug $groupTitle
    $sectionTitle = ($Leaf.title_path | Select-Object -Skip 1) -join ' / '
    $sectionHeTitle = ($Leaf.he_title_path | Select-Object -Skip 1) -join ' / '
    $sectionSlug = New-Slug $sectionTitle
  }

  [ordered]@{
    group_title = $groupTitle
    group_he_title = $groupHeTitle
    group_slug = $groupSlug
    section_title = $sectionTitle
    section_he_title = $sectionHeTitle
    section_slug = $sectionSlug
    section_ref = Get-LeafRef -WorkRef $Work.sefaria_ref -TitlePath $Leaf.title_path
    node_depth = $Leaf.depth
  }
}

function Add-OutlineSection {
  param(
    [System.Collections.Generic.List[object]]$Outline,
    [hashtable]$SeenGroups,
    [hashtable]$SeenSections,
    [hashtable]$Meta
  )

  if (-not $SeenGroups.ContainsKey($Meta.group_slug)) {
    $Outline.Add([ordered]@{
      group_title = $Meta.group_title
      group_he_title = $Meta.group_he_title
      group_slug = $Meta.group_slug
      sections = @()
    })
    $SeenGroups[$Meta.group_slug] = $Outline.Count - 1
  }

  $sectionKey = "$($Meta.group_slug)/$($Meta.section_slug)"
  if (-not $SeenSections.ContainsKey($sectionKey)) {
    $groupIndex = $SeenGroups[$Meta.group_slug]
    $Outline[$groupIndex].sections += @([ordered]@{
      section_title = $Meta.section_title
      section_he_title = $Meta.section_he_title
      section_slug = $Meta.section_slug
      section_ref = $Meta.section_ref
      node_depth = $Meta.node_depth
    })
    $SeenSections[$sectionKey] = $true
  }
}

function Get-FetchRefs {
  param(
    [string]$LeafRef,
    [object]$Leaf
  )

  if ($Leaf.depth -eq 1) { return @($LeafRef) }

  $firstAddressType = if ($Leaf.address_types.Count -gt 0) { $Leaf.address_types[0] } else { '' }
  if ($firstAddressType -eq 'Talmud') {
    throw "Unsupported Talmud-addressed text: $LeafRef"
  }

  if ($Leaf.lengths.Count -eq 0 -or -not $Leaf.lengths[0]) {
    return @($LeafRef)
  }

  $count = [int]$Leaf.lengths[0]
  if ($count -le 0) {
    return @($LeafRef)
  }

  $refs = New-Object System.Collections.Generic.List[string]
  for ($i = 1; $i -le $count; $i += 1) {
    $refs.Add("$LeafRef $i")
  }
  return @($refs)
}

function Test-UseNextTraversal {
  param([object]$Leaf)

  if ($Leaf.depth -ge 4) { return $true }
  if ($Leaf.depth -gt 1 -and ($Leaf.lengths.Count -eq 0 -or -not $Leaf.lengths[0])) { return $true }
  if (($Leaf.lengths.Count -eq 0 -or -not $Leaf.lengths[0]) -and $Leaf.title_path.Count -gt 0 -and $Leaf.title_path[-1] -eq 'default') { return $true }
  return $false
}

function Test-RefWithinPrefixes {
  param(
    [string]$Ref,
    [string[]]$Prefixes = @()
  )

  foreach ($prefix in $Prefixes) {
    if (-not $prefix) { continue }
    if ($Ref -eq $prefix -or $Ref.StartsWith("$prefix ") -or $Ref.StartsWith("${prefix}:")) {
      return $true
    }
  }
  return $false
}

function Add-UnitsFromPayload {
  param(
    [System.Collections.Generic.List[object]]$Units,
    [ref]$SequenceRef,
    [object]$Work,
    [hashtable]$Meta,
    [object]$Payload
  )

  $texts = Get-HebrewTexts -Value $Payload.he
  foreach ($text in $texts) {
    $versionMeta = Get-HebrewVersionMeta -Payload $Payload -Address @($text.address)
    $sourceRef = "$($Payload.ref):$(($text.address) -join ':')"
    if (-not $text.address -or @($text.address).Count -eq 0) { $sourceRef = $Payload.ref }

    if (-not (Test-AllowedHebrewSourceLicense -License $versionMeta.license)) {
      Write-Warning "Skipping $sourceRef with unsupported Hebrew source license '$($versionMeta.license)' from '$($versionMeta.version_title)'"
      continue
    }

    $SequenceRef.Value += 1
    $addressParts = @()
    if ($Payload.sections) { $addressParts += @($Payload.sections) }
    if ($text.address) { $addressParts += @($text.address) }
    if ($addressParts.Count -eq 0) { $addressParts = @($SequenceRef.Value) }

    $unitSuffix = ($addressParts -join '-')
    $pathSlug = if ($Meta.section_slug -eq 'text') { '' } else { "$($Meta.group_slug)-$($Meta.section_slug)-" }
    $unitId = "$($Work.work_id)-$pathSlug$unitSuffix"

    $chapterNumber = if ($addressParts.Count -ge 1) { $addressParts[0] } else { $null }
    $paragraphNumber = if ($addressParts.Count -ge 2) { $addressParts[-1] } else { $addressParts[0] }

    $Units.Add([ordered]@{
      work_id = $Work.work_id
      work_title = $Work.work_title
      group_title = $Meta.group_title
      group_he_title = $Meta.group_he_title
      group_slug = $Meta.group_slug
      section_title = $Meta.section_title
      section_he_title = $Meta.section_he_title
      section_slug = $Meta.section_slug
      chapter_number = $chapterNumber
      paragraph_number = $paragraphNumber
      sequence = $SequenceRef.Value
      unit_id = $unitId
      anchor_id = $unitId
      source_ref = $sourceRef
      sefaria_ref = $sourceRef
      hebrew = @($text.text)
      license = $versionMeta.license
      version_title = $versionMeta.version_title
      version_source = $versionMeta.version_source
      digitization = 'Sefaria API'
      source_url = "https://www.sefaria.org/$($sourceRef -replace ' ', '_' -replace ',', '%2C')"
      import_date = $importDate
    })
  }
}

function Add-UnitsByNextTraversal {
  param(
    [System.Collections.Generic.List[object]]$Units,
    [ref]$SequenceRef,
    [object]$Work,
    [hashtable]$Meta,
    [string]$StartRef,
    [string[]]$StopPrefixes = @()
  )

  $seenRefs = @{}
  $nextRef = $StartRef
  $step = 0
  while ($nextRef) {
    if ($StopPrefixes.Count -gt 0 -and -not (Test-RefWithinPrefixes -Ref $nextRef -Prefixes $StopPrefixes)) {
      break
    }

    $step += 1
    if ($step -gt 20000) {
      Write-Warning "Stopping next-link traversal after 20000 refs for $StartRef"
      break
    }
    if ($seenRefs.ContainsKey($nextRef)) {
      Write-Warning "Stopping next-link traversal loop at $nextRef"
      break
    }
    $seenRefs[$nextRef] = $true

    Write-Host "Importing $nextRef"
    try {
      $payload = Get-SefariaText -Ref $nextRef
      Add-UnitsFromPayload -Units $Units -SequenceRef $SequenceRef -Work $Work -Meta $Meta -Payload $payload
      $nextRef = $payload.next
    } catch {
      Write-Warning "Skipping $nextRef`: $($_.Exception.Message)"
      break
    }
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $OverlayDir | Out-Null
$config = Read-Json -Path $ConfigPath
$importDate = (Get-Date).ToString('yyyy-MM-dd')

if ($OnlyWorkIdsPath -and (Test-Path $OnlyWorkIdsPath)) {
  $OnlyWorkIds += @(Get-Content -Path $OnlyWorkIdsPath -Encoding UTF8 | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith('#') })
}

foreach ($work in $config.works) {
  if ($OnlyWorkIds.Count -gt 0 -and $OnlyWorkIds -notcontains $work.work_id) {
    continue
  }

  $sourcePath = Join-Path $OutputDir "$($work.work_id).json"
  if ($SkipExisting -and (Test-Path $sourcePath)) {
    Write-Host "Skipping existing source for $($work.sefaria_ref)"
    continue
  }

  Write-Host "Building work-level import for $($work.sefaria_ref)"
  $index = Get-SefariaIndex -Ref $work.sefaria_ref
  $units = New-Object System.Collections.Generic.List[object]
  $outline = New-Object System.Collections.Generic.List[object]
  $seenGroups = @{}
  $seenSections = @{}
  $sequence = 0

  if (-not $work.work_title) { $work | Add-Member -NotePropertyName work_title -NotePropertyValue $index.title }
  if (-not $work.he_title) { $work | Add-Member -NotePropertyName he_title -NotePropertyValue $index.heTitle }

  foreach ($leaf in Get-LeafNodes -Node $index.schema) {
    $leafRef = Get-LeafRef -WorkRef $work.sefaria_ref -TitlePath $leaf.title_path
    $canonicalLeafRef = Get-LeafRef -WorkRef $index.title -TitlePath $leaf.title_path
    $meta = Get-OutlineEntry -Work $work -Leaf $leaf
    Add-OutlineSection -Outline $outline -SeenGroups $seenGroups -SeenSections $seenSections -Meta $meta

    if (Test-UseNextTraversal -Leaf $leaf) {
      Add-UnitsByNextTraversal -Units $units -SequenceRef ([ref]$sequence) -Work $work -Meta $meta -StartRef $leafRef -StopPrefixes @($leafRef, $canonicalLeafRef)
      continue
    }

    foreach ($fetchRef in Get-FetchRefs -LeafRef $leafRef -Leaf $leaf) {
      Write-Host "Importing $fetchRef"
      try {
        $payload = Get-SefariaText -Ref $fetchRef
        Add-UnitsFromPayload -Units $units -SequenceRef ([ref]$sequence) -Work $work -Meta $meta -Payload $payload
      } catch {
        Write-Warning "Skipping $fetchRef`: $($_.Exception.Message)"
      }
    }
  }

  $source = [ordered]@{
    work_id = $work.work_id
    work_title = $work.work_title
    work_slug = $work.work_slug
    sefaria_ref = $work.sefaria_ref
    work_type = if ($work.work_type) { $work.work_type } else { 'primary_text' }
    source_system = $work.source_system
    source_base_url = $work.source_base_url
    import_date = $importDate
    outline = $outline
    units = $units
  }

  Write-Utf8Json -Path $sourcePath -Value $source

  $overlayPath = Join-Path $OverlayDir "$($work.work_id).json"
  if (-not (Test-Path $overlayPath)) {
    Write-Utf8Json -Path $overlayPath -Value ([ordered]@{
      work_id = $work.work_id
      units = @{}
    })
  }
}
