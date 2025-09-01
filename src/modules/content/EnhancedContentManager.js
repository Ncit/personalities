/**
 * EnhancedContentManager - Expanded content database with advanced features
 * Part of Phase 2B: Enhanced Recommendations
 */
class EnhancedContentManager {
    constructor() {
        this.contentDatabase = this.initializeEnhancedContentDatabase();
        this.contentCache = new Map();
        this.userPreferences = {};
        this.currentLanguage = 'en';
        this.ratings = new Map();
        this.reviews = new Map();
        this.categories = new Set();
        this.tags = new Set();
    }

    /**
     * Set the current language for content
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 Enhanced content language set to: ${language}`);
    }

    /**
     * Initialize enhanced content database with expanded resources
     * @returns {Object} Enhanced content database
     */
    initializeEnhancedContentDatabase() {
        return {
            books: this.initializeEnhancedBooks(),
            courses: this.initializeEnhancedCourses(),
            activities: this.initializeEnhancedActivities(),
            tools: this.initializeEnhancedTools(),
            articles: this.initializeEnhancedArticles(),
            podcasts: this.initializeEnhancedPodcasts(),
            videos: this.initializeEnhancedVideos(),
            apps: this.initializeEnhancedApps(),
            communities: this.initializeEnhancedCommunities()
        };
    }

