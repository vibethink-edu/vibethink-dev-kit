# Script para generar dashboard de migracion
Write-Host "Generando dashboard de migracion..." -ForegroundColor Green

# Datos de migracion
$migrationData = @{
    "docusaurus-docs" = @{
        Status = "In Progress"
        Progress = 60
        Files = 45
        Migrated = 27
        Categories = @("User Guides", "Tutorials", "Examples")
    }
    "docusaurus-dev" = @{
        Status = "Completed"
        Progress = 100
        Files = 120
        Migrated = 120
        Categories = @("Architecture", "Development", "Testing")
    }
    "docusaurus-api" = @{
        Status = "Not Started"
        Progress = 0
        Files = 80
        Migrated = 0
        Categories = @("Endpoints", "Authentication", "Examples")
    }
    "docusaurus-vthink" = @{
        Status = "In Progress"
        Progress = 30
        Files = 60
        Migrated = 18
        Categories = @("Methodology", "Processes", "Tools")
    }
    "docusaurus-archives" = @{
        Status = "Planned"
        Progress = 0
        Files = 200
        Migrated = 0
        Categories = @("Legacy", "Versions", "History")
    }
}

# Generar HTML
$html = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VThink 1.0 - Dashboard de Migracion</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.completed { background: #d4edda; color: #155724; }
        .status.in-progress { background: #fff3cd; color: #856404; }
        .status.not-started { background: #f8d7da; color: #721c24; }
        .status.planned { background: #d1ecf1; color: #0c5460; }
        .site-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .site-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .site-card h3 {
            margin: 0 0 15px 0;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .categories {
            margin-top: 15px;
        }
        .category-tag {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            margin: 2px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VThink 1.0</h1>
            <p>Dashboard de Migracion de Documentacion</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
"@

# Agregar estadísticas generales
$totalFiles = ($migrationData.Values | ForEach-Object { $_.Files }) | Measure-Object -Sum | Select-Object -ExpandProperty Sum
$totalMigrated = ($migrationData.Values | ForEach-Object { $_.Migrated }) | Measure-Object -Sum | Select-Object -ExpandProperty Sum
$overallProgress = [math]::Round(($totalMigrated / $totalFiles) * 100, 1)

$html += @"
                <div class="stat-card">
                    <h3>Progreso General</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: $overallProgress%"></div>
                    </div>
                    <p>$overallProgress% completado ($totalMigrated/$totalFiles archivos)</p>
                </div>
                
                <div class="stat-card">
                    <h3>Sitios Activos</h3>
                    <p>$($migrationData.Count) sitios configurados</p>
                    <p>5 puertos diferentes (3000-3004)</p>
                </div>
                
                <div class="stat-card">
                    <h3>Estado de Migracion</h3>
                    <p>Completado: $($migrationData.Values | Where-Object { $_.Status -eq "Completed" }).Count</p>
                    <p>En Progreso: $($migrationData.Values | Where-Object { $_.Status -eq "In Progress" }).Count</p>
                    <p>Pendiente: $($migrationData.Values | Where-Object { $_.Status -eq "Not Started" -or $_.Status -eq "Planned" }).Count</p>
                </div>
            </div>
            
            <div class="site-grid">
"@

# Agregar tarjetas de sitios
foreach ($site in $migrationData.GetEnumerator()) {
    $statusClass = $site.Value.Status.ToLower().Replace(" ", "-")
    $html += @"
                <div class="site-card">
                    <h3>$($site.Key)</h3>
                    <p><strong>Estado:</strong> <span class="status $statusClass">$($site.Value.Status)</span></p>
                    <p><strong>Progreso:</strong> $($site.Value.Progress)%</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: $($site.Value.Progress)%"></div>
                    </div>
                    <p><strong>Archivos:</strong> $($site.Value.Migrated)/$($site.Value.Files)</p>
                    <div class="categories">
                        <strong>Categorías:</strong><br>
"@
    foreach ($category in $site.Value.Categories) {
        $html += "                        <span class='category-tag'>$category</span>`n"
    }
    $html += @"
                    </div>
                </div>
"@
}

$html += @"
            </div>
        </div>
        
        <div class="footer">
            <p>Generado el $(Get-Date -Format 'dd/MM/yyyy HH:mm') | VThink 1.0 Migration Dashboard</p>
        </div>
    </div>
</body>
</html>
"@

# Guardar archivo
$dashboardPath = "dev-tools/migration/migration-dashboard.html"
Set-Content -Path $dashboardPath -Value $html -Encoding UTF8

Write-Host "✅ Dashboard generado en: $dashboardPath" -ForegroundColor Green
Write-Host "📊 Abre el archivo en tu navegador para ver el dashboard" -ForegroundColor Yellow 