# Redux ChartTooltip Error Guide

## 🚨 Error Description

**Síntoma:** `useAppSelector` returns undefined when using `ChartTooltipContent` in Recharts charts.

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'darkMode')
    at ChartTooltipContent
```

## 🎯 Root Cause Analysis

**Recharts Version Compatibility Issue:**
- **Recharts 3.x**: Requires Redux provider/configuration for ChartTooltipContent
- **Recharts 2.x**: Works without Redux dependencies (standalone)

**Our Investigation Results:**
- Our dashboard: Recharts 3.1.2 → Redux error
- bundui-reference: Recharts 2.15.4 → Works perfectly

## 📋 Solution Options

### **Option 1: Remove ChartTooltipContent (Quick Fix)**

**Pros:**
- ✅ Immediate error resolution
- ✅ No dependency changes needed
- ✅ Zero Redux configuration required

**Cons:**
- ❌ Loss of interactive tooltips
- ❌ Reduced user experience

**Implementation:**
```typescript
// ❌ BEFORE (causes Redux error):
<ChartTooltip content={<ChartTooltipContent hideLabel />} />

// ✅ AFTER (works without Redux):
{/* ChartTooltip removed - causes Redux error */}
```

### **Option 2: Downgrade to Recharts 2.15.4 (Recommended)**

**Pros:**
- ✅ Keeps full tooltip functionality
- ✅ Aligns with bundui-reference standard
- ✅ No Redux configuration needed
- ✅ Proven compatibility with our stack

**Cons:**
- ❌ Uses older Recharts version
- ❌ Potential missing new features from 3.x

**Implementation:**
```json
// package.json
{
  "dependencies": {
    "recharts": "2.15.4"  // Downgraded from 3.1.2
  }
}
```

**Follow-up Steps:**
1. `npm install` (apply downgrade)
2. Restore ChartTooltipContent in affected components
3. Test tooltip functionality

### **Option 3: Configure Redux for Recharts 3.x (Complex)**

**Pros:**
- ✅ Uses latest Recharts version
- ✅ Future-proof for Recharts updates

**Cons:**
- ❌ Requires Redux store configuration
- ❌ Potential conflicts with existing state
- ❌ More complex implementation
- ❌ Not aligned with bundui-reference

**Implementation:** (Not recommended)
```typescript
// Would require Redux Provider setup
// Complex configuration for tooltip state
```

## ✅ Recommended Solution: Option 2

**Rationale:**
1. **Alignment with bundui-reference:** Our canonical implementation uses 2.15.4
2. **Proven compatibility:** Works without any Redux configuration
3. **Maintains functionality:** Keeps interactive tooltips
4. **KISS principle:** Simpler is better

## 📋 Affected Components

Components that had ChartTooltipContent removed:

1. **AverageDailySales.tsx** - Replaced with bundui-reference implementation
2. **SalesOverflowCard.tsx** - ChartTooltip removed
3. **SalesByCountriesCard.tsx** - ChartTooltip removed  
4. **MonthlyCampaignState.tsx** - ChartTooltip removed
5. **EarningReportsCard.tsx** - ChartTooltip removed
6. **TotalEarningCard.tsx** - ChartTooltip removed

## 🔄 Restoration Process

After downgrading to Recharts 2.15.4:

1. Restore ChartTooltip in each component:
```typescript
// Restore this pattern:
<ChartTooltip content={<ChartTooltipContent hideLabel />} />
```

2. Test each component for tooltip functionality

3. Verify no Redux errors occur

## 🛡️ Prevention & Future Updates

**⚠️ CRITICAL: When updating Recharts in the future:**

### **Before Upgrading Recharts:**
1. **Check bundui-reference first**: Always verify what version bundui-reference uses
2. **Test Redux integration**: Verify if new version requires Redux setup
3. **Compatibility matrix**: Document major version differences
4. **Breaking changes**: Review Recharts changelog for tooltip-related changes

### **Future Recharts Update Protocol:**
```bash
# 1. Check bundui-reference version first
grep "recharts" apps/bundui-reference/package.json

