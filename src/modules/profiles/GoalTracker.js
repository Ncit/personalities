/**
 * GoalTracker - Manages user development goals and progress tracking
 * Part of Phase 2B: Enhanced Recommendations
 */
class GoalTracker {
    constructor(userProfileManager = null) {
        this.userProfileManager = userProfileManager;
        this.goals = new Map();
        this.milestones = new Map();
        this.progressHistory = new Map();
        this.currentLanguage = 'en';
    }

    /**
     * Set the current language for goal tracking
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 Goal tracking language set to: ${language}`);
    }

    /**
     * Create a new development goal
     * @param {String} userId - User identifier
     * @param {Object} goalData - Goal information
     * @returns {Object} Created goal with ID
     */
    createGoal(userId, goalData) {
        const goalId = this.generateGoalId();
        const goal = {
            id: goalId,
            userId: userId,
            title: goalData.title,
            description: goalData.description,
            category: goalData.category || 'personal_development',
            priority: goalData.priority || 'medium',
            difficulty: goalData.difficulty || 'intermediate',
            timeframe: goalData.timeframe || '4 weeks',
            targetDate: goalData.targetDate || this.calculateTargetDate(goalData.timeframe),
            status: 'active',
            progress: 0,
            milestones: [],
            resources: goalData.resources || [],
            tags: goalData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.goals.set(goalId, goal);
        this.saveGoalsToStorage(userId);
        
        console.log(`✅ Goal created: ${goal.title}`);
        return goal;
    }

    /**
     * Update goal progress
     * @param {String} goalId - Goal identifier
     * @param {Number} progress - Progress percentage (0-100)
     * @param {String} note - Optional progress note
     * @returns {Object} Updated goal
     */
    updateGoalProgress(goalId, progress, note = '') {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`Goal not found: ${goalId}`);
        }

        const previousProgress = goal.progress;
        goal.progress = Math.min(100, Math.max(0, progress));
        goal.updatedAt = new Date().toISOString();

        // Add progress entry to history
        this.addProgressEntry(goalId, {
            progress: goal.progress,
            previousProgress: previousProgress,
            note: note,
            timestamp: new Date().toISOString()
        });

        // Check for milestone achievements
        this.checkMilestoneAchievements(goalId);

        // Update goal status based on progress
        this.updateGoalStatus(goalId);

        this.saveGoalsToStorage(goal.userId);
        
