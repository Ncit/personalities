// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import { getPerformance } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js';

// Import data from QuizData.js
import { MBTI_TYPES, ADVANCED_INSIGHTS, FAMOUS_PERSONALITIES } from './src/data/QuizData.ru.js';
import localizationManager from './src/locales/LocalizationManager.js';
import { MBTI_QUESTIONS } from './src/data/MainQuiz.js';
import { MBTI_SPECIALIZED_QUESTIONS } from './src/data/SpecializedQuiz.js';
import { MBTI_SPECIALIZED_QUESTIONS_RU } from './src/data/SpecializedQuiz.ru.js';
import { MBTI_QUESTIONS_RU } from './src/data/MainQuiz.ru.js';
import { VKBridgeManager } from './src/modules/vk/VKBridgeManager.js';
import { LoggerManager } from './src/modules/core/LoggerManager.js';

// Initialize global logger
const logger = new LoggerManager().createModuleLogger('MainApp');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB773kQHk-jLJeSwYhCluXXk1r6CEOuR8A",
    authDomain: "nikitaproject-b0a52.firebaseapp.com",
    projectId: "nikitaproject-b0a52",
    storageBucket: "nikitaproject-b0a52.firebasestorage.app",
    messagingSenderId: "188919966813",
    appId: "1:188919966813:web:748cc6a6354d672173f1b4",
    measurementId: "G-TZ5LN0BB9L"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAnalytics = null;
let firebasePerformance = null;

try {
    firebaseApp = initializeApp(firebaseConfig);
    logger.log('Firebase app initialized successfully');
} catch (error) {
    logger.error('Failed to initialize Firebase app:', error);
}

// Initialize Analytics
try {
    firebaseAnalytics = getAnalytics(firebaseApp);
    logger.log('Firebase Analytics initialized successfully');
} catch (error) {
    logger.error('Failed to initialize Firebase Analytics:', error);
}

// Initialize Performance Monitoring
try {
    firebasePerformance = getPerformance(firebaseApp);
    logger.log('Firebase Performance initialized successfully');
} catch (error) {
    logger.error('Failed to initialize Firebase Performance:', error);
}

// Firebase Analytics Debug Mode Toggle
window.firebaseAnalyticsDebug = localStorage.getItem('firebaseAnalyticsDebug') === 'true';

// Toggle function for Firebase Analytics debug mode
window.toggleFirebaseAnalyticsDebug = () => {
    const isDevelopment = window.getCurrentAppState ? window.getCurrentAppState() === 'development' : true;
    
    if (isDevelopment) {
        window.firebaseAnalyticsDebug = !window.firebaseAnalyticsDebug;
        localStorage.setItem('firebaseAnalyticsDebug', window.firebaseAnalyticsDebug);
        logger.log(`Firebase Analytics debug mode: ${window.firebaseAnalyticsDebug ? 'ON' : 'OFF'}`);
        
        // Show notification
        if (window.vkBridgeManager) {
            window.vkBridgeManager.showNotification(
                `Firebase Analytics debug: ${window.firebaseAnalyticsDebug ? 'ON' : 'OFF'}`
            );
        }
    } else {
        logger.warn('Firebase Analytics debug toggle is only available in development mode');
    }
};

// Make Firebase available globally
window.firebaseAnalytics = {
    logEvent: (eventName, parameters = {}) => {
        if (firebaseAnalytics) {
            try {
                logEvent(firebaseAnalytics, eventName, parameters);
                if (window.firebaseAnalyticsDebug) {
                    logger.log('🔥 Firebase Analytics Event:', eventName, parameters);
                }
            } catch (error) {
                logger.error('Failed to log analytics event:', error);
            }
        }
    },
    setUserId: (userId) => {
        if (firebaseAnalytics) {
            try {
                setUserId(firebaseAnalytics, userId);
                if (window.firebaseAnalyticsDebug) {
                    logger.log('🔥 Firebase Analytics User ID set:', userId);
                }
            } catch (error) {
                logger.error('Failed to set user ID:', error);
                // Fallback: log user ID as an event
                window.firebaseAnalytics.logEvent('user_id_set', { user_id: userId });
            }
        }
    },
    setUserProperties: (properties) => {
        if (firebaseAnalytics) {
            try {
                setUserProperties(firebaseAnalytics, properties);
                if (window.firebaseAnalyticsDebug) {
                    logger.log('🔥 Firebase Analytics User Properties set:', properties);
                }
            } catch (error) {
                logger.error('Failed to set user properties:', error);
                // Fallback: log user properties as events
                Object.entries(properties).forEach(([key, value]) => {
                    window.firebaseAnalytics.logEvent('user_property_set', {
                        property_name: key,
                        property_value: value
                    });
                });
            }
        }
    }
};

