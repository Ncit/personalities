/**
 * RecommendationEngine - Generates personalized recommendations based on user analysis
 * Uses rule-based algorithms to create actionable development suggestions
 */
class RecommendationEngine {
    constructor(responseAnalyzer = null) {
        this.responseAnalyzer = responseAnalyzer;
        this.recommendationRules = this.initializeRecommendationRules();
        this.contentManager = null; // Will be set when ContentManager is available
        this.currentLanguage = 'en'; // Default language
    }

    /**
     * Set the current language for recommendations
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 Recommendation language set to: ${language}`);
    }

    /**
     * Get localized text based on current language
     * @param {Object} textObj - Text object with language variants
     * @returns {String} Localized text
     */
    getLocalizedText(textObj) {
        if (this.currentLanguage === 'ru' && textObj.ru) {
            return textObj.ru;
        }
        return textObj.en || textObj;
    }

    /**
     * Initialize the recommendation rules system
     * @returns {Object} Recommendation rules configuration
     */
    initializeRecommendationRules() {
        return {
            confidence: {
                low: { weight: 0.8, priority: 'high' },
                fair: { weight: 0.6, priority: 'medium' },
                good: { weight: 0.4, priority: 'low' },
                high: { weight: 0.2, priority: 'very_low' },
                excellent: { weight: 0.1, priority: 'very_low' }
            },
            learningStyle: {
                rapid_learner: { approach: 'challenge', pace: 'fast' },
                deliberate_learner: { approach: 'depth', pace: 'moderate' },
                exploratory_learner: { approach: 'variety', pace: 'flexible' },
                balanced_learner: { approach: 'balanced', pace: 'adaptive' }
            },
            stressLevel: {
                low: { focus: 'growth', intensity: 'gentle' },
                medium: { focus: 'balance', intensity: 'moderate' },
                high: { focus: 'wellness', intensity: 'gentle' }
            }
        };
    }

    /**
     * Generate comprehensive recommendations for a user
     * @param {Object} quizData - Complete quiz data
     * @param {Object} userProfile - User profile and preferences
     * @returns {Object} Complete recommendation package
     */
    generateRecommendations(quizData, userProfile = {}) {
        // Analyze user responses
        const analysis = this.responseAnalyzer.analyzeUserResponses(quizData);
        
        // Generate different types of recommendations
        const recommendations = {
            immediate: this.generateImmediateActions(analysis, userProfile),
            shortTerm: this.generateShortTermGoals(analysis, userProfile),
            longTerm: this.generateLongTermDevelopment(analysis, userProfile),
            resources: this.generateResourceRecommendations(analysis, userProfile),
            activities: this.generateActivityRecommendations(analysis, userProfile)
        };

        // Rank and prioritize recommendations
        const rankedRecommendations = this.rankRecommendations(recommendations);
        
        return {
            analysis,
            recommendations: rankedRecommendations,
            summary: this.generateRecommendationSummary(rankedRecommendations),
            timestamp: Date.now()
        };
    }

