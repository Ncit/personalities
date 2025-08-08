# Test Suite

This directory contains all test files and test utilities for the MBTI Personality Quiz application.

## 📁 Test Structure

```
tests/
├── README.md                    # This file
├── test_android_cors_fix.html   # Android CORS testing
├── test_cors_removal.html       # CORS removal testing
├── test_permissive_cors.html    # Permissive CORS testing
├── test_timeout_fix.html        # Timeout error testing
├── test_vk_user_service.html    # VK user service testing
└── test-eruda.html              # Eruda debug testing
```

## 🧪 Test Categories

### 🔧 Integration Tests
- **CORS Testing**: Tests for cross-origin resource sharing issues
  - `test_android_cors_fix.html` - Android-specific CORS fixes
  - `test_cors_removal.html` - CORS removal functionality
  - `test_permissive_cors.html` - Permissive CORS configuration

### 🐛 Debug Tests
- **Error Handling**: Tests for error scenarios and fixes
  - `test_timeout_fix.html` - Timeout error resolution
  - `test_vk_user_service.html` - VK user service functionality
  - `test-eruda.html` - Eruda debugging tool integration

## 🚀 Running Tests

### Manual Testing
1. Open any test file in your browser
2. Follow the instructions in the test file
3. Check the browser console for results
4. Verify the expected behavior

### Automated Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test category
npm test -- --testPathPattern=cors
```

## 📊 Test Results

Test results are displayed in the browser console and can be exported for analysis.

## 🔍 Test Coverage

Current test coverage includes:
- ✅ CORS configuration and fixes
- ✅ VK platform integration
- ✅ Error handling scenarios
- ✅ Debug tool integration
- ✅ User service functionality

## 🛠️ Adding New Tests

When adding new tests:
1. Create a new HTML file in the `tests/` directory
2. Follow the naming convention: `test_[feature]_[purpose].html`
3. Include clear test instructions in the file
4. Update this README with the new test
5. Ensure the test can be run independently

## 📝 Test Documentation

Each test file should include:
- **Purpose**: What the test is checking
- **Prerequisites**: Any setup required
- **Steps**: How to run the test
- **Expected Results**: What should happen
- **Troubleshooting**: Common issues and solutions

## 🆘 Test Issues

If you encounter issues with tests:
1. Check the browser console for errors
2. Verify all dependencies are loaded
3. Ensure the test environment is properly configured
4. Review the test documentation
5. Open an issue if the problem persists 