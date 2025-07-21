/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */
import { stateManager } from './modules/core/StateManager.js';
import { quizEngine } from './modules/quiz/QuizEngine.js';
import { uiManager } from './modules/ui/UIManager.js';
import { analyticsEngine } from './modules/analytics/AnalyticsEngine.js';

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
            console.log('🚀 Initializing MBTI Personality Quiz Application...');
            
            // Initialize state from URL
            this.initializeAppState();
            
            // Set up global event handlers
            this.setupGlobalHandlers();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up development tools
            this.setupDevTools();
            
            this.initialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
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
            console.error('Global error:', event.error);
            this.showError('An unexpected error occurred. Please try again.');
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError('An unexpected error occurred. Please try again.');
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleNavigation();
        });
    }

    initializeUI() {
        // Update UI based on current state
        uiManager.updatePremiumUI(stateManager.isPremium());
        uiManager.updateStateBadge();
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
            console.error('Error starting quiz:', error);
            this.showError('Failed to start quiz. Please try again.');
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
            console.error('Error starting quiz type:', error);
            this.showError('Failed to start quiz. Please try again.');
        }
    }

    selectOption(optionNumber) {
        try {
            quizEngine.selectOption(optionNumber);
            uiManager.selectOption(optionNumber);
        } catch (error) {
            console.error('Error selecting option:', error);
            this.showError('Failed to select option. Please try again.');
        }
    }

    nextQuestion() {
        try {
            uiManager.nextQuestion();
        } catch (error) {
            console.error('Error in next question:', error);
            this.showError('Failed to proceed to next question. Please try again.');
        }
    }

    previousQuestion() {
        try {
            uiManager.previousQuestion();
        } catch (error) {
            console.error('Error in previous question:', error);
            this.showError('Failed to go to previous question. Please try again.');
        }
    }

    restartQuiz() {
        try {
            quizEngine.resetQuiz();
            stateManager.setState({ currentScreen: 'welcome' });
            uiManager.showScreen('welcome');
        } catch (error) {
            console.error('Error restarting quiz:', error);
            this.showError('Failed to restart quiz. Please try again.');
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
            uiManager.showSuccess('Premium features unlocked!');
        } catch (error) {
            console.error('Error unlocking premium:', error);
            this.showError('Failed to unlock premium. Please try again.');
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
                this.showError('No previous results found.');
            }
        } catch (error) {
            console.error('Error viewing last results:', error);
            this.showError('Failed to load last results. Please try again.');
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
                this.showError('No results to generate PDF.');
                return;
            }

            uiManager.showLoading();
            
            // Import PDF generator
            import('./modules/utils/PDFGenerator.js').then(({ PDFGenerator }) => {
                const pdfGen = new PDFGenerator();
                pdfGen.generateResultsPDF(results);
                uiManager.hideLoading();
                uiManager.showSuccess('PDF generated successfully!');
            }).catch(error => {
                console.error('Error generating PDF:', error);
                uiManager.hideLoading();
                this.showError('Failed to generate PDF. Please try again.');
            });
        } catch (error) {
            console.error('Error in PDF generation:', error);
            this.showError('Failed to generate PDF. Please try again.');
        }
    }

    shareResults() {
        try {
            const results = stateManager.getLastResults();
            if (!results) {
                this.showError('No results to share.');
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
                    uiManager.showSuccess('Results copied to clipboard!');
                }).catch(() => {
                    this.showError('Failed to copy results to clipboard.');
                });
            }
        } catch (error) {
            console.error('Error sharing results:', error);
            this.showError('Failed to share results. Please try again.');
        }
    }

    // Development tools
    fillRandomAnswers() {
        try {
            if (!stateManager.isDevelopment()) {
                this.showError('Random answers only available in development mode.');
                return;
            }

            const results = quizEngine.fillRandomAnswers();
            if (results) {
                uiManager.showScreen('results');
                analyticsEngine.createAnalyticsCharts(results);
            }
        } catch (error) {
            console.error('Error filling random answers:', error);
            this.showError('Failed to fill random answers. Please try again.');
        }
    }

    toggleAppState() {
        try {
            const currentState = stateManager.get('appState');
            const newState = currentState === 'development' ? 'release' : 'development';
            stateManager.setAppState(newState);
            uiManager.updateStateBadge();
            this.setupDevTools();
        } catch (error) {
            console.error('Error toggling app state:', error);
            this.showError('Failed to toggle app state. Please try again.');
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
            console.error('Error exiting quiz:', error);
            this.showError('Failed to exit quiz. Please try again.');
        }
    }

    // Navigation handling
    handleNavigation() {
        const urlState = stateManager.getStateFromURL();
        stateManager.setAppState(urlState);
        uiManager.updateStateBadge();
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