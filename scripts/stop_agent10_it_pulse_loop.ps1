$scriptPath = $MyInvocation.MyCommand.Path
$root = Split-Path -Parent (Split-Path -Parent $scriptPath)
$reportsDir = Join-Path $root "reports"
$pidPath = Join-Path $reportsDir "agent10-it-loop.pid"
$stopPath = Join-Path $reportsDir "agent10-it-loop.stop"

Set-Content -LiteralPath $stopPath -Value (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK") -Encoding ASCII

if (Test-Path -LiteralPath $pidPath) {
  $rawPid = (Get-Content -LiteralPath $pidPath -Raw).Trim()
  $loopPid = 0
  if ([int]::TryParse($rawPid, [ref]$loopPid)) {
    $process = Get-Process -Id $loopPid -ErrorAction SilentlyContinue
    if ($process -ne $null) {
      Write-Output "Stop requested for Agent 10 IT loop PID $loopPid."
      exit 0
    }
  }
}

Write-Output "Stop requested. No running Agent 10 IT loop PID found."
