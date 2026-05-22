# Script para validar sitios Docusaurus
Write-Host "Validando sitios Docusaurus..." -ForegroundColor Green

$sites = @(
    @{ Name = "docusaurus-docs"; Port = 3000; URL = "http://localhost:3000" },
    @{ Name = "docusaurus-dev"; Port = 3001; URL = "http://localhost:3001" },
    @{ Name = "docusaurus-api"; Port = 3002; URL = "http://localhost:3002" },
    @{ Name = "docusaurus-vthink"; Port = 3003; URL = "http://localhost:3003" },
    @{ Name = "docusaurus-archives"; Port = 3004; URL = "http://localhost:3004" }
)

$results = @()

foreach ($site in $sites) {
    Write-Host "Verificando $($site.Name)..." -ForegroundColor Yellow
    
    # Verificar si el directorio existe
    $dirExists = Test-Path $site.Name
    if (!$dirExists) {
        Write-Host "  ❌ Directorio no existe" -ForegroundColor Red
        $results += @{ Name = $site.Name; Status = "Missing"; Port = $site.Port }
        continue
    }
    
    # Verificar si el puerto está en uso
    try {
        $response = Invoke-WebRequest -Uri $site.URL -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ Funcionando en $($site.URL)" -ForegroundColor Green
        $results += @{ Name = $site.Name; Status = "Running"; Port = $site.Port; URL = $site.URL }
    }
    catch {
        Write-Host "  ❌ No responde en $($site.URL)" -ForegroundColor Red
        $results += @{ Name = $site.Name; Status = "Not Responding"; Port = $site.Port; URL = $site.URL }
    }
}

Write-Host "`nResumen de validacion:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

$running = ($results | Where-Object { $_.Status -eq "Running" }).Count
$total = $results.Count

Write-Host "Sitios funcionando: $running/$total" -ForegroundColor White

foreach ($result in $results) {
    $status = if ($result.Status -eq "Running") { "✅" } else { "❌" }
    Write-Host "$status $($result.Name) - $($result.Status)" -ForegroundColor White
}

if ($running -eq $total) {
    Write-Host "`n🎉 Todos los sitios estan funcionando!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Algunos sitios no estan funcionando" -ForegroundColor Yellow
} 