    /**
     * Generate immediate actions user can take right now
     * @param {Object} analysis - Response analysis results
     * @param {Object} userProfile - User profile
     * @returns {Array} Immediate action recommendations
     */
    generateImmediateActions(analysis, userProfile) {
        const actions = [];
        const { confidencePatterns, behavioralPatterns, stressIndicators } = analysis;

        // Generate diverse immediate actions based on different criteria
        let actionCount = 0;
        const maxActions = 3; // Limit to 3 diverse actions

        // 1. Confidence-building action (only for the most critical gap)
        if (confidencePatterns.confidenceGaps.length > 0 && actionCount < maxActions) {
            const mostCriticalGap = confidencePatterns.confidenceGaps[0]; // Take only the first/most critical
            const actionText = {
                en: {
                    title: `Build ${mostCriticalGap.developmentArea} Confidence`,
                    description: `Take a moment to reflect on your ${mostCriticalGap.developmentArea} strengths`,
                    action: `Write down 3 things you're good at in ${mostCriticalGap.developmentArea}`
                },
                ru: {
                    title: `Развивайте уверенность в ${this.getRussianDevelopmentArea(mostCriticalGap.developmentArea)}`,
                    description: `Уделите время размышлениям о ваших сильных сторонах в ${this.getRussianDevelopmentArea(mostCriticalGap.developmentArea)}`,
                    action: `Запишите 3 вещи, в которых вы хороши в ${this.getRussianDevelopmentArea(mostCriticalGap.developmentArea)}`
                }
            };

            actions.push({
                type: 'confidence_building',
                dimension: mostCriticalGap.dimension,
                priority: mostCriticalGap.priority,
                title: this.getLocalizedText(actionText).title,
                description: this.getLocalizedText(actionText).description,
                action: this.getLocalizedText(actionText).action,
                estimatedTime: this.currentLanguage === 'ru' ? '5 минут' : '5 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'очень легко' : 'very_easy',
                category: 'immediate_reflection'
            });
            actionCount++;
        }

        // Stress management actions
        if (stressIndicators.overallLevel > 0.5 && actionCount < maxActions) {
            const stressActionText = {
                en: {
                    title: 'Quick Stress Relief',
                    description: 'Take a moment to center yourself',
                    action: 'Practice 3 deep breaths: inhale for 4, hold for 4, exhale for 6'
                },
                ru: {
                    title: 'Быстрое снятие стресса',
                    description: 'Уделите время, чтобы сосредоточиться',
                    action: 'Практикуйте 3 глубоких вдоха: вдох на 4, задержка на 4, выдох на 6'
                }
            };

            actions.push({
                type: 'stress_management',
                priority: 'high',
                title: this.getLocalizedText(stressActionText).title,
                description: this.getLocalizedText(stressActionText).description,
                action: this.getLocalizedText(stressActionText).action,
                estimatedTime: this.currentLanguage === 'ru' ? '2 минуты' : '2 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'очень легко' : 'very_easy',
                category: 'wellness'
            });
            actionCount++;
        }

        // 2. Quick self-reflection action
        if (actionCount < maxActions) {
            const reflectionActionText = {
                en: {
                    title: 'Quick Self-Assessment',
                    description: 'Reflect on your recent decisions and their outcomes',
                    action: 'Think about one decision you made this week and how it turned out'
                },
                ru: {
                    title: 'Быстрая самооценка',
                    description: 'Подумайте о ваших недавних решениях и их результатах',
                    action: 'Вспомните одно решение, которое вы приняли на этой неделе, и как оно обернулось'
                }
            };

            actions.push({
                type: 'self_reflection',
                priority: 'medium',
                title: this.getLocalizedText(reflectionActionText).title,
                description: this.getLocalizedText(reflectionActionText).description,
                action: this.getLocalizedText(reflectionActionText).action,
                estimatedTime: this.currentLanguage === 'ru' ? '3 минуты' : '3 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'легко' : 'easy',
                category: 'self_awareness'
            });
            actionCount++;
        }

        // 3. Environment optimization action
        if (actionCount < maxActions) {
            const environmentActionText = {
                en: {
                    title: 'Optimize Your Environment',
                    description: 'Make a small change to improve your focus',
                    action: 'Remove one distraction from your current workspace'
                },
                ru: {
                    title: 'Оптимизируйте ваше окружение',
                    description: 'Внесите небольшое изменение для улучшения концентрации',
                    action: 'Уберите один отвлекающий фактор из вашего рабочего места'
                }
            };

            actions.push({
                type: 'environment_optimization',
                priority: 'medium',
                title: this.getLocalizedText(environmentActionText).title,
                description: this.getLocalizedText(environmentActionText).description,
                action: this.getLocalizedText(environmentActionText).action,
                estimatedTime: this.currentLanguage === 'ru' ? '2 минуты' : '2 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'очень легко' : 'very_easy',
                category: 'productivity'
            });
            actionCount++;
        }

        // Learning style actions (only if we have space)
        const learningStyle = analysis.learningStyle;
        if (learningStyle === 'rapid_learner' && actionCount < maxActions) {
            const learningActionText = {
                en: {
                    title: 'Challenge Yourself',
                    description: 'Set a learning goal for today',
                    action: 'Choose one area to improve and set a specific, measurable goal'
                },
                ru: {
                    title: 'Бросьте себе вызов',
                    description: 'Поставьте учебную цель на сегодня',
                    action: 'Выберите одну область для улучшения и поставьте конкретную, измеримую цель'
                }
            };

            actions.push({
                type: 'learning_optimization',
                priority: 'medium',
                title: this.getLocalizedText(learningActionText).title,
                description: this.getLocalizedText(learningActionText).description,
                action: this.getLocalizedText(learningActionText).action,
                estimatedTime: this.currentLanguage === 'ru' ? '10 минут' : '10 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'легко' : 'easy',
                category: 'goal_setting'
            });
            actionCount++;
        }

        return this.rankActionsByPriority(actions);
    }