// Log page view
if (firebaseAnalytics) {
    logEvent(firebaseAnalytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
}

// MBTI Quiz Application
class MBTIQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = {
            E: 0, I: 0, // Extraversion vs Introversion
            S: 0, N: 0, // Sensing vs Intuition
            T: 0, F: 0, // Thinking vs Feeling
            J: 0, P: 0  // Judging vs Perceiving
        };
        this.currentQuizType = 'mbti'; // Default quiz type
        this.questions = this.generateQuestions();
        this.selectedOption = null;
    }

    generateQuestions() {
        // Check if user is premium to determine quiz length
        const isPremiumUser = isPremium();
        
        // Handle different quiz types for premium users
        if (isPremiumUser && this.currentQuizType !== 'mbti') {
            return this.generateSpecializedQuestions();
        }
        
        // For MBTI quiz, implement adaptive question selection
        if (this.currentQuizType === 'mbti') {
            return this.generateAdaptiveMBTIQuestions();
        }
        
        // Return the appropriate questions based on current locale
        // const currentLocale = localizationManager.getCurrentLocale();
        return MBTI_QUESTIONS_RU; //currentLocale === 'ru' ? MBTI_QUESTIONS_RU : MBTI_QUESTIONS;
    }

    /**
     * Generate adaptive MBTI questions with intelligent selection
     */
    generateAdaptiveMBTIQuestions() {
        try {
            // Get all available questions
            const allQuestions = MBTI_QUESTIONS_RU;
            
            // Initialize adaptive state (no early termination)
            this.adaptiveState = {
                questionPool: [...allQuestions],
                selectedQuestions: [],
                dimensionBalance: { EI: 0, SN: 0, TF: 0, JP: 0 },
                confidenceScores: { EI: 0, SN: 0, TF: 0, JP: 0 },
                maxQuestions: 60
            };
            
            // Select initial questions for balanced start
            const initialQuestions = this.selectInitialQuestions(allQuestions);
            
            log('Adaptive questions generated', { 
                total: initialQuestions.length, 
                dimensions: this.adaptiveState.dimensionBalance 
            });
            
            return initialQuestions;
            
        } catch (error) {
            console.warn('Failed to generate adaptive questions, falling back to standard:', error);
            return MBTI_QUESTIONS_RU;
        }
    }

    /**
     * Select all questions for full test completion
     */
    selectInitialQuestions(allQuestions) {
        // Use all available questions for complete assessment
        const allQuestionsShuffled = this.shuffleArray([...allQuestions]);
        
        // Count questions per dimension for logging
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        dimensions.forEach(dimension => {
            this.adaptiveState.dimensionBalance[dimension] = allQuestions.filter(q => q.dimension === dimension).length;
        });
        
        log('All questions selected for full test', { 
            total: allQuestionsShuffled.length, 
            dimensions: this.adaptiveState.dimensionBalance 
        });
        
        return allQuestionsShuffled;
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Early termination is disabled - users complete the full test
     */
    getNextAdaptiveQuestion() {
        // Always return null - no additional questions needed
        return null;
    }

    /**
     * Calculate current confidence for all dimensions
     */
    calculateCurrentConfidence() {
        const confidence = { EI: 0, SN: 0, TF: 0, JP: 0 };
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        
        // Debug logging
        console.log('calculateCurrentConfidence - Debug:', {
            scores: this.scores,
            answers: this.answers,
            currentQuestion: this.currentQuestion,
            questions: this.questions.length
        });
        
        dimensions.forEach(dimension => {
            const [pref1, pref2] = dimension.split('');
            const score1 = this.scores[pref1] || 0;
            const score2 = this.scores[pref2] || 0;
            
            // Handle both old format (number) and new format (object)
            const answeredForDimension = this.answers.filter(a => {
                if (typeof a === 'object') {
                    return a.dimension === dimension;
                } else {
                    // Fallback for old format - check question dimension
                    const questionIndex = this.answers.indexOf(a);
                    return questionIndex >= 0 && this.questions[questionIndex] && this.questions[questionIndex].dimension === dimension;
                }
            }).length;
            
            // Improved confidence calculation
            let dimensionConfidence = 0;
            
            if (answeredForDimension > 0) {
                // Calculate total possible score for this dimension
                const totalPossibleScore = answeredForDimension * 3; // Assuming max 3 points per question
                
                // Calculate the strength of preference
                const totalScore = score1 + score2;
                const scoreDifference = Math.abs(score1 - score2);
                
                // Base confidence: how much of the total possible score was used
                const utilizationRatio = totalScore / totalPossibleScore;
                
                // Preference strength: how clearly one preference dominates
                const preferenceStrength = scoreDifference / totalPossibleScore;
                
                // Combined confidence calculation
                dimensionConfidence = (utilizationRatio * 0.4) + (preferenceStrength * 0.6);
                
                // Ensure confidence is between 0 and 1
                dimensionConfidence = Math.max(0, Math.min(1, dimensionConfidence));
                
                // Add minimum confidence for having answered questions
                dimensionConfidence = Math.max(0.1, dimensionConfidence);
            } else {
                dimensionConfidence = 0.1; // Minimum confidence when no questions answered
            }
            
            confidence[dimension] = dimensionConfidence;
            
            // Debug logging for each dimension
            console.log(`Dimension ${dimension}:`, {
                score1, score2, scoreDifference: Math.abs(score1 - score2),
                answeredForDimension, totalPossibleScore: answeredForDimension * 3,
                utilizationRatio: (score1 + score2) / (answeredForDimension * 3),
                preferenceStrength: Math.abs(score1 - score2) / (answeredForDimension * 3),
                confidence: dimensionConfidence
            });
        });
        
        console.log('Final confidence scores:', confidence);
        return confidence;
    }

    /**
     * Early termination is disabled - users complete the full test
     */
    shouldTerminateEarly(currentConfidence) {
        // Always return false - no early termination
        return false;
    }

    /**
     * Early termination is disabled - users complete the full test
     */
    selectNextQuestionByConfidence(remainingQuestions, currentConfidence) {
        // Always return null - no additional questions needed
        return null;
    }
    
    generateSpecializedQuestions() {
        // Each specialized quiz now has 20+ questions
        const currentLocale = localizationManager.getCurrentLocale();
        const questions = currentLocale === 'ru' ? MBTI_SPECIALIZED_QUESTIONS_RU : MBTI_SPECIALIZED_QUESTIONS;
        return questions[this.currentQuizType] || questions['leadership'];
    }

    startQuiz() {
        this.questions = this.generateQuestions(); // <-- Add this line
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('quizQuestions').style.display = 'flex';
        
        // Show adaptive indicators for MBTI quiz
        if (this.currentQuizType === 'mbti') {
            this.showAdaptiveIndicators();
        }
        
        // Hide the "На главную" button when starting the quiz
        const onMainPageBtn = document.getElementById('onMainPageBtn');
        if (onMainPageBtn) {
            onMainPageBtn.style.display = 'none';
        }
        
		// Hide the subscription button when starting the quiz
        const subscriptionBtn = document.getElementById('subscriptionBtn');
        if (subscriptionBtn) {
            subscriptionBtn.style.display = 'none';
        }

		// If there are saved results for this quiz type, show them immediately and reveal reset button
		const saved = this.loadResultsFromStorageByTest();
		if (saved) {
			this.scores = saved.scores;
			this.answers = saved.answers;
			this.currentQuestion = this.questions.length - 1;
			this.showResults();
			const resetBtn = document.getElementById('resetTestBtn');
			if (resetBtn) resetBtn.style.display = 'inline-block';
			return;
		}
        
        // Scroll to top to center the quiz content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.displayQuestion();
        
        // Log to Firebase Analytics
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent('quiz_started', {
                quiz_type: this.currentQuizType,
                question_count: this.questions.length
            });
        }
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        
        // Get elements with null checks
        const questionText = document.getElementById('questionText');
        const option1 = document.getElementById('option1');
        const option2 = document.getElementById('option2');
        const option3 = document.getElementById('option3');
        const option4 = document.getElementById('option4');
        const questionCounter = document.getElementById('questionCounter');
        const progressFill = document.getElementById('progressFill');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        // Set text content with null checks
        if (questionText) questionText.textContent = question.question;
        if (option1) option1.textContent = question.options[0];
        if (option2) option2.textContent = question.options[1];
        if (option3) option3.textContent = question.options[2];
        if (option4) option4.textContent = question.options[3];
        
        if (questionCounter) questionCounter.textContent = `${this.currentQuestion + 1} / ${this.questions.length}`;
        
        // Update progress bar
        if (progressFill) {
            const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        

		// Restore previously selected answer for this question (if any)
		const savedAnswer = this.answers[this.currentQuestion];
		this.selectedOption = savedAnswer !== undefined ? savedAnswer : null;

		        // Update navigation buttons
		if (prevBtn) prevBtn.disabled = this.currentQuestion === 0;
		if (nextBtn) {
			nextBtn.disabled = this.selectedOption === null;
			
			// Change button text for last question
			if (this.currentQuestion === this.questions.length - 1) {
				nextBtn.innerHTML = 'Показать результаты <i class="fas fa-chart-bar"></i>';
			} else {
				nextBtn.innerHTML = 'Следующий <i class="fas fa-arrow-right"></i>';
			}
		}
        
        // Update adaptive indicators
        this.updateAllAdaptiveIndicators();

        // Show reset button during test (if not already visible)
        const resetBtn = document.getElementById('resetTestBtn');
        if (resetBtn && resetBtn.style.display === 'none') {
            resetBtn.style.display = 'inline-block';
        }
        
		// Clear previous selection
		this.clearOptionSelection();

		// Re-apply selection styling if answer exists
		if (this.selectedOption) {
			document.querySelector(`button[onclick="selectOption(${this.selectedOption})"]`)?.classList.add('selected');
		}
        
        // Update dev tools visibility
        updateDevToolsVisibility();
    }

	selectOption(optionNumber) {
		this.clearOptionSelection();
		this.selectedOption = optionNumber;
		
		// Store both option number and dimension for confidence calculation
		const currentQuestion = this.questions[this.currentQuestion];
		this.answers[this.currentQuestion] = {
			option: optionNumber,
			dimension: currentQuestion.dimension,
			questionId: currentQuestion.id || this.currentQuestion
		};
		
		document.querySelector(`button[onclick="selectOption(${optionNumber})"]`).classList.add('selected');
		document.getElementById('nextBtn').disabled = false;
		this.recalculateScores();
		
		// Update adaptive indicators after option selection
		this.updateAllAdaptiveIndicators();
	}

    clearOptionSelection() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

	// Recalculate scores based on all saved answers
	recalculateScores() {
		// Reset scores
		this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
		for (let i = 0; i < this.questions.length; i++) {
			const answer = this.answers[i];
			if (!answer) continue;
			
			const q = this.questions[i];
			// Handle both old format (number) and new format (object)
			const optionNumber = typeof answer === 'object' ? answer.option : answer;
			const weight = q.weights[optionNumber - 1];
			
			if (q.dimension === 'EI') {
				if (weight > 0) this.scores.I += weight;
				else if (weight < 0) this.scores.E += Math.abs(weight);
			} else if (q.dimension === 'SN') {
				if (weight > 0) this.scores.S += weight;
				else if (weight < 0) this.scores.N += Math.abs(weight);
			} else if (q.dimension === 'TF') {
				if (weight > 0) this.scores.T += weight;
				else if (weight < 0) this.scores.F += Math.abs(weight);
			} else if (q.dimension === 'JP') {
				if (weight > 0) this.scores.J += weight;
				else if (weight < 0) this.scores.P += Math.abs(weight);
			}
		}
		
		// Debug logging for score calculation
		console.log('Scores recalculated:', this.scores);
		console.log('Answers processed:', this.answers.length);
	}

	nextQuestion() {
		if (this.selectedOption === null) return;
		
		// Ensure answer is saved for this question index (already done in selectOption)
		// this.answers[this.currentQuestion] is already set with dimension info
		
		// Update adaptive indicators after answer
		this.updateAllAdaptiveIndicators();
		
		// For adaptive MBTI quiz, continue with standard flow
		if (this.currentQuizType === 'mbti' && this.adaptiveState) {
			log('Processing adaptive question flow', { 
                currentQuestion: this.currentQuestion, 
                totalQuestions: this.questions.length,
                answersCount: this.answers.length
            });
		}
		
		// Standard quiz flow - no early termination
		if (this.currentQuestion < this.questions.length - 1) {
			this.currentQuestion++;
			this.displayQuestion();
		} else {
			this.showResults();
		}
	}

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            const answer = this.answers[this.currentQuestion];
            if (answer) {
                // Handle both old format (number) and new format (object)
                this.selectedOption = typeof answer === 'object' ? answer.option : answer;
                this.displayQuestion();
                if (this.selectedOption) {
                    document.querySelector(`button[onclick="selectOption(${this.selectedOption})"]`).classList.add('selected');
                    document.getElementById('nextBtn').disabled = false;
                }
            }
        }
    }

	showResults() {
		// Always recompute scores from saved answers to ensure consistency
		this.recalculateScores();
        // Get elements with null checks
        const quizQuestions = document.getElementById('quizQuestions');
        const resultsScreen = document.getElementById('resultsScreen');
        
        if (quizQuestions) quizQuestions.style.display = 'none';
        if (resultsScreen) resultsScreen.style.display = 'block';
        
        const personalityType = this.calculatePersonalityType();
        
        // Save results to localStorage
        this.saveResultsToStorage(personalityType);
        
        this.displayPersonalityResults(personalityType);
        this.displayDimensionBreakdown();
        
        // Show premium features if user is premium
        if (isPremium()) {
            displayAdvancedInsights(personalityType);
            displayFamousPersonalities(personalityType);
            createAnalyticsCharts();
            
            // Generate share link
            const shareLink = document.getElementById('shareLink');
            if (shareLink) {
                const link = `${window.location.origin}${window.location.pathname}?type=${personalityType}&premium=1`;
                shareLink.value = link;
            }
        }
        
        // Show interstitial ad for non-premium users in VK environment
        if (!isPremium() && vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
            setTimeout(() => {
                showInterstitialAd();
            }, 2000); // Show after 2 seconds
        }

        // Show reset button near home button on results screen
        const resetBtn = document.getElementById('resetTestBtn');
        if (resetBtn) resetBtn.style.display = 'inline-block';
        
        // Track VK-specific quiz completion
        if (window.vkBridgeManager && window.vkBridgeManager.isVKEnvironment()) {
            window.vkBridgeManager.trackVKQuizEvent('quiz_completed', {
                personality_type: personalityType,
                quiz_type: this.currentQuizType,
                question_count: this.questions.length,
                is_premium: isPremium()
            });
        }
        
        // Show the "На главную" button after test completion
        const onMainPageBtn = document.getElementById('onMainPageBtn');
        if (onMainPageBtn) {
            onMainPageBtn.style.display = 'inline-block';
        }
        
        // Hide the subscription button after test completion
        const subscriptionBtn = document.getElementById('subscriptionBtn');
        if (subscriptionBtn) {
            subscriptionBtn.style.display = 'none';
        }
    }

    calculatePersonalityType() {
        const type = [];
        
        // E vs I
        type.push(this.scores.E > this.scores.I ? 'E' : 'I');
        
        // S vs N
        type.push(this.scores.S > this.scores.N ? 'S' : 'N');
        
        // T vs F
        type.push(this.scores.T > this.scores.F ? 'T' : 'F');
        
        // J vs P
        type.push(this.scores.J > this.scores.P ? 'J' : 'P');
        
        return type.join('');
    }

    displayPersonalityResults(type) {
        const personality = MBTI_TYPES[type];
        
        // Get elements with null checks
        const personalityType = document.getElementById('personalityType');
        const personalityTitle = document.getElementById('personalityTitle');
        const personalitySubtitle = document.getElementById('personalitySubtitle');
        const personalityDescription = document.getElementById('personalityDescription');
        const traitsContainer = document.getElementById('personalityTraits');
        
        // Set text content with null checks
        if (personalityType) personalityType.textContent = type;
        if (personalityTitle) personalityTitle.textContent = personality.title;
        if (personalitySubtitle) personalitySubtitle.textContent = personality.subtitle;
        if (personalityDescription) personalityDescription.textContent = personality.description;
        
        if (traitsContainer) {
            traitsContainer.innerHTML = '';
            personality.traits.forEach(trait => {
                const traitElement = document.createElement('span');
                traitElement.className = 'trait';
                traitElement.textContent = trait;
                traitsContainer.appendChild(traitElement);
            });
        }
    }

    displayDimensionBreakdown() {
        const totalE = this.scores.E + this.scores.I;
        const totalS = this.scores.S + this.scores.N;
        const totalT = this.scores.T + this.scores.F;
        const totalJ = this.scores.J + this.scores.P;
        
        const ePercentage = totalE > 0 ? (this.scores.E / totalE) * 100 : 50;
        const sPercentage = totalS > 0 ? (this.scores.S / totalS) * 100 : 50;
        const tPercentage = totalT > 0 ? (this.scores.T / totalT) * 100 : 50;
        const jPercentage = totalJ > 0 ? (this.scores.J / totalJ) * 100 : 50;
        
        // Analyze confidence vs final results correlation
        this.analyzeConfidenceResultsCorrelation();
        
        // New dual-sided bars centered around the middle
        const eLeft = document.getElementById('eLeft');
        const iRight = document.getElementById('iRight');
        const sLeft = document.getElementById('sLeft');
        const nRight = document.getElementById('nRight');
        const tLeft = document.getElementById('tLeft');
        const fRight = document.getElementById('fRight');
        const jLeft = document.getElementById('jLeft');
        const pRight = document.getElementById('pRight');

        if (eLeft) eLeft.style.width = `${ePercentage}%`;
        if (iRight) iRight.style.width = `${100 - ePercentage}%`;
        if (sLeft) sLeft.style.width = `${sPercentage}%`;
        if (nRight) nRight.style.width = `${100 - sPercentage}%`;
        if (tLeft) tLeft.style.width = `${tPercentage}%`;
        if (fRight) fRight.style.width = `${100 - tPercentage}%`;
        if (jLeft) jLeft.style.width = `${jPercentage}%`;
        if (pRight) pRight.style.width = `${100 - jPercentage}%`;

        // Update percents text
        const ePctL = document.getElementById('ePctL');
        const ePctR = document.getElementById('ePctR');
        const sPctL = document.getElementById('sPctL');
        const sPctR = document.getElementById('sPctR');
        const tPctL = document.getElementById('tPctL');
        const tPctR = document.getElementById('tPctR');
        const jPctL = document.getElementById('jPctL');
        const jPctR = document.getElementById('jPctR');

        if (ePctL) ePctL.textContent = `${Math.round(ePercentage)}%`;
        if (ePctR) ePctR.textContent = `${Math.round(100 - ePercentage)}%`;
        if (sPctL) sPctL.textContent = `${Math.round(sPercentage)}%`;
        if (sPctR) sPctR.textContent = `${Math.round(100 - sPercentage)}%`;
        if (tPctL) tPctL.textContent = `${Math.round(tPercentage)}%`;
        if (tPctR) tPctR.textContent = `${Math.round(100 - tPercentage)}%`;
        if (jPctL) jPctL.textContent = `${Math.round(jPercentage)}%`;
        if (jPctR) jPctR.textContent = `${Math.round(100 - jPercentage)}%`;
    }

    restartQuiz() {
        this.currentQuestion = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        
        // Get elements with null checks
        const resultsScreen = document.getElementById('resultsScreen');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (resultsScreen) resultsScreen.style.display = 'none';
        if (welcomeScreen) welcomeScreen.style.display = 'block';
        
        // Hide the "На главную" button when returning to welcome screen
        const onMainPageBtn = document.getElementById('onMainPageBtn');
        if (onMainPageBtn) {
            onMainPageBtn.style.display = 'none';
        }
        
        // Show the subscription button when returning to welcome screen
        const subscriptionBtn = document.getElementById('subscriptionBtn');
        if (subscriptionBtn) {
            subscriptionBtn.style.display = 'inline-block';
        }
        
        // Check and show last results button after restart
        checkAndShowLastResultsButton();
    }
    
		saveResultsToStorage(personalityType) {
        const results = {
            personalityType: personalityType,
            scores: this.scores,
            answers: this.answers,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };
			
			// Save general last results
			localStorage.setItem('mbti_last_results', JSON.stringify(results));
			// Save per-test results using test key
			const testKey = this.getTestStorageKey();
			localStorage.setItem(testKey, JSON.stringify(results));
    }
    
		loadResultsFromStorage() {
        const saved = localStorage.getItem('mbti_last_results');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

		// Load results for current test type
		loadResultsFromStorageByTest() {
			const saved = localStorage.getItem(this.getTestStorageKey());
			return saved ? JSON.parse(saved) : null;
		}
    
		hasPreviousResults() {
        return localStorage.getItem('mbti_last_results') !== null;
    }

		// Check previous results for current test type
		hasPreviousResultsForTest() {
			return localStorage.getItem(this.getTestStorageKey()) !== null;
		}
    
    displayLastResults() {
			const results = this.loadResultsFromStorageByTest() || this.loadResultsFromStorage();
        if (!results) return false;
        
        // Restore scores and answers
        this.scores = results.scores;
        this.answers = results.answers;
        
        // Display results
        this.displayPersonalityResults(results.personalityType);
        this.displayDimensionBreakdown();
        
        // Show premium features if user is premium
        if (isPremium()) {
            displayAdvancedInsights(results.personalityType);
            displayFamousPersonalities(results.personalityType);
            createAnalyticsCharts();
            
            // Generate share link
            const shareLink = document.getElementById('shareLink');
            if (shareLink) {
                const link = `${window.location.origin}${window.location.pathname}?type=${results.personalityType}&premium=1`;
                shareLink.value = link;
            }
        }
        
        return true;
    }

	getTestStorageKey() {
		const quizType = this.currentQuizType || 'mbti';
		return `mbti_results_${quizType}`;
	}

    shareResults() {
        const personalityType = this.calculatePersonalityType();
        const totalE = this.scores.E + this.scores.I;
        const totalS = this.scores.S + this.scores.N;
        const totalT = this.scores.T + this.scores.F;
        const totalJ = this.scores.J + this.scores.P;
        const ePct = totalE > 0 ? Math.round((this.scores.E / totalE) * 100) : 50;
        const iPct = 100 - ePct;
        const sPct = totalS > 0 ? Math.round((this.scores.S / totalS) * 100) : 50;
        const nPct = 100 - sPct;
        const tPct = totalT > 0 ? Math.round((this.scores.T / totalT) * 100) : 50;
        const fPct = 100 - tPct;
        const jPct = totalJ > 0 ? Math.round((this.scores.J / totalJ) * 100) : 50;
        const pPct = 100 - jPct;

        const baseMessage = localizationManager.get('ui.shareMessage', { type: personalityType });
        const personalityTitle = (MBTI_TYPES[personalityType] && MBTI_TYPES[personalityType].title) ? MBTI_TYPES[personalityType].title : personalityType;
        const personalityLine = localizationManager.get('ui.sharePersonality', { title: personalityTitle, type: personalityType });

        // Famous personalities (take first 3 random or top 3)
        let famousNames = '';
        try {
            const famousList = (FAMOUS_PERSONALITIES[personalityType] || []).slice();
            const three = famousList.slice(0, 3).map(p => p.name).join(', ');
            if (three) {
                famousNames = localizationManager.get('ui.shareFamous', { names: three });
            }
        } catch (e) {
            // ignore
        }
        const detailsMessage = localizationManager.get('ui.shareDetails', {
            type: personalityType,
            e: ePct,
            i: iPct,
            s: sPct,
            n: nPct,
            t: tPct,
            f: fPct,
            j: jPct,
            p: pPct
        });
        // Create a simpler, more direct share text that VK might handle better
        let shareText;
        if (localizationManager.getCurrentLocale() === 'ru') {
            shareText = `Мой тип личности MBTI: ${personalityType} (${personalityTitle}). Баллы: E:${ePct}% I:${iPct}% S:${sPct}% N:${nPct}% T:${tPct}% F:${fPct}% J:${jPct}% P:${pPct}%. Пройди тест и узнай свой тип!`;
        } else {
            shareText = `My MBTI personality type: ${personalityType} (${personalityTitle}). Scores: E:${ePct}% I:${iPct}% S:${sPct}% N:${nPct}% T:${tPct}% F:${fPct}% J:${jPct}% P:${pPct}%. Take the test and discover your type!`;
        }
        const shareTitle = localizationManager.get('ui.shareTitle');
        
        // Debug: Log what we're trying to share
        console.log('Share Debug:', {
            personalityType,
            baseMessage,
            personalityLine,
            detailsMessage,
            famousNames,
            shareText,
            shareTitle,
            textLength: shareText.length
        });
        
        // Use VK Bridge if available, otherwise fallback to native sharing
        if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
            vkBridgeManager.shareResults(personalityType, shareText, shareTitle);
        } else if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: "https://vk.com/app53942833"
            });
        }
    }

    // ========================================
    // ADAPTIVE ASSESSMENT INDICATORS
    // ========================================

    /**
     * Show adaptive indicators
     */
    showAdaptiveIndicators() {
        const adaptiveIndicators = document.getElementById('adaptiveIndicators');
        if (adaptiveIndicators) {
            adaptiveIndicators.style.display = 'block';
            this.updateAdaptiveStatus('active', 'Обучение вашим предпочтениям...');
        }
    }

    /**
     * Hide adaptive indicators
     */
    hideAdaptiveIndicators() {
        const adaptiveIndicators = document.getElementById('adaptiveIndicators');
        if (adaptiveIndicators) {
            adaptiveIndicators.style.display = 'none';
        }
    }

    /**
     * Update adaptive status
     */
    updateAdaptiveStatus(status, text) {
        const adaptiveStatus = document.getElementById('adaptiveStatus');
        if (adaptiveStatus) {
            const statusDot = adaptiveStatus.querySelector('.status-dot');
            const statusText = adaptiveStatus.querySelector('.status-text');
            
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
    updateConfidenceBars() {
        console.log('updateConfidenceBars called');
        const confidenceScores = this.calculateConfidenceScores();
        console.log('Confidence scores received:', confidenceScores);
        
        if (!confidenceScores) {
            console.warn('No confidence scores available');
            return;
        }

        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        dimensions.forEach(dimension => {
            const confidence = confidenceScores[dimension] || 0;
            console.log(`Updating confidence bar for ${dimension}:`, confidence);
            this.updateConfidenceBar(dimension, confidence);
        });
    }

    /**
     * Update individual confidence bar
     */
    updateConfidenceBar(dimension, confidence) {
        console.log(`updateConfidenceBar called for ${dimension} with confidence ${confidence}`);
        
        const confidenceElement = document.getElementById(`confidence${dimension}`);
        const confidenceTextElement = document.getElementById(`confidence${dimension}Text`);
        
        console.log(`Elements found:`, {
            confidenceElement: !!confidenceElement,
            confidenceTextElement: !!confidenceTextElement,
            dimension
        });
        
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
            
            console.log(`Updated ${dimension} confidence bar:`, {
                percentage,
                confidenceLevel,
                width: confidenceElement.style.width
            });
        } else {
            console.warn(`Missing elements for ${dimension}:`, {
                confidenceElement: !!confidenceElement,
                confidenceTextElement: !!confidenceTextElement
            });
        }
    }

    /**
     * Calculate confidence scores for all dimensions
     */
    calculateConfidenceScores() {
        try {
            // Use the adaptive state if available, otherwise fall back to standard calculation
            if (this.adaptiveState && this.currentQuizType === 'mbti') {
                return this.calculateCurrentConfidence();
            }
            
            // Standard confidence calculation
            const dimensions = ['EI', 'SN', 'TF', 'JP'];
            const confidenceScores = {};
            
            dimensions.forEach(dimension => {
                const [pref1, pref2] = dimension.split('');
                const score1 = this.scores[pref1] || 0;
                const score2 = this.scores[pref2] || 0;
                
                // Handle both old format (number) and new format (object)
                const totalQuestionsForDim = this.answers.filter(a => {
                    if (typeof a === 'object') {
                        return a.dimension === dimension;
                    } else {
                        // Fallback for old format - check question dimension
                        const questionIndex = this.answers.indexOf(a);
                        return questionIndex >= 0 && this.questions[questionIndex] && this.questions[questionIndex].dimension === dimension;
                    }
                }).length;
                
                // Improved confidence calculation (same as calculateCurrentConfidence)
                let dimensionConfidence = 0;
                
                if (totalQuestionsForDim > 0) {
                    // Calculate total possible score for this dimension
                    const totalPossibleScore = totalQuestionsForDim * 3; // Assuming max 3 points per question
                    
                    // Calculate the strength of preference
                    const totalScore = score1 + score2;
                    const scoreDifference = Math.abs(score1 - score2);
                    
                    // Base confidence: how much of the total possible score was used
                    const utilizationRatio = totalScore / totalPossibleScore;
                    
                    // Preference strength: how clearly one preference dominates
                    const preferenceStrength = scoreDifference / totalPossibleScore;
                    
                    // Combined confidence calculation
                    dimensionConfidence = (utilizationRatio * 0.4) + (preferenceStrength * 0.6);
                    
                    // Ensure confidence is between 0 and 1
                    dimensionConfidence = Math.max(0, Math.min(1, dimensionConfidence));
                    
                    // Add minimum confidence for having answered questions
                    dimensionConfidence = Math.max(0.1, dimensionConfidence);
                } else {
                    dimensionConfidence = 0.1; // Minimum confidence when no questions answered
                }
                
                confidenceScores[dimension] = dimensionConfidence;
            });
            
            return confidenceScores;
        } catch (error) {
            console.warn('Failed to calculate confidence scores:', error);
            return null;
        }
    }

    /**
     * Update adaptive metrics
     */
    updateAdaptiveMetrics() {
        const metrics = this.calculateAdaptiveMetrics();
        if (!metrics) return;





        // Update overall confidence
        const overallConfidence = document.getElementById('overallConfidence');
        if (overallConfidence && metrics.overallConfidence !== undefined) {
            const percentage = Math.round(metrics.overallConfidence * 100);
            overallConfidence.textContent = `${percentage}%`;
        }
    }

    /**
     * Calculate adaptive metrics
     */
    calculateAdaptiveMetrics() {
        try {
            const totalQuestions = this.questions.length;
            const currentQuestion = this.currentQuestion;
            const isAdaptive = this.currentQuizType === 'mbti';
            
            if (!isAdaptive) return null;

                        // Calculate overall confidence (average of all dimensions)
            const confidenceScores = this.calculateConfidenceScores();
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
     * Update all adaptive indicators
     */
    updateAllAdaptiveIndicators() {
        console.log('updateAllAdaptiveIndicators called');
        try {
            if (this.currentQuizType === 'mbti') {
                console.log('MBTI quiz detected, updating adaptive indicators');
                this.showAdaptiveIndicators();
                
                // Get current confidence scores
                const confidenceScores = this.calculateConfidenceScores();
                console.log('Confidence scores calculated:', confidenceScores);
                
                if (confidenceScores) {
                    console.log('Calling updateConfidenceBars');
                    this.updateConfidenceBars();
                } else {
                    console.warn('No confidence scores available');
                }
                
                // Get adaptive metrics
                console.log('Calling updateAdaptiveMetrics');
                this.updateAdaptiveMetrics();
                
                // Update status based on progress
                console.log('Calling updateAdaptiveStatusBasedOnProgress');
                this.updateAdaptiveStatusBasedOnProgress();
            } else {
                console.log('Not MBTI quiz, hiding adaptive indicators');
                this.hideAdaptiveIndicators();
            }
        } catch (error) {
            console.warn('Failed to update adaptive indicators:', error);
            this.hideAdaptiveIndicators();
        }
    }

    /**
     * Update adaptive status based on quiz progress
     */
    updateAdaptiveStatusBasedOnProgress() {
        try {
            const confidenceScores = this.calculateConfidenceScores();
            
            if (confidenceScores) {
                const avgConfidence = Object.values(confidenceScores).reduce((sum, val) => sum + val, 0) / Object.values(confidenceScores).length;
                
                if (avgConfidence >= 0.9) {
                    this.updateAdaptiveStatus('optimizing', 'Оптимизация завершения...');
                } else if (avgConfidence >= 0.7) {
                    this.updateAdaptiveStatus('learning', 'Продолжаем обучение...');
                } else {
                    this.updateAdaptiveStatus('active', 'Обучение вашим предпочтениям...');
                }
            }
        } catch (error) {
            console.warn('Failed to update adaptive status:', error);
        }
    }

    /**
     * Analyze how well confidence levels correlate with final results
     */
    analyzeConfidenceResultsCorrelation() {
        console.log('🔍 ANALYZING CONFIDENCE vs FINAL RESULTS CORRELATION');
        console.log('==================================================');
        
        // Get current confidence levels
        const confidenceScores = this.calculateCurrentConfidence();
        const finalType = this.calculatePersonalityType();
        
        console.log('📊 FINAL RESULTS:', {
            personalityType: finalType,
            scores: this.scores,
            totalAnswers: this.answers.length
        });
        
        console.log('🧠 CONFIDENCE LEVELS:', confidenceScores);
        
        // Analyze each dimension
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        dimensions.forEach(dimension => {
            const [pref1, pref2] = dimension.split('');
            const score1 = this.scores[pref1] || 0;
            const score2 = this.scores[pref2] || 0;
            const confidence = confidenceScores[dimension] || 0;
            const finalChoice = score1 > score2 ? pref1 : pref2;
            const scoreDifference = Math.abs(score1 - score2);
            const totalScore = score1 + score2;
            
            // Calculate how "clear" the final choice is
            const clarity = totalScore > 0 ? (scoreDifference / totalScore) : 0;
            
            // Determine if confidence matches clarity
            const confidenceMatchesClarity = Math.abs(confidence - clarity) < 0.2; // Within 20%
            
            console.log(`\n📈 ${dimension} DIMENSION ANALYSIS:`);
            console.log(`   Final Choice: ${finalChoice} (${score1} vs ${score2})`);
            console.log(`   Score Difference: ${scoreDifference}`);
            console.log(`   Total Score: ${totalScore}`);
            console.log(`   Clarity: ${(clarity * 100).toFixed(1)}%`);
            console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
            console.log(`   Match Quality: ${confidenceMatchesClarity ? '✅ GOOD' : '⚠️  NEEDS IMPROVEMENT'}`);
            
            if (!confidenceMatchesClarity) {
                console.log(`   💡 Suggestion: Confidence calculation may need adjustment for ${dimension}`);
            }
        });
        
        // Overall correlation analysis
        const avgConfidence = Object.values(confidenceScores).reduce((sum, val) => sum + val, 0) / Object.values(confidenceScores).length;
        const totalQuestions = this.questions.length;
        const answeredQuestions = this.answers.length;
        const completionRate = answeredQuestions / totalQuestions;
        
        console.log('\n🎯 OVERALL CORRELATION ANALYSIS:');
        console.log(`   Questions Completed: ${answeredQuestions}/${totalQuestions} (${(completionRate * 100).toFixed(1)}%)`);
        console.log(`   Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
        console.log(`   Final Type: ${finalType}`);
        
        // Determine if the system is working well
        if (avgConfidence > 0.6 && completionRate > 0.8) {
            console.log('   🎉 SYSTEM STATUS: EXCELLENT - High confidence with good completion');
        } else if (avgConfidence > 0.4 && completionRate > 0.6) {
            console.log('   ✅ SYSTEM STATUS: GOOD - Reasonable confidence and completion');
        } else if (avgConfidence > 0.2 && completionRate > 0.4) {
            console.log('   ⚠️  SYSTEM STATUS: FAIR - Low confidence or incomplete quiz');
        } else {
            console.log('   ❌ SYSTEM STATUS: POOR - Very low confidence or incomplete quiz');
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        if (avgConfidence < 0.4) {
            console.log('   - Consider adjusting confidence calculation weights');
            console.log('   - Review question scoring system');
            console.log('   - Check if questions are properly balanced');
        }
        if (completionRate < 0.8) {
            console.log('   - Quiz may be too long for users');
            console.log('   - Consider adaptive question selection');
        }
        
        console.log('==================================================');
    }
}

function openConfidenceInfoModal() {
    const modal = document.getElementById('confidenceInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeConfidenceInfoModal();
            }
        });
    }
}

function closeConfidenceInfoModal() {
    const modal = document.getElementById('confidenceInfoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openTypesModal() {
    const typesModal = document.getElementById('typesModal');
    const typesList = document.getElementById('typesList');
    
    if (typesModal && typesList) {
        // Clear existing content
        typesList.innerHTML = '';
        
        // Add each personality type with enhanced structure
        Object.entries(MBTI_TYPES).forEach(([type, data]) => {
            const typeCard = document.createElement('div');
            typeCard.className = `type-card ${getTypeCategory(type)}`;
            typeCard.innerHTML = `
                <div class="type-header">
                    <div class="type-icon ${getTypeCategory(type)}">
                        ${getTypeIcon(type)}
                    </div>
                    <div class="type-info">
                        <div class="type-code">${type}</div>
                        <div class="type-title">${data.title}</div>
                        <div class="type-subtitle">${data.subtitle}</div>
                    </div>
                </div>
                <div class="type-description">${data.description}</div>
                <div class="type-traits">
                    ${getTypeTraits(type).map(trait => `<span class="type-trait">${trait}</span>`).join('')}
                </div>
                <div class="type-stats">
                    <div class="type-stat">
                        <span class="type-stat-value">${getTypePercentage(type)}%</span>
                        <span class="type-stat-label">Населения</span>
                    </div>
                    <div class="type-stat">
                        <span class="type-stat-value">${getTypeCompatibility(type)}</span>
                        <span class="type-stat-label">Совместимость</span>
                    </div>
                </div>
            `;
            typesList.appendChild(typeCard);
        });
        
        // Setup filter functionality
        setupTypeFilters();
        
        typesModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeTypesModal() {
    document.getElementById('typesModal').style.display = 'none';
    document.body.style.overflow = '';
}

// Helper functions for enhanced types display
function getTypeCategory(type) {
    const categories = {
        'INTJ': 'analysts', 'INTP': 'analysts', 'ENTJ': 'analysts', 'ENTP': 'analysts',
        'INFJ': 'diplomats', 'INFP': 'diplomats', 'ENFJ': 'diplomats', 'ENFP': 'diplomats',
        'ISTJ': 'sentinels', 'ISFJ': 'sentinels', 'ESTJ': 'sentinels', 'ESFJ': 'sentinels',
        'ISTP': 'explorers', 'ISFP': 'explorers', 'ESTP': 'explorers', 'ESFP': 'explorers'
    };
    return categories[type] || 'analysts';
}

function getTypeIcon(type) {
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

function getTypeTraits(type) {
    const traits = {
        'INTJ': ['Стратегический', 'Аналитический', 'Независимый'],
        'INTP': ['Логичный', 'Инновационный', 'Любознательный'],
        'ENTJ': ['Решительный', 'Лидерский', 'Эффективный'],
        'ENTP': ['Изобретательный', 'Энергичный', 'Адаптивный'],
        'INFJ': ['Идеалистичный', 'Эмпатичный', 'Творческий'],
        'INFP': ['Мечтательный', 'Добрый', 'Вдохновляющий'],
        'ENFJ': ['Харизматичный', 'Заботливый', 'Мотивирующий'],
        'ENFP': ['Энтузиаст', 'Креативный', 'Общительный'],
        'ISTJ': ['Практичный', 'Надежный', 'Организованный'],
        'ISFJ': ['Заботливый', 'Терпеливый', 'Преданный'],
        'ESTJ': ['Ответственный', 'Прямолинейный', 'Организованный'],
        'ESFJ': ['Дружелюбный', 'Ответственный', 'Сочувствующий'],
        'ISTP': ['Гибкий', 'Практичный', 'Спокойный'],
        'ISFP': ['Художественный', 'Миролюбивый', 'Спонтанный'],
        'ESTP': ['Энергичный', 'Практичный', 'Спонтанный'],
        'ESFP': ['Веселый', 'Дружелюбный', 'Спонтанный']
    };
    return traits[type] || ['Уникальный', 'Интересный', 'Особенный'];
}

function getTypePercentage(type) {
    const percentages = {
        'INTJ': 2, 'INTP': 3, 'ENTJ': 2, 'ENTP': 3,
        'INFJ': 1, 'INFP': 4, 'ENFJ': 2, 'ENFP': 8,
        'ISTJ': 12, 'ISFJ': 14, 'ESTJ': 9, 'ESFJ': 12,
        'ISTP': 5, 'ISFP': 9, 'ESTP': 4, 'ESFP': 8
    };
    return percentages[type] || 6;
}

function getTypeCompatibility(type) {
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
    return compatibility[type] || 'Все типы';
}

function setupTypeFilters() {
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

// Premium status logic
function isPremium() {
    // Check if VK bridge manager is available and has premium status
    if (window.vkBridgeManager && window.vkBridgeManager.userService) {
        try {
            // Get premium status from VK user service
            const premiumStatus = window.vkBridgeManager.userService.getPremiumStatus();
            if (premiumStatus !== null) {
                return premiumStatus;
            }
        } catch (error) {
            logger.warn('Error getting premium status from VK service:', error);
        }
    }
    
    // Fallback to localStorage check (for backward compatibility)
    const premiumValue = localStorage.getItem('mbti_premium');
    return premiumValue === '1' || premiumValue === 'true';
}

function setPremium(val) {
    if (val) {
        // Store in localStorage for backward compatibility
        localStorage.setItem('mbti_premium', 'true');
        
        // Also update VK user service if available
        if (window.vkBridgeManager && window.vkBridgeManager.userService) {
            try {
                window.vkBridgeManager.userService.storePremiumStatus(true);
            } catch (error) {
                logger.warn('Error storing premium status in VK service:', error);
            }
        }
    } else {
        localStorage.removeItem('mbti_premium');
        
        // Also update VK user service if available
        if (window.vkBridgeManager && window.vkBridgeManager.userService) {
            try {
                window.vkBridgeManager.userService.storePremiumStatus(false);
            } catch (error) {
                logger.warn('Error storing premium status in VK service:', error);
            }
        }
    }
    updatePremiumUI();
}

function openPremiumModal() {
    const premiumModal = document.getElementById('premiumModal');
    if (premiumModal) {
        premiumModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Clear any previous unlock message
    const unlockMsg = document.getElementById('premiumUnlockMsg');
    if (unlockMsg) {
        unlockMsg.textContent = '';
        unlockMsg.style.display = 'none';
    }
    
    // Log to Firebase Analytics
    if (window.firebaseAnalytics) {
        window.firebaseAnalytics.logEvent('premium_modal_opened', {
            app_state: getCurrentAppState()
        });
    }
}

function closePremiumModal() {
    const premiumModal = document.getElementById('premiumModal');
    if (premiumModal) {
        premiumModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Log to Firebase Analytics
    if (window.firebaseAnalytics) {
        window.firebaseAnalytics.logEvent('premium_modal_closed', {
            app_state: getCurrentAppState()
        });
    }
}

async function unlockPremium() {
    const unlockMsg = document.getElementById('premiumUnlockMsg');
    
    // Show loading state
    if (unlockMsg) {
        unlockMsg.textContent = 'Обработка запроса...';
        unlockMsg.style.display = 'block';
        unlockMsg.style.color = '#007bff'; // Blue color for loading state
    }
    // if (window.firebaseAnalyticsDebug) {

    //     setPremium(true);
    //     // Complete premium unlock
    //     completePremiumUnlock();
    //     return;
    // }
    // Check if we're in VK environment and VK Bridge is available
    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        try {
            // Show VK order box for payment
            const orderResult = await vkBridgeManager.showOrderBox();
            
            if (orderResult.success) {
                // Process the order result
                const paymentResult = await vkBridgeManager.handleOrderBoxResult(orderResult);
                
                if (paymentResult.success) {
                    // Payment successful - unlock premium
                    if (unlockMsg) {
                        unlockMsg.textContent = '🎉 Премиум доступ открыт!';
                        unlockMsg.style.display = 'block';
                        unlockMsg.style.color = '#28a745'; // Green color for success messages
                    }
                    
                    // Complete premium unlock
                    completePremiumUnlock();
                } else if (paymentResult.cancelled) {
                    // User cancelled payment
                    if (unlockMsg) {
                        unlockMsg.textContent = 'Покупка отменена';
                        unlockMsg.style.display = 'block';
                        unlockMsg.style.color = '#ffc107'; // Yellow color for cancellation messages
                    }
                    setTimeout(() => {
                        if (unlockMsg) unlockMsg.style.display = 'none';
                    }, 3000);
                } else {
                    // Payment failed
                    if (unlockMsg) {
                        unlockMsg.textContent = 'Ошибка платежа. Попробуйте еще раз.';
                        unlockMsg.style.display = 'block';
                        unlockMsg.style.color = '#dc3545'; // Red color for error messages
                    }
                    setTimeout(() => {
                        if (unlockMsg) unlockMsg.style.display = 'none';
                    }, 3000);
                }
            } else {
                // Order box failed or not supported
                let errorMessage = 'Платежная система недоступна';
                
                // Handle specific error cases
                if (orderResult.error === 'order_configuration_error') {
                    errorMessage = 'Ошибка конфигурации платежа. Обратитесь в поддержку.';
                } else if (orderResult.error === 'payment_not_supported') {
                    errorMessage = 'Платежи не поддерживаются в данной среде';
                } else if (orderResult.error === 'unsupported_platform') {
                    errorMessage = 'Платежи доступны только в VK';
                }
                
                if (unlockMsg) {
                    unlockMsg.textContent = errorMessage;
                    unlockMsg.style.display = 'block';
                    unlockMsg.style.color = '#dc3545'; // Red color for error messages
                }
                
                // Log specific error for debugging
                logger.debug('Premium unlock failed:', {
                    error: orderResult.error,
                    message: orderResult.message,
                    order_error: orderResult.order_error,
                    error_code: orderResult.error_code
                });
                
                setTimeout(() => {
                    if (unlockMsg) unlockMsg.style.display = 'none';
                }, 5000); // Show error longer for configuration issues
            }
        } catch (error) {
            logger.error('Error during VK payment:', error);
            
            // Log detailed error for debugging
            logger.debug('VK Payment Error:', {
                error: error,
                error_type: error.error_type,
                error_code: error.error_data?.error_code,
                error_reason: error.error_data?.error_reason
            });
            
            if (unlockMsg) {
                unlockMsg.textContent = 'Ошибка при обработке платежа';
                unlockMsg.style.display = 'block';
                unlockMsg.style.color = '#dc3545'; // Red color for error messages
            }
            
            // Log to Firebase Analytics
            if (window.firebaseAnalytics) {
                window.firebaseAnalytics.logEvent('premium_unlock_vk_error', {
                    error_type: error.error_type,
                    error_code: error.error_data?.error_code,
                    error_reason: error.error_data?.error_reason,
                    app_state: getCurrentAppState()
                });
            }
            
            setTimeout(() => {
                if (unlockMsg) unlockMsg.style.display = 'none';
            }, 3000);
        }
    } else {
        // Not in VK environment - show fallback or alternative payment method
        if (unlockMsg) {
            unlockMsg.textContent = 'Премиум доступ временно недоступен';
            unlockMsg.style.display = 'block';
            unlockMsg.style.color = '#dc3545'; // Red color for error messages
        }
        setTimeout(() => {
            if (unlockMsg) unlockMsg.style.display = 'none';
        }, 3000);
    }
    
    // Log to Firebase Analytics
    if (window.firebaseAnalytics) {
        window.firebaseAnalytics.logEvent('premium_unlock_attempted', {
            app_state: getCurrentAppState(),
            vk_environment: vkBridgeManager && vkBridgeManager.isVKEnvironment(),
            payment_method: vkBridgeManager && vkBridgeManager.isVKEnvironment() ? 'vk_payment' : 'fallback'
        });
    }
}

function completePremiumUnlock() {
    closePremiumModal();
    
    // Try to restart the app UI using VK bridge manager
    if (window.vkBridgeManager && typeof window.vkBridgeManager.restartAppUI === 'function') {
        logger.log('Premium unlocked, restarting app UI...');
        window.vkBridgeManager.restartAppUI();
        return;
    }
    
    // Fallback: manually refresh premium content
    logger.log('VK bridge manager not available, using fallback premium unlock...');
    
    // Check if we're on the results page and refresh premium content
    const resultsScreen = document.getElementById('resultsScreen');
    if (resultsScreen && resultsScreen.style.display !== 'none') {
        // We're on results page, refresh premium content
        const savedResults = localStorage.getItem('mbti_last_results');
        if (savedResults) {
            const results = JSON.parse(savedResults);
            
            // Display premium features
            displayAdvancedInsights(results.personalityType);
            displayFamousPersonalities(results.personalityType);
            createAnalyticsCharts();
            
            // Update premium UI
            updatePremiumUI();
            
            // Generate share link
            const shareLink = document.getElementById('shareLink');
            if (shareLink) {
                const link = `${window.location.origin}${window.location.pathname}?type=${results.personalityType}&premium=1`;
                shareLink.value = link;
            }
        }
    } else {
        // Update premium UI for other pages
        updatePremiumUI();
    }
    
    // Show success notification
    if (vkBridgeManager) {
        vkBridgeManager.showNotification('Премиум доступ успешно активирован!');
    }
}

// Update premium UI function to show/hide premium content
function updatePremiumUI() {
    const isPremiumUser = isPremium();
    const localStorageValue = localStorage.getItem('mbti_premium');
    
    logger.log('updatePremiumUI() called:', {
        isPremiumUser: isPremiumUser,
        localStorageValue: localStorageValue,
        premiumElements: document.querySelectorAll('.premium-locked, .premium-content, .btn-premium').length
    });
    
    // Update premium-locked elements
    document.querySelectorAll('.premium-locked').forEach(el => {
        el.style.display = isPremiumUser ? 'none' : 'block';
    });
    
    // Update premium content elements
    document.querySelectorAll('.premium-content').forEach(el => {
        el.style.display = isPremiumUser ? 'block' : 'none';
    });
    
    // Hide premium buttons if user is premium
    document.querySelectorAll('.btn-premium').forEach(btn => {
        if (isPremiumUser) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'inline-block';
        }
    });
    
    // Update quiz description based on premium status
    updateQuizDescription();
    
    logger.log('updatePremiumUI() completed. Premium status:', isPremiumUser);
}

// Function to display advanced insights
function displayAdvancedInsights(personalityType) {
    if (!isPremium()) return;
    
    const insights = ADVANCED_INSIGHTS[personalityType];
    if (!insights) return;
    
    // Display strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '<ul>' + insights.strengths.map(s => `<li>${s}</li>`).join('') + '</ul>';
    
    // Display weaknesses
    const weaknessesList = document.getElementById('weaknessesList');
    weaknessesList.innerHTML = '<ul>' + insights.weaknesses.map(w => `<li>${w}</li>`).join('') + '</ul>';
    
    // Display careers
    const careerList = document.getElementById('careerList');
    careerList.innerHTML = '<ul>' + insights.careers.map(c => `<li>${c}</li>`).join('') + '</ul>';
    
    // Display development
    const developmentList = document.getElementById('developmentList');
    developmentList.innerHTML = '<ul>' + insights.development.map(d => `<li>${d}</li>`).join('') + '</ul>';
}

// Function to display famous personalities
function displayFamousPersonalities(personalityType) {
    if (!isPremium()) return;
    const famous = (FAMOUS_PERSONALITIES[personalityType] || []).slice().sort(() => Math.random() - 0.5);
    const famousGrid = document.getElementById('famousGrid');
    if (!famousGrid) return;
    if (!famous || !Array.isArray(famous) || famous.length === 0) {
        famousGrid.innerHTML = `<div style="text-align:center; color:#666; padding:12px 0; font-size:0.95rem;">Список пока пуст</div>`;
        return;
    }
    
    // Limit to maximum 8 items
    const limitedFamous = famous.slice(0, 8);
    famousGrid.innerHTML = limitedFamous.map(person => `
        <div class="famous-person">
            <div style="font-size: 3rem; margin-bottom: 10px;">${person.image}</div>
            <h4>${person.name}</h4>
            <p>${person.profession}</p>
        </div>
    `).join('');
}

// Function to create analytics charts
function createAnalyticsCharts() {
    if (!isPremium()) return;
    
    // Get scores from saved results or current quiz
    let scores;
    if (quiz && quiz.scores) {
        scores = quiz.scores;
    } else {
        // Try to get scores from saved results
        const savedResults = localStorage.getItem('mbti_last_results');
        if (savedResults) {
            const results = JSON.parse(savedResults);
            scores = results.scores;
        } else {
            logger.warn('No scores available for charts');
            return;
        }
    }
    
    const totalE = scores.E + scores.I;
    const totalS = scores.S + scores.N;
    const totalT = scores.T + scores.F;
    const totalJ = scores.J + scores.P;
    
    const ePercentage = totalE > 0 ? (scores.E / totalE) * 100 : 50;
    const sPercentage = totalS > 0 ? (scores.S / totalS) * 100 : 50;
    const tPercentage = totalT > 0 ? (scores.T / totalT) * 100 : 50;
    const jPercentage = totalJ > 0 ? (scores.J / totalJ) * 100 : 50;
    
    // Radar chart
    createRadarChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Bar chart
    createBarChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Balance chart
    createBalanceChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Pie chart
    createPieChart(ePercentage, sPercentage, tPercentage, jPercentage);
    
    // Timeline chart (dynamic position based on clarity of preferences)
    const clarity = ((
        Math.abs(ePercentage - 50) +
        Math.abs(sPercentage - 50) +
        Math.abs(tPercentage - 50) +
        Math.abs(jPercentage - 50)
    ) / 4) * 2; // 0..100 scale
    createTimelineChart(clarity);
    
    // Strengths chart
    createStrengthsChart(ePercentage, sPercentage, tPercentage, jPercentage);
}

// Enhanced Radar Chart
function createRadarChart(e, s, t, j) {
    const root = document.getElementById('radarChart');
    if (!root) return;
    root.innerHTML = '';
    const size = 320; // logical size
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const centerX = 160;
    const centerY = 160;
    const radius = 110;

    // Grid circles
    const gridLevels = 5;
    for (let level = 1; level <= gridLevels; level++) {
        const r = (radius * level) / gridLevels;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', `rgba(102,126,234,${0.1 + level * 0.05})`);
        circle.setAttribute('stroke-width', level === gridLevels ? '2' : '1');
        svg.appendChild(circle);
    }

    const labels = ['E/I', 'S/N', 'T/F', 'J/P'];
    const values = [e, s, t, j];
    const points = [];

    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const axisX = centerX + radius * Math.cos(angle);
        const axisY = centerY + radius * Math.sin(angle);

        // Axis line
        const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axis.setAttribute('x1', centerX);
        axis.setAttribute('y1', centerY);
        axis.setAttribute('x2', axisX);
        axis.setAttribute('y2', axisY);
        axis.setAttribute('stroke', 'rgba(102,126,234,0.6)');
        axis.setAttribute('stroke-width', '2');
        svg.appendChild(axis);

        // Label
        const labelX = centerX + (radius + 22) * Math.cos(angle);
        const labelY = centerY + (radius + 22) * Math.sin(angle);
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', labelX - 18);
        labelBg.setAttribute('y', labelY - 10);
        labelBg.setAttribute('rx', '4');
        labelBg.setAttribute('ry', '4');
        labelBg.setAttribute('width', '36');
        labelBg.setAttribute('height', '20');
        labelBg.setAttribute('fill', 'rgba(255,255,255,0.9)');
        svg.appendChild(labelBg);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#333');
        text.textContent = labels[i];
        svg.appendChild(text);

        // Data point
        const value = values[i] / 100;
        const vx = centerX + radius * value * Math.cos(angle);
        const vy = centerY + radius * value * Math.sin(angle);
        points.push([vx, vy]);
    }

    // Polygon
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.map(p => p.join(',')).join(' '));
    polygon.setAttribute('fill', 'rgba(102,126,234,0.25)');
    polygon.setAttribute('stroke', '#667eea');
    polygon.setAttribute('stroke-width', '2');
    svg.appendChild(polygon);

    // Points with glow
    points.forEach(([px, py]) => {
        const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outer.setAttribute('cx', px);
        outer.setAttribute('cy', py);
        outer.setAttribute('r', '6');
        outer.setAttribute('fill', '#667eea');
        outer.setAttribute('filter', 'url(#glow)');
        svg.appendChild(outer);

        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        inner.setAttribute('cx', px);
        inner.setAttribute('cy', py);
        inner.setAttribute('r', '3');
        inner.setAttribute('fill', '#fff');
        svg.appendChild(inner);
    });

    // Center badge
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', centerX);
    center.setAttribute('cy', centerY);
    center.setAttribute('r', '8');
    center.setAttribute('fill', '#667eea');
    svg.appendChild(center);

    // Glow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    root.appendChild(svg);
}

// Bar Chart
function createBarChart(e, s, t, j) {
    const root = document.getElementById('barChart');
    if (!root) return;
    root.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 360 220');
    svg.setAttribute('width', '100%');

    const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
    const scores = [e, s, t, j];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];

    const barWidth = 50;
    const gap = 30;
    const startX = 40;
    const baseY = 170;
    const maxHeight = 120;

    // Axis line
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', startX - 10);
    axis.setAttribute('y1', baseY);
    axis.setAttribute('x2', startX + 4 * (barWidth + gap) - gap + 10);
    axis.setAttribute('y2', baseY);
    axis.setAttribute('stroke', 'rgba(0,0,0,0.15)');
    axis.setAttribute('stroke-width', '2');
    svg.appendChild(axis);

    dimensions.forEach((dim, i) => {
        const x = startX + i * (barWidth + gap);
        const height = (scores[i] / 100) * maxHeight;
        const y = baseY - height;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', colors[i]);
        rect.setAttribute('rx', '6');
        svg.appendChild(rect);

        const pct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pct.setAttribute('x', x + barWidth / 2);
        pct.setAttribute('y', y - 6);
        pct.setAttribute('text-anchor', 'middle');
        pct.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        pct.setAttribute('font-size', '12');
        pct.setAttribute('fill', '#333');
        pct.textContent = `${Math.round(scores[i])}%`;
        svg.appendChild(pct);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x + barWidth / 2);
        label.setAttribute('y', baseY + 16);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        label.setAttribute('font-size', '11');
        label.setAttribute('fill', '#666');
        label.textContent = dim;
        svg.appendChild(label);
    });

    root.appendChild(svg);
}

// Balance Chart (showing balance between preferences)
function createBalanceChart(e, s, t, j) {
    const root = document.getElementById('balanceChart');
    if (!root) return;
    root.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 360 200');
    svg.setAttribute('width', '100%');

    const pairs = [
        { name: 'E/I', leftLabel: 'E', rightLabel: 'I', value: e, leftColor: '#667eea', rightColor: '#764ba2' },
        { name: 'S/N', leftLabel: 'S', rightLabel: 'N', value: s, leftColor: '#f093fb', rightColor: '#f5576c' },
        { name: 'T/F', leftLabel: 'T', rightLabel: 'F', value: t, leftColor: '#4facfe', rightColor: '#00f2fe' },
        { name: 'J/P', leftLabel: 'J', rightLabel: 'P', value: j, leftColor: '#43e97b', rightColor: '#38f9d7' }
    ];

    const barX = 60;
    const barWidth = 240;
    const barHeight = 18;
    const rowGap = 28;

    pairs.forEach((pair, index) => {
        const y = 30 + index * rowGap;
        const centerX = barX + barWidth / 2;
        const half = barWidth / 2;
        const leftWidth = half * (pair.value / 100);
        const rightWidth = half * (1 - pair.value / 100);

        // Track background
        const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        track.setAttribute('x', barX);
        track.setAttribute('y', y);
        track.setAttribute('width', barWidth);
        track.setAttribute('height', barHeight);
        track.setAttribute('rx', '9');
        track.setAttribute('fill', '#f3f4f6');
        svg.appendChild(track);

        // Center divider
        const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        divider.setAttribute('x1', centerX);
        divider.setAttribute('y1', y);
        divider.setAttribute('x2', centerX);
        divider.setAttribute('y2', y + barHeight);
        divider.setAttribute('stroke', '#e5e7eb');
        divider.setAttribute('stroke-width', '2');
        svg.appendChild(divider);

        // Left segment
        if (leftWidth > 0.5) {
            const left = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            left.setAttribute('x', centerX - leftWidth);
            left.setAttribute('y', y);
            left.setAttribute('width', leftWidth);
            left.setAttribute('height', barHeight);
            left.setAttribute('fill', pair.leftColor);
            left.setAttribute('rx', '9');
            svg.appendChild(left);
        }

        // Right segment
        if (rightWidth > 0.5) {
            const right = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            right.setAttribute('x', centerX);
            right.setAttribute('y', y);
            right.setAttribute('width', rightWidth);
            right.setAttribute('height', barHeight);
            right.setAttribute('fill', pair.rightColor);
            right.setAttribute('rx', '9');
            svg.appendChild(right);
        }

        // Side labels
        const leftLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftLabel.setAttribute('x', barX - 12);
        leftLabel.setAttribute('y', y + barHeight - 2);
        leftLabel.setAttribute('text-anchor', 'end');
        leftLabel.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        leftLabel.setAttribute('font-size', '12');
        leftLabel.setAttribute('fill', '#6b7280');
        const leftPct = Math.round(pair.value);
        leftLabel.textContent = `${pair.leftLabel} ${leftPct}%`;
        svg.appendChild(leftLabel);

        const rightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightLabel.setAttribute('x', barX + barWidth + 12);
        rightLabel.setAttribute('y', y + barHeight - 2);
        rightLabel.setAttribute('text-anchor', 'start');
        rightLabel.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        rightLabel.setAttribute('font-size', '12');
        rightLabel.setAttribute('fill', '#6b7280');
        const rightPct = 100 - leftPct;
        rightLabel.textContent = `${pair.rightLabel} ${rightPct}%`;
        svg.appendChild(rightLabel);
    });

    root.appendChild(svg);
}

// Pie Chart (showing preference distribution)
function createPieChart(e, s, t, j) {
    const root = document.getElementById('pieChart');
    if (!root) return;
    root.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 200');
    svg.setAttribute('width', '100%');

    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const data = [
        { label: 'E/I', value: e, color: '#667eea' },
        { label: 'S/N', value: s, color: '#764ba2' },
        { label: 'T/F', value: t, color: '#f093fb' },
        { label: 'J/P', value: j, color: '#f5576c' }
    ];
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let currentAngle = -Math.PI / 2;
    data.forEach((d, idx) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
        const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);
        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const dPath = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', dPath);
        path.setAttribute('fill', d.color);
        svg.appendChild(path);

        const legendY = 30 + idx * 22;
        const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        swatch.setAttribute('x', 190);
        swatch.setAttribute('y', legendY - 10);
        swatch.setAttribute('width', 12);
        swatch.setAttribute('height', 12);
        swatch.setAttribute('fill', d.color);
        swatch.setAttribute('rx', '2');
        svg.appendChild(swatch);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', 210);
        label.setAttribute('y', legendY);
        label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#333');
        label.textContent = `${d.label}: ${Math.round(d.value)}%`;
        svg.appendChild(label);

        currentAngle += sliceAngle;
    });

    root.appendChild(svg);
}

// Minimalistic Timeline Chart
function createTimelineChart(clarityValue = 50) {
    const root = document.getElementById('timelineChart');
    if (!root) return;
    root.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 150');
    svg.setAttribute('width', '100%');

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 40);
    line.setAttribute('y1', 75);
    line.setAttribute('x2', 280);
    line.setAttribute('y2', 75);
    line.setAttribute('stroke', '#e0e0e0');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);

    // Fixed equally-spaced anchors for Past, Now, Future
    const minX = 60;
    const midX = 160;
    const maxX = 260;
    // Dynamic user state marker mapped along the same range
    const stateX = minX + (Math.max(0, Math.min(100, clarityValue)) / 100) * (maxX - minX);

    const points = [
        { x: minX, label: 'Прошлое', color: '#9ca3af' },
        { x: midX, label: 'Настоящее', color: '#667eea' },
        { x: maxX, label: 'Будущее', color: '#9ca3af' }
    ];

    points.forEach((p, idx) => {
        if (idx === 1) {
            const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            halo.setAttribute('cx', p.x);
            halo.setAttribute('cy', 75);
            halo.setAttribute('r', '12');
            halo.setAttribute('fill', 'rgba(102,126,234,0.1)');
            svg.appendChild(halo);
        }

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', 75);
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', p.color);
        svg.appendChild(dot);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', p.x);
        label.setAttribute('y', 100);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        label.setAttribute('font-size', '11');
        label.setAttribute('fill', '#6b7280');
        label.textContent = p.label;
        svg.appendChild(label);
    });

    // Additional dynamic user state marker along the same range
    const stateLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    stateLine.setAttribute('x1', stateX);
    stateLine.setAttribute('y1', 67);
    stateLine.setAttribute('x2', stateX);
    stateLine.setAttribute('y2', 83);
    stateLine.setAttribute('stroke', '#667eea');
    stateLine.setAttribute('stroke-width', '2');
    svg.appendChild(stateLine);

    const stateDotHalo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    stateDotHalo.setAttribute('cx', stateX);
    stateDotHalo.setAttribute('cy', 75);
    stateDotHalo.setAttribute('r', '9');
    stateDotHalo.setAttribute('fill', 'rgba(102,126,234,0.12)');
    svg.appendChild(stateDotHalo);

    const stateDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    stateDot.setAttribute('cx', stateX);
    stateDot.setAttribute('cy', 75);
    stateDot.setAttribute('r', '5');
    stateDot.setAttribute('fill', '#ff6b6b');
    svg.appendChild(stateDot);

    const stateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    stateLabel.setAttribute('x', stateX);
    stateLabel.setAttribute('y', 55);
    stateLabel.setAttribute('text-anchor', 'middle');
    stateLabel.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    stateLabel.setAttribute('font-size', '10');
    stateLabel.setAttribute('fill', '#374151');
    stateLabel.textContent = 'Текущая позиция';
    svg.appendChild(stateLabel);

    root.appendChild(svg);
}

// Strengths Chart (showing personality strengths)
function createStrengthsChart(e, s, t, j) {
    const root = document.getElementById('strengthsChart');
    if (!root) return;
    root.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 140');
    svg.setAttribute('width', '100%');

    const strengths = [
        { name: 'Аналитический', value: Math.max(t, 100 - t), color: '#667eea' },
        { name: 'Креативный', value: Math.max(s, 100 - s), color: '#764ba2' },
        { name: 'Социальный', value: Math.max(e, 100 - e), color: '#f093fb' },
        { name: 'Организованный', value: Math.max(j, 100 - j), color: '#f5576c' }
    ];

    const barHeight = 22;
    const spacing = 12;
    strengths.forEach((st, idx) => {
        const y = 8 + idx * (barHeight + spacing);
        const width = (st.value / 100) * 180;

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', 10);
        label.setAttribute('y', y + 16);
        label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#333');
        label.textContent = st.name;
        svg.appendChild(label);

        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', 130);
        bar.setAttribute('y', y);
        bar.setAttribute('width', width);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', st.color);
        bar.setAttribute('rx', '6');
        svg.appendChild(bar);

        const pct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pct.setAttribute('x', 130 + width + 8);
        pct.setAttribute('y', y + 16);
        pct.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        pct.setAttribute('font-size', '12');
        pct.setAttribute('fill', '#333');
        pct.textContent = `${Math.round(st.value)}%`;
        svg.appendChild(pct);
    });

    root.appendChild(svg);
}


// Function to copy share link
function copyShareLink() {
    if (!isPremium()) return;
    
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        const personalityType = document.getElementById('personalityType').textContent;
        const link = `${window.location.origin}${window.location.pathname}?type=${personalityType}&premium=1`;
        
        shareLink.value = link;
        
        // Copy to clipboard
        shareLink.select();
        document.execCommand('copy');
    }
    
    // Show feedback
    const btn = document.querySelector('#shareContent .btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

// App state: 'development' or 'release'
const APP_STATE = 'release'; // Change to 'development' for development

// Get state from URL parameter or use default
function getAppStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    if (stateParam === 'development' || stateParam === 'release') {
        return stateParam;
    }
    return APP_STATE;
}

// Update URL with current state
function updateURLWithState(state) {
    const url = new URL(window.location);
    url.searchParams.set('state', state);
    window.history.replaceState({}, '', url);
}

// Get current app state
function getCurrentAppState() {
    return getAppStateFromURL();
}

// Function to show/hide development tools
function updateDevToolsVisibility() {
    const devTools = document.getElementById('devTools');
    if (devTools) {
        devTools.style.display = getCurrentAppState() === 'development' ? 'block' : 'none';
    }
}

// Show/hide dev tools on welcome screen
function updateDevToolsWelcomeVisibility() {
    const devToolsWelcome = document.getElementById('devToolsWelcome');
    if (devToolsWelcome) {
        devToolsWelcome.style.display = getCurrentAppState() === 'development' ? 'block' : 'none';
    }
}

// Fill all answers randomly from welcome screen
function fillAllRandomAnswersFromWelcome() {
    if (getCurrentAppState() !== 'development') return;
    // Start quiz and fill all answers randomly
    quiz = new MBTIQuiz();
    for (let i = 0; i < quiz.questions.length; i++) {
        const randomAnswer = Math.floor(Math.random() * 4) + 1;
        quiz.answers[i] = randomAnswer;
        const question = quiz.questions[i];
        const weight = question.weights[randomAnswer - 1];
        if (question.dimension === 'EI') {
            if (weight > 0) quiz.scores.I += weight;
            else if (weight < 0) quiz.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) quiz.scores.S += weight;
            else if (weight < 0) quiz.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) quiz.scores.T += weight;
            else if (weight < 0) quiz.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) quiz.scores.J += weight;
            else if (weight < 0) quiz.scores.P += Math.abs(weight);
        }
    }
    quiz.currentQuestion = quiz.questions.length - 1;
    quiz.selectedOption = quiz.answers[quiz.currentQuestion];
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    quiz.showResults();
    updateDevToolsVisibility();
    updateDevToolsWelcomeVisibility();
}

// Fill premium quiz with random answers from welcome screen
function fillPremiumRandomAnswers() {
    if (getCurrentAppState() !== 'development') return;
    
    // Check if user is premium
    if (!isPremium()) {
    if (window.showAppAlert) {
        window.showAppAlert('Премиум функции доступны только для премиум пользователей');
    } else {
        alert('Премиум функции доступны только для премиум пользователей');
    }
        return;
    }
    
    // Create quiz instance and set to leadership test specifically
    quiz = new MBTIQuiz();
    quiz.currentQuizType = 'leadership';
    quiz.generateSpecializedQuestions();
    
    // Fill all questions with random answers
    for (let i = 0; i < quiz.questions.length; i++) {
        const randomAnswer = Math.floor(Math.random() * 4) + 1;
        quiz.answers[i] = randomAnswer;
        const question = quiz.questions[i];
        const weight = question.weights[randomAnswer - 1];
        if (question.dimension === 'EI') {
            if (weight > 0) quiz.scores.I += weight;
            else if (weight < 0) quiz.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) quiz.scores.S += weight;
            else if (weight < 0) quiz.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) quiz.scores.T += weight;
            else if (weight < 0) quiz.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) quiz.scores.J += weight;
            else if (weight < 0) quiz.scores.P += Math.abs(weight);
        }
    }
    
    quiz.currentQuestion = quiz.questions.length - 1;
    quiz.selectedOption = quiz.answers[quiz.currentQuestion];
    
    // Update quiz title to show leadership test
    updateQuizTitle('leadership');
    
    // Hide welcome screen and show results
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    
    quiz.showResults();
    updateDevToolsVisibility();
    updateDevToolsWelcomeVisibility();
}

// Update dev tools visibility on mode change
function updateDevToolsAll() {
    updateDevToolsVisibility();
    updateDevToolsWelcomeVisibility();
}

// Function to fill random answers for testing
function fillRandomAnswers() {
    if (getCurrentAppState() !== 'development') return;
    
    // Fill all remaining questions with random answers
    for (let i = this.currentQuestion; i < this.questions.length; i++) {
        const randomAnswer = Math.floor(Math.random() * 4) + 1; // 1-4
        this.answers[i] = randomAnswer;
        
        // Update scores based on random answer
        const question = this.questions[i];
        const weight = question.weights[randomAnswer - 1];
        
        if (question.dimension === 'EI') {
            if (weight > 0) this.scores.I += weight;
            else if (weight < 0) this.scores.E += Math.abs(weight);
        } else if (question.dimension === 'SN') {
            if (weight > 0) this.scores.S += weight;
            else if (weight < 0) this.scores.N += Math.abs(weight);
        } else if (question.dimension === 'TF') {
            if (weight > 0) this.scores.T += weight;
            else if (weight < 0) this.scores.F += Math.abs(weight);
        } else if (question.dimension === 'JP') {
            if (weight > 0) this.scores.J += weight;
            else if (weight < 0) this.scores.P += Math.abs(weight);
        }
    }
    
    // Jump to results
    this.currentQuestion = this.questions.length - 1;
    this.selectedOption = this.answers[this.currentQuestion];
    this.showResults();
    
    }

// Function to change app state programmatically
function changeAppState(newState) {
    if (newState === 'development' || newState === 'release') {
        updateURLWithState(newState);
        }
}

// Function to toggle between development and release states
function toggleAppState() {
    const currentState = getCurrentAppState();
    const newState = currentState === 'development' ? 'release' : 'development';
    changeAppState(newState);
}

// Function to view last results
function viewLastResults() {
    if (quiz && quiz.hasPreviousResults()) {
        // Hide welcome screen
        document.getElementById('welcomeScreen').style.display = 'none';
        
        // Show results screen
        document.getElementById('resultsScreen').style.display = 'block';
        
        // Display last results
        quiz.displayLastResults();
        
        // Update premium UI
        updatePremiumUI();
        
        // Show the "На главную" button when viewing last results
        const onMainPageBtn = document.getElementById('onMainPageBtn');
        if (onMainPageBtn) {
            onMainPageBtn.style.display = 'inline-block';
        }
        
        // Hide the subscription button when viewing last results
        const subscriptionBtn = document.getElementById('subscriptionBtn');
        if (subscriptionBtn) {
            subscriptionBtn.style.display = 'none';
        }
    }
}

// Function to check and show last results button
function checkAndShowLastResultsButton() {
    const viewLastResultsBtn = document.getElementById('viewLastResultsBtn');
    if (!viewLastResultsBtn) return;
    const hasPerTest = quiz && typeof quiz.hasPreviousResultsForTest === 'function' && quiz.hasPreviousResultsForTest();
    const hasAny = quiz && typeof quiz.hasPreviousResults === 'function' && quiz.hasPreviousResults();
    if (hasPerTest || hasAny) {
        viewLastResultsBtn.style.display = 'inline-block';
    } else {
        viewLastResultsBtn.style.display = 'none';
    }
}

// Function to update quiz description based on premium status
function updateQuizDescription() {
    const questionCountSpan = document.getElementById('questionCount');
    const quizDescription = document.getElementById('quizDescription');
    const premiumQuizTypes = document.getElementById('premiumQuizTypes');
    
    // Add null checks to prevent errors

    if (questionCountSpan) {
        questionCountSpan.textContent = '61';
    }
    if (quizDescription) {
        quizDescription.innerHTML = localizationManager.get('ui.mbtiDescription', { count: 61 });
    }
    if (isPremium()) {
        if (premiumQuizTypes) {
            premiumQuizTypes.style.display = 'block';
            // Enable all premium quiz buttons
            enablePremiumQuizButtons();
        }
    } else {
        
        if (premiumQuizTypes) {
            premiumQuizTypes.style.display = 'block';
            // Disable all premium quiz buttons
            disablePremiumQuizButtons();
        }
    }
}

// Function to disable premium quiz buttons for non-premium users
function disablePremiumQuizButtons() {
    const premiumButtons = document.querySelectorAll('.btn-premium-quiz');
    premiumButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        button.style.position = 'relative';
        
        // Add lock icon overlay
        if (!button.querySelector('.premium-lock-overlay')) {
            const lockOverlay = document.createElement('div');
            lockOverlay.className = 'premium-lock-overlay';
            lockOverlay.innerHTML = '<i class="fas fa-lock"></i>';
            lockOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                top: 25px;
                right: 15px;
                color: #ffd700;
                font-size: 16px;
                pointer-events: none;
            `;
            button.appendChild(lockOverlay);
        }
        
        // Update onclick to show premium modal
        button.onclick = function() {
            openPremiumModal();
        };
    });
}

// Function to enable premium quiz buttons for premium users
function enablePremiumQuizButtons() {
    const premiumButtons = document.querySelectorAll('.btn-premium-quiz');
    premiumButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        
        // Remove lock icon overlay
        const lockOverlay = button.querySelector('.premium-lock-overlay');
        if (lockOverlay) {
            lockOverlay.remove();
        }
        
        // Restore original onclick functionality
        const quizType = button.getAttribute('data-quiz-type') || button.onclick.toString().match(/startQuizType\('([^']+)'\)/)?.[1];
        if (quizType) {
            button.onclick = function() {
                startQuizType(quizType);
            };
        }
    });
}

