$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceFile = Join-Path $repoRoot 'utils\tarotimages.ts'
$outputDir = Join-Path $repoRoot 'public\assets\tarot-original'
$baseUrl = 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$sourceText = Get-Content -LiteralPath $sourceFile -Raw
$files = [regex]::Matches($sourceText, 'getTarotImageUrl\("([^"]+\.png)"\)') |
  ForEach-Object { $_.Groups[1].Value } |
  Sort-Object -Unique

Write-Host "Found $($files.Count) tarot images."

$failed = @()
$downloaded = 0

foreach ($file in $files) {
  $target = Join-Path $outputDir $file

  if (Test-Path -LiteralPath $target) {
    Write-Host "Skip existing: $file"
    continue
  }

  $url = $baseUrl + $file
  Write-Host "Downloading: $file"

  try {
    Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing -TimeoutSec 60
    $downloaded += 1
  } catch {
    $failed += $file
    Write-Host "Failed: $file"
  }
}

$allFiles = Get-ChildItem -LiteralPath $outputDir -Filter *.png -File
$totalBytes = ($allFiles | Measure-Object -Property Length -Sum).Sum
$totalMb = [math]::Round($totalBytes / 1MB, 2)

Write-Host ""
Write-Host "Done."
Write-Host "Images in folder: $($allFiles.Count)"
Write-Host "New downloads: $downloaded"
Write-Host "Total size: $totalMb MB"

if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host "Failed files:"
  $failed | ForEach-Object { Write-Host "- $_" }
  exit 1
}
