# @vibethink/cli (VThink Dev-Kit)

Esta es la implementación oficial del **VThink Dev-Kit**. Contiene todas las herramientas de automatización, validación y orquestación para proyectos VibeThink.

## 📦 Instalación

```bash
npm install -g @vibethink/cli
# O uso directo con npx
npx vtk <comando>
```

## 🚀 Uso del CLI (VTK)

El comando principal es `vtk`.

```bash
vtk status          # Ver estado del proyecto
vtk upgrade-bundui  # Actualizar componentes Bundui
vtk validate        # Validar cumplimiento de metodología
```

## 🛠️ Herramientas Internas (Legacy Dev-Tools)

El paquete incluye la suite completa de herramientas anteriormente conocida como "dev-tools".

### Estructura
```
packages/cli/src/
├── automation/      # Scripts de automatización
├── security/        # Auditoría de seguridad
├── validation/      # Validadores de stack
├── docusaurus/      # Gestión de documentación
└── ...
```

### Ejecución de Scripts
Puede ejecutar los scripts internos directamente si es necesario, aunque se recomienda usar los comandos `vtk` cuando estén disponibles.

```bash
# Ejemplo: Ejecutar auditoría de seguridad
npx ts-node packages/cli/src/security/security-audit.ts
```

## 📚 Documentación Externa
Para ver los **Principios Metodológicos** detrás de estas herramientas, consulte [Methodology/04_TOOLS](../../docs/Methodology/04_TOOLS/README.md).
