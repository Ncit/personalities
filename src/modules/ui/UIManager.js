/**
 * UI Manager - Handles all DOM manipulation and UI updates
 * Centralizes UI logic and provides a clean interface for UI operations
 */
import { stateManager } from '../core/StateManager.js';
import { quizEngine } from '../quiz/QuizEngine.js';
import { LoggerManager } from '../core/LoggerManager.js';

// Initialize logger for this module
const logger = new LoggerManager().createModuleLogger('UIManager');

export class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.bindEvents();
        this.initializeUI();
    }

    cacheElements() {
        return {
            // Screens
            welcomeScreen: document.getElementById('welcomeScreen'),
            quizScreen: document.getElementById('quizQuestions'),
            resultsScreen: document.getElementById('resultsScreen'),
            
            // Quiz elements
            questionText: document.getElementById('questionText'),
            options: [
                document.getElementById('option1'),
                document.getElementById('option2'),
                document.getElementById('option3'),
                document.getElementById('option4')
            ],
            progressFill: document.getElementById('progressFill'),
            questionCounter: document.getElementById('questionCounter'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            
            // Adaptive indicators
            adaptiveIndicators: document.getElementById('adaptiveIndicators'),
            confidenceEI: document.getElementById('confidenceEI'),
            confidenceSN: document.getElementById('confidenceSN'),
            confidenceTF: document.getElementById('confidenceTF'),
            confidenceJP: document.getElementById('confidenceJP'),
            confidenceEIText: document.getElementById('confidenceEIText'),
            confidenceSNText: document.getElementById('confidenceSNText'),
            confidenceTFText: document.getElementById('confidenceTFText'),
            confidenceJPText: document.getElementById('confidenceJPText'),
            adaptiveStatus: document.getElementById('adaptiveStatus'),
            estimatedTime: document.getElementById('estimatedTime'),

            overallConfidence: document.getElementById('overallConfidence'),
            
            // Results elements
            personalityType: document.getElementById('personalityType'),
            personalityCard: document.getElementById('personalityCard'),
            personalityTitle: document.getElementById('personalityTitle'),
            personalitySubtitle: document.getElementById('personalitySubtitle'),
            personalityDescription: document.getElementById('personalityDescription'),
            personalityTraits: document.getElementById('personalityTraits'),
            
            // Modals
            typesModal: document.getElementById('typesModal'),
            premiumModal: document.getElementById('premiumModal'),
            exitQuizModal: document.getElementById('exitQuizModal'),
            subscriptionModal: document.getElementById('subscriptionModal'),
            
            // Buttons
            startQuizBtn: document.querySelector('[onclick="startQuiz()"]'),
            viewLastResultsBtn: document.getElementById('viewLastResultsBtn'),
            premiumQuizTypes: document.getElementById('premiumQuizTypes'),
            
            // State elements
            headerPremiumBtn: document.getElementById('headerPremiumBtn')
        };
    }

    bindEvents() {
        // Quiz navigation
        this.elements.prevBtn?.addEventListener('click', () => this.previousQuestion());
        this.elements.nextBtn?.addEventListener('click', () => this.nextQuestion());
        
        // Option selection
        this.elements.options.forEach((option, index) => {
            option?.addEventListener('click', () => this.selectOption(index + 1));
        });
        
        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // State management subscriptions
        stateManager.subscribe('currentScreen', (screen) => this.showScreen(screen));
        stateManager.subscribe('isPremium', (isPremium) => this.updatePremiumUI(isPremium));
        stateManager.subscribe('modals', (modals) => this.updateModals(modals));
    }

    initializeUI() {
        this.updatePremiumUI(stateManager.isPremium());
        this.showScreen(stateManager.get('currentScreen'));
    }

    // Screen management
    showScreen(screen) {
        // Hide all screens
        this.elements.welcomeScreen.style.display = 'none';
        this.elements.quizScreen.style.display = 'none';
        this.elements.resultsScreen.style.display = 'none';

        // Show requested screen
        switch (screen) {
            case 'welcome':
                this.elements.welcomeScreen.style.display = 'flex';
                break;
            case 'quiz':
                this.elements.quizScreen.style.display = 'flex';
                this.displayCurrentQuestion();
                break;
            case 'results':
                this.elements.resultsScreen.style.display = 'flex';
                this.displayResults();
                break;
        }
    }

    // Quiz UI methods
    displayCurrentQuestion() {
        const question = quizEngine.getCurrentQuestion();
        if (!question) return;

        // Update question text
        this.elements.questionText.textContent = question.question;

        // Update options
        question.options.forEach((option, index) => {
            if (this.elements.options[index]) {
                this.elements.options[index].textContent = option;
            }
        });

        // Update progress
        const progress = quizEngine.getProgress();
        this.elements.progressFill.style.width = `${progress.percentage}%`;
        this.elements.questionCounter.textContent = `${progress.current} / ${progress.total}`;

        // Update navigation buttons
        this.elements.prevBtn.disabled = !quizEngine.canGoPrevious();
        this.elements.nextBtn.disabled = !quizEngine.canGoNext();

        // Update adaptive indicators
        this.updateAllAdaptiveIndicators();

        // Clear option selection
        this.clearOptionSelection();
    }

    selectOption(optionIndex) {
        // Clear previous selection
        this.clearOptionSelection();

        // Select new option
        this.elements.options[optionIndex - 1].classList.add('selected');
        
        // Update quiz engine
        quizEngine.selectOption(optionIndex);
        
        // Enable next button
        this.elements.nextBtn.disabled = false;
    }

    clearOptionSelection() {
        this.elements.options.forEach(option => {
            option.classList.remove('selected');
        });
    }

    nextQuestion() {
        try {
            const result = quizEngine.nextQuestion();
            if (result) {
                // Quiz completed
                this.displayResults();
            } else {
                // Show next question
                this.displayCurrentQuestion();
            }
            
            // Update adaptive indicators after question change
            this.updateAllAdaptiveIndicators();
        } catch (error) {
            logger.error('Error in nextQuestion:', error);
            this.showError('Please select an option before continuing.');
        }
    }

    previousQuestion() {
        const question = quizEngine.previousQuestion();
        if (question) {
            this.displayCurrentQuestion();
        }
    }

    // Results display
    async displayResults() {
        const results = stateManager.getLastResults();
        if (!results) return;

        const { MBTI_TYPES } = await import('../../data/QuizData.ru.js');
        const personalityData = MBTI_TYPES[results.personalityType];

        // Update personality type
        this.elements.personalityType.textContent = results.personalityType;

        // Update personality card
        this.elements.personalityTitle.textContent = personalityData.title;
        this.elements.personalitySubtitle.textContent = personalityData.subtitle;
        this.elements.personalityDescription.textContent = personalityData.description;

        // Update traits
        this.elements.personalityTraits.innerHTML = personalityData.traits
            .map(trait => `<span class="trait">${trait}</span>`)
            .join('');

        // Update dimension breakdown
        this.updateDimensionBreakdown(results.dimensionBreakdown);

        // Show premium content if applicable
        if (stateManager.isPremium()) {
            this.showPremiumContent(results.personalityType);
        }
    }

    updateDimensionBreakdown(breakdown) {
        Object.entries(breakdown).forEach(([dimension, data]) => {
            const barElement = document.getElementById(`${dimension.toLowerCase()}Bar`);
            if (barElement) {
                const percentage = data[data.preference];
                barElement.style.width = `${percentage}%`;
            }
        });
    }

    showPremiumContent(personalityType) {
        // Show premium sections
        const premiumSections = document.querySelectorAll('.premium-content');
        premiumSections.forEach(section => {
            section.style.display = 'block';
        });

        // Hide premium overlays
        const premiumOverlays = document.querySelectorAll('.premium-overlay');
        premiumOverlays.forEach(overlay => {
            overlay.style.display = 'none';
        });
    }

    // Modal management
    openModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        if (modal) {
            modal.style.display = 'flex';
            stateManager.openModal(modalName);
            
            // Special handling for types modal
            if (modalName === 'types') {
                this.populateTypesModal();
            }
        }
    }

    closeModal(modalName) {
        const modal = document.getElementById(`${modalName}Modal`);
        if (modal) {
            modal.style.display = 'none';
            stateManager.closeModal(modalName);
        }
    }

    updateModals(modals) {
        Object.entries(modals).forEach(([modalName, isOpen]) => {
            const modal = document.getElementById(`${modalName}Modal`);
            if (modal) {
                modal.style.display = isOpen ? 'flex' : 'none';
            }
        });
    }

    // Premium UI updates
    updatePremiumUI(isPremium) {
        // Update premium button
        if (this.elements.headerPremiumBtn) {
            this.elements.headerPremiumBtn.style.display = isPremium ? 'none' : 'block';
        }

        // Hide all premium buttons if user is premium
        document.querySelectorAll('.btn-premium').forEach(btn => {
            if (isPremium) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-block';
            }
        });

        // Update premium quiz types
        if (this.elements.premiumQuizTypes) {
            this.elements.premiumQuizTypes.style.display = isPremium ? 'block' : 'none';
        }

        // Update premium content visibility
        const premiumContent = document.querySelectorAll('.premium-content');
        const premiumOverlays = document.querySelectorAll('.premium-overlay');

        if (isPremium) {
            premiumContent.forEach(content => content.style.display = 'block');
            premiumOverlays.forEach(overlay => overlay.style.display = 'none');
        } else {
            premiumContent.forEach(content => content.style.display = 'none');
            premiumOverlays.forEach(overlay => overlay.style.display = 'flex');
        }
    }

    // Error handling
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showSuccess(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Loading states
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        
        document.body.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingDiv = document.querySelector('.loading-overlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Utility methods
    updateQuizDescription() {
        const quizInfo = quizEngine.getQuizInfo();
        const isPremium = stateManager.isPremium();
        
        const questionCount = isPremium ? quizInfo.questionCount.premium : quizInfo.questionCount.free;
        const description = document.getElementById('quizDescription');
        
        if (description) {
            description.innerHTML = `This quiz will help you discover your ${quizInfo.name}. The assessment consists of <span id="questionCount">${questionCount}</span> questions that will evaluate your preferences across four dimensions:`;
        }
    }

    // Development tools
    showDevTools() {
        if (stateManager.isDevelopment()) {
            const devTools = document.querySelectorAll('.dev-tools');
            devTools.forEach(tool => {
                tool.style.display = 'block';
            });
        }
    }

    hideDevTools() {
        const devTools = document.querySelectorAll('.dev-tools');
        devTools.forEach(tool => {
            tool.style.display = 'none';
        });
    }

    // Enhanced Types Modal Methods
    populateTypesModal() {
        const typesList = document.getElementById('typesList');
        if (!typesList) return;

        // Clear existing content
        typesList.innerHTML = '';

        // Get MBTI types data
        const mbtiTypes = this.getMBTITypes();
        
        // Add each personality type with enhanced structure
        Object.entries(mbtiTypes).forEach(([type, data]) => {
            const typeCard = document.createElement('div');
            typeCard.className = `type-card ${this.getTypeCategory(type)}`;
            typeCard.innerHTML = `
                <div class="type-header">
                    <div class="type-icon ${this.getTypeCategory(type)}">
                        ${this.getTypeIcon(type)}
                    </div>
                    <div class="type-info">
                        <div class="type-code">${type}</div>
                        <div class="type-title">${data.title}</div>
                        <div class="type-subtitle">${data.subtitle}</div>
                    </div>
                </div>
                <div class="type-description">${data.description}</div>
                <div class="type-traits">
                    ${this.getTypeTraits(type).map(trait => `<span class="type-trait">${trait}</span>`).join('')}
                </div>
                <div class="type-stats">
                    <div class="type-stat">
                        <span class="type-stat-value">${this.getTypePercentage(type)}%</span>
                        <span class="type-stat-label">${localizationManager.get('types.population')}</span>
                    </div>
                    <div class="type-stat">
                        <span class="type-stat-value">${this.getTypeCompatibility(type)}</span>
                        <span class="type-stat-label">${localizationManager.get('types.compatibility')}</span>
                    </div>
                </div>
            `;
            typesList.appendChild(typeCard);
        });

        // Setup filter functionality
        this.setupTypeFilters();
    }

    getMBTITypes() {
        const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
        const result = {};
        types.forEach(type => {
            result[type] = localizationManager.get(`types.${type}`);
        });
        return result;
    }

    getTypeCategory(type) {
        const categories = {
            'INTJ': 'analysts', 'INTP': 'analysts', 'ENTJ': 'analysts', 'ENTP': 'analysts',
            'INFJ': 'diplomats', 'INFP': 'diplomats', 'ENFJ': 'diplomats', 'ENFP': 'diplomats',
            'ISTJ': 'sentinels', 'ISFJ': 'sentinels', 'ESTJ': 'sentinels', 'ESFJ': 'sentinels',
            'ISTP': 'explorers', 'ISFP': 'explorers', 'ESTP': 'explorers', 'ESFP': 'explorers'
        };
        return categories[type] || 'analysts';
    }

    getTypeIcon(type) {
        const icons = {
            'INTJ': '<i class="fas fa-chess-king"></i>',
            'INTP': '<i class="fas fa-microscope"></i>',
            'ENTJ': '<i class="fas fa-crown"></i>',
            'ENTP': '<i class="fas fa-lightbulb"></i>',
            'INFJ': '<i class="fas fa-moon"></i>',
            'INFP': '<i class="fas fa-heart"></i>',
            'ENFJ': '<i class="fas fa-star"></i>',
            'ENFP': '<i class="fas fa-sun"></i>',
            'ISTJ': '<i class="fas fa-shield-alt"></i>',
            'ISFJ': '<i class="fas fa-hands-helping"></i>',
            'ESTJ': '<i class="fas fa-gavel"></i>',
            'ESFJ': '<i class="fas fa-users"></i>',
            'ISTP': '<i class="fas fa-tools"></i>',
            'ISFP': '<i class="fas fa-palette"></i>',
            'ESTP': '<i class="fas fa-fire"></i>',
            'ESFP': '<i class="fas fa-music"></i>'
        };
        return icons[type] || '<i class="fas fa-user"></i>';
    }

    getTypeTraits(type) {
        return localizationManager.get(`types.traits.${type}`) || localizationManager.get('types.traits.default');
    }

    getTypePercentage(type) {
        const percentages = {
            'INTJ': 2, 'INTP': 3, 'ENTJ': 2, 'ENTP': 3,
            'INFJ': 1, 'INFP': 4, 'ENFJ': 2, 'ENFP': 8,
            'ISTJ': 12, 'ISFJ': 14, 'ESTJ': 9, 'ESFJ': 12,
            'ISTP': 5, 'ISFP': 9, 'ESTP': 4, 'ESFP': 8
        };
        return percentages[type] || 6;
    }

    getTypeCompatibility(type) {
        const compatibility = {
            'INTJ': 'INTJ, INTP, ENTJ',
            'INTP': 'INTJ, INTP, ENTP',
            'ENTJ': 'INTJ, ENTJ, ENTP',
            'ENTP': 'INTP, ENTJ, ENTP',
            'INFJ': 'INFJ, INFP, ENFJ',
            'INFP': 'INFJ, INFP, ENFP',
            'ENFJ': 'INFJ, ENFJ, ENFP',
            'ENFP': 'INFP, ENFJ, ENFP',
            'ISTJ': 'ISTJ, ISFJ, ESTJ',
            'ISFJ': 'ISTJ, ISFJ, ESFJ',
            'ESTJ': 'ISTJ, ESTJ, ESFJ',
            'ESFJ': 'ISFJ, ESTJ, ESFJ',
            'ISTP': 'ISTP, ISFP, ESTP',
            'ISFP': 'ISTP, ISFP, ESFP',
            'ESTP': 'ISTP, ESTP, ESFP',
            'ESFP': 'ISFP, ESTP, ESFP'
        };
        return compatibility[type] || localizationManager.get('types.allTypes');
    }

    setupTypeFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const typeCards = document.querySelectorAll('.type-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                typeCards.forEach(card => {
                    if (filter === 'all' || card.classList.contains(filter)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.3s ease-in';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // ADAPTIVE ASSESSMENT INDICATORS
    // ========================================

    /**
     * Show adaptive indicators
     */
    showAdaptiveIndicators() {
        if (this.elements.adaptiveIndicators) {
            this.elements.adaptiveIndicators.style.display = 'block';
            this.updateAdaptiveStatus('active', localizationManager.get('adaptive.learning'));
        }
    }

    /**
     * Hide adaptive indicators
     */
    hideAdaptiveIndicators() {
        if (this.elements.adaptiveIndicators) {
            this.elements.adaptiveIndicators.style.display = 'none';
        }
    }

    /**
     * Update adaptive status
     */
    updateAdaptiveStatus(status, text) {
        if (this.elements.adaptiveStatus) {
            const statusDot = this.elements.adaptiveStatus.querySelector('.status-dot');
            const statusText = this.elements.adaptiveStatus.querySelector('.status-text');
            
            if (statusDot) {
                statusDot.className = `status-dot ${status}`;
            }
            
            if (statusText) {
                statusText.textContent = text;
            }
        }
    }

    /**
     * Update confidence bars for all dimensions
     */
    updateConfidenceBars(confidenceScores) {
        if (!confidenceScores) return;

        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        dimensions.forEach(dimension => {
            this.updateConfidenceBar(dimension, confidenceScores[dimension] || 0);
        });
    }

    /**
     * Update individual confidence bar
     */
    updateConfidenceBar(dimension, confidence) {
        const confidenceElement = this.elements[`confidence${dimension}`];
        const confidenceTextElement = this.elements[`confidence${dimension}Text`];
        
        if (confidenceElement && confidenceTextElement) {
            // Update bar width
            const percentage = Math.round(confidence * 100);
            confidenceElement.style.width = `${percentage}%`;
            
            // Update text
            confidenceTextElement.textContent = `${percentage}%`;
            
            // Update confidence level and color
            let confidenceLevel = 'low';
            if (confidence >= 0.9) confidenceLevel = 'excellent';
            else if (confidence >= 0.8) confidenceLevel = 'high';
            else if (confidence >= 0.6) confidenceLevel = 'medium';
            
            confidenceElement.setAttribute('data-confidence', confidenceLevel);
        }
    }

    /**
     * Update adaptive metrics
     */
    updateAdaptiveMetrics(metrics) {
        if (!metrics) return;

        // Update estimated time
        if (this.elements.estimatedTime && metrics.estimatedTime) {
            this.elements.estimatedTime.textContent = metrics.estimatedTime;
        }



        // Update overall confidence
        if (this.elements.overallConfidence && metrics.overallConfidence !== undefined) {
            const percentage = Math.round(metrics.overallConfidence * 100);
            this.elements.overallConfidence.textContent = `${percentage}%`;
        }
    }

    /**
     * Calculate and update all adaptive indicators
     */
    updateAllAdaptiveIndicators() {
        try {
            // Get adaptive status from quiz engine
            const adaptiveStatus = quizEngine.getAdaptiveModeStatus();
            
            if (adaptiveStatus && adaptiveStatus.active) {
                this.showAdaptiveIndicators();
                
                // Get current confidence scores
                const confidenceScores = quizEngine.getCurrentConfidence();
                if (confidenceScores) {
                    this.updateConfidenceBars(confidenceScores);
                }
                
                // Get adaptive metrics
                const metrics = this.calculateAdaptiveMetrics();
                this.updateAdaptiveMetrics(metrics);
                
                // Update status based on progress
                this.updateAdaptiveStatusBasedOnProgress();
            } else {
                this.hideAdaptiveIndicators();
            }
        } catch (error) {
            console.warn('Failed to update adaptive indicators:', error);
            this.hideAdaptiveIndicators();
        }
    }

    /**
     * Calculate adaptive metrics
     */
    calculateAdaptiveMetrics() {
        try {
            const progress = quizEngine.getProgress();
            const totalQuestions = progress.total;
            const currentQuestion = progress.current;
            const isAdaptive = progress.isAdaptive;
            
            if (!isAdaptive) return null;


            
            // Calculate questions saved (if adaptive mode is active)

            
            // Calculate overall confidence (average of all dimensions)
            const confidenceScores = quizEngine.getCurrentConfidence();
            let overallConfidence = 0;
            if (confidenceScores) {
                const values = Object.values(confidenceScores);
                overallConfidence = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
            
            return {
                overallConfidence: overallConfidence
            };
        } catch (error) {
            console.warn('Failed to calculate adaptive metrics:', error);
            return null;
        }
    }

    /**
     * Update adaptive status based on quiz progress
     */
    updateAdaptiveStatusBasedOnProgress() {
        try {
            const progress = quizEngine.getProgress();
            const confidence = progress.confidence;
            
            if (confidence) {
                const avgConfidence = Object.values(confidence).reduce((sum, val) => sum + val, 0) / Object.values(confidence).length;
                
                if (avgConfidence >= 0.9) {
                    this.updateAdaptiveStatus('optimizing', localizationManager.get('adaptive.optimizing'));
                } else if (avgConfidence >= 0.7) {
                    this.updateAdaptiveStatus('learning', localizationManager.get('adaptive.continuing'));
                } else {
                    this.updateAdaptiveStatus('active', localizationManager.get('adaptive.learning'));
                }
            }
        } catch (error) {
            console.warn('Failed to update adaptive status:', error);
        }
    }
}

// Export singleton instance
export const uiManager = new UIManager(); 