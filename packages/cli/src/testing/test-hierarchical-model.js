/**
 * Script de Prueba Automatizada del Modelo Jerárquico
 * Valida la creación de organizaciones, workspaces, usuarios y clientes anidados
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// =====================================================
// FUNCIONES DE PRUEBA
// =====================================================

/**
 * Prueba 1: Crear Plataforma
 */
async function testCreatePlatform() {
  logInfo('Prueba 1: Creando plataforma AI Pair...');
  
  try {
    // Verificar si la plataforma ya existe
    const { data: existingPlatform } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'ai-pair')
      .single();

    if (existingPlatform) {
      logSuccess('Plataforma ya existe');
      return existingPlatform.id;
    }

    // Crear nueva plataforma
    const { data: platform, error } = await supabase
      .from('platforms')
      .insert([{
        name: 'AI Pair Platform',
        slug: 'ai-pair',
        domain: 'ai-pair.com',
        settings: {
          features: {
            ai_chat: true,
            command_xtr: true,
            document_xtr: true
          }
        }
      }])
      .select('id')
      .single();

    if (error) throw error;

    logSuccess(`Plataforma creada con ID: ${platform.id}`);
    return platform.id;
  } catch (error) {
    logError(`Error creando plataforma: ${error.message}`);
    throw error;
  }
}

/**
 * Prueba 2: Crear Organizaciones con Diferentes Planes
 */
async function testCreateOrganizations(platformId) {
  logInfo('Prueba 2: Creando organizaciones con diferentes planes...');
  
  const organizations = [
    {
      name: 'Empresa Básica S.A.',
      slug: 'empresa-basica',
      type: 'customer',
      plan_type: 'free',
      plan_limits: { users: 5, storage: '1GB', ai_requests: 100 }
    },
    {
      name: 'Empresa Pro Ltda.',
      slug: 'empresa-pro',
      type: 'customer',
      plan_type: 'pro',
      plan_limits: { users: 25, storage: '10GB', ai_requests: 1000 }
    },
    {
      name: 'Empresa Enterprise Corp.',
      slug: 'empresa-enterprise',
      type: 'customer',
      plan_type: 'enterprise',
      plan_limits: { users: 100, storage: '100GB', ai_requests: 10000 }
    }
  ];

  const createdOrgs = [];

  for (const orgData of organizations) {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert([{
          platform_id: platformId,
          name: orgData.name,
          slug: orgData.slug,
          type: orgData.type,
          plan_type: orgData.plan_type,
          plan_limits: orgData.plan_limits,
          branding: {
            primary_color: orgData.plan_type === 'free' ? '#6b7280' : 
                          orgData.plan_type === 'pro' ? '#3b82f6' : '#10b981',
            custom_texts: {
              'dashboard.title': `${orgData.name} - Panel de Control`,
              'welcome.message': `Bienvenido a ${orgData.name}`
            }
          },
          settings: {
            features: {
              ai_chat: true,
              command_xtr: orgData.plan_type !== 'free',
              document_xtr: orgData.plan_type === 'enterprise'
            }
          }
        }])
        .select('*')
        .single();

      if (error) throw error;

      logSuccess(`Organización "${org.name}" creada (Plan: ${org.plan_type})`);
      createdOrgs.push(org);
    } catch (error) {
      logError(`Error creando organización "${orgData.name}": ${error.message}`);
    }
  }

  return createdOrgs;
}

/**
 * Prueba 3: Crear Workspaces
 */
async function testCreateWorkspaces(organizations) {
  logInfo('Prueba 3: Creando workspaces...');
  
  const workspaces = [
    { name: 'Departamento de Marketing', slug: 'marketing', type: 'department' },
    { name: 'Equipo de Ventas', slug: 'ventas', type: 'team' },
    { name: 'Proyecto Alpha', slug: 'proyecto-alpha', type: 'project' },
    { name: 'Soporte Técnico', slug: 'soporte', type: 'department' }
  ];

  const createdWorkspaces = [];

  for (const org of organizations) {
    for (const wsData of workspaces) {
      try {
        const { data: workspace, error } = await supabase
          .from('workspaces')
          .insert([{
            organization_id: org.id,
            name: `${wsData.name} - ${org.name}`,
            slug: `${org.slug}-${wsData.slug}`,
            type: wsData.type,
            settings: {
              features: {
                ai_chat: true,
                command_xtr: org.plan_type !== 'free'
              }
            },
            branding: {
              primary_color: '#f59e0b',
              custom_texts: {
                'workspace.title': `${wsData.name} - ${org.name}`
              }
            }
          }])
          .select('*')
          .single();

        if (error) throw error;

        logSuccess(`Workspace "${workspace.name}" creado`);
        createdWorkspaces.push(workspace);
      } catch (error) {
        logError(`Error creando workspace: ${error.message}`);
      }
    }
  }

  return createdWorkspaces;
}

