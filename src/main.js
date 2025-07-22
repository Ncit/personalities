/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */
import { stateManager } from './modules/core/StateManager.js';
import { quizEngine } from './modules/quiz/QuizEngine.js';
import { uiManager } from './modules/ui/UIManager.js';
import { analyticsEngine } from './modules/analytics/AnalyticsEngine.js';
import localizationManager from './locales/LocalizationManager.js';
import { VKBridgeManager } from './modules/vk/VKBridgeManager.js';
import { loggerManager } from './modules/core/LoggerManager.js';

class MBTIApplication {
    constructor() {
        this.initialized = false;
        this.modules = {
            stateManager,
            quizEngine,
            uiManager,
            analyticsEngine
        };
        
        // Initialize VK Bridge Manager
        this.vkBridgeManager = new VKBridgeManager();
    }

    async initialize() {
        try {
            // Initialize localization first
            localizationManager.initialize();
            
            loggerManager.appInit(localizationManager.get('console.initStart'));
            
            // Initialize state from URL
            this.initializeAppState();
            
            // Set up global event handlers
            this.setupGlobalHandlers();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up development tools
            this.setupDevTools();
            
            this.initialized = true;
            loggerManager.appSuccess(localizationManager.get('console.initSuccess'));
            
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.initFailed'), error);
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
            loggerManager.appError(localizationManager.get('console.globalError'), event.error);
            this.showError(localizationManager.get('errors.unexpectedError'));
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            loggerManager.appError(localizationManager.get('console.unhandledRejection'), event.reason);
            this.showError(localizationManager.get('errors.unexpectedError'));
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleNavigation();
        });

