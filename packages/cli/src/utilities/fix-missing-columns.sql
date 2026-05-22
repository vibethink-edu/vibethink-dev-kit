-- =====================================================
-- SCRIPT PARA AGREGAR COLUMNAS FALTANTES
-- =====================================================

-- 1. AGREGAR COLUMNA DESCRIPTION A PLATFORMS
-- =====================================================
ALTER TABLE platforms 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. AGREGAR COLUMNAS A ORGANIZATIONS
-- =====================================================
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_clients INTEGER DEFAULT 5;

-- 3. AGREGAR COLUMNAS A SUB_ORGANIZATIONS
-- =====================================================
ALTER TABLE sub_organizations 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5;

-- 4. VERIFICAR CAMBIOS
-- =====================================================
SELECT 'Columnas agregadas exitosamente' as status;

-- Verificar estructura de platforms
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'platforms' 
AND column_name IN ('description')
ORDER BY column_name;

-- Verificar estructura de organizations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name IN ('plan_type', 'max_users', 'max_clients')
ORDER BY column_name;

-- Verificar estructura de sub_organizations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sub_organizations' 
AND column_name IN ('plan_type', 'max_users')
ORDER BY column_name; 