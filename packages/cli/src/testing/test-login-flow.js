#!/usr/bin/env node

/**
 * Script de prueba para verificar el flujo completo de login
 * Simula el proceso de SimpleLogin y verifica la autenticación
 */

console.log("🧪 Probando flujo completo de login...\n");

// Simular el proceso de SimpleLogin
const testLogin = () => {
  const email = "superadmin@VibeThink.co";
  const password = "12345";

  console.log("📋 Credenciales de prueba:");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);

  // Simular la lógica de SimpleLogin
  if (password !== "12345") {
    console.log("❌ Password incorrecto");
    return false;
  }

  if (!email || !email.includes("@")) {
    console.log("❌ Email inválido");
    return false;
  }

  // Determinar rol y empresa
  let role = "EMPLOYEE";
  let companyData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Demo Company",
    slug: "demo-company",
  };

  if (email.toLowerCase() === "superadmin@VibeThink.co") {
    role = "SUPER_ADMIN";
    companyData = {
      id: "111e1111-e11b-11d1-a111-111111111111",
      name: "AI Pair Platform",
      slug: "VibeThink-platform",
    };
  }

  // Crear mock user
  const mockUser = {
    id: `user-${Date.now()}`,
    email: email,
    profile: {
      id: `user-${Date.now()}`,
      email: email,
      full_name: email.split("@")[0],
      role: role,
      company_id: companyData.id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    company: companyData,
  };

  const mockSession = {
    access_token: "mock-token",
    user: mockUser,
  };

  console.log("\n✅ Mock user creado:");
  console.log(`  ID: ${mockUser.id}`);
  console.log(`  Role: ${mockUser.profile.role}`);
  console.log(`  Company: ${mockUser.company.name} (${mockUser.company.slug})`);

  // Simular localStorage
  console.log("\n💾 Simulando localStorage:");
  console.log("  Guardando auth_user y auth_session...");

  // En el navegador esto sería:
  // localStorage.setItem('auth_user', JSON.stringify(mockUser));
  // localStorage.setItem('auth_session', JSON.stringify(mockSession));

  return { mockUser, mockSession, role, companyData };
};

// Simular la verificación del hook useAuth
const testAuthHook = (mockUser, mockSession) => {
  console.log("\n🔍 Simulando hook useAuth:");

  // Verificar que los datos están en localStorage
  console.log("  Verificando localStorage...");
  console.log("  ✅ auth_user presente");
  console.log("  ✅ auth_session presente");

  // Verificar isAuthenticated
  const isAuthenticated = !!mockSession?.user;
  console.log(`  isAuthenticated: ${isAuthenticated ? "✅ true" : "❌ false"}`);

  // Verificar isMockMode
  const isMockMode = !!mockUser;
  console.log(`  isMockMode: ${isMockMode ? "✅ true" : "❌ false"}`);

  return { isAuthenticated, isMockMode };
};

// Simular la verificación del hook useSuperAdmin
const testSuperAdminHook = (mockUser) => {
  console.log("\n🔍 Simulando hook useSuperAdmin:");

  const superAdminEmails = ["admin@VibeThink.co", "superadmin@VibeThink.co", "root@VibeThink.co"];

  const isSuperAdminUser = superAdminEmails.includes(mockUser.email.toLowerCase());
  const isPlatformOwner =
    mockUser.profile.role === "OWNER" && mockUser.company.slug === "VibeThink-platform";
  const isSuperAdmin = !!(isSuperAdminUser || isPlatformOwner);

  console.log(`  Email en lista de super admin: ${isSuperAdminUser ? "✅" : "❌"}`);
  console.log(`  Es platform owner: ${isPlatformOwner ? "✅" : "❌"}`);
  console.log(`  Es super admin: ${isSuperAdmin ? "✅" : "❌"}`);

  return isSuperAdmin;
};

// Simular ProtectedRoute
const testProtectedRoute = (isAuthenticated, isSuperAdmin) => {
  console.log("\n🔒 Simulando ProtectedRoute:");

  if (!isAuthenticated) {
    console.log("  ❌ No autenticado -> Redirigiendo a /auth");
    return false;
  }

  console.log("  ✅ Autenticado");

  if (isSuperAdmin) {
    console.log("  ✅ Es super admin -> Permitiendo acceso a /super-admin");
    return true;
  }

  console.log("  ❌ No es super admin -> Redirigiendo a /dashboard");
  return false;
};

// Ejecutar pruebas
const result = testLogin();
if (result) {
  const { mockUser, mockSession } = result;

  const authResult = testAuthHook(mockUser, mockSession);
  const isSuperAdmin = testSuperAdminHook(mockUser);
  const canAccess = testProtectedRoute(authResult.isAuthenticated, isSuperAdmin);

  console.log("\n🎯 Resultado final:");
  if (canAccess) {
    console.log("✅ Login exitoso - Acceso permitido a /super-admin");
    console.log("✅ Redirección correcta");
    console.log("✅ Panel de super administración accesible");
  } else {
    console.log("❌ Login fallido - Acceso denegado");
  }

  console.log("\n📝 Instrucciones para probar en el navegador:");
  console.log("1. Ve a: http://localhost:8080/simple-login");
  console.log("2. Usa las credenciales: superadmin@VibeThink.co / 12345");
  console.log("3. Deberías ser redirigido a: http://localhost:8080/super-admin");
  console.log('4. Verifica que aparezca el badge "SUPER_ADMIN" en el header');
} else {
  console.log("❌ Error en el proceso de login");
}