/**
 * Prueba 4: Crear Sub-Organizaciones (Clientes de Clientes)
 */
async function testCreateSubOrganizations(organizations) {
  logInfo('Prueba 4: Creando sub-organizaciones (clientes de clientes)...');
  
  const subOrganizations = [
    { name: 'Cliente A', slug: 'cliente-a', type: 'client' },
    { name: 'Cliente B', slug: 'cliente-b', type: 'client' },
    { name: 'Proveedor X', slug: 'proveedor-x', type: 'vendor' },
    { name: 'Partner Y', slug: 'partner-y', type: 'partner' }
  ];

  const createdSubOrgs = [];

  for (const org of organizations) {
    for (const subOrgData of subOrganizations) {
      try {
        const { data: subOrg, error } = await supabase
          .from('sub_organizations')
          .insert([{
            parent_organization_id: org.id,
            name: `${subOrgData.name} - ${org.name}`,
            slug: `${org.slug}-${subOrgData.slug}`,
            type: subOrgData.type,
            settings: {
              features: {
                ai_chat: true
              }
            },
            branding: {
              primary_color: '#8b5cf6',
              custom_texts: {
                'client.title': `${subOrgData.name} - ${org.name}`
              }
            },
            relationship_data: {
              contract_type: 'standard',
              start_date: new Date().toISOString(),
              contract_value: Math.floor(Math.random() * 50000) + 5000,
              payment_terms: '30 días'
            }
          }])
          .select('*')
          .single();

        if (error) throw error;

        logSuccess(`Sub-organización "${subOrg.name}" creada`);
        createdSubOrgs.push(subOrg);
      } catch (error) {
        logError(`Error creando sub-organización: ${error.message}`);
      }
    }
  }

  return createdSubOrgs;
}

/**
 * Prueba 5: Crear Usuarios Jerárquicos
 */
async function testCreateHierarchicalUsers(organizations, workspaces, subOrganizations) {
  logInfo('Prueba 5: Creando usuarios jerárquicos...');
  
  const createdUsers = [];

  // Crear usuarios para organizaciones
  for (const org of organizations) {
    for (const role of ['OWNER_CUST', 'ADMIN_CUST', 'MANAGER_CUST', 'EMPLOYEE_CUST']) {
      try {
        const mockUserId = `mock-user-${org.id}-${role}-${Date.now()}`;
        
        const { data: user, error } = await supabase
          .from('hierarchical_users')
          .insert([{
            user_id: mockUserId,
            platform_id: 'mock-platform-id',
            organization_id: org.id,
            workspace_id: null,
            sub_organization_id: null,
            sub_workspace_id: null,
            role: role,
            permissions: [],
            status: 'active'
          }])
          .select('*')
          .single();

        if (error) throw error;

        logSuccess(`Usuario ${role} creado para "${org.name}"`);
        createdUsers.push(user);
      } catch (error) {
        logError(`Error creando usuario ${role}: ${error.message}`);
      }
    }
  }

  // Crear usuarios para workspaces
  for (const workspace of workspaces) {
    try {
      const mockUserId = `mock-user-ws-${workspace.id}-${Date.now()}`;
      
      const { data: user, error } = await supabase
        .from('hierarchical_users')
        .insert([{
          user_id: mockUserId,
          platform_id: 'mock-platform-id',
          organization_id: workspace.organization_id,
          workspace_id: workspace.id,
          sub_organization_id: null,
          sub_workspace_id: null,
          role: 'MANAGER_CUST',
          permissions: [],
          status: 'active'
        }])
        .select('*')
        .single();

        if (error) throw error;

        logSuccess(`Usuario creado para workspace "${workspace.name}"`);
        createdUsers.push(user);
      } catch (error) {
        logError(`Error creando usuario para workspace: ${error.message}`);
      }
    }
  }

  return createdUsers;
}

/**
 * Prueba 6: Crear Configuraciones de Branding
 */
