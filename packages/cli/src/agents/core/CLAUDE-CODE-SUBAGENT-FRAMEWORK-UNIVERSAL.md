# 🌐 Universal Claude Code Sub-agent Framework

**⚠️ FRAMEWORK EXCLUSIVO para Claude Code Sub-agents - Propósito General**

## 🎯 Propósito Universal

Framework reutilizable para crear **sistemas de tasks automatizados** usando Claude Code sub-agents en cualquier proyecto de desarrollo de software.

## 🔒 Compatibilidad

```
✅ COMPATIBLE: Claude Code (claude.ai/code) Task tool
✅ PROPÓSITO: Cualquier sistema de automatización de código
❌ NO COMPATIBLE: Otras IAs (Cursor, Copilot, ChatGPT, etc.)
```

## 🏗️ Arquitectura Universal

### **Estructura Base para Cualquier Proyecto**

```
project-root/
├── dev-tools/
│   ├── agents/
│   │   ├── core/
│   │   │   ├── universal-framework.js          # Framework universal
│   │   │   ├── context-generator.js            # Generador de contextos
│   │   │   └── subagent-executor.js           # Ejecutor de sub-agents
│   │   ├── contexts/
│   │   │   ├── shared-patterns-context.md     # Patrones compartidos
│   │   │   ├── [specific-task]-context.md     # Contextos específicos
│   │   │   └── validation-context.md          # Contexto de validación
│   │   ├── templates/
│   │   │   ├── context-template.md            # Template para contextos
│   │   │   └── component-templates/           # Templates de componentes
│   │   └── README-CLAUDE-SUBAGENTS.md         # Documentación específica
│   └── scripts/
│       ├── create-subagent-task.js            # Script universal
│       └── validate-subagent-output.js        # Validador universal
└── package.json                               # Scripts npm universales
```

## 📋 Template Universal de Context MD

### **Estructura Estándar para Cualquier Task**

```markdown
# [Task Name] Context for Claude Code Sub-agent

## 🎯 Mission Statement
**Primary Objective**: [Single, clear purpose]
**Expected Outcome**: [Measurable result]
**Time Estimate**: [Expected duration]

## 📋 Input Requirements
**Required Parameters**:
- param1: [description and format]
- param2: [description and format]

**Optional Parameters**:
- optional1: [description and default]

## 🔧 Project-Specific Patterns to Apply
**Architecture Patterns**:
- Pattern 1: [Description and usage]
- Pattern 2: [Description and usage]

**Code Standards**:
- Language: [TypeScript/JavaScript/Python/etc.]
- Framework: [React/Vue/Django/etc.]
- Testing: [Jest/Vitest/Pytest/etc.]

## 📁 Required Output Structure
```
target-directory/
├── main-file.[ext]                # Primary implementation
├── components/                    # Component files
│   ├── Component1.[ext]
│   └── Component2.[ext]
├── hooks/ | utils/ | helpers/     # Utility files
└── types.[ext] | tests.[ext]      # Supporting files
```

## 🎨 Implementation Specifications
**Component 1**: [Detailed specification]
**Component 2**: [Detailed specification]
**Integration Points**: [How components work together]

## 🛡️ Quality Requirements
**Security**: [Security patterns to apply]
**Performance**: [Performance requirements]
**Accessibility**: [A11y requirements]
**Testing**: [Testing requirements]

## ✅ Success Criteria
- [ ] Criterion 1 - [Measurable check]
- [ ] Criterion 2 - [Measurable check]
- [ ] Criterion 3 - [Measurable check]

## 🧪 Validation Commands
```bash
# Commands to verify successful implementation
npm run validate:[task-type]
npm run test:[task-type]
npm run build:[task-type]
```

## 🔍 Debug Information
**Common Issues**: [Known problems and solutions]
**Dependencies**: [Required packages/tools]
**Environment**: [Environment requirements]
```

## 🚀 Universal JavaScript Framework

### **Framework Core (universal-framework.js)**

