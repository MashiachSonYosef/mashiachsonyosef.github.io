param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [string]$LexicalDir = 'data/lexical'
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$validator = Join-Path $scriptDir 'validate_sources.mjs'

node $validator --source-dir $SourceDir --overlay-dir $OverlayDir --lexical-dir $LexicalDir
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

exit 0
