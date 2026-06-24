param(
  [string]$Token,
  [string]$Owner = 'ksk0508',
  [string]$Repo = 'RealEstateWebSite',
  [string]$Branch = 'main',
  [string]$Path = 'projects.json'
)

$ErrorActionPreference = 'Stop'

if (-not $Token) {
  $secure = Read-Host 'Enter GitHub PAT to test' -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $Token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally {
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
  }
}

$headers = @{
  Authorization = "Bearer $Token"
  Accept = 'application/vnd.github+json'
  'User-Agent' = 'clarity-token-diagnostics'
  'X-GitHub-Api-Version' = '2022-11-28'
}

function Invoke-GitHubCheck {
  param([string]$Label, [string]$Uri)
  Write-Host "`n== $Label =="
  try {
    $response = Invoke-WebRequest -Uri $Uri -Headers $headers -UseBasicParsing -TimeoutSec 30
    Write-Host "Status: $($response.StatusCode)"
    return $response.Content | ConvertFrom-Json
  }
  catch {
    Write-Host "Failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
      Write-Host "Status: $([int]$_.Exception.Response.StatusCode)"
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      Write-Host "Body: $($reader.ReadToEnd())"
    }
    return $null
  }
}

$user = Invoke-GitHubCheck -Label 'Authenticated user' -Uri 'https://api.github.com/user'
if ($user) { Write-Host "Login: $($user.login)" }

$repoInfo = Invoke-GitHubCheck -Label 'Repository access' -Uri "https://api.github.com/repos/$Owner/$Repo"
if ($repoInfo) {
  Write-Host "Repo: $($repoInfo.full_name)"
  Write-Host "Private: $($repoInfo.private)"
  Write-Host "Default branch: $($repoInfo.default_branch)"
  if ($repoInfo.permissions) {
    Write-Host "Permissions: admin=$($repoInfo.permissions.admin), push=$($repoInfo.permissions.push), maintain=$($repoInfo.permissions.maintain), pull=$($repoInfo.permissions.pull)"
  }
  else {
    Write-Host 'Permissions object was not returned. For fine-grained tokens, check repository Contents permission in GitHub settings.'
  }
}

$fileInfo = Invoke-GitHubCheck -Label 'File access' -Uri "https://api.github.com/repos/$Owner/$Repo/contents/$Path`?ref=$Branch"
if ($fileInfo) {
  Write-Host "File: $($fileInfo.path)"
  Write-Host "SHA: $($fileInfo.sha)"
}

Write-Host "`nExpected for publishing: repo access succeeds, file access succeeds, and permissions.push should be True when GitHub returns permissions."