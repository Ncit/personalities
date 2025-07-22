/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */
import { stateManager } from './modules/core/StateManager.js';
import { quizEngine } from './modules/quiz/QuizEngine.js';
import { uiManager } from './modules/ui/UIManager.js';
import { analyticsEngine } from './modules/analytics/AnalyticsEngine.js';
import localizationManager from './locales/LocalizationManager.js';

class MBTIApplication {
    constructor() {
        this.initialized = false;
        this.modules = {
            stateManager,
            quizEngine,
            uiManager,
            analyticsEngine
        };
    }

    async initialize() {
        try {
            // Initialize localization first
            localizationManager.initialize();
            
            console.log(localizationManager.get('console.initStart'));
            
            // Initialize state from URL
            this.initializeAppState();
            
            // Set up global event handlers
            this.setupGlobalHandlers();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up development tools
            this.setupDevTools();
            
            this.initialized = true;
            console.log(localizationManager.get('console.initSuccess'));
            
        } catch (error) {
            console.error(localizationManager.get('console.initFailed'), error);
            this.showError(localizationManager.get('errors.initFailed'));
        }
    }

    initializeAppState() {
        // Get app state from URL or default to release
        const urlState = stateManager.getStateFromURL();
        stateManager.setAppState(urlState);
        
        // Initialize quiz type
        const quizType = stateManager.getCurrentQuizType();
        quizEngine.setQuizType(quizType);
    }

    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error(localizationManager.get('console.globalError'), event.error);
            this.showError(localizationManager.get('errors.unexpectedError'));
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error(localizationManager.get('console.unhandledRejection'), event.reason);
            this.showError(localizationManager.get('errors.unexpectedError'));
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleNavigation();
        });
    }

    initializeUI() {
        // Update UI based on current state
        uiManager.updatePremiumUI(stateManager.isPremium());
        uiManager.updateQuizDescription();
        
        // Show appropriate screen
        const currentScreen = stateManager.get('currentScreen');
        uiManager.showScreen(currentScreen);
        
        // Show last results button if available
        this.checkAndShowLastResultsButton();
    }

    setupDevTools() {
        if (stateManager.isDevelopment()) {
            uiManager.showDevTools();
        } else {
            uiManager.hideDevTools();
        }
    }

    // Global application methods
    startQuiz() {
        try {
            const question = quizEngine.startQuiz();
            if (question) {
                uiManager.displayCurrentQuestion();
            }
        } catch (error) {
            console.error(localizationManager.get('console.errorStartingQuiz'), error);
            this.showError(localizationManager.get('errors.startQuizFailed'));
        }
    }

    startQuizType(quizType) {
        try {
            if (!stateManager.isPremium()) {
                uiManager.openModal('premium');
                return;
            }

            stateManager.setQuizType(quizType);
            quizEngine.setQuizType(quizType);
            
            const question = quizEngine.startQuiz();
            if (question) {
                uiManager.displayCurrentQuestion();
            }
        } catch (error) {
            console.error(localizationManager.get('console.errorStartingQuizType'), error);
            this.showError(localizationManager.get('errors.startQuizFailed'));
        }
    }

    selectOption(optionNumber) {
        try {
            quizEngine.selectOption(optionNumber);
            uiManager.selectOption(optionNumber);
        } catch (error) {
            console.error(localizationManager.get('console.errorSelectingOption'), error);
            this.showError(localizationManager.get('errors.selectOptionFailed'));
        }
    }

    nextQuestion() {
        try {
            uiManager.nextQuestion();
        } catch (error) {
            console.error(localizationManager.get('console.errorNextQuestion'), error);
            this.showError(localizationManager.get('errors.nextQuestionFailed'));
        }
    }

    previousQuestion() {
        try {
            uiManager.previousQuestion();
        } catch (error) {
            console.error(localizationManager.get('console.errorPreviousQuestion'), error);
            this.showError(localizationManager.get('errors.previousQuestionFailed'));
        }
    }

    restartQuiz() {
        try {
            quizEngine.resetQuiz();
            stateManager.setState({ currentScreen: 'welcome' });
            uiManager.showScreen('welcome');
        } catch (error) {
            console.error(localizationManager.get('console.errorRestartingQuiz'), error);
            this.showError(localizationManager.get('errors.restartQuizFailed'));
        }
    }

    // Modal management
    openTypesModal() {
        uiManager.openModal('types');
    }

    closeTypesModal() {
        uiManager.closeModal('types');
    }

    openPremiumModal() {
        uiManager.openModal('premium');
    }

    closePremiumModal() {
        uiManager.closeModal('premium');
    }

    unlockPremium() {
        try {
            stateManager.setPremium(true);
            uiManager.updatePremiumUI(true);
            uiManager.closeModal('premium');
            uiManager.showSuccess(localizationManager.get('success.premiumUnlocked'));
        } catch (error) {
            console.error(localizationManager.get('console.errorUnlockingPremium'), error);
            this.showError(localizationManager.get('errors.unlockPremiumFailed'));
        }
    }

    // Results management
    viewLastResults() {
        try {
            const lastResults = stateManager.getLastResults();
            if (lastResults) {
                stateManager.setState({ currentScreen: 'results' });
                uiManager.showScreen('results');
                analyticsEngine.createAnalyticsCharts(lastResults);
            } else {
                this.showError(localizationManager.get('errors.noPreviousResults'));
            }
        } catch (error) {
            console.error(localizationManager.get('console.errorViewingLastResults'), error);
            this.showError(localizationManager.get('errors.loadLastResultsFailed'));
        }
    }

    checkAndShowLastResultsButton() {
        const lastResults = stateManager.getLastResults();
        const viewLastResultsBtn = document.getElementById('viewLastResultsBtn');
        
        if (viewLastResultsBtn) {
            viewLastResultsBtn.style.display = lastResults ? 'inline-block' : 'none';
        }
    }

    // Analytics and sharing
    generatePDF() {
        try {
            const results = stateManager.getLastResults();
            if (!results) {
                this.showError(localizationManager.get('errors.noResultsForPDF'));
                return;
            }

            uiManager.showLoading();
            
            // Import PDF generator
            import('./modules/utils/PDFGenerator.js').then(({ PDFGenerator }) => {
                const pdfGen = new PDFGenerator();
                pdfGen.generateResultsPDF(results);
                uiManager.hideLoading();
                uiManager.showSuccess(localizationManager.get('success.pdfGenerated'));
            }).catch(error => {
                console.error(localizationManager.get('console.errorGeneratingPDF'), error);
                uiManager.hideLoading();
                this.showError(localizationManager.get('errors.generatePDFFailed'));
            });
        } catch (error) {
            console.error(localizationManager.get('console.errorGeneratingPDF'), error);
            this.showError(localizationManager.get('errors.generatePDFFailed'));
        }
    }

    shareResults() {
        try {
            const results = stateManager.getLastResults();
            if (!results) {
                this.showError(localizationManager.get('errors.noResultsToShare'));
                return;
            }

            const shareText = `I just discovered my MBTI personality type is ${results.personalityType}! Take the quiz yourself to find yours.`;
            const shareUrl = `${window.location.origin}${window.location.pathname}?type=${results.personalityType}&premium=1`;

            if (navigator.share) {
                navigator.share({
                    title: 'My MBTI Personality Type',
                    text: shareText,
                    url: shareUrl
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
                    uiManager.showSuccess(localizationManager.get('success.resultsCopied'));
                }).catch(() => {
                    this.showError(localizationManager.get('errors.copyToClipboardFailed'));
                });
            }
        } catch (error) {
            console.error(localizationManager.get('console.errorSharingResults'), error);
            this.showError(localizationManager.get('errors.shareResultsFailed'));
        }
    }

    // Development tools
    fillRandomAnswers() {
        try {
            if (!stateManager.isDevelopment()) {
                this.showError(localizationManager.get('errors.randomAnswersDevOnly'));
                return;
            }

            const results = quizEngine.fillRandomAnswers();
            if (results) {
                uiManager.showScreen('results');
                analyticsEngine.createAnalyticsCharts(results);
            }
        } catch (error) {
            console.error(localizationManager.get('console.errorFillingRandomAnswers'), error);
            this.showError(localizationManager.get('errors.fillRandomAnswersFailed'));
        }
    }

    toggleAppState() {
        try {
            const currentState = stateManager.get('appState');
            const newState = currentState === 'release' ? 'release' : 'development';
            stateManager.setAppState(newState);
            this.setupDevTools();
        } catch (error) {
            console.error(localizationManager.get('console.errorTogglingAppState'), error);
            this.showError(localizationManager.get('errors.toggleAppStateFailed'));
        }
    }

    // Exit quiz functionality
    exitQuiz() {
        uiManager.openModal('exitQuiz');
    }

    closeExitQuizModal() {
        uiManager.closeModal('exitQuiz');
    }

    confirmExitQuiz() {
        try {
            quizEngine.resetQuiz();
            stateManager.setState({ currentScreen: 'welcome' });
            uiManager.showScreen('welcome');
            uiManager.closeModal('exitQuiz');
        } catch (error) {
            console.error(localizationManager.get('console.errorExitingQuiz'), error);
            this.showError(localizationManager.get('errors.exitQuizFailed'));
        }
    }

    // Navigation handling
    handleNavigation() {
        const urlState = stateManager.getStateFromURL();
        stateManager.setAppState(urlState);
        this.setupDevTools();
    }

    // Error handling
    showError(message) {
        uiManager.showError(message);
    }

    showSuccess(message) {
        uiManager.showSuccess(message);
    }

    // Utility methods
    getAppInfo() {
        return {
            version: '2.0.0',
            modules: Object.keys(this.modules),
            state: stateManager.getState(),
            initialized: this.initialized
        };
    }
}

// Create and export global application instance
const app = new MBTIApplication();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Export for global access
window.MBTIApp = app;

// Export individual functions for HTML onclick handlers
window.startQuiz = () => app.startQuiz();
window.startQuizType = (quizType) => app.startQuizType(quizType);
window.selectOption = (optionNumber) => app.selectOption(optionNumber);
window.nextQuestion = () => app.nextQuestion();
window.previousQuestion = () => app.previousQuestion();
window.restartQuiz = () => app.restartQuiz();
window.openTypesModal = () => app.openTypesModal();
window.closeTypesModal = () => app.closeTypesModal();
window.openPremiumModal = () => app.openPremiumModal();
window.closePremiumModal = () => app.closePremiumModal();
window.unlockPremium = () => app.unlockPremium();
window.viewLastResults = () => app.viewLastResults();
window.generatePDF = () => app.generatePDF();
window.shareResults = () => app.shareResults();
window.fillRandomAnswers = () => app.fillRandomAnswers();
window.toggleAppState = () => app.toggleAppState();
window.exitQuiz = () => app.exitQuiz();
window.closeExitQuizModal = () => app.closeExitQuizModal();
window.confirmExitQuiz = () => app.confirmExitQuiz();

export default app; 