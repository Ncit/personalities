/**
 * Analytics Engine - Handles data visualization and analytics
 * Manages chart generation, data analysis, and visual reporting
 */
import { stateManager } from '../core/StateManager.js';
import { firebaseAnalytics } from '../../config/firebase.js';
import { LoggerManager } from '../core/LoggerManager.js';

// Initialize logger for this module
const logger = new LoggerManager().createModuleLogger('AnalyticsEngine');

/**
 * Product Analytics - Comprehensive user behavior tracking
 * Integrates with Firebase Analytics for detailed insights
 */
export class ProductAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.userJourney = [];
        this.userSegments = new Set();
        this.conversionEvents = [];
        this.featureUsage = new Map();
        this.dropOffPoints = new Map();

        // Initialize user properties
        this.setUserProperties();

        // Track session start
        this.trackEvent('session_start', {
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            language: navigator.language
        });

        // Track page visibility changes
        this.trackPageVisibility();

        logger.info('ProductAnalytics initialized', { sessionId: this.sessionId });
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Set initial user properties
     */
    setUserProperties() {
        const properties = {
            first_visit: this.isFirstVisit(),
            returning_user: this.isReturningUser(),
            device_type: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            quiz_completed_count: this.getCompletedQuizCount()
        };

        // Set Firebase user properties
        firebaseAnalytics.setUserProperties(properties);

        // Store in localStorage for persistence
        localStorage.setItem('user_properties', JSON.stringify(properties));
    }

    /**
     * Track user events with enhanced data
     */
    trackEvent(eventName, parameters = {}) {
        const enhancedParameters = {
            ...parameters,
            session_id: this.sessionId,
            session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
            journey_step: this.userJourney.length + 1,
            timestamp: new Date().toISOString(),
            page_url: window.location.pathname,
            user_segment: this.determineUserSegment()
        };

        // Add to user journey
        this.userJourney.push({
            event: eventName,
            parameters: enhancedParameters,
            timestamp: Date.now()
        });

        // Track conversion events
        if (this.isConversionEvent(eventName)) {
            this.conversionEvents.push({
                event: eventName,
                timestamp: Date.now(),
                parameters: enhancedParameters
            });
        }

        // Track feature usage
        if (parameters.feature) {
            this.trackFeatureUsage(parameters.feature);
        }

        // Send to Firebase Analytics
        firebaseAnalytics.logEvent(eventName, enhancedParameters);

        // Store journey in localStorage (keep last 50 events)
        if (this.userJourney.length > 50) {
            this.userJourney = this.userJourney.slice(-50);
        }
        localStorage.setItem('user_journey', JSON.stringify(this.userJourney));

        logger.debug(`Event tracked: ${eventName}`, enhancedParameters);
    }

    /**
     * Track specific user actions
     */
    trackUserAction(action, details = {}) {
        const eventName = `user_${action}`;
        this.trackEvent(eventName, {
            action,
            ...details,
            feature: details.feature || action
        });
    }

    /**
     * Track quiz-related events
     */
    trackQuizEvent(action, quizData = {}) {
        const eventName = `quiz_${action}`;
        this.trackEvent(eventName, {
            ...quizData,
            quiz_type: stateManager.getCurrentQuizType(),
            feature: 'quiz'
        });

        // Update user segments based on quiz progress
        this.updateUserSegments(quizData);
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName) {
        const current = this.featureUsage.get(featureName) || 0;
        this.featureUsage.set(featureName, current + 1);
        localStorage.setItem('feature_usage', JSON.stringify(Object.fromEntries(this.featureUsage)));
    }

    /**
     * Track drop-off points
     */
    trackDropOff(step, reason = null) {
        const key = `${step}_${reason || 'unknown'}`;
        const current = this.dropOffPoints.get(key) || 0;
        this.dropOffPoints.set(key, current + 1);
        localStorage.setItem('drop_off_points', JSON.stringify(Object.fromEntries(this.dropOffPoints)));
    }

    /**
     * Determine user segment based on behavior
     */
    determineUserSegment() {
        const completedQuizzes = this.getCompletedQuizCount();
        const sessionTime = (Date.now() - this.sessionStartTime) / 1000 / 60; // minutes

        if (completedQuizzes >= 5) return 'power_user';
        if (completedQuizzes >= 2) return 'engaged_user';
        if (sessionTime > 10) return 'explorer';
        if (this.conversionEvents.length > 0) return 'converter';
        return 'visitor';
    }

    /**
     * Update user segments
     */
    updateUserSegments(quizData) {
        if (quizData.personality_type) {
            this.userSegments.add('quiz_completer');
        }
        if (quizData.quiz_type && quizData.quiz_type !== 'mbti') {
            this.userSegments.add('premium_user');
        }
        if (this.userJourney.length > 10) {
            this.userSegments.add('engaged_user');
        }
    }

    /**
     * Check if event is a conversion event
     */
    isConversionEvent(eventName) {
        const conversionEvents = [
            'quiz_completed',
            'premium_purchased',
            'results_shared',
            'profile_created',
            'feedback_submitted'
        ];
        return conversionEvents.includes(eventName);
    }

    /**
     * Track page visibility changes
     */
    trackPageVisibility() {
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('page_visibility_change', {
                hidden: document.hidden,
                session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
            });

            if (document.hidden) {
                // Track time away
                this.pageHiddenTime = Date.now();
            } else if (this.pageHiddenTime) {
                // Track return time
                const timeAway = Date.now() - this.pageHiddenTime;
                this.trackEvent('page_return', {
                    time_away_seconds: Math.floor(timeAway / 1000)
                });
            }
        });
    }

    /**
     * Get session duration in milliseconds
     */
    getSessionDuration() {
        return Date.now() - this.sessionStartTime;
    }

    /**
     * Get conversion rate
     */
    getConversionRate() {
        const totalActions = this.userJourney.length;
        if (totalActions === 0) return 0;

        const conversionActions = this.userJourney.filter(event =>
            this.isConversionEvent(event.event)
        ).length;

        return Math.round((conversionActions / totalActions) * 100);
    }

    /**
     * Get top used features
     */
    getTopUsedFeatures(limit = 10) {
        return Array.from(this.featureUsage.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    /**
     * Get user journey steps
     */
    getUserJourney(limit = 20) {
        return this.userJourney.slice(-limit).map(step => ({
            step: step.event,
            timestamp: step.timestamp,
            details: step.parameters
        }));
    }

    /**
     * Export comprehensive analytics report
     */
    exportAnalyticsReport() {
        return {
            sessionId: this.sessionId,
            sessionDuration: this.getSessionDuration(),
            userJourney: this.getUserJourney(),
            conversionEvents: this.conversionEvents,
            userSegments: Array.from(this.userSegments),
            featureUsage: Object.fromEntries(this.featureUsage),
            dropOffPoints: Object.fromEntries(this.dropOffPoints),
            conversionRate: this.getConversionRate(),
            completedQuizzes: this.getCompletedQuizCount(),
            topFeatures: this.getTopUsedFeatures(),
            userProperties: JSON.parse(localStorage.getItem('user_properties') || '{}'),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Helper methods
     */
    isFirstVisit() {
        return !localStorage.getItem('user_properties');
    }

    isReturningUser() {
        const properties = localStorage.getItem('user_properties');
        return properties ? JSON.parse(properties).returning_user : false;
    }

    getDeviceType() {
        if (window.innerWidth <= 768) return 'mobile';
        if (window.innerWidth <= 1024) return 'tablet';
        return 'desktop';
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
    }

    getCompletedQuizCount() {
        let count = 0;
        const quizTypes = ['mbti', 'leadership', 'communication', 'stress', 'learning',
                          'relationships', 'creativity', 'decision', 'teamwork',
                          'career', 'conflict', 'motivation', 'adaptability',
                          'emotional', 'productivity', 'social'];

        quizTypes.forEach(type => {
            const key = `mbti_results_${type}`;
            if (localStorage.getItem(key)) {
                count++;
            }
        });

        return count;
    }

    /**
     * Load persisted data
     */
    loadPersistedData() {
        try {
            const journey = localStorage.getItem('user_journey');
            if (journey) {
                this.userJourney = JSON.parse(journey);
            }

            const features = localStorage.getItem('feature_usage');
            if (features) {
                this.featureUsage = new Map(Object.entries(JSON.parse(features)));
            }

            const dropOffs = localStorage.getItem('drop_off_points');
            if (dropOffs) {
                this.dropOffPoints = new Map(Object.entries(JSON.parse(dropOffs)));
            }
        } catch (error) {
            logger.warn('Failed to load persisted analytics data:', error);
        }
    }
}

// Create singleton instance
export const productAnalytics = new ProductAnalytics();

export class AnalyticsEngine {
    constructor() {
        this.charts = new Map();
        this.chartConfigs = this.getChartConfigurations();
    }

    getChartConfigurations() {
        return {
            radar: {
                width: 300,
                height: 300,
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
            },
            bar: {
                width: 400,
                height: 250,
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
            },
            balance: {
                width: 350,
                height: 200,
                colors: ['#4CAF50', '#FF5722']
            },
            pie: {
                width: 300,
                height: 300,
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4CAF50', '#FF9800', '#9C27B0', '#607D8B']
            },
            timeline: {
                width: 400,
                height: 200,
                colors: ['#667eea', '#764ba2']
            },
            strengths: {
                width: 350,
                height: 250,
                colors: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0']
            }
        };
    }

    // Main analytics method
    createAnalyticsCharts(results) {
        if (!results || !results.scores) {
            logger.warn('No results data provided for analytics');
            return;
        }

        const { E, I, S, N, T, F, J, P } = results.scores;
        
        // Create all charts
        this.createRadarChart(E, S, T, J);
        this.createBarChart(E, S, T, J);
        this.createBalanceChart(E, I, S, N, T, F, J, P);
        this.createPieChart(E, I, S, N, T, F, J, P);
        this.createTimelineChart();
        this.createStrengthsChart(E, S, T, J);
        
        // Log analytics generation to Firebase
        firebaseAnalytics.logEvent('analytics_charts_created', {
            personality_type: results.personalityType,
            quiz_type: stateManager.getCurrentQuizType()
        });
    }

    // Enhanced Radar Chart
    createRadarChart(E, S, T, J) {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.radar;
        
        // Set canvas size for better resolution
        canvas.width = config.width;
        canvas.height = config.height;
        
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const radius = Math.min(centerX, centerY) - 50;
        
        // Clear canvas
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Create gradient background
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, config.width, config.height);
        
        // Draw enhanced radar grid with multiple levels
        const gridLevels = 5;
        for (let level = 1; level <= gridLevels; level++) {
            const currentRadius = (radius * level) / gridLevels;
            
            // Draw concentric circles with gradient opacity
            ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 + (level * 0.05)})`;
            ctx.lineWidth = level === gridLevels ? 2 : 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Enhanced axis lines with better styling
        const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
        const descriptions = ['Extraversion/Introversion', 'Sensing/Intuition', 'Thinking/Feeling', 'Judging/Perceiving'];
        const scores = [E, S, T, J];
        
        dimensions.forEach((dim, index) => {
            const angle = (index * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Draw axis line with gradient
            const lineGradient = ctx.createLinearGradient(centerX, centerY, x, y);
            lineGradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
            lineGradient.addColorStop(1, 'rgba(102, 126, 234, 0.3)');
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Enhanced labels with better positioning and styling
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labelX = centerX + (radius + 25) * Math.cos(angle);
            const labelY = centerY + (radius + 25) * Math.sin(angle);
            
            // Add label background for better readability
            const labelText = dim;
            const labelMetrics = ctx.measureText(labelText);
            const labelPadding = 4;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
                labelX - labelMetrics.width/2 - labelPadding,
                labelY - 8 - labelPadding,
                labelMetrics.width + labelPadding * 2,
                16 + labelPadding * 2
            );
            
            ctx.fillStyle = '#333';
            ctx.fillText(labelText, labelX, labelY);
            
            // Add percentage values
            ctx.font = '12px Inter';
            ctx.fillStyle = '#667eea';
            const valueX = centerX + (radius + 45) * Math.cos(angle);
            const valueY = centerY + (radius + 45) * Math.sin(angle);
            ctx.fillText(`${scores[index]}%`, valueX, valueY);
        });
        
        // Calculate normalized scores for better visualization
        const maxScore = Math.max(...scores);
        const normalizedScores = scores.map(score => (score / maxScore) * radius);
        
        // Draw enhanced data polygon with gradient fill
        const polygonGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        polygonGradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
        polygonGradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');
        
        ctx.fillStyle = polygonGradient;
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        normalizedScores.forEach((score, index) => {
            const angle = (index * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * score;
            const y = centerY + Math.sin(angle) * score;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Enhanced data points with glow effect
        normalizedScores.forEach((score, index) => {
            const angle = (index * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * score;
            const y = centerY + Math.sin(angle) * score;
            
            // Draw glow effect
            ctx.shadowColor = '#667eea';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw inner point
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Add center point with personality type indicator
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MBTI', centerX, centerY);
        
        // Add chart title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Personality Dimensions', centerX, 20);
        
        // Add legend
        ctx.font = '12px Inter';
        ctx.fillStyle = '#666';
        ctx.fillText('Higher values indicate stronger preferences', centerX, config.height - 10);
    }

    // Bar Chart
    createBarChart(E, S, T, J) {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.bar;
        
        canvas.width = config.width;
        canvas.height = config.height;
        
        const data = [
            { label: 'Extraversion', value: E, color: config.colors[0] },
            { label: 'Sensing', value: S, color: config.colors[1] },
            { label: 'Thinking', value: T, color: config.colors[2] },
            { label: 'Judging', value: J, color: config.colors[3] }
        ];
        
        const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
        const barWidth = (config.width - 100) / data.length;
        const barHeight = config.height - 80;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Draw bars
        data.forEach((item, index) => {
            const x = 50 + index * barWidth + barWidth / 2;
            const height = (Math.abs(item.value) / maxValue) * barHeight;
            const y = item.value >= 0 ? config.height - 60 - height : config.height - 60;
            
            // Draw bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x - barWidth / 3, y, barWidth * 2 / 3, height);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x, config.height - 20);
            
            // Draw value
            ctx.fillText(item.value.toString(), x, y - 10);
        });
        
        // Draw center line
        ctx.beginPath();
        ctx.moveTo(0, config.height - 60);
        ctx.lineTo(config.width, config.height - 60);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Balance Chart
    createBalanceChart(E, I, S, N, T, F, J, P) {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.balance;
        
        canvas.width = config.width;
        canvas.height = config.height;
        
        const dimensions = [
            { left: 'E', right: 'I', leftValue: E, rightValue: I },
            { left: 'S', right: 'N', leftValue: S, rightValue: N },
            { left: 'T', right: 'F', leftValue: T, rightValue: F },
            { left: 'J', right: 'P', leftValue: J, rightValue: P }
        ];
        
        const barHeight = 30;
        const spacing = 10;
        const startY = 20;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        dimensions.forEach((dim, index) => {
            const y = startY + index * (barHeight + spacing);
            const total = Math.abs(dim.leftValue) + Math.abs(dim.rightValue);
            const leftWidth = total > 0 ? (Math.abs(dim.leftValue) / total) * (config.width - 100) : 0;
            const rightWidth = total > 0 ? (Math.abs(dim.rightValue) / total) * (config.width - 100) : 0;
            
            const centerX = config.width / 2;
            
            // Draw left bar
            if (leftWidth > 0) {
                ctx.fillStyle = config.colors[0];
                ctx.fillRect(centerX - leftWidth, y, leftWidth, barHeight);
            }
            
            // Draw right bar
            if (rightWidth > 0) {
                ctx.fillStyle = config.colors[1];
                ctx.fillRect(centerX, y, rightWidth, barHeight);
            }
            
            // Draw labels
            ctx.fillStyle = '#333';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(dim.left, centerX - 20, y + barHeight / 2 + 5);
            ctx.fillText(dim.right, centerX + 20, y + barHeight / 2 + 5);
        });
    }

    // Pie Chart
    createPieChart(E, I, S, N, T, F, J, P) {
        const canvas = document.getElementById('pieChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.pie;
        
        canvas.width = config.width;
        canvas.height = config.height;
        
        const data = [
            { label: 'E', value: Math.abs(E), color: config.colors[0] },
            { label: 'I', value: Math.abs(I), color: config.colors[1] },
            { label: 'S', value: Math.abs(S), color: config.colors[2] },
            { label: 'N', value: Math.abs(N), color: config.colors[3] },
            { label: 'T', value: Math.abs(T), color: config.colors[4] },
            { label: 'F', value: Math.abs(F), color: config.colors[5] },
            { label: 'J', value: Math.abs(J), color: config.colors[6] },
            { label: 'P', value: Math.abs(P), color: config.colors[7] }
        ];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        let currentAngle = 0;
        
        data.forEach((item, index) => {
            if (item.value === 0) return;
            
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, labelX, labelY + 4);
            
            currentAngle += sliceAngle;
        });
    }

    // Minimalistic Timeline Chart
    createTimelineChart() {
        const canvas = document.getElementById('timelineChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.timeline;
        
        // Set canvas size for better resolution
        canvas.width = config.width;
        canvas.height = config.height;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Draw minimal timeline line
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, config.height / 2);
        ctx.lineTo(config.width - 40, config.height / 2);
        ctx.stroke();
        
        // Draw timeline points with minimal design
        const points = [
            { x: 60, label: 'Past', color: '#9ca3af' },
            { x: config.width / 2, label: 'Present', color: '#667eea' },
            { x: config.width - 60, label: 'Future', color: '#9ca3af' }
        ];
        
        points.forEach((point, index) => {
            // Draw subtle background circle for present point
            if (index === 1) {
                ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
                ctx.beginPath();
                ctx.arc(point.x, config.height / 2, 12, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Draw main point
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, config.height / 2, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw subtle label
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(point.label, point.x, config.height / 2 + 25);
        });
        
        // Draw minimal title
        ctx.fillStyle = '#374151';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Personality Journey', config.width / 2, 30);
    }

    // Strengths Chart
    createStrengthsChart(E, S, T, J) {
        const canvas = document.getElementById('strengthsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.strengths;
        
        canvas.width = config.width;
        canvas.height = config.height;
        
        const strengths = [
            { name: 'Leadership', value: Math.abs(E), color: config.colors[0] },
            { name: 'Analysis', value: Math.abs(S), color: config.colors[1] },
            { name: 'Logic', value: Math.abs(T), color: config.colors[2] },
            { name: 'Planning', value: Math.abs(J), color: config.colors[3] }
        ];
        
        const maxValue = Math.max(...strengths.map(s => s.value));
        const barHeight = 30;
        const spacing = 10;
        const startY = 20;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        strengths.forEach((strength, index) => {
            const y = startY + index * (barHeight + spacing);
            const width = (strength.value / maxValue) * (config.width - 120);
            
            // Draw bar
            ctx.fillStyle = strength.color;
            ctx.fillRect(100, y, width, barHeight);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(strength.name, 10, y + barHeight / 2 + 4);
            
            // Draw value
            ctx.textAlign = 'right';
            ctx.fillText(strength.value.toString(), config.width - 10, y + barHeight / 2 + 4);
        });
    }

    // Export analytics data
    exportAnalyticsData(results) {
        return {
            personalityType: results.personalityType,
            scores: results.scores,
            dimensionBreakdown: results.dimensionBreakdown,
            timestamp: new Date().toISOString(),
            analytics: {
                dominantTraits: this.calculateDominantTraits(results.scores),
                balanceScore: this.calculateBalanceScore(results.scores),
                preferenceStrength: this.calculatePreferenceStrength(results.scores)
            }
        };
    }

    // Calculate dominant traits
    calculateDominantTraits(scores) {
        const traits = [];
        
        if (Math.abs(scores.E) > Math.abs(scores.I)) {
            traits.push('Extraversion');
        } else {
            traits.push('Introversion');
        }
        
        if (Math.abs(scores.S) > Math.abs(scores.N)) {
            traits.push('Sensing');
        } else {
            traits.push('Intuition');
        }
        
        if (Math.abs(scores.T) > Math.abs(scores.F)) {
            traits.push('Thinking');
        } else {
            traits.push('Feeling');
        }
        
        if (Math.abs(scores.J) > Math.abs(scores.P)) {
            traits.push('Judging');
        } else {
            traits.push('Perceiving');
        }
        
        return traits;
    }

    // Calculate balance score
    calculateBalanceScore(scores) {
        const total = Math.abs(scores.E) + Math.abs(scores.I) + Math.abs(scores.S) + 
                     Math.abs(scores.N) + Math.abs(scores.T) + Math.abs(scores.F) + 
                     Math.abs(scores.J) + Math.abs(scores.P);
        
        return total / 8;
    }

    // Calculate preference strength
    calculatePreferenceStrength(scores) {
        const preferences = [
            Math.abs(scores.E - scores.I),
            Math.abs(scores.S - scores.N),
            Math.abs(scores.T - scores.F),
            Math.abs(scores.J - scores.P)
        ];
        
        return preferences.reduce((sum, pref) => sum + pref, 0) / preferences.length;
    }

    // Clear all charts
    clearCharts() {
        const chartIds = ['radarChart', 'barChart', 'balanceChart', 'pieChart', 'timelineChart', 'strengthsChart'];
        
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    // Track events with Firebase Analytics
    trackEvent(eventName, parameters = {}) {
        try {
            // Add default parameters
            const enhancedParameters = {
                ...parameters,
                quiz_type: stateManager.getCurrentQuizType(),
                timestamp: new Date().toISOString()
            };
            
            // Log to Firebase Analytics
            firebaseAnalytics.logEvent(eventName, enhancedParameters);
            
            } catch (error) {
            logger.warn('Failed to track event:', error);
        }
    }

    // Track quiz completion
    trackQuizCompletion(results) {
        this.trackEvent('quiz_completed', {
            personality_type: results.personalityType,
            total_questions: results.totalQuestions || 0,
            completion_time: results.completionTime || 0
        });
    }

    // Track user interaction
    trackUserInteraction(action, details = {}) {
        this.trackEvent('user_interaction', {
            action,
            ...details
        });
    }
}

// Export singleton instance
export const analyticsEngine = new AnalyticsEngine(); 