    /**
     * Generate short-term development goals (2-6 weeks)
     * @param {Object} analysis - Response analysis results
     * @param {Object} userProfile - User profile
     * @returns {Array} Short-term goal recommendations
     */
    generateShortTermGoals(analysis, userProfile) {
        const goals = [];
        const { confidencePatterns, behavioralPatterns, developmentAreas } = analysis;

        // Development area goals
        developmentAreas.forEach(area => {
            const goalText = {
                en: {
                    title: `Improve ${area.area}`,
                    description: area.description
                },
                ru: {
                    title: `Улучшить ${this.getRussianDevelopmentArea(area.area)}`,
                    description: this.getRussianDescription(area.description)
                }
            };

            goals.push({
                type: 'development_goal',
                area: area.area,
                priority: area.priority,
                title: this.getLocalizedText(goalText).title,
                description: this.getLocalizedText(goalText).description,
                timeframe: this.currentLanguage === 'ru' ? '2-4 недели' : '2-4 weeks',
                milestones: this.generateMilestones(area),
                difficulty: this.getRussianDifficulty(area.difficulty),
                category: 'skill_development'
            });
        });

        // Learning style goals
        const learningStyle = analysis.learningStyle;
        if (learningStyle === 'deliberate_learner') {
            const deepLearningText = {
                en: {
                    title: 'Deep Learning Project',
                    description: 'Choose one topic to explore in depth over the next month'
                },
                ru: {
                    title: 'Проект глубокого изучения',
                    description: 'Выберите одну тему для глубокого изучения в течение следующего месяца'
                }
            };

            const milestones = this.currentLanguage === 'ru' ? [
                'Неделя 1: Исследование и сбор ресурсов',
                'Неделя 2: Создание плана обучения',
                'Неделя 3: Реализация и практика',
                'Неделя 4: Размышления и документирование результатов'
            ] : [
                'Week 1: Research and gather resources',
                'Week 2: Create a learning plan',
                'Week 3: Implement and practice',
                'Week 4: Reflect and document learnings'
            ];

            goals.push({
                type: 'learning_style',
                priority: 'medium',
                title: this.getLocalizedText(deepLearningText).title,
                description: this.getLocalizedText(deepLearningText).description,
                timeframe: this.currentLanguage === 'ru' ? '4 недели' : '4 weeks',
                milestones: milestones,
                difficulty: this.currentLanguage === 'ru' ? 'средний' : 'intermediate',
                category: 'learning_project'
            });
        }

        return this.rankGoalsByPriority(goals);
    }