async function testCreateBrandingConfigs(organizations, workspaces, subOrganizations) {
  logInfo('Prueba 6: Creando configuraciones de branding...');
  
  const createdConfigs = [];

  // Branding para organizaciones
  for (const org of organizations) {
    try {
      const { data: config, error } = await supabase
        .from('branding_configs')
        .insert([{
          platform_id: 'mock-platform-id',
          organization_id: org.id,
          workspace_id: null,
          sub_organization_id: null,
          sub_workspace_id: null,
          logo_url: `https://example.com/logos/${org.slug}.png`,
          primary_color: org.plan_type === 'free' ? '#6b7280' : 
                        org.plan_type === 'pro' ? '#3b82f6' : '#10b981',
          secondary_color: '#64748b',
          accent_color: '#f59e0b',
          custom_texts: {
            'dashboard.title': `${org.name} - Panel de Control`,
            'welcome.message': `Bienvenido a ${org.name}`,
            'footer.text': `© 2024 ${org.name}. Todos los derechos reservados.`
          },
          default_language: 'es',
          supported_languages: ['es', 'en']
        }])
        .select('*')
        .single();

      if (error) throw error;

      logSuccess(`Branding creado para "${org.name}"`);
      createdConfigs.push(config);
    } catch (error) {
      logError(`Error creando branding para organización: ${error.message}`);
    }
  }

  return createdConfigs;
}

/**
 * Prueba 7: Validar Aislamiento de Datos
 */
async function testDataIsolation(organizations) {
  logInfo('Prueba 7: Validando aislamiento de datos...');
  
  try {
    // Intentar acceder a datos de otra organización
    const { data: crossOrgData, error } = await supabase
      .from('organizations')
      .select('*')
      .neq('id', organizations[0].id)
      .limit(1);

    if (error) {
      logError(`Error en aislamiento de datos: ${error.message}`);
      return false;
    }

    // Verificar que las políticas RLS están funcionando
    if (crossOrgData && crossOrgData.length > 0) {
      logWarning('⚠️  Las políticas RLS podrían no estar funcionando correctamente');
      return false;
    }

    logSuccess('Aislamiento de datos validado correctamente');
    return true;
  } catch (error) {
    logError(`Error validando aislamiento: ${error.message}`);
    return false;
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function runAllTests() {
  log('🚀 Iniciando pruebas del modelo jerárquico...', 'bright');
  log('', 'reset');

  const results = {
    platform: null,
    organizations: [],
    workspaces: [],
    subOrganizations: [],
    users: [],
    branding: [],
    dataIsolation: false
  };

  try {
    // Ejecutar todas las pruebas
    results.platform = await testCreatePlatform();
    results.organizations = await testCreateOrganizations(results.platform);
    results.workspaces = await testCreateWorkspaces(results.organizations);
    results.subOrganizations = await testCreateSubOrganizations(results.organizations);
    results.users = await testCreateHierarchicalUsers(results.organizations, results.workspaces, results.subOrganizations);
    results.branding = await testCreateBrandingConfigs(results.organizations, results.workspaces, results.subOrganizations);
    results.dataIsolation = await testDataIsolation(results.organizations);

    // Resumen final
    log('', 'reset');
    log('📊 RESUMEN DE PRUEBAS', 'bright');
    log('====================', 'bright');
    log(`✅ Plataforma: ${results.platform ? 'Creada' : 'Error'}`, results.platform ? 'green' : 'red');
    log(`✅ Organizaciones: ${results.organizations.length} creadas`, 'green');
    log(`✅ Workspaces: ${results.workspaces.length} creados`, 'green');
    log(`✅ Sub-organizaciones: ${results.subOrganizations.length} creadas`, 'green');
    log(`✅ Usuarios: ${results.users.length} creados`, 'green');
    log(`✅ Configuraciones de branding: ${results.branding.length} creadas`, 'green');
    log(`✅ Aislamiento de datos: ${results.dataIsolation ? 'Validado' : 'Error'}`, results.dataIsolation ? 'green' : 'red');

    log('', 'reset');
    log('🎉 ¡Todas las pruebas completadas!', 'green');

  } catch (error) {
    logError(`Error en las pruebas: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testCreatePlatform,
  testCreateOrganizations,
  testCreateWorkspaces,
  testCreateSubOrganizations,
  testCreateHierarchicalUsers,
  testCreateBrandingConfigs,
  testDataIsolation
}; 