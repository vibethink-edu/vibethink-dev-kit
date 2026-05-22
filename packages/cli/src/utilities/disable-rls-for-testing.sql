-- =====================================================
-- DESHABILITAR RLS TEMPORALMENTE PARA PRUEBAS
-- =====================================================

-- Deshabilitar RLS en todas las tablas
ALTER TABLE platforms DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE hierarchical_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs', 'users', 'branding')
ORDER BY tablename; 