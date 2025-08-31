#!/usr/bin/env node

/**
 * Confidence Testing Validation Script
 * Runs confidence tests and validates results
 */

console.log('🧠 CONFIDENCE TESTING VALIDATION');
console.log('================================\n');

// Mock MBTIQuiz class for testing
class MockMBTIQuiz {
    constructor() {
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.answers = [];
        this.questions = [];
        this.currentQuestion = 0;
    }

    calculateCurrentConfidence() {
        const confidence = { EI: 0, SN: 0, TF: 0, JP: 0 };
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        
        dimensions.forEach(dimension => {
            const [pref1, pref2] = dimension.split('');
            const score1 = this.scores[pref1] || 0;
            const score2 = this.scores[pref2] || 0;
            
            const answeredForDimension = this.answers.filter(a => a.dimension === dimension).length;
            
            let dimensionConfidence = 0;
            
            if (answeredForDimension > 0) {
                const totalPossibleScore = answeredForDimension * 3;
                const totalScore = score1 + score2;
                const scoreDifference = Math.abs(score1 - score2);
                
                const utilizationRatio = totalScore / totalPossibleScore;
                const preferenceStrength = scoreDifference / totalPossibleScore;
                
                dimensionConfidence = (utilizationRatio * 0.4) + (preferenceStrength * 0.6);
                dimensionConfidence = Math.max(0, Math.min(1, dimensionConfidence));
                dimensionConfidence = Math.max(0.1, dimensionConfidence);
            } else {
                dimensionConfidence = 0.1;
            }
            
            confidence[dimension] = dimensionConfidence;
        });
        
        return confidence;
    }

    calculatePersonalityType() {
        const type = [];
        type.push(this.scores.E > this.scores.I ? 'E' : 'I');
        type.push(this.scores.S > this.scores.N ? 'S' : 'N');
        type.push(this.scores.T > this.scores.F ? 'T' : 'F');
        type.push(this.scores.J > this.scores.P ? 'J' : 'P');
        return type.join('');
    }

    analyzeConfidenceResultsCorrelation() {
        const confidenceScores = this.calculateCurrentConfidence();
        const finalType = this.calculatePersonalityType();
        
        // Analyze each dimension
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        let totalCorrelation = 0;
        let correlationCount = 0;
        
        dimensions.forEach(dimension => {
            const [pref1, pref2] = dimension.split('');
            const score1 = this.scores[pref1] || 0;
            const score2 = this.scores[pref2] || 0;
            const confidence = confidenceScores[dimension] || 0;
            const scoreDifference = Math.abs(score1 - score2);
            const totalScore = score1 + score2;
            
            const clarity = totalScore > 0 ? (scoreDifference / totalScore) : 0;
            
            if (totalScore > 0) {
                totalCorrelation += Math.abs(confidence - clarity);
                correlationCount++;
            }
        });
        
        const avgConfidence = Object.values(confidenceScores).reduce((sum, val) => sum + val, 0) / Object.values(confidenceScores).length;
        const avgCorrelation = correlationCount > 0 ? (1 - (totalCorrelation / correlationCount)) : 0;
        
        return {
            finalType,
            scores: { ...this.scores },
            confidenceScores,
            avgConfidence,
            avgCorrelation,
            totalAnswers: this.answers.length
        };
    }
}

// Test scenarios
function testClearPreferences() {
    console.log('🧪 TEST 1: Clear Preferences Test');
    console.log('================================');
    
    const quiz = new MockMBTIQuiz();
    
    // Simulate clear E, S, T, J preferences
    for (let i = 0; i < 15; i++) {
        quiz.answers.push({ option: 1, dimension: 'EI' });
        quiz.scores.E += 3;
    }
    for (let i = 0; i < 15; i++) {
        quiz.answers.push({ option: 1, dimension: 'SN' });
        quiz.scores.S += 3;
    }
    for (let i = 0; i < 15; i++) {
        quiz.answers.push({ option: 1, dimension: 'TF' });
        quiz.scores.T += 3;
    }
    for (let i = 0; i < 15; i++) {
        quiz.answers.push({ option: 1, dimension: 'JP' });
        quiz.scores.J += 3;
    }
    
    const results = quiz.analyzeConfidenceResultsCorrelation();
    
    console.log(`📊 Final Type: ${results.finalType}`);
    console.log(`📈 Scores: E:${results.scores.E}, I:${results.scores.I}, S:${results.scores.S}, N:${results.scores.N}, T:${results.scores.T}, F:${results.scores.F}, J:${results.scores.J}, P:${results.scores.P}`);
    console.log(`🧠 Confidence: ${JSON.stringify(results.confidenceScores)}`);
    console.log(`📊 Average Confidence: ${(results.avgConfidence * 100).toFixed(1)}%`);
    console.log(`🎯 Correlation Score: ${(results.avgCorrelation * 100).toFixed(1)}%`);
    
    // Validation
    const expectedConfidence = 0.6; // Should be high
    const expectedCorrelation = 0.7; // Should be good
    const confidencePass = results.avgConfidence >= expectedConfidence;
    const correlationPass = results.avgCorrelation >= expectedCorrelation;
    
    console.log(`✅ Confidence Test: ${confidencePass ? 'PASS' : 'FAIL'} (Expected: ${(expectedConfidence * 100).toFixed(1)}%, Got: ${(results.avgConfidence * 100).toFixed(1)}%)`);
    console.log(`✅ Correlation Test: ${correlationPass ? 'PASS' : 'FAIL'} (Expected: ${(expectedCorrelation * 100).toFixed(1)}%, Got: ${(results.avgCorrelation * 100).toFixed(1)}%)`);
    
    return { confidencePass, correlationPass, results };
}

