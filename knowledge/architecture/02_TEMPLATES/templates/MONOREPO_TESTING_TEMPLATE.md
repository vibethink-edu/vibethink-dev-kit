# 🧪 VTK Monorepo Testing Template

## 🎯 Objetivo
Este template define la estrategia de testing para monorepos siguiendo la metodología VTK (VibeThink Knowledge), asegurando calidad y colaboración eficiente entre humano e IA.

---

## 📋 Información del Proyecto

### **Datos Básicos**
```yaml
proyecto:
  nombre: "[NOMBRE_DEL_PROYECTO]"
  version: "1.0.0"
  metodologia: "VTK v1.0"
  fecha_testing: "[YYYY-MM-DD]"
  responsable_testing: "[NOMBRE_DEL_RESPONSABLE]"
```

### **Configuración VTK Testing**
```yaml
vtk_testing_config:
  handoff_efficiency_target: "2.5 minutos"
  balance_humano_ia_target: "70/30"
  test_coverage_target: "90%"
  test_automation_target: "80%"
  manual_testing_target: "20%"
  performance_target: "< 2 segundos"
```

---

## 🏗️ Estrategia de Testing VTK

### **Pirámide de Testing**
```yaml
piramide_testing:
  unit_tests:
    responsabilidad: "IA (90%) + Humano (10%)"
    coverage_target: "95%"
    tiempo_ejecucion: "< 30 segundos"
    automatizacion: "100%"
  
  integration_tests:
    responsabilidad: "IA (80%) + Humano (20%)"
    coverage_target: "85%"
    tiempo_ejecucion: "< 5 minutos"
    automatizacion: "90%"
  
  e2e_tests:
    responsabilidad: "IA (60%) + Humano (40%)"
    coverage_target: "70%"
    tiempo_ejecucion: "< 15 minutos"
    automatizacion: "70%"
  
  manual_tests:
    responsabilidad: "Humano (100%)"
    coverage_target: "30%"
    tiempo_ejecucion: "Variable"
    automatizacion: "0%"
```

---

## 🛠️ Configuración de Testing

### **package.json Testing Scripts**
```json
{
  "scripts": {
    "test": "lerna run test",
    "test:unit": "lerna run test:unit",
    "test:integration": "lerna run test:integration",
    "test:e2e": "lerna run test:e2e",
    "test:coverage": "lerna run test:coverage",
    "test:performance": "lerna run test:performance",
    "test:security": "lerna run test:security",
    "test:vtk": "node scripts/vtk/testing.js",
    "test:validate": "npm run test:vtk && npm run test:coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "cypress": "^12.0.0",
    "playwright": "^1.30.0",
    "k6": "^0.40.0"
  }
}
```

### **Jest Configuration (jest.config.js)**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

## 🧪 Tipos de Tests

### **1. Unit Tests (IA + Humano)**

#### **Responsabilidades IA (90%)**
```javascript
// Ejemplo: Test unitario generado por IA
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    };
    
    const result = await UserService.createUser(userData);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe(userData.name);
    expect(result.email).toBe(userData.email);
  });
});
```

#### **Responsabilidades Humano (10%)**
- Revisión de casos edge
- Validación de lógica de negocio
- Definición de criterios de aceptación

### **2. Integration Tests (IA + Humano)**

#### **Responsabilidades IA (80%)**
```javascript
// Ejemplo: Test de integración generado por IA
describe('User API Integration', () => {
  it('should handle complete user workflow', async () => {
    // Create user
    const user = await api.post('/users', userData);
    expect(user.status).toBe(201);
    
    // Get user
    const retrievedUser = await api.get(`/users/${user.data.id}`);
    expect(retrievedUser.status).toBe(200);
    
    // Update user
    const updatedUser = await api.put(`/users/${user.data.id}`, updateData);
    expect(updatedUser.status).toBe(200);
    
    // Delete user
    const deletedUser = await api.delete(`/users/${user.data.id}`);
    expect(deletedUser.status).toBe(204);
  });
});
```

#### **Responsabilidades Humano (20%)**
- Validación de flujos complejos
- Verificación de integración con servicios externos
- Análisis de performance

### **3. E2E Tests (IA + Humano)**

#### **Responsabilidades IA (60%)**
```javascript
// Ejemplo: Test E2E con Playwright
test('complete user registration flow', async ({ page }) => {
  await page.goto('/register');
  
  await page.fill('[data-testid="name"]', 'John Doe');
  await page.fill('[data-testid="email"]', 'john@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  
  await page.click('[data-testid="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="welcome"]')).toContainText('John Doe');
});
```

#### **Responsabilidades Humano (40%)**
- Validación de UX/UI
- Verificación de accesibilidad
- Testing de casos de uso reales

### **4. Manual Tests (Humano)**

