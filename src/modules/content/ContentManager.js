/**
 * ContentManager - Manages recommendation content, resources, and materials
 * Provides structured access to books, courses, activities, and development resources
 */
class ContentManager {
    constructor() {
        this.contentDatabase = this.initializeContentDatabase();
        this.contentCache = new Map();
        this.userPreferences = {};
        this.currentLanguage = 'en'; // Default language
    }

    /**
     * Set the current language for content
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 Content language set to: ${language}`);
    }

    /**
     * Get localized content based on current language
     * @param {Object} content - Content object with language variants
     * @returns {Object} Localized content
     */
    getLocalizedContent(content) {
        if (this.currentLanguage === 'ru' && content.ru) {
            return content.ru;
        }
        return content.en || content;
    }

    /**
     * Initialize the content database with structured resources
     * @returns {Object} Content database structure
     */
    initializeContentDatabase() {
        return {
            books: this.initializeBooks(),
            courses: this.initializeCourses(),
            activities: this.initializeActivities(),
            tools: this.initializeTools(),
            articles: this.initializeArticles(),
            podcasts: this.initializePodcasts()
        };
    }

    /**
     * Initialize book recommendations database with Russian localization
     * @returns {Object} Book database organized by categories
     */
    initializeBooks() {
        return {
            personality_development: {
                'self_awareness': [
                    {
                        id: 'book_001',
                        en: {
                            title: 'The Road Less Traveled',
                            author: 'M. Scott Peck',
                            description: 'A guide to personal growth and spiritual development'
                        },
                        ru: {
                            title: 'Дорога, по которой не ходят',
                            author: 'М. Скотт Пек',
                            description: 'Руководство по личностному росту и духовному развитию'
                        },
                        rating: 4.6,
                        difficulty: 'intermediate',
                        estimatedTime: '2-3 weeks',
                        tags: ['self-awareness', 'personal-growth', 'spirituality'],
                        mbti_relevance: ['INFJ', 'INFP', 'ENFJ', 'ENFP']
                    },
                    {
                        id: 'book_002',
                        en: {
                            title: 'Mindset: The New Psychology of Success',
                            author: 'Carol S. Dweck',
                            description: 'Learn how to develop a growth mindset for success'
                        },
                        ru: {
                            title: 'Мышление: Новая психология успеха',
                            author: 'Кэрол С. Двек',
                            description: 'Узнайте, как развить установку на рост для достижения успеха'
                        },
                        rating: 4.5,
                        difficulty: 'beginner',
                        estimatedTime: '1-2 weeks',
                        tags: ['mindset', 'growth', 'psychology', 'success'],
                        mbti_relevance: ['all']
                    }
                ],
                'communication': [
                    {
                        id: 'book_003',
                        en: {
                            title: 'How to Win Friends and Influence People',
                            author: 'Dale Carnegie',
                            description: 'Classic guide to effective communication and relationship building'
                        },
                        ru: {
                            title: 'Как завоевывать друзей и оказывать влияние на людей',
                            author: 'Дейл Карнеги',
                            description: 'Классическое руководство по эффективному общению и построению отношений'
                        },
                        rating: 4.6,
                        difficulty: 'beginner',
                        estimatedTime: '2-3 weeks',
                        tags: ['communication', 'relationships', 'social-skills'],
                        mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP']
                    }
                ],
                'decision_making': [
                    {
                        id: 'book_004',
                        en: {
                            title: 'Thinking, Fast and Slow',
                            author: 'Daniel Kahneman',
                            description: 'Understanding cognitive biases and improving decision making'
                        },
                        ru: {
                            title: 'Думай медленно, решай быстро',
                            author: 'Даниэль Канеман',
                            description: 'Понимание когнитивных искажений и улучшение принятия решений'
                        },
                        rating: 4.5,
                        difficulty: 'advanced',
                        estimatedTime: '3-4 weeks',
                        tags: ['decision-making', 'psychology', 'cognitive-biases'],
                        mbti_relevance: ['INTJ', 'INTP', 'ENTJ', 'ENTP']
                    }
                ]
            },
            career_development: {
                'leadership': [
                    {
                        id: 'book_005',
                        en: {
                            title: 'The 7 Habits of Highly Effective People',
                            author: 'Stephen R. Covey',
                            description: 'Comprehensive guide to personal and professional effectiveness'
                        },
                        ru: {
                            title: '7 навыков высокоэффективных людей',
                            author: 'Стивен Р. Кови',
                            description: 'Комплексное руководство по личной и профессиональной эффективности'
                        },
                        rating: 4.7,
                        difficulty: 'intermediate',
                        estimatedTime: '3-4 weeks',
                        tags: ['leadership', 'effectiveness', 'habits', 'personal-development'],
                        mbti_relevance: ['all']
                    }
                ],
                'productivity': [
                    {
                        id: 'book_006',
                        en: {
                            title: 'Deep Work',
                            author: 'Cal Newport',
                            description: 'Rules for focused success in a distracted world'
                        },
                        ru: {
                            title: 'Глубокая работа',
                            author: 'Кэл Ньюпорт',
                            description: 'Правила сфокусированного успеха в мире отвлечений'
                        },
                        rating: 4.4,
                        difficulty: 'intermediate',
                        estimatedTime: '2-3 weeks',
                        tags: ['productivity', 'focus', 'work-habits'],
                        mbti_relevance: ['INTJ', 'INTP', 'ISTJ', 'ISTP']
                    }
                ]
            },
            stress_management: {
                'mindfulness': [
                    {
                        id: 'book_007',
                        en: {
                            title: 'The Power of Now',
                            author: 'Eckhart Tolle',
                            description: 'Guide to spiritual enlightenment and living in the present'
                        },
                        ru: {
                            title: 'Сила настоящего',
                            author: 'Экхарт Толле',
                            description: 'Руководство по духовному просветлению и жизни в настоящем'
                        },
                        rating: 4.4,
                        difficulty: 'intermediate',
                        estimatedTime: '2-3 weeks',
                        tags: ['mindfulness', 'spirituality', 'present-moment'],
                        mbti_relevance: ['INFJ', 'INFP', 'ENFJ', 'ENFP']
                    }
                ],
                'emotional_regulation': [
                    {
                        id: 'book_008',
                        en: {
                            title: 'Emotional Intelligence',
                            author: 'Daniel Goleman',
                            description: 'Why it can matter more than IQ'
                        },
                        ru: {
                            title: 'Эмоциональный интеллект',
                            author: 'Даниэль Гоулман',
                            description: 'Почему он может значить больше, чем IQ'
                        },
                        rating: 4.5,
                        difficulty: 'intermediate',
                        estimatedTime: '2-3 weeks',
                        tags: ['emotional-intelligence', 'self-awareness', 'relationships'],
                        mbti_relevance: ['all']
                    }
                ]
            }
        };
    }

