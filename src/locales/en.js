/**
 * English Localization File
 * Contains all user-facing strings and error messages
 */

export const en = {
    // Error Messages
    errors: {
        // Application initialization errors
        initFailed: 'Failed to initialize application. Please refresh the page.',
        unexpectedError: 'An unexpected error occurred. Please try again.',
        
        // Quiz-related errors
        startQuizFailed: 'Failed to start quiz. Please try again.',
        selectOptionFailed: 'Failed to select option. Please try again.',
        nextQuestionFailed: 'Failed to proceed to next question. Please try again.',
        previousQuestionFailed: 'Failed to go to previous question. Please try again.',
        restartQuizFailed: 'Failed to restart quiz. Please try again.',
        
        // Premium-related errors
        unlockPremiumFailed: 'Failed to unlock premium. Please try again.',
        
        // Results-related errors
        noPreviousResults: 'No previous results found.',
        loadLastResultsFailed: 'Failed to load last results. Please try again.',
        noResultsForPDF: 'No results to generate PDF.',
        generatePDFFailed: 'Failed to generate PDF. Please try again.',
        noResultsToShare: 'No results to share.',
        shareResultsFailed: 'Failed to share results. Please try again.',
        copyToClipboardFailed: 'Failed to copy results to clipboard.',
        
        // Development tools errors
        randomAnswersDevOnly: 'Random answers only available in development mode.',
        fillRandomAnswersFailed: 'Failed to fill random answers. Please try again.',
        toggleAppStateFailed: 'Failed to toggle app state. Please try again.',
        
        // Exit quiz errors
        exitQuizFailed: 'Failed to exit quiz. Please try again.',
        
        // Generic errors
        genericError: 'An error occurred. Please try again.',
        networkError: 'Network error. Please check your connection and try again.',
        validationError: 'Invalid input. Please check your data and try again.'
    },
    
    // Success Messages
    success: {
        premiumUnlocked: 'Premium features unlocked!',
        pdfGenerated: 'PDF generated successfully!',
        resultsCopied: 'Results copied to clipboard!',
        quizCompleted: 'Quiz completed successfully!',
        settingsSaved: 'Settings saved successfully!'
    },
    
    // Info Messages
    info: {
        loading: 'Loading...',
        processing: 'Processing...',
        generating: 'Generating...',
        saving: 'Saving...'
    },
    
    // Warning Messages
    warnings: {
        unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
        dataLoss: 'This action may result in data loss. Continue?',
        premiumRequired: 'This feature requires a premium subscription.'
    },
    
    // Console Messages (for debugging)
    console: {
        initStart: '🚀 Initializing MBTI Personality Quiz Application...',
        initSuccess: '✅ Application initialized successfully',
        initFailed: '❌ Failed to initialize application:',
        globalError: 'Global error:',
        unhandledRejection: 'Unhandled promise rejection:',
        errorStartingQuiz: 'Error starting quiz:',
        errorStartingQuizType: 'Error starting quiz type:',
        errorSelectingOption: 'Error selecting option:',
        errorNextQuestion: 'Error in next question:',
        errorPreviousQuestion: 'Error in previous question:',
        errorRestartingQuiz: 'Error restarting quiz:',
        errorUnlockingPremium: 'Error unlocking premium:',
        errorViewingLastResults: 'Error viewing last results:',
        errorGeneratingPDF: 'Error generating PDF:',
        errorSharingResults: 'Error sharing results:',
        errorFillingRandomAnswers: 'Error filling random answers:',
        errorTogglingAppState: 'Error toggling app state:',
        errorExitingQuiz: 'Error exiting quiz:',
        randomAnswersFilled: 'Random answers filled from welcome screen!',
        randomAnswersFilledTesting: 'Random answers filled for testing!',
        appStateChanged: 'App state changed to: {state}',
        currentAppState: 'Current app state: {state}'
    },
    
    // UI Messages
    ui: {
        // Quiz-related
        questionCounter: 'Question {current} of {total}',
        startQuiz: 'Start Quiz',
        nextQuestion: 'Next Question',
        previousQuestion: 'Previous Question',
        restartQuiz: 'Take Quiz Again',
        exitQuiz: 'Exit Quiz',
        browseTypes: 'Browse Types',
        viewLastResults: 'View Last Results',
        
        // Results-related
        shareResults: 'Share Results',
        downloadPDF: 'Download PDF Report',
        copyLink: 'Copy Link',
        generatingPDF: 'Generating PDF...',
        pdfGenerated: 'PDF Generated!',
        copied: 'Copied!',
        resultsCopiedAlert: 'Results copied to clipboard!',
        
        // Premium-related
        upgradeToPremium: 'Upgrade to Premium',
        premiumActive: 'Premium Active',
        premiumUnlocked: '🎉 Premium unlocked! Enjoy all features.',
        unlockPremium: 'Unlock Premium (Demo)',
        
        // App state
        development: 'DEVELOPMENT',
        release: 'RELEASE',
        
        // Quiz types
        mbtiQuiz: 'MBTI Personality Quiz',
        leadershipQuiz: 'Leadership Style Quiz',
        communicationQuiz: 'Communication Style Quiz',
        stressQuiz: 'Stress Response Quiz',
        learningQuiz: 'Learning Style Quiz',
        relationshipsQuiz: 'Relationship Dynamics Quiz',
        creativityQuiz: 'Creativity & Innovation Quiz',
        decisionQuiz: 'Decision Making Quiz',
        
        // Quiz descriptions
        mbtiDescription: 'This quiz will help you discover your Myers-Briggs Type Indicator (MBTI) personality type. The assessment consists of {count} questions that will evaluate your preferences across four dimensions:',
        premiumUpgradeNote: '(Upgrade to Premium for the full 60-question assessment)',
        
        // Dimensions
        dimensionEI: 'Extraversion (E) vs Introversion (I)',
        dimensionSN: 'Sensing (S) vs Intuition (N)',
        dimensionTF: 'Thinking (T) vs Feeling (F)',
        dimensionJP: 'Judging (J) vs Perceiving (P)',
        dimensionEIDesc: 'How you direct and receive energy',
        dimensionSNDesc: 'How you take in information',
        dimensionTFDesc: 'How you make decisions',
        dimensionJPDesc: 'How you approach the outer world',
        
        // Welcome screen
        welcomeTitle: 'Welcome to the MBTI Personality Quiz',
        welcomeDescription: 'This quiz will help you discover your Myers-Briggs Type Indicator (MBTI) personality type. The assessment consists of {count} questions that will evaluate your preferences across four dimensions:',
        
        // Premium features
        premiumFeatures: {
            advancedInsights: 'Advanced personality insights',
            pdfReport: 'Downloadable PDF report',
            famousPersonalities: 'Comparison to famous personalities',
            saveShare: 'Save/share results with a custom link',
            fullDescriptions: 'Full type descriptions',
            visualAnalytics: 'Visual analytics (charts/graphs)',
            adFree: 'Ad-free experience'
        },
        
        // Modal titles
        unlockPremiumTitle: 'Unlock Premium Features',
        mbtiTypesTitle: 'MBTI Personality Types',
        typesHeader: 'Explore all 16 personality types. Full descriptions available with Premium.',
        
        // PDF content
        pdfTitle: 'Personality Report',
        pdfPersonalDevelopment: 'Personal Development:',
        
        // Buttons
        close: 'Close',
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        loading: 'Loading...',
        processing: 'Processing...'
    },
    
    // Quiz Types
    quizTypes: {
        mbti: {
            name: 'MBTI Personality Assessment',
            description: 'Discover your Myers-Briggs Type Indicator personality type'
        },
        leadership: {
            name: 'Leadership Style Assessment',
            description: 'Discover your leadership approach and preferences'
        },
        communication: {
            name: 'Communication Style Assessment',
            description: 'Understand how you communicate and interact with others'
        },
        stress: {
            name: 'Stress Response Assessment',
            description: 'Learn how you handle stress and pressure'
        },
        learning: {
            name: 'Learning Style Assessment',
            description: 'Find your optimal learning method and preferences'
        },
        relationships: {
            name: 'Relationship Dynamics Assessment',
            description: 'Explore your relationship patterns and preferences'
        },
        creativity: {
            name: 'Creativity & Innovation Assessment',
            description: 'Unlock your creative potential and innovative thinking'
        },
        decision: {
            name: 'Decision Making Assessment',
            description: 'Understand your decision-making processes and preferences'
        },
        teamwork: {
            name: 'Team Collaboration Assessment',
            description: 'Discover your team role preferences and collaboration styles'
        },
        career: {
            name: 'Career Preferences Assessment',
            description: 'Find your ideal work environment and career motivations'
        },
        conflict: {
            name: 'Conflict Resolution Assessment',
            description: 'Learn your conflict handling style and resolution preferences'
        },
        motivation: {
            name: 'Motivation & Drive Assessment',
            description: 'Discover what drives you forward and keeps you motivated'
        },
        adaptability: {
            name: 'Adaptability & Change Assessment',
            description: 'Understand how you handle change and adapt to new situations'
        },
        emotional: {
            name: 'Emotional Intelligence Assessment',
            description: 'Assess your emotional awareness and interpersonal skills'
        },
        productivity: {
            name: 'Productivity Style Assessment',
            description: 'Optimize your work efficiency and task management'
        },
        social: {
            name: 'Social Interaction Assessment',
            description: 'Explore your social preferences and interaction styles'
        }
    }
};

export default en; 