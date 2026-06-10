 = @(
  "http://localhost:3000/api/jarvis",
  "http://localhost:3000/api/chat",
  "http://localhost:3000/api/academic/snapshots",
  "http://localhost:3000/api/terminal/ai"
)

foreach ($url in $endpoints) {
  try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Body '{"query":"test"}' -ContentType "application/json" -ErrorAction Stop
    Write-Host "Endpoint: $url -> Status: $($response.StatusCode)"
  } catch {
    Write-Host "Endpoint: $url -> Status: $($_.Exception.Response.StatusCode.value__)"
  }
}
