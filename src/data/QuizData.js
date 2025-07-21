/**
 * Centralized Data Management for Quiz Questions and Personality Types
 * Separates data from logic for better maintainability
 */

// MBTI Personality Types Data
export const MBTI_TYPES = {
    ISTJ: {
        code: 'ISTJ',
        title: 'The Inspector',
        subtitle: 'Practical and Fact-minded',
        description: 'Quiet, serious, earn success by thoroughness and dependability. Practical, matter-of-fact, realistic, and responsible. Decide logically what should be done and work toward it steadily, regardless of distractions. Take pleasure in making everything orderly and organized - their work, their home, their life. Value traditions and loyalty.',
        traits: ['Organized', 'Practical', 'Dependable', 'Logical', 'Traditional']
    },
    ISFJ: {
        code: 'ISFJ',
        title: 'The Protector',
        subtitle: 'Dedicated and Warm',
        description: 'Quiet, friendly, responsible, and conscientious. Committed and steady in meeting their obligations. Thorough, painstaking, and accurate. Loyal, considerate, notice and remember specifics about people who are important to them, concerned with how others feel. Strive to create an orderly and harmonious environment at work and at home.',
        traits: ['Caring', 'Loyal', 'Patient', 'Practical', 'Dependable']
    },
    INFJ: {
        code: 'INFJ',
        title: 'The Counselor',
        subtitle: 'Idealistic and Organized',
        description: 'Seek meaning and connection in ideas, relationships, and material possessions. Want to understand what motivates people and are insightful about others. Conscientious and committed to their firm values. Develop a clear vision about how best to serve the common good. Organized and decisive in implementing their vision.',
        traits: ['Insightful', 'Creative', 'Determined', 'Idealistic', 'Compassionate']
    },
    INTJ: {
        code: 'INTJ',
        title: 'The Mastermind',
        subtitle: 'Strategic and Logical',
        description: 'Have original minds and great drive for implementing their ideas and achieving their goals. Quickly see patterns in external events and develop long-range explanatory perspectives. When committed, organize a job and carry it through. Skeptical and independent, have high standards of competence and performance - for themselves and others.',
        traits: ['Strategic', 'Independent', 'Analytical', 'Determined', 'Innovative']
    },
    ISTP: {
        code: 'ISTP',
        title: 'The Craftsman',
        subtitle: 'Flexible and Tolerant',
        description: 'Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions. Analyze what makes things work and can handle large amounts of information. Interested in cause and effect, organize facts using logical principles, value efficiency. Like to work with things that can be handled, broken down, or analyzed.',
        traits: ['Practical', 'Flexible', 'Logical', 'Observant', 'Independent']
    },
    ISFP: {
        code: 'ISFP',
        title: 'The Composer',
        subtitle: 'Sensitive and Kind',
        description: 'Quiet, friendly, sensitive, and kind. Enjoy the present moment, what\'s going on around them. Like to have their own space and to work within their own time frame. Loyal and committed to their values and to people who are important to them. Dislike disagreements and conflicts, do not force their opinions or values on others.',
        traits: ['Artistic', 'Sensitive', 'Loyal', 'Peaceful', 'Flexible']
    },
    INFP: {
        code: 'INFP',
        title: 'The Healer',
        subtitle: 'Idealistic and Adaptable',
        description: 'Idealistic, loyal to their values and to people who are important to them. Want an external life that is congruent with their values. Curious, quick to see possibilities, can be catalysts for implementing ideas. Seek to understand people and to help them fulfill their potential. Adaptable, flexible, and accepting unless a value is threatened.',
        traits: ['Idealistic', 'Creative', 'Empathetic', 'Adaptable', 'Loyal']
    },
    INTP: {
        code: 'INTP',
        title: 'The Architect',
        subtitle: 'Logical and Original',
        description: 'Seek logical explanations for everything that interests them. Theoretical and abstract, interested more in ideas than in social interaction. Quiet, contained, flexible, and adaptable. Have unusual ability to focus in depth to solve problems in their area of interest. Skeptical, sometimes critical, always analytical.',
        traits: ['Analytical', 'Creative', 'Independent', 'Logical', 'Curious']
    },
    ESTP: {
        code: 'ESTP',
        title: 'The Dynamo',
        subtitle: 'Flexible and Tolerant',
        description: 'Flexible and tolerant, they take a pragmatic approach focused on immediate results. Theories and conceptual explanations bore them - they want to act energetically to solve the problem. Focus on the here-and-now, spontaneous, enjoy each moment that they can be active with others. Enjoy material comforts and style. Learn best through doing.',
        traits: ['Energetic', 'Practical', 'Spontaneous', 'Adaptable', 'Confident']
    },
    ESFP: {
        code: 'ESFP',
        title: 'The Performer',
        subtitle: 'Spontaneous and Playful',
        description: 'Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts. Enjoy working with others to make things happen. Bring common sense and a realistic approach to their work, and make work fun. Flexible and spontaneous, adapt readily to new people and environments. Learn best by trying a new skill with other people.',
        traits: ['Enthusiastic', 'Sociable', 'Practical', 'Spontaneous', 'Optimistic']
    },
    ENFP: {
        code: 'ENFP',
        title: 'The Champion',
        subtitle: 'Enthusiastic and Creative',
        description: 'Warmly enthusiastic and imaginative. See life as full of possibilities. Make connections between events and information very quickly, and confidently proceed based on the patterns they see. Want a lot of affirmation from others, and readily give appreciation and support. Spontaneous and flexible, often rely on their ability to improvise and their verbal fluency.',
        traits: ['Enthusiastic', 'Creative', 'Sociable', 'Independent', 'Curious']
    },
    ENTP: {
        code: 'ENTP',
        title: 'The Visionary',
        subtitle: 'Innovative and Strategic',
        description: 'Quick, ingenious, stimulating, alert, and outspoken. Resourceful in solving new and challenging problems. Adept at generating conceptual possibilities and then analyzing them strategically. Good at reading other people. Bored by routine, will seldom do the same thing the same way, apt to turn to one new interest after another.',
        traits: ['Innovative', 'Strategic', 'Energetic', 'Analytical', 'Adaptable']
    },
    ESTJ: {
        code: 'ESTJ',
        title: 'The Supervisor',
        subtitle: 'Practical and Realistic',
        description: 'Practical, realistic, matter-of-fact. Born to lead, organize and run operations. Decisive, quickly move to implement decisions. Organize projects, operations, and people to get things done, focus on getting results in the most efficient way possible. Take care of routine details. Have a clear set of logical standards, systematically follow them and want others to also.',
        traits: ['Organized', 'Decisive', 'Practical', 'Dependable', 'Direct']
    },
    ESFJ: {
        code: 'ESFJ',
        title: 'The Provider',
        subtitle: 'Conscientious and Harmonious',
        description: 'Warmhearted, conscientious, and cooperative. Want harmony in their environment, work with determination to establish it. Like to work with others to complete tasks accurately and on time. Loyal, follow through even in small matters. Notice what others need in their day-by-day lives and try to provide it. Want to be appreciated for who they are and for what they contribute.',
        traits: ['Caring', 'Organized', 'Loyal', 'Sociable', 'Dependable']
    },
    ENFJ: {
        code: 'ENFJ',
        title: 'The Teacher',
        subtitle: 'Charismatic and Inspiring',
        description: 'Warm, empathetic, responsive, and responsible. Very attuned to the feelings, needs, and motivations of others. Find potential in everyone, want to help them fulfill their potential. May act as catalysts for individual and group growth. Loyal, responsive to praise and criticism. Sociable, facilitate others in a group, and provide inspiring leadership.',
        traits: ['Charismatic', 'Empathetic', 'Inspiring', 'Organized', 'Loyal']
    },
    ENTJ: {
        code: 'ENTJ',
        title: 'The Commander',
        subtitle: 'Strategic and Decisive',
        description: 'Frank, decisive, assume leadership readily. Quickly see illogical and inefficient procedures and policies, and develop and implement comprehensive systems to solve organizational problems. Enjoy long-term planning and goal setting. Knowledgeable and well-read, enjoy expanding their knowledge and passing it on to others. Forceful in presenting their ideas.',
        traits: ['Strategic', 'Decisive', 'Confident', 'Organized', 'Direct']
    }
};

