// Enneagram Quiz Questions - English Localization
// This file contains 36 questions for the Enneagram test in English
// Questions are organized by 6 dimensions:
//   HC — Heart Center (Types 2,3,4)
//   HD — Head Center (Types 5,6,7)
//   BD — Body Center (Types 8,9,1)
//   H1 — Within Heart: assertive(3) vs withdrawn(4) vs compliant(2)
//   D1 — Within Head: assertive(7) vs withdrawn(5) vs compliant(6)
//   B1 — Within Body: assertive(8) vs withdrawn(9) vs compliant(1)

export const ENNEAGRAM_QUESTIONS = [
    // ==========================================
    // HC — Heart Center (feelings, image, identity)
    // Positive weights → Heart Center
    // ==========================================
    {
        question: "How important is the impression you make on others?",
        options: [
            "It's one of the most important things in my life",
            "I think about it often",
            "I consider it sometimes, but I don't obsess over it",
            "I hardly care what others think"
        ],
        dimension: "HC",
        weights: [3, 1, -1, -3]
    },
    {
        question: "When you meet someone new, what do you feel first?",
        options: [
            "A desire to be liked and establish an emotional connection",
            "Curiosity about how this person perceives me",
            "Interest in their ideas and knowledge",
            "An assessment of whether I can trust them"
        ],
        dimension: "HC",
        weights: [3, 2, -2, -1]
    },
    {
        question: "How do you react when someone criticizes you personally, rather than your actions?",
        options: [
            "It deeply hurts me and stays in my memory for a long time",
            "I feel upset but try to understand if there's any truth to it",
            "I analyze the criticism rationally, without strong emotions",
            "I shrug it off — I care more about concrete results"
        ],
        dimension: "HC",
        weights: [3, 1, -2, -3]
    },
    {
        question: "Which of the following best describes your inner world?",
        options: [
            "A rich world of feelings, images, and experiences",
            "A constant emotional response to what's happening around me",
            "A world of thoughts, ideas, and concepts",
            "Physical sensations and instinctive reactions"
        ],
        dimension: "HC",
        weights: [3, 2, -2, -3]
    },
    {
        question: "When you're going through a difficult time, what concerns you the most?",
        options: [
            "That I'll lose my connection with the people I care about",
            "That others will see my vulnerability",
            "That I won't be able to figure out the situation",
            "That I'll lose control over what's happening"
        ],
        dimension: "HC",
        weights: [3, 2, -2, -3]
    },
    {
        question: "How often do you compare yourself to other people?",
        options: [
            "Constantly — I need to know where I stand among others",
            "Quite often, especially in areas that matter to me",
            "Sometimes, but it doesn't define my sense of self",
            "Rarely — I measure myself by my own standards"
        ],
        dimension: "HC",
        weights: [3, 1, -1, -3]
    },

    // ==========================================
    // HD — Head Center (thinking, fear, planning)
    // Positive weights → Head Center
    // ==========================================
    {
        question: "How often do you think through possible worst-case scenarios?",
        options: [
            "Almost always — I need to be prepared for everything",
            "Often, especially before important decisions",
            "Sometimes, but I don't dwell on it for long",
            "Rarely — I prefer to act rather than overthink"
        ],
        dimension: "HD",
        weights: [3, 1, -1, -3]
    },
    {
        question: "What do you do when faced with an unfamiliar situation?",
        options: [
            "Gather as much information as possible before acting",
            "Analyze the situation and build several hypotheses",
            "Rely on my intuition and feelings",
            "Act decisively and figure things out along the way"
        ],
        dimension: "HD",
        weights: [3, 2, -2, -3]
    },
    {
        question: "How do you make important decisions?",
        options: [
            "I carefully weigh all pros and cons and gather data",
            "I think it through logically but allow some room for intuition",
            "I listen to my feelings and values",
            "I make decisions quickly, relying on gut instinct"
        ],
        dimension: "HD",
        weights: [3, 1, -2, -3]
    },
    {
        question: "How do you deal with uncertainty in life?",
        options: [
            "It causes me strong anxiety",
            "I feel uncomfortable and try to clarify everything",
            "I accept it as part of life",
            "It doesn't really bother me — life will sort itself out"
        ],
        dimension: "HD",
        weights: [3, 2, -1, -3]
    },
    {
        question: "What role does analysis and deliberation play in your daily life?",
        options: [
            "I constantly analyze — it's my primary way of navigating the world",
            "I think a lot, but I can also switch off my mind",
            "I rely more on feelings than analysis",
            "I prefer to act intuitively, without prolonged deliberation"
        ],
        dimension: "HD",
        weights: [3, 1, -2, -3]
    },
    {
        question: "When you need to solve a complex problem, your first impulse is to:",
        options: [
            "Retreat and study the issue thoroughly",
            "Make a plan and consider all the options",
            "Discuss it with someone I trust",
            "Just start doing it and adjust as I go"
        ],
        dimension: "HD",
        weights: [3, 2, -1, -3]
    },

    // ==========================================
    // BD — Body Center (instinct, anger, control)
    // Positive weights → Body Center
    // ==========================================
    {
        question: "How do you react when someone crosses your personal boundaries?",
        options: [
            "I instantly feel irritation or anger",
            "I feel physical discomfort and tension",
            "I get upset but try not to show it",
            "I think the situation over before reacting"
        ],
        dimension: "BD",
        weights: [3, 2, -1, -3]
    },
    {
        question: "How important is it for you to feel in control of your life?",
        options: [
            "It's absolutely essential — I need to be in charge of the situation",
            "Very important — I strive for order and structure",
            "Moderately — sometimes I can let go",
            "Not that important — I easily adapt to circumstances"
        ],
        dimension: "BD",
        weights: [3, 2, -1, -3]
    },
    {
        question: "How do you usually express dissatisfaction?",
        options: [
            "Openly and directly — people know right away what I think",
            "Through actions — I fix what's wrong",
            "I hold back my emotions but stew inside",
            "I try to understand the reasons for my dissatisfaction logically"
        ],
        dimension: "BD",
        weights: [3, 2, -1, -3]
    },
    {
        question: "How do you feel in your body?",
        options: [
            "I'm very physically aware — my body is an important guide for me",
            "I often feel inner tension or restrained energy",
            "I live more in a world of emotions than sensations",
            "I'm mostly in my head — my body is often in the background"
        ],
        dimension: "BD",
        weights: [3, 1, -2, -3]
    },
    {
        question: "What do you feel when you witness injustice?",
        options: [
            "Strong anger and a desire to intervene immediately",
            "Deep indignation and a desire to set things right",
            "Empathy for those affected and sadness",
            "A desire to understand the causes and find a systemic solution"
        ],
        dimension: "BD",
        weights: [3, 2, -2, -3]
    },
    {
        question: "How do you act in a stressful situation?",
        options: [
            "I mobilize and act on instinct",
            "I follow established rules and routines",
            "I seek support from people close to me",
            "I withdraw to analyze what's happening"
        ],
        dimension: "BD",
        weights: [3, 1, -2, -3]
    },

    // ==========================================
    // H1 — Within Heart Center
    // Positive → assertive (Type 3), Negative → withdrawn (Type 4)
    // Near zero → compliant (Type 2)
    // ==========================================
    {
        question: "What matters more to you in relationships?",
        options: [
            "Being helpful and taking care of others",
            "Being successful and earning respect",
            "Being understood and accepted for my uniqueness",
            "Being close to people while maintaining my own space"
        ],
        dimension: "H1",
        weights: [0, 3, -3, -1]
    },
    {
        question: "How do you experience sadness?",
        options: [
            "I try to help others to distract myself from my own pain",
            "I suppress it and focus on achievements",
            "I dive into it deeply — it's part of my nature",
            "I feel it but try to redirect myself toward productivity"
        ],
        dimension: "H1",
        weights: [0, 3, -3, 1]
    },
    {
        question: "What motivates you the most?",
        options: [
            "Gratitude and love from those around me",
            "Recognition, status, and achieving goals",
            "Deep self-expression and authenticity",
            "Stability and harmony around me"
        ],
        dimension: "H1",
        weights: [0, 3, -3, -1]
    },
    {
        question: "How do you behave in a new social group?",
        options: [
            "I try to be helpful and anticipate others' needs",
            "I aim to make a good impression and showcase myself",
            "I feel different from everyone and slightly withdraw",
            "I observe until I understand the group's dynamics"
        ],
        dimension: "H1",
        weights: [0, 3, -3, -1]
    },
    {
        question: "What is your biggest fear in relationships?",
        options: [
            "That I won't be loved if I stop helping others",
            "That I'll only be valued for my achievements, not for who I am",
            "That no one will ever truly understand my soul",
            "That I'll have to completely conform to others"
        ],
        dimension: "H1",
        weights: [0, 2, -3, 1]
    },
    {
        question: "How do you cope with feelings of shame?",
        options: [
            "I double down on caring for others to feel my own worth",
            "I work even harder to prove my value",
            "I delve deeper into my emotions and search for meaning in the pain",
            "I try to make rational sense of what's happening"
        ],
        dimension: "H1",
        weights: [0, 3, -3, -1]
    },

    // ==========================================
    // D1 — Within Head Center
    // Positive → assertive (Type 7), Negative → withdrawn (Type 5)
    // Near zero → compliant (Type 6)
    // ==========================================
    {
        question: "How do you spend your time when you have no obligations?",
        options: [
            "I seek new experiences, people, and adventures",
            "I consult with close ones or do familiar activities",
            "I immerse myself in studying a topic that interests me",
            "I enjoy solitude and quiet"
        ],
        dimension: "D1",
        weights: [3, 0, -3, -2]
    },
    {
        question: "How do you handle fear?",
        options: [
            "I shift to a positive mindset and look for something uplifting",
            "I prepare for the worst and make contingency plans",
            "I analyze the source of fear from a distance",
            "I try to understand the fear through knowledge and information"
        ],
        dimension: "D1",
        weights: [3, 0, -2, -3]
    },
    {
        question: "Which description fits you best?",
        options: [
            "An optimist who always sees opportunities and possibilities",
            "A realist who values reliability and proven paths",
            "A skeptic who thoroughly verifies everything for accuracy",
            "An observer who prefers to understand rather than participate"
        ],
        dimension: "D1",
        weights: [3, 0, -1, -3]
    },
    {
        question: "How do you feel about limitations and rules?",
        options: [
            "They weigh me down — I want freedom and variety",
            "They're necessary for safety and order",
            "I set my own rules based on knowledge",
            "I follow them if they're logically justified"
        ],
        dimension: "D1",
        weights: [3, 0, -3, -1]
    },
    {
        question: "How do you feel when your day is packed with tasks?",
        options: [
            "Energized and excited — I love an active pace",
            "Confident, as long as everything goes according to plan",
            "Drained — I need time alone to recharge",
            "Anxious, if there's no time to think things through"
        ],
        dimension: "D1",
        weights: [3, 0, -3, -1]
    },
    {
        question: "How do you react to boredom?",
        options: [
            "I immediately look for a new activity or entertainment",
            "I turn to familiar and comfortable pastimes",
            "I use the time for deep reflection or reading",
            "Boredom is rare — I'm always occupied with something in my mind"
        ],
        dimension: "D1",
        weights: [3, 0, -3, -1]
    },

    // ==========================================
    // B1 — Within Body Center
    // Positive → assertive (Type 8), Negative → withdrawn (Type 9)
    // Near zero → compliant (Type 1)
    // ==========================================
    {
        question: "How do you behave in a conflict situation?",
        options: [
            "I face it head-on — conflict doesn't scare me",
            "I try to find a fair and proper resolution",
            "I look for a compromise and try to smooth things over",
            "I avoid conflict and wait for it to blow over"
        ],
        dimension: "B1",
        weights: [3, 0, -1, -3]
    },
    {
        question: "How do you demonstrate your strength?",
        options: [
            "Through decisive action and directness",
            "Through discipline, principles, and self-improvement",
            "Through patience and the ability to accept different viewpoints",
            "Through the ability to stay calm in any situation"
        ],
        dimension: "B1",
        weights: [3, 0, -2, -3]
    },
    {
        question: "What irritates you the most about people?",
        options: [
            "Weakness, indecisiveness, and manipulation",
            "Irresponsibility, laziness, and dishonesty",
            "Aggression and unwillingness to listen to others",
            "Being forced to do something I don't want to do"
        ],
        dimension: "B1",
        weights: [3, 0, -2, -3]
    },
    {
        question: "How do you feel about leadership?",
        options: [
            "I'm a natural leader — taking charge comes instinctively to me",
            "I'm willing to lead if it's needed for the right outcome",
            "I prefer to support rather than lead",
            "Leadership doesn't appeal to me — I value harmony"
        ],
        dimension: "B1",
        weights: [3, 0, -1, -3]
    },
    {
        question: "How do you express your anger?",
        options: [
            "Openly and intensely — it's my driving force",
            "Restrainedly, through criticism and a push to correct things",
            "I suppress it — anger destroys harmony",
            "I barely notice it — I rarely get truly angry"
        ],
        dimension: "B1",
        weights: [3, 0, -2, -3]
    },
    {
        question: "How do you make decisions that affect other people?",
        options: [
            "Quickly and confidently — someone has to decide",
            "Carefully, striving to be as fair as possible",
            "I consider everyone's opinion, sometimes at the expense of speed",
            "I try to avoid making such decisions"
        ],
        dimension: "B1",
        weights: [3, 0, -1, -3]
    }
];
