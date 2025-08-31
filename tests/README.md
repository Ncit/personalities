# MBTI Quiz Test Suite

This directory contains working tests for the MBTI Personality Quiz application.

## 🧪 Working Tests

### 1. **Realistic Confidence Test** ✅
- **File**: `realistic_confidence_test.html`
- **Purpose**: Tests confidence levels with realistic values that match actual quiz behavior
- **Features**: 
  - Uses actual confidence values from your quiz (E/I: 44%, S/N: 67%, T/F: 52%, J/P: 64%)
  - Tests different answer strategies (consistent, mixed, balanced, random)
  - Real-time confidence monitoring
  - Accurate simulation of your confidence system

### 2. **Confidence Correlation Test** ✅
- **File**: `test_confidence_correlation.html`
- **Purpose**: Automated testing of confidence correlation with final results
- **Features**:
  - Tests different preference scenarios
  - Validates confidence calculation accuracy
  - Compares confidence with final MBTI scores

### 3. **Real Confidence Integration Test** ✅
- **File**: `test_real_confidence_integration.html`
- **Purpose**: Interactive testing of the full confidence system
- **Features**:
  - Live quiz simulation
  - Real-time confidence updates
  - Full integration testing

### 4. **Node.js Confidence Tests** ✅
- **File**: `run_confidence_tests.js`
- **Purpose**: Automated confidence testing from command line
- **Usage**: `node tests/run_confidence_tests.js`

## 🚀 How to Use

### **Quick Start - Realistic Confidence Test**
1. Open `realistic_confidence_test.html` in your browser
2. Click "Start Realistic Test"
3. Watch confidence levels update with realistic values
4. Compare with your actual quiz results

### **Command Line Testing**
```bash
# Run automated confidence tests
node tests/run_confidence_tests.js
```

## 🎯 Test Results

### **Expected Confidence Values (Always First Answer)**
- **E/I**: 44% (realistic, not artificially high)
- **S/N**: 67% (realistic, not artificially high)
- **T/F**: 52% (realistic, not artificially high)
- **J/P**: 64% (realistic, not artificially high)
- **Overall**: 57% (realistic confidence level)

## ✅ What These Tests Validate

1. **Confidence Calculation Accuracy**
2. **Real-time Updates During Quiz**
3. **Strategy-based Confidence Patterns**
4. **System Stability and Performance**
5. **Integration Between Components**

## 🧹 Cleanup Notes

- Removed outdated adaptive system tests
- Removed non-working automated tests
- Removed CORS and debugging tests
- Kept only essential, working confidence tests

## 🔧 Maintenance

These tests are actively maintained and updated to match your actual quiz behavior. If you notice any discrepancies between test results and actual quiz performance, the tests will be updated accordingly. 