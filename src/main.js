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
import { firebaseAnalytics, initializeCrashlytics } from './config/firebase.js';


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
            
            console.log(localizationManager.get('console.initStart'));
            
            // Initialize Firebase Crashlytics
            initializeCrashlytics();
            
            // Initialize state from URL
            this.initializeAppState();
            
            // Check premium status if in VK environment
            await this.checkPremiumStatusOnInit();
            
            // Set up global event handlers
            this.setupGlobalHandlers();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up development tools
            this.setupDevTools();
            
            // Log app initialization to Firebase Analytics
            firebaseAnalytics.logEvent('app_initialized', {
                app_version: '2.0.0',
                quiz_type: stateManager.getCurrentQuizType()
            });
            
            this.initialized = true;
            console.log(localizationManager.get('console.initSuccess'));
            
        } catch (error) {
            console.error(localizationManager.get('console.initFailed'), error);
            firebaseAnalytics.logError(error, { context: 'app_initialization' });
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
        // Global error handler (Firebase Crashlytics handles this now)
        window.addEventListener('error', (event) => {
            console.error(localizationManager.get('console.globalError'), event.error);
            firebaseAnalytics.logError(event.error, { 
                context: 'global_error_handler',
                error_filename: event.filename,
                error_lineno: event.lineno
            });
            this.showError(localizationManager.get('errors.unexpectedError'));
        });

        // Global unhandled promise rejection handler (Firebase Crashlytics handles this now)
        window.addEventListener('unhandledrejection', (event) => {
            console.error(localizationManager.get('console.unhandledRejection'), event.reason);
            firebaseAnalytics.logError(event.reason, { 
                context: 'unhandled_promise_rejection'
            });
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

    /**
     * Update premium modal UI based on VK environment
     */
    updatePremiumModalUI() {
        try {
            const vkPremiumSection = document.getElementById('vkPremiumSection');
            const standalonePremiumSection = document.getElementById('standalonePremiumSection');
            
            if (this.vkBridgeManager && this.vkBridgeManager.isVKFeatureSupported('payment')) {
                // Show VK premium section
                if (vkPremiumSection) vkPremiumSection.style.display = 'block';
                if (standalonePremiumSection) standalonePremiumSection.style.display = 'none';
                
                // Update premium product info
                const premiumProduct = this.vkBridgeManager.getPremiumProductInfo();
                const priceElement = document.getElementById('premiumPrice');
                if (priceElement) {
                    priceElement.textContent = `${premiumProduct.price} ${premiumProduct.currency}`;
                }
                
                console.log('Premium modal updated for VK environment');
                
            } else {
                // Show standalone premium section
                if (vkPremiumSection) vkPremiumSection.style.display = 'none';
                if (standalonePremiumSection) standalonePremiumSection.style.display = 'block';
                
                console.log('Premium modal updated for standalone environment');
            }
            
        } catch (error) {
            console.error('Error updating premium modal UI:', error);
        }
    }

    /**
     * Check premium status on app initialization
     */
    async checkPremiumStatusOnInit() {
        try {
            // Check if we're in VK environment and can check premium status
            if (this.vkBridgeManager && this.vkBridgeManager.isVKFeatureSupported('payment')) {
                console.log('Checking premium status in VK environment...');
                
                const premiumStatus = await this.vkBridgeManager.checkPremiumStatus();
                
                if (premiumStatus.success && premiumStatus.isPremium) {
                    // User has active premium subscription
                    console.log('Active premium subscription found:', premiumStatus.expiryDate);
                    
                    // Set premium status in state manager
                    stateManager.setPremium(true);
                    
                    // Store premium data
                    localStorage.setItem('mbti_premium_status', 'true');
                    if (premiumStatus.expiryDate) {
                        localStorage.setItem('mbti_premium_expiry', premiumStatus.expiryDate);
                    }
                    
                    // Track premium status check
                    this.vkBridgeManager.trackVKEvent('premium_status_check_success', {
                        is_premium: true,
                        expiry_date: premiumStatus.expiryDate
                    });
                    
                } else {
                    // No active premium subscription
                    console.log('No active premium subscription found');
                    
                    // Clear premium status
                    stateManager.setPremium(false);
                    localStorage.removeItem('mbti_premium_status');
                    localStorage.removeItem('mbti_premium_expiry');
                    
                    // Track premium status check
                    this.vkBridgeManager.trackVKEvent('premium_status_check_success', {
                        is_premium: false
                    });
                }
                
            } else {
                // Not in VK environment - check local storage for development mode
                console.log('Not in VK environment, checking local storage for premium status');
                
                const localPremiumStatus = localStorage.getItem('mbti_premium_status');
                const premiumExpiry = localStorage.getItem('mbti_premium_expiry');
                
                const isPremium = localPremiumStatus === 'true' && 
                                (!premiumExpiry || new Date(premiumExpiry) > new Date());
                
                stateManager.setPremium(isPremium);
                
                if (!isPremium) {
                    // Clear expired premium status
                    localStorage.removeItem('mbti_premium_status');
                    localStorage.removeItem('mbti_premium_expiry');
                }
            }
            
        } catch (error) {
            console.error('Error checking premium status on init:', error);
            
            // Track error if in VK environment
            if (this.vkBridgeManager) {
                this.vkBridgeManager.trackVKEvent('premium_status_check_error', {
                    error_message: error.message
                });
            }
            
            // Fallback to local storage check
            const localPremiumStatus = localStorage.getItem('mbti_premium_status');
            stateManager.setPremium(localPremiumStatus === 'true');
        }
    }

    // Global application methods
    startQuiz() {
        try {
            const question = quizEngine.startQuiz();
            if (question) {
                uiManager.displayCurrentQuestion();
            }
            
            // Log to Firebase Analytics
            firebaseAnalytics.logQuizEvent('started', stateManager.getCurrentQuizType());
            
            // Track VK-specific quiz events
            if (this.vkBridgeManager && this.vkBridgeManager.isVKEnvironment()) {
                this.vkBridgeManager.trackVKQuizEvent('started', {
                    quiz_type: stateManager.getCurrentQuizType()
                });
            }
            
        } catch (error) {
            console.error(localizationManager.get('console.errorStartingQuiz'), error);
            firebaseAnalytics.logError(error, { context: 'start_quiz' });
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
            
            // Log to Firebase Analytics
            firebaseAnalytics.logQuizEvent('started', quizType);
            
            // Track VK-specific quiz events
            if (this.vkBridgeManager && this.vkBridgeManager.isVKEnvironment()) {
                this.vkBridgeManager.trackVKQuizEvent('premium_started', {
                    quiz_type: quizType
                });
            }
            
        } catch (error) {
            console.error(localizationManager.get('console.errorStartingQuizType'), error);
            firebaseAnalytics.logError(error, { context: 'start_quiz_type', quiz_type: quizType });
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
        this.updatePremiumModalUI();
    }

    closePremiumModal() {
        uiManager.closeModal('premium');
    }

    async unlockPremium() {
        try {
            // Check if we're in VK environment and payment is available
            if (this.vkBridgeManager && this.vkBridgeManager.isVKFeatureSupported('payment')) {
                // Show loading state
                const unlockBtn = document.getElementById('unlockPremiumBtn');
                const originalText = unlockBtn.innerHTML;
                unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
                unlockBtn.disabled = true;
                
                try {
                    // Attempt VK premium purchase
                    const purchaseResult = await this.vkBridgeManager.purchasePremium();
                    
                    if (purchaseResult.success) {
                        // Payment successful - unlock premium
                        this.completePremiumUnlock();
                        
                        // Store premium purchase data
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription
                        
                        localStorage.setItem('mbti_premium_status', 'true');
                        localStorage.setItem('mbti_premium_expiry', expiryDate.toISOString());
                        localStorage.setItem('mbti_premium_transaction', purchaseResult.transaction_id);
                        
                        // Show success notification
                        this.vkBridgeManager.showNotification('Премиум подписка активирована!');
                        
                        // Track successful purchase
                        this.vkBridgeManager.trackVKEvent('premium_purchase_completed', {
                            transaction_id: purchaseResult.transaction_id,
                            amount: purchaseResult.amount,
                            currency: purchaseResult.currency
                        });
                        
                    } else {
                        // Payment failed or cancelled
                        if (purchaseResult.error === 'cancelled') {
                            this.showError('Покупка была отменена');
                        } else {
                            this.showError(purchaseResult.message || 'Ошибка при покупке премиума');
                        }
                        
                        // Track failed purchase
                        this.vkBridgeManager.trackVKEvent('premium_purchase_failed', {
                            error: purchaseResult.error,
                            message: purchaseResult.message
                        });
                    }
                    
                } catch (error) {
                    console.error('Error during VK premium purchase:', error);
                    this.showError('Ошибка при обработке платежа');
                    
                    // Track error
                    this.vkBridgeManager.trackVKEvent('premium_purchase_error', {
                        error_message: error.message
                    });
                    
                } finally {
                    // Restore button state
                    unlockBtn.innerHTML = originalText;
                    unlockBtn.disabled = false;
                }
                
            } else {
                // Not in VK environment or payment not available - use development/standalone mode
                console.log('VK payment not available, using development mode');
                this.completePremiumUnlock();
            }
            
        } catch (error) {
            console.error(localizationManager.get('console.errorUnlockingPremium'), error);
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
            uiManager.closeModal('exitQuiz');
            // Reload the website
            location.reload();
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

    // Subscription Management Methods
    openSubscriptionModal() {
        try {
            uiManager.openModal('subscription');
            this.updateSubscriptionModal();
        } catch (error) {
            console.error('Error opening subscription modal:', error);
            this.showError('Failed to open subscription management');
        }
    }

    closeSubscriptionModal() {
        try {
            uiManager.closeModal('subscription');
        } catch (error) {
            console.error('Error closing subscription modal:', error);
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
            console.error('Error updating subscription modal:', error);
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
            console.error('Error updating subscription tiers:', error);
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
            console.error('Error updating subscription info:', error);
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
            console.error('Error cancelling subscription:', error);
            this.showError('Failed to cancel subscription');
        }
    }

    async restoreSubscription() {
        try {
            const confirmed = confirm('Restore premium subscription?');
            if (confirmed) {
                // Check if we're in VK environment and can restore purchases
                if (this.vkBridgeManager && this.vkBridgeManager.isVKFeatureSupported('payment')) {
                    // Show loading state
                    const restoreBtn = document.querySelector('[onclick="restoreSubscription()"]');
                    if (restoreBtn) {
                        const originalText = restoreBtn.innerHTML;
                        restoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Восстановление...';
                        restoreBtn.disabled = true;
                        
                        try {
                            // Attempt to restore premium purchase
                            const restoreResult = await this.vkBridgeManager.restorePremiumPurchase();
                            
                            if (restoreResult.success) {
                                // Restoration successful
                                stateManager.setPremium(true);
                                this.updateSubscriptionModal();
                                uiManager.updatePremiumUI(true);
                                
                                // Show success notification
                                this.vkBridgeManager.showNotification('Премиум подписка восстановлена!');
                                
                                // Track successful restoration
                                this.vkBridgeManager.trackVKEvent('premium_restore_success', {
                                    expiry_date: restoreResult.expiryDate
                                });
                                
                            } else {
                                // No active subscription found
                                this.showError('Активная премиум подписка не найдена');
                                
                                // Track failed restoration
                                this.vkBridgeManager.trackVKEvent('premium_restore_no_subscription', {
                                    error: restoreResult.error
                                });
                            }
                            
                        } catch (error) {
                            console.error('Error restoring premium subscription:', error);
                            this.showError('Ошибка при восстановлении подписки');
                            
                            // Track error
                            this.vkBridgeManager.trackVKEvent('premium_restore_error', {
                                error_message: error.message
                            });
                            
                        } finally {
                            // Restore button state
                            restoreBtn.innerHTML = originalText;
                            restoreBtn.disabled = false;
                        }
                    }
                } else {
                    // Not in VK environment - use development mode
                    console.log('VK restore not available, using development mode');
                    stateManager.setPremium(true);
                    this.updateSubscriptionModal();
                    uiManager.updatePremiumUI(true);
                    this.showSuccess('Premium subscription restored!');
                }
            }
        } catch (error) {
            console.error('Error restoring subscription:', error);
            this.showError('Failed to restore subscription');
        }
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
            console.error('Error setting up modal click-outside functionality:', error);
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