    /**
     * Initialize course recommendations database with Russian localization
     * @returns {Object} Course database organized by platforms and categories
     */
    initializeCourses() {
        return {
            coursera: {
                'personal_development': [
                    {
                        id: 'course_001',
                        en: {
                            title: 'Learning How to Learn',
                            instructor: 'Barbara Oakley',
                            description: 'Powerful mental tools to help you master tough subjects'
                        },
                        ru: {
                            title: 'Учимся учиться',
                            instructor: 'Барбара Оукли',
                            description: 'Мощные ментальные инструменты для освоения сложных предметов'
                        },
                        rating: 4.7,
                        duration: '4 weeks',
                        difficulty: 'beginner',
                        cost: 'Free (audit)',
                        tags: ['learning', 'study-skills', 'cognitive-science'],
                        mbti_relevance: ['all']
                    }
                ],
                'communication': [
                    {
                        id: 'course_002',
                        en: {
                            title: 'Communication in the 21st Century Workplace',
                            instructor: 'Various',
                            description: 'Develop essential communication skills for modern work'
                        },
                        ru: {
                            title: 'Коммуникация на рабочем месте XXI века',
                            instructor: 'Различные',
                            description: 'Развитие необходимых коммуникативных навыков для современной работы'
                        },
                        rating: 4.4,
                        duration: '6 weeks',
                        difficulty: 'intermediate',
                        cost: '$49',
                        tags: ['communication', 'workplace', 'professional-skills'],
                        mbti_relevance: ['all']
                    }
                ]
            },
            udemy: {
                'productivity': [
                    {
                        id: 'course_003',
                        en: {
                            title: 'Time Management Mastery',
                            instructor: 'Various',
                            description: 'Learn to manage time effectively and increase productivity'
                        },
                        ru: {
                            title: 'Мастерство управления временем',
                            instructor: 'Различные',
                            description: 'Научитесь эффективно управлять временем и повышать продуктивность'
                        },
                        rating: 4.3,
                        duration: '3 hours',
                        difficulty: 'beginner',
                        cost: '$19.99',
                        tags: ['time-management', 'productivity', 'organization'],
                        mbti_relevance: ['all']
                    }
                ],
                'stress_management': [
                    {
                        id: 'course_004',
                        en: {
                            title: 'Stress Management: 40+ techniques for your wellbeing',
                            instructor: 'Various',
                            description: 'Comprehensive stress management techniques for daily life'
                        },
                        ru: {
                            title: 'Управление стрессом: 40+ техник для вашего благополучия',
                            instructor: 'Различные',
                            description: 'Комплексные техники управления стрессом для повседневной жизни'
                        },
                        rating: 4.5,
                        duration: '2 hours',
                        difficulty: 'beginner',
                        cost: '$24.99',
                        tags: ['stress-management', 'wellness', 'mental-health'],
                        mbti_relevance: ['all']
                    }
                ]
            }
        };
    }

