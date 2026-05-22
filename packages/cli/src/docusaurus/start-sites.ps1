# Script para iniciar sitios Docusaurus
Write-Host "Iniciando sitios Docusaurus..." -ForegroundColor Green

# Configuracion de sitios
$sites = @(
    @{ Name = "docusaurus-docs"; Port = 3000; Desc = "Usuario" },
    @{ Name = "docusaurus-dev"; Port = 3001; Desc = "Desarrollador" },
    @{ Name = "docusaurus-api"; Port = 3002; Desc = "API" },
    @{ Name = "docusaurus-vthink"; Port = 3003; Desc = "Metodologia" },
    @{ Name = "docusaurus-archives"; Port = 3004; Desc = "Archivos" }
)

foreach ($site in $sites) {
    if (Test-Path $site.Name) {
        Write-Host "Iniciando $($site.Name) en puerto $($site.Port)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-Command", "cd $($site.Name); npm start -- --port $($site.Port)" -WindowStyle Minimized
        Start-Sleep -Seconds 3
    } else {
        Write-Host "$($site.Name) no existe" -ForegroundColor Red
    }
}

Write-Host "`nSitios iniciados:" -ForegroundColor Green
Write-Host "Usuario: http://localhost:3000" -ForegroundColor White
Write-Host "Desarrollador: http://localhost:3001" -ForegroundColor White
Write-Host "API: http://localhost:3002" -ForegroundColor White
Write-Host "Metodologia: http://localhost:3003" -ForegroundColor White
Write-Host "Archivos: http://localhost:3004" -ForegroundColor White 