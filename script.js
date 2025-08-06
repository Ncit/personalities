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
        
        // Return the appropriate questions based on current locale
        // const currentLocale = localizationManager.getCurrentLocale();
        return MBTI_QUESTIONS_RU; //currentLocale === 'ru' ? MBTI_QUESTIONS_RU : MBTI_QUESTIONS;
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
        
        // Update navigation buttons
        if (prevBtn) prevBtn.disabled = this.currentQuestion === 0;
        if (nextBtn) nextBtn.disabled = this.selectedOption === null;
        
        // Clear previous selection
        this.clearOptionSelection();
        
        // Update dev tools visibility
        updateDevToolsVisibility();
    }

    selectOption(optionNumber) {
        this.clearOptionSelection();
        this.selectedOption = optionNumber;
        document.querySelector(`button[onclick="selectOption(${optionNumber})"]`).classList.add('selected');
        document.getElementById('nextBtn').disabled = false;
    }

    clearOptionSelection() {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    nextQuestion() {
        if (this.selectedOption === null) return;
        
        // Record answer
        const question = this.questions[this.currentQuestion];
        const weight = question.weights[this.selectedOption - 1];
        
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
        
        this.answers.push(this.selectedOption);
        this.selectedOption = null;
        
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
            this.selectedOption = this.answers[this.currentQuestion];
            this.displayQuestion();
            if (this.selectedOption) {
                document.querySelector(`button[onclick="selectOption(${this.selectedOption})"]`).classList.add('selected');
                document.getElementById('nextBtn').disabled = false;
            }
        }
    }

    showResults() {
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
        
        // Log to Firebase Analytics
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent('quiz_completed', {
                personality_type: personalityType,
                quiz_type: this.currentQuizType,
                question_count: this.questions.length,
                is_premium: isPremium()
            });
        }
        
        // Track VK-specific quiz completion
        if (window.vkBridgeManager && window.vkBridgeManager.isVKEnvironment()) {
            window.vkBridgeManager.trackVKQuizEvent('completed', {
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
        
        // Get elements with null checks
        const eBar = document.getElementById('eBar');
        const sBar = document.getElementById('sBar');
        const tBar = document.getElementById('tBar');
        const jBar = document.getElementById('jBar');
        
        // Set width with null checks
        if (eBar) eBar.style.width = `${ePercentage}%`;
        if (sBar) sBar.style.width = `${sPercentage}%`;
        if (tBar) tBar.style.width = `${tPercentage}%`;
        if (jBar) jBar.style.width = `${jPercentage}%`;
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
        
        localStorage.setItem('mbti_last_results', JSON.stringify(results));
    }
    
    loadResultsFromStorage() {
        const saved = localStorage.getItem('mbti_last_results');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }
    
    hasPreviousResults() {
        return localStorage.getItem('mbti_last_results') !== null;
    }
    
    displayLastResults() {
        const results = this.loadResultsFromStorage();
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

    shareResults() {
        const personalityType = this.calculatePersonalityType();
        const shareText = `I just discovered my MBTI personality type is ${personalityType}! Take the quiz yourself to find yours.`;
        
        // Use VK Bridge if available, otherwise fallback to native sharing
        if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
            vkBridgeManager.shareResults(personalityType, shareText);
        } else if (navigator.share) {
            navigator.share({
                title: 'MBTI Personality Quiz Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                if (vkBridgeManager) {
                    vkBridgeManager.showNotification('Results copied to clipboard!');
                } else {
                    alert('Results copied to clipboard!');
                }
            });
        }
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
                        <span class="type-stat-label">Население</span>
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
    const premiumValue = localStorage.getItem('mbti_premium');
    return premiumValue === '1' || premiumValue === 'true';
}

function setPremium(val) {
    if (val) {
        localStorage.setItem('mbti_premium', 'true');
    } else {
        localStorage.removeItem('mbti_premium');
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

function unlockPremium() {
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
        // Show VK order box for payment
        vkBridgeManager.showOrderBox()
            .then(orderResult => {
                if (orderResult.success) {
                    // Process the order result
                    return vkBridgeManager.handleOrderBoxResult(orderResult);
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
                    
                    throw new Error('Order box failed');
                }
            })
            .then(paymentResult => {
                if (paymentResult.success) {
                    // Payment successful - unlock premium
                    setPremium(true);
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
            })
            .catch(error => {
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
            });
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
    
    const famous = FAMOUS_PERSONALITIES[personalityType];
    if (!famous) return;
    
    // Limit to maximum 8 items
    const limitedFamous = famous.slice(0, 8);
    
    const famousGrid = document.getElementById('famousGrid');
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
    
    // Timeline chart
    createTimelineChart();
    
    // Strengths chart
    createStrengthsChart(ePercentage, sPercentage, tPercentage, jPercentage);
}

// Enhanced Radar Chart
function createRadarChart(e, s, t, j) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    // Set canvas size for better resolution
    canvas.width = 300;
    canvas.height = 300;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // // Create gradient background
    // const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    // gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
    // gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
    // ctx.fillStyle = gradient;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    const labels = ['E/I', 'S/N', 'T/F', 'J/P'];
    const values = [e, s, t, j];
    const descriptions = ['Extraversion/Introversion', 'Sensing/Intuition', 'Thinking/Feeling', 'Judging/Perceiving'];
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
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
        const labelText = labels[i];
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
        // const valueX = centerX + (radius + 45) * Math.cos(angle);
        // const valueY = centerY + (radius + 45) * Math.sin(angle);
        // ctx.fillText(`${values[i]}%`, valueX, valueY);
    }
    
    // Draw enhanced data polygon with gradient fill
    const polygonGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    polygonGradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
    polygonGradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');
    
    ctx.fillStyle = polygonGradient;
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + (radius * value) * Math.cos(angle);
        const y = centerY + (radius * value) * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Enhanced data points with glow effect
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const value = values[i] / 100;
        const x = centerX + (radius * value) * Math.cos(angle);
        const y = centerY + (radius * value) * Math.sin(angle);
        
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
        
        // Add hover tooltip functionality
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            
            if (distance < 10) {
                canvas.style.cursor = 'pointer';
                // Tooltip would be implemented here
            } else {
                canvas.style.cursor = 'default';
            }
        });
    }
    
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
    
}

