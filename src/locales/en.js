export const en = {
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
        validationError: 'Invalid input. Please check your data and try again.',
        paymentError: 'Payment error. Please try again later.',
        networkErrorShort: 'Network error. Check your connection.',
        genericErrorShort: 'An error occurred. Please try again later.',
        errorTitle: 'Error',
        shareFailed: 'Failed to share the result.',
        userNotIdentified: 'User not identified.',
        paymentProcessing: 'Payment is being processed. Premium will activate automatically.',
        userNotFound: 'Could not identify user',
        paymentFailed: 'Payment error. Try again later.',
    },

    success: {
        premiumUnlocked: 'Premium unlocked!',
        resultsCopied: 'Results copied to clipboard!',
        quizCompleted: 'Quiz completed successfully!',
        settingsSaved: 'Settings saved successfully!',
    },

    info: {
        loading: 'Loading...',
        processing: 'Processing...',
        generating: 'Generating...',
        saving: 'Saving...',
    },

    warnings: {
        unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
        dataLoss: 'This action may result in data loss. Continue?',
        premiumRequired: 'This feature requires a premium subscription.',
    },

    // Navigation
    nav: {
        home: 'HOME',
        catalog: 'CATALOG',
        results: 'RESULTS',
        achievements: 'ACHIEVEMENTS',
        profile: 'PROFILE',
        homeSidebar: 'Home',
        catalogSidebar: 'Catalog',
        resultsSidebar: 'Results',
        profileSidebar: 'Profile',
    },

    // Footer / Sidebar sections
    footer: {
        helpTitle: 'Help',
        aboutTitle: 'About',
        howToTest: 'How to Take a Test',
        understandingResults: 'Understanding Results',
        premiumFeatures: 'Premium Features',
        faq: 'FAQ',
        aboutPersonality: 'About Personality Types',
        privacy: 'Privacy',
        terms: 'Terms of Use',
        offer: 'Public Offer',
        contacts: 'Contacts',
    },

    // Home screen
    home: {
        subtitle: 'Explore your personality through different frameworks',
        premium: 'Premium',
        premiumSubtitle: 'Unlock all tests and analytics',
        mainTests: 'Main Tests',
        personalityTypes: 'Personality Types',
        shareType: 'Share Your Type',
        inviteFriends: 'Invite friends',
        share: 'Share',
        myResults: '🧠 My results:',
        myTypes: 'My personality types',
        goodMorning: 'Good morning',
        goodAfternoon: 'Good afternoon',
        goodEvening: 'Good evening',
    },

    // Quiz cards
    quizCards: {
        mbtiTitle: 'MBTI — 16 Personality Types',
        mbtiMeta: '60 questions · 15 min · Free',
        socionicsTitle: 'Socionics — 16 Sociotypes',
        socionicsMeta: '48 questions · 12 min · Free',
        enneagramTitle: 'Enneagram — 9 Types',
        enneagramMeta: '36 questions · 10 min · Free',
    },

    // Framework filters
    frameworks: {
        mbti: 'MBTI',
        socionics: 'Socionics',
        enneagram: 'Enneagram',
    },

    // Framework names (for QuizScreen, ResultsTimeline, etc.)
    frameworkNames: {
        mbti: 'MBTI',
        socionics: 'Socionics',
        enneagram: 'Enneagram',
        leadership: 'Leadership Style',
        communication: 'Communication Style',
        stress: 'Stress Response',
        learning: 'Learning Style',
        relationships: 'Relationship Dynamics',
        creativity: 'Creativity',
        decision: 'Decision Making',
        teamwork: 'Teamwork',
        career: 'Career',
        social: 'Social Interaction',
        motivation: 'Motivation',
        adaptability: 'Adaptability',
        conflict: 'Conflict Resolution',
        productivity: 'Productivity',
        emotional: 'Emotional Intelligence',
        socionics_intertype: 'Intertype Relations',
        socionics_quadra: 'Quadra Values',
        socionics_functions: 'Info. Metabolism',
        socionics_conflict: 'Conflictology',
        socionics_career: 'Career & Sociotype',
        socionics_love: 'Love & Duality',
        enneagram_wings: 'Wings & Subtypes',
        enneagram_stress: 'Stress & Growth',
        enneagram_instincts: 'Survival Instincts',
        enneagram_relationships: 'Relationships',
        enneagram_shadow: 'Shadow Side',
        enneagram_spiritual: 'Spiritual Path',
    },

    // Profile screen
    profile: {
        title: 'Profile',
        guest: 'Guest',
        signInToSave: 'Sign in to save your results',
        testsCompleted: 'Tests Completed',
        accuracy: 'Accuracy',
        premiumSubtitle: 'Unlock all tests and analytics',
        signInVK: 'Sign In with VK',
        saveResults: 'Save results and achievements across devices',
        signIn: 'Sign In',
        devSignIn: 'Dev: Sign in as test user',
        devSignInBtn: 'Sign in as Nikita (test)',
        help: 'Help',
        about: 'About',
        footerText: 'Personality Test. Based on personality psychology research.',
        devTools: 'Developer Tools',
        togglePremiumOn: 'Enable Premium',
        togglePremiumOff: 'Disable Premium',
        clearStorage: 'Clear localStorage',
        toggleRelease: 'Switch to release',
        logoutVK: 'Log out of VK (test)',
    },

    // Quiz screen
    quiz: {
        loadingQuiz: 'Loading quiz...',
        loading: 'Loading...',
        back: 'Back',
        results: 'Results',
        next: 'Next',
        fillRandom: 'Fill randomly',
        exitTitle: 'Exit quiz?',
        exitText: 'Your progress will be lost. You can retake the test anytime.',
        exitConfirm: 'Exit',
        exitCancel: 'Continue',
        dimHeart: 'Heart',
        dimHead: 'Head',
        dimBody: 'Body',
    },

    // Achievements screen
    achievements: {
        title: 'Achievements',
        progress: 'Earned {earned} of {total}',
        firstSteps: 'First Steps',
        firstStepsDesc: 'Complete your first test',
        onFire: 'On Fire',
        onFireDesc: '3+ tests in a week',
        highAccuracy: 'High Accuracy',
        highAccuracyDesc: '85%+ confidence score',
        explorer: 'Explorer',
        explorerDesc: 'Discover 5 different types',
        collector: 'Collector',
        collectorDesc: 'Take tests from 3 different systems',
        marathon: 'Marathoner',
        marathonDesc: 'Complete 10 tests',
        stable: 'Stability',
        stableDesc: 'Same type 3 times in a row',
        perfectionist: 'Perfectionist',
        perfectionistDesc: '95%+ confidence score',
        earlyBird: 'Early Bird',
        earlyBirdDesc: 'Take a test before 7 AM',
        nightOwl: 'Night Owl',
        nightOwlDesc: 'Take a test after midnight',
        weekStreak: 'Growth Week',
        weekStreakDesc: 'Visit 7 days in a row',
        curious: 'Curious',
        curiousDesc: 'Open all help sections',
        specialist: 'Specialist',
        specialistDesc: 'Complete all premium tests',
        master: 'Master',
        masterDesc: 'Complete all available tests',
    },

    // Explore screen
    explore: {
        title: 'Catalog',
        mainMethods: 'Core Frameworks',
        premiumMbti: 'MBTI · Premium',
        premiumSocionics: 'Socionics · Premium',
        premiumEnneagram: 'Enneagram · Premium',
        leadershipStyle: 'Leadership Style',
        communicationStyle: 'Communication Style',
        stressResponse: 'Stress Response',
        learningStyle: 'Learning Style',
        relationshipDynamics: 'Relationship Dynamics',
        creativityInnovation: 'Creativity & Innovation',
        decisionMaking: 'Decision Making',
        teamCollaboration: 'Team Collaboration',
        careerPreferences: 'Career Preferences',
        socialInteraction: 'Social Interaction',
        motivationDrive: 'Motivation & Drive',
        adaptabilityChange: 'Adaptability & Change',
        conflictResolution: 'Conflict Resolution',
        productivityStyle: 'Productivity Style',
        emotionalIntelligence: 'Emotional Intelligence',
        intertypeRelations: 'Intertype Relations',
        quadraValues: 'Quadra Values',
        infoMetabolism: 'Information Metabolism',
        conflictology: 'Conflictology',
        careerSociotype: 'Career & Sociotype',
        loveDuality: 'Love & Duality',
        wingsSubtypes: 'Wings & Subtypes',
        stressGrowth: 'Stress & Growth',
        survivalInstincts: 'Survival Instincts',
        enneagramRelationships: 'Enneagram Relationships',
        shadowSide: 'Shadow Side',
        spiritualPath: 'Spiritual Path',
        questionsMin: '{questions} questions · {time} min',
    },

    // Premium modal
    premium: {
        title: 'Premium',
        subtitle: 'Unlock the full personality experience',
        benefit1: 'Advanced personality analysis',
        benefit2: 'All specialized premium tests',
        benefit3: 'Famous personality matches',
        benefit4: 'Visual charts and analytics',
        benefit5: 'Ad-free',
        processing: 'Processing…',
        note: 'One-time payment · No subscription',
        buttonTgRu: 'Get Premium — 150 ₽ / ⭐ 75',
        buttonTgEn: 'Get Premium — ⭐ 75',
        buttonDefault: 'Get Premium — 150 ₽',
        unlocked: 'Premium unlocked!',
    },

    // Payment choice (TG)
    payment: {
        choiceTitle: 'Payment Method',
        choiceMessage: 'Choose a payment method for Premium:',
    },

    // Help content
    help: {
        howToTest: {
            title: 'How to Take a Test',
            content: `
                <h3>Step-by-Step Guide</h3>
                <ol>
                    <li><strong>Choose a test type:</strong> Main test (61 questions) or specialized test</li>
                    <li><strong>Answer honestly:</strong> Pick the option that best matches your behavior</li>
                    <li><strong>Don't overthink:</strong> Your first reaction is usually the most accurate</li>
                    <li><strong>Complete the test:</strong> Answer all questions to the end</li>
                    <li><strong>Study your results:</strong> Read the description of your personality type</li>
                </ol>
                <p><strong>Tip:</strong> You can retake the test, but it's recommended to wait between attempts.</p>
            `,
        },
        understandingResults: {
            title: 'Understanding Results',
            content: `
                <h3>MBTI — 16 Personality Types</h3>
                <p>The test measures 4 core dichotomies:</p>
                <ul>
                    <li><strong>E/I (Extraversion/Introversion):</strong> Where you get your energy</li>
                    <li><strong>S/N (Sensing/Intuition):</strong> How you take in information</li>
                    <li><strong>T/F (Thinking/Feeling):</strong> How you make decisions</li>
                    <li><strong>J/P (Judging/Perceiving):</strong> How you approach the outside world</li>
                </ul>
                <p>The combination of 4 letters gives one of 16 types (e.g., INTJ, ENFP). Percentages show how strong each preference is.</p>

                <h3>Socionics — 16 Sociotypes</h3>
                <p>Socionics is based on information metabolism theory and measures 4 dichotomies:</p>
                <ul>
                    <li><strong>Logic/Ethics:</strong> Priority of objective facts or feelings and relationships</li>
                    <li><strong>Intuition/Sensing:</strong> Abstract thinking or practical perception</li>
                    <li><strong>Extraversion/Introversion:</strong> Attention direction — external or internal world</li>
                    <li><strong>Rationality/Irrationality:</strong> Planning and order or flexibility and spontaneity</li>
                </ul>
                <p>The result is one of 16 sociotypes, each with a unique information processing model and interaction style.</p>

                <h3>Enneagram — 9 Types</h3>
                <p>The Enneagram describes 9 personality types through 3 intelligence centers:</p>
                <ul>
                    <li><strong>Heart (Types 2, 3, 4):</strong> Feeling center — emotions, self-image, relationships</li>
                    <li><strong>Head (Types 5, 6, 7):</strong> Thinking center — analysis, safety, planning</li>
                    <li><strong>Body (Types 8, 9, 1):</strong> Instinct center — action, control, justice</li>
                </ul>
                <p>Each type has a core fear and core desire that drive behavior. Percentages show each center's strength.</p>
                <p style="margin-top:16px"><strong>Tip:</strong> Take tests from all three systems for the most complete picture of your personality.</p>
            `,
        },
        premiumFeatures: {
            title: 'Premium Features',
            content: `
                <h3>What's Included in Premium</h3>
                <ul>
                    <li><strong>Advanced analytics:</strong> Detailed charts and diagrams</li>
                    <li><strong>Famous personality matches:</strong> Find out which celebrities share your type</li>
                    <li><strong>Specialized tests:</strong> 12 additional tests for different personality aspects</li>
                    <li><strong>Ad-free:</strong> Clean interface without distractions</li>
                </ul>
            `,
        },
        faq: {
            title: 'Frequently Asked Questions',
            content: `
                <h3>FAQ</h3>
                <div class="help-modal__faq-item">
                    <h4>Can my type change over time?</h4>
                    <p>Yes, personality type can evolve, especially at a young age. It's recommended to retake the test every 1-2 years.</p>
                </div>
                <div class="help-modal__faq-item">
                    <h4>Why might results differ?</h4>
                    <p>Results are influenced by mood, health, and life circumstances. For accuracy, take the test in a calm state.</p>
                </div>
                <div class="help-modal__faq-item">
                    <h4>Which test should I choose?</h4>
                    <p>Start with the main personality test. Specialized tests help you understand specific aspects of your character more deeply.</p>
                </div>
            `,
        },
        aboutPersonality: {
            title: 'About Personality Types',
            content: `
                <h3>What Are Personality Types</h3>
                <p>Personality types are a psychological model based on Carl Jung's theory of psychological types.</p>
                <p><strong>History:</strong> Developed from psychological type research and adapted for practical use.</p>
                <p><strong>Scientific basis:</strong> Based on psychological type theory and personality psychology research.</p>
                <p><strong>Application:</strong> Used in education, business, career counseling, and personal development.</p>
            `,
        },
        privacy: {
            title: 'Privacy',
            content: `
                <h3>Your Privacy</h3>
                <p>We take the protection of your personal data seriously:</p>
                <ul>
                    <li>Test results are stored only on your device</li>
                    <li>We do not share your data with third parties</li>
                    <li>We use secure data processing methods</li>
                    <li>You can delete your data at any time</li>
                </ul>
                <p><strong>Privacy questions:</strong> personalitiesresearch@mail.ru</p>
            `,
        },
        terms: {
            title: 'Terms of Use',
            content: `
                <h3>Terms of Use</h3>
                <p>By using our service, you agree to the following:</p>
                <ul>
                    <li>Test results are intended for personal use only</li>
                    <li>Do not use results for discrimination</li>
                    <li>Service is provided "as is"</li>
                    <li>We are not responsible for decisions made based on results</li>
                </ul>
            `,
        },
        offer: {
            title: 'Public Offer',
            content: `
                <h3>Public Offer</h3>
                <p><strong>For personality testing services</strong></p>
                <h4>1. GENERAL PROVISIONS</h4>
                <p>Name: Feshchun N.Yu.<br>TIN: 920352231504</p>
                <p>1.1. This public offer defines the terms for personality testing services.</p>
                <p>1.2. Acceptance of this Offer is the completion of actions aimed at receiving services, including:</p>
                <ul>
                    <li>Registration on the site</li>
                    <li>Taking tests</li>
                    <li>Payment for services</li>
                </ul>
                <h4>2. SUBJECT OF THE AGREEMENT</h4>
                <p>2.1. Services provided:</p>
                <ul>
                    <li>Access to personality tests based on MBTI typology (16 personality types)</li>
                    <li>Basic test results</li>
                    <li>Personality type description</li>
                    <li>Additional premium features (with payment)</li>
                </ul>
                <p>2.2. Premium features include:</p>
                <ul>
                    <li>Advanced personality analysis</li>
                    <li>Famous personality matches</li>
                    <li>Visual analytics (charts and diagrams)</li>
                    <li>Premium tests (12 specialized types)</li>
                    <li>No ads</li>
                </ul>
                <h4>3. PRICING AND PAYMENT</h4>
                <p>3.1. Basic services are provided free of charge.</p>
                <p>3.2. Premium access costs 150 ₽ or 75 Telegram Stars.</p>
                <p>3.3. Payment methods:</p>
                <ul>
                    <li>Web and VK Mini App: bank card (150 ₽)</li>
                    <li>Telegram Mini App: Telegram Stars (75 Stars) or bank card (150 ₽)</li>
                </ul>
                <h4>4. REFUNDS</h4>
                <p>4.1. Refunds are available for:</p>
                <ul>
                    <li>Technical inability to provide services</li>
                    <li>Double charges</li>
                    <li>Payment errors</li>
                </ul>
                <p>4.2. Refunds are not available for:</p>
                <ul>
                    <li>Fully received services</li>
                    <li>Violation of terms of use</li>
                    <li>More than 14 days after payment</li>
                </ul>
                <p>4.3. Refund requests: personalitiesresearch@mail.ru</p>
                <h4>5. CONFIDENTIALITY</h4>
                <p>5.1. Both parties agree not to disclose confidential information.</p>
                <p>5.2. Personal data is processed in accordance with personal data protection laws.</p>
                <p>5.3. The provider may use anonymized data to improve the service.</p>
                <h4>6. CONTACT INFORMATION</h4>
                <p>Email: personalitiesresearch@mail.ru</p>
                <p>Date: 2025<br>Version: 1.0</p>
            `,
        },
        contacts: {
            title: 'Contacts',
            content: `
                <h3>Contact Us</h3>
                <p>We welcome your questions, suggestions, and feedback.</p>
                <ul>
                    <li><strong>Email:</strong> personalitiesresearch@mail.ru</li>
                    <li><strong>Response time:</strong> Usually within 24 hours on business days</li>
                </ul>
                <p>We strive to make our service better through your feedback!</p>
            `,
        },
    },

    // Hero card
    hero: {
        comingSoon: 'Coming Soon',
        keirsey: 'Keirsey Temperament\n4 temperament types',
        cognitive: 'Cognitive Functions\npure Jungian model',
        mbti: '16 personality types\nand your place among them',
        socionics: '16 sociotypes\nand intertype connections',
        enneagram: '9 personality types\nand wings of character',
    },

    // Bento grid
    bento: {
        yourType: 'Your Type',
        takeTest: 'Take a test',
        yourTraits: 'Your Traits',
        takeTestFirst: 'Take a test first',
    },

    // Results timeline
    resultsTimeline: {
        title: 'Results',
        emptyTitle: 'No Results Yet',
        emptyText: 'Take your first personality test to see results here.',
        toTests: 'Go to Tests',
        today: 'Today',
        yesterday: 'Yesterday',
        moreTestsHint: 'Take more tests (Socionics, Enneagram) to see type comparison and correlation',
        takeMoreTests: 'Take Another Test',
        typeEvolution: 'Type Evolution',
        openPremium: 'Get Premium',
        evolutionDesc: 'Results comparison, diagram, stability and type correlation',
    },

    // Result detail
    resultDetail: {
        toResults: 'To Results',
        yourPreferences: 'Your Preferences',
        visualAnalytics: 'Visual Analytics',
        radarChart: 'Radar Chart',
        dimensionComparison: 'Dimension Comparison',
        personalityBalance: 'Personality Balance',
        preferenceDistribution: 'Preference Distribution',
        functionStack: 'Function Stack',
        energyCenters: 'Energy Centers',
        personalityTimeline: 'Personality Timeline',
        strengthAnalysis: 'Strength Analysis',
        deepAnalysis: 'Deep Analysis',
        noData: 'No data',
        famousType: 'Famous {typeCode}',
        famousEnneagram: 'Famous Type {typeCode}',
        retake: 'Take Again',
        past: 'Past',
        currentPosition: 'Current position',
        present: 'Present',
        future: 'Future',
        personalityType: 'Personality type {typeCode}',
        paywallTitle: 'Deep Analysis',
        paywallDesc: 'Advanced analytics, famous personality matches and more',
        career: 'Career',
        strengths: 'Strengths',
        weaknesses: 'Weaknesses',
        growth: 'Growth',
        communication: 'Communication',
        underStress: 'Under Stress',
        relationships: 'Relationships',
        quadra: 'Quadra',
        functions: 'Functions',
        wings: 'Wings',
        fearsDesires: 'Fears & Desires',
    },

    // Comparison section
    comparison: {
        typeEvolution: 'Type Evolution',
        results: '{count} results',
        dimensionComparison: 'Dimension Comparison',
        resultStability: 'Result Stability',
        overallStability: 'Overall stability',
        typeCorrelation: 'Type Correlation',
        deleteTitle: 'Delete result?',
        deleteText: '{typeCode} from {date} will be permanently deleted.',
        deleteConfirm: 'Delete',
        deleteCancel: 'Cancel',
        excluded: '✕ Excluded',
        included: '✓ Included',
        includeAtLeast: 'Include at least one result',
        basedOn: 'Based on {framework}',
        profileCombines: 'Your profile combines',
        uniqueProfile: 'Unique profile based on your results.',
        ofMBTI: 'MBTI',
        ofSocionics: 'Socionics',
        ofEnneagram: 'Enneagram',
    },

    // Framework info screen
    frameworkInfo: {
        functions: 'functions',
        types: 'types',
        questions: 'questions',
        dimensions: 'Dimensions',
        comingSoon: 'Coming Soon',
        startTest: 'Start Test',
        jungTitle: 'Jungian Cognitive Functions',
        jungDesc: "Carl Jung's original typology — the foundation of all modern typing systems. Defines 8 cognitive functions: ways of perceiving and evaluating information that shape your thinking and behavior.",
        jungSeSi: 'Sensation',
        jungSeSiDesc: 'External perception or internal impressions',
        jungNeNi: 'Intuition',
        jungNeNiDesc: 'External possibilities or internal foresight',
        jungTeTi: 'Thinking',
        jungTeTiDesc: 'External logic or internal analysis',
        jungFeFi: 'Feeling',
        jungFeFiDesc: 'External harmony or internal values',
        mbtiTitle: 'MBTI — 16 Personality Types',
        mbtiDesc: 'The Myers-Briggs Type Indicator (MBTI) is one of the most popular personality classification systems. Based on Carl Jung\'s theory of psychological types.',
        mbtiEI: 'Extraversion — Introversion',
        mbtiEIDesc: 'Where you get your energy',
        mbtiSN: 'Sensing — Intuition',
        mbtiSNDesc: 'How you take in information',
        mbtiTF: 'Thinking — Feeling',
        mbtiTFDesc: 'How you make decisions',
        mbtiJP: 'Judging — Perceiving',
        mbtiJPDesc: 'How you organize your life',
        mbtiTime: '15 min',
        socionicsTitle: 'Socionics',
        socionicsDesc: 'Socionics studies 16 sociotypes and their interactions. Helps understand compatibility, intertype relations, and information metabolism.',
        socLE: 'Logic / Ethics',
        socLEDesc: 'Logical or ethical approach',
        socIN: 'Intuition / Sensing',
        socINDesc: 'Abstract or concrete thinking',
        socEI: 'Extraversion / Introversion',
        socEIDesc: 'Direction of attention',
        socRJ: 'Rationality / Irrationality',
        socRJDesc: 'Decision-making approach',
        socionicsTime: '12 min',
        enneagramTitle: 'Enneagram',
        enneagramDesc: 'The Enneagram describes 9 core personality types, each with unique motivations, fears, and paths of development. Includes a system of wings and integration lines.',
        enn234: 'Feeling Center',
        enn234Desc: 'Emotional intelligence',
        enn567: 'Thinking Center',
        enn567Desc: 'Intellectual analysis',
        enn891: 'Action Center',
        enn891Desc: 'Instinctive reactions',
        enneagramTime: '10 min',
    },

    // Months (short)
    months: {
        jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
        jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
    },

    // Console messages
    console: {
        initStart: '🚀 Initializing Personality Quiz Application...',
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
        errorSharingResults: 'Error sharing results:',
        errorFillingRandomAnswers: 'Error filling random answers:',
        errorTogglingAppState: 'Error toggling app state:',
        errorExitingQuiz: 'Error exiting quiz:',
        randomAnswersFilled: 'Random answers filled from welcome screen!',
        randomAnswersFilledTesting: 'Random answers filled for testing!',
        appStateChanged: 'App state changed to: {state}',
        currentAppState: 'Current app state: {state}',
    },

    // UI messages (backward compat)
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
        close: 'Close',
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        loading: 'Loading...',
        processing: 'Processing...',
    },
};

export default en;
