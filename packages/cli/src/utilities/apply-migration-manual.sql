-- =====================================================
-- SCRIPT DE APLICACIÓN MANUAL - SISTEMA DE PERMISOS DEPARTAMENTALES
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a SQL Editor
-- 4. Copia y pega todo este contenido
-- 5. Ejecuta el script
-- 
-- Autor: AI Pair Platform Team
-- Versión: 1.0.0
-- =====================================================

-- =====================================================
-- 1. TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- Tabla de departamentos
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  manager_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(company_id, code),
  CHECK (id != parent_department_id) -- Evitar auto-referencia
);

-- Tabla de permisos departamentales
CREATE TABLE IF NOT EXISTS public.department_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(department_id, permission)
);

-- Tabla de acceso a datos por departamento
CREATE TABLE IF NOT EXISTS public.department_data_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  data_path TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  conditions JSONB DEFAULT NULL,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(department_id, data_path)
);

-- Tabla de membresía de usuarios en departamentos
CREATE TABLE IF NOT EXISTS public.user_department_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_in_department TEXT NOT NULL CHECK (role_in_department IN ('MEMBER', 'LEAD', 'MANAGER')),
  primary_department BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  UNIQUE(user_id, department_id)
);

-- =====================================================
-- 2. SISTEMA DE LOGGING OPTIMIZADO
-- =====================================================

-- Tabla de logs de permisos (optimizada para performance)
CREATE TABLE IF NOT EXISTS public.permission_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  action TEXT NOT NULL CHECK (action IN ('GRANT', 'REVOKE', 'CHECK', 'ACCESS', 'DENIED')),
  resource_type TEXT NOT NULL, -- 'PERMISSION', 'DATA_ACCESS', 'DEPARTMENT'
  resource_id TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de logs de acceso a datos (separada para performance)
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  data_path TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('READ', 'CREATE', 'UPDATE', 'DELETE')),
  success BOOLEAN NOT NULL,
  query_duration_ms INTEGER,
  rows_affected INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 3. ÍNDICES OPTIMIZADOS PARA PERFORMANCE
-- =====================================================

-- Índices principales
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON public.departments(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);