// Bar Chart
function createBarChart(e, s, t, j) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const barWidth = 40;
    const barSpacing = 20;
    const startX = 50;
    const startY = 150;
    const maxHeight = 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const dimensions = ['E/I', 'S/N', 'T/F', 'J/P'];
    const scores = [e, s, t, j];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    
    dimensions.forEach((dim, i) => {
        const x = startX + i * (barWidth + barSpacing);
        const height = (scores[i] / 100) * maxHeight;
        
        // Draw bar
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, startY - height, barWidth, height);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, startY - height, barWidth, height);
        
        // Draw percentage text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(scores[i])}%`, x + barWidth/2, startY - height - 5);
        
        // Draw dimension label
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(dim, x + barWidth/2, startY + 15);
    });
    
    // Draw axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 10, startY);
    ctx.lineTo(startX + 4 * (barWidth + barSpacing) - barSpacing + 10, startY);
    ctx.stroke();
}

// Balance Chart (showing balance between preferences)
function createBalanceChart(e, s, t, j) {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 100;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const pairs = [
        { name: 'E/I', value: e, color1: '#667eea', color2: '#764ba2' },
        { name: 'S/N', value: s, color1: '#f093fb', color2: '#f5576c' },
        { name: 'T/F', value: t, color1: '#4facfe', color2: '#00f2fe' },
        { name: 'J/P', value: j, color1: '#43e97b', color2: '#38f9d7' }
    ];
    
    pairs.forEach((pair, index) => {
        const y = 30 + index * 35;
        
        // Draw balance bar
        ctx.fillStyle = pair.color1;
        ctx.fillRect(50, y, 100, 20);
        ctx.fillStyle = pair.color2;
        ctx.fillRect(50 + 100, y, 100, 20);
        
        // Draw indicator
        const indicatorX = 50 + (pair.value / 100) * 200;
        // ctx.fillStyle = '#333';
        // ctx.beginPath();
        // ctx.arc(indicatorX, y + 10, 6, 0, 2 * Math.PI);
        // ctx.fill();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(pair.name, 20, y + 15);
        
        // Draw percentage
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(pair.value)}%`, indicatorX, y + 15);
    });
}

// Pie Chart (showing preference distribution)
function createPieChart(e, s, t, j) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 100;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const data = [
        { label: 'E/I', value: e, color: '#667eea' },
        { label: 'S/N', value: s, color: '#764ba2' },
        { label: 'T/F', value: t, color: '#f093fb' },
        { label: 'J/P', value: j, color: '#f5576c' }
    ];
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Draw labels
    data.forEach((item, index) => {
        const y = 180 + index * 20;
        ctx.fillStyle = item.color;
        ctx.fillRect(50, y - 8, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.label}: ${Math.round(item.value)}%`, 70, y);
    });
}

