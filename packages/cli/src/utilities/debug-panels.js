#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar el estado de los paneles laterales
 * Ayuda a identificar por qué los paneles no se muestran
 */

// TODO: log '🔍 Diagnóstico de paneles laterales...\n'

// Simular el estado del navegador
const mockWindowWidth = 1920; // Simular pantalla desktop
const mockWindowHeight = 1080;

// TODO: log '📱 Información de pantalla:'
// TODO: log `  Ancho: ${mockWindowWidth}px`
// TODO: log `  Alto: ${mockWindowHeight}px`

// Simular breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const isMobile = mockWindowWidth < MOBILE_BREAKPOINT;
const isTablet = mockWindowWidth >= MOBILE_BREAKPOINT && mockWindowWidth < TABLET_BREAKPOINT;
const isDesktop = !isMobile && !isTablet;

// TODO: log '\n📊 Detección de tamaño de pantalla:'
// TODO: log `  Mobile (< ${MOBILE_BREAKPOINT}px): ${isMobile ? '✅' : '❌'}`
// TODO: log `  Tablet (${MOBILE_BREAKPOINT}-${TABLET_BREAKPOINT}px): ${isTablet ? '✅' : '❌'}`
// TODO: log `  Desktop (> ${TABLET_BREAKPOINT}px): ${isDesktop ? '✅' : '❌'}`

// Simular estado del usuario
const mockUser = {
  email: "superadmin@VibeThink.co",
  profile: {
    role: "SUPER_ADMIN",
  },
  company: {
    slug: "VibeThink-platform",
  },
};

// TODO: log '\n👤 Estado del usuario:'
// TODO: log `  Email: ${mockUser.email}`
// TODO: log `  Role: ${mockUser.profile.role}`
// TODO: log `  Company: ${mockUser.company.slug}`

// Verificar si es super admin
const superAdminEmails = ["admin@VibeThink.co", "superadmin@VibeThink.co", "root@VibeThink.co"];

const isSuperAdminUser = superAdminEmails.includes(mockUser.email.toLowerCase());
const isPlatformOwner =
  mockUser.profile.role === "OWNER" && mockUser.company.slug === "VibeThink-platform";
const isSuperAdmin = !!(isSuperAdminUser || isPlatformOwner);

// TODO: log '\n🔐 Verificación de Super Admin:'
// TODO: log `  Email en lista: ${isSuperAdminUser ? '✅' : '❌'}`
// TODO: log `  Platform owner: ${isPlatformOwner ? '✅' : '❌'}`
// TODO: log `  Es Super Admin: ${isSuperAdmin ? '✅' : '❌'}`

// Simular estado de los paneles
const showSuperAdminPanel = false; // Estado inicial
const showRightPanel = true; // Estado inicial

// TODO: log '\n🎛️ Estado de los paneles:'
// TODO: log `  showRightPanel: ${showRightPanel ? '✅ true' : '❌ false'}`
// TODO: log `  showSuperAdminPanel: ${showSuperAdminPanel ? '✅ true' : '❌ false'}`

// Calcular si algún panel derecho está visible
const anyRightPanelVisible = showRightPanel || (isSuperAdmin && showSuperAdminPanel);

// TODO: log '\n📋 Cálculo de visibilidad:'
// TODO: log `  showRightPanel: ${showRightPanel}`
// TODO: log `  isSuperAdmin && showSuperAdminPanel: ${isSuperAdmin && showSuperAdminPanel}`
// TODO: log `  anyRightPanelVisible: ${anyRightPanelVisible ? '✅ true' : '❌ false'}`

// Verificar layout
if (isMobile) {
  // TODO: log '\n📱 Layout detectado: MOBILE'
  // TODO: log '  ❌ Se mostrará MobileDashboardLayout'
  // TODO: log '  ❌ No se mostrarán paneles laterales'
} else {
  // TODO: log '\n🖥️ Layout detectado: DESKTOP'
  // TODO: log '  ✅ Se mostrará DashboardLayout normal'

  if (anyRightPanelVisible) {
    // TODO: log '  ✅ Paneles laterales visibles'
    if (showRightPanel) {
      // TODO: log '    - Panel derecho regular'
    }
    if (isSuperAdmin && showSuperAdminPanel) {
      // TODO: log '    - Panel de Super Admin'
    }
  } else {
    // TODO: log '  ❌ No hay paneles laterales visibles'
  }
}

// TODO: log '\n🔧 Posibles problemas:'
// TODO: log '1. Hook useResponsiveLayout detectando pantalla como móvil'
// TODO: log '2. Estado inicial de showRightPanel en false'
// TODO: log '3. Error en el renderizado de los componentes de panel'
// TODO: log '4. Problemas de CSS que ocultan los paneles'

// TODO: log '\n💡 Soluciones sugeridas:'
// TODO: log '1. Verificar en DevTools si hay errores de JavaScript'
// TODO: log '2. Verificar en DevTools si los elementos están en el DOM pero ocultos'
// TODO: log '3. Verificar el estado de los hooks en React DevTools'
// TODO: log '4. Reiniciar el servidor de desarrollo'

// TODO: log '\n📝 Comandos para probar:'
// TODO: log '1. Abrir DevTools (F12)'
// TODO: log '2. Ir a la pestaña Console'
// TODO: log '3. Buscar errores de JavaScript'
// TODO: log '4. Ir a la pestaña Elements'
// TODO: log '5. Buscar elementos con clase "w-80" (paneles)'
// TODO: log '6. Verificar si están presentes pero con display: none'