// Function to update quiz title based on quiz type
function updateQuizTitle(quizType) {
    const quizTitleElement = document.getElementById('currentQuizTitle');
    if (quizTitleElement) {
        let title = '';
        
        if (quizType === 'mbti') {
            title = localizationManager.get('quizTypes.mbti.name');
        } else {
            // Get the localized name for premium quiz types
            const quizTypeKey = `quizTypes.${quizType}.name`;
            title = localizationManager.get(quizTypeKey) || quizType;
        }
        
        quizTitleElement.textContent = title;
    }
}

// Function to start different quiz types
function startQuizType(quizType) {
    if (!isPremium()) {
        openPremiumModal();
        return;
    }
    
    // Set current quiz type
    quiz.currentQuizType = quizType;
    
    // Update quiz title to show selected test name
    updateQuizTitle(quizType);
    
    // Start the quiz (will auto-show saved results if present)
    quiz.startQuiz();
    
    // Log to Firebase Analytics
    if (window.firebaseAnalytics) {
        window.firebaseAnalytics.logEvent('premium_quiz_started', {
            quiz_type: quizType,
            is_premium: isPremium()
        });
    }
}

// Modal click-outside-to-close functionality
function setupModalClickOutside() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            // Check if the click was on the modal backdrop (not the content)
            if (e.target === modal) {
                // Find the close function based on modal type
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    const modalId = modal.id;
                    
                    // Determine which close function to call based on modal ID
                    switch (modalId) {
                        case 'typesModal':
                            closeTypesModal();
                            break;
                        case 'premiumModal':
                            closePremiumModal();
                            break;
                        case 'exitQuizModal':
                            closeExitQuizModal();
                            break;
                        case 'subscriptionModal':
                            closeSubscriptionModal();
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
}

// Initialize VK Bridge Manager
let vkBridgeManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize VK Bridge Manager
    try {
        vkBridgeManager = new VKBridgeManager();
        window.vkBridgeManager = vkBridgeManager;
        
        // Start banner ad timer for non-premium users in VK environment
        if (vkBridgeManager.isVKEnvironment() && !isPremium()) {
            startBannerAdTimer();
        }
    } catch (error) {
        logger.error('VK Bridge Manager not available:', error);
        window.vkBridgeManager = null;
    }
    
    // Initialize the quiz
    quiz = new MBTIQuiz();
    
    updatePremiumUI();
    updateDevToolsAll();
    
    // Update quiz description based on premium status
    updateQuizDescription();
    
    // Check for previous results and show button if available
    checkAndShowLastResultsButton();
    
    // Setup modal click-outside-to-close functionality
    setupModalClickOutside();
    
    // Update Firebase debug button appearance
    updateFirebaseDebugButton();
});

