-- =====================================================
-- AGREGAR ÚLTIMAS COLUMNAS FALTANTES
-- =====================================================

-- 1. AGREGAR COLUMNA DESCRIPTION A WORKSPACES
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. AGREGAR COLUMNA THEME A BRANDING
ALTER TABLE branding ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'default';

-- 3. VERIFICAR CAMBIOS
SELECT 'Últimas columnas agregadas' as status;

-- Verificar estructura de workspaces
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workspaces' 
AND column_name IN ('description')
ORDER BY column_name;

-- Verificar estructura de branding
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'branding' 
AND column_name IN ('theme')
ORDER BY column_name; 