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
                        <span class="type-stat-label">Население</span>
                    </div>
                    <div class="type-stat">
                        <span class="type-stat-value">${this.getTypeCompatibility(type)}</span>
                        <span class="type-stat-label">Совместимость</span>
                    </div>
                </div>
            `;
            typesList.appendChild(typeCard);
        });

        // Setup filter functionality
        this.setupTypeFilters();
    }

    getMBTITypes() {
        return {
            'INTJ': {
                title: 'Архитектор',
                subtitle: 'Стратегический мыслитель',
                description: 'Инновационные мыслители с неутолимой жаждой знаний. Они видят возможности для улучшения во всем и стремятся к постоянному развитию.'
            },
            'INTP': {
                title: 'Логик',
                subtitle: 'Инновационный изобретатель',
                description: 'Философские изобретатели, одержимые логическим анализом, системами и дизайном. Они стремятся понять, как устроен мир.'
            },
            'ENTJ': {
                title: 'Командир',
                subtitle: 'Смелый, воображаемый лидер',
                description: 'Смелые, харизматичные и волевые лидеры, способные найти или создать решения практически для любой проблемы.'
            },
            'ENTP': {
                title: 'Новатор',
                subtitle: 'Умный и любопытный мыслитель',
                description: 'Умные и любопытные мыслители, которые не могут устоять перед интеллектуальным вызовом.'
            },
            'INFJ': {
                title: 'Адвокат',
                subtitle: 'Тихий и мистический, но очень вдохновляющий и неутомимый идеалист',
                description: 'Тихие и мистические, но очень вдохновляющие и неутомимые идеалисты. Хотя и очень сдержанные, они обладают сильным влиянием.'
            },
            'INFP': {
                title: 'Посредник',
                subtitle: 'Поэтический, добрый и альтруистичный дух',
                description: 'Поэтические, добрые и альтруистичные люди, всегда стремящиеся помочь хорошему делу.'
            },
            'ENFJ': {
                title: 'Протагонист',
                subtitle: 'Харизматичный и вдохновляющий лидер',
                description: 'Харизматичные и вдохновляющие лидеры, способные загипнотизировать свою аудиторию.'
            },
            'ENFP': {
                title: 'Активист',
                subtitle: 'Энтузиаст, креативный и общительный',
                description: 'Энтузиасты, креативные и общительные свободные духи, которые всегда могут найти повод для улыбки.'
            },
            'ISTJ': {
                title: 'Логист',
                subtitle: 'Практичный и фактологический',
                description: 'Практичные и фактологические люди, надежность которых не может быть поставлена под сомнение.'
            },
            'ISFJ': {
                title: 'Защитник',
                subtitle: 'Очень преданный и теплый',
                description: 'Очень преданные и теплые защитники, всегда готовые защитить своих близких.'
            },
            'ESTJ': {
                title: 'Исполнитель',
                subtitle: 'Отличные управляющие, невероятно надежные',
                description: 'Отличные управляющие, невероятно надежные и практичные люди, которые гордятся тем, что доводят дела до конца.'
            },
            'ESFJ': {
                title: 'Консул',
                subtitle: 'Необычайно заботливые, общительные и популярные',
                description: 'Необычайно заботливые, общительные и популярные люди, всегда готовые помочь.'
            },
            'ISTP': {
                title: 'Виртуоз',
                subtitle: 'Смелые и практичные экспериментаторы',
                description: 'Смелые и практичные экспериментаторы, мастера всех видов инструментов.'
            },
            'ISFP': {
                title: 'Авантюрист',
                subtitle: 'Гибкие и очаровательные художники',
                description: 'Гибкие и очаровательные художники, всегда готовые исследовать и испытывать что-то новое.'
            },
            'ESTP': {
                title: 'Предприниматель',
                subtitle: 'Умные, энергичные и очень восприимчивые',
                description: 'Умные, энергичные и очень восприимчивые люди, которые действительно наслаждаются жизнью.'
            },
            'ESFP': {
                title: 'Развлекатель',
                subtitle: 'Спонтанные, энергичные и энтузиасты',
                description: 'Спонтанные, энергичные и энтузиасты - развлекатели, которые не могут устоять перед тем, чтобы быть в центре событий.'
            }
        };
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
        return compatibility[type] || 'Все типы';
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
}

// Export singleton instance
export const uiManager = new UIManager(); 