// Initialize the quiz
let quiz;

// Utility function for logging
function log(message, data = null) {
    if (data) {
        console.log(`[Adaptive] ${message}`, data);
    } else {
        console.log(`[Adaptive] ${message}`);
    }
}

// Banner ad management
let bannerAdShown = false;
let bannerAdTimer = null;

// Global functions for HTML onclick handlers
function startQuiz() {
    quiz = new MBTIQuiz();
    
    // Set default MBTI quiz title
    updateQuizTitle('mbti');
    
    quiz.startQuiz();
    
    // Hide banner ad when starting quiz
    hideBannerAd();
    stopBannerAdTimer();
}

function selectOption(optionNumber) {
    if (quiz) quiz.selectOption(optionNumber);
}

function nextQuestion() {
    if (quiz) quiz.nextQuestion();
}

function previousQuestion() {
    if (quiz) quiz.previousQuestion();
}

function restartQuiz() {
    if (quiz) quiz.restartQuiz();
    
    // Show banner ad when returning to welcome screen
    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        setTimeout(() => {
            if (!isPremium()) {
                showBannerAd();
            }
        }, 2000); // Show after 2 seconds
    }

    // Hide reset button after restart
    const resetBtn = document.getElementById('resetTestBtn');
    if (resetBtn) resetBtn.style.display = 'none';
}

