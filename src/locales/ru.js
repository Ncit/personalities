/**
 * Russian Localization File
 * Contains all user-facing strings and error messages in Russian
 */

export const ru = {
    // Error Messages
    errors: {
        // Application initialization errors
        initFailed: 'Не удалось инициализировать приложение. Пожалуйста, обновите страницу.',
        unexpectedError: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.',
        
        // Quiz-related errors
        startQuizFailed: 'Не удалось запустить тест. Пожалуйста, попробуйте снова.',
        selectOptionFailed: 'Не удалось выбрать вариант. Пожалуйста, попробуйте снова.',
        nextQuestionFailed: 'Не удалось перейти к следующему вопросу. Пожалуйста, попробуйте снова.',
        previousQuestionFailed: 'Не удалось перейти к предыдущему вопросу. Пожалуйста, попробуйте снова.',
        restartQuizFailed: 'Не удалось перезапустить тест. Пожалуйста, попробуйте снова.',
        
        // Premium-related errors
        unlockPremiumFailed: 'Не удалось разблокировать премиум. Пожалуйста, попробуйте снова.',
        
        // Results-related errors
        noPreviousResults: 'Предыдущие результаты не найдены.',
        loadLastResultsFailed: 'Не удалось загрузить последние результаты. Пожалуйста, попробуйте снова.',
        noResultsForPDF: 'Нет результатов для создания PDF.',
        generatePDFFailed: 'Не удалось создать PDF. Пожалуйста, попробуйте снова.',
        noResultsToShare: 'Нет результатов для обмена.',
        shareResultsFailed: 'Не удалось поделиться результатами. Пожалуйста, попробуйте снова.',
        copyToClipboardFailed: 'Не удалось скопировать результаты в буфер обмена.',
        
        // Development tools errors
        randomAnswersDevOnly: 'Случайные ответы доступны только в режиме разработки.',
        fillRandomAnswersFailed: 'Не удалось заполнить случайные ответы. Пожалуйста, попробуйте снова.',
        toggleAppStateFailed: 'Не удалось переключить состояние приложения. Пожалуйста, попробуйте снова.',
        
        // Exit quiz errors
        exitQuizFailed: 'Не удалось выйти из теста. Пожалуйста, попробуйте снова.',
        
        // Generic errors
        genericError: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
        networkError: 'Ошибка сети. Пожалуйста, проверьте подключение и попробуйте снова.',
        validationError: 'Неверный ввод. Пожалуйста, проверьте данные и попробуйте снова.'
    },
    
    // Success Messages
    success: {
        premiumUnlocked: 'Премиум функции разблокированы!',
        pdfGenerated: 'PDF успешно создан!',
        resultsCopied: 'Результаты скопированы в буфер обмена!',
        quizCompleted: 'Тест успешно завершен!',
        settingsSaved: 'Настройки успешно сохранены!'
    },
    
    // Info Messages
    info: {
        loading: 'Загрузка...',
        processing: 'Обработка...',
        generating: 'Генерация...',
        saving: 'Сохранение...'
    },
    
    // Warning Messages
    warnings: {
        unsavedChanges: 'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?',
        dataLoss: 'Это действие может привести к потере данных. Продолжить?',
        premiumRequired: 'Эта функция требует премиум подписки.'
    },
    
    // Console Messages (for debugging)
    console: {
        initStart: '🚀 Инициализация приложения теста личности MBTI...',
        initSuccess: '✅ Приложение успешно инициализировано',
        initFailed: '❌ Не удалось инициализировать приложение:',
        globalError: 'Глобальная ошибка:',
        unhandledRejection: 'Необработанное отклонение промиса:',
        errorStartingQuiz: 'Ошибка запуска теста:',
        errorStartingQuizType: 'Ошибка запуска типа теста:',
        errorSelectingOption: 'Ошибка выбора варианта:',
        errorNextQuestion: 'Ошибка в следующем вопросе:',
        errorPreviousQuestion: 'Ошибка в предыдущем вопросе:',
        errorRestartingQuiz: 'Ошибка перезапуска теста:',
        errorUnlockingPremium: 'Ошибка разблокировки премиума:',
        errorViewingLastResults: 'Ошибка просмотра последних результатов:',
        errorGeneratingPDF: 'Ошибка создания PDF:',
        errorSharingResults: 'Ошибка обмена результатами:',
        errorFillingRandomAnswers: 'Ошибка заполнения случайных ответов:',
        errorTogglingAppState: 'Ошибка переключения состояния приложения:',
        errorExitingQuiz: 'Ошибка выхода из теста:',
        randomAnswersFilled: 'Случайные ответы заполнены с экрана приветствия!',
        randomAnswersFilledTesting: 'Случайные ответы заполнены для тестирования!',
        appStateChanged: 'Состояние приложения изменено на: {state}',
        currentAppState: 'Текущее состояние приложения: {state}'
    },
    
    // UI Messages
    ui: {
        // Quiz-related
        questionCounter: 'Вопрос {current} из {total}',
        startQuiz: 'Начать тест',
        nextQuestion: 'Следующий вопрос',
        previousQuestion: 'Предыдущий вопрос',
        restartQuiz: 'Пройти тест снова',
        exitQuiz: 'Выйти из теста',
        browseTypes: 'Просмотреть типы',
        viewLastResults: 'Посмотреть последние результаты',
        
        // Results-related
        shareResults: 'Поделиться результатами',
        downloadPDF: 'Скачать PDF отчет',
        copyLink: 'Копировать ссылку',
        generatingPDF: 'Создание PDF...',
        pdfGenerated: 'PDF создан!',
        copied: 'Скопировано!',
        resultsCopiedAlert: 'Результаты скопированы в буфер обмена!',
        
        // Premium-related
        upgradeToPremium: 'Перейти на Премиум',
        premiumActive: 'Премиум активен',
        premiumUnlocked: '🎉 Премиум разблокирован! Наслаждайтесь всеми функциями.',
        unlockPremium: 'Разблокировать Премиум (Демо)',
        
        // App state
        development: 'РАЗРАБОТКА',
        release: 'РЕЛИЗ',
        
        // Quiz types
        mbtiQuiz: 'Тест личности MBTI',
        leadershipQuiz: 'Тест стиля лидерства',
        communicationQuiz: 'Тест стиля общения',
        stressQuiz: 'Тест реакции на стресс',
        learningQuiz: 'Тест стиля обучения',
        relationshipsQuiz: 'Тест динамики отношений',
        creativityQuiz: 'Тест креативности и инноваций',
        decisionQuiz: 'Тест принятия решений',
        
        // Quiz descriptions
        mbtiDescription: 'Этот тест поможет вам определить ваш тип личности по индикатору Майерс-Бриггс (MBTI). Оценка состоит из {count} вопросов, которые оценивают ваши предпочтения по четырем измерениям:',
        premiumUpgradeNote: '(Перейдите на Премиум для полной оценки из 60 вопросов)',
        
        // Dimensions
        dimensionEI: 'Экстраверсия (E) vs Интроверсия (I)',
        dimensionSN: 'Сенсорика (S) vs Интуиция (N)',
        dimensionTF: 'Мышление (T) vs Чувство (F)',
        dimensionJP: 'Суждение (J) vs Восприятие (P)',
        dimensionEIDesc: 'Как вы направляете и получаете энергию',
        dimensionSNDesc: 'Как вы воспринимаете информацию',
        dimensionTFDesc: 'Как вы принимаете решения',
        dimensionJPDesc: 'Как вы подходите к внешнему миру',
        
        // Welcome screen
        welcomeTitle: 'Добро пожаловать в тест личности MBTI',
        welcomeDescription: 'Этот тест поможет вам определить ваш тип личности по индикатору Майерс-Бриггс (MBTI). Оценка состоит из {count} вопросов, которые оценивают ваши предпочтения по четырем измерениям:',
        
        // Premium features
        premiumFeatures: {
            advancedInsights: 'Расширенные анализы личности',
            pdfReport: 'Скачиваемый PDF отчет',
            famousPersonalities: 'Сравнение с известными личностями',
            saveShare: 'Сохранить/поделиться результатами с уникальной ссылкой',
            fullDescriptions: 'Полные описания типов',
            visualAnalytics: 'Визуальная аналитика (графики/диаграммы)',
            adFree: 'Без рекламы'
        },
        
        // Modal titles
        unlockPremiumTitle: 'Разблокировать Премиум функции',
        mbtiTypesTitle: 'Типы личности MBTI',
        typesHeader: 'Изучите все 16 типов личности. Полные описания доступны с Премиум.',
        
        // PDF content
        pdfTitle: 'Отчет о личности',
        pdfPersonalDevelopment: 'Личностное развитие:',
        
        // Buttons
        close: 'Закрыть',
        confirm: 'Подтвердить',
        cancel: 'Отмена',
        save: 'Сохранить',
        loading: 'Загрузка...',
        processing: 'Обработка...'
    }
};

export default ru; 