CREATE INDEX IF NOT EXISTS idx_department_permissions_dept ON public.department_permissions(department_id);
CREATE INDEX IF NOT EXISTS idx_department_permissions_active ON public.department_permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_department_data_access_dept ON public.department_data_access(department_id);
CREATE INDEX IF NOT EXISTS idx_department_data_access_path ON public.department_data_access(data_path);
CREATE INDEX IF NOT EXISTS idx_department_data_access_active ON public.department_data_access(is_active);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON public.user_department_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_dept ON public.user_department_memberships(department_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_active ON public.user_department_memberships(is_active);
CREATE INDEX IF NOT EXISTS idx_user_memberships_primary ON public.user_department_memberships(primary_department);

-- Índices para logging (optimizados para consultas frecuentes)
CREATE INDEX IF NOT EXISTS idx_permission_logs_user_time ON public.permission_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permission_logs_company_time ON public.permission_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permission_logs_action_time ON public.permission_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_time ON public.data_access_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_company_time ON public.data_access_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_success_time ON public.data_access_logs(success, created_at DESC);

-- =====================================================
-- 4. FUNCIONES DE VERIFICACIÓN DE PERMISOS
-- =====================================================

-- Función para verificar permisos departamentales
CREATE OR REPLACE FUNCTION has_department_permission(
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  has_perm BOOLEAN := false;
  start_time TIMESTAMP := clock_timestamp();
BEGIN
  -- Verificar si el usuario tiene el permiso a través de sus departamentos
  SELECT EXISTS (
    SELECT 1 
    FROM user_department_memberships udm
    JOIN department_permissions dp ON udm.department_id = dp.department_id
    WHERE udm.user_id = p_user_id
      AND udm.is_active = true
      AND dp.permission = p_permission
      AND dp.is_active = true
  ) INTO has_perm;
  
  -- Log de verificación (solo si no es exitosa para reducir ruido)
  IF NOT has_perm THEN
    INSERT INTO permission_logs (
      user_id, 
      company_id, 
      action, 
      resource_type, 
      resource_id, 
      metadata
    )
    SELECT 
      p_user_id,
      up.company_id,
      'CHECK',
      'PERMISSION',
      p_permission,
      jsonb_build_object(
        'result', 'DENIED',
        'duration_ms', extract(milliseconds from clock_timestamp() - start_time),
        'departments', array_agg(udm.department_id)
      )
    FROM user_profiles up
    LEFT JOIN user_department_memberships udm ON up.id = udm.user_id
    WHERE up.id = p_user_id
    GROUP BY up.company_id;
  END IF;
  
  RETURN has_perm;
END;
$$;

-- Función para verificar acceso a datos
CREATE OR REPLACE FUNCTION has_data_access(
  p_user_id UUID,
  p_data_path TEXT,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  has_access BOOLEAN := false;
  user_departments UUID[];
  start_time TIMESTAMP := clock_timestamp();
BEGIN
  -- Obtener departamentos del usuario
  SELECT array_agg(department_id) INTO user_departments
  FROM user_department_memberships
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Verificar acceso usando wildcards
  SELECT EXISTS (
    SELECT 1 
    FROM department_data_access dda
    WHERE dda.department_id = ANY(user_departments)
      AND dda.is_active = true
      AND (
        dda.data_path = p_data_path
        OR dda.data_path LIKE REPLACE(p_data_path, '*', '%')
        OR p_data_path LIKE REPLACE(dda.data_path, '*', '%')
      )
      AND p_action = ANY(dda.permissions::text[])
  ) INTO has_access;
  
  -- Log de verificación
  INSERT INTO permission_logs (
    user_id, 
    company_id, 
    action, 
    resource_type, 
    resource_id, 
    department_id,
    metadata
  )
  SELECT 
    p_user_id,
    up.company_id,
    CASE WHEN has_access THEN 'CHECK' ELSE 'DENIED' END,
    'DATA_ACCESS',
    p_data_path,
    udm.department_id,
    jsonb_build_object(
      'action', p_action,
      'result', CASE WHEN has_access THEN 'GRANTED' ELSE 'DENIED' END,
      'duration_ms', extract(milliseconds from clock_timestamp() - start_time),
      'user_departments', user_departments
    )
  FROM user_profiles up
  LEFT JOIN user_department_memberships udm ON up.id = udm.user_id AND udm.is_active = true
  WHERE up.id = p_user_id
  LIMIT 1;
  
  RETURN has_access;
END;
$$;

-- Función para obtener departamentos de un usuario
CREATE OR REPLACE FUNCTION get_user_departments(p_user_id UUID)
RETURNS TABLE(
  department_id UUID,
  department_name TEXT,
  department_code TEXT,
  role_in_department TEXT,
  is_primary BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.code,
    udm.role_in_department,
    udm.primary_department
  FROM user_department_memberships udm
  JOIN departments d ON udm.department_id = d.id
  WHERE udm.user_id = p_user_id 
    AND udm.is_active = true
    AND d.is_active = true
  ORDER BY udm.primary_department DESC, d.name;
END;
$$;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_data_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_department_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios ven departamentos de su empresa
CREATE POLICY "Users see company departments" ON public.departments
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
    OR
    -- SUPPORT puede ver todos los departamentos
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.companies c ON up.company_id = c.id
      WHERE up.id = auth.uid() 
      AND up.role = 'SUPPORT'
      AND c.slug = 'aipair-platform'
    )
  );

-- Policy: Solo ADMIN+ gestionan departamentos
CREATE POLICY "Admins manage departments" ON public.departments
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Usuarios ven permisos de sus departamentos
CREATE POLICY "Users see department permissions" ON public.department_permissions
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM public.user_department_memberships 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    -- ADMIN+ pueden ver todos los permisos de su empresa
    department_id IN (
      SELECT d.id FROM departments d
      JOIN user_profiles up ON d.company_id = up.company_id
      WHERE up.id = auth.uid() AND up.role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Solo ADMIN+ gestionan permisos
CREATE POLICY "Admins manage permissions" ON public.department_permissions
  FOR ALL USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN user_profiles up ON d.company_id = up.company_id
      WHERE up.id = auth.uid() AND up.role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Usuarios ven sus propias membresías
CREATE POLICY "Users see their memberships" ON public.user_department_memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    -- ADMIN+ pueden ver todas las membresías de su empresa
    department_id IN (
      SELECT d.id FROM departments d
      JOIN user_profiles up ON d.company_id = up.company_id
      WHERE up.id = auth.uid() AND up.role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Solo ADMIN+ gestionan membresías
CREATE POLICY "Admins manage memberships" ON public.user_department_memberships
  FOR ALL USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN user_profiles up ON d.company_id = up.company_id
      WHERE up.id = auth.uid() AND up.role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Usuarios ven logs de su empresa (solo ADMIN+)
CREATE POLICY "Admins see permission logs" ON public.permission_logs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Policy: Usuarios ven logs de acceso de su empresa (solo ADMIN+)
CREATE POLICY "Admins see data access logs" ON public.data_access_logs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 6. TRIGGERS PARA LOGGING AUTOMÁTICO
-- =====================================================

-- Trigger para log automático de cambios en departamentos
CREATE OR REPLACE FUNCTION log_department_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO permission_logs (
      user_id,
      company_id,
      action,
      resource_type,
      resource_id,
      department_id,
      metadata
    )
    VALUES (
      auth.uid(),
      NEW.company_id,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'GRANT'
        WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
        WHEN TG_OP = 'DELETE' THEN 'REVOKE'
      END,
      'DEPARTMENT',
      NEW.code,
      NEW.id,
      jsonb_build_object(
        'operation', TG_OP,
        'department_name', NEW.name,
        'old_values', to_jsonb(OLD),
        'new_values', to_jsonb(NEW)
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_log_department_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION log_department_changes();

-- Trigger para log automático de cambios en permisos
CREATE OR REPLACE FUNCTION log_permission_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO permission_logs (
      user_id,
      company_id,
      action,
      resource_type,
      resource_id,
      department_id,
      metadata
    )
    SELECT 
      auth.uid(),
      d.company_id,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'GRANT'
        WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
        WHEN TG_OP = 'DELETE' THEN 'REVOKE'
      END,
      'PERMISSION',
      COALESCE(NEW.permission, OLD.permission),
      COALESCE(NEW.department_id, OLD.department_id),
      jsonb_build_object(
        'operation', TG_OP,
        'permission', COALESCE(NEW.permission, OLD.permission),
        'old_values', to_jsonb(OLD),
        'new_values', to_jsonb(NEW)
      )
    FROM departments d
    WHERE d.id = COALESCE(NEW.department_id, OLD.department_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_log_permission_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.department_permissions
  FOR EACH ROW EXECUTE FUNCTION log_permission_changes();

-- =====================================================
-- 7. FUNCIONES DE LIMPIEZA AUTOMÁTICA
-- =====================================================

-- Función para limpiar logs antiguos (ejecutar mensualmente)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar logs de permisos más antiguos de 90 días
  DELETE FROM permission_logs 
  WHERE created_at < now() - interval '90 days';
  
  -- Eliminar logs de acceso más antiguos de 60 días
  DELETE FROM data_access_logs 
  WHERE created_at < now() - interval '60 days';
  
  -- Log de limpieza
  INSERT INTO permission_logs (
    user_id,
    company_id,
    action,
    resource_type,
    resource_id,
    metadata
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID, -- System user
    '00000000-0000-0000-0000-000000000000'::UUID, -- System company
    'CLEANUP',
    'SYSTEM',
    'LOG_CLEANUP',
    jsonb_build_object(
      'operation', 'cleanup_old_logs',
      'timestamp', now(),
      'permission_logs_deleted', (SELECT count(*) FROM permission_logs WHERE created_at < now() - interval '90 days'),
      'data_access_logs_deleted', (SELECT count(*) FROM data_access_logs WHERE created_at < now() - interval '60 days')
    )
  );
END;
$$;

-- =====================================================
-- 8. DATOS INICIALES PARA TESTING
-- =====================================================

-- Insertar departamentos por defecto para empresas existentes
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN SELECT id, name FROM companies WHERE status = 'ACTIVE'
  LOOP
    -- Insertar departamentos básicos para cada empresa
    INSERT INTO departments (company_id, code, name, description) VALUES
    (company_record.id, 'GENERAL', 'General', 'Departamento general de la empresa'),
    (company_record.id, 'MANAGEMENT', 'Gerencia', 'Equipo de gestión y administración'),
    (company_record.id, 'OPERATIONS', 'Operaciones', 'Operaciones diarias de la empresa')
    ON CONFLICT (company_id, code) DO NOTHING;
  END LOOP;
END;
$$;

-- =====================================================
-- 9. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de Permisos Departamentales aplicado exitosamente!';
  RAISE NOTICE '📊 Tablas creadas: departments, department_permissions, department_data_access, user_department_memberships, permission_logs, data_access_logs';
  RAISE NOTICE '🔧 Funciones creadas: has_department_permission, has_data_access, get_user_departments, cleanup_old_logs';
  RAISE NOTICE '🔒 RLS Policies aplicadas para seguridad';
  RAISE NOTICE '📝 Triggers configurados para logging automático';
  RAISE NOTICE '🎯 El sistema está listo para usar en la aplicación!';
END;
$$; 