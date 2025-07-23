/**
 * Analytics Engine - Handles data visualization and analytics
 * Manages chart generation, data analysis, and visual reporting
 */
import { stateManager } from '../core/StateManager.js';
import { firebaseAnalytics } from '../../config/firebase.js';

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
            console.warn('No results data provided for analytics');
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
            
            console.log('Event tracked:', eventName, enhancedParameters);
        } catch (error) {
            console.warn('Failed to track event:', error);
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