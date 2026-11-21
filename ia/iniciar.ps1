# Inicia a API e o Cloudflare Tunnel (túnel rápido, sem conta).
# Uso: powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
# Feche com Ctrl+C: a API e o túnel são encerrados juntos.

Set-Location $PSScriptRoot

$pythonExe = if (Test-Path .\.venv\Scripts\python.exe) { ".\.venv\Scripts\python.exe" } else { "python" }
$api = Start-Process -FilePath $pythonExe `
    -ArgumentList "-m","uvicorn","app:app","--host","0.0.0.0","--port","8000" -NoNewWindow -PassThru
Write-Host "API iniciada em http://127.0.0.1:8000 (PID $($api.Id))"
Write-Host "Procure abaixo a linha com https://....trycloudflare.com - essa e sua URL publica.`n"

try {
    cloudflared tunnel --url http://127.0.0.1:8000
} finally {
    Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
    Write-Host "API encerrada."
}