// Reset current test data and start over
function resetCurrentTest() {
    if (!quiz) return;
    // Confirm reset using in-app modal
    const title = localizationManager.get('ui.resetConfirmTitle');
    const msg = localizationManager.get('ui.resetConfirmMessage');
    const content = `
        <div class="help-modal-content">
            <span class="close" onclick="closeHelpModal()">&times;</span>
            <h2>${title}</h2>
            <div class="help-content">
                <p>${msg}</p>
            </div>
            <div class="help-modal-actions">
                <button class="btn btn-secondary" onclick="closeHelpModal()">
                    ${localizationManager.get('ui.cancel') || 'Cancel'}
                </button>
                <button class="btn btn-danger" id="confirmResetBtn">
                    ${localizationManager.get('ui.restartQuiz') || 'Restart'}
                </button>
            </div>
        </div>
    `;
    showHelpModal(content);
    // Attach one-time handler for confirm
    setTimeout(() => {
        const btn = document.getElementById('confirmResetBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                closeHelpModal();
                proceedResetCurrentTest();
            }, { once: true });
        }
    }, 0);
    return;

    function proceedResetCurrentTest() {
        // Clear saved results for this test
        try {
            localStorage.removeItem(quiz.getTestStorageKey());
        } catch (e) {}
        // Reset runtime state
        quiz.currentQuestion = 0;
        quiz.answers = [];
        quiz.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        quiz.selectedOption = null;
        
        // Start quiz from the beginning with current quiz type
        if (quiz && typeof quiz.startQuiz === 'function') {
            quiz.startQuiz();
        } else if (typeof startQuiz === 'function') {
            startQuiz();
        }
    }
}

