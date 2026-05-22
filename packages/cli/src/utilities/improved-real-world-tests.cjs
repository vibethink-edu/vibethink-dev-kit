const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// PRUEBAS MEJORADAS DE CASOS DE USO REALES
// =====================================================

async function createImprovedScenario() {
  console.log('🌍 Creando escenario mejorado de arquitectura jerárquica...\n');
  
  // =====================================================
  // ESCENARIO 1: PLATAFORMA PRINCIPAL (SUPER_ADMIN)
  // =====================================================
  console.log('🏢 ESCENARIO 1: AI Pair Platform (SUPER_ADMIN)');
  console.log('   - Administra todo el ecosistema');
  console.log('   - Gestiona múltiples empresas cliente');
  console.log('   - Monitorea uso y facturación global\n');
  
  try {
    // Usar una plataforma existente o crear una nueva con slug único
    const { data: existingPlatforms, error: checkError } = await supabase
      .from('platforms')
      .select('id, name, slug')
      .eq('slug', 'ai-pair-platform')
      .limit(1);
    
    let platformId;
    
    if (checkError) {
      console.log(`❌ Error verificando plataforma: ${checkError.message}`);
      return;
    }
    
    if (existingPlatforms && existingPlatforms.length > 0) {
      platformId = existingPlatforms[0].id;
      console.log(`✅ Usando plataforma existente: ${existingPlatforms[0].name}`);
    } else {
      // Crear nueva plataforma con slug único
      const { data: newPlatform, error: platformError } = await supabase
        .from('platforms')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440020',
          name: 'AI Pair Platform Pro',
          slug: 'ai-pair-platform-pro',
          status: 'active',
          description: 'Plataforma principal que administra todo el ecosistema SaaS'
        })
        .select()
        .single();
      
      if (platformError) {
        console.log(`❌ Error creando plataforma: ${platformError.message}`);
        return;
      } else {
        platformId = newPlatform.id;
        console.log(`✅ Nueva plataforma creada: ${newPlatform.name}`);
      }
    }
    
    // Crear usuario SUPER_ADMIN
    const { data: superAdmin, error: adminError } = await supabase
      .from('users')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440021',
        email: 'superadmin@aipairplatform.com',
        full_name: 'Super Administrador Global',
        role: 'SUPER_ADMIN_VT',
        platform_id: platformId
      })
      .select()
      .single();
    
    if (adminError) {
      console.log(`❌ Error creando SUPER_ADMIN: ${adminError.message}`);
    } else {
      console.log(`✅ SUPER_ADMIN creado: ${superAdmin.full_name} (${superAdmin.role})`);
    }
    
  } catch (error) {
    console.log(`❌ Error en Escenario 1: ${error.message}`);
  }
  
  // =====================================================
  // ESCENARIO 2: EMPRESA CLIENTE PREMIUM (OWNER_CUST)
  // =====================================================
  console.log('\n🏢 ESCENARIO 2: Empresa XYZ (OWNER_CUST)');
  console.log('   - Cliente premium que paga por plan');
  console.log('   - Administra sus propios clientes');
  console.log('   - Tiene branding personalizado\n');
  
  try {
    // Obtener una plataforma válida
    const { data: platforms, error: platformsError } = await supabase
      .from('platforms')
      .select('id')
      .limit(1);
    
    if (platformsError || !platforms || platforms.length === 0) {
      console.log('❌ No hay plataformas disponibles');
      return;
    }
    
    const platformId = platforms[0].id;
    
    // Crear empresa cliente premium
    const { data: premiumCompany, error: companyError } = await supabase
      .from('organizations')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440022',
        name: 'Empresa XYZ Premium S.A.',
        slug: 'empresa-xyz-premium',
        platform_id: platformId,
        status: 'active',
        plan_type: 'premium',
        max_users: 100,
        max_clients: 50
      })
      .select()
      .single();
    
    if (companyError) {
      console.log(`❌ Error creando empresa premium: ${companyError.message}`);
    } else {
      console.log(`✅ Empresa premium creada: ${premiumCompany.name} (Plan: ${premiumCompany.plan_type})`);
    }
    
    // Crear workspace principal de la empresa
    const { data: mainWorkspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440023',
        name: 'Workspace Principal XYZ Premium',
        slug: 'xyz-premium-main',
        organization_id: premiumCompany.id,
        status: 'active',
        description: 'Workspace principal para administración de clientes premium'
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.log(`❌ Error creando workspace: ${workspaceError.message}`);
    } else {
      console.log(`✅ Workspace creado: ${mainWorkspace.name}`);
    }
    
    // Crear OWNER de la empresa
    const { data: companyOwner, error: ownerError } = await supabase
      .from('users')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440024',
        email: 'owner@empresaxyzpremium.com',
        full_name: 'Juan Pérez - CEO Premium',
        role: 'OWNER_CUST',
        company_id: premiumCompany.id,
        platform_id: platformId
      })
      .select()
      .single();
    
    if (ownerError) {
      console.log(`❌ Error creando OWNER: ${ownerError.message}`);
    } else {
      console.log(`✅ OWNER creado: ${companyOwner.full_name} (${companyOwner.role})`);
    }
    
    // Crear branding personalizado
    const { data: branding, error: brandingError } = await supabase
      .from('branding')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440025',
        company_id: premiumCompany.id,
        platform_id: platformId,
        logo_url: 'https://empresaxyzpremium.com/logo.png',
        primary_color: '#2563eb',
        secondary_color: '#1e40af',
        company_name: 'Empresa XYZ Premium S.A.',
        theme: 'modern'
      })
      .select()
      .single();
    
    if (brandingError) {
      console.log(`❌ Error creando branding: ${brandingError.message}`);
    } else {
      console.log(`✅ Branding creado: ${branding.company_name} (${branding.primary_color})`);
    }
    
  } catch (error) {
    console.log(`❌ Error en Escenario 2: ${error.message}`);
  }
  
  // =====================================================
  // ESCENARIO 3: CLIENTES DE LA EMPRESA (Roles _CLI)
  // =====================================================
  console.log('\n🏢 ESCENARIO 3: Clientes de Empresa XYZ (Roles _CLI)');
  console.log('   - Cliente A: Pequeña empresa (ADMIN_CLI)');
  console.log('   - Cliente B: Consultora (MANAGER_CLI)');
  console.log('   - Cliente C: Startup (EMPLOYEE_CLI)\n');
  
  try {
    // Obtener una organización válida
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgsError || !organizations || organizations.length === 0) {
      console.log('❌ No hay organizaciones disponibles');
      return;
    }
    
    const organizationId = organizations[0].id;
    
    // Cliente A: Pequeña empresa
    const { data: clientA, error: clientAError } = await supabase
      .from('sub_organizations')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440026',
        name: 'Cliente A - Pequeña Empresa Premium',
        slug: 'cliente-a-premium',
        parent_organization_id: organizationId,
        status: 'active',
        plan_type: 'basic',
        max_users: 10
      })
      .select()
      .single();
    
    if (clientAError) {
      console.log(`❌ Error creando Cliente A: ${clientAError.message}`);
    } else {
      console.log(`✅ Cliente A creado: ${clientA.name} (Plan: ${clientA.plan_type})`);
    }
    
    // Usuario ADMIN_CLI para Cliente A
    const { data: adminCliA, error: adminCliAError } = await supabase
      .from('users')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440027',
        email: 'admin@clienteapremium.com',
        full_name: 'María García - Admin Cliente A Premium',
        role: 'ADMIN_CLI',
        company_id: organizationId,
        platform_id: '550e8400-e29b-41d4-a716-446655440020'
      })
      .select()
      .single();
    
    if (adminCliAError) {
      console.log(`❌ Error creando ADMIN_CLI A: ${adminCliAError.message}`);
    } else {
      console.log(`✅ ADMIN_CLI A creado: ${adminCliA.full_name} (${adminCliA.role})`);
    }
    
    // Cliente B: Consultora
    const { data: clientB, error: clientBError } = await supabase
      .from('sub_organizations')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440028',
        name: 'Cliente B - Consultora Premium',
        slug: 'cliente-b-premium',
        parent_organization_id: organizationId,
        status: 'active',
        plan_type: 'professional',
        max_users: 25
      })
      .select()
      .single();
    
    if (clientBError) {
      console.log(`❌ Error creando Cliente B: ${clientBError.message}`);
    } else {
      console.log(`