```javascript
#!/usr/bin/env node

/**
 * 🌐 Universal Claude Code Sub-agent Framework
 * 
 * Reutilizable para cualquier proyecto que necesite automatización
 * con Claude Code sub-agents
 */

const fs = require('fs').promises
const path = require('path')

class UniversalSubagentFramework {
  constructor(projectConfig) {
    this.projectRoot = projectConfig.root || process.cwd()
    this.taskType = projectConfig.taskType
    this.patterns = projectConfig.patterns || {}
    this.outputPath = projectConfig.outputPath
  }

  /**
   * Crear task para sub-agent
   */
  async createSubagentTask(taskOptions) {
    const { taskName, contextFile, parameters } = taskOptions
    
    console.log(`🤖 Creando task: ${taskName}`)
    
    try {
      // 1. Cargar contexto optimizado
      const context = await this.loadContext(contextFile)
      
      // 2. Generar prompt para sub-agent
      const optimizedPrompt = this.generateOptimizedPrompt(context, parameters)
      
      // 3. Preparar estructura de output
      await this.prepareOutputStructure()
      
      // 4. Retornar configuración para Claude Code Task tool
      return {
        claudeCodeConfig: {
          description: `Implement ${taskName}`,
          subagent_type: 'general-purpose',
          prompt: optimizedPrompt
        },
        validation: context.validationCommands,
        expectedOutput: context.expectedOutput
      }
      
    } catch (error) {
      console.error(`❌ Error creando task ${taskName}:`, error)
      throw error
    }
  }

  /**
   * Cargar contexto desde MD file
   */
  async loadContext(contextFile) {
    const contextPath = path.join(this.projectRoot, 'dev-tools', 'agents', 'contexts', contextFile)
    const contextContent = await fs.readFile(contextPath, 'utf8')
    
    return this.parseContextMD(contextContent)
  }

  /**
   * Parsear contexto MD a objeto structured
   */
  parseContextMD(content) {
    const sections = {}
    const lines = content.split('\n')
    let currentSection = null
    let currentContent = []

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        currentSection = line.replace('## ', '').replace(/[🎯📋🔧📁🎨🛡️✅🧪🔍]/g, '').trim()
        currentContent = []
      } else if (currentSection) {
        currentContent.push(line)
      }
    }
    
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim()
    }

    return sections
  }

  /**
   * Generar prompt optimizado para sub-agent
   */
  generateOptimizedPrompt(context, parameters) {
    const prompt = `
# ${context['Mission Statement'] || 'Task Implementation'}

## Context
You are a Claude Code sub-agent specialized in implementing this specific task.

## Mission
${context['Mission Statement'] || 'Implement the requested functionality'}

## Input Parameters
${JSON.stringify(parameters, null, 2)}

## Patterns to Apply
${context['Project-Specific Patterns to Apply'] || 'Follow project standards'}

## Required Output Structure
${context['Required Output Structure'] || 'Create the specified files'}

## Implementation Specifications
${context['Implementation Specifications'] || 'Implement according to requirements'}

## Quality Requirements
${context['Quality Requirements'] || 'Follow best practices'}

## Success Criteria
${context['Success Criteria'] || 'Complete the implementation successfully'}

## IMPORTANT INSTRUCTIONS
1. Follow the project patterns exactly as specified
2. Ensure all files are created in the correct structure
3. Apply security and quality requirements
4. Test your implementation
5. Provide clear output of what was created

## Expected Deliverables
- Complete implementation of all specified components
- All files created in the correct directory structure
- Implementation follows project patterns and standards
- Code is ready for production use
`

    return prompt.trim()
  }

  /**
   * Preparar estructura de output
   */
  async prepareOutputStructure() {
    if (this.outputPath) {
      await fs.mkdir(this.outputPath, { recursive: true })
    }
  }

  /**
   * Validar output del sub-agent
   */
  async validateSubagentOutput(outputPath, validationCommands) {
    console.log('🔍 Validando output del sub-agent...')
    
    for (const command of validationCommands) {
      try {
        const { execSync } = require('child_process')
        execSync(command, { cwd: this.projectRoot, stdio: 'inherit' })
        console.log(`✅ Validación exitosa: ${command}`)
      } catch (error) {
        console.warn(`⚠️ Validación falló: ${command}`)
      }
    }
  }
}

module.exports = { UniversalSubagentFramework }
```

## 📦 NPM Scripts Universales

### **Para cualquier package.json**

