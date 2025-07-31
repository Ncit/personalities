/**
 * AI Insights Engine
 * Provides personalized insights, recommendations, and analysis based on user personality data
 * Integrates with external AI services for enhanced personalization
 */

import { LoggerManager } from '../core/LoggerManager.js';
import { stateManager } from '../core/StateManager.js';

export class AIInsightsEngine {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('AIInsightsEngine');
        this.insightsCache = new Map();
        this.userProfile = null;
        this.personalityData = null;
        
        // AI service configuration
        this.aiConfig = {
            enabled: true,
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.7,
            cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
            fallbackMode: true // Use local insights if AI is unavailable
        };
        
        this.init();
    }

    /**
     * Initialize AI Insights Engine
     */
    async init() {
        try {
            this.logger.log('Initializing AI Insights Engine');
            
            // Load personality data
            await this.loadPersonalityData();
            
            // Initialize user profile
            this.initializeUserProfile();
            
            this.logger.log('AI Insights Engine initialized successfully');
            
        } catch (error) {
            this.logger.error('Error initializing AI Insights Engine:', error);
        }
    }

    /**
     * Load personality data for AI analysis
     */
    async loadPersonalityData() {
        try {
            // Import personality data
            const { MBTI_TYPES, ADVANCED_INSIGHTS } = await import('../../data/QuizData.ru.js');
            this.personalityData = {
                types: MBTI_TYPES,
                insights: ADVANCED_INSIGHTS
            };
            
            this.logger.debug('Personality data loaded successfully');
        } catch (error) {
            this.logger.error('Error loading personality data:', error);
            throw error;
        }
    }

    /**
     * Initialize user profile
     */
    initializeUserProfile() {
        const lastResults = stateManager.getLastResults();
        if (lastResults) {
            this.userProfile = {
                personalityType: lastResults.personalityType,
                scores: lastResults.scores,
                dimensionBreakdown: lastResults.dimensionBreakdown,
                quizType: stateManager.getCurrentQuizType(),
                isPremium: stateManager.isPremium(),
                timestamp: Date.now()
            };
        }
    }

    /**
     * Generate personalized insights
     */
    async generatePersonalizedInsights(userData = null) {
        try {
            // Update user profile if new data provided
            if (userData) {
                this.userProfile = { ...this.userProfile, ...userData };
            }

            if (!this.userProfile) {
                throw new Error('No user profile available for insights generation');
            }

            this.logger.log('Generating personalized insights for:', this.userProfile.personalityType);

            // Check cache first
            const cacheKey = this.generateCacheKey();
            const cachedInsights = this.getCachedInsights(cacheKey);
            if (cachedInsights) {
                this.logger.debug('Returning cached insights');
                return cachedInsights;
            }

            // Generate insights based on available services
            let insights;
            if (this.aiConfig.enabled) {
                try {
                    insights = await this.generateAIInsights();
                } catch (error) {
                    this.logger.warn('AI insights generation failed, using fallback:', error);
                    insights = this.generateFallbackInsights();
                }
            } else {
                insights = this.generateFallbackInsights();
            }

            // Cache the insights
            this.cacheInsights(cacheKey, insights);

            // Track insights generation
            this.trackInsightsGeneration(insights);

            return insights;

        } catch (error) {
            this.logger.error('Error generating personalized insights:', error);
            return this.generateFallbackInsights();
        }
    }

    /**
     * Generate AI-powered insights
     */
    async generateAIInsights() {
        const prompt = this.buildAIPrompt();
        
        const response = await fetch(this.aiConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAPIKey()}`
            },
            body: JSON.stringify({
                model: this.aiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional personality psychologist specializing in MBTI analysis. Provide personalized, actionable insights and recommendations based on the user\'s personality type and quiz results.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.aiConfig.maxTokens,
                temperature: this.aiConfig.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        return this.parseAIResponse(aiResponse);
    }

    /**
     * Build AI prompt with user data
     */
    buildAIPrompt() {
        const { personalityType, scores, dimensionBreakdown, quizType } = this.userProfile;
        const personalityInfo = this.personalityData.types[personalityType];

        return `
Analyze the following MBTI personality data and provide personalized insights:

Personality Type: ${personalityType}
Quiz Type: ${quizType}
Dimension Scores:
- Extraversion (E): ${scores.E} | Introversion (I): ${scores.I}
- Sensing (S): ${scores.S} | Intuition (N): ${scores.N}
- Thinking (T): ${scores.T} | Feeling (F): ${scores.F}
- Judging (J): ${scores.J} | Perceiving (P): ${scores.P}

Personality Description: ${personalityInfo?.description || 'Not available'}

Please provide:
1. Personalized career recommendations (3-5 specific roles)
2. Communication style insights and tips
3. Leadership approach recommendations
4. Personal development suggestions
5. Relationship dynamics advice
6. Stress management strategies
7. Learning style optimization
8. Team collaboration preferences

Format the response as JSON with the following structure:
{
  "career_recommendations": ["role1", "role2", "role3"],
  "communication_insights": "detailed insights",
  "leadership_approach": "leadership style description",
  "personal_development": ["suggestion1", "suggestion2", "suggestion3"],
  "relationship_dynamics": "relationship advice",
  "stress_management": ["strategy1", "strategy2", "strategy3"],
  "learning_style": "learning optimization tips",
  "team_collaboration": "teamwork preferences and tips"
}
        `;
    }

    /**
     * Parse AI response into structured format
     */
    parseAIResponse(aiResponse) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return this.validateAndEnhanceInsights(parsed);
            } else {
                // Fallback parsing for non-JSON responses
                return this.parseTextResponse(aiResponse);
            }
        } catch (error) {
            this.logger.warn('Failed to parse AI response as JSON, using text parsing:', error);
            return this.parseTextResponse(aiResponse);
        }
    }

    /**
     * Parse text-based AI response
     */
    parseTextResponse(text) {
        const insights = {
            career_recommendations: [],
            communication_insights: '',
            leadership_approach: '',
            personal_development: [],
            relationship_dynamics: '',
            stress_management: [],
            learning_style: '',
            team_collaboration: ''
        };

        // Extract career recommendations
        const careerMatch = text.match(/career[^:]*:\s*([^.\n]+)/i);
        if (careerMatch) {
            insights.career_recommendations = careerMatch[1].split(',').map(s => s.trim());
        }

        // Extract other insights using regex patterns
        const patterns = {
            communication_insights: /communication[^:]*:\s*([^.\n]+)/i,
            leadership_approach: /leadership[^:]*:\s*([^.\n]+)/i,
            relationship_dynamics: /relationship[^:]*:\s*([^.\n]+)/i,
            learning_style: /learning[^:]*:\s*([^.\n]+)/i,
            team_collaboration: /team[^:]*:\s*([^.\n]+)/i
        };

        Object.entries(patterns).forEach(([key, pattern]) => {
            const match = text.match(pattern);
            if (match) {
                insights[key] = match[1].trim();
            }
        });

        return this.validateAndEnhanceInsights(insights);
    }

    /**
     * Validate and enhance insights with fallback data
     */
    validateAndEnhanceInsights(insights) {
        const { personalityType } = this.userProfile;
        const personalityInfo = this.personalityData.types[personalityType];
        const advancedInsights = this.personalityData.insights[personalityType];

        // Ensure all required fields exist
        const enhancedInsights = {
            career_recommendations: insights.career_recommendations || advancedInsights?.careers || [],
            communication_insights: insights.communication_insights || advancedInsights?.communication || '',
            leadership_approach: insights.leadership_approach || advancedInsights?.leadership || '',
            personal_development: insights.personal_development || advancedInsights?.development || [],
            relationship_dynamics: insights.relationship_dynamics || advancedInsights?.relationships || '',
            stress_management: insights.stress_management || advancedInsights?.stressManagement || [],
            learning_style: insights.learning_style || advancedInsights?.learning || '',
            team_collaboration: insights.team_collaboration || advancedInsights?.teamwork || '',
            personality_type: personalityType,
            generated_at: new Date().toISOString(),
            source: insights.source || 'ai_enhanced'
        };

        return enhancedInsights;
    }

    /**
     * Generate fallback insights using local data
     */
    generateFallbackInsights() {
        const { personalityType } = this.userProfile;
        const advancedInsights = this.personalityData.insights[personalityType];

        if (!advancedInsights) {
            return this.generateBasicInsights();
        }

        return {
            career_recommendations: advancedInsights.careers || [],
            communication_insights: advancedInsights.communication || '',
            leadership_approach: advancedInsights.leadership || '',
            personal_development: advancedInsights.development || [],
            relationship_dynamics: advancedInsights.relationships || '',
            stress_management: advancedInsights.stressManagement || [],
            learning_style: advancedInsights.learning || '',
            team_collaboration: advancedInsights.teamwork || '',
            personality_type: personalityType,
            generated_at: new Date().toISOString(),
            source: 'fallback_local'
        };
    }

    /**
     * Generate basic insights when no advanced data is available
     */
    generateBasicInsights() {
        const { personalityType, scores } = this.userProfile;
        
        return {
            career_recommendations: this.generateBasicCareerRecommendations(),
            communication_insights: this.generateBasicCommunicationInsights(),
            leadership_approach: this.generateBasicLeadershipInsights(),
            personal_development: this.generateBasicDevelopmentSuggestions(),
            relationship_dynamics: this.generateBasicRelationshipInsights(),
            stress_management: this.generateBasicStressManagement(),
            learning_style: this.generateBasicLearningInsights(),
            team_collaboration: this.generateBasicTeamworkInsights(),
            personality_type: personalityType,
            generated_at: new Date().toISOString(),
            source: 'basic_generated'
        };
    }

    /**
     * Generate career recommendations based on personality scores
     */
    generateBasicCareerRecommendations() {
        const { scores } = this.userProfile;
        const recommendations = [];

        // Extraversion-based recommendations
        if (scores.E > scores.I) {
            recommendations.push('Sales Representative', 'Marketing Manager', 'Event Coordinator');
        } else {
            recommendations.push('Software Developer', 'Research Analyst', 'Librarian');
        }

        // Sensing vs Intuition
        if (scores.S > scores.N) {
            recommendations.push('Accountant', 'Quality Assurance Specialist', 'Project Manager');
        } else {
            recommendations.push('Creative Director', 'Strategic Planner', 'Innovation Consultant');
        }

        // Thinking vs Feeling
        if (scores.T > scores.F) {
            recommendations.push('Data Analyst', 'Systems Engineer', 'Legal Consultant');
        } else {
            recommendations.push('Human Resources Manager', 'Counselor', 'Customer Success Manager');
        }

        return recommendations.slice(0, 5); // Return top 5
    }

    /**
     * Generate communication insights
     */
    generateBasicCommunicationInsights() {
        const { scores } = this.userProfile;
        let insights = '';

        if (scores.E > scores.I) {
            insights += 'You prefer direct, verbal communication and enjoy group discussions. ';
        } else {
            insights += 'You prefer written communication and one-on-one conversations. ';
        }

        if (scores.S > scores.N) {
            insights += 'You communicate with concrete details and practical examples. ';
        } else {
            insights += 'You communicate with big-picture concepts and future possibilities. ';
        }

        return insights;
    }

    /**
     * Generate leadership insights
     */
    generateBasicLeadershipInsights() {
        const { scores } = this.userProfile;
        
        if (scores.E > scores.I && scores.T > scores.F) {
            return 'Directive and results-oriented leadership style';
        } else if (scores.E > scores.I && scores.F > scores.T) {
            return 'Collaborative and people-oriented leadership style';
        } else if (scores.I > scores.E && scores.T > scores.F) {
            return 'Analytical and strategic leadership style';
        } else {
            return 'Supportive and values-driven leadership style';
        }
    }

    /**
     * Generate development suggestions
     */
    generateBasicDevelopmentSuggestions() {
        const { scores } = this.userProfile;
        const suggestions = [];

        if (scores.E > scores.I) {
            suggestions.push('Practice active listening in conversations');
            suggestions.push('Develop patience for detailed work');
        } else {
            suggestions.push('Practice speaking up in group settings');
            suggestions.push('Take on more public speaking opportunities');
        }

        if (scores.S > scores.N) {
            suggestions.push('Explore creative and innovative thinking');
            suggestions.push('Consider long-term strategic planning');
        } else {
            suggestions.push('Focus on practical implementation details');
            suggestions.push('Develop systematic organizational skills');
        }

        return suggestions;
    }

    /**
     * Generate relationship insights
     */
    generateBasicRelationshipInsights() {
        const { scores } = this.userProfile;
        
        if (scores.F > scores.T) {
            return 'You prioritize harmony and emotional connection in relationships. Consider how others feel and express appreciation openly.';
        } else {
            return 'You value logical consistency and fairness in relationships. Focus on understanding others\' perspectives and showing empathy.';
        }
    }

    /**
     * Generate stress management strategies
     */
    generateBasicStressManagement() {
        const { scores } = this.userProfile;
        const strategies = [];

        if (scores.E > scores.I) {
            strategies.push('Talk through problems with trusted friends');
            strategies.push('Engage in social activities to recharge');
        } else {
            strategies.push('Take quiet time for reflection and processing');
            strategies.push('Practice mindfulness or meditation');
        }

        if (scores.J > scores.P) {
            strategies.push('Create structured routines and schedules');
            strategies.push('Break large tasks into manageable steps');
        } else {
            strategies.push('Allow flexibility in your plans');
            strategies.push('Embrace spontaneity and new opportunities');
        }

        return strategies;
    }

    /**
     * Generate learning insights
     */
    generateBasicLearningInsights() {
        const { scores } = this.userProfile;
        
        if (scores.S > scores.N) {
            return 'You learn best through hands-on experience and practical applications. Prefer step-by-step instructions and concrete examples.';
        } else {
            return 'You learn best through conceptual understanding and theoretical frameworks. Enjoy exploring possibilities and innovative approaches.';
        }
    }

    /**
     * Generate teamwork insights
     */
    generateBasicTeamworkInsights() {
        const { scores } = this.userProfile;
        
        if (scores.E > scores.I) {
            return 'You thrive in collaborative team environments and enjoy brainstorming sessions. Natural team motivator and communicator.';
        } else {
            return 'You prefer focused individual work with clear team roles. Contribute through deep analysis and thoughtful insights.';
        }
    }

    /**
     * Cache insights for performance
     */
    cacheInsights(key, insights) {
        this.insightsCache.set(key, {
            insights,
            timestamp: Date.now()
        });
    }

    /**
     * Get cached insights if available and not expired
     */
    getCachedInsights(key) {
        const cached = this.insightsCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.aiConfig.cacheTimeout) {
            return cached.insights;
        }
        return null;
    }

    /**
     * Generate cache key for insights
     */
    generateCacheKey() {
        const { personalityType, quizType } = this.userProfile;
        return `${personalityType}_${quizType}_${this.aiConfig.model}`;
    }

    /**
     * Get API key from environment or configuration
     */
    getAPIKey() {
        // In production, this should come from secure environment variables
        return process.env.OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '';
    }

    /**
     * Track insights generation for analytics
     */
    trackInsightsGeneration(insights) {
        try {
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent('ai_insights_generated', {
                    personality_type: insights.personality_type,
                    source: insights.source,
                    has_career_recommendations: insights.career_recommendations.length > 0,
                    has_communication_insights: !!insights.communication_insights,
                    has_leadership_insights: !!insights.leadership_approach,
                    quiz_type: this.userProfile.quizType,
                    is_premium: this.userProfile.isPremium
                });
            }
        } catch (error) {
            this.logger.warn('Failed to track insights generation:', error);
        }
    }

    /**
     * Get insights for specific category
     */
    async getInsightsForCategory(category) {
        const insights = await this.generatePersonalizedInsights();
        return insights[category] || null;
    }

    /**
     * Update user profile with new data
     */
    updateUserProfile(newData) {
        this.userProfile = { ...this.userProfile, ...newData };
        // Clear cache when profile changes
        this.insightsCache.clear();
    }

    /**
     * Get current user profile
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Check if AI insights are available
     */
    isAIAvailable() {
        return this.aiConfig.enabled && !!this.getAPIKey();
    }

    /**
     * Set API key for AI services
     */
    setAPIKey(apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
    }

    /**
     * Enable/disable AI features
     */
    setAIEnabled(enabled) {
        this.aiConfig.enabled = enabled;
        this.logger.log(`AI features ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Create global instance
export const aiInsightsEngine = new AIInsightsEngine(); 