    /**
     * Initialize activity recommendations database with Russian localization
     * @returns {Object} Activity database organized by categories
     */
    initializeActivities() {
        return {
            daily_practices: [
                {
                    id: 'activity_001',
                    en: {
                        title: 'Morning Reflection',
                        description: 'Start each day with 10 minutes of self-reflection'
                    },
                    ru: {
                        title: 'Утренняя рефлексия',
                        description: 'Начинайте каждый день с 10 минут самоанализа'
                    },
                    duration: '10 minutes',
                    frequency: 'daily',
                    difficulty: 'beginner',
                    benefits: ['Increased self-awareness', 'Better mood', 'Clearer thinking'],
                    tags: ['mindfulness', 'self-reflection', 'morning-routine'],
                    mbti_relevance: ['INFJ', 'INFP', 'INTJ', 'INTP']
                },
                {
                    id: 'activity_002',
                    en: {
                        title: 'Gratitude Journal',
                        description: 'Write down 3 things you\'re grateful for each day'
                    },
                    ru: {
                        title: 'Дневник благодарности',
                        description: 'Записывайте 3 вещи, за которые вы благодарны каждый день'
                    },
                    duration: '5 minutes',
                    frequency: 'daily',
                    difficulty: 'beginner',
                    benefits: ['Improved mood', 'Better perspective', 'Increased happiness'],
                    tags: ['gratitude', 'journaling', 'positive-psychology'],
                    mbti_relevance: ['all']
                }
            ],
            weekly_challenges: [
                {
                    id: 'activity_003',
                    en: {
                        title: 'Social Connection Challenge',
                        description: 'Reach out to one person you haven\'t talked to in a while'
                    },
                    ru: {
                        title: 'Вызов социальных связей',
                        description: 'Свяжитесь с одним человеком, с которым давно не общались'
                    },
                    duration: '30 minutes',
                    frequency: 'weekly',
                    difficulty: 'intermediate',
                    benefits: ['Stronger relationships', 'Improved communication', 'Social confidence'],
                    tags: ['social-skills', 'relationships', 'communication'],
                    mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP']
                }
            ]
        };
    }

    /**
     * Initialize tools and applications database with Russian localization
     * @returns {Object} Tools database organized by categories
     */
    initializeTools() {
        return {
            productivity: [
                {
                    id: 'tool_001',
                    name: 'Notion',
                    category: 'productivity',
                    en: {
                        description: 'All-in-one workspace for notes, projects, and collaboration'
                    },
                    ru: {
                        description: 'Универсальное рабочее пространство для заметок, проектов и совместной работы'
                    },
                    rating: 4.6,
                    cost: 'Free tier available',
                    platforms: ['Web', 'iOS', 'Android', 'Desktop'],
                    tags: ['productivity', 'organization', 'collaboration'],
                    mbti_relevance: ['INTJ', 'INTP', 'ISTJ', 'ISTP']
                }
            ],
            wellness: [
                {
                    id: 'tool_005',
                    name: 'Headspace',
                    category: 'meditation',
                    en: {
                        description: 'Guided meditation and mindfulness app'
                    },
                    ru: {
                        description: 'Приложение для управляемой медитации и осознанности'
                    },
                    rating: 4.4,
                    cost: 'Subscription',
                    platforms: ['iOS', 'Android', 'Web'],
                    tags: ['meditation', 'mindfulness', 'stress-relief'],
                    mbti_relevance: ['all']
                }
            ]
        };
    }