function shareResults() {
    if (quiz) quiz.shareResults();
}

function exitQuiz() {
    // Show custom confirmation modal
    const exitQuizModal = document.getElementById('exitQuizModal');
    if (exitQuizModal) {
        exitQuizModal.style.display = 'flex';
    }
}

function closeExitQuizModal() {
    const exitQuizModal = document.getElementById('exitQuizModal');
    if (exitQuizModal) {
        exitQuizModal.style.display = 'none';
    }
}

function confirmExitQuiz() {
    // Close the modal first
    closeExitQuizModal();
    // In-app reset without page reload to avoid unnecessary server calls
    const quizQuestions = document.getElementById('quizQuestions');
    if (quizQuestions) quizQuestions.style.display = 'none';
    // Use existing restart flow to show welcome screen and reset state
    if (typeof restartQuiz === 'function') {
        restartQuiz();
    } else if (quiz && typeof quiz.restartQuiz === 'function') {
        quiz.restartQuiz();
    } else {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) welcomeScreen.style.display = 'block';
    }
}

// Make all functions available globally for HTML onclick handlers
window.startQuiz = startQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartQuiz = restartQuiz;
window.shareResults = shareResults;
window.exitQuiz = exitQuiz;
window.closeExitQuizModal = closeExitQuizModal;
window.confirmExitQuiz = confirmExitQuiz;
window.openTypesModal = openTypesModal;
window.closeTypesModal = closeTypesModal;
window.openPremiumModal = openPremiumModal;
window.closePremiumModal = closePremiumModal;
window.unlockPremium = unlockPremium;
window.toggleAppState = toggleAppState;
window.viewLastResults = viewLastResults;
window.startQuizType = startQuizType;
window.fillAllRandomAnswersFromWelcome = fillAllRandomAnswersFromWelcome;
window.fillPremiumRandomAnswers = fillPremiumRandomAnswers;
window.copyShareLink = copyShareLink;
window.resetCurrentTest = resetCurrentTest;

