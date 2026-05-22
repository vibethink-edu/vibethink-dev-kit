# Stack Documentation - VibeThink Orchestrator

## 📋 **Current Stack Overview**

### **Architecture**
- **Monorepo**: Lerna-based workspace
- **Frontend**: Next.js 15.3.4 with React 19.1.1
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts (migrated from custom SVG)
- **Icons**: Lucide React 0.294.0
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (planned integration)

### **Project Structure**
```
vibethink-orchestrator/
├── apps/
│   └── dashboard/          # Main dashboard application
├── src/
│   ├── shared/            # Shared components and utilities
│   ├── integrations/      # External integrations
│   └── modules/          # Business logic modules
├── external/              # Reference materials only
└── dev-tools/            # Development and validation tools
```

## 🔧 **Current Issues & Solutions**

### **1. Workspace Configuration Problem**
**Issue**: Multiple npm installations causing dependency conflicts
- Root package.json has workspaces configured
- Dashboard has its own package.json with dependencies
- Commands running from root directory causing confusion

**Solution**: 
- Execute commands directly from `apps/dashboard/`
- Use `npm run dev` from dashboard directory, not root

### **2. Tailwind CSS Installation**
**Issue**: `preflight.css` missing from local node_modules
**Root Cause**: Workspace using root dependencies instead of local
**Solution**: Copied `preflight.css` from root to local dashboard node_modules

### **3. Lucide React Version Conflicts**
**Issue**: React version mismatch (React 19.1.1 vs Lucide React expecting React 18)
**Solution**: Use `--legacy-peer-deps` flag for installation

### **4. Port Conflicts**
**Issue**: Multiple servers trying to use port 3001
**Solution**: Kill existing processes before starting new server

## 📦 **Dependency Management**

### **Root Dependencies** (package.json)
```json
{
  "workspaces": ["apps/*", "src/*"],
  "devDependencies": {
    "@types/node": "20.0.0",
    "typescript": "5.9.2"
  }
}
```

### **Dashboard Dependencies** (apps/dashboard/package.json)
```json
{
  "dependencies": {
    "next": "15.3.4",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.4.17",
    "recharts": "latest",
    "@radix-ui/*": "latest",
    "zustand": "^5.0.7",
    "react-hook-form": "^7.62.0",
    "zod": "^4.0.15"
  }
}
```

## 🚀 **Development Commands**

### **Correct Way to Run Development**
```bash
# ❌ WRONG - From root directory
npm run dev

# ✅ CORRECT - From dashboard directory
cd apps/dashboard
npm run dev
```

### **Installation Commands**
```bash
# Install dependencies in dashboard
cd apps/dashboard
npm install --legacy-peer-deps

# Install specific packages
npm install lucide-react@0.294.0 --legacy-peer-deps
```

## 🔍 **Troubleshooting Guide**

### **Port Already in Use**
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Or kill specific port
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Missing Dependencies**
```bash
# Check if package is installed
ls node_modules/lucide-react/

# Install with legacy peer deps
npm install <package> --legacy-peer-deps
```

### **Tailwind CSS Issues**
```bash
# Verify preflight.css exists
ls node_modules/tailwindcss/lib/css/preflight.css

# If missing, copy from root
copy ../../node_modules/tailwindcss/lib/css/preflight.css node_modules/tailwindcss/lib/css/
```

## 📊 **Chart Implementation**

### **Migration from Custom SVG to Recharts**
- **Before**: Custom SVG charts with manual calculations
- **After**: Recharts with ResponsiveContainer and proper tooltips
- **Benefits**: Better performance, accessibility, and maintainability

### **Chart Data Format**
```typescript
// ✅ Correct format for Recharts
interface ChartData {
  name: string;    // Instead of 'label'
  value: number;
}

const data = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1400 }
];
```

## 🛡️ **Security & Best Practices**

### **Multi-tenant Architecture**
- All database queries must filter by `company_id`
- RLS policies enforced on Supabase
- Role-based access control implemented

### **Code Quality**
- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Pre-commit hooks for validation

## 🔄 **Recent Changes**

### **Charts Component Update**
- Migrated from custom SVG to Recharts
- Added ResponsiveContainer for better responsiveness
- Implemented custom tooltips matching Bundui Premium style
- Updated data format from `label` to `name`

### **Documentation Updates**
- Created `/external` reference documentation
- Established clear rules for reference vs implementation
- Documented workspace configuration issues

## 🎯 **Next Steps**

### **Immediate Priorities**
1. ✅ Resolve Lucide React installation
2. ✅ Verify charts render correctly
3. ✅ Test all dashboard functionality
4. ✅ Document any remaining issues

### **Future Improvements**
1. **Database Integration**: Replace mock data with Supabase
2. **Performance**: Implement proper caching strategies
3. **Testing**: Add comprehensive test coverage
4. **CI/CD**: Set up automated deployment pipeline

## 📝 **Important Notes**

### **Workspace Behavior**
- Root package.json scripts execute `cd apps/dashboard && npm run dev`
- This can cause dependency resolution issues
- Always run commands directly from the target directory

### **Dependency Conflicts**
- React 19.1.1 vs Lucide React expecting React 18
- Use `--legacy-peer-deps` for installations
- Consider downgrading React or upgrading Lucide React

### **File Locations**
- Tailwind config: `apps/dashboard/tailwind.config.ts`
- Global CSS: `apps/dashboard/app/globals.css`
- Dashboard pages: `apps/dashboard/app/`

---

**Last Updated**: August 6, 2025
**Status**: Resolving dependency conflicts
**Next Action**: Complete Lucide React installation and verify server functionality 