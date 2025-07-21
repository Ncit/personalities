// Main MBTI Quiz Questions
// This file contains all 60 questions for the main MBTI personality assessment
// Questions are organized by the four MBTI dimensions: EI, SN, TF, JP

export const MBTI_QUESTIONS = [
    // Extraversion (E) vs Introversion (I) Questions
    {
        question: "How do you prefer to spend your free time?",
        options: [
            "Alone, reading a book or watching a movie",
            "With a small group of close friends",
            "At a large social gathering or party",
            "It depends on my mood"
        ],
        dimension: "EI",
        weights: [3, 1, -3, 0] // I, slight I, E, neutral
    },
    {
        question: "When you're in a group setting, you tend to:",
        options: [
            "Listen more than speak",
            "Speak and listen equally",
            "Do most of the talking",
            "Observe and only speak when necessary"
        ],
        dimension: "EI",
        weights: [2, 0, -2, 1]
    },
    {
        question: "After a long day, you prefer to:",
        options: [
            "Recharge by spending time alone",
            "Talk to someone about your day",
            "Go out with friends to unwind",
            "Do something active with others"
        ],
        dimension: "EI",
        weights: [3, 0, -2, -1]
    },
    {
        question: "In new social situations, you usually:",
        options: [
            "Feel energized and excited",
            "Feel comfortable but not overly excited",
            "Feel somewhat anxious but push through",
            "Prefer to avoid them if possible"
        ],
        dimension: "EI",
        weights: [-2, 0, 1, 3]
    },
    {
        question: "When working on a project, you prefer:",
        options: [
            "Collaborating with a team",
            "Working independently",
            "A mix of both depending on the task",
            "Leading the team"
        ],
        dimension: "EI",
        weights: [-1, 2, 0, -2]
    },
    {
        question: "You get your energy from:",
        options: [
            "Being around other people",
            "Spending time alone",
            "A balance of both",
            "Depends on the situation"
        ],
        dimension: "EI",
        weights: [-3, 3, 0, 0]
    },
    {
        question: "When making decisions, you prefer to:",
        options: [
            "Think through it carefully alone",
            "Discuss it with others",
            "Trust your gut feeling",
            "Research and analyze thoroughly"
        ],
        dimension: "EI",
        weights: [1, -1, 0, 0]
    },
    {
        question: "At parties, you typically:",
        options: [
            "Meet new people and socialize actively",
            "Stick with people you know",
            "Find a quiet corner to observe",
            "Leave early to avoid crowds"
        ],
        dimension: "EI",
        weights: [-3, 0, 2, 3]
    },
    {
        question: "When stressed, you prefer to:",
        options: [
            "Talk to someone about it",
            "Process it internally",
            "Distract yourself with activities",
            "Take time alone to reflect"
        ],
        dimension: "EI",
        weights: [-2, 2, -1, 1]
    },
    {
        question: "You consider yourself more:",
        options: [
            "Outgoing and sociable",
            "Reserved and thoughtful",
            "Balanced between the two",
            "It varies depending on the context"
        ],
        dimension: "EI",
        weights: [-3, 3, 0, 0]
    },
    {
        question: "In group discussions, you usually:",
        options: [
            "Share your thoughts freely",
            "Listen more than contribute",
            "Contribute when you have something valuable to add",
            "Prefer to avoid speaking up"
        ],
        dimension: "EI",
        weights: [-2, 2, 0, 3]
    },
    {
        question: "When meeting new people, you:",
        options: [
            "Feel excited and energized",
            "Feel neutral about it",
            "Feel slightly nervous",
            "Prefer to avoid it"
        ],
        dimension: "EI",
        weights: [-3, 0, 1, 3]
    },
    {
        question: "You prefer work environments that are:",
        options: [
            "Collaborative and team-oriented",
            "Quiet and focused",
            "Flexible with both options",
            "Structured but independent"
        ],
        dimension: "EI",
        weights: [-2, 2, 0, 1]
    },
    {
        question: "When solving problems, you prefer to:",
        options: [
            "Work through it independently",
            "Brainstorm with others",
            "Research and then discuss",
            "Trust your intuition"
        ],
        dimension: "EI",
        weights: [1, -1, 0, 0]
    },
    {
        question: "You feel most comfortable when:",
        options: [
            "Surrounded by people you know",
            "Alone with your thoughts",
            "In a familiar environment",
            "Exploring new places"
        ],
        dimension: "EI",
        weights: [-1, 2, 0, -1]
    },

    // Sensing (S) vs Intuition (N) Questions
    {
        question: "When learning something new, you prefer:",
        options: [
            "Step-by-step instructions",
            "Understanding the big picture first",
            "Hands-on experience",
            "Reading about theories and concepts"
        ],
        dimension: "SN",
        weights: [2, -1, 1, -2]
    },
    {
        question: "You tend to focus more on:",
        options: [
            "What is real and concrete",
            "What could be possible",
            "What has worked in the past",
            "What might work in the future"
        ],
        dimension: "SN",
        weights: [3, -3, 1, -1]
    },
    {
        question: "When reading a book, you prefer:",
        options: [
            "Stories with clear, factual details",
            "Stories with abstract concepts and symbolism",
            "Stories that are practical and useful",
            "Stories that explore new ideas"
        ],
        dimension: "SN",
        weights: [2, -2, 1, -1]
    },
    {
        question: "You trust information that is:",
        options: [
            "Based on facts and evidence",
            "Based on intuition and patterns",
            "Based on personal experience",
            "Based on innovative thinking"
        ],
        dimension: "SN",
        weights: [3, -2, 1, -2]
    },
    {
        question: "When making plans, you prefer:",
        options: [
            "Detailed, step-by-step approaches",
            "Flexible, adaptable strategies",
            "Proven methods that work",
            "Creative, innovative solutions"
        ],
        dimension: "SN",
        weights: [2, -1, 1, -2]
    },
    {
        question: "You enjoy work that involves:",
        options: [
            "Working with concrete facts and data",
            "Exploring new possibilities and ideas",
            "Following established procedures",
            "Creating new approaches"
        ],
        dimension: "SN",
        weights: [2, -2, 1, -1]
    },
    {
        question: "When solving problems, you rely on:",
        options: [
            "Past experience and proven methods",
            "Intuition and creative thinking",
            "Systematic analysis of facts",
            "Innovative and unconventional approaches"
        ],
        dimension: "SN",
        weights: [1, -2, 2, -1]
    },
    {
        question: "You prefer conversations about:",
        options: [
            "Current events and practical matters",
            "Abstract concepts and theories",
            "Personal experiences and stories",
            "Future possibilities and innovations"
        ],
        dimension: "SN",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When learning a new skill, you prefer:",
        options: [
            "Clear, practical instructions",
            "Understanding the underlying principles",
            "Trial and error with guidance",
            "Exploring different approaches"
        ],
        dimension: "SN",
        weights: [2, -1, 1, -2]
    },
    {
        question: "You are more interested in:",
        options: [
            "What is happening now",
            "What could happen in the future",
            "What has happened in the past",
            "What might be possible"
        ],
        dimension: "SN",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When making decisions, you consider:",
        options: [
            "Practical implications and facts",
            "Future possibilities and potential",
            "Past experiences and outcomes",
            "Innovative and creative options"
        ],
        dimension: "SN",
        weights: [2, -2, 1, -1]
    },
    {
        question: "You prefer environments that are:",
        options: [
            "Organized and structured",
            "Creative and flexible",
            "Practical and functional",
            "Innovative and dynamic"
        ],
        dimension: "SN",
        weights: [1, -1, 2, -2]
    },
    {
        question: "When working on projects, you focus on:",
        options: [
            "Getting the details right",
            "Exploring new possibilities",
            "Following established procedures",
            "Creating innovative solutions"
        ],
        dimension: "SN",
        weights: [2, -2, 1, -1]
    },
    {
        question: "You trust your:",
        options: [
            "Senses and observations",
            "Intuition and gut feelings",
            "Experience and knowledge",
            "Creativity and imagination"
        ],
        dimension: "SN",
        weights: [2, -2, 1, -1]
    },

    // Thinking (T) vs Feeling (F) Questions
    {
        question: "When making important decisions, you prioritize:",
        options: [
            "Logical analysis and facts",
            "How it will affect people",
            "What feels right to you",
            "What makes the most sense"
        ],
        dimension: "TF",
        weights: [2, -2, -1, 1]
    },
    {
        question: "In conflicts, you tend to:",
        options: [
            "Focus on finding the right solution",
            "Focus on maintaining harmony",
            "Focus on what's fair",
            "Focus on understanding all perspectives"
        ],
        dimension: "TF",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer to be known as:",
        options: [
            "Competent and capable",
            "Caring and compassionate",
            "Fair and just",
            "Wise and insightful"
        ],
        dimension: "TF",
        weights: [1, -2, 0, -1]
    },
    {
        question: "When giving feedback, you focus on:",
        options: [
            "What needs to be improved",
            "How to encourage the person",
            "Being honest but kind",
            "Providing constructive guidance"
        ],
        dimension: "TF",
        weights: [2, -2, 0, 0]
    },
    {
        question: "You are more motivated by:",
        options: [
            "Achieving goals and success",
            "Helping others and making a difference",
            "Personal growth and development",
            "Making a positive impact"
        ],
        dimension: "TF",
        weights: [1, -2, 0, -1]
    },
    {
        question: "When evaluating others, you consider:",
        options: [
            "Their competence and results",
            "Their character and values",
            "Their effort and intentions",
            "Their potential and growth"
        ],
        dimension: "TF",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer work environments that are:",
        options: [
            "Efficient and results-oriented",
            "Supportive and collaborative",
            "Fair and merit-based",
            "Inspiring and meaningful"
        ],
        dimension: "TF",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When solving problems, you consider:",
        options: [
            "What is most efficient",
            "What is best for everyone involved",
            "What is most logical",
            "What aligns with your values"
        ],
        dimension: "TF",
        weights: [1, -2, 1, -1]
    },
    {
        question: "You are more comfortable with:",
        options: [
            "Direct and honest communication",
            "Gentle and supportive communication",
            "Clear and logical communication",
            "Empathetic and understanding communication"
        ],
        dimension: "TF",
        weights: [1, -2, 1, -1]
    },
    {
        question: "When leading others, you focus on:",
        options: [
            "Achieving goals and results",
            "Supporting and developing people",
            "Maintaining standards and quality",
            "Creating a positive environment"
        ],
        dimension: "TF",
        weights: [1, -2, 0, -1]
    },
    {
        question: "You prefer to resolve disagreements by:",
        options: [
            "Finding the most logical solution",
            "Finding a compromise that works for everyone",
            "Discussing the facts objectively",
            "Understanding each person's perspective"
        ],
        dimension: "TF",
        weights: [2, -2, 1, -1]
    },
    {
        question: "When evaluating ideas, you consider:",
        options: [
            "Whether they are practical and logical",
            "How they will affect people",
            "Whether they are well-reasoned",
            "Whether they align with values"
        ],
        dimension: "TF",
        weights: [2, -2, 1, -1]
    },
    {
        question: "You are more likely to:",
        options: [
            "Point out flaws in arguments",
            "Find common ground in disagreements",
            "Analyze situations objectively",
            "Consider the emotional impact"
        ],
        dimension: "TF",
        weights: [2, -2, 1, -1]
    },
    {
        question: "When making choices, you rely on:",
        options: [
            "Logic and reasoning",
            "Your values and feelings",
            "Analysis and facts",
            "Intuition and empathy"
        ],
        dimension: "TF",
        weights: [2, -2, 1, -1]
    },
    {
        question: "You prefer to work with people who are:",
        options: [
            "Competent and efficient",
            "Supportive and caring",
            "Logical and analytical",
            "Creative and inspiring"
        ],
        dimension: "TF",
        weights: [1, -2, 1, -1]
    },
    {
        question: "When giving advice, you focus on:",
        options: [
            "What will work best",
            "What will make them happy",
            "What is most logical",
            "What aligns with their values"
        ],
        dimension: "TF",
        weights: [1, -2, 1, -1]
    },

    // Judging (J) vs Perceiving (P) Questions
    {
        question: "You prefer to:",
        options: [
            "Have a plan and stick to it",
            "Keep your options open",
            "Have a general idea but be flexible",
            "Go with the flow"
        ],
        dimension: "JP",
        weights: [3, -3, 0, -2]
    },
    {
        question: "When working on projects, you:",
        options: [
            "Set deadlines and meet them",
            "Work on them when you feel inspired",
            "Plan ahead but allow for changes",
            "Work best under pressure"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer environments that are:",
        options: [
            "Organized and structured",
            "Flexible and spontaneous",
            "Balanced between order and flexibility",
            "Creative and free-flowing"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When making decisions, you:",
        options: [
            "Decide quickly and stick with it",
            "Take your time and keep reconsidering",
            "Consider options carefully then decide",
            "Wait to see how things develop"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer to:",
        options: [
            "Finish tasks before starting new ones",
            "Work on multiple things at once",
            "Focus on priorities but allow flexibility",
            "Follow your interests as they arise"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When traveling, you prefer to:",
        options: [
            "Have a detailed itinerary",
            "Keep plans flexible and spontaneous",
            "Have a general plan but allow changes",
            "Discover things as you go"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You work best when you:",
        options: [
            "Have clear deadlines and structure",
            "Can work at your own pace",
            "Have some structure but flexibility",
            "Can be spontaneous and creative"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When organizing things, you prefer:",
        options: [
            "Clear categories and systems",
            "Flexible arrangements",
            "Organized but adaptable systems",
            "Creative and unique approaches"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer to:",
        options: [
            "Know what to expect",
            "Be surprised and spontaneous",
            "Have some predictability with flexibility",
            "Embrace uncertainty and change"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When meeting deadlines, you:",
        options: [
            "Always meet them comfortably",
            "Often work right up to the deadline",
            "Usually meet them with some effort",
            "Sometimes need extensions"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer schedules that are:",
        options: [
            "Fixed and predictable",
            "Flexible and adaptable",
            "Structured but with some flexibility",
            "Open and spontaneous"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When starting a new project, you:",
        options: [
            "Plan everything out first",
            "Start working and figure it out as you go",
            "Have a general plan but adapt as needed",
            "Let inspiration guide you"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer to:",
        options: [
            "Make decisions quickly",
            "Keep your options open as long as possible",
            "Consider options carefully then decide",
            "Wait to see what happens"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "When organizing your space, you prefer:",
        options: [
            "Everything in its proper place",
            "Creative and flexible arrangements",
            "Organized but comfortable",
            "Whatever works in the moment"
        ],
        dimension: "JP",
        weights: [2, -2, 0, -1]
    },
    {
        question: "You prefer to:",
        options: [
            "Follow established procedures",
            "Find new and creative ways",
            "Use proven methods but adapt as needed",
            "Experiment and try different approaches"
        ],
        dimension: "JP",
        weights: [1, -1, 0, -1]
    },
    {
        question: "When working with others, you prefer:",
        options: [
            "Clear roles and responsibilities",
            "Flexible and collaborative approaches",
            "Structured but cooperative environments",
            "Creative and dynamic teamwork"
        ],
        dimension: "JP",
        weights: [1, -1, 0, -1]
    }
];

// Export the questions array as default
export default MBTI_QUESTIONS; 