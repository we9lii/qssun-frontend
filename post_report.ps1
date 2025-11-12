param([string]$FilePath)

Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$content = New-Object System.Net.Http.MultipartFormDataContent
$json = Get-Content -Raw $FilePath
$stringContent = New-Object System.Net.Http.StringContent($json, [System.Text.Encoding]::UTF8, 'text/plain')
$content.Add($stringContent, 'reportData')
$response = $client.PostAsync('https://qssun-backend-api.onrender.com/api/reports', $content).Result
Write-Output ($response.Content.ReadAsStringAsync().Result)