/**
 * Update Firebase Analytics debug button appearance
 */
function updateFirebaseDebugButton() {
    const debugBtn = document.getElementById('debugToggleBtn');
    if (debugBtn) {
        // Only show debug button in development mode
        const isDevelopment = getCurrentAppState() === 'development';
        debugBtn.style.display = isDevelopment ? 'inline-block' : 'none';
        
        if (isDevelopment) {
            const isDebugOn = window.firebaseAnalyticsDebug;
            debugBtn.innerHTML = `<i class="fas fa-bug"></i> Firebase Debug ${isDebugOn ? 'ON' : 'OFF'}`;
            debugBtn.style.backgroundColor = isDebugOn ? '#28a745' : '#6c757d';
            debugBtn.style.color = isDebugOn ? 'white' : 'white';
        }
    }
}

// Override the toggle function to also update the button
const originalToggle = window.toggleFirebaseAnalyticsDebug;
window.toggleFirebaseAnalyticsDebug = () => {
    // Only allow toggle in development mode
    if (getCurrentAppState() === 'development') {
        originalToggle();
        updateFirebaseDebugButton();
    } else {
        logger.warn('Firebase Analytics debug toggle is only available in development mode');
    }
};

// Development function to clear localStorage
function clearLocalStorage() {
    if (getCurrentAppState() === 'development') {
        const confirmed = confirm('Are you sure you want to clear all localStorage data? This will reset the application state.');
        if (confirmed) {
            localStorage.clear();
    if (window.showAppAlert) {
        window.showAppAlert('localStorage cleared successfully!');
    } else {
        alert('localStorage cleared successfully!');
    }
            // Refresh the page to reset all state
            location.reload();
        }
    } else {
        logger.warn('clearLocalStorage called in non-development mode');
    }
}

window.clearLocalStorage = clearLocalStorage;


// Function to notify VKBridgeManager that global functions are ready
function notifyGlobalFunctionsReady() {
    logger.log('Global functions are ready, notifying VKBridgeManager');
    
    // Debug: Check what's actually available
    logger.debug('Available global functions:', {
        setPremium: typeof window.setPremium,
        updatePremiumUI: typeof window.updatePremiumUI,
        isPremium: typeof window.isPremium,
        vkBridgeManager: typeof window.vkBridgeManager
    });
    
    // Check if VKBridgeManager exists and has a method to handle this
    if (window.vkBridgeManager && window.vkBridgeManager.updateGlobalPremiumStatus) {
        // Get current premium status and update UI
        const currentPremium = isPremium();
        logger.log('Current premium status:', currentPremium);
        
        // Update global premium status to trigger UI update
        window.vkBridgeManager.updateGlobalPremiumStatus(currentPremium);
    } else {
        logger.warn('VKBridgeManager not available for UI update');
    }
}

// Call this when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    logger.log('DOM loaded, ensuring global functions are exposed');
    ensureGlobalFunctionsExposed();
    setTimeout(notifyGlobalFunctionsReady, 100);
});

window.notifyGlobalFunctionsReady = notifyGlobalFunctionsReady;

// Function to ensure global functions are exposed
function ensureGlobalFunctionsExposed() {
    logger.log('Ensuring global functions are exposed...');
    
    // Check if functions exist locally
    logger.debug('Local function availability:', {
        setPremium: typeof setPremium,
        updatePremiumUI: typeof updatePremiumUI,
        isPremium: typeof isPremium
    });
    
    // Explicitly expose functions to window if they exist locally
    if (typeof setPremium === 'function' && !window.setPremium) {
        logger.log('Exposing setPremium to window');
        window.setPremium = setPremium;
    }
    
    if (typeof updatePremiumUI === 'function' && !window.updatePremiumUI) {
        logger.log('Exposing updatePremiumUI to window');
        window.updatePremiumUI = updatePremiumUI;
    }
    
    if (typeof isPremium === 'function' && !window.isPremium) {
        logger.log('Exposing isPremium to window');
        window.isPremium = isPremium;
    }
    
    // Check final state
    logger.debug('Final global function availability:', {
        setPremium: typeof window.setPremium,
        updatePremiumUI: typeof window.updatePremiumUI,
        isPremium: typeof window.isPremium
    });
}

window.ensureGlobalFunctionsExposed = ensureGlobalFunctionsExposed;

// Manual test function to check global function status
function checkGlobalFunctionStatus() {
    logger.log('=== GLOBAL FUNCTION STATUS CHECK ===');
    
    // Check local functions
    logger.debug('Local functions:', {
        setPremium: typeof setPremium,
        updatePremiumUI: typeof updatePremiumUI,
        isPremium: typeof isPremium
    });
    
    // Check window functions
    logger.debug('Window functions:', {
        setPremium: typeof window.setPremium,
        updatePremiumUI: typeof window.updatePremiumUI,
        isPremium: typeof window.isPremium
    });
    
    // Check VKBridgeManager
    logger.debug('VKBridgeManager:', {
        exists: typeof window.vkBridgeManager,
        updateGlobalPremiumStatus: window.vkBridgeManager ? typeof window.vkBridgeManager.updateGlobalPremiumStatus : 'N/A'
    });
    
    // Try to manually expose functions
    logger.log('Attempting to expose functions...');
    ensureGlobalFunctionsExposed();
    
    // Check again after exposure
    logger.debug('After exposure attempt:', {
        setPremium: typeof window.setPremium,
        updatePremiumUI: typeof window.updatePremiumUI,
        isPremium: typeof window.isPremium
    });
    
    logger.log('=== END STATUS CHECK ===');
}

window.checkGlobalFunctionStatus = checkGlobalFunctionStatus;

// Subscription Management Functions
function openSubscriptionModal() {
    const subscriptionModal = document.getElementById('subscriptionModal');
    if (subscriptionModal) {
        subscriptionModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateSubscriptionModal();
    }
}

function closeSubscriptionModal() {
    const subscriptionModal = document.getElementById('subscriptionModal');
    if (subscriptionModal) {
        subscriptionModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function updateSubscriptionModal() {
    const isPremiumUser = isPremium();
    const statusIndicator = document.getElementById('subscriptionStatus');
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    const restoreBtn = document.getElementById('restoreSubscriptionBtn');
    
    if (statusIndicator) {
        if (isPremiumUser) {
            statusIndicator.className = 'status-indicator premium';
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Премиум активен</span>';
        } else {
            statusIndicator.className = 'status-indicator free';
            statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Премиум не активен</span>';
        }
    }
    
    if (cancelBtn) {
        cancelBtn.style.display = isPremiumUser ? 'inline-block' : 'none';
    }
    
    if (restoreBtn) {
        restoreBtn.style.display = isPremiumUser ? 'none' : 'inline-block';
    }
    
    // Update subscription tiers
    updateSubscriptionTiers();
    
    // Update subscription info
    updateSubscriptionInfo();
}

function updateSubscriptionTiers() {
    const isPremiumUser = isPremium();
    
    // Update current plan indicators
    const freeTier = document.querySelector('.free-tier .tier-status');
    const premiumTier = document.querySelector('.premium-tier .tier-status');
    
    if (freeTier) {
        if (isPremiumUser) {
            freeTier.innerHTML = '';
        } else {
            freeTier.innerHTML = '<span class="current-plan">Текущий план</span>';
        }
    }
    
    if (premiumTier) {
        if (isPremiumUser) {
            premiumTier.innerHTML = '<span class="current-plan">Текущий план</span>';
        } else {
            premiumTier.innerHTML = '';
        }
    }
}

function updateSubscriptionInfo() {
    const isPremiumUser = isPremium();
    const startDate = document.getElementById('subscriptionStartDate');
    const endDate = document.getElementById('subscriptionEndDate');
    const nextPayment = document.getElementById('nextPaymentDate');
    const price = document.getElementById('subscriptionPrice');
    
    if (isPremiumUser) {
        // Get subscription data from localStorage or use defaults
        const subscriptionData = JSON.parse(localStorage.getItem('mbti_subscription_data') || '{}');
        const startDateValue = subscriptionData.startDate || new Date().toLocaleDateString();
        const endDateValue = subscriptionData.endDate || 'Бессрочно';
        const nextPaymentValue = subscriptionData.nextPayment || 'Нет';
        const priceValue = subscriptionData.price || 'Бесплатно (демо)';
        
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
}

function cancelSubscription() {
    const confirmed = confirm('Вы уверены, что хотите отменить подписку?');
    if (confirmed) {
        setPremium(false);
        updateSubscriptionModal();
        updatePremiumUI();
    if (window.showAppAlert) {
        window.showAppAlert('Подписка отменена. Вы вернулись к бесплатной версии.');
    } else {
        alert('Подписка отменена. Вы вернулись к бесплатной версии.');
    }
    }
}

function restoreSubscription() {
    const confirmed = confirm('Восстановить премиум подписку?');
    if (confirmed) {
        setPremium(true);
        updateSubscriptionModal();
        updatePremiumUI();
    if (window.showAppAlert) {
        window.showAppAlert('Премиум подписка восстановлена!');
    } else {
        alert('Премиум подписка восстановлена!');
    }
    }
}

function contactSupport() {
    if (window.showAppAlert) {
        window.showAppAlert('Для связи с поддержкой отправьте email на: personalitiesresearch@mail.ru', 'Связаться с поддержкой');
    } else {
        alert('Для связи с поддержкой отправьте email на: personalitiesresearch@mail.ru');
    }
}

function viewBillingHistory() {
    if (window.showAppAlert) {
        window.showAppAlert('История платежей будет доступна в будущих обновлениях.');
    } else {
        alert('История платежей будет доступна в будущих обновлениях.');
    }
}

// Make subscription functions available globally
window.openSubscriptionModal = openSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.cancelSubscription = cancelSubscription;
window.restoreSubscription = restoreSubscription;

/**
 * Purchase premium subscription with VK payment
 */
async function purchasePremiumSubscription(tier = 'monthly') {
    const subscriptionConfigs = {
        monthly: {
            id: 'premium_monthly',
            name: 'Premium Monthly',
            price: 199, // 1.99 RUB in kopecks
            description: 'Premium access for 1 month'
        },
        yearly: {
            id: 'premium_yearly',
            name: 'Premium Yearly',
            price: 1990, // 19.90 RUB in kopecks
            description: 'Premium access for 1 year (save 17%)'
        },
        lifetime: {
            id: 'premium_lifetime',
            name: 'Premium Lifetime',
            price: 4990, // 49.90 RUB in kopecks
            description: 'Lifetime premium access'
        }
    };
    
    const config = subscriptionConfigs[tier] || subscriptionConfigs.monthly;
    
    // Check if we're in VK environment
    if (!vkBridgeManager || !vkBridgeManager.isVKEnvironment()) {
    if (window.showAppAlert) {
        window.showAppAlert('Premium subscriptions are only available in VK environment');
    } else {
        alert('Premium subscriptions are only available in VK environment');
    }
        return;
    }
    
    try {
        // Show VK order box for the selected tier
        const orderResult = await vkBridgeManager.showOrderBox(config.id, config.name);
        
        if (orderResult.success) {
            // Process the order result
            const paymentResult = await vkBridgeManager.handleOrderBoxResult(orderResult);
            
            if (paymentResult.success) {
                // Payment successful - unlock premium
                
                // Save subscription data
                const subscriptionData = {
                    tier: tier,
                    startDate: new Date().toLocaleDateString(),
                    endDate: tier === 'lifetime' ? 'Бессрочно' : 
                             tier === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() :
                             new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    nextPayment: tier === 'lifetime' ? 'Нет' : 
                                tier === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() :
                                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    price: `${config.price / 100} RUB`,
                    orderId: paymentResult.order_id
                };
                

                
                // Show success notification
                vkBridgeManager.showNotification(`Подписка ${config.name} успешно активирована!`);
                
                // Update UI
                updatePremiumUI();
                updateSubscriptionModal();
                
                // Close subscription modal if open
                closeSubscriptionModal();
                
                // Log to Firebase Analytics
                if (window.firebaseAnalytics) {
                    window.firebaseAnalytics.logEvent('subscription_purchased', {
                        tier: tier,
                        price: config.price,
                        currency: 'RUB',
                        order_id: paymentResult.order_id
                    });
                }
                
            } else if (paymentResult.cancelled) {
                // User cancelled payment
    if (window.showAppAlert) {
        window.showAppAlert('Покупка отменена');
    } else {
        alert('Покупка отменена');
    }
            } else {
                // Payment failed
    if (window.showAppAlert) {
        window.showAppAlert('Ошибка платежа. Попробуйте еще раз.');
    } else {
        alert('Ошибка платежа. Попробуйте еще раз.');
    }
            }
        } else {
            // Order box failed
    if (window.showAppAlert) {
        window.showAppAlert('Платежная система недоступна');
    } else {
        alert('Платежная система недоступна');
    }
    }
} catch (error) {
    logger.error('Error during subscription purchase:', error);
    if (window.showAppAlert) {
        window.showAppAlert('Ошибка при обработке платежа');
    } else {
        alert('Ошибка при обработке платежа');
    }
}
}

// Make purchase function available globally
window.purchasePremiumSubscription = purchasePremiumSubscription;
window.contactSupport = contactSupport;
window.viewBillingHistory = viewBillingHistory;

// Banner Ad Management Functions
function showBannerAd() {
    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        vkBridgeManager.showBannerAd().then(success => {
            if (success) {
                bannerAdShown = true;
                }
        });
    }
}

function hideBannerAd() {
    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        vkBridgeManager.hideBannerAd().then(success => {
            if (success) {
                bannerAdShown = false;
                }
        });
    }
}

function showInterstitialAd() {
    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        vkBridgeManager.showInterstitialAd().then(success => {
            if (success) {
                }
        });
    }
}