    /**
     * Generate long-term development plans (3-12 months)
     * @param {Object} analysis - Response analysis results
     * @param {Object} userProfile - User profile
     * @returns {Array} Long-term development recommendations
     */
    generateLongTermDevelopment(analysis, userProfile) {
        const longTermPlans = [];
        const { confidencePatterns, behavioralPatterns } = analysis;

        // Career development (if applicable)
        if (userProfile.goals && userProfile.goals.includes('career_advancement')) {
            const careerText = {
                en: {
                    title: 'Professional Growth Plan',
                    description: 'Develop a comprehensive plan for career advancement'
                },
                ru: {
                    title: 'План профессионального роста',
                    description: 'Разработайте комплексный план для карьерного роста'
                }
            };

            const phases = this.currentLanguage === 'ru' ? [
                {
                    phase: 'Оценка',
                    duration: '1 месяц',
                    activities: ['Аудит навыков', 'Постановка целей', 'Исследование рынка']
                },
                {
                    phase: 'Развитие',
                    duration: '3-6 месяцев',
                    activities: ['Развитие навыков', 'Нетворкинг', 'Работа над проектами']
                },
                {
                    phase: 'Реализация',
                    duration: '2-5 месяцев',
                    activities: ['Подача заявок на возможности', 'Подготовка к собеседованиям', 'Навыки переговоров']
                }
            ] : [
                {
                    phase: 'Assessment',
                    duration: '1 month',
                    activities: ['Skills audit', 'Goal setting', 'Market research']
                },
                {
                    phase: 'Development',
                    duration: '3-6 months',
                    activities: ['Skill building', 'Networking', 'Project work']
                },
                {
                    phase: 'Implementation',
                    duration: '2-5 months',
                    activities: ['Apply for opportunities', 'Interview preparation', 'Negotiation skills']
                }
            ];

            longTermPlans.push({
                type: 'career_development',
                priority: 'high',
                title: this.getLocalizedText(careerText).title,
                description: this.getLocalizedText(careerText).description,
                timeframe: this.currentLanguage === 'ru' ? '6-12 месяцев' : '6-12 months',
                phases: phases,
                difficulty: this.currentLanguage === 'ru' ? 'продвинутый' : 'advanced',
                category: 'career_planning'
            });
        }

        // Personal development
        if (confidencePatterns.averageConfidence < 0.7) {
            const confidenceText = {
                en: {
                    title: 'Confidence Building Journey',
                    description: 'Long-term plan to build self-confidence and self-awareness'
                },
                ru: {
                    title: 'Путь к развитию уверенности',
                    description: 'Долгосрочный план для развития уверенности в себе и самосознания'
                }
            };

            const phases = this.currentLanguage === 'ru' ? [
                {
                    phase: 'Фундамент',
                    duration: '2 месяца',
                    activities: ['Самоанализ', 'Выявление сильных сторон', 'Практика осознанности']
                },
                {
                    phase: 'Рост',
                    duration: '4-6 месяцев',
                    activities: ['Развитие навыков', 'Поиск вызовов', 'Интеграция обратной связи']
                },
                {
                    phase: 'Интеграция',
                    duration: '2-4 месяца',
                    activities: ['Формирование привычек', 'Создание сообщества', 'Менторство']
                }
            ] : [
                {
                    phase: 'Foundation',
                    duration: '2 months',
                    activities: ['Self-reflection', 'Strengths identification', 'Mindfulness practice']
                },
                {
                    phase: 'Growth',
                    duration: '4-6 months',
                    activities: ['Skill development', 'Challenge seeking', 'Feedback integration']
                },
                {
                    phase: 'Integration',
                    duration: '2-4 months',
                    activities: ['Habit formation', 'Community building', 'Mentorship']
                }
            ];

            longTermPlans.push({
                type: 'personal_development',
                priority: 'medium',
                title: this.getLocalizedText(confidenceText).title,
                description: this.getLocalizedText(confidenceText).description,
                timeframe: this.currentLanguage === 'ru' ? '6-12 месяцев' : '6-12 months',
                phases: phases,
                difficulty: this.currentLanguage === 'ru' ? 'средний' : 'intermediate',
                category: 'personal_growth'
            });
        }

        return this.rankPlansByPriority(longTermPlans);
    }

    /**
     * Generate resource recommendations (books, courses, tools)
     * @param {Object} analysis - Response analysis results
     * @param {Object} userProfile - User profile
     * @returns {Array} Resource recommendations
     */
    generateResourceRecommendations(analysis, userProfile) {
        const resources = [];
        const { confidencePatterns, learningStyle } = analysis;

        // MBTI-specific resources
        const mbtiType = userProfile.mbtiType;
        if (mbtiType) {
            const mbtiResources = this.getMBTIResources(mbtiType);
            resources.push(...mbtiResources);
        }

        // Development area resources
        confidencePatterns.confidenceGaps.forEach(gap => {
            const areaResources = this.getDevelopmentAreaResources(gap.developmentArea);
            resources.push(...areaResources);
        });

        // Learning style resources
        const learningResources = this.getLearningStyleResources(learningStyle);
        resources.push(...learningResources);

        return this.rankResourcesByRelevance(resources, analysis);
    }

