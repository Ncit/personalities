# Scripts

This directory contains build scripts, utilities, and automation tools for the MBTI Personality Quiz application.

## 📁 Scripts Structure

```
scripts/
├── README.md        # This file
└── script.js        # Main application script (moved from root)
```

## 🔧 Scripts Overview

### `script.js`
The main application script containing the core logic for the MBTI personality quiz.

**Features:**
- Quiz engine implementation
- User interface management
- State management
- Analytics integration
- VK platform integration
- Internationalization support

**Size:** ~104KB (2,786 lines)

**Purpose:** Core application functionality

## 🚀 Usage

### Development
```bash
# Start development server
npm run dev

# The script.js file is automatically loaded by the development server
```

### Production
```bash
# Build for production
npm run build

# The script.js file is processed and optimized during the build
```

## 📝 Script Organization

### Current Structure
The `script.js` file is currently a large monolithic file that could benefit from further modularization.

### Recommended Refactoring
Consider breaking down `script.js` into smaller modules:

```
scripts/
├── README.md
├── script.js                    # Main entry point
├── modules/
│   ├── quiz-engine.js          # Quiz logic
│   ├── ui-manager.js           # UI management
│   ├── state-manager.js        # State management
│   ├── analytics.js            # Analytics integration
│   └── vk-integration.js       # VK platform integration
└── utils/
    ├── localization.js         # Internationalization
    ├── validation.js           # Input validation
    └── helpers.js              # Utility functions
```

## 🛠️ Development Workflow

### Adding New Scripts
1. Create the new script file in the appropriate directory
2. Follow the existing naming conventions
3. Document the script's purpose and usage
4. Update this README
5. Test the script thoroughly

### Modifying Existing Scripts
1. Make changes to the script file
2. Test the changes in development
3. Update documentation if needed
4. Commit changes with clear commit messages

## 📊 Script Analysis

### Current Script.js Analysis
- **Lines of Code:** 2,786
- **File Size:** 104KB
- **Complexity:** High (monolithic structure)
- **Maintainability:** Medium (needs refactoring)

### Refactoring Benefits
- **Modularity:** Easier to maintain and test
- **Reusability:** Components can be reused
- **Debugging:** Easier to isolate issues
- **Performance:** Better code splitting
- **Collaboration:** Multiple developers can work on different modules

## 🔍 Script Dependencies

### External Dependencies
- **Firebase:** Analytics and error tracking
- **jsPDF:** PDF generation for results

### Internal Dependencies
- **Vite:** Build tool and development server
- **ES6 Modules:** Module system
- **Localization:** Multi-language support

## 🧪 Testing Scripts

### Manual Testing
1. Open the application in a browser
2. Test all quiz functionality
3. Verify analytics integration
4. Check VK platform integration
5. Test internationalization

### Automated Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📈 Performance Considerations

### Script Optimization
- **Code Splitting:** Break down large files
- **Lazy Loading:** Load modules on demand
- **Tree Shaking:** Remove unused code
- **Minification:** Reduce file size
- **Caching:** Implement proper caching strategies

### Monitoring
- Monitor script loading times
- Track script execution performance
- Analyze bundle sizes
- Review memory usage

## 🆘 Troubleshooting

### Common Issues
1. **Script Loading Errors:** Check file paths and dependencies
2. **Performance Issues:** Analyze script size and loading
3. **Compatibility Problems:** Verify browser support
4. **Build Errors:** Check build configuration

### Support
- Check the [development guides](../docs/guides/)
- Review [architecture documentation](../docs/architecture/)
- Open an issue for script problems
- Consult the main [README.md](../README.md) 