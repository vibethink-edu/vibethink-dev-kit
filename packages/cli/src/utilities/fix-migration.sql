-- Script corregido para aplicar migraciones jerárquicas
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- PASO 1: Verificar y crear tablas base si no existen
-- =====================================================

-- Crear tabla user_profiles si no existe
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'EMPLOYEE',
    company_id UUID,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Crear tabla audit_log si no existe
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    user_id UUID,
    company_id UUID,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- PASO 2: Aplicar migración de arquitectura jerárquica
-- =====================================================

-- Crear tabla de plataforma
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Crear tabla de organizaciones
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    domain TEXT UNIQUE,
    type TEXT DEFAULT 'customer' NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    plan_type TEXT DEFAULT 'free',
    plan_limits JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(platform_id, slug)
);

-- Crear tabla de workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT DEFAULT 'department' NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(organization_id, slug)
);

-- Crear tabla de sub-organizaciones
CREATE TABLE IF NOT EXISTS sub_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT DEFAULT 'client' NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    relationship_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(parent_organization_id, slug)
);

-- Crear tabla de sub-workspaces
CREATE TABLE IF NOT EXISTS sub_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_organization_id UUID NOT NULL REFERENCES sub_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT DEFAULT 'department' NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(sub_organization_id, slug)
);

-- Crear tabla de usuarios jerárquicos
CREATE TABLE IF NOT EXISTS hierarchical_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    sub_organization_id UUID REFERENCES sub_organizations(id) ON DELETE CASCADE,
    sub_workspace_id UUID REFERENCES sub_workspaces(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Crear tabla de configuración de branding
CREATE TABLE IF NOT EXISTS branding_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    sub_organization_id UUID REFERENCES sub_organizations(id) ON DELETE CASCADE,
    sub_workspace_id UUID REFERENCES sub_workspaces(id) ON DELETE CASCADE,
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    accent_color TEXT,
    custom_texts JSONB DEFAULT '{}',
    default_language TEXT DEFAULT 'es',
    supported_languages TEXT[] DEFAULT '{"es", "en"}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- PASO 3: Crear índices para optimización
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_organizations_platform ON organizations(platform_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_organization ON workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_sub_organizations_parent ON sub_organizations(parent_organization_id);
CREATE INDEX IF NOT EXISTS idx_sub_workspaces_sub_org ON sub_workspaces(sub_organization_id);
CREATE INDEX IF NOT EXISTS idx_hierarchical_users_context ON hierarchical_users(platform_id, organization_id, workspace_id, sub_organization_id, sub_workspace_id);
CREATE INDEX IF NOT EXISTS idx_hierarchical_users_user ON hierarchical_users(user_id);
CREATE INDEX IF NOT EXISTS idx_branding_configs_context ON branding_configs(platform_id, organization_id, workspace_id, sub_organization_id, sub_workspace_id);

-- =====================================================
-- PASO 4: Crear datos de prueba iniciales
-- =====================================================

-- Insertar plataforma por defecto
INSERT INTO platforms (id, name, slug, domain) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'AI Pair Platform',
    'ai-pair-platform',
    'vibethink.co'
) ON CONFLICT (slug) DO NOTHING;

-- Insertar organización por defecto
INSERT INTO organizations (id, platform_id, name, slug, type) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'AI Pair Organization',
    'ai-pair-org',
    'customer'
) ON CONFLICT (platform_id, slug) DO NOTHING;

-- Insertar workspace por defecto
INSERT INTO workspaces (id, organization_id, name, slug, type) 
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'AI Pair Workspace',
    'ai-pair-workspace',
    'department'
) ON CONFLICT (organization_id, slug) DO NOTHING;

-- =====================================================
-- PASO 5: Habilitar RLS en todas las tablas
-- =====================================================

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE hierarchical_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 6: Crear políticas RLS básicas
-- =====================================================

-- Política para plataformas (solo super admins)
CREATE POLICY "Super admins can manage platforms" ON platforms
    FOR ALL USING (auth.jwt() ->> 'role' = 'SUPER_ADMIN_AP');

-- Política para organizaciones (usuarios de la plataforma)
CREATE POLICY "Users can view their platform organizations" ON organizations
    FOR SELECT USING (true);

-- Política para workspaces (usuarios de la organización)
CREATE POLICY "Users can view their organization workspaces" ON workspaces
    FOR SELECT USING (true);

-- =====================================================
-- PASO 7: Verificar que todo se creó correctamente
-- =====================================================

-- Verificar tablas creadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs') 
        THEN '✅ Creada' 
        ELSE '❌ Faltante' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs')
ORDER BY table_name;

-- Verificar datos de prueba
SELECT 'Plataformas' as tipo, COUNT(*) as cantidad FROM platforms
UNION ALL
SELECT 'Organizaciones', COUNT(*) FROM organizations
UNION ALL
SELECT 'Workspaces', COUNT(*) FROM workspaces;

-- Verificar que las tablas se crearon
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('platforms', 'organizations', 'workspaces', 'sub_organizations', 'sub_workspaces', 'hierarchical_users', 'branding_configs')
ORDER BY table_name; 