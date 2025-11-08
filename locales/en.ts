export default {
  errors: {
    initFailed: 'Failed to initialize application. Please refresh the page.',
    unexpectedError: 'An unexpected error occurred. Please try again.',
    startQuizFailed: 'Failed to start quiz. Please try again.',
    selectOptionFailed: 'Failed to select option. Please try again.',
    nextQuestionFailed: 'Failed to proceed to next question. Please try again.',
    previousQuestionFailed: 'Failed to go to previous question. Please try again.',
    restartQuizFailed: 'Failed to restart quiz. Please try again.',
    unlockPremiumFailed: 'Failed to unlock premium. Please try again.',
    noPreviousResults: 'No previous results found.',
    loadLastResultsFailed: 'Failed to load last results. Please try again.',
    noResultsToShare: 'No results to share.',
    shareResultsFailed: 'Failed to share results. Please try again.',
    copyToClipboardFailed: 'Failed to copy results to clipboard.',
    randomAnswersDevOnly: 'Random answers only available in development mode.',
    fillRandomAnswersFailed: 'Failed to fill random answers. Please try again.',
    toggleAppStateFailed: 'Failed to toggle app state. Please try again.',
    exitQuizFailed: 'Failed to exit quiz. Please try again.',
    genericError: 'An error occurred. Please try again.',
    networkError: 'Network error. Please check your connection and try again.',
    validationError: 'Invalid input. Please check your data and try again.'
  },
  success: {
    premiumUnlocked: 'Premium features unlocked!',
    resultsCopied: 'Results copied to clipboard!',
    quizCompleted: 'Quiz completed successfully!',
    settingsSaved: 'Settings saved successfully!'
  },
  info: {
    loading: 'Loading...',
    processing: 'Processing...',
    generating: 'Generating...',
    saving: 'Saving...'
  },
  warnings: {
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    dataLoss: 'This action may result in data loss. Continue?',
    premiumRequired: 'This feature requires a premium subscription.'
  },
  ui: {
    questionCounter: 'Question {current} of {total}',
    startQuiz: 'Start Quiz',
    nextQuestion: 'Next Question',
    previousQuestion: 'Previous Question',
    restartQuiz: 'Take Quiz Again',
    exitQuiz: 'Exit Quiz',
    browseTypes: 'Browse Types',
    viewLastResults: 'View Last Results',
    shareResults: 'Share Results',
    shareTitle: 'MBTI Personality Quiz Results',
    shareMessage: 'I just discovered my MBTI personality type is {type}! Take the quiz yourself to find yours.',
    shareDetails: 'My type: {type}. Scores — E:{e}% I:{i}%, S:{s}% N:{n}%, T:{t}% F:{f}%, J:{j}% P:{p}%',
    sharePersonality: 'Personality: {title} ({type})',
    shareFamous: 'Famous people: {names}',
    resetConfirmTitle: 'Restart test?',
    resetConfirmMessage: 'Are you sure you want to restart the current test? All selected answers will be cleared.',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    resultsCopiedAlert: 'Results copied to clipboard!',
    upgradeToPremium: 'Upgrade to Premium',
    premiumUnlocked: '🎉 Premium unlocked! Enjoy all features.',
    unlockPremium: 'Unlock Premium (Demo)',
    development: 'DEVELOPMENT',
    release: 'RELEASE',
    mbtiQuiz: 'MBTI Personality Quiz',
    leadershipQuiz: 'Leadership Style Quiz',
    communicationQuiz: 'Communication Style Quiz',
    stressQuiz: 'Stress Response Quiz',
    learningQuiz: 'Learning Style Quiz',
    relationshipsQuiz: 'Relationship Dynamics Quiz',
    creativityQuiz: 'Creativity & Innovation Quiz',
    decisionQuiz: 'Decision Making Quiz',
    mbtiDescription: 'This quiz will help you discover your Myers-Briggs Type Indicator (MBTI) personality type. The assessment consists of {count} questions that will evaluate your preferences across four dimensions:',
    dimensionEI: 'Extraversion (E) vs Introversion (I)',
    dimensionSN: 'Sensing (S) vs Intuition (N)',
    dimensionTF: 'Thinking (T) vs Feeling (F)',
    dimensionJP: 'Judging (J) vs Perceiving (P)',
    dimensionEIDesc: 'How you direct and receive energy',
    dimensionSNDesc: 'How you take in information',
    dimensionTFDesc: 'How you make decisions',
    dimensionJPDesc: 'How you approach the outer world',
    welcomeTitle: 'Welcome to the MBTI Personality Quiz',
    welcomeDescription: 'This quiz will help you discover your Myers-Briggs Type Indicator (MBTI) personality type. The assessment consists of {count} questions that will evaluate your preferences across four dimensions:',
    unlockPremiumTitle: 'Unlock Premium Features',
    mbtiTypesTitle: 'MBTI Personality Types',
    typesHeader: 'Explore all 16 personality types. Full descriptions available with Premium.',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    processing: 'Processing...'
  },
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
    }
  }
}