// Quiz Types Configuration
export const QUIZ_TYPES = {
    mbti: {
        name: 'MBTI Personality Assessment',
        description: 'Discover your Myers-Briggs Type Indicator personality type',
        questionCount: { free: 20, premium: 60 },
        icon: 'fas fa-brain',
        color: '#667eea'
    },
    leadership: {
        name: 'Leadership Style Assessment',
        description: 'Discover your leadership approach and preferences',
        questionCount: { premium: 20 },
        icon: 'fas fa-crown',
        color: '#ffd700'
    },
    communication: {
        name: 'Communication Style Assessment',
        description: 'Understand how you communicate and interact with others',
        questionCount: { premium: 20 },
        icon: 'fas fa-comments',
        color: '#4CAF50'
    },
    stress: {
        name: 'Stress Response Assessment',
        description: 'Learn how you handle stress and pressure',
        questionCount: { premium: 20 },
        icon: 'fas fa-brain',
        color: '#FF5722'
    },
    learning: {
        name: 'Learning Style Assessment',
        description: 'Find your optimal learning method and preferences',
        questionCount: { premium: 20 },
        icon: 'fas fa-graduation-cap',
        color: '#9C27B0'
    },
    relationships: {
        name: 'Relationship Dynamics Assessment',
        description: 'Explore your relationship patterns and preferences',
        questionCount: { premium: 20 },
        icon: 'fas fa-heart',
        color: '#E91E63'
    },
    creativity: {
        name: 'Creativity & Innovation Assessment',
        description: 'Unlock your creative potential and innovative thinking',
        questionCount: { premium: 20 },
        icon: 'fas fa-palette',
        color: '#FF9800'
    },
    decision: {
        name: 'Decision Making Assessment',
        description: 'Understand your decision-making processes and preferences',
        questionCount: { premium: 20 },
        icon: 'fas fa-balance-scale',
        color: '#607D8B'
    },
    teamwork: {
        name: 'Team Collaboration Assessment',
        description: 'Discover your team role preferences and collaboration styles',
        questionCount: { premium: 20 },
        icon: 'fas fa-users',
        color: '#2196F3'
    },
    career: {
        name: 'Career Preferences Assessment',
        description: 'Find your ideal work environment and career motivations',
        questionCount: { premium: 20 },
        icon: 'fas fa-briefcase',
        color: '#795548'
    },
    conflict: {
        name: 'Conflict Resolution Assessment',
        description: 'Learn your conflict handling style and resolution preferences',
        questionCount: { premium: 20 },
        icon: 'fas fa-shield-alt',
        color: '#F44336'
    },
    motivation: {
        name: 'Motivation & Drive Assessment',
        description: 'Discover what drives you forward and keeps you motivated',
        questionCount: { premium: 20 },
        icon: 'fas fa-rocket',
        color: '#00BCD4'
    },
    adaptability: {
        name: 'Adaptability & Change Assessment',
        description: 'Understand how you handle change and adapt to new situations',
        questionCount: { premium: 20 },
        icon: 'fas fa-sync-alt',
        color: '#8BC34A'
    },
    emotional: {
        name: 'Emotional Intelligence Assessment',
        description: 'Assess your emotional awareness and interpersonal skills',
        questionCount: { premium: 20 },
        icon: 'fas fa-smile',
        color: '#FFC107'
    },
    productivity: {
        name: 'Productivity Style Assessment',
        description: 'Optimize your work efficiency and task management',
        questionCount: { premium: 20 },
        icon: 'fas fa-tasks',
        color: '#3F51B5'
    },
    social: {
        name: 'Social Interaction Assessment',
        description: 'Explore your social preferences and interaction styles',
        questionCount: { premium: 20 },
        icon: 'fas fa-handshake',
        color: '#009688'
    }
};

// Advanced Insights Data
export const ADVANCED_INSIGHTS = {
    ISTJ: {
        strengths: ['Reliable and responsible', 'Practical and realistic', 'Organized and systematic'],
        weaknesses: ['Can be rigid and inflexible', 'May struggle with change', 'Can be overly critical'],
        careerPaths: ['Accountant', 'Project Manager', 'Military Officer', 'Quality Control'],
        relationships: ['Loyal and committed', 'Value stability and tradition', 'Show love through actions']
    },
    // ... Add for all types
};

// Famous Personalities Data
export const FAMOUS_PERSONALITIES = {
    ISTJ: [
        { name: 'Queen Elizabeth II', field: 'Monarchy', image: 'queen-elizabeth.jpg' },
        { name: 'George Washington', field: 'Politics', image: 'george-washington.jpg' }
    ],
    // ... Add for all types
};

// Export all data
export const QUIZ_DATA = {
    mbtiTypes: MBTI_TYPES,
    quizTypes: QUIZ_TYPES,
    advancedInsights: ADVANCED_INSIGHTS,
    famousPersonalities: FAMOUS_PERSONALITIES
}; 