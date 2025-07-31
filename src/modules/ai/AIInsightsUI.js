/**
 * AI Insights UI Component
 * Displays personalized AI-generated insights in an interactive and attractive interface
 */

import { LoggerManager } from '../core/LoggerManager.js';
import { aiInsightsEngine } from './AIInsightsEngine.js';

export class AIInsightsUI {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('AIInsightsUI');
        this.currentInsights = null;
        this.isLoading = false;
        this.activeCategory = 'overview';
        
        this.categories = {
            overview: { icon: 'fas fa-chart-line', title: 'Overview', color: '#667eea' },
            career: { icon: 'fas fa-briefcase', title: 'Career', color: '#4CAF50' },
            communication: { icon: 'fas fa-comments', title: 'Communication', color: '#FF9800' },
            leadership: { icon: 'fas fa-crown', title: 'Leadership', color: '#9C27B0' },
            development: { icon: 'fas fa-lightbulb', title: 'Development', color: '#2196F3' },
            relationships: { icon: 'fas fa-heart', title: 'Relationships', color: '#E91E63' },
            stress: { icon: 'fas fa-brain', title: 'Stress Management', color: '#607D8B' },
            learning: { icon: 'fas fa-graduation-cap', title: 'Learning', color: '#795548' },
            teamwork: { icon: 'fas fa-users', title: 'Teamwork', color: '#00BCD4' }
        };
    }

    /**
     * Initialize AI Insights UI
     */
    async init() {
        try {
            this.logger.log('Initializing AI Insights UI');
            this.createInsightsContainer();
            this.bindEvents();
            this.logger.log('AI Insights UI initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing AI Insights UI:', error);
        }
    }

    /**
     * Create insights container in the DOM
     */
    createInsightsContainer() {
        // Check if container already exists
        if (document.getElementById('ai-insights-container')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'ai-insights-container';
        container.className = 'ai-insights-container';
        container.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            overflow-y: auto;
            font-family: 'Inter', sans-serif;
        `;

        container.innerHTML = `
            <div class="ai-insights-modal">
                <div class="ai-insights-header">
                    <div class="ai-insights-title">
                        <i class="fas fa-robot"></i>
                        <h2>AI-Powered Personal Insights</h2>
                    </div>
                    <button class="ai-insights-close" onclick="window.aiInsightsUI.closeInsights()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="ai-insights-content">
                    <div class="ai-insights-sidebar">
                        <div class="ai-insights-categories"></div>
                        <div class="ai-insights-status">
                            <div class="ai-status-indicator">
                                <i class="fas fa-circle"></i>
                                <span class="ai-status-text">AI Ready</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-insights-main">
                        <div class="ai-insights-loading" style="display: none;">
                            <div class="loading-spinner">
                                <i class="fas fa-brain"></i>
                            </div>
                            <p>Generating personalized insights...</p>
                        </div>
                        
                        <div class="ai-insights-display"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.addStyles();
    }

    /**
     * Add CSS styles for AI insights
     */
    addStyles() {
        const styleId = 'ai-insights-styles';
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .ai-insights-modal {
                background: white;
                border-radius: 16px;
                margin: 20px auto;
                max-width: 1200px;
                max-height: calc(100vh - 40px);
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: ai-insights-slide-in 0.3s ease-out;
            }

            @keyframes ai-insights-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .ai-insights-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 32px;
                border-bottom: 1px solid #e0e0e0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 16px 16px 0 0;
            }

            .ai-insights-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ai-insights-title h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }

            .ai-insights-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .ai-insights-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .ai-insights-content {
                display: flex;
                flex: 1;
                min-height: 600px;
            }

            .ai-insights-sidebar {
                width: 280px;
                background: #f8f9fa;
                border-right: 1px solid #e0e0e0;
                display: flex;
                flex-direction: column;
            }

            .ai-insights-categories {
                flex: 1;
                padding: 20px 0;
            }

            .ai-category-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 24px;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 4px solid transparent;
            }

            .ai-category-item:hover {
                background: #e3f2fd;
            }

            .ai-category-item.active {
                background: #e3f2fd;
                border-left-color: #2196F3;
            }

            .ai-category-item i {
                width: 20px;
                text-align: center;
                color: #666;
            }

            .ai-category-item.active i {
                color: #2196F3;
            }

            .ai-category-title {
                font-weight: 500;
                color: #333;
            }

            .ai-insights-status {
                padding: 20px 24px;
                border-top: 1px solid #e0e0e0;
            }

            .ai-status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;
            }

            .ai-status-indicator i {
                color: #4CAF50;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .ai-insights-main {
                flex: 1;
                padding: 32px;
                overflow-y: auto;
            }

            .ai-insights-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 400px;
                text-align: center;
            }

            .loading-spinner {
                width: 80px;
                height: 80px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loading-spinner i {
                color: #667eea;
                font-size: 24px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .ai-insights-display {
                display: none;
            }

            .ai-insight-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #667eea;
            }

            .ai-insight-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .ai-insight-header i {
                font-size: 24px;
                color: #667eea;
            }

            .ai-insight-title {
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }

            .ai-insight-content {
                color: #666;
                line-height: 1.6;
            }

            .ai-insight-list {
                list-style: none;
                padding: 0;
                margin: 16px 0;
            }

            .ai-insight-list li {
                padding: 8px 0;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .ai-insight-list li:last-child {
                border-bottom: none;
            }

            .ai-insight-list li i {
                color: #4CAF50;
                font-size: 12px;
            }

            .ai-insight-source {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #f0f0f0;
                font-size: 12px;
                color: #999;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .ai-insight-source i {
                color: #667eea;
            }

            .ai-overview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }

            .ai-overview-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
            }

            .ai-overview-card h3 {
                margin: 0 0 8px 0;
                font-size: 18px;
            }

            .ai-overview-card p {
                margin: 0;
                opacity: 0.9;
            }

            @media (max-width: 768px) {
                .ai-insights-modal {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .ai-insights-content {
                    flex-direction: column;
                }

                .ai-insights-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid #e0e0e0;
                }

                .ai-insights-categories {
                    display: flex;
                    overflow-x: auto;
                    padding: 16px;
                }

                .ai-category-item {
                    flex-shrink: 0;
                    padding: 12px 16px;
                    border-left: none;
                    border-bottom: 3px solid transparent;
                }

                .ai-category-item.active {
                    border-left: none;
                    border-bottom-color: #2196F3;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close on outside click
        document.getElementById('ai-insights-container').addEventListener('click', (e) => {
            if (e.target.id === 'ai-insights-container') {
                this.closeInsights();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.closeInsights();
            }
        });
    }

    /**
     * Show AI insights
     */
    async showInsights() {
        try {
            this.logger.log('Showing AI insights');
            
            const container = document.getElementById('ai-insights-container');
            container.style.display = 'block';
            
            this.renderCategories();
            await this.loadInsights();
            
        } catch (error) {
            this.logger.error('Error showing AI insights:', error);
        }
    }

    /**
     * Close AI insights
     */
    closeInsights() {
        const container = document.getElementById('ai-insights-container');
        container.style.display = 'none';
        this.logger.log('AI insights closed');
    }

    /**
     * Check if insights are visible
     */
    isVisible() {
        const container = document.getElementById('ai-insights-container');
        return container.style.display === 'block';
    }

    /**
     * Render category navigation
     */
    renderCategories() {
        const categoriesContainer = document.querySelector('.ai-insights-categories');
        
        categoriesContainer.innerHTML = Object.entries(this.categories)
            .map(([key, category]) => `
                <div class="ai-category-item ${key === this.activeCategory ? 'active' : ''}" 
                     data-category="${key}" onclick="window.aiInsightsUI.switchCategory('${key}')">
                    <i class="${category.icon}"></i>
                    <span class="ai-category-title">${category.title}</span>
                </div>
            `).join('');
    }

    /**
     * Switch to different category
     */
    switchCategory(category) {
        this.activeCategory = category;
        this.renderCategories();
        this.renderInsights();
    }

    /**
     * Load insights from AI engine
     */
    async loadInsights() {
        try {
            this.setLoading(true);
            this.updateStatus('Generating insights...', 'loading');
            
            this.currentInsights = await aiInsightsEngine.generatePersonalizedInsights();
            
            this.setLoading(false);
            this.updateStatus('AI Ready', 'ready');
            this.renderInsights();
            
        } catch (error) {
            this.logger.error('Error loading insights:', error);
            this.setLoading(false);
            this.updateStatus('Error loading insights', 'error');
        }
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        const loadingEl = document.querySelector('.ai-insights-loading');
        const displayEl = document.querySelector('.ai-insights-display');
        
        if (loading) {
            loadingEl.style.display = 'flex';
            displayEl.style.display = 'none';
        } else {
            loadingEl.style.display = 'none';
            displayEl.style.display = 'block';
        }
    }

    /**
     * Update status indicator
     */
    updateStatus(text, type = 'ready') {
        const statusEl = document.querySelector('.ai-status-text');
        const iconEl = document.querySelector('.ai-status-indicator i');
        
        statusEl.textContent = text;
        
        // Update icon color based on status
        iconEl.style.color = {
            ready: '#4CAF50',
            loading: '#FF9800',
            error: '#F44336'
        }[type] || '#4CAF50';
    }

    /**
     * Render insights content
     */
    renderInsights() {
        if (!this.currentInsights) {
            return;
        }

        const displayEl = document.querySelector('.ai-insights-display');
        
        if (this.activeCategory === 'overview') {
            displayEl.innerHTML = this.renderOverview();
        } else {
            displayEl.innerHTML = this.renderCategoryInsight(this.activeCategory);
        }
    }

    /**
     * Render overview page
     */
    renderOverview() {
        const { personality_type, source, generated_at } = this.currentInsights;
        
        return `
            <div class="ai-overview-grid">
                <div class="ai-overview-card">
                    <h3>Personality Type</h3>
                    <p>${personality_type}</p>
                </div>
                <div class="ai-overview-card">
                    <h3>Career Matches</h3>
                    <p>${this.currentInsights.career_recommendations.length} recommendations</p>
                </div>
                <div class="ai-overview-card">
                    <h3>Development Areas</h3>
                    <p>${this.currentInsights.personal_development.length} suggestions</p>
                </div>
                <div class="ai-overview-card">
                    <h3>Stress Strategies</h3>
                    <p>${this.currentInsights.stress_management.length} techniques</p>
                </div>
            </div>
            
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <i class="fas fa-chart-line"></i>
                    <h3 class="ai-insight-title">Quick Insights Summary</h3>
                </div>
                <div class="ai-insight-content">
                    <p><strong>Communication Style:</strong> ${this.currentInsights.communication_insights}</p>
                    <p><strong>Leadership Approach:</strong> ${this.currentInsights.leadership_approach}</p>
                    <p><strong>Learning Style:</strong> ${this.currentInsights.learning_style}</p>
                    <p><strong>Team Collaboration:</strong> ${this.currentInsights.team_collaboration}</p>
                </div>
                <div class="ai-insight-source">
                    <i class="fas fa-robot"></i>
                    <span>Generated by AI • ${source} • ${new Date(generated_at).toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render specific category insight
     */
    renderCategoryInsight(category) {
        const categoryData = this.categories[category];
        const insightData = this.currentInsights[this.getInsightKey(category)];
        
        if (!insightData) {
            return `
                <div class="ai-insight-card">
                    <div class="ai-insight-header">
                        <i class="${categoryData.icon}"></i>
                        <h3 class="ai-insight-title">${categoryData.title} Insights</h3>
                    </div>
                    <div class="ai-insight-content">
                        <p>No insights available for this category.</p>
                    </div>
                </div>
            `;
        }

        let content = '';
        
        if (Array.isArray(insightData)) {
            content = `
                <ul class="ai-insight-list">
                    ${insightData.map(item => `
                        <li><i class="fas fa-check"></i>${item}</li>
                    `).join('')}
                </ul>
            `;
        } else {
            content = `<p>${insightData}</p>`;
        }

        return `
            <div class="ai-insight-card">
                <div class="ai-insight-header">
                    <i class="${categoryData.icon}"></i>
                    <h3 class="ai-insight-title">${categoryData.title} Insights</h3>
                </div>
                <div class="ai-insight-content">
                    ${content}
                </div>
                <div class="ai-insight-source">
                    <i class="fas fa-robot"></i>
                    <span>Generated by AI • ${this.currentInsights.source} • ${new Date(this.currentInsights.generated_at).toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    /**
     * Get insight key for category
     */
    getInsightKey(category) {
        const keyMap = {
            career: 'career_recommendations',
            communication: 'communication_insights',
            leadership: 'leadership_approach',
            development: 'personal_development',
            relationships: 'relationship_dynamics',
            stress: 'stress_management',
            learning: 'learning_style',
            teamwork: 'team_collaboration'
        };
        
        return keyMap[category] || category;
    }

    /**
     * Refresh insights
     */
    async refreshInsights() {
        this.currentInsights = null;
        await this.loadInsights();
    }
}

// Create global instance
window.aiInsightsUI = new AIInsightsUI(); 