    /**
     * Initialize articles and blog posts database with Russian localization
     * @returns {Object} Articles database organized by sources and topics
     */
    initializeArticles() {
        return {
            psychology_today: [
                {
                    id: 'article_001',
                    en: {
                        title: 'How to Build Self-Confidence in 5 Simple Steps',
                        author: 'Various',
                        description: 'Practical steps to boost your self-confidence'
                    },
                    ru: {
                        title: 'Как развить уверенность в себе за 5 простых шагов',
                        author: 'Различные',
                        description: 'Практические шаги для повышения уверенности в себе'
                    },
                    rating: 4.3,
                    readTime: '5 minutes',
                    tags: ['confidence', 'self-improvement', 'psychology'],
                    mbti_relevance: ['all']
                }
            ]
        };
    }

    /**
     * Initialize podcast recommendations database with Russian localization
     * @returns {Object} Podcasts database organized by categories
     */
    initializePodcasts() {
        return {
            personal_development: [
                {
                    id: 'podcast_001',
                    en: {
                        title: 'The Tim Ferriss Show',
                        host: 'Tim Ferriss',
                        description: 'Interviews with world-class performers to extract tools and tactics'
                    },
                    ru: {
                        title: 'Шоу Тима Феррисса',
                        host: 'Тим Феррисс',
                        description: 'Интервью с мировыми исполнителями для извлечения инструментов и тактик'
                    },
                    rating: 4.7,
                    episodeLength: '60-90 minutes',
                    frequency: 'weekly',
                    tags: ['productivity', 'performance', 'interviews'],
                    mbti_relevance: ['all']
                }
            ]
        };
    }

    /**
     * Get content recommendations based on user profile and preferences
     * @param {Object} userProfile - User profile with preferences and needs
     * @param {Array} categories - Content categories to search
     * @param {Number} limit - Maximum number of recommendations
     * @returns {Object} Filtered content recommendations
     */
    getContentRecommendations(userProfile, categories = [], limit = 10) {
        const recommendations = {
            books: [],
            courses: [],
            activities: [],
            tools: [],
            articles: [],
            podcasts: []
        };

        // Filter content based on user profile
        Object.keys(this.contentDatabase).forEach(contentType => {
            if (categories.length === 0 || categories.includes(contentType)) {
                const filteredContent = this.filterContentByProfile(
                    this.contentDatabase[contentType],
                    userProfile
                );
                recommendations[contentType] = filteredContent.slice(0, limit);
            }
        });

        return recommendations;
    }

    /**
     * Filter content based on user profile and preferences
     * @param {Array|Object} content - Content to filter
     * @param {Object} userProfile - User profile for filtering
     * @returns {Array} Filtered content
     */
    filterContentByProfile(content, userProfile) {
        if (Array.isArray(content)) {
            return content.filter(item => this.matchesUserProfile(item, userProfile));
        } else if (typeof content === 'object') {
            const filtered = [];
            Object.values(content).forEach(categoryContent => {
                if (Array.isArray(categoryContent)) {
                    const categoryFiltered = categoryContent.filter(item => 
                        this.matchesUserProfile(item, userProfile)
                    );
                    filtered.push(...categoryFiltered);
                }
            });
            return filtered;
        }
        return [];
    }

    /**
     * Check if content item matches user profile
     * @param {Object} item - Content item to check
     * @param {Object} userProfile - User profile for matching
     * @returns {Boolean} Whether item matches user profile
     */
    matchesUserProfile(item, userProfile) {
        // Check MBTI relevance
        if (item.mbti_relevance && userProfile.mbtiType) {
            if (!item.mbti_relevance.includes('all') && 
                !item.mbti_relevance.includes(userProfile.mbtiType)) {
                return false;
            }
        }

        // Check difficulty level
        if (item.difficulty && userProfile.preferredDifficulty) {
            if (userProfile.preferredDifficulty === 'beginner' && 
                item.difficulty === 'advanced') {
                return false;
            }
        }

        // Check time constraints
        if (item.estimatedTime && userProfile.timeConstraints) {
            const estimatedMinutes = this.parseTimeToMinutes(item.estimatedTime);
            if (estimatedMinutes > userProfile.timeConstraints.maxTimePerSession) {
                return false;
            }
        }

        return true;
    }