// Minimalistic Timeline Chart
function createTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for better resolution
    canvas.width = 300;
    canvas.height = 150;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw minimal timeline line
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 75);
    ctx.lineTo(260, 75);
    ctx.stroke();
    
    // Draw timeline points with minimal design
    const points = [
        { x: 60, label: 'Прошлое', color: '#9ca3af' },
        { x: 150, label: 'Настоящее', color: '#667eea' },
        { x: 240, label: 'Будущее', color: '#9ca3af' }
    ];
    
    points.forEach((point, index) => {
        // Draw subtle background circle for present point
        if (index === 1) {
            ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
            ctx.beginPath();
            ctx.arc(point.x, 75, 12, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Draw main point
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, 75, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw subtle label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(point.label, point.x, 100);
    });
    
    // Draw minimal title
    ctx.fillStyle = '#374151';
    ctx.font = '13px Inter';
    ctx.textAlign = 'center';
}

// Strengths Chart (showing personality strengths)
function createStrengthsChart(e, s, t, j) {
    const canvas = document.getElementById('strengthsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const strengths = [
        { name: 'Аналитический', value: Math.max(t, 100 - t), color: '#667eea' },
        { name: 'Креативный', value: Math.max(s, 100 - s), color: '#764ba2' },
        { name: 'Социальный', value: Math.max(e, 100 - e), color: '#f093fb' },
        { name: 'Организованный', value: Math.max(j, 100 - j), color: '#f5576c' }
    ];
    
    const barHeight = 25;
    const spacing = 10;
    const startY = 0;
    
    strengths.forEach((strength, index) => {
        const y = startY + index * (barHeight + spacing);
        const width = (strength.value / 100) * 200;
        
        // Draw bar
        ctx.fillStyle = strength.color;
        ctx.fillRect(130, y, width, barHeight);
        
        // Draw border
        // ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        // ctx.lineWidth = 1;
        // ctx.strokeRect(50, y, width, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(strength.name, 10, y + 17);
        
        // Draw percentage
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(strength.value)}%`, 165, y + 17);
    });
}

// Function to generate PDF (real PDF with jsPDF)
function generatePDF() {
    if (!isPremium()) return;
    
    const btn = document.querySelector('#pdfContent .btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    btn.disabled = true;

    setTimeout(() => {
        // Gather data
        const personalityType = document.getElementById('personalityType').textContent;
        const title = document.getElementById('personalityTitle').textContent;
        const subtitle = document.getElementById('personalitySubtitle').textContent;
        const description = document.getElementById('personalityDescription').textContent;
        
        // Advanced insights
        let strengths = '', weaknesses = '', careers = '', development = '';
        if (ADVANCED_INSIGHTS[personalityType]) {
            strengths = ADVANCED_INSIGHTS[personalityType].strengths.join(', ');
            weaknesses = ADVANCED_INSIGHTS[personalityType].weaknesses.join(', ');
            careers = ADVANCED_INSIGHTS[personalityType].careers.join(', ');
            development = ADVANCED_INSIGHTS[personalityType].development.join(', ');
        }
        
        // Famous people
        let famous = '';
        if (FAMOUS_PERSONALITIES[personalityType]) {
            famous = FAMOUS_PERSONALITIES[personalityType].map(p => `${p.name} (${p.profession})`).join(', ');
        }
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(18);
        doc.text('MBTI Personality Quiz Report', 10, y);
        y += 10;
        doc.setFontSize(14);
        doc.text(`Type: ${personalityType} - ${title}`, 10, y);
        y += 8;
        doc.setFontSize(11);
        doc.text(subtitle, 10, y);
        y += 8;
        doc.setFontSize(10);
        doc.text('Description:', 10, y);
        y += 6;
        doc.setFontSize(9);
        doc.text(doc.splitTextToSize(description, 180), 10, y);
        y += doc.getTextDimensions(doc.splitTextToSize(description, 180)).h + 4;
        if (strengths) {
            doc.setFontSize(10);
            doc.text('Strengths:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(strengths, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(strengths, 180)).h + 4;
        }
        if (weaknesses) {
            doc.setFontSize(10);
            doc.text('Growth Areas:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(weaknesses, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(weaknesses, 180)).h + 4;
        }
        if (careers) {
            doc.setFontSize(10);
            doc.text('Career Recommendations:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(careers, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(careers, 180)).h + 4;
        }
        if (development) {
            doc.setFontSize(10);
            doc.text('Personal Development:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(development, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(development, 180)).h + 4;
        }
        if (famous) {
            doc.setFontSize(10);
            doc.text('Famous Personalities:', 10, y);
            y += 6;
            doc.setFontSize(9);
            doc.text(doc.splitTextToSize(famous, 180), 10, y);
            y += doc.getTextDimensions(doc.splitTextToSize(famous, 180)).h + 4;
        }
        
        // Save PDF
        doc.save(`MBTI_Report_${personalityType}.pdf`);
        
        btn.innerHTML = '<i class="fas fa-check"></i> PDF Generated!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1200);
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
        alert('Премиум функции доступны только для премиум пользователей');
        return;
    }
    
    // Create quiz instance and generate specialized questions
    quiz = new MBTIQuiz();
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
    if (quiz && quiz.hasPreviousResults()) {
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
                right: 15px;
                transform: translateY(-50%);
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

// Function to start different quiz types
function startQuizType(quizType) {
    if (!isPremium()) {
        openPremiumModal();
        return;
    }
    
    // Set current quiz type
    quiz.currentQuizType = quizType;
    
    // Update welcome screen to show quiz type
    const welcomeContent = document.querySelector('.welcome-content h2');
    if (welcomeContent) {
        const originalTitle = welcomeContent.textContent;
        
        const quizTypeTitles = {
            'leadership': localizationManager.get('quizTypes.leadership.name'),
            'communication': localizationManager.get('quizTypes.communication.name'),
            'stress': localizationManager.get('quizTypes.stress.name'),
            'learning': localizationManager.get('quizTypes.learning.name'),
            'relationships': localizationManager.get('quizTypes.relationships.name'),
            'creativity': localizationManager.get('quizTypes.creativity.name'),
            'decision': localizationManager.get('quizTypes.decision.name'),
            'teamwork': localizationManager.get('quizTypes.teamwork.name'),
            'career': localizationManager.get('quizTypes.career.name'),
            'conflict': localizationManager.get('quizTypes.conflict.name'),
            'motivation': localizationManager.get('quizTypes.motivation.name'),
            'adaptability': localizationManager.get('quizTypes.adaptability.name'),
            'emotional': localizationManager.get('quizTypes.emotional.name'),
            'productivity': localizationManager.get('quizTypes.productivity.name'),
            'social': localizationManager.get('quizTypes.social.name')
        };
        
        welcomeContent.textContent = quizTypeTitles[quizType] || localizationManager.get('ui.mbtiQuiz');
        
        // Start the quiz
        quiz.startQuiz();
        
        // Restore original title when quiz ends
        setTimeout(() => {
            if (welcomeContent) {
                welcomeContent.textContent = originalTitle;
            }
        }, 100);
    } else {
        // If welcome content not found, just start the quiz
        quiz.startQuiz();
    }
    
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

// Banner ad management
let bannerAdShown = false;
let bannerAdTimer = null;

// Global functions for HTML onclick handlers
function startQuiz() {
    quiz = new MBTIQuiz();
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
    
    // Reload the website
    location.reload();
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
window.generatePDF = generatePDF;
window.copyShareLink = copyShareLink;

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
            alert('localStorage cleared successfully!');
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
            statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Бесплатная версия</span>';
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
        alert('Подписка отменена. Вы вернулись к бесплатной версии.');
    }
}

function restoreSubscription() {
    const confirmed = confirm('Восстановить премиум подписку?');
    if (confirmed) {
        setPremium(true);
        updateSubscriptionModal();
        updatePremiumUI();
        alert('Премиум подписка восстановлена!');
    }
}

function contactSupport() {
    alert('Для связи с поддержкой отправьте email на: personalitiesresearch@mail.ru');
}

function viewBillingHistory() {
    alert('История платежей будет доступна в будущих обновлениях.');
}

// Make subscription functions available globally
window.openSubscriptionModal = openSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.cancelSubscription = cancelSubscription;
window.restoreSubscription = restoreSubscription;

/**
 * Purchase premium subscription with VK payment
 */
function purchasePremiumSubscription(tier = 'monthly') {
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
        alert('Premium subscriptions are only available in VK environment');
        return;
    }
    
    // Show VK order box for the selected tier
    vkBridgeManager.showOrderBox(config.id, config.name)
        .then(orderResult => {
            if (orderResult.success) {
                // Process the order result
                return vkBridgeManager.handleOrderBoxResult(orderResult);
            } else {
                // Order box failed
                alert('Платежная система недоступна');
                throw new Error('Order box failed');
            }
        })
        .then(paymentResult => {
            if (paymentResult.success) {
                // Payment successful - unlock premium
                setPremium(true);
                
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
                
                localStorage.setItem('mbti_subscription_data', JSON.stringify(subscriptionData));
                
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
                alert('Покупка отменена');
            } else {
                // Payment failed
                alert('Ошибка платежа. Попробуйте еще раз.');
            }
        })
        .catch(error => {
            logger.error('Error during subscription purchase:', error);
            alert('Ошибка при обработке платежа');
        });
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
    }, 30000); // 30 seconds
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
                <div class="faq-item">
                    <h4>Можно ли отменить премиум подписку?</h4>
                    <p>Да, подписку можно отменить в любое время через настройки ВКонтакте.</p>
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
                <p>Используя наш сервис, вы соглашаетесь с:</p>
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
        alert('Информация по этому разделу будет добавлена в ближайшее время.');
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
}

function closeHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.style.display = 'none';
    }
    
    // Restore background scrolling
    document.body.style.overflow = 'auto';
}

// Make help functions available globally
window.showHelp = showHelp;
window.closeHelpModal = closeHelpModal;

// Check current localStorage
localStorage.getItem('mbti_premium')