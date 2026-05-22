-- =====================================================
-- SCRIPT DE CORRECCIÓN DE ESTRUCTURA DE BASE DE DATOS
-- =====================================================

-- 1. CORREGIR TABLA PLATFORMS
-- =====================================================
ALTER TABLE platforms 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. CREAR TABLA USERS SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    company_id UUID REFERENCES organizations(id),
    platform_id UUID REFERENCES platforms(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA BRANDING SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES organizations(id),
    platform_id UUID REFERENCES platforms(id),
    logo_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CORREGIR TABLA BRANDING_CONFIGS
-- =====================================================
ALTER TABLE branding_configs 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. CORREGIR TABLA HIERARCHICAL_USERS
-- =====================================================
ALTER TABLE hierarchical_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_platforms_status ON platforms(status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_platform_id ON users(platform_id);
CREATE INDEX IF NOT EXISTS idx_branding_company_id ON branding(company_id);
CREATE INDEX IF NOT EXISTS idx_branding_platform_id ON branding(platform_id);
CREATE INDEX IF NOT EXISTS idx_hierarchical_users_organization_id ON hierarchical_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_hierarchical_users_workspace_id ON hierarchical_users(workspace_id);

-- 7. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. CREAR TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================
DROP TRIGGER IF EXISTS update_platforms_updated_at ON platforms;
CREATE TRIGGER update_platforms_updated_at 
    BEFORE UPDATE ON platforms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_updated_at ON branding;
CREATE TRIGGER update_branding_updated_at 
    BEFORE UPDATE ON branding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_configs_updated_at ON branding_configs;
CREATE TRIGGER update_branding_configs_updated_at 
    BEFORE UPDATE ON branding_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hierarchical_users_updated_at ON hierarchical_users;
CREATE TRIGGER update_hierarchical_users_updated_at 
    BEFORE UPDATE ON hierarchical_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERTAR DATOS DE PRUEBA
-- =====================================================
INSERT INTO platforms (id, name, slug, status) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Plataforma Test 1', 'test-platform-1', 'active'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Plataforma Test 2', 'test-platform-2', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name, slug, platform_id, status) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440003', 'Organización Test 1', 'test-org-1', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Organización Test 2', 'test-org-2', '550e8400-e29b-41d4-a716-446655440002', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspaces (id, name, slug, organization_id, status) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440005', 'Workspace Test 1', 'test-workspace-1', '550e8400-e29b-41d4-a716-446655440003', 'active'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Workspace Test 2', 'test-workspace-2', '550e8400-e29b-41d4-a716-446655440004', 'active')
ON CONFLICT (id) DO NOTHING;

-- 10. VERIFICAR ESTRUCTURA
-- =====================================================
SELECT 'ESTRUCTURA CORREGIDA' as status;
SELECT 'Tablas creadas/actualizadas:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs', 'users', 'branding') ORDER BY tablename; 