        console.log(`📈 Goal progress updated: ${goal.title} - ${goal.progress}%`);
        return goal;
    }

    /**
     * Add a milestone to a goal
     * @param {String} goalId - Goal identifier
     * @param {Object} milestoneData - Milestone information
     * @returns {Object} Created milestone
     */
    addMilestone(goalId, milestoneData) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`Goal not found: ${goalId}`);
        }

        const milestoneId = this.generateMilestoneId();
        const milestone = {
            id: milestoneId,
            goalId: goalId,
            title: milestoneData.title,
            description: milestoneData.description,
            targetProgress: milestoneData.targetProgress || 25,
            status: 'pending',
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        goal.milestones.push(milestone);
        this.milestones.set(milestoneId, milestone);
        this.saveGoalsToStorage(goal.userId);

        console.log(`🎯 Milestone added: ${milestone.title}`);
        return milestone;
    }

    /**
     * Complete a milestone
     * @param {String} milestoneId - Milestone identifier
     * @param {String} note - Optional completion note
     * @returns {Object} Updated milestone
     */
    completeMilestone(milestoneId, note = '') {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone) {
            throw new Error(`Milestone not found: ${milestoneId}`);
        }

        milestone.status = 'completed';
        milestone.completedAt = new Date().toISOString();
        milestone.completionNote = note;

        // Update goal progress if milestone completion affects it
        const goal = this.goals.get(milestone.goalId);
        if (goal && milestone.targetProgress > goal.progress) {
            this.updateGoalProgress(milestone.goalId, milestone.targetProgress, 
                `Milestone completed: ${milestone.title}`);
        }

        this.saveGoalsToStorage(goal.userId);
        
        console.log(`🏆 Milestone completed: ${milestone.title}`);
        return milestone;
    }

    /**
     * Get user's goals
     * @param {String} userId - User identifier
     * @param {String} status - Filter by status ('active', 'completed', 'paused')
     * @returns {Array} User's goals
     */
    getUserGoals(userId, status = null) {
        const userGoals = Array.from(this.goals.values())
            .filter(goal => goal.userId === userId);

        if (status) {
            return userGoals.filter(goal => goal.status === status);
        }

        return userGoals;
    }

    /**
     * Get goal progress history
     * @param {String} goalId - Goal identifier
     * @returns {Array} Progress history entries
     */
    getGoalProgressHistory(goalId) {
        return this.progressHistory.get(goalId) || [];
    }

    /**
     * Get user's development statistics
     * @param {String} userId - User identifier
     * @returns {Object} Development statistics
     */
    getUserDevelopmentStats(userId) {
        const userGoals = this.getUserGoals(userId);
        const completedGoals = userGoals.filter(goal => goal.status === 'completed');
        const activeGoals = userGoals.filter(goal => goal.status === 'active');
        const totalMilestones = userGoals.reduce((sum, goal) => sum + goal.milestones.length, 0);
        const completedMilestones = userGoals.reduce((sum, goal) => 
            sum + goal.milestones.filter(m => m.status === 'completed').length, 0);

        const averageProgress = userGoals.length > 0 
            ? userGoals.reduce((sum, goal) => sum + goal.progress, 0) / userGoals.length 
            : 0;

        return {
            totalGoals: userGoals.length,
            completedGoals: completedGoals.length,
            activeGoals: activeGoals.length,
            completionRate: userGoals.length > 0 ? (completedGoals.length / userGoals.length) * 100 : 0,
            totalMilestones: totalMilestones,
            completedMilestones: completedMilestones,
            milestoneCompletionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
            averageProgress: Math.round(averageProgress),
            goalsByCategory: this.getGoalsByCategory(userGoals),
            goalsByPriority: this.getGoalsByPriority(userGoals),
            recentActivity: this.getRecentActivity(userId)
        };
    }

    /**
     * Generate goal recommendations based on user profile
     * @param {String} userId - User identifier
     * @param {Object} userProfile - User profile data
     * @returns {Array} Recommended goals
     */
    generateGoalRecommendations(userId, userProfile) {
        const recommendations = [];
        const existingGoals = this.getUserGoals(userId);

        // Analyze user profile for goal opportunities
        if (userProfile.mbtiType) {
            const mbtiGoals = this.getMBTIBasedGoals(userProfile.mbtiType);
            recommendations.push(...mbtiGoals);
        }

        if (userProfile.goals && userProfile.goals.length > 0) {
            const profileGoals = this.getProfileBasedGoals(userProfile.goals);
            recommendations.push(...profileGoals);
        }

        // Filter out goals user already has
        const existingGoalTitles = existingGoals.map(goal => goal.title.toLowerCase());
        const filteredRecommendations = recommendations.filter(rec => 
            !existingGoalTitles.includes(rec.title.toLowerCase())
        );

        return filteredRecommendations.slice(0, 5); // Return top 5 recommendations
    }

    /**
     * Get goals by category
     * @param {Array} goals - Goals array
     * @returns {Object} Goals grouped by category
     */
    getGoalsByCategory(goals) {
        return goals.reduce((acc, goal) => {
            acc[goal.category] = (acc[goal.category] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Get goals by priority
     * @param {Array} goals - Goals array
     * @returns {Object} Goals grouped by priority
     */
    getGoalsByPriority(goals) {
        return goals.reduce((acc, goal) => {
            acc[goal.priority] = (acc[goal.priority] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Get recent activity for user
     * @param {String} userId - User identifier
     * @returns {Array} Recent activity entries
     */
    getRecentActivity(userId) {
        const userGoals = this.getUserGoals(userId);
        const activities = [];

        userGoals.forEach(goal => {
            const history = this.getGoalProgressHistory(goal.id);
            history.forEach(entry => {
                activities.push({
                    type: 'progress_update',
                    goalTitle: goal.title,
                    progress: entry.progress,
                    note: entry.note,
                    timestamp: entry.timestamp
                });
            });

            goal.milestones.forEach(milestone => {
                if (milestone.status === 'completed') {
                    activities.push({
                        type: 'milestone_completed',
                        goalTitle: goal.title,
                        milestoneTitle: milestone.title,
                        timestamp: milestone.completedAt
                    });
                }
            });
        });

        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
    }

    /**
     * Get MBTI-based goal recommendations
     * @param {String} mbtiType - User's MBTI type
     * @returns {Array} MBTI-specific goal recommendations
     */
    getMBTIBasedGoals(mbtiType) {
        const mbtiGoals = {
            'INTJ': [
                {
                    title: this.getLocalizedText({
                        en: 'Develop Emotional Intelligence',
                        ru: 'Развить эмоциональный интеллект'
                    }),
                    description: this.getLocalizedText({
                        en: 'Practice active listening and empathy in daily interactions',
                        ru: 'Практиковать активное слушание и эмпатию в ежедневном общении'
                    }),
                    category: 'social_skills',
                    priority: 'high',
                    difficulty: 'intermediate',
                    timeframe: '6 weeks'
                },
                {
                    title: this.getLocalizedText({
                        en: 'Improve Time Management',
                        ru: 'Улучшить управление временем'
                    }),
                    description: this.getLocalizedText({
                        en: 'Implement structured scheduling and task prioritization',
                        ru: 'Внедрить структурированное планирование и приоритизацию задач'
                    }),
                    category: 'productivity',
                    priority: 'medium',
                    difficulty: 'beginner',
                    timeframe: '4 weeks'
                }
            ],
            'ENFP': [
                {
                    title: this.getLocalizedText({
                        en: 'Develop Focus and Follow-through',
                        ru: 'Развить концентрацию и доведение до конца'
                    }),
                    description: this.getLocalizedText({
                        en: 'Complete projects from start to finish without getting distracted',
                        ru: 'Завершать проекты от начала до конца без отвлечений'
                    }),
                    category: 'productivity',
                    priority: 'high',
                    difficulty: 'intermediate',
                    timeframe: '8 weeks'
                }
            ]
        };

        return mbtiGoals[mbtiType] || [];
    }

    /**
     * Get profile-based goal recommendations
     * @param {Array} profileGoals - User's profile goals
     * @returns {Array} Profile-based goal recommendations
     */
    getProfileBasedGoals(profileGoals) {
        const goalMap = {
            'personal_development': [
                {
                    title: this.getLocalizedText({
                        en: 'Daily Self-Reflection Practice',
                        ru: 'Ежедневная практика самоанализа'
                    }),
                    description: this.getLocalizedText({
                        en: 'Spend 10 minutes daily journaling about experiences and learnings',
                        ru: 'Уделять 10 минут ежедневно ведению дневника о переживаниях и уроках'
                    }),
                    category: 'mindfulness',
                    priority: 'medium',
                    difficulty: 'beginner',
                    timeframe: '4 weeks'
                }
            ],
            'career_advancement': [
                {
                    title: this.getLocalizedText({
                        en: 'Build Professional Network',
                        ru: 'Построить профессиональную сеть'
                    }),
                    description: this.getLocalizedText({
                        en: 'Connect with 5 new professionals in your field each month',
                        ru: 'Подключаться к 5 новым профессионалам в вашей области каждый месяц'
                    }),
                    category: 'networking',
                    priority: 'high',
                    difficulty: 'intermediate',
                    timeframe: '12 weeks'
                }
            ]
        };

        const recommendations = [];
        profileGoals.forEach(goal => {
            if (goalMap[goal]) {
                recommendations.push(...goalMap[goal]);
            }
        });

        return recommendations;
    }

    /**
     * Check for milestone achievements
     * @param {String} goalId - Goal identifier
     */
    checkMilestoneAchievements(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal) return;

        goal.milestones.forEach(milestone => {
            if (milestone.status === 'pending' && goal.progress >= milestone.targetProgress) {
                this.completeMilestone(milestone.id, 
                    this.getLocalizedText({
                        en: 'Automatically completed based on goal progress',
                        ru: 'Автоматически завершено на основе прогресса цели'
                    }));
            }
        });
    }

    /**
     * Update goal status based on progress
     * @param {String} goalId - Goal identifier
     */
    updateGoalStatus(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal) return;

        if (goal.progress >= 100) {
            goal.status = 'completed';
        } else if (goal.progress > 0) {
            goal.status = 'active';
        }
    }

    /**
     * Add progress entry to history
     * @param {String} goalId - Goal identifier
     * @param {Object} entry - Progress entry
     */
    addProgressEntry(goalId, entry) {
        if (!this.progressHistory.has(goalId)) {
            this.progressHistory.set(goalId, []);
        }
        this.progressHistory.get(goalId).push(entry);
    }

    /**
     * Calculate target date based on timeframe
     * @param {String} timeframe - Timeframe string
     * @returns {String} Target date in ISO format
     */
    calculateTargetDate(timeframe) {
        const now = new Date();
        const timeframes = {
            '1 week': 7,
            '2 weeks': 14,
            '4 weeks': 28,
            '6 weeks': 42,
            '8 weeks': 56,
            '3 months': 90,
            '6 months': 180,
            '1 year': 365
        };

        const days = timeframes[timeframe] || 28;
        now.setDate(now.getDate() + days);
        return now.toISOString();
    }

    /**
     * Generate unique goal ID
     * @returns {String} Unique goal ID
     */
    generateGoalId() {
        return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique milestone ID
     * @returns {String} Unique milestone ID
     */
    generateMilestoneId() {
        return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get localized text
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
     * Save goals to localStorage
     * @param {String} userId - User identifier
     */
    saveGoalsToStorage(userId) {
        try {
            const userGoals = this.getUserGoals(userId);
            const userMilestones = userGoals.flatMap(goal => goal.milestones);
            const userProgressHistory = userGoals.reduce((acc, goal) => {
                acc[goal.id] = this.getGoalProgressHistory(goal.id);
                return acc;
            }, {});

            const goalData = {
                goals: userGoals,
                milestones: userMilestones,
                progressHistory: userProgressHistory,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(`goals_${userId}`, JSON.stringify(goalData));
        } catch (error) {
            console.error('Error saving goals to storage:', error);
        }
    }

    /**
     * Load goals from localStorage
     * @param {String} userId - User identifier
     */
    loadGoalsFromStorage(userId) {
        try {
            const goalData = localStorage.getItem(`goals_${userId}`);
            if (!goalData) return;

            const parsed = JSON.parse(goalData);
            
            // Load goals
            parsed.goals.forEach(goal => {
                this.goals.set(goal.id, goal);
            });

            // Load milestones
            parsed.milestones.forEach(milestone => {
                this.milestones.set(milestone.id, milestone);
            });

            // Load progress history
            Object.entries(parsed.progressHistory).forEach(([goalId, history]) => {
                this.progressHistory.set(goalId, history);
            });

            console.log(`📂 Loaded ${parsed.goals.length} goals for user ${userId}`);
        } catch (error) {
            console.error('Error loading goals from storage:', error);
        }
    }

    /**
     * Clear all goals for user
     * @param {String} userId - User identifier
     */
    clearUserGoals(userId) {
        const userGoals = this.getUserGoals(userId);
        userGoals.forEach(goal => {
            this.goals.delete(goal.id);
            goal.milestones.forEach(milestone => {
                this.milestones.delete(milestone.id);
            });
            this.progressHistory.delete(goal.id);
        });

        localStorage.removeItem(`goals_${userId}`);
        console.log(`🧹 Cleared all goals for user ${userId}`);
    }

    /**
     * Get goal tracker statistics
     * @returns {Object} Goal tracker statistics
     */
    getStats() {
        return {
            totalGoals: this.goals.size,
            totalMilestones: this.milestones.size,
            activeGoals: Array.from(this.goals.values()).filter(g => g.status === 'active').length,
            completedGoals: Array.from(this.goals.values()).filter(g => g.status === 'completed').length,
            language: this.currentLanguage,
            timestamp: Date.now()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoalTracker;
} else if (typeof window !== 'undefined') {
    window.GoalTracker = GoalTracker;
}
