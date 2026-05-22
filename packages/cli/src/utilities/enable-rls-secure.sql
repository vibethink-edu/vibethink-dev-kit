-- =====================================================
-- SCRIPT PARA HABILITAR RLS CON POLÍTICAS SEGURAS
-- =====================================================

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE hierarchical_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS PROBLEMÁTICAS (SI EXISTEN)
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platforms;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON workspaces;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON hierarchical_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON branding_configs;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON branding;

-- 3. CREAR POLÍTICAS SEGURAS Y SIMPLES
-- =====================================================

-- Política para platforms (acceso por platform_id)
CREATE POLICY "platforms_access_policy" ON platforms
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hierarchical_users 
            WHERE platform_id = platforms.id
        )
    );

-- Política para organizations (acceso por platform_id)
CREATE POLICY "organizations_access_policy" ON organizations
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hierarchical_users 
            WHERE platform_id = organizations.platform_id
        )
    );

-- Política para workspaces (acceso por organization_id)
CREATE POLICY "workspaces_access_policy" ON workspaces
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hierarchical_users 
            WHERE organization_id = workspaces.organization_id
        )
    );

-- Política para hierarchical_users (acceso propio)
CREATE POLICY "hierarchical_users_access_policy" ON hierarchical_users
    FOR ALL USING (auth.uid() = user_id);

-- Política para branding_configs (acceso por company_id)
CREATE POLICY "branding_configs_access_policy" ON branding_configs
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hierarchical_users 
            WHERE organization_id = branding_configs.company_id
        )
    );

-- Política para users (acceso propio o por company)
CREATE POLICY "users_access_policy" ON users
    FOR ALL USING (
        auth.uid() = id OR 
        company_id IN (
            SELECT organization_id FROM hierarchical_users 
            WHERE user_id = auth.uid()
        )
    );

-- Política para branding (acceso por company_id)
CREATE POLICY "branding_access_policy" ON branding
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hierarchical_users 
            WHERE organization_id = branding.company_id
        )
    );

-- 4. VERIFICAR POLÍTICAS CREADAS
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('platforms', 'organizations', 'workspaces', 'hierarchical_users', 'branding_configs', 'users', 'branding')
ORDER BY tablename, policyname;

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs', 'users', 'branding')
ORDER BY tablename; 