# 2. Test upgrade in isolated branch
git checkout -b test-recharts-upgrade
npm install recharts@[NEW_VERSION]

# 3. Test ChartTooltipContent specifically
# Navigate to website-analytics-dashboard and test all tooltip components

# 4. If Redux errors appear:
# - Check if new version requires Redux Provider
# - Evaluate: worth the complexity vs staying aligned with bundui-reference
# - Document decision rationale
```

### **Decision Framework for Future Updates:**
- **If Recharts 3.x+ requires Redux**: Evaluate if benefits outweigh complexity
- **If bundui-reference stays on 2.x**: Consider staying aligned for simplicity
- **If major breaking changes**: Document migration path and impact analysis

## 📚 References

- **bundui-reference package.json:** `apps/bundui-reference/package.json`
- **Error Pattern in AI Standards:** `AI_UNIVERSAL_STANDARDS.md` lines 307-316
- **Dependency Management Rules:** `AI_UNIVERSAL_STANDARDS.md` lines 119-129

## 🔍 **Recharts Version Comparison Analysis**

### **Recharts 2.15.4 vs 3.1.2 - Key Differences:**

#### **🎯 Architecture Changes:**
| Feature | Recharts 2.15.4 | Recharts 3.1.2 |
|---------|------------------|-----------------|
| **ChartTooltipContent** | ✅ Standalone component | ❌ Requires Redux store |
| **State Management** | ✅ Internal state only | ❌ External Redux dependency |
| **Bundle Size** | ✅ Smaller (no Redux deps) | ❌ Larger (+Redux overhead) |
| **Setup Complexity** | ✅ Zero config | ❌ Requires store setup |

#### **🔧 Technical Differences:**

**Recharts 2.15.4 (Our Current):**
- ✅ **Self-contained**: All tooltip state managed internally
- ✅ **React 18 compatible**: Works with our React 18.3.1
- ✅ **Zero dependencies**: No external state management needed
- ✅ **bundui-reference aligned**: Same version as canonical implementation

**Recharts 3.1.2 (Previous):**
- ❌ **Redux requirement**: ChartTooltipContent needs useAppSelector
- ❌ **Store dependency**: Requires Redux Provider in app tree
- ❌ **Complex setup**: Need store, reducers, and selectors
- ❌ **Potential conflicts**: Could clash with our existing state management

#### **🚀 Performance Impact:**
```typescript
// Recharts 2.15.4 - Direct rendering
<ChartTooltip content={<ChartTooltipContent />} />
// → Direct component, no store lookups

// Recharts 3.1.2 - Store dependency  
<ChartTooltip content={<ChartTooltipContent />} />
// → useAppSelector() → Redux store lookup → potential performance overhead
```

#### **📊 Feature Comparison:**
- **Core charting**: Both versions identical
- **Tooltip functionality**: Same user experience
- **Chart types**: No differences in Bar, Area, Line, Pie charts
- **Customization**: Same theming and styling options

#### **🎯 Why 2.15.4 is Better for Our Use Case:**
1. **KISS Principle**: Simpler is better - no unnecessary Redux complexity
2. **bundui-reference alignment**: Consistent with our design system
3. **Maintenance**: Fewer dependencies = less maintenance overhead
4. **Stability**: Proven stable version with no breaking changes needed

#### **🔮 Future Considerations:**
- **Recharts 3.x evolution**: Monitor if Redux requirement becomes optional
- **bundui-reference updates**: Follow their version choices
- **Breaking changes**: Recharts 4.x might simplify architecture again

---

**Status:** ✅ Resolved with Recharts downgrade to 2.15.4
**Date:** 2025-08-13
**Solution:** Option 2 - Align with bundui-reference version
**Decision:** 2.15.4 provides same functionality with less complexity