/**
 * Centralized State Management for MBTI Quiz Application
 * Handles application state, user preferences, and quiz progress
 */
import { LoggerManager } from './LoggerManager.js';

// Initialize logger for this module
const logger = new LoggerManager().createModuleLogger('StateManager');

export class StateManager {
    constructor() {
        this.state = {
            // Application state
            appState: new URLSearchParams(window.location.search).get('state') || 'release', // 'development' | 'release'
            currentScreen: 'welcome', // 'welcome' | 'quiz' | 'results'
            
            // User preferences
            isPremium: false,
            theme: 'light', // 'light' | 'dark'
            language: 'en',
            
            // Quiz state
            currentQuizType: 'mbti',
            currentQuestion: 0,
            answers: [],
            scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
            selectedOption: null,
            
            // Tab navigation
            currentTab: 'home',

            // Achievements
            achievements: {
                firstSteps: false,
                onFire: false,
                highAccuracy: false,
                explorer: false,
                specialist: false,
                master: false,
            },

            // Results
            lastResults: null,
            
            // UI state
            modals: {
                types: false,
                premium: false,
                exitQuiz: false
            }
        };
        
        this.subscribers = new Map();
        this.loadFromStorage();
    }

    // State getters
    getState() {
        return { ...this.state };
    }

    get(key) {
        return this.state[key];
    }

    // State setters
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveToStorage();
        this.notifySubscribers();
    }

    set(key, value) {
        this.state[key] = value;
        this.saveToStorage();
        this.notifySubscribers(key);
    }

    // Quiz-specific methods
    updateQuizProgress(questionIndex, answer, scores) {
        this.setState({
            currentQuestion: questionIndex,
            answers: [...this.state.answers, answer],
            scores: { ...scores }
        });
    }

    resetQuiz() {
        this.setState({
            currentQuestion: 0,
            answers: [],
            scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
            selectedOption: null
        });
    }

    setQuizType(quizType) {
        this.setState({ currentQuizType: quizType });
    }

    // Achievement checking
    checkAchievements(resultsStore) {
        const count = resultsStore.getCount();
        const confidence = resultsStore.getAverageConfidence();
        const updated = { ...this.state.achievements };

        if (count >= 1) updated.firstSteps = true;
        if (confidence && confidence >= 85) updated.highAccuracy = true;

        this.setState({ achievements: updated });
    }

    // Premium management
    setPremium(isPremium) {
        this.setState({ isPremium });
    }

    // Results management
    saveResults(results) {
        this.setState({ lastResults: results });
        localStorage.setItem('mbti_last_results', JSON.stringify(results));
    }

    getLastResults() {
        return this.state.lastResults;
    }

    // App state management
    setAppState(state) {
        this.setState({ appState: state });
        this.updateURLWithState(state);
    }

    // Modal management
    openModal(modalName) {
        this.setState({
            modals: { ...this.state.modals, [modalName]: true }
        });
    }

    closeModal(modalName) {
        this.setState({
            modals: { ...this.state.modals, [modalName]: false }
        });
    }

    // Observer pattern for state changes
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).delete(callback);
        }
    }

    notifySubscribers(key = null) {
        if (key) {
            if (this.subscribers.has(key)) {
                this.subscribers.get(key).forEach(callback => {
                    callback(this.state[key]);
                });
            }
        } else {
            this.subscribers.forEach((callbacks, key) => {
                callbacks.forEach(callback => {
                    callback(this.state[key]);
                });
            });
        }
    }

    // Persistence
    saveToStorage() {
        try {
            const dataToSave = {
                theme: this.state.theme,
                language: this.state.language,
                lastResults: this.state.lastResults,
                achievements: this.state.achievements
            };
            localStorage.setItem('mbti_state', JSON.stringify(dataToSave));
        } catch (error) {
            logger.warn('Failed to save state to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('mbti_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.setState({
                    theme: parsed.theme || 'light',
                    language: parsed.language || 'en',
                    lastResults: parsed.lastResults || null,
                    achievements: parsed.achievements || this.state.achievements
                });
            }

            // Sync premium status from global isPremium() which checks VK backend + localStorage
            const globalPremium = typeof window.isPremium === 'function' ? window.isPremium() : false;
            this.setState({ isPremium: globalPremium });
        } catch (error) {
            logger.warn('Failed to load state from localStorage:', error);
        }
    }

    // URL state management
    updateURLWithState(state) {
        const url = new URL(window.location);
        url.searchParams.set('state', state);
        window.history.replaceState({}, '', url);
    }

    getStateFromURL() {
        const url = new URL(window.location);
        return url.searchParams.get('state') || 'release';
    }

    // Utility methods
    isDevelopment() {
        return this.state.appState === 'development';
    }

    isPremium() {
        return this.state.isPremium;
    }

    getCurrentQuizType() {
        return this.state.currentQuizType;
    }

    getQuizProgress() {
        return {
            currentQuestion: this.state.currentQuestion,
            totalAnswers: this.state.answers.length,
            scores: this.state.scores
        };
    }
}

// Singleton instance
export const stateManager = new StateManager(); 