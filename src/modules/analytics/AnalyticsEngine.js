/**
 * Analytics Engine - Handles data visualization and analytics
 * Manages chart generation, data analysis, and visual reporting
 */
import { stateManager } from '../core/StateManager.js';

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
    }

    // Radar Chart
    createRadarChart(E, S, T, J) {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.radar;
        
        // Set canvas size
        canvas.width = config.width;
        canvas.height = config.height;
        
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Draw background circles
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius * i) / 4, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw axes
        const dimensions = ['E', 'S', 'T', 'J'];
        dimensions.forEach((dim, index) => {
            const angle = (index * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw dimension labels
            ctx.fillStyle = '#333';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(dim, x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
        });
        
        // Calculate scores
        const scores = [E, S, T, J];
        const maxScore = Math.max(...scores.map(Math.abs));
        const normalizedScores = scores.map(score => (score / maxScore) * radius);
        
        // Draw radar polygon
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
        
        // Fill polygon
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.fill();
        
        // Stroke polygon
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw data points
        normalizedScores.forEach((score, index) => {
            const angle = (index * Math.PI) / 2;
            const x = centerX + Math.cos(angle) * score;
            const y = centerY + Math.sin(angle) * score;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#667eea';
            ctx.fill();
        });
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

    // Timeline Chart
    createTimelineChart() {
        const canvas = document.getElementById('timelineChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.chartConfigs.timeline;
        
        canvas.width = config.width;
        canvas.height = config.height;
        
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Draw timeline
        ctx.beginPath();
        ctx.moveTo(20, config.height / 2);
        ctx.lineTo(config.width - 20, config.height / 2);
        ctx.strokeStyle = config.colors[0];
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw milestones
        const milestones = [
            { x: 50, label: 'Start', color: config.colors[0] },
            { x: 150, label: '25%', color: config.colors[1] },
            { x: 250, label: '50%', color: config.colors[0] },
            { x: 350, label: 'Complete', color: config.colors[1] }
        ];
        
        milestones.forEach(milestone => {
            // Draw point
            ctx.beginPath();
            ctx.arc(milestone.x, config.height / 2, 8, 0, 2 * Math.PI);
            ctx.fillStyle = milestone.color;
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(milestone.label, milestone.x, config.height / 2 + 25);
        });
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
}

// Export singleton instance
export const analyticsEngine = new AnalyticsEngine(); 