    /**
     * Initialize enhanced book recommendations database
     * @returns {Object} Enhanced book database
     */
    initializeEnhancedBooks() {
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
                        mbti_relevance: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
                        category: 'personality_development',
                        subcategory: 'self_awareness',
                        year: 1978,
                        pages: 315,
                        isbn: '978-0-684-84337-1',
                        price: '$15.99',
                        availability: 'amazon, local_library'
                    },
                    {
                        id: 'book_002',
                        en: {
                            title: 'Emotional Intelligence',
                            author: 'Daniel Goleman',
                            description: 'Why emotional intelligence matters more than IQ'
                        },
                        ru: {
                            title: 'Эмоциональный интеллект',
                            author: 'Дэниел Гоулман',
                            description: 'Почему эмоциональный интеллект важнее IQ'
                        },
                        rating: 4.4,
                        difficulty: 'intermediate',
                        estimatedTime: '3-4 weeks',
                        tags: ['emotional-intelligence', 'psychology', 'leadership'],
                        mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                        category: 'personality_development',
                        subcategory: 'self_awareness',
                        year: 1995,
                        pages: 352,
                        isbn: '978-0-553-09503-6',
                        price: '$16.99',
                        availability: 'amazon, local_library'
                    }
                ],
                'communication': [
                    {
                        id: 'book_003',
                        en: {
                            title: 'How to Win Friends and Influence People',
                            author: 'Dale Carnegie',
                            description: 'Timeless principles for effective communication and relationship building'
                        },
                        ru: {
                            title: 'Как завоевывать друзей и оказывать влияние на людей',
                            author: 'Дейл Карнеги',
                            description: 'Временные принципы эффективного общения и построения отношений'
                        },
                        rating: 4.5,
                        difficulty: 'beginner',
                        estimatedTime: '2-3 weeks',
                        tags: ['communication', 'relationships', 'influence'],
                        mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                        category: 'personality_development',
                        subcategory: 'communication',
                        year: 1936,
                        pages: 288,
                        isbn: '978-0-671-02703-5',
                        price: '$14.99',
                        availability: 'amazon, local_library'
                    }
                ]
            },
            productivity: {
                'time_management': [
                    {
                        id: 'book_004',
                        en: {
                            title: 'Getting Things Done',
                            author: 'David Allen',
                            description: 'The art of stress-free productivity'
                        },
                        ru: {
                            title: 'Как привести дела в порядок',
                            author: 'Дэвид Аллен',
                            description: 'Искусство продуктивности без стресса'
                        },
                        rating: 4.3,
                        difficulty: 'intermediate',
                        estimatedTime: '3-4 weeks',
                        tags: ['productivity', 'time-management', 'organization'],
                        mbti_relevance: ['INTJ', 'ENTJ', 'ISTJ', 'ESTJ'],
                        category: 'productivity',
                        subcategory: 'time_management',
                        year: 2001,
                        pages: 267,
                        isbn: '978-0-14-200028-1',
                        price: '$16.00',
                        availability: 'amazon, local_library'
                    }
                ]
            },
            leadership: {
                'team_management': [
                    {
                        id: 'book_005',
                        en: {
                            title: 'The 7 Habits of Highly Effective People',
                            author: 'Stephen Covey',
                            description: 'Powerful lessons in personal change'
                        },
                        ru: {
                            title: '7 навыков высокоэффективных людей',
                            author: 'Стивен Кови',
                            description: 'Мощные уроки личностных изменений'
                        },
                        rating: 4.6,
                        difficulty: 'intermediate',
                        estimatedTime: '4-5 weeks',
                        tags: ['leadership', 'personal-development', 'habits'],
                        mbti_relevance: ['ENTJ', 'ENFJ', 'INTJ', 'INFJ'],
                        category: 'leadership',
                        subcategory: 'team_management',
                        year: 1989,
                        pages: 432,
                        isbn: '978-0-7432-6951-3',
                        price: '$18.99',
                        availability: 'amazon, local_library'
                    }
                ]
            }
        };
    }

    /**
     * Initialize enhanced course recommendations database
     * @returns {Object} Enhanced course database
     */
    initializeEnhancedCourses() {
        return {
            online_platforms: {
                'coursera': [
                    {
                        id: 'course_001',
                        en: {
                            title: 'Learning How to Learn',
                            instructor: 'Dr. Barbara Oakley',
                            description: 'Powerful mental tools to help you master tough subjects'
                        },
                        ru: {
                            title: 'Как научиться учиться',
                            instructor: 'Доктор Барбара Окли',
                            description: 'Мощные ментальные инструменты для освоения сложных предметов'
                        },
                        rating: 4.8,
                        difficulty: 'beginner',
                        estimatedTime: '4 weeks',
                        tags: ['learning', 'study-skills', 'memory'],
                        mbti_relevance: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
                        category: 'online_platforms',
                        subcategory: 'coursera',
                        platform: 'Coursera',
                        duration: '4 weeks',
                        price: '$49/month',
                        certificate: true,
                        language: 'English',
                        startDate: 'Self-paced'
                    }
                ],
                'udemy': [
                    {
                        id: 'course_002',
                        en: {
                            title: 'Emotional Intelligence Masterclass',
                            instructor: 'Dr. Travis Bradberry',
                            description: 'Develop your emotional intelligence for better relationships and success'
                        },
                        ru: {
                            title: 'Мастер-класс по эмоциональному интеллекту',
                            instructor: 'Доктор Трэвис Брэдберри',
                            description: 'Развивайте свой эмоциональный интеллект для лучших отношений и успеха'
                        },
                        rating: 4.5,
                        difficulty: 'intermediate',
                        estimatedTime: '6 hours',
                        tags: ['emotional-intelligence', 'relationships', 'leadership'],
                        mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                        category: 'online_platforms',
                        subcategory: 'udemy',
                        platform: 'Udemy',
                        duration: '6 hours',
                        price: '$89.99',
                        certificate: true,
                        language: 'English',
                        startDate: 'Self-paced'
                    }
                ]
            },
            universities: {
                'stanford': [
                    {
                        id: 'course_003',
                        en: {
                            title: 'Designing Your Life',
                            instructor: 'Bill Burnett & Dave Evans',
                            description: 'How to build a well-lived, joyful life'
                        },
                        ru: {
                            title: 'Проектирование вашей жизни',
                            instructor: 'Билл Бернетт и Дейв Эванс',
                            description: 'Как построить хорошо прожитую, радостную жизнь'
                        },
                        rating: 4.7,
                        difficulty: 'intermediate',
                        estimatedTime: '10 weeks',
                        tags: ['life-design', 'career', 'personal-growth'],
                        mbti_relevance: ['ENFP', 'ENTP', 'INFP', 'INTP'],
                        category: 'universities',
                        subcategory: 'stanford',
                        platform: 'Stanford Online',
                        duration: '10 weeks',
                        price: 'Free',
                        certificate: true,
                        language: 'English',
                        startDate: 'Quarterly'
                    }
                ]
            }
        };
    }

    /**
     * Initialize enhanced activity recommendations database
     * @returns {Object} Enhanced activity database
     */
    initializeEnhancedActivities() {
        return {
            mindfulness: [
                {
                    id: 'activity_001',
                    en: {
                        title: 'Daily Meditation Practice',
                        description: 'Start with 10 minutes of mindfulness meditation each morning'
                    },
                    ru: {
                        title: 'Ежедневная практика медитации',
                        description: 'Начните с 10 минут медитации осознанности каждое утро'
                    },
                    rating: 4.6,
                    difficulty: 'beginner',
                    estimatedTime: '10 minutes daily',
                    tags: ['mindfulness', 'meditation', 'stress-relief'],
                    mbti_relevance: ['INFJ', 'INFP', 'ISFJ', 'ISFP'],
                    category: 'mindfulness',
                    frequency: 'daily',
                    duration: '10 minutes',
                    equipment: 'none',
                    location: 'anywhere',
                    benefits: ['stress-reduction', 'focus', 'emotional-regulation']
                }
            ],
            physical: [
                {
                    id: 'activity_002',
                    en: {
                        title: 'Morning Exercise Routine',
                        description: '30-minute workout to start your day with energy'
                    },
                    ru: {
                        title: 'Утренняя тренировка',
                        description: '30-минутная тренировка для начала дня с энергией'
                    },
                    rating: 4.4,
                    difficulty: 'intermediate',
                    estimatedTime: '30 minutes daily',
                    tags: ['exercise', 'fitness', 'energy'],
                    mbti_relevance: ['ESTP', 'ESFP', 'ENTP', 'ENFP'],
                    category: 'physical',
                    frequency: 'daily',
                    duration: '30 minutes',
                    equipment: 'basic',
                    location: 'home/gym',
                    benefits: ['energy', 'health', 'mood']
                }
            ],
            social: [
                {
                    id: 'activity_003',
                    en: {
                        title: 'Networking Events',
                        description: 'Attend professional networking events to build connections'
                    },
                    ru: {
                        title: 'Нетворкинг мероприятия',
                        description: 'Посещайте профессиональные нетворкинг мероприятия для построения связей'
                    },
                    rating: 4.2,
                    difficulty: 'intermediate',
                    estimatedTime: '2-3 hours monthly',
                    tags: ['networking', 'career', 'social-skills'],
                    mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                    category: 'social',
                    frequency: 'monthly',
                    duration: '2-3 hours',
                    equipment: 'none',
                    location: 'various',
                    benefits: ['networking', 'career', 'social-skills']
                }
            ]
        };
    }

    /**
     * Initialize enhanced tool recommendations database
     * @returns {Object} Enhanced tool database
     */
    initializeEnhancedTools() {
        return {
            productivity: [
                {
                    id: 'tool_001',
                    en: {
                        title: 'Notion',
                        description: 'All-in-one workspace for notes, tasks, and collaboration'
                    },
                    ru: {
                        title: 'Notion',
                        description: 'Универсальное рабочее пространство для заметок, задач и сотрудничества'
                    },
                    rating: 4.7,
                    difficulty: 'intermediate',
                    estimatedTime: '1-2 weeks to master',
                    tags: ['productivity', 'organization', 'collaboration'],
                    mbti_relevance: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
                    category: 'productivity',
                    type: 'app',
                    platform: 'web, mobile, desktop',
                    price: 'Free tier available',
                    features: ['notes', 'tasks', 'databases', 'collaboration'],
                    alternatives: ['Obsidian', 'Roam Research', 'Logseq']
                }
            ],
            mindfulness: [
                {
                    id: 'tool_002',
                    en: {
                        title: 'Headspace',
                        description: 'Meditation and mindfulness app for stress relief and focus'
                    },
                    ru: {
                        title: 'Headspace',
                        description: 'Приложение для медитации и осознанности для снятия стресса и концентрации'
                    },
                    rating: 4.5,
                    difficulty: 'beginner',
                    estimatedTime: 'immediate',
                    tags: ['meditation', 'mindfulness', 'stress-relief'],
                    mbti_relevance: ['INFJ', 'INFP', 'ISFJ', 'ISFP'],
                    category: 'mindfulness',
                    type: 'app',
                    platform: 'mobile, web',
                    price: '$12.99/month',
                    features: ['guided-meditation', 'sleep-stories', 'focus-music'],
                    alternatives: ['Calm', 'Insight Timer', 'Waking Up']
                }
            ]
        };
    }

    /**
     * Initialize enhanced article recommendations database
     * @returns {Object} Enhanced article database
     */
    initializeEnhancedArticles() {
        return {
            psychology: [
                {
                    id: 'article_001',
                    en: {
                        title: 'The Science of Habit Formation',
                        author: 'Dr. Charles Duhigg',
                        description: 'Understanding how habits work and how to change them'
                    },
                    ru: {
                        title: 'Наука формирования привычек',
                        author: 'Доктор Чарльз Дахигг',
                        description: 'Понимание того, как работают привычки и как их изменить'
                    },
                    rating: 4.6,
                    difficulty: 'intermediate',
                    estimatedTime: '15 minutes',
                    tags: ['habits', 'psychology', 'behavior-change'],
                    mbti_relevance: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
                    category: 'psychology',
                    source: 'Harvard Business Review',
                    publishDate: '2023-01-15',
                    url: 'https://hbr.org/2023/01/the-science-of-habit-formation',
                    readTime: '15 minutes',
                    language: 'English'
                }
            ],
            leadership: [
                {
                    id: 'article_002',
                    en: {
                        title: 'The Future of Remote Leadership',
                        author: 'Sarah Johnson',
                        description: 'How to lead distributed teams effectively in the digital age'
                    },
                    ru: {
                        title: 'Будущее удаленного лидерства',
                        author: 'Сара Джонсон',
                        description: 'Как эффективно руководить распределенными командами в цифровую эпоху'
                    },
                    rating: 4.3,
                    difficulty: 'intermediate',
                    estimatedTime: '12 minutes',
                    tags: ['leadership', 'remote-work', 'team-management'],
                    mbti_relevance: ['ENTJ', 'ENFJ', 'INTJ', 'INFJ'],
                    category: 'leadership',
                    source: 'MIT Sloan Review',
                    publishDate: '2023-02-20',
                    url: 'https://sloanreview.mit.edu/article/the-future-of-remote-leadership',
                    readTime: '12 minutes',
                    language: 'English'
                }
            ]
        };
    }

    /**
     * Initialize enhanced podcast recommendations database
     * @returns {Object} Enhanced podcast database
     */
    initializeEnhancedPodcasts() {
        return {
            personal_development: [
                {
                    id: 'podcast_001',
                    en: {
                        title: 'The Tim Ferriss Show',
                        host: 'Tim Ferriss',
                        description: 'Interviews with world-class performers and thought leaders'
                    },
                    ru: {
                        title: 'Шоу Тима Ферриса',
                        host: 'Тим Феррис',
                        description: 'Интервью с мировыми лидерами и мыслителями'
                    },
                    rating: 4.8,
                    difficulty: 'intermediate',
                    estimatedTime: '60-90 minutes per episode',
                    tags: ['productivity', 'entrepreneurship', 'optimization'],
                    mbti_relevance: ['ENTJ', 'ENTP', 'INTJ', 'INTP'],
                    category: 'personal_development',
                    platform: 'Spotify, Apple Podcasts, Google Podcasts',
                    frequency: 'weekly',
                    averageLength: '75 minutes',
                    totalEpisodes: '500+',
                    language: 'English'
                }
            ],
            psychology: [
                {
                    id: 'podcast_002',
                    en: {
                        title: 'Hidden Brain',
                        host: 'Shankar Vedantam',
                        description: 'Exploring the unconscious patterns that drive human behavior'
                    },
                    ru: {
                        title: 'Скрытый мозг',
                        host: 'Шанкар Ведантам',
                        description: 'Исследование бессознательных паттернов, управляющих поведением человека'
                    },
                    rating: 4.7,
                    difficulty: 'intermediate',
                    estimatedTime: '45-60 minutes per episode',
                    tags: ['psychology', 'behavior', 'neuroscience'],
                    mbti_relevance: ['INTP', 'INTJ', 'ENTP', 'ENTJ'],
                    category: 'psychology',
                    platform: 'NPR, Spotify, Apple Podcasts',
                    frequency: 'weekly',
                    averageLength: '50 minutes',
                    totalEpisodes: '300+',
                    language: 'English'
                }
            ]
        };
    }

    /**
     * Initialize enhanced video recommendations database
     * @returns {Object} Enhanced video database
     */
    initializeEnhancedVideos() {
        return {
            ted_talks: [
                {
                    id: 'video_001',
                    en: {
                        title: 'The Power of Vulnerability',
                        speaker: 'Brené Brown',
                        description: 'Research professor shares insights on courage, vulnerability, and shame'
                    },
                    ru: {
                        title: 'Сила уязвимости',
                        speaker: 'Брене Браун',
                        description: 'Профессор-исследователь делится идеями о мужестве, уязвимости и стыде'
                    },
                    rating: 4.9,
                    difficulty: 'beginner',
                    estimatedTime: '20 minutes',
                    tags: ['vulnerability', 'courage', 'authenticity'],
                    mbti_relevance: ['ENFJ', 'ENFP', 'INFJ', 'INFP'],
                    category: 'ted_talks',
                    platform: 'TED.com, YouTube',
                    duration: '20 minutes',
                    views: '50M+',
                    publishDate: '2010-12-01',
                    language: 'English',
                    subtitles: ['English', 'Russian', 'Spanish', 'French']
                }
            ],
            youtube: [
                {
                    id: 'video_002',
                    en: {
                        title: 'How to Build Confidence',
                        speaker: 'Amy Cuddy',
                        description: 'Body language expert shares research on power poses and confidence'
                    },
                    ru: {
                        title: 'Как развить уверенность',
                        speaker: 'Эми Кадди',
                        description: 'Эксперт по языку тела делится исследованиями о силовых позах и уверенности'
                    },
                    rating: 4.6,
                    difficulty: 'beginner',
                    estimatedTime: '21 minutes',
                    tags: ['confidence', 'body-language', 'psychology'],
                    mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                    category: 'youtube',
                    platform: 'YouTube',
                    duration: '21 minutes',
                    views: '25M+',
                    publishDate: '2012-10-01',
                    language: 'English',
                    subtitles: ['English', 'Russian']
                }
            ]
        };
    }

    /**
     * Initialize enhanced app recommendations database
     * @returns {Object} Enhanced app database
     */
    initializeEnhancedApps() {
        return {
            productivity: [
                {
                    id: 'app_001',
                    en: {
                        title: 'Todoist',
                        description: 'Task management app with natural language processing'
                    },
                    ru: {
                        title: 'Todoist',
                        description: 'Приложение для управления задачами с обработкой естественного языка'
                    },
                    rating: 4.5,
                    difficulty: 'beginner',
                    estimatedTime: 'immediate',
                    tags: ['task-management', 'productivity', 'organization'],
                    mbti_relevance: ['INTJ', 'ISTJ', 'ENTJ', 'ESTJ'],
                    category: 'productivity',
                    platform: 'iOS, Android, Web, Desktop',
                    price: 'Free tier available',
                    features: ['task-management', 'project-tracking', 'collaboration'],
                    alternatives: ['Any.do', 'TickTick', 'Things 3']
                }
            ],
            mindfulness: [
                {
                    id: 'app_002',
                    en: {
                        title: 'Calm',
                        description: 'Meditation, sleep stories, and relaxation app'
                    },
                    ru: {
                        title: 'Calm',
                        description: 'Приложение для медитации, историй для сна и релаксации'
                    },
                    rating: 4.4,
                    difficulty: 'beginner',
                    estimatedTime: 'immediate',
                    tags: ['meditation', 'sleep', 'relaxation'],
                    mbti_relevance: ['INFJ', 'INFP', 'ISFJ', 'ISFP'],
                    category: 'mindfulness',
                    platform: 'iOS, Android, Web',
                    price: '$69.99/year',
                    features: ['guided-meditation', 'sleep-stories', 'breathing-exercises'],
                    alternatives: ['Headspace', 'Insight Timer', 'Waking Up']
                }
            ]
        };
    }

    /**
     * Initialize enhanced community recommendations database
     * @returns {Object} Enhanced community database
     */
    initializeEnhancedCommunities() {
        return {
            online: [
                {
                    id: 'community_001',
                    en: {
                        title: 'Reddit - r/selfimprovement',
                        description: 'Community focused on personal development and self-improvement'
                    },
                    ru: {
                        title: 'Reddit - r/selfimprovement',
                        description: 'Сообщество, сосредоточенное на личностном развитии и самосовершенствовании'
                    },
                    rating: 4.2,
                    difficulty: 'beginner',
                    estimatedTime: 'ongoing',
                    tags: ['self-improvement', 'community', 'discussion'],
                    mbti_relevance: ['INFP', 'INTP', 'ENFP', 'ENTP'],
                    category: 'online',
                    platform: 'Reddit',
                    members: '500K+',
                    activity: 'high',
                    language: 'English',
                    moderation: 'moderated',
                    cost: 'free'
                }
            ],
            local: [
                {
                    id: 'community_002',
                    en: {
                        title: 'Toastmasters International',
                        description: 'Public speaking and leadership development organization'
                    },
                    ru: {
                        title: 'Тостмастерс Интернэшнл',
                        description: 'Организация по развитию публичных выступлений и лидерства'
                    },
                    rating: 4.6,
                    difficulty: 'intermediate',
                    estimatedTime: 'ongoing',
                    tags: ['public-speaking', 'leadership', 'networking'],
                    mbti_relevance: ['ENFJ', 'ENFP', 'ESFJ', 'ESFP'],
                    category: 'local',
                    platform: 'In-person meetings',
                    members: '300K+',
                    activity: 'weekly',
                    language: 'English',
                    moderation: 'structured',
                    cost: '$45/year'
                }
            ]
        };
    }

    /**
     * Get all content with enhanced filtering
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered content
     */
    getAllContent(filters = {}) {
        const allContent = [];
        
        Object.values(this.contentDatabase).forEach(category => {
            if (typeof category === 'object') {
                Object.values(category).forEach(subcategory => {
                    if (Array.isArray(subcategory)) {
                        allContent.push(...subcategory);
                    }
                });
            }
        });

        return this.applyFilters(allContent, filters);
    }

    /**
     * Apply filters to content
     * @param {Array} content - Content array
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered content
     */
    applyFilters(content, filters) {
        let filtered = content;

        if (filters.category) {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        if (filters.difficulty) {
            filtered = filtered.filter(item => item.difficulty === filters.difficulty);
        }

        if (filters.mbtiType) {
            filtered = filtered.filter(item => 
                item.mbti_relevance && item.mbti_relevance.includes(filters.mbtiType)
            );
        }

        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(item => 
                item.tags && filters.tags.some(tag => item.tags.includes(tag))
            );
        }

        if (filters.minRating) {
            filtered = filtered.filter(item => item.rating >= filters.minRating);
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(item => {
                if (!item.price || item.price === 'Free') return true;
                const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                return price <= filters.maxPrice;
            });
        }

        return filtered;
    }

    /**
     * Search content with enhanced search capabilities
     * @param {String} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Array} Search results
     */
    searchContent(query, filters = {}) {
        const allContent = this.getAllContent();
        const searchTerms = query.toLowerCase().split(' ');

        const results = allContent.filter(item => {
            const localizedItem = this.getLocalizedContent(item);
            const searchableText = [
                localizedItem.title || '',
                localizedItem.description || '',
                localizedItem.author || '',
                localizedItem.instructor || '',
                localizedItem.host || '',
                localizedItem.speaker || '',
                ...(item.tags || [])
            ].join(' ').toLowerCase();

            return searchTerms.every(term => searchableText.includes(term));
        });

        return this.applyFilters(results, filters);
    }

    /**
     * Get content recommendations based on user profile
     * @param {Object} userProfile - User profile data
     * @param {Object} options - Recommendation options
     * @returns {Array} Recommended content
     */
    getContentRecommendations(userProfile, options = {}) {
        const recommendations = [];
        const allContent = this.getAllContent();

        // MBTI-based recommendations
        if (userProfile.mbtiType) {
            const mbtiContent = allContent.filter(item => 
                item.mbti_relevance && item.mbti_relevance.includes(userProfile.mbtiType)
            );
            recommendations.push(...mbtiContent);
        }

        // Interest-based recommendations
        if (userProfile.interests && userProfile.interests.length > 0) {
            const interestContent = allContent.filter(item => 
                item.tags && userProfile.interests.some(interest => 
                    item.tags.some(tag => tag.includes(interest))
                )
            );
            recommendations.push(...interestContent);
        }

        // Goal-based recommendations
        if (userProfile.goals && userProfile.goals.length > 0) {
            const goalContent = allContent.filter(item => 
                item.category && userProfile.goals.some(goal => 
                    item.category.includes(goal)
                )
            );
            recommendations.push(...goalContent);
        }

        // Remove duplicates and apply options
        const uniqueRecommendations = this.removeDuplicates(recommendations);
        const filtered = this.applyFilters(uniqueRecommendations, options);
        
        // Sort by rating and relevance
        return filtered
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, options.limit || 10);
    }

    /**
     * Get localized content
     * @param {Object} content - Content object
     * @returns {Object} Localized content
     */
    getLocalizedContent(content) {
        if (this.currentLanguage === 'ru' && content.ru) {
            return content.ru;
        }
        return content.en || content;
    }

    /**
     * Remove duplicate content items
     * @param {Array} content - Content array
     * @returns {Array} Unique content items
     */
    removeDuplicates(content) {
        const seen = new Set();
        return content.filter(item => {
            if (seen.has(item.id)) {
                return false;
            }
            seen.add(item.id);
            return true;
        });
    }

    /**
     * Apply filters to content recommendations
     * @param {Array} content - Content array
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered content
     */
    applyFilters(content, filters = {}) {
        let filtered = [...content];

        // Filter by category
        if (filters.category) {
            filtered = filtered.filter(item => 
                item.category === filters.category || 
                item.type === filters.category
            );
        }

        // Filter by difficulty
        if (filters.difficulty) {
            filtered = filtered.filter(item => 
                item.difficulty === filters.difficulty
            );
        }

        // Filter by MBTI type
        if (filters.mbtiType) {
            filtered = filtered.filter(item => 
                !item.mbti_relevance || 
                item.mbti_relevance.includes(filters.mbtiType)
            );
        }

        // Apply limit
        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    /**
     * Get content statistics
     * @returns {Object} Content statistics
     */
    getContentStats() {
        const allContent = this.getAllContent();
        const stats = {
            totalItems: allContent.length,
            byCategory: {},
            byDifficulty: {},
            byMBTI: {},
            byLanguage: {
                en: 0,
                ru: 0
            },
            averageRating: 0,
            totalRatings: 0
        };

        allContent.forEach(item => {
            // Count by category
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            
            // Count by difficulty
            stats.byDifficulty[item.difficulty] = (stats.byDifficulty[item.difficulty] || 0) + 1;
            
            // Count by MBTI relevance
            if (item.mbti_relevance) {
                item.mbti_relevance.forEach(type => {
                    stats.byMBTI[type] = (stats.byMBTI[type] || 0) + 1;
                });
            }
            
            // Count by language availability
            if (item.ru) stats.byLanguage.ru++;
            if (item.en) stats.byLanguage.en++;
            
            // Calculate average rating
            if (item.rating) {
                stats.totalRatings++;
                stats.averageRating += item.rating;
            }
        });

        if (stats.totalRatings > 0) {
            stats.averageRating = Math.round((stats.averageRating / stats.totalRatings) * 10) / 10;
        }

        return stats;
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
     * Get content by ID
     * @param {String} contentId - Content identifier
     * @returns {Object|null} Content item
     */
    getContentById(contentId) {
        const allContent = this.getAllContent();
        return allContent.find(item => item.id === contentId) || null;
    }

    /**
     * Get content categories
     * @returns {Array} Available categories
     */
    getCategories() {
        const categories = new Set();
        const allContent = this.getAllContent();
        
        allContent.forEach(item => {
            if (item.category) {
                categories.add(item.category);
            }
        });
        
        return Array.from(categories);
    }

    /**
     * Get content tags
     * @returns {Array} Available tags
     */
    getTags() {
        const tags = new Set();
        const allContent = this.getAllContent();
        
        allContent.forEach(item => {
            if (item.tags) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        
        return Array.from(tags);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedContentManager;
} else if (typeof window !== 'undefined') {
    window.EnhancedContentManager = EnhancedContentManager;
}
