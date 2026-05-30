param(
  [string]$Path = ".local-cache",
  [double]$WarnGB = 80,
  [switch]$FailOnWarn
)

$ErrorActionPreference = "Stop"

function Format-GB([double]$Bytes) {
  return [math]::Round(($Bytes / 1GB), 2)
}

$resolvedRoot = Resolve-Path -LiteralPath "." | Select-Object -ExpandProperty Path
$targetPath = if ([System.IO.Path]::IsPathRooted($Path)) {
  $Path
} else {
  Join-Path $resolvedRoot $Path
}

$targetSize = 0
if (Test-Path -LiteralPath $targetPath) {
  $targetSize = (Get-ChildItem -LiteralPath $targetPath -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  if ($null -eq $targetSize) { $targetSize = 0 }
}

$driveRoot = [System.IO.Path]::GetPathRoot($targetPath)
$drive = [System.IO.DriveInfo]::GetDrives() | Where-Object { $_.Name -eq $driveRoot } | Select-Object -First 1
$usedGB = Format-GB $targetSize
$freeGB = if ($drive) { Format-GB $drive.AvailableFreeSpace } else { $null }

Write-Host "Storage budget path: $targetPath"
Write-Host "Generated/local cache size: $usedGB GB"
if ($null -ne $freeGB) {
  Write-Host "Drive free space: $freeGB GB"
}
Write-Host "Warn threshold: $WarnGB GB"

if ($usedGB -ge $WarnGB) {
  Write-Warning "Generated/local cache is at or above the warning threshold."
  if ($FailOnWarn) { exit 2 }
}
