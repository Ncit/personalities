// Socionics Quiz Questions - English Version
// This file contains 48 questions for the socionics personality assessment
// Questions are organized by four socionics dimensions: LE, IN, EI, RJ

export const SOCIONICS_QUESTIONS = [
    // =============================================
    // Logic vs Ethics — dimension: LE
    // positive = Logic, negative = Ethics
    // =============================================
    {
        question: "When making an important decision, you rely more on:",
        options: [
            "Logical analysis of all pros and cons",
            "Objective data and facts",
            "Your feelings and gut sense of the situation",
            "The opinions and feelings of those around you"
        ],
        dimension: "LE",
        weights: [3, 2, -2, -3]
    },
    {
        question: "When a friend tells you about their problem, you usually:",
        options: [
            "Suggest concrete solutions",
            "Empathize and offer emotional support",
            "Analyze the root causes of the problem",
            "Try to understand their feelings and experiences"
        ],
        dimension: "LE",
        weights: [2, -3, 3, -2]
    },
    {
        question: "In an argument, what matters more to you?",
        options: [
            "Finding the truth, even if it hurts someone's feelings",
            "Preserving a good relationship with your opponent",
            "Presenting irrefutable arguments",
            "Considering each participant's position and emotions"
        ],
        dimension: "LE",
        weights: [3, -3, 2, -2]
    },
    {
        question: "How do you evaluate a colleague's work?",
        options: [
            "By objective results and efficiency",
            "By how comfortable they make the team feel",
            "By their contribution to the overall team atmosphere",
            "By the quality and accuracy of completed tasks"
        ],
        dimension: "LE",
        weights: [3, -2, -3, 2]
    },
    {
        question: "What upsets you more?",
        options: [
            "Illogical and inconsistent decisions",
            "Unfair treatment of people",
            "Rudeness and tactlessness in communication",
            "Inaccurate data and errors in calculations"
        ],
        dimension: "LE",
        weights: [3, -1, -3, 2]
    },
    {
        question: "When a conflict arises in a group, you:",
        options: [
            "Try to understand the emotions of each side",
            "Look for an objective and fair solution",
            "Analyze who is right on the substance of the issue",
            "Try to reconcile the sides and restore harmony"
        ],
        dimension: "LE",
        weights: [-2, 1, 3, -3]
    },
    {
        question: "Which leadership style is closer to you?",
        options: [
            "Clear rules and objective evaluation criteria",
            "Attention to the needs of each team member",
            "A strict system of metrics and reporting",
            "Creating a friendly and warm team atmosphere"
        ],
        dimension: "LE",
        weights: [3, -2, 2, -3]
    },
    {
        question: "When choosing a gift for someone you know, you:",
        options: [
            "Analyze what they would practically need",
            "Sense what would make them happy and touched",
            "Choose the best value for the price",
            "Try to give something meaningful and heartfelt"
        ],
        dimension: "LE",
        weights: [2, -2, 3, -3]
    },
    {
        question: "How do you handle criticism?",
        options: [
            "I take it calmly if it's backed by facts",
            "I feel hurt if the criticism is delivered harshly",
            "The tone and intention of the critic matter more to me",
            "The substance of the remark matters more than the delivery"
        ],
        dimension: "LE",
        weights: [3, -2, -3, 2]
    },
    {
        question: "What do you consider more valuable in a person?",
        options: [
            "A sharp mind and ability to think logically",
            "Kindness and the ability to empathize",
            "Honesty and principled judgment",
            "The ability to create a warm atmosphere"
        ],
        dimension: "LE",
        weights: [3, -3, 2, -2]
    },
    {
        question: "In conversation, it's easier for you to:",
        options: [
            "Discuss ideas, theories, and concepts",
            "Share feelings and discuss relationships",
            "Reason about facts and patterns",
            "Talk about people, their motives, and emotions"
        ],
        dimension: "LE",
        weights: [2, -2, 3, -3]
    },
    {
        question: "When deciding on a purchase, you:",
        options: [
            "Compare specs and read reviews",
            "Go by your emotions and feelings",
            "Make a pros-and-cons table",
            "Ask close friends and family for their opinion"
        ],
        dimension: "LE",
        weights: [2, -1, 3, -3]
    },

    // =============================================
    // Intuition vs Sensing — dimension: IN
    // positive = Intuition, negative = Sensing
    // =============================================
    {
        question: "What attracts you more?",
        options: [
            "Reflecting on future possibilities and ideas",
            "Practical tasks in the present moment",
            "Theoretical models and abstract concepts",
            "Concrete, tangible results"
        ],
        dimension: "IN",
        weights: [3, -2, 2, -3]
    },
    {
        question: "When visiting a new city, you usually:",
        options: [
            "Are interested in its history and hidden meanings",
            "Enjoy the tastes, smells, and sights",
            "Imagine how this city could change",
            "Notice the architecture and details of the surroundings"
        ],
        dimension: "IN",
        weights: [2, -3, 3, -2]
    },
    {
        question: "When someone describes a new project, you first:",
        options: [
            "Envision the big picture and perspectives",
            "Ask about specific details and deadlines",
            "Think about hidden risks and opportunities",
            "Evaluate the available resources and means"
        ],
        dimension: "IN",
        weights: [3, -2, 2, -3]
    },
    {
        question: "Which books or movies appeal to you more?",
        options: [
            "Science fiction, philosophy, about the future and ideas",
            "Realistic life stories, documentaries",
            "Stories with deep subtext and symbolism",
            "Vivid descriptions of places, sensations, and action"
        ],
        dimension: "IN",
        weights: [3, -2, 2, -3]
    },
    {
        question: "You remember better:",
        options: [
            "The general meaning and idea of a conversation",
            "Specific words and details",
            "Associations and images that arose during the conversation",
            "Facts, dates, and precise data"
        ],
        dimension: "IN",
        weights: [2, -2, 3, -3]
    },
    {
        question: "How do you prefer to receive information?",
        options: [
            "Through metaphors, diagrams, and general concepts",
            "Through concrete examples and visual demonstrations",
            "Through discussion of ideas and hypotheses",
            "Through step-by-step instructions and hands-on practice"
        ],
        dimension: "IN",
        weights: [3, -2, 2, -3]
    },
    {
        question: "In everyday life, you pay more attention to:",
        options: [
            "Patterns and connections between events",
            "Physical sensations and comfort of your environment",
            "Possible ways events could develop",
            "Practical needs and current tasks"
        ],
        dimension: "IN",
        weights: [2, -3, 3, -2]
    },
    {
        question: "Your approach to problem-solving:",
        options: [
            "I look for unconventional and original solutions",
            "I use proven methods that have already worked",
            "I see many alternative paths",
            "I follow a clear, understandable algorithm"
        ],
        dimension: "IN",
        weights: [3, -2, 2, -3]
    },
    {
        question: "What is easier for you to describe?",
        options: [
            "A person's appearance, clothing, and mannerisms",
            "Their character, potential, and inner world",
            "Their habits and specific actions",
            "Their ideas, aspirations, and life philosophy"
        ],
        dimension: "IN",
        weights: [-3, 3, -2, 2]
    },
    {
        question: "When you cook, you:",
        options: [
            "Experiment and invent your own recipes",
            "Follow tried-and-true recipes with exact proportions",
            "Often get distracted, forgetting about timing and details",
            "Carefully monitor every step of the process"
        ],
        dimension: "IN",
        weights: [2, -2, 3, -3]
    },
    {
        question: "You feel more comfortable in an environment where:",
        options: [
            "There are many ideas and opportunities for growth",
            "Everything is stable, clear, and materially secure",
            "Innovation and out-of-the-box thinking are valued",
            "There are clear rules and predictable outcomes"
        ],
        dimension: "IN",
        weights: [3, -3, 2, -2]
    },
    {
        question: "Your desk is usually:",
        options: [
            "Creative chaos — the important thing is I know where everything is",
            "Everything is neatly arranged in its place",
            "Filled with notes of ideas and sketches",
            "Organized practically — everything within reach"
        ],
        dimension: "IN",
        weights: [2, -2, 3, -3]
    },

    // =============================================
    // Extraversion vs Introversion — dimension: EI
    // positive = Extraversion, negative = Introversion
    // =============================================
    {
        question: "At a party with strangers, you:",
        options: [
            "Easily introduce yourself and start conversations",
            "Stay close to people you already know",
            "Become the center of attention in a group",
            "Prefer to observe from the sidelines"
        ],
        dimension: "EI",
        weights: [2, -1, 3, -3]
    },
    {
        question: "After active socializing, you feel:",
        options: [
            "A surge of energy and inspiration",
            "Pleasant tiredness and a desire to be alone",
            "Ready to continue socializing",
            "A need for quiet and solitude"
        ],
        dimension: "EI",
        weights: [3, -1, 2, -3]
    },
    {
        question: "When you need to think through an important issue, you:",
        options: [
            "Discuss it with friends or colleagues",
            "Reflect on it alone, in silence",
            "Talk through your thoughts aloud with someone",
            "Write down your thoughts privately"
        ],
        dimension: "EI",
        weights: [3, -2, 2, -3]
    },
    {
        question: "Your ideal day off:",
        options: [
            "Spending time with friends or family",
            "Staying home alone, enjoying your hobby",
            "Attending a lively event or festival",
            "A quiet walk alone or with one close person"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -3]
    },
    {
        question: "In a work environment, you feel more comfortable:",
        options: [
            "In an open office where you can chat with colleagues",
            "In a private office or working remotely",
            "In meetings and discussions with others",
            "With minimal distracting interactions"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -3]
    },
    {
        question: "How do you usually recharge your energy?",
        options: [
            "Through active socializing and group activities",
            "Through solitude and inner reflection",
            "Through meeting new people and new experiences",
            "Through immersing yourself in a favorite activity alone"
        ],
        dimension: "EI",
        weights: [3, -2, 2, -3]
    },
    {
        question: "When you have good news, you first:",
        options: [
            "Call friends or post on social media",
            "Feel happy quietly and share later",
            "Tell everyone you meet",
            "Share only with your closest people"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -1]
    },
    {
        question: "In an unfamiliar setting, you:",
        options: [
            "Quickly adapt and take initiative",
            "Cautiously observe and gradually adjust",
            "Actively explore and ask questions",
            "Try to find a quiet corner and figure things out on your own"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -3]
    },
    {
        question: "What best describes your social circle?",
        options: [
            "Many acquaintances and friends from different areas",
            "A small circle of close, trusted people",
            "A constantly expanding network of contacts",
            "I prefer deep relationships with a few people"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -3]
    },
    {
        question: "In a meeting, you usually:",
        options: [
            "Actively voice your ideas",
            "Listen carefully and formulate thoughts internally",
            "Stimulate discussion and involve others",
            "Speak up only when you're confident in your position"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -1]
    },
    {
        question: "A phone call from an unknown number:",
        options: [
            "I easily pick up, curious who it is",
            "I prefer not to answer and wait for a message",
            "I answer without hesitation — it could be important",
            "I feel uncomfortable and try to avoid the call"
        ],
        dimension: "EI",
        weights: [2, -2, 3, -3]
    },
    {
        question: "How do you feel about teamwork?",
        options: [
            "I enjoy exchanging ideas and working together",
            "I prefer to get a task and complete it independently",
            "I work best when coordinating a group's efforts",
            "Teams are distracting — I'm more effective alone"
        ],
        dimension: "EI",
        weights: [2, -1, 3, -3]
    },

    // =============================================
    // Rational vs Irrational — dimension: RJ
    // positive = Rational, negative = Irrational
    // =============================================
    {
        question: "How do you usually plan your day?",
        options: [
            "I make a clear plan and try to follow it",
            "I go with the flow, without a rigid plan",
            "I plan the main tasks but leave room for improvisation",
            "I prefer complete spontaneity and freedom"
        ],
        dimension: "RJ",
        weights: [3, -2, 1, -3]
    },
    {
        question: "When your plans change unexpectedly, you:",
        options: [
            "Feel irritation and stress",
            "Easily adapt to the new circumstances",
            "Try to get back to the original plan",
            "See it as an opportunity for something new"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "How do you approach completing tasks?",
        options: [
            "Sequentially, step by step, in order",
            "Chaotically, switching between different things",
            "Starting with the most important, following priorities",
            "Tackling whatever inspires me at the moment"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "Your attitude toward deadlines:",
        options: [
            "I always try to finish ahead of time",
            "I often procrastinate until the last moment",
            "I distribute my time clearly and meet deadlines",
            "Deadlines feel restrictive — I work at my own pace"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "On vacation, you prefer:",
        options: [
            "A pre-planned itinerary with bookings",
            "Going without a plan, deciding on the spot",
            "A general plan with room for detours",
            "Completely improvising and following your mood"
        ],
        dimension: "RJ",
        weights: [3, -2, 1, -3]
    },
    {
        question: "How do you make decisions?",
        options: [
            "Thoughtfully, having considered all options in advance",
            "Quickly, trusting your instinct in the moment",
            "Following certain principles and criteria",
            "Spontaneously, depending on the circumstances"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "What does your ideal workspace look like?",
        options: [
            "Structured, with a clear schedule and processes",
            "Flexible, with the ability to change tasks and approaches",
            "With clear goals and predictable outcomes",
            "Free, without rigid frameworks and regulations"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "How do you usually prepare for an important meeting?",
        options: [
            "I prepare talking points and a list of questions",
            "I show up and act based on the situation",
            "I think through the main points in advance",
            "I rely on inspiration and improvisation"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "Your wardrobe:",
        options: [
            "Is planned in advance with thought-out combinations",
            "I dress based on my mood each day",
            "I have proven combinations that I follow",
            "I choose clothes intuitively, without overthinking"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "How do you feel about rules and norms?",
        options: [
            "I consider them a necessary foundation of order",
            "I see them as limitations that can be bypassed",
            "I follow them if they are reasonable and justified",
            "I prefer to act at my own discretion"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "Unfinished tasks make you feel:",
        options: [
            "Strong discomfort — I want to finish everything",
            "Calm — I'll get to it when I feel inspired",
            "An urge to make a list and sort things out",
            "A sense of freedom — it means there are still options"
        ],
        dimension: "RJ",
        weights: [3, -2, 2, -3]
    },
    {
        question: "How do you manage your finances?",
        options: [
            "I keep a budget and plan expenses",
            "I spend as the situation calls for, without tracking much",
            "I have a general plan but don't track every detail",
            "Money is a tool for current desires"
        ],
        dimension: "RJ",
        weights: [3, -2, 1, -3]
    }
];

// =============================================
// 16 Socionics Types (Sociotypes)
// =============================================
export const SOCIONICS_TYPES = {
    // Alpha Quadra
    ILE: {
        code: "ILE",
        title: "Don Quixote",
        subtitle: "Seeker of possibilities and idea generator",
        description: "ILE is a tireless explorer who sees the world as an endless field of possibilities. Possesses a unique ability to find unconventional solutions and generate original ideas. Strives to understand the essence of things and uncover what is hidden from others.",
        traits: [
            "Generates numerous original ideas",
            "Quickly switches between topics and projects",
            "Sees hidden opportunities and prospects",
            "Loves intellectual discussions and debates",
            "Cannot stand routine and monotony"
        ],
        mbtiEquivalent: "ENTP",
        quadra: "Alpha"
    },
    SEI: {
        code: "SEI",
        title: "Dumas",
        subtitle: "Master of harmony and comfort",
        description: "SEI is a deeply sensitive person who creates an atmosphere of coziness and warmth around them. Excellently senses the physical needs of others and knows how to care for everyone. Values life's simple pleasures and knows how to enjoy the present moment.",
        traits: [
            "Creates a cozy and comfortable atmosphere",
            "Finely senses the mood of those around them",
            "Cares for the physical comfort of loved ones",
            "Values harmony and avoids conflicts",
            "Knows how to enjoy life's simple pleasures"
        ],
        mbtiEquivalent: "ISFP",
        quadra: "Alpha"
    },
    ESE: {
        code: "ESE",
        title: "Hugo",
        subtitle: "Energetic inspirer and life of the party",
        description: "ESE is a bright and emotional person who charges others with positive energy. Knows how to create a festive mood and unite people. Caring, generous, and always ready to help those in need.",
        traits: [
            "Charges others with positive energy",
            "Generous and caring toward loved ones",
            "Knows how to organize and inspire people",
            "Values traditions and family values",
            "Active, sociable, and emotionally open"
        ],
        mbtiEquivalent: "ESFJ",
        quadra: "Alpha"
    },
    LII: {
        code: "LII",
        title: "Robespierre",
        subtitle: "Analyst-idealist and systematic thinker",
        description: "LII is a deep thinker who strives to build coherent logical systems. Possesses a developed analytical mind and high moral principles. Values fairness, consistency, and intellectual honesty.",
        traits: [
            "Builds coherent logical systems",
            "Principled and consistent in beliefs",
            "Deeply analyzes information and theories",
            "Strives for fairness and objectivity",
            "Prefers solitary intellectual work"
        ],
        mbtiEquivalent: "INTJ",
        quadra: "Alpha"
    },

    // Beta Quadra
    EIE: {
        code: "EIE",
        title: "Hamlet",
        subtitle: "Passionate leader and emotional visionary",
        description: "EIE is an emotionally vivid personality with a developed intuition of time. Capable of foreseeing how events will unfold and emotionally influencing those around them. Strives for great goals and is ready to lead people toward grand achievements.",
        traits: [
            "Possesses strong emotional influence",
            "Foresees the development of situations and trends",
            "Strives for grand goals and ideals",
            "Knows how to motivate and inspire others",
            "Dramatic and expressive in self-expression"
        ],
        mbtiEquivalent: "ENFJ",
        quadra: "Beta"
    },
    LSI: {
        code: "LSI",
        title: "Maxim Gorky",
        subtitle: "Systematic organizer and guardian of order",
        description: "LSI is a person of order and systems who sees the world through the lens of structure and hierarchy. Reliable, responsible, and demanding of both themselves and others. Knows how to bring order to any chaos and create a working system.",
        traits: [
            "Creates clear and working systems",
            "Responsible, reliable, and disciplined",
            "Demanding of themselves and others",
            "Values order, hierarchy, and traditions",
            "Methodically sees things through to completion"
        ],
        mbtiEquivalent: "ISTJ",
        quadra: "Beta"
    },
    SLE: {
        code: "SLE",
        title: "Zhukov",
        subtitle: "Strong-willed strategist and natural leader",
        description: "SLE is a person of action with powerful will and strategic thinking. Knows how to mobilize resources and people to achieve goals. Decisive, persistent, and capable of acting in extreme conditions without losing composure.",
        traits: [
            "Possesses strong will and determination",
            "Thinks strategically and acts effectively",
            "Knows how to mobilize people and resources",
            "Not afraid of conflicts and difficult situations",
            "A natural leader and organizer"
        ],
        mbtiEquivalent: "ESTP",
        quadra: "Beta"
    },
    IEI: {
        code: "IEI",
        title: "Yesenin",
        subtitle: "Dreamy poet and subtle intuitive",
        description: "IEI is a romantic and dreamy nature with a deep inner world. Possesses a developed intuition of time and a subtle understanding of emotions. Sees beauty and hidden meaning in ordinary things, living in a world of images and premonitions.",
        traits: [
            "Possesses rich imagination and dreaminess",
            "Finely senses moods and emotions of people",
            "Sees hidden meanings and subtexts",
            "Romantic and tends to idealize",
            "Has premonitions of future events and changes"
        ],
        mbtiEquivalent: "INFP",
        quadra: "Beta"
    },

    // Gamma Quadra
    SEE: {
        code: "SEE",
        title: "Napoleon",
        subtitle: "Charismatic leader and master of influence",
        description: "SEE is an energetic and charming person who knows how to influence people and get their way. Possesses a developed sense of the situation and knows how to use emerging opportunities. Values status, success, and an active life position.",
        traits: [
            "Possesses natural charisma and charm",
            "Knows how to influence and persuade people",
            "Quickly assesses the balance of power in a situation",
            "Energetic, goal-oriented, and ambitious",
            "Flexibly adapts to changing circumstances"
        ],
        mbtiEquivalent: "ESFP",
        quadra: "Gamma"
    },
    ILI: {
        code: "ILI",
        title: "Balzac",
        subtitle: "Deep analyst and critical thinker",
        description: "ILI is a thoughtful observer who sees hidden trends and foresees how events will develop. Possesses a critical mind and the ability to identify weaknesses in any system. Reserved, realistic, and inclined toward deep analysis.",
        traits: [
            "Foresees consequences and hidden trends",
            "Possesses deep analytical thinking",
            "Realistic and skeptical toward utopias",
            "Sees weaknesses and potential threats",
            "Conserves energy and resources, avoiding waste"
        ],
        mbtiEquivalent: "INTP",
        quadra: "Gamma"
    },
    LIE: {
        code: "LIE",
        title: "Jack London",
        subtitle: "Dynamic entrepreneur and strategist of success",
        description: "LIE is a goal-oriented and dynamic person who sees the world as a field for achievement. Combines business acumen with an intuitive understanding of prospects. Values efficiency, progress, and strives for concrete results.",
        traits: [
            "Oriented toward achieving specific goals",
            "Combines logic with business intuition",
            "Energetic, proactive, and enterprising",
            "Values time and strives for efficiency",
            "Ready to take risks for promising projects"
        ],
        mbtiEquivalent: "ENTJ",
        quadra: "Gamma"
    },
    ESI: {
        code: "ESI",
        title: "Dreiser",
        subtitle: "Guardian of moral values and ethical principles",
        description: "ESI is a person with a deep sense of justice and firm moral principles. Divides the world into 'insiders' and 'outsiders,' zealously protecting the interests of loved ones. Reliable, loyal, and uncompromising on matters of morality.",
        traits: [
            "Possesses firm moral principles",
            "Loyal and devoted to close ones",
            "Clearly distinguishes right from wrong",
            "Protects the interests of their inner circle",
            "Attentive to the needs of those around them"
        ],
        mbtiEquivalent: "ISFJ",
        quadra: "Gamma"
    },

    // Delta Quadra
    IEE: {
        code: "IEE",
        title: "Huxley",
        subtitle: "Inspirer of potential and connoisseur of people",
        description: "IEE is a cheerful and curious person who sees hidden potential in everyone. Possesses a unique ability to reveal people's talents and inspire them to grow. Sociable, spontaneous, and full of enthusiasm.",
        traits: [
            "Sees hidden potential and talents in people",
            "Inspires others to develop and grow",
            "Sociable, spontaneous, and curious",
            "Easily establishes contact with anyone",
            "Full of enthusiasm and life energy"
        ],
        mbtiEquivalent: "ENFP",
        quadra: "Delta"
    },
    SLI: {
        code: "SLI",
        title: "Gabin",
        subtitle: "Master craftsman and connoisseur of quality",
        description: "SLI is a calm and practical person who values quality and craftsmanship. Possesses a developed sense of aesthetics and strives for perfection in details. Prefers to act at a measured pace, enjoying the process of work.",
        traits: [
            "Masterfully works with hands and technology",
            "Values quality, comfort, and aesthetics",
            "Calm, balanced, and self-sufficient",
            "Attentive to details and small things",
            "Prefers to act at their own pace"
        ],
        mbtiEquivalent: "ISTP",
        quadra: "Delta"
    },
    LSE: {
        code: "LSE",
        title: "Stierlitz",
        subtitle: "Reliable organizer and master of business",
        description: "LSE is a hardworking and responsible person who knows how to see any task through to completion. Combines business activity with practicality and attention to quality. Values integrity, competence, and concrete results.",
        traits: [
            "Hardworking, responsible, and organized",
            "Sees things through to completion",
            "Values competence and professionalism",
            "Practical and results-oriented",
            "Reliable and predictable in actions"
        ],
        mbtiEquivalent: "ESTJ",
        quadra: "Delta"
    },
    EII: {
        code: "EII",
        title: "Dostoevsky",
        subtitle: "Humanist-mentor and connoisseur of human souls",
        description: "EII is a deeply feeling person with a heightened sense of justice and compassion. Understands the inner world of people and strives to help everyone become better. Delicate, conscientious, and devoted to high moral ideals.",
        traits: [
            "Deeply understands the inner world of people",
            "Possesses a heightened sense of justice",
            "Delicate, tactful, and diplomatic",
            "Strives to help people reveal the best in themselves",
            "Devoted to moral ideals and values"
        ],
        mbtiEquivalent: "INFJ",
        quadra: "Delta"
    }
};