    /**
     * Generate activity recommendations
     * @param {Object} analysis - Response analysis results
     * @param {Object} userProfile - User profile
     * @returns {Array} Activity recommendations
     */
    generateActivityRecommendations(analysis, userProfile) {
        const activities = [];
        const { learningStyle, stressIndicators } = analysis;

        // Stress management activities
        if (stressIndicators.overallLevel > 0.5) {
            const stressActivityText = {
                en: {
                    title: 'Daily Mindfulness Practice',
                    description: 'Start with 5 minutes of meditation or deep breathing',
                    benefits: ['Reduced stress', 'Improved focus', 'Better emotional regulation']
                },
                ru: {
                    title: 'Ежедневная практика осознанности',
                    description: 'Начните с 5 минут медитации или глубокого дыхания',
                    benefits: ['Снижение стресса', 'Улучшение концентрации', 'Лучшая эмоциональная регуляция']
                }
            };

            activities.push({
                type: 'wellness',
                title: this.getLocalizedText(stressActivityText).title,
                description: this.getLocalizedText(stressActivityText).description,
                frequency: this.currentLanguage === 'ru' ? 'ежедневно' : 'daily',
                duration: this.currentLanguage === 'ru' ? '5-15 минут' : '5-15 minutes',
                difficulty: this.currentLanguage === 'ru' ? 'новичок' : 'beginner',
                benefits: this.getLocalizedText(stressActivityText).benefits
            });
        }

        // Learning activities based on style
        if (learningStyle === 'rapid_learner') {
            const rapidLearningText = {
                en: {
                    title: 'Speed Learning Challenge',
                    description: 'Learn a new skill in a compressed timeframe',
                    benefits: ['Skill acquisition', 'Confidence building', 'Efficiency improvement']
                },
                ru: {
                    title: 'Вызов быстрого обучения',
                    description: 'Изучите новый навык в сжатые сроки',
                    benefits: ['Приобретение навыков', 'Развитие уверенности', 'Улучшение эффективности']
                }
            };

            activities.push({
                type: 'learning',
                title: this.getLocalizedText(rapidLearningText).title,
                description: this.getLocalizedText(rapidLearningText).description,
                frequency: this.currentLanguage === 'ru' ? 'еженедельно' : 'weekly',
                duration: this.currentLanguage === 'ru' ? '2-4 часа' : '2-4 hours',
                difficulty: this.currentLanguage === 'ru' ? 'средний' : 'intermediate',
                benefits: this.getLocalizedText(rapidLearningText).benefits
            });
        }

        return this.rankActivitiesByEngagement(activities);
    }

    /**
     * Generate milestones for development goals
     * @param {Object} area - Development area information
     * @returns {Array} Milestone list
     */
    generateMilestones(area) {
        const baseMilestones = this.currentLanguage === 'ru' ? [
            'Поставьте конкретные, измеримые цели',
            'Создайте ежедневный/еженедельный план действий',
            'Отслеживайте прогресс и празднуйте маленькие победы',
            'Ищите обратную связь и корректируйте подход',
            'Размышляйте об обучении и росте'
        ] : [
            'Set specific, measurable goals',
            'Create a daily/weekly action plan',
            'Track progress and celebrate small wins',
            'Seek feedback and adjust approach',
            'Reflect on learnings and growth'
        ];

        // Add area-specific milestones
        const areaSpecific = this.getAreaSpecificMilestones(area.area);
        return [...baseMilestones, ...areaSpecific];
    }

    /**
     * Get MBTI-specific resources
     * @param {String} mbtiType - User's MBTI type
     * @returns {Array} MBTI-specific resources
     */
    getMBTIResources(mbtiType) {
        const resourceMap = {
            'INTJ': [
                { type: 'book', title: 'Strategic Thinking for INTJs', author: 'Various', rating: 4.5 },
                { type: 'course', title: 'Emotional Intelligence for Thinkers', platform: 'Coursera', rating: 4.3 }
            ],
            'ENFP': [
                { type: 'book', title: 'Focus and Follow-Through', author: 'Various', rating: 4.4 },
                { type: 'course', title: 'Project Management for Creative Types', platform: 'Udemy', rating: 4.2 }
            ]
        };

        return resourceMap[mbtiType] || this.getGeneralMBTIResources();
    }