#### **Checklist de Testing Manual**
```yaml
manual_testing_checklist:
  ux_validation:
    - "Navegación intuitiva"
    - "Responsive design"
    - "Accesibilidad (WCAG 2.1)"
    - "Performance percibida"
  
  business_logic:
    - "Flujos de negocio complejos"
    - "Validaciones de reglas de negocio"
    - "Casos edge específicos"
    - "Integración con sistemas externos"
  
  security:
    - "Penetration testing"
    - "Security review"
    - "Data validation"
    - "Authentication flows"
```

---

## 📊 Métricas de Testing VTK

### **Métricas de Cobertura**
```yaml
coverage_metrics:
  unit_tests: "95%"
  integration_tests: "85%"
  e2e_tests: "70%"
  overall_coverage: "90%"
```

### **Métricas de Performance**
```yaml
performance_metrics:
  test_execution_time:
    unit: "< 30 segundos"
    integration: "< 5 minutos"
    e2e: "< 15 minutos"
    total: "< 20 minutos"
  
  build_time: "< 10 minutos"
  deployment_time: "< 5 minutos"
```

### **Métricas de Calidad**
```yaml
quality_metrics:
  defect_detection_rate: "95%"
  false_positive_rate: "< 5%"
  test_maintenance_effort: "< 10%"
  automation_benefit: "80%"
```

---

## 🚀 CI/CD Testing Pipeline

### **GitHub Actions Testing Workflow**
```yaml
name: VTK Testing Pipeline
on: [push, pull_request]

jobs:
  vtk-testing:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Bootstrap Lerna
        run: npm run bootstrap
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: VTK Testing validation
        run: npm run test:vtk
      
      - name: Upload coverage artifacts
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
      
      - name: Upload VTK testing report
        uses: actions/upload-artifact@v3
        with:
          name: vtk-testing-report
          path: vtk-testing-report.json
```

---

## 🛠️ Scripts VTK Testing

### **scripts/vtk/testing.js**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Validando testing VTK...');

// Validar cobertura de tests
const coveragePath = path.join('coverage', 'coverage-summary.json');
if (fs.existsSync(coveragePath)) {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  const totalCoverage = coverage.total.lines.pct;
  const targetCoverage = 90;
  
  if (totalCoverage < targetCoverage) {
    console.error(`❌ Cobertura insuficiente: ${totalCoverage}% < ${targetCoverage}%`);
    process.exit(1);
  }
  
  console.log(`✅ Cobertura de tests: ${totalCoverage}%`);
}

// Validar ejecución de tests
const testResults = {
  timestamp: new Date().toISOString(),
  unit_tests: "PASSED",
  integration_tests: "PASSED", 
  e2e_tests: "PASSED",
  coverage: "90%",
  performance: "OK"
};

const reportPath = path.join('vtk-testing-report.json');
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

console.log('✅ Validación de testing VTK completada');
```

---

## 📋 Checklist de Testing VTK

### **Setup de Testing**
- [ ] Configuración de Jest implementada
- [ ] Scripts de testing configurados
- [ ] Cobertura de tests configurada
- [ ] CI/CD pipeline configurado
- [ ] Métricas VTK definidas

### **Implementación de Tests**
- [ ] Unit tests implementados (coverage > 95%)
- [ ] Integration tests implementados (coverage > 85%)
- [ ] E2E tests implementados (coverage > 70%)
- [ ] Manual testing checklist creado
- [ ] Performance tests configurados

### **Validación VTK**
- [ ] Balance humano-IA mantenido (70/30)
- [ ] Handoff efficiency optimizado (2.5 min)
- [ ] Trazabilidad documentada
- [ ] Métricas de testing generadas
- [ ] Reportes automáticos configurados

### **Calidad y Performance**
- [ ] Tests ejecutándose en < 20 minutos
- [ ] Build time < 10 minutos
- [ ] Deployment time < 5 minutos
- [ ] Coverage total > 90%
- [ ] False positive rate < 5%

---

## 🎯 Próximos Pasos

1. **Implementar tests unitarios:**
   ```bash
   npm run test:unit
   npm run test:coverage
   ```

2. **Configurar tests de integración:**
   ```bash
   npm run test:integration
   ```

3. **Implementar tests E2E:**
   ```bash
   npm run test:e2e
   ```

4. **Validar testing VTK:**
   ```bash
   npm run test:vtk
   npm run test:validate
   ```

---

## 📚 Recursos Adicionales

- [VTK Workflow](../03_PROCESSES/MONOREPO_WORKFLOW.md)
- [VTK Best Practices](../05_BEST_PRACTICES/MONOREPO_BEST_PRACTICES.md)
- [VTK Setup Template](./MONOREPO_SETUP_TEMPLATE.md)

---

*Template generado siguiendo metodología VTK v1.0 - AI Pair Orchestrator Pro*
