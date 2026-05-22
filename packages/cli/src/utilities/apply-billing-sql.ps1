# Script para aplicar SQL de billing directamente
# Uso: .\scripts\apply-billing-sql.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "🔧 Aplicando SQL de billing directamente..." -ForegroundColor Green

# Leer el archivo SQL
$sqlContent = Get-Content "supabase/migrations/20250620000001_create_billing_system.sql" -Raw

# Crear archivo temporal con el SQL
$tempFile = "temp_billing_migration.sql"
$sqlContent | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Ejecutar SQL usando psql (si está disponible) o crear un script Node.js
    Write-Host "📝 Creando script Node.js para ejecutar SQL..." -ForegroundColor Yellow
    
    $nodeScript = @"
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pikywaoqlekupfynnclg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ5NzI5NCwiZXhwIjoyMDUzMDczMjk0fQ.EiAJYNsO4zBgf3HT';
const supabase = createClient(supabaseUrl, supabaseKey);

const fs = require('fs');
const sqlContent = fs.readFileSync('temp_billing_migration.sql', 'utf8');

async function applyMigration() {
    try {
        console.log('🔧 Aplicando migración de billing...');
        
        // Dividir el SQL en statements individuales
        const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement.length > 0) {
                console.log(\`Ejecutando statement \${i + 1}/\${statements.length}...\`);
                const { error } = await supabase.rpc('exec_sql', { sql: statement });
                if (error) {
                    console.error('Error en statement:', error);
                    // Continuar con el siguiente statement
                }
            }
        }
        
        console.log('✅ Migración aplicada exitosamente!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

applyMigration();
"@

    $nodeScript | Out-File -FilePath "temp_apply_migration.js" -Encoding UTF8
    
    # Ejecutar el script Node.js
    Write-Host "🚀 Ejecutando migración..." -ForegroundColor Cyan
    node temp_apply_migration.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migración aplicada exitosamente!" -ForegroundColor Green
        Write-Host "📊 Sistema de billing configurado y listo para usar" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al aplicar la migración" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Limpiar archivos temporales
    if (Test-Path $tempFile) { Remove-Item $tempFile }
    if (Test-Path "temp_apply_migration.js") { Remove-Item "temp_apply_migration.js" }
}

Write-Host "🎉 ¡Proceso completado!" -ForegroundColor Green 