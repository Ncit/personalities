# Maintaining Project Organization

This document outlines the rules and practices for maintaining the organized structure of the MBTI Personality Quiz project.

## 📋 Organization Rules

### 1. Markdown File Placement

**All markdown files must be placed in the `docs/` directory** with the following exceptions:

#### ✅ Exceptions (Files that should stay in their directories)
- **`./README.md`** - Main project README (entry point)
- **`./config/README.md`** - Local documentation for config directory
- **`./tests/README.md`** - Local documentation for tests directory
- **`./scripts/README.md`** - Local documentation for scripts directory
- **`./src/locales/README.md`** - Local documentation for locales module
- **`./src/modules/vk/README.md`** - Local documentation for VK module

#### 📁 Required Placement in `docs/`
- **API Documentation** → `docs/api/`
- **Architecture Documentation** → `docs/architecture/`
- **Deployment Guides** → `docs/deployment/`
- **Development Guides** → `docs/guides/`
- **General Documentation** → `docs/` (root of docs)

### 2. File Naming Conventions

- Use descriptive, kebab-case names: `feature-name-description.md`
- Include date prefixes for time-sensitive docs: `2024-01-15-feature-update.md`
- Use clear, action-oriented names: `deployment-guide.md`, `troubleshooting-guide.md`

### 3. Documentation Structure

```
docs/
├── README.md                           # Main documentation index
├── MAINTAINING_ORGANIZATION.md         # This file
├── PROJECT_ORGANIZATION_SUMMARY.md     # Organization summary
├── api/                                # API documentation
├── architecture/                       # Architecture and design
├── deployment/                         # Deployment and configuration
└── guides/                            # Development and troubleshooting
```

## 🛠️ Maintenance Workflow

### Adding New Documentation

1. **Determine the category**:
   - API-related → `docs/api/`
   - Architecture/design → `docs/architecture/`
   - Deployment/config → `docs/deployment/`
   - Development/troubleshooting → `docs/guides/`
   - General → `docs/`

2. **Create the file** in the appropriate directory

3. **Update the documentation index** (`docs/README.md`)

4. **Follow naming conventions**

### Moving Existing Documentation

1. **Identify misplaced files**:
   ```bash
   find . -name "*.md" -not -path "./docs/*" -not -path "./node_modules/*" -not -path "./.git/*"
   ```

2. **Move to appropriate location**:
   ```bash
   mv path/to/file.md docs/appropriate-category/
   ```

3. **Update references** and documentation index

### Regular Maintenance

#### Monthly Review
1. Check for new markdown files outside `docs/`
2. Verify all links in documentation are working
3. Update documentation index if needed
4. Review and clean up outdated documentation

#### Quarterly Review
1. Assess documentation organization
2. Refactor if needed
3. Update this maintenance guide
4. Communicate changes to team

## 🔍 Validation Commands

### Check for Misplaced Markdown Files
```bash
# Find all markdown files outside docs directory
find . -name "*.md" -not -path "./docs/*" -not -path "./node_modules/*" -not -path "./.git/*"

# Expected output (only these should remain):
# ./README.md
# ./config/README.md
# ./tests/README.md
# ./scripts/README.md
# ./src/locales/README.md
# ./src/modules/vk/README.md
```

### Count Documentation Files
```bash
# Count files in docs directory
find docs -name "*.md" | wc -l

# Count files in specific categories
find docs/api -name "*.md" | wc -l
find docs/architecture -name "*.md" | wc -l
find docs/deployment -name "*.md" | wc -l
find docs/guides -name "*.md" | wc -l
```

## 📝 Best Practices

### Documentation Quality
- Write clear, concise documentation
- Include examples and code snippets
- Keep documentation up-to-date
- Use consistent formatting and style

### Organization
- Group related documentation together
- Use descriptive file names
- Maintain logical hierarchy
- Update documentation index regularly

### Collaboration
- Review documentation changes
- Communicate organizational changes
- Train team members on conventions
- Document decisions and rationale

## 🆘 Troubleshooting

### Common Issues

1. **Broken Links**: Update references when moving files
2. **Missing Documentation**: Check if new features need documentation
3. **Outdated Information**: Regular review and updates
4. **Inconsistent Structure**: Follow established patterns

### Getting Help

1. Check this maintenance guide
2. Review the main [README.md](./README.md)
3. Consult the [documentation index](./README.md)
4. Open an issue for clarification

## 📊 Organization Metrics

### Current Status
- **Total Documentation Files**: [Count with `find docs -name "*.md" | wc -l`]
- **Categories**: 4 (api, architecture, deployment, guides)
- **Maintenance Level**: Active
- **Last Review**: [Date]

### Goals
- Maintain 100% markdown files in `docs/` directory
- Keep documentation index up-to-date
- Regular reviews and updates
- Clear organization and navigation

---

**Remember**: Good organization is an ongoing process, not a one-time task! 