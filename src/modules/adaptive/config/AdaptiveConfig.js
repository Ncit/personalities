/**
 * Adaptive Assessment Configuration
 * Configuration parameters for the adaptive assessment system
 */

export const ADAPTIVE_CONFIG = {
    // Question selection parameters
    questionSelection: {
        minQuestions: 20,           // Minimum questions before early termination
        maxQuestions: 60,           // Maximum questions for full assessment
        confidenceThreshold: 0.85,  // Confidence level for early termination
        adaptationRate: 0.3,        // How quickly to adapt to user responses
        balanceWeight: 0.4,         // Weight for balanced question distribution
        personalizationWeight: 0.6  // Weight for personalized question selection
    },

    // Confidence scoring parameters
    confidence: {
        minSamples: 5,              // Minimum responses before confidence calculation
        dimensionWeight: 0.25,      // Weight for each MBTI dimension
        responseConsistency: 0.3,   // Weight for response consistency
        patternRecognition: 0.45    // Weight for pattern recognition
    },

    // Personalization parameters
    personalization: {
        learningRate: 0.1,          // How quickly to learn user preferences
        historyWeight: 0.7,         // Weight for user response history
        currentSessionWeight: 0.3,  // Weight for current session responses
        adaptationThreshold: 0.6    // Threshold for personalization changes
    },

    // Performance parameters
    performance: {
        maxProcessingTime: 100,     // Maximum processing time in milliseconds
        memoryLimit: 50,            // Memory usage limit in MB
        cacheSize: 100,             // Number of cached calculations
        optimizationLevel: 'balanced' // 'aggressive', 'balanced', 'conservative'
    },

    // Question pool parameters
    questionPool: {
        dimensionBalance: {
            EI: { min: 0.15, max: 0.25 },  // Extraversion/Introversion
            SN: { min: 0.15, max: 0.25 },  // Sensing/Intuition
            TF: { min: 0.15, max: 0.25 },  // Thinking/Feeling
            JP: { min: 0.15, max: 0.25 }   // Judging/Perceiving
        },
        difficultyDistribution: {
            easy: 0.3,      // 30% easy questions
            medium: 0.5,    // 50% medium questions
            hard: 0.2       // 20% hard questions
        },
        questionTypes: {
            behavioral: 0.4,    // 40% behavioral questions
            situational: 0.3,   // 30% situational questions
            preference: 0.3     // 30% preference questions
        }
    },

    // Early termination parameters
    earlyTermination: {
        enabled: true,
        minConfidence: 0.9,        // Minimum confidence for early termination
        minQuestionsAnswered: 25,  // Minimum questions before considering termination
        maxQuestionsSaved: 15,     // Maximum questions that can be skipped
        validationThreshold: 0.95  // Validation threshold for termination decision
    },

    // Analytics parameters
    analytics: {
        trackAdaptation: true,     // Track adaptation decisions
        trackConfidence: true,     // Track confidence scores
        trackPerformance: true,    // Track performance metrics
        trackUserSatisfaction: true // Track user satisfaction
    }
};

/**
 * Get configuration value with fallback
 * @param {string} path - Configuration path (e.g., 'questionSelection.minQuestions')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value or default
 */
export function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = ADAPTIVE_CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Update configuration value
 * @param {string} path - Configuration path
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
export function updateConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let config = ADAPTIVE_CONFIG;
    
    for (const key of keys) {
        if (!config[key] || typeof config[key] !== 'object') {
            config[key] = {};
        }
        config = config[key];
    }
    
    config[lastKey] = value;
    return true;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig() {
    // This would reload the default configuration
    // For now, just return the original config
    return ADAPTIVE_CONFIG;
}

export default ADAPTIVE_CONFIG;