```json
{
  "scripts": {
    "create-subagent-task": "node dev-tools/agents/core/create-subagent-task.js",
    "validate-subagent-output": "node dev-tools/agents/core/validate-subagent-output.js",
    "generate-context-template": "node dev-tools/agents/core/generate-context-template.js",
    "list-available-tasks": "node dev-tools/agents/core/list-tasks.js"
  }
}
```

## 🎯 Casos de Uso Universales

### **Desarrollo Web (React/Vue/Angular)**
```bash
npm run create-subagent-task component --name=LoginForm --context=react-component-context.md
npm run create-subagent-task page --name=Dashboard --context=react-page-context.md
npm run create-subagent-task feature --name=UserAuth --context=react-feature-context.md
```

### **Backend Development (Node.js/Python/Java)**
```bash
npm run create-subagent-task api --name=UserAPI --context=api-endpoint-context.md
npm run create-subagent-task service --name=EmailService --context=service-context.md
npm run create-subagent-task migration --name=UserTable --context=database-migration-context.md
```

### **DevOps/Infrastructure**
```bash
npm run create-subagent-task docker --name=AppContainer --context=docker-context.md
npm run create-subagent-task ci-cd --name=DeployPipeline --context=github-actions-context.md
npm run create-subagent-task terraform --name=Infrastructure --context=terraform-context.md
```

### **Testing & Quality**
```bash
npm run create-subagent-task tests --name=ComponentTests --context=testing-context.md
npm run create-subagent-task e2e --name=UserFlow --context=e2e-testing-context.md
npm run create-subagent-task security --name=SecurityAudit --context=security-context.md
```

## 🔧 Configuración por Proyecto

### **Ejemplo: React Project**

```javascript
// dev-tools/agents/project-config.js
module.exports = {
  projectType: 'react-typescript',
  framework: 'Next.js 15',
  patterns: {
    componentStructure: 'src/components/[ComponentName]/index.tsx',
    hookPattern: 'src/hooks/use[HookName].ts',
    pagePattern: 'src/pages/[page-name]/page.tsx',
    stylePattern: 'tailwindcss'
  },
  validationCommands: [
    'npm run type-check',
    'npm run lint',
    'npm run test',
    'npm run build'
  ]
}
```

### **Ejemplo: Django Project**

```javascript
// dev-tools/agents/project-config.js
module.exports = {
  projectType: 'django-python',
  framework: 'Django 4.2',
  patterns: {
    modelPattern: 'apps/[app_name]/models.py',
    viewPattern: 'apps/[app_name]/views.py',
    urlPattern: 'apps/[app_name]/urls.py',
    testPattern: 'apps/[app_name]/tests/test_[feature].py'
  },
  validationCommands: [
    'python manage.py check',
    'python manage.py test',
    'flake8 .',
    'mypy .'
  ]
}
```

## 🌟 Ventajas del Framework Universal

### **Reutilización Total**
- **Una vez configurado**, funciona en cualquier proyecto
- **Patrones adaptables** a cualquier tecnología
- **Context templates** reutilizables

### **Escalabilidad**
- **Agregar nuevos task types** fácilmente
- **Compartir contextos** entre proyectos
- **Evolución incremental** del framework

### **Consistencia**
- **Misma estructura** en todos los proyectos
- **Patrones estandarizados** para sub-agents
- **Calidad garantizada** en outputs

## 🚀 Getting Started en Cualquier Proyecto

### **1. Instalación**
```bash
# Copia el framework a tu proyecto
cp -r universal-claude-subagent-framework/ your-project/dev-tools/agents/

# Configurar para tu proyecto específico
npm run setup-subagent-framework
```

### **2. Configuración**
```bash
# Generar contextos para tu proyecto
npm run generate-context-templates

# Personalizar patrones
edit dev-tools/agents/project-config.js
```

### **3. Primer Task**
```bash
# Crear tu primer task con sub-agent
npm run create-subagent-task [task-type] --name=[task-name]
```

---

**Framework Universal Version**: 1.0.0  
**Compatible con**: Cualquier proyecto + Claude Code  
**Propósito**: Automatización universal con sub-agents  
**Mantenimiento**: Framework evolucionario y extensible