    /**
     * Get development area specific resources
     * @param {String} area - Development area
     * @returns {Array} Area-specific resources
     */
    getDevelopmentAreaResources(area) {
        const resourceMap = {
            'Social Skills': [
                { type: 'book', title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', rating: 4.6 },
                { type: 'course', title: 'Communication Skills', platform: 'LinkedIn Learning', rating: 4.4 }
            ],
            'Decision Making': [
                { type: 'book', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', rating: 4.5 },
                { type: 'course', title: 'Critical Thinking', platform: 'edX', rating: 4.3 }
            ]
        };

        return resourceMap[area] || [];
    }

    /**
     * Get learning style specific resources
     * @param {String} learningStyle - User's learning style
     * @returns {Array} Learning style resources
     */
    getLearningStyleResources(learningStyle) {
        const resourceMap = {
            'rapid_learner': [
                { type: 'tool', title: 'Spaced Repetition Apps', description: 'Anki, Memrise for fast learning', rating: 4.4 },
                { type: 'course', title: 'Learning How to Learn', platform: 'Coursera', rating: 4.7 }
            ],
            'deliberate_learner': [
                { type: 'tool', title: 'Mind Mapping Software', description: 'XMind, MindMeister for deep thinking', rating: 4.3 },
                { type: 'course', title: 'Deep Work', platform: 'Skillshare', rating: 4.5 }
            ]
        };

        return resourceMap[learningStyle] || [];
    }

    /**
     * Get area-specific milestones
     * @param {String} area - Development area
     * @returns {Array} Area-specific milestones
     */
    getAreaSpecificMilestones(area) {
        const milestoneMap = this.currentLanguage === 'ru' ? {
            'Social Skills': [
                'Практикуйте активное слушание в 3 разговорах',
                'Инициируйте разговор с новым человеком',
                'Дайте искренние комплименты 5 людям'
            ],
            'Decision Making': [
                'Используйте рамки принятия решений для 3 выборов',
                'Документируйте ваш процесс рассуждения',
                'Просмотрите прошлые решения и учитесь на них'
            ]
        } : {
            'Social Skills': [
                'Practice active listening in 3 conversations',
                'Initiate a conversation with someone new',
                'Give genuine compliments to 5 people'
            ],
            'Decision Making': [
                'Use a decision-making framework for 3 choices',
                'Document your reasoning process',
                'Review past decisions and learn from them'
            ]
        };

        return milestoneMap[area] || [];
    }

    /**
     * Rank recommendations by priority and relevance
     * @param {Object} recommendations - All recommendation types
     * @returns {Object} Ranked recommendations
     */
    rankRecommendations(recommendations) {
        const ranked = {};

        Object.keys(recommendations).forEach(type => {
            if (Array.isArray(recommendations[type])) {
                ranked[type] = recommendations[type].sort((a, b) => {
                    const priorityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'very_low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
            }
        });

        return ranked;
    }

    /**
     * Rank actions by priority
     * @param {Array} actions - Action recommendations
     * @returns {Array} Ranked actions
     */
    rankActionsByPriority(actions) {
        const priorityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'very_low': 1 };
        return actions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    /**
     * Rank goals by priority
     * @param {Array} goals - Goal recommendations
     * @returns {Array} Ranked goals
     */
    rankGoalsByPriority(goals) {
        const priorityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'very_low': 1 };
        return goals.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    /**
     * Rank plans by priority
     * @param {Array} plans - Plan recommendations
     * @returns {Array} Ranked plans
     */
    rankPlansByPriority(plans) {
        const priorityOrder = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'very_low': 1 };
        return plans.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    /**
     * Rank resources by relevance
     * @param {Array} resources - Resource recommendations
     * @param {Object} analysis - User analysis
     * @returns {Array} Ranked resources
     */
    rankResourcesByRelevance(resources, analysis) {
        return resources.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    /**
     * Rank activities by engagement potential
     * @param {Array} activities - Activity recommendations
     * @returns {Array} Ranked activities
     */
    rankActivitiesByEngagement(activities) {
        return activities.sort((a, b) => {
            // Prioritize by frequency (daily > weekly > monthly)
            const frequencyOrder = { 'daily': 3, 'weekly': 2, 'monthly': 1 };
            return frequencyOrder[b.frequency] - frequencyOrder[a.frequency];
        });
    }

    /**
     * Generate a summary of all recommendations
     * @param {Object} rankedRecommendations - Ranked recommendations
     * @returns {Object} Recommendation summary
     */
    generateRecommendationSummary(rankedRecommendations) {
        const summary = {
            totalRecommendations: 0,
            priorityBreakdown: {},
            categoryBreakdown: {},
            estimatedTime: 0,
            nextSteps: []
        };

        Object.values(rankedRecommendations).forEach(recommendationList => {
            if (Array.isArray(recommendationList)) {
                summary.totalRecommendations += recommendationList.length;
                
                recommendationList.forEach(rec => {
                    // Count priorities
                    summary.priorityBreakdown[rec.priority] = (summary.priorityBreakdown[rec.priority] || 0) + 1;
                    
                    // Count categories
                    summary.categoryBreakdown[rec.category] = (summary.categoryBreakdown[rec.category] || 0) + 1;
                });
            }
        });

        // Generate next steps
        summary.nextSteps = this.generateNextSteps(rankedRecommendations);

        return summary;
    }

    /**
     * Generate actionable next steps
     * @param {Object} rankedRecommendations - Ranked recommendations
     * @returns {Array} Next steps
     */
    generateNextSteps(rankedRecommendations) {
        const nextSteps = [];

        // Add immediate actions
        if (rankedRecommendations.immediate && rankedRecommendations.immediate.length > 0) {
            const immediateText = {
                en: {
                    title: 'Start with these quick wins',
                    description: 'Complete 1-2 immediate actions to build momentum'
                },
                ru: {
                    title: 'Начните с этих быстрых побед',
                    description: 'Выполните 1-2 немедленных действия для создания импульса'
                }
            };

            nextSteps.push({
                type: 'immediate',
                title: this.getLocalizedText(immediateText).title,
                description: this.getLocalizedText(immediateText).description,
                actions: rankedRecommendations.immediate.slice(0, 2)
            });
        }

        // Add short-term goals
        if (rankedRecommendations.shortTerm && rankedRecommendations.shortTerm.length > 0) {
            const shortTermText = {
                en: {
                    title: 'Set your first development goal',
                    description: 'Choose one area to focus on for the next 2-4 weeks'
                },
                ru: {
                    title: 'Поставьте вашу первую цель развития',
                    description: 'Выберите одну область для фокусировки на следующие 2-4 недели'
                }
            };

            nextSteps.push({
                type: 'short_term',
                title: this.getLocalizedText(shortTermText).title,
                description: this.getLocalizedText(shortTermText).description,
                actions: rankedRecommendations.shortTerm.slice(0, 1)
            });
        }

        return nextSteps;
    }

    /**
     * Set content manager for enhanced recommendations
     * @param {ContentManager} contentManager - Content management instance
     */
    setContentManager(contentManager) {
        this.contentManager = contentManager;
    }

    /**
     * Set response analyzer for user response analysis
     * @param {ResponseAnalyzer} responseAnalyzer - Response analysis instance
     */
    setResponseAnalyzer(responseAnalyzer) {
        this.responseAnalyzer = responseAnalyzer;
    }

    /**
     * Get engine statistics for monitoring
     * @returns {Object} Engine statistics
     */
    getStats() {
        return {
            rulesCount: Object.keys(this.recommendationRules).length,
            analyzerStats: this.responseAnalyzer ? this.responseAnalyzer.getCacheStats() : null,
            timestamp: Date.now()
        };
    }

    // Helper methods for Russian localization
    getRussianDevelopmentArea(area) {
        const mapping = {
            'Social Skills': 'социальные навыки',
            'Information Processing': 'обработка информации',
            'Decision Making': 'принятие решений',
            'Organization & Planning': 'организация и планирование',
            'Personal Development': 'личное развитие'
        };
        return mapping[area] || area;
    }

    getRussianDescription(description) {
        const mapping = {
            'Build confidence in Social Skills': 'Развивайте уверенность в социальных навыках',
            'Build confidence in Information Processing': 'Развивайте уверенность в обработке информации',
            'Build confidence in Decision Making': 'Развивайте уверенность в принятии решений',
            'Build confidence in Organization & Planning': 'Развивайте уверенность в организации и планировании'
        };
        return mapping[description] || description;
    }

    getRussianDifficulty(difficulty) {
        const mapping = {
            'beginner': 'новичок',
            'intermediate': 'средний',
            'advanced': 'продвинутый',
            'very_easy': 'очень легко',
            'easy': 'легко'
        };
        return mapping[difficulty] || difficulty;
    }

    getGeneralMBTIResources() {
        return [
            { type: 'book', title: 'Type Talk', author: 'Otto Kroeger', rating: 4.4 },
            { type: 'course', title: 'MBTI Fundamentals', platform: 'Myers-Briggs', rating: 4.6 }
        ];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationEngine;
} else if (typeof window !== 'undefined') {
    window.RecommendationEngine = RecommendationEngine;
}
