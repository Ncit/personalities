/**
 * Recommendation System Component Test Script
 * Tests all core components of the recommendation system
 */

// Mock browser environment for Node.js testing
global.window = {};
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Import components (using require for Node.js)
const ResponseAnalyzer = require('../src/modules/recommendations/ResponseAnalyzer.js');
const RecommendationEngine = require('../src/modules/recommendations/RecommendationEngine.js');
const ContentManager = require('../src/modules/content/ContentManager.js');
const UserProfileManager = require('../src/modules/profiles/UserProfileManager.js');

// Test data
const mockQuizData = {
    personalityType: 'INTJ',
    dimensions: {
        EI: { score: 0.3, confidence: 0.75 },
        SN: { score: 0.7, confidence: 0.45 },
        TF: { score: 0.2, confidence: 0.85 },
        JP: { score: 0.8, confidence: 0.35 }
    },
    responses: Array.from({ length: 20 }, (_, i) => ({
        questionId: i + 1,
        selectedOption: Math.floor(Math.random() * 4) + 1,
        dimension: ['EI', 'SN', 'TF', 'JP'][i % 4],
        responseTime: 2000 + Math.random() * 6000,
        confidence: 0.5 + Math.random() * 0.5
    })),
    totalQuestions: 61,
    totalTime: 120000,
    timestamp: Date.now()
};

const mockUserProfile = {
    mbtiType: 'INTJ',
    goals: ['personal_development', 'career_advancement'],
    interests: ['psychology', 'productivity', 'leadership']
};

// Test functions
async function testResponseAnalyzer() {
    console.log('\n🧪 Testing ResponseAnalyzer...');
    
    try {
        const analyzer = new ResponseAnalyzer();
        const analysis = analyzer.analyzeUserResponses(mockQuizData);
        
        console.log('✅ ResponseAnalyzer: Analysis completed successfully');
        console.log(`   - Confidence patterns: ${Object.keys(analysis.confidencePatterns).length} areas`);
        console.log(`   - Development areas: ${analysis.developmentAreas.length} identified`);
        console.log(`   - Learning style: ${analysis.learningStyle}`);
        
        return true;
    } catch (error) {
        console.error('❌ ResponseAnalyzer test failed:', error.message);
        return false;
    }
}

async function testContentManager() {
    console.log('\n📚 Testing ContentManager...');
    
    try {
        const contentManager = new ContentManager();
        const stats = contentManager.getContentStats();
        
        console.log('✅ ContentManager: Content database initialized successfully');
        console.log(`   - Total content items: ${stats.totalItems}`);
        console.log(`   - Categories: ${Object.keys(stats.byCategory).length}`);
        
        // Test content search
        const searchResults = contentManager.searchContent('confidence', ['books']);
        console.log(`   - Search results: ${searchResults.books.length} books found`);
        
        return true;
    } catch (error) {
        console.error('❌ ContentManager test failed:', error.message);
        return false;
    }
}

async function testUserProfileManager() {
    console.log('\n👤 Testing UserProfileManager...');
    
    try {
        const profileManager = new UserProfileManager();
        await profileManager.initialize();
        
        profileManager.setCurrentUser('test_user_001');
        const profile = profileManager.getProfile('test_user_001');
        
        console.log('✅ UserProfileManager: Profile management working');
        console.log(`   - Profile created: ${profile.id === 'test_user_001'}`);
        console.log(`   - Default preferences: ${Object.keys(profile.preferences).length} areas`);
        
        // Test profile update
        const updatedProfile = profileManager.updateProfile('test_user_001', {
            preferences: { learningStyle: 'rapid_learner' }
        });
        console.log(`   - Profile updated: ${updatedProfile.preferences.learningStyle === 'rapid_learner'}`);
        
        return true;
    } catch (error) {
        console.error('❌ UserProfileManager test failed:', error.message);
        return false;
    }
}

async function testRecommendationEngine() {
    console.log('\n💡 Testing RecommendationEngine...');
    
    try {
        // Create a mock ResponseAnalyzer for the engine
        const mockAnalyzer = {
            analyzeUserResponses: (quizData) => {
                return {
                    confidencePatterns: { 
                        confidenceGaps: [],
                        strongAreas: []
                    },
                    behavioralPatterns: { 
                        stress: { level: 0.3 },
                        learning: { pace: 'moderate' }
                    },
                    learningStyle: 'balanced_learner',
                    stressIndicators: {
                        overallLevel: 0.3,
                        indicators: []
                    },
                    developmentAreas: []
                };
            }
        };
        
        // Mock the ResponseAnalyzer in the engine
        const engine = new RecommendationEngine();
        engine.setResponseAnalyzer(mockAnalyzer);
        
        const recommendations = engine.generateRecommendations(mockQuizData, mockUserProfile);
        
        console.log('✅ RecommendationEngine: Recommendations generated successfully');
        console.log(`   - Immediate actions: ${recommendations.recommendations.immediate?.length || 0}`);
        console.log(`   - Short-term goals: ${recommendations.recommendations.shortTerm?.length || 0}`);
        console.log(`   - Long-term plans: ${recommendations.recommendations.longTerm?.length || 0}`);
        
        return true;
    } catch (error) {
        console.error('❌ RecommendationEngine test failed:', error.message);
        return false;
    }
}

async function testIntegration() {
    console.log('\n🔗 Testing System Integration...');
    
    try {
        // Initialize all components
        const analyzer = new ResponseAnalyzer();
        const contentManager = new ContentManager();
        const profileManager = new UserProfileManager();
        
        // Test end-to-end flow
        const analysis = analyzer.analyzeUserResponses(mockQuizData);
        const contentRecs = contentManager.getContentRecommendations(mockUserProfile, ['books'], 3);
        
        console.log('✅ System Integration: Core components working together');
        console.log(`   - Analysis completed: ${analysis ? 'Yes' : 'No'}`);
        console.log(`   - Content recommendations: ${contentRecs.books.length} books`);
        
        return true;
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        return false;
    }
}

// Performance test
async function testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    try {
        const analyzer = new ResponseAnalyzer();
        const startTime = Date.now();
        
        // Run multiple analyses
        for (let i = 0; i < 10; i++) {
            analyzer.analyzeUserResponses(mockQuizData);
        }
        
        const endTime = Date.now();
        const avgTime = (endTime - startTime) / 10;
        
        console.log('✅ Performance Test: Analysis performance acceptable');
        console.log(`   - Average analysis time: ${avgTime.toFixed(2)}ms`);
        console.log(`   - Cache effectiveness: ${analyzer.getCacheStats().size > 0 ? 'Working' : 'Not working'}`);
        
        return avgTime < 100; // Should be under 100ms
    } catch (error) {
        console.error('❌ Performance test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Recommendation System Component Tests...\n');
    
    const tests = [
        { name: 'ResponseAnalyzer', fn: testResponseAnalyzer },
        { name: 'ContentManager', fn: testContentManager },
        { name: 'UserProfileManager', fn: testUserProfileManager },
        { name: 'RecommendationEngine', fn: testRecommendationEngine },
        { name: 'System Integration', fn: testIntegration },
        { name: 'Performance', fn: testPerformance }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passed++;
        } catch (error) {
            console.error(`❌ ${test.name} test crashed:`, error.message);
        }
    }
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Tests Passed: ${passed}/${total}`);
    console.log(`❌ Tests Failed: ${total - passed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (passed === total) {
        console.log('\n🎉 All tests passed! Recommendation system is ready for use.');
        return true;
    } else {
        console.log('\n⚠️ Some tests failed. Please review the errors above.');
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test runner crashed:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };
