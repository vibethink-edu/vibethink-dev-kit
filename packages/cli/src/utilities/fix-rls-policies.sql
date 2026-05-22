-- Script para corregir políticas RLS problemáticas
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- PASO 1: Eliminar políticas problemáticas existentes
-- =====================================================

-- Eliminar todas las políticas existentes de las tablas jerárquicas
DROP POLICY IF EXISTS "Super admins can manage platforms" ON platforms;
DROP POLICY IF EXISTS "Users can view their platform organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view their sub-organizations" ON sub_organizations;
DROP POLICY IF EXISTS "Users can view their sub-workspaces" ON sub_workspaces;
DROP POLICY IF EXISTS "Users can view their hierarchical context" ON hierarchical_users;
DROP POLICY IF EXISTS "Users can view their branding configs" ON branding_configs;

-- =====================================================
-- PASO 2: Crear políticas RLS simples y seguras
-- =====================================================

-- Política para plataformas (permitir lectura a todos, escritura solo a super admins)
CREATE POLICY "platforms_select_policy" ON platforms
    FOR SELECT USING (true);

CREATE POLICY "platforms_insert_policy" ON platforms
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'SUPER_ADMIN_VT');

CREATE POLICY "platforms_update_policy" ON platforms
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'SUPER_ADMIN_VT');

CREATE POLICY "platforms_delete_policy" ON platforms
    FOR DELETE USING (auth.jwt() ->> 'role' = 'SUPER_ADMIN_VT');

-- Política para organizaciones (permitir lectura a todos, escritura a usuarios autenticados)
CREATE POLICY "organizations_select_policy" ON organizations
    FOR SELECT USING (true);

CREATE POLICY "organizations_insert_policy" ON organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "organizations_update_policy" ON organizations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "organizations_delete_policy" ON organizations
    FOR DELETE USING (auth.jwt() ->> 'role' = 'SUPER_ADMIN_VT');

-- Política para workspaces (permitir lectura a todos, escritura a usuarios autenticados)
CREATE POLICY "workspaces_select_policy" ON workspaces
    FOR SELECT USING (true);

CREATE POLICY "workspaces_insert_policy" ON workspaces
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "workspaces_update_policy" ON workspaces
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "workspaces_delete_policy" ON workspaces
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para sub-organizaciones
CREATE POLICY "sub_organizations_select_policy" ON sub_organizations
    FOR SELECT USING (true);

CREATE POLICY "sub_organizations_insert_policy" ON sub_organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "sub_organizations_update_policy" ON sub_organizations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "sub_organizations_delete_policy" ON sub_organizations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para sub-workspaces
CREATE POLICY "sub_workspaces_select_policy" ON sub_workspaces
    FOR SELECT USING (true);

CREATE POLICY "sub_workspaces_insert_policy" ON sub_workspaces
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "sub_workspaces_update_policy" ON sub_workspaces
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "sub_workspaces_delete_policy" ON sub_workspaces
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para usuarios jerárquicos
CREATE POLICY "hierarchical_users_select_policy" ON hierarchical_users
    FOR SELECT USING (true);

CREATE POLICY "hierarchical_users_insert_policy" ON hierarchical_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "hierarchical_users_update_policy" ON hierarchical_users
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "hierarchical_users_delete_policy" ON hierarchical_users
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para configuración de branding
CREATE POLICY "branding_configs_select_policy" ON branding_configs
    FOR SELECT USING (true);

CREATE POLICY "branding_configs_insert_policy" ON branding_configs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "branding_configs_update_policy" ON branding_configs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "branding_configs_delete_policy" ON branding_configs
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- PASO 3: Verificar que las políticas se crearon correctamente
-- =====================================================

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 4: Verificar que las tablas son accesibles
-- =====================================================

-- Probar acceso a las tablas
SELECT 'platforms' as tabla, COUNT(*) as registros FROM platforms
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'workspaces', COUNT(*) FROM workspaces
UNION ALL
SELECT 'sub_organizations', COUNT(*) FROM sub_organizations
UNION ALL
SELECT 'sub_workspaces', COUNT(*) FROM sub_workspaces
UNION ALL
SELECT 'hierarchical_users', COUNT(*) FROM hierarchical_users
UNION ALL
SELECT 'branding_configs', COUNT(*) FROM branding_configs; 