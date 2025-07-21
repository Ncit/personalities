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
        errorExitingQuiz: 'Error exiting quiz:'
    }
};

export default en; 