    /**
     * Parse time string to minutes
     * @param {String} timeString - Time string (e.g., "2-3 weeks", "1 hour")
     * @returns {Number} Time in minutes
     */
    parseTimeToMinutes(timeString) {
        if (timeString.includes('minutes')) {
            return parseInt(timeString.match(/(\d+)/)[1]);
        } else if (timeString.includes('hour')) {
            return parseInt(timeString.match(/(\d+)/)[1]) * 60;
        } else if (timeString.includes('week')) {
            return parseInt(timeString.match(/(\d+)/)[1]) * 7 * 24 * 60; // Convert to minutes
        }
        return 60; // Default to 1 hour
    }

    /**
     * Search content by keywords and tags
     * @param {String} query - Search query
     * @param {Array} categories - Content categories to search
     * @returns {Object} Search results
     */
    searchContent(query, categories = []) {
        const results = {
            books: [],
            courses: [],
            activities: [],
            tools: [],
            articles: [],
            podcasts: []
        };

        const searchTerms = query.toLowerCase().split(' ');

        Object.keys(this.contentDatabase).forEach(contentType => {
            if (categories.length === 0 || categories.includes(contentType)) {
                const searchResults = this.searchInContent(
                    this.contentDatabase[contentType],
                    searchTerms
                );
                results[contentType] = searchResults;
            }
        });

        return results;
    }

    /**
     * Search within specific content type
     * @param {Array|Object} content - Content to search
     * @param {Array} searchTerms - Search terms
     * @returns {Array} Search results
     */
    searchInContent(content, searchTerms) {
        const results = [];
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (this.itemMatchesSearch(item, searchTerms)) {
                    results.push(item);
                }
            });
        } else if (typeof content === 'object') {
            Object.values(content).forEach(categoryContent => {
                if (Array.isArray(categoryContent)) {
                    categoryContent.forEach(item => {
                        if (this.itemMatchesSearch(item, searchTerms)) {
                            results.push(item);
                        }
                    });
                }
            });
        }

        return results;
    }

    /**
     * Check if content item matches search terms
     * @param {Object} item - Content item to check
     * @param {Array} searchTerms - Search terms
     * @returns {Boolean} Whether item matches search
     */
    itemMatchesSearch(item, searchTerms) {
        const localizedItem = this.getLocalizedContent(item);
        const searchableText = [
            localizedItem.title || '',
            localizedItem.description || '',
            localizedItem.author || '',
            localizedItem.instructor || '',
            localizedItem.host || '',
            ...(item.tags || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
    }

    /**
     * Get content by ID
     * @param {String} contentId - Content ID to retrieve
     * @returns {Object|null} Content item or null if not found
     */
    getContentById(contentId) {
        // Search through all content types
        const allContent = this.getAllContent();
        return allContent.find(item => item.id === contentId) || null;
    }

    /**
     * Get all content for comprehensive search
     * @returns {Array} All content items
     */
    getAllContent() {
        const allContent = [];
        
        Object.values(this.contentDatabase).forEach(contentType => {
            if (Array.isArray(contentType)) {
                allContent.push(...contentType);
            } else if (typeof contentType === 'object') {
                Object.values(contentType).forEach(categoryContent => {
                    if (Array.isArray(categoryContent)) {
                        allContent.push(...categoryContent);
                    }
                });
            }
        });

        return allContent;
    }

    /**
     * Update user preferences for better content filtering
     * @param {Object} preferences - User preferences
     */
    updateUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };
    }

    /**
     * Get content statistics for monitoring
     * @returns {Object} Content statistics
     */
    getContentStats() {
        const stats = {
            totalItems: 0,
            byCategory: {},
            byDifficulty: {},
            byMBTI: {},
            byLanguage: {
                en: 0,
                ru: 0
            }
        };

        const allContent = this.getAllContent();
        stats.totalItems = allContent.length;

        allContent.forEach(item => {
            // Count by category
            const category = item.category || 'uncategorized';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Count by difficulty
            const difficulty = item.difficulty || 'unknown';
            stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;

            // Count by MBTI relevance
            if (item.mbti_relevance) {
                item.mbti_relevance.forEach(type => {
                    stats.byMBTI[type] = (stats.byMBTI[type] || 0) + 1;
                });
            }

            // Count by language availability
            if (item.ru) stats.byLanguage.ru++;
            if (item.en) stats.byLanguage.en++;
        });

        return stats;
    }

    /**
     * Clear content cache to free memory
     */
    clearCache() {
        this.contentCache.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
} else if (typeof window !== 'undefined') {
    window.ContentManager = ContentManager;
}
