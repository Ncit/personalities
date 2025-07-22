/**
 * UI Manager - Handles all DOM manipulation and UI updates
 * Centralizes UI logic and provides a clean interface for UI operations
 */
import { stateManager } from '../core/StateManager.js';
import { quizEngine } from '../quiz/QuizEngine.js';

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
        } catch (error) {
            console.error('Error in nextQuestion:', error);
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

    // Development function to clear localStorage
    clearLocalStorage() {
        if (stateManager.isDevelopment()) {
            const confirmed = confirm('Are you sure you want to clear all localStorage data? This will reset the application state.');
            if (confirmed) {
                localStorage.clear();
                this.showSuccess('localStorage cleared successfully!');
                // Refresh the page to reset all state
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        } else {
            console.warn('clearLocalStorage called in non-development mode');
        }
    }
}

// Export singleton instance
export const uiManager = new UIManager(); 