// Auto-show banner ad after 30 seconds on welcome screen
function startBannerAdTimer() {
    if (bannerAdTimer) {
        clearTimeout(bannerAdTimer);
    }
    
    bannerAdTimer = setTimeout(() => {
        if (!isPremium() && vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
            showBannerAd();
        }
    }, 3000); // 3 seconds
}

// Stop banner ad timer
function stopBannerAdTimer() {
    if (bannerAdTimer) {
        clearTimeout(bannerAdTimer);
        bannerAdTimer = null;
    }
}

// Make banner ad functions available globally
window.showBannerAd = showBannerAd;
window.hideBannerAd = hideBannerAd;
window.showInterstitialAd = showInterstitialAd;
window.startBannerAdTimer = startBannerAdTimer;
window.stopBannerAdTimer = stopBannerAdTimer;

// Help Functions
function showHelp(topic) {
    // Prevent scrolling of the main page
    event.preventDefault();
    
    const helpContent = {
        'how-to-test': {
            title: 'Как пройти тест',
            content: `
                <h3>📝 Пошаговая инструкция</h3>
                <ol>
                    <li><strong>Выберите тип теста:</strong> MBTI (61 вопрос) или специализированный тест</li>
                    <li><strong>Отвечайте честно:</strong> Выбирайте тот вариант, который больше соответствует вашему поведению</li>
                    <li><strong>Не задумывайтесь долго:</strong> Первая реакция обычно самая точная</li>
                    <li><strong>Завершите тест:</strong> Пройдите все вопросы до конца</li>
                    <li><strong>Изучите результаты:</strong> Прочитайте описание вашего типа личности</li>
                </ol>
                <p><strong>💡 Совет:</strong> Тест можно проходить несколько раз, но рекомендуется делать перерыв между попытками.</p>
            `
        },
        'understanding-results': {
            title: 'Понимание результатов',
            content: `
                <h3>🧠 Что означают результаты</h3>
                <p>MBTI определяет 4 основные дихотомии:</p>
                <ul>
                    <li><strong>E/I (Экстраверсия/Интроверсия):</strong> Откуда вы черпаете энергию</li>
                    <li><strong>S/N (Сенсорика/Интуиция):</strong> Как вы воспринимаете информацию</li>
                    <li><strong>T/F (Мышление/Чувство):</strong> Как вы принимаете решения</li>
                    <li><strong>J/P (Суждение/Восприятие):</strong> Как вы относитесь к внешнему миру</li>
                </ul>
                <p><strong>📊 Проценты показывают:</strong> Насколько сильно выражена каждая характеристика в вашей личности.</p>
            `
        },
        'premium-features': {
            title: 'Премиум функции',
            content: `
                <h3>⭐ Что включено в премиум</h3>
                <ul>
                    <li><strong>Расширенная аналитика:</strong> Подробные графики и диаграммы</li>
                    <li><strong>Сравнение с известными личностями:</strong> Узнайте, кто из знаменитостей имеет ваш тип</li>
                    <li><strong>Специализированные тесты:</strong> 12 дополнительных тестов для разных аспектов личности</li>
                    <li><strong>Без рекламы:</strong> Чистый интерфейс без отвлекающих элементов</li>
                </ul>
                <p><strong>💎 Стоимость:</strong> 40 голосов ВКонтакте</p>
            `
        },
        'faq': {
            title: 'Часто задаваемые вопросы',
            content: `
                <h3>❓ FAQ</h3>
                <div class="faq-item">
                    <h4>Может ли мой тип измениться со временем?</h4>
                    <p>Да, тип личности может эволюционировать, особенно в молодом возрасте. Рекомендуется проходить тест раз в 1-2 года.</p>
                </div>
                <div class="faq-item">
                    <h4>Почему результаты могут отличаться?</h4>
                    <p>На результаты влияют настроение, самочувствие и жизненные обстоятельства. Для точности проходите тест в спокойном состоянии.</p>
                </div>
                <div class="faq-item">
                    <h4>Какой тест выбрать?</h4>
                    <p>Начните с основного MBTI теста. Специализированные тесты помогут глубже понять отдельные аспекты личности.</p>
                </div>
            `
        },
        'about-mbti': {
            title: 'О MBTI',
            content: `
                <h3>📚 Что такое MBTI</h3>
                <p>MBTI (Myers-Briggs Type Indicator) — это психологический инструмент, основанный на теории типов личности Карла Юнга.</p>
                <p><strong>История:</strong> Разработан Изабель Бриггс Майерс и Кэтрин Бриггс в 1940-х годах.</p>
                <p><strong>Научная основа:</strong> Основан на теории психологических типов Юнга и адаптирован для практического применения.</p>
                <p><strong>Применение:</strong> Используется в образовании, бизнесе, карьерном консультировании и личностном развитии.</p>
            `
        },
        'privacy': {
            title: 'Конфиденциальность',
            content: `
                <h3>🔒 Ваша конфиденциальность</h3>
                <p>Мы серьезно относимся к защите ваших персональных данных:</p>
                <ul>
                    <li>Результаты тестов хранятся только на вашем устройстве</li>
                    <li>Мы не передаем ваши данные третьим лицам</li>
                    <li>Используем безопасные методы обработки данных</li>
                    <li>Вы можете удалить свои данные в любое время</li>
                </ul>
                <p><strong>Вопросы по конфиденциальности:</strong> personalitiesresearch@mail.ru</p>
            `
        },
        'terms': {
            title: 'Условия использования',
            content: `
                <h3>📋 Условия использования</h3>
                <p>Используя наш сервис, вы соглашаетесь со следующими пунктами:</p>
                <ul>
                    <li>Результаты тестов предназначены только для личного использования</li>
                    <li>Не используйте результаты для дискриминации</li>
                    <li>Сервис предоставляется "как есть"</li>
                    <li>Мы не несем ответственности за решения, принятые на основе результатов</li>
                </ul>
                <p><strong>📅 Последнее обновление:</strong> 23 июля 2025</p>
            `
        }
    };

    const help = helpContent[topic];
    if (!help) {
        if (window.showAppAlert) {
            window.showAppAlert('Информация по этому разделу будет добавлена в ближайшее время.');
        } else {
            alert('Информация по этому разделу будет добавлена в ближайшее время.');
        }
        return;
    }

    // Create modal content
    const modalContent = `
        <div class="help-modal-content">
            <span class="close" onclick="closeHelpModal()">&times;</span>
            <h2>${help.title}</h2>
            <div class="help-content">
                ${help.content}
            </div>
            <div class="help-modal-actions">
                <button class="btn btn-primary" onclick="closeHelpModal()">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;

    // Show modal
    showHelpModal(modalContent);
}

let helpModalHistoryActive = false;

function showHelpModal(content) {
    // Create modal if it doesn't exist
    let helpModal = document.getElementById('helpModal');
    if (!helpModal) {
        helpModal = document.createElement('div');
        helpModal.id = 'helpModal';
        helpModal.className = 'modal';
        helpModal.style.display = 'none';
        document.body.appendChild(helpModal);
        
        // Add click outside to close functionality
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) {
                closeHelpModal();
            }
        });
    }

    helpModal.innerHTML = content;
    helpModal.style.display = 'flex';
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Push a history state so mobile back-swipe closes the modal first
    if (!helpModalHistoryActive) {
        try {
            history.pushState({ helpModal: true }, '');
            helpModalHistoryActive = true;
        } catch (e) {
            // no-op if history API is unavailable
        }
    }
}

function closeHelpModal(fromPopstate = false) {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.style.display = 'none';
    }
    
    // Restore background scrolling
    document.body.style.overflow = 'auto';

    // If we pushed a state for the modal and this isn't from a popstate event,
    // go back once to keep the history stack clean
    if (helpModalHistoryActive && !fromPopstate) {
        helpModalHistoryActive = false;
        try {
            history.back();
        } catch (e) {
            // ignore
        }
        return;
    }

    // Ensure flag is reset when closed via popstate
    helpModalHistoryActive = false;
}

// Make help functions available globally
window.showHelp = showHelp;
window.closeHelpModal = closeHelpModal;

// Make confidence info functions available globally
window.openConfidenceInfoModal = openConfidenceInfoModal;
window.closeConfidenceInfoModal = closeConfidenceInfoModal;

// Close help modal on browser back (e.g., mobile swipe back)
window.addEventListener('popstate', function() {
    const helpModal = document.getElementById('helpModal');
    const isOpen = helpModal && helpModal.style.display !== 'none';
    if (isOpen && helpModalHistoryActive) {
        closeHelpModal(true);
    }
});

// Generic in-app alert modal using help modal styling
function showAppAlert(message, title = '') {
    const content = `
        <div class="help-modal-content">
            <span class="close" onclick="closeHelpModal()">&times;</span>
            <h2>${title}</h2>
            <div class="help-content">
                <p>${message}</p>
            </div>
            <div class="help-modal-actions">
                <button class="btn btn-primary" onclick="closeHelpModal()">
                    <i class="fas fa-check"></i> OK
                </button>
            </div>
        </div>
    `;
    showHelpModal(content);
}

window.showAppAlert = showAppAlert;

// Check current localStorage
localStorage.getItem('mbti_premium')

// Make updateQuizTitle function available globally
window.updateQuizTitle = updateQuizTitle;

// Listen for premium status changes from VK bridge manager
window.addEventListener('premiumStatusChanged', function(event) {
    logger.log('Premium status change event received:', event.detail);

    if (event.detail && event.detail.isPremium !== undefined) {
        // Only update premium status if this is not from a manual update
        // to prevent infinite recursion between setPremium and storePremiumStatus
        if (event.detail.source !== 'manual_update') {
            // Update premium status
            setPremium(event.detail.isPremium);
        }

        // Force UI update
        updatePremiumUI();

        // If this is from a payment success, show success message
        if (event.detail.source === 'payment_success') {
            if (window.vkBridgeManager && typeof window.vkBridgeManager.showNotification === 'function') {
                window.vkBridgeManager.showNotification('Премиум доступ успешно активирован!');
            }
        }

        logger.log('Premium status updated from event:', event.detail.isPremium);
    }
});

// Initialize premium status check when VK bridge manager is ready
function initializePremiumStatusListener() {
    if (window.vkBridgeManager && window.vkBridgeManager.userService) {
        logger.log('VK bridge manager ready, setting up premium status monitoring...');
        
        // Check premium status initially
        window.vkBridgeManager.userService.checkPremiumStatus().then(() => {
            updatePremiumUI();
        }).catch(error => {
            logger.warn('Initial premium status check failed:', error);
        });
    } else {
        // Retry after a short delay
        setTimeout(initializePremiumStatusListener, 1000);
    }
}

// Start monitoring premium status
initializePremiumStatusListener();

// Add event listener for confidence info button
document.addEventListener('DOMContentLoaded', function() {
    const confidenceInfoBtn = document.getElementById('confidenceInfoBtn');
    if (confidenceInfoBtn) {
        confidenceInfoBtn.addEventListener('click', openConfidenceInfoModal);
    }
    
    // Test confidence calculation with sample data
    console.log('Testing confidence calculation...');
    const testScores = { E: 5, I: 2, S: 3, N: 4, T: 6, F: 1, J: 4, P: 3 };
    const testAnswers = [
        { option: 1, dimension: 'EI' },
        { option: 2, dimension: 'SN' },
        { option: 3, dimension: 'TF' },
        { option: 4, dimension: 'JP' }
    ];
    
    // Simulate the confidence calculation
    const dimensions = ['EI', 'SN', 'TF', 'JP'];
    dimensions.forEach(dimension => {
        const [pref1, pref2] = dimension.split('');
        const score1 = testScores[pref1] || 0;
        const score2 = testScores[pref2] || 0;
        const answeredForDimension = testAnswers.filter(a => a.dimension === dimension).length;
        
        if (answeredForDimension > 0) {
            const totalPossibleScore = answeredForDimension * 3;
            const totalScore = score1 + score2;
            const scoreDifference = Math.abs(score1 - score2);
            const utilizationRatio = totalScore / totalPossibleScore;
            const preferenceStrength = scoreDifference / totalPossibleScore;
            const dimensionConfidence = (utilizationRatio * 0.4) + (preferenceStrength * 0.6);
            
            console.log(`Test ${dimension}:`, {
                score1, score2, scoreDifference,
                answeredForDimension, totalPossibleScore,
                utilizationRatio, preferenceStrength,
                confidence: Math.max(0.1, Math.min(1, dimensionConfidence))
            });
        }
    });
});