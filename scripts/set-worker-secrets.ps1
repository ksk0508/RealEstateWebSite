param(
  [string]$AdminKey,
  [string]$GitHubToken
)

$ErrorActionPreference = 'Stop'

function Read-SecretValue {
  param(
    [string]$Name,
    [string]$ProvidedValue
  )

  if ($ProvidedValue) { return $ProvidedValue }

  $secure = Read-Host "Enter $Name" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  }
  finally {
    if ($ptr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  }
}

function Put-WranglerSecret {
  param(
    [string]$Name,
    [string]$Value
  )

  if (-not $Value) { throw "$Name cannot be empty." }
  $Value | npx wrangler secret put $Name
}

$admin = Read-SecretValue -Name 'ADMIN_KEY' -ProvidedValue $AdminKey
$token = Read-SecretValue -Name 'GITHUB_TOKEN' -ProvidedValue $GitHubToken

Put-WranglerSecret -Name 'ADMIN_KEY' -Value $admin
Put-WranglerSecret -Name 'GITHUB_TOKEN' -Value $token

Write-Host 'Worker secrets updated. Run: npx wrangler deploy'