function testMixedPreferences() {
    console.log('\n🧪 TEST 2: Mixed Preferences Test');
    console.log('==================================');
    
    const quiz = new MockMBTIQuiz();
    
    // Simulate mixed preferences
    for (let i = 0; i < 10; i++) {
        quiz.answers.push({ option: 1, dimension: 'EI' });
        quiz.scores.E += 3;
    }
    for (let i = 0; i < 5; i++) {
        quiz.answers.push({ option: 2, dimension: 'EI' });
        quiz.scores.I += 3;
    }
    
    for (let i = 0; i < 8; i++) {
        quiz.answers.push({ option: 1, dimension: 'SN' });
        quiz.scores.S += 3;
    }
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 2, dimension: 'SN' });
        quiz.scores.N += 3;
    }
    
    for (let i = 0; i < 12; i++) {
        quiz.answers.push({ option: 1, dimension: 'TF' });
        quiz.scores.T += 3;
    }
    for (let i = 0; i < 3; i++) {
        quiz.answers.push({ option: 2, dimension: 'TF' });
        quiz.scores.F += 3;
    }
    
    for (let i = 0; i < 6; i++) {
        quiz.answers.push({ option: 1, dimension: 'JP' });
        quiz.scores.J += 3;
    }
    for (let i = 0; i < 9; i++) {
        quiz.answers.push({ option: 2, dimension: 'JP' });
        quiz.scores.P += 3;
    }
    
    const results = quiz.analyzeConfidenceResultsCorrelation();
    
    console.log(`📊 Final Type: ${results.finalType}`);
    console.log(`📈 Scores: E:${results.scores.E}, I:${results.scores.I}, S:${results.scores.S}, N:${results.scores.N}, T:${results.scores.T}, F:${results.scores.F}, J:${results.scores.J}, P:${results.scores.P}`);
    console.log(`🧠 Confidence: ${JSON.stringify(results.confidenceScores)}`);
    console.log(`📊 Average Confidence: ${(results.avgConfidence * 100).toFixed(1)}%`);
    console.log(`🎯 Correlation Score: ${(results.avgCorrelation * 100).toFixed(1)}%`);
    
    // Validation
    const expectedConfidence = 0.3; // Should be moderate
    const expectedCorrelation = 0.5; // Should be reasonable
    const confidencePass = results.avgConfidence >= expectedConfidence;
    const correlationPass = results.avgCorrelation >= expectedCorrelation;
    
    console.log(`✅ Confidence Test: ${confidencePass ? 'PASS' : 'FAIL'} (Expected: ${(expectedConfidence * 100).toFixed(1)}%, Got: ${(results.avgConfidence * 100).toFixed(1)}%)`);
    console.log(`✅ Correlation Test: ${correlationPass ? 'PASS' : 'FAIL'} (Expected: ${(expectedCorrelation * 100).toFixed(1)}%, Got: ${(results.avgCorrelation * 100).toFixed(1)}%)`);
    
    return { confidencePass, correlationPass, results };
}

