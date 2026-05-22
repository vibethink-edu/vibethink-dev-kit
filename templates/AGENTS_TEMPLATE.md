# Project Mission
[Project Name] is a [Type of Application] designed to [Goal].

# Tech Stack
The following technologies are the **official standards** for this project.

-   **Core**: [Framework/Language]
-   **Build Tool**: [Tool]
-   **Styling**: [Library]
-   **Backend**: [Framework]
-   **AI/ML**: [Models/APIs]

## 🚨 CRITICAL: Stack Compatibility
**See `knowledge/best-practices/STACK_COMPATIBILITY.md` in DevKit.**

## 🤖 Auto-Loading Protocol

**CRITICAL: AI must execute BEFORE every task:**

### **Step 1: Load Project Configuration**
```bash
cat .vibethink.config.json
jq '.stack' .vibethink.config.json
```

### **Step 2: Verify Compatibility**
```bash
jq '.compatibility.prohibited' .vibethink.config.json
jq '.compatibility.conflicts' .vibethink.config.json
```

### **Step 3: Load Relevant Documentation**
```bash
# Read AGENTS.md (this file)
# Read knowledge/naming-conventions/NAMING_STANDARDS.md (if available)
```

# Architectural Guidelines

## Directory Structure
-   **/src**: Source code
-   **/docs**: Documentation (See Rules below)

## Documentation Rules (Strict)
**Root directory must remain clean.**
-   **Allowed**: `README.md`, `AGENTS.md`, `CHANGELOG.md`
-   **Everything else**: `docs/`

# Workflow for Agents
1.  **Analyze**: Read context.
2.  **Plan**: Propose changes.
3.  **Implement**: Write code.
4.  **Verify**: Run tests.
5.  **Document**: Update Changelog.