        // Setup modal click-outside-to-close functionality
        this.setupModalClickOutside();
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
            loggerManager.appError(localizationManager.get('console.errorStartingQuiz'), error);
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
            loggerManager.appError(localizationManager.get('console.errorStartingQuizType'), error);
            this.showError(localizationManager.get('errors.startQuizFailed'));
        }
    }

    selectOption(optionNumber) {
        try {
            quizEngine.selectOption(optionNumber);
            uiManager.selectOption(optionNumber);
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorSelectingOption'), error);
            this.showError(localizationManager.get('errors.selectOptionFailed'));
        }
    }

    nextQuestion() {
        try {
            uiManager.nextQuestion();
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorNextQuestion'), error);
            this.showError(localizationManager.get('errors.nextQuestionFailed'));
        }
    }

    previousQuestion() {
        try {
            uiManager.previousQuestion();
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorPreviousQuestion'), error);
            this.showError(localizationManager.get('errors.previousQuestionFailed'));
        }
    }

    restartQuiz() {
        try {
            quizEngine.resetQuiz();
            stateManager.setState({ currentScreen: 'welcome' });
            uiManager.showScreen('welcome');
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorRestartingQuiz'), error);
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
            // Use VK Bridge for payments if available
            if (this.vkBridgeManager && this.vkBridgeManager.isVKEnvironment()) {
                this.vkBridgeManager.showOrderBox().then((result) => {
                    if (result && result.status === 'success') {
                        this.completePremiumUnlock();
                    }
                }).catch((error) => {
                    loggerManager.appError('Payment error:', error);
                    // Fallback to development mode
                    this.completePremiumUnlock();
                });
                return;
            }
            
            // Development mode or standalone
            this.completePremiumUnlock();
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorUnlockingPremium'), error);
            this.showError(localizationManager.get('errors.unlockPremiumFailed'));
        }
    }

    completePremiumUnlock() {
        try {
            stateManager.setPremium(true);
            uiManager.updatePremiumUI(true);
            uiManager.closeModal('premium');
            
            // Show success notification
            if (this.vkBridgeManager) {
                this.vkBridgeManager.showNotification(localizationManager.get('success.premiumUnlocked'));
            } else {
                uiManager.showSuccess(localizationManager.get('success.premiumUnlocked'));
            }
            
            // Check if we're on the results page and refresh premium content
            const currentScreen = stateManager.get('currentScreen');
            if (currentScreen === 'results') {
                const lastResults = stateManager.getLastResults();
                if (lastResults) {
                    // Refresh premium content on results page
                    analyticsEngine.createAnalyticsCharts(lastResults);
                    uiManager.showPremiumContent(lastResults.personalityType);
                }
            }
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorUnlockingPremium'), error);
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
            loggerManager.appError(localizationManager.get('console.errorViewingLastResults'), error);
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
                loggerManager.appError(localizationManager.get('console.errorGeneratingPDF'), error);
                uiManager.hideLoading();
                this.showError(localizationManager.get('errors.generatePDFFailed'));
            });
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorGeneratingPDF'), error);
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

            // Use VK Bridge if available, otherwise fallback to native sharing
            if (this.vkBridgeManager && this.vkBridgeManager.isVKEnvironment()) {
                this.vkBridgeManager.shareResults(results.personalityType, shareText);
            } else if (navigator.share) {
                navigator.share({
                    title: 'My MBTI Personality Type',
                    text: shareText,
                    url: shareUrl
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
                    if (this.vkBridgeManager) {
                        this.vkBridgeManager.showNotification(localizationManager.get('success.resultsCopied'));
                    } else {
                        uiManager.showSuccess(localizationManager.get('success.resultsCopied'));
                    }
                }).catch(() => {
                    this.showError(localizationManager.get('errors.copyToClipboardFailed'));
                });
            }
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorSharingResults'), error);
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
            loggerManager.appError(localizationManager.get('console.errorFillingRandomAnswers'), error);
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
            loggerManager.appError(localizationManager.get('console.errorTogglingAppState'), error);
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
            uiManager.closeModal('exitQuiz');
            // Reload the website
            location.reload();
        } catch (error) {
            loggerManager.appError(localizationManager.get('console.errorExitingQuiz'), error);
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

    // Subscription Management Methods
    openSubscriptionModal() {
        try {
            uiManager.openModal('subscription');
            this.updateSubscriptionModal();
        } catch (error) {
            loggerManager.appError('Error opening subscription modal:', error);
            this.showError('Failed to open subscription management');
        }
    }

    closeSubscriptionModal() {
        try {
            uiManager.closeModal('subscription');
        } catch (error) {
            loggerManager.appError('Error closing subscription modal:', error);
        }
    }

    updateSubscriptionModal() {
        try {
            const isPremium = stateManager.isPremium();
            const statusIndicator = document.getElementById('subscriptionStatus');
            const cancelBtn = document.getElementById('cancelSubscriptionBtn');
            const restoreBtn = document.getElementById('restoreSubscriptionBtn');
            
            if (statusIndicator) {
                if (isPremium) {
                    statusIndicator.className = 'status-indicator premium';
                    statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Premium Active</span>';
                } else {
                    statusIndicator.className = 'status-indicator free';
                    statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Free Version</span>';
                }
            }
            
            if (cancelBtn) {
                cancelBtn.style.display = isPremium ? 'inline-block' : 'none';
            }
            
            if (restoreBtn) {
                restoreBtn.style.display = isPremium ? 'none' : 'inline-block';
            }
            
            this.updateSubscriptionTiers();
            this.updateSubscriptionInfo();
        } catch (error) {
            loggerManager.appError('Error updating subscription modal:', error);
        }
    }

    updateSubscriptionTiers() {
        try {
            const isPremium = stateManager.isPremium();
            
            // Update current plan indicators
            const freeTier = document.querySelector('.free-tier .tier-status');
            const premiumTier = document.querySelector('.premium-tier .tier-status');
            
            if (freeTier) {
                if (isPremium) {
                    freeTier.innerHTML = '';
                } else {
                    freeTier.innerHTML = '<span class="current-plan">Current Plan</span>';
                }
            }
            
            if (premiumTier) {
                if (isPremium) {
                    premiumTier.innerHTML = '<span class="current-plan">Current Plan</span>';
                } else {
                    premiumTier.innerHTML = '';
                }
            }
        } catch (error) {
            loggerManager.appError('Error updating subscription tiers:', error);
        }
    }

    updateSubscriptionInfo() {
        try {
            const isPremium = stateManager.isPremium();
            const startDate = document.getElementById('subscriptionStartDate');
            const endDate = document.getElementById('subscriptionEndDate');
            const nextPayment = document.getElementById('nextPaymentDate');
            const price = document.getElementById('subscriptionPrice');
            
            if (isPremium) {
                const subscriptionData = JSON.parse(localStorage.getItem('mbti_subscription_data') || '{}');
                const startDateValue = subscriptionData.startDate || new Date().toLocaleDateString();
                const endDateValue = subscriptionData.endDate || 'Lifetime';
                const nextPaymentValue = subscriptionData.nextPayment || 'None';
                const priceValue = subscriptionData.price || 'Free (Demo)';
                
                if (startDate) startDate.textContent = startDateValue;
                if (endDate) endDate.textContent = endDateValue;
                if (nextPayment) nextPayment.textContent = nextPaymentValue;
                if (price) price.textContent = priceValue;
            } else {
                if (startDate) startDate.textContent = '-';
                if (endDate) endDate.textContent = '-';
                if (nextPayment) nextPayment.textContent = '-';
                if (price) price.textContent = '-';
            }
        } catch (error) {
            loggerManager.appError('Error updating subscription info:', error);
        }
    }

    cancelSubscription() {
        try {
            const confirmed = confirm('Are you sure you want to cancel your subscription?');
            if (confirmed) {
                stateManager.setPremium(false);
                this.updateSubscriptionModal();
                uiManager.updatePremiumUI(false);
                this.showSuccess('Subscription cancelled. You are now on the free plan.');
            }
        } catch (error) {
            loggerManager.appError('Error cancelling subscription:', error);
            this.showError('Failed to cancel subscription');
        }
    }

    restoreSubscription() {
        try {
            const confirmed = confirm('Restore premium subscription?');
            if (confirmed) {
                stateManager.setPremium(true);
                this.updateSubscriptionModal();
                uiManager.updatePremiumUI(true);
                this.showSuccess('Premium subscription restored!');
            }
        } catch (error) {
            loggerManager.appError('Error restoring subscription:', error);
            this.showError('Failed to restore subscription');
        }
    }

    contactSupport() {
        alert('For support, please email: personalitiesresearch@mail.ru');
    }

    viewBillingHistory() {
        alert('Billing history will be available in future updates.');
    }

    setupModalClickOutside() {
        try {
            // Get all modals
            const modals = document.querySelectorAll('.modal');
            
            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    // Check if the click was on the modal backdrop (not the content)
                    if (e.target === modal) {
                        // Find the close function based on modal type
                        const modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            const modalId = modal.id;
                            
                            // Determine which close function to call based on modal ID
                            switch (modalId) {
                                case 'typesModal':
                                    this.closeTypesModal();
                                    break;
                                case 'premiumModal':
                                    this.closePremiumModal();
                                    break;
                                case 'exitQuizModal':
                                    this.closeExitQuizModal();
                                    break;
                                case 'subscriptionModal':
                                    this.closeSubscriptionModal();
                                    break;
                                default:
                                    // Generic close for any other modals
                                    modal.style.display = 'none';
                                    break;
                            }
                        }
                    }
                });
            });
        } catch (error) {
            loggerManager.appError('Error setting up modal click-outside functionality:', error);
        }
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
window.clearLocalStorage = () => uiManager.clearLocalStorage();

// Subscription Management Functions
window.openSubscriptionModal = () => app.openSubscriptionModal();
window.closeSubscriptionModal = () => app.closeSubscriptionModal();
window.cancelSubscription = () => app.cancelSubscription();
window.restoreSubscription = () => app.restoreSubscription();
window.contactSupport = () => app.contactSupport();
window.viewBillingHistory = () => app.viewBillingHistory();

export default app; 