function testBalancedPreferences() {
    console.log('\n🧪 TEST 3: Balanced Preferences Test');
    console.log('=====================================');
    
    const quiz = new MockMBTIQuiz();
    
    // Simulate perfectly balanced preferences
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 1, dimension: 'EI' });
        quiz.scores.E += 3;
    }
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 2, dimension: 'EI' });
        quiz.scores.I += 3;
    }
    
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 1, dimension: 'SN' });
        quiz.scores.S += 3;
    }
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 2, dimension: 'SN' });
        quiz.scores.N += 3;
    }
    
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 1, dimension: 'TF' });
        quiz.scores.T += 3;
    }
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 2, dimension: 'TF' });
        quiz.scores.F += 3;
    }
    
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 1, dimension: 'JP' });
        quiz.scores.J += 3;
    }
    for (let i = 0; i < 7; i++) {
        quiz.answers.push({ option: 2, dimension: 'JP' });
        quiz.scores.P += 3;
    }
    
    const results = quiz.analyzeConfidenceResultsCorrelation();
    
    console.log(`📊 Final Type: ${results.finalType}`);
    console.log(`📈 Scores: E:${results.scores.E}, I:${results.scores.I}, S:${results.scores.S}, N:${results.scores.N}, T:${results.scores.T}, F:${results.scores.F}, J:${results.scores.J}, P:${results.scores.P}`);
    console.log(`🧠 Confidence: ${JSON.stringify(results.confidenceScores)}`);
    console.log(`📊 Average Confidence: ${(results.avgConfidence * 100).toFixed(1)}%`);
    console.log(`🎯 Correlation Score: ${(results.avgCorrelation * 100).toFixed(1)}%`);
    
    // Validation
    const expectedConfidence = 0.2; // Should be low
    const expectedCorrelation = 0.6; // Should be reasonable
    const confidencePass = results.avgConfidence <= expectedConfidence + 0.1; // Allow some tolerance
    const correlationPass = results.avgCorrelation >= expectedCorrelation;
    
    console.log(`✅ Confidence Test: ${confidencePass ? 'PASS' : 'FAIL'} (Expected: ≤${(expectedConfidence * 100).toFixed(1)}%, Got: ${(results.avgConfidence * 100).toFixed(1)}%)`);
    console.log(`✅ Correlation Test: ${correlationPass ? 'PASS' : 'FAIL'} (Expected: ${(expectedCorrelation * 100).toFixed(1)}%, Got: ${(results.avgCorrelation * 100).toFixed(1)}%)`);
    
    return { confidencePass, correlationPass, results };
}

function testRandomPreferences() {
    console.log('\n🧪 TEST 4: Random Preferences Test');
    console.log('===================================');
    
    const quiz = new MockMBTIQuiz();
    
    // Simulate random preferences
    const dimensions = ['EI', 'SN', 'TF', 'JP'];
    for (let i = 0; i < 60; i++) {
        const dimension = dimensions[Math.floor(Math.random() * dimensions.length)];
        const option = Math.random() > 0.5 ? 1 : 2;
        const [pref1, pref2] = dimension.split('');
        
        quiz.answers.push({ option, dimension });
        
        if (option === 1) {
            quiz.scores[pref1] += Math.floor(Math.random() * 3) + 1;
        } else {
            quiz.scores[pref2] += Math.floor(Math.random() * 3) + 1;
        }
    }
    
    const results = quiz.analyzeConfidenceResultsCorrelation();
    
    console.log(`📊 Final Type: ${results.finalType}`);
    console.log(`📈 Scores: E:${results.scores.E}, I:${results.scores.I}, S:${results.scores.S}, N:${results.scores.N}, T:${results.scores.T}, F:${results.scores.F}, J:${results.scores.J}, P:${results.scores.P}`);
    console.log(`🧠 Confidence: ${JSON.stringify(results.confidenceScores)}`);
    console.log(`📊 Average Confidence: ${(results.avgConfidence * 100).toFixed(1)}%`);
    console.log(`🎯 Correlation Score: ${(results.avgCorrelation * 100).toFixed(1)}%`);
    
    // Validation for random test - just check that it runs without errors
    const confidencePass = results.avgConfidence >= 0.1 && results.avgConfidence <= 0.9; // Reasonable range
    const correlationPass = results.avgCorrelation >= 0.1; // Should have some correlation
    
    console.log(`✅ Confidence Test: ${confidencePass ? 'PASS' : 'FAIL'} (Range: 10-90%, Got: ${(results.avgConfidence * 100).toFixed(1)}%)`);
    console.log(`✅ Correlation Test: ${correlationPass ? 'PASS' : 'FAIL'} (Expected: >10%, Got: ${(results.avgCorrelation * 100).toFixed(1)}%)`);
    
    return { confidencePass, correlationPass, results };
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running all confidence tests...\n');
    
    const test1 = testClearPreferences();
    const test2 = testMixedPreferences();
    const test3 = testBalancedPreferences();
    const test4 = testRandomPreferences();
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('================');
    
    const totalTests = 8; // 4 tests × 2 criteria each
    const passedTests = [
        test1.confidencePass, test1.correlationPass,
        test2.confidencePass, test2.correlationPass,
        test3.confidencePass, test3.correlationPass,
        test4.confidencePass, test4.correlationPass
    ].filter(Boolean).length;
    
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    // Overall assessment
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! Confidence system is working perfectly.');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('\n✅ MOST TESTS PASSED! Confidence system is working well with minor issues.');
    } else if (passedTests >= totalTests * 0.6) {
        console.log('\n⚠️  MANY TESTS PASSED! Confidence system has some issues that need attention.');
    } else {
        console.log('\n❌ MANY TESTS FAILED! Confidence system has significant issues that need immediate attention.');
    }
    
    return {
        totalTests,
        passedTests,
        successRate: passedTests / totalTests,
        testResults: [test1, test2, test3, test4]
    };
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    MockMBTIQuiz,
    testClearPreferences,
    testMixedPreferences,
    testBalancedPreferences,
    testRandomPreferences,
    runAllTests
};
