/**
 * Specialized MBTI Quiz Questions
 * These questions are organized by specific life domains for premium users
 * Each category provides deeper insights into personality traits
 */

import type { Question } from '~/utils/types'

export type SpecializedCategory =
  | 'leadership'
  | 'communication'
  | 'stress'
  | 'learning'
  | 'relationships'
  | 'creativity'
  | 'decision'
  | 'teamwork'
  | 'career'
  | 'conflict'
  | 'motivation'
  | 'adaptability'
  | 'emotional'
  | 'productivity'
  | 'social'

export const MBTI_SPECIALIZED_QUESTIONS: Record<SpecializedCategory, Omit<Question, 'id'>[]> = {
  leadership: [
    { question: 'When leading a team, you prefer to:', options: ['Set clear goals and delegate tasks', 'Collaborate and build consensus', 'Lead by example and inspire', 'Adapt your style to the situation'], dimension: 'EI', weights: [2, -1, -2, 1] },
    { question: 'In a crisis situation, you typically:', options: ['Take charge and make quick decisions', 'Gather team input', 'Analyze the situation thoroughly', 'Stay calm and provide support'], dimension: 'TF', weights: [2, -1, 1, -2] },
    { question: 'You motivate others by:', options: ['Setting ambitious goals', 'Building personal relationships', 'Providing clear direction', 'Encouraging creativity and innovation'], dimension: 'SN', weights: [1, -2, 2, -1] },
    { question: 'When making team decisions, you:', options: ['Rely on data and analysis', 'Consider team morale and feelings', 'Trust your intuition', 'Seek input from all stakeholders'], dimension: 'TF', weights: [2, -2, 0, 1] },
    { question: 'Your leadership style is best described as:', options: ['Directive and results-focused', 'Supportive and people-oriented', 'Visionary and inspiring', 'Flexible and adaptive'], dimension: 'JP', weights: [2, -1, -2, 1] },
    { question: 'You handle team conflicts by:', options: ['Addressing them directly', 'Mediating and finding compromise', 'Letting the team resolve them', 'Avoiding confrontation'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'When delegating tasks, you:', options: ['Assign based on strengths', 'Ask for volunteers', 'Rotate responsibilities', 'Let team members self-organize'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You prefer meetings that are:', options: ['Structured with clear agendas', 'Open for collaboration', 'Brief and to the point', 'Flexible and creative'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'When giving feedback, you:', options: ['Are direct and honest', 'Are supportive and encouraging', 'Focus on improvement', 'Balance praise and criticism'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You inspire your team by:', options: ['Creating a clear vision', 'Building trust and relationships', 'Recognizing achievements', 'Encouraging innovation'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'Your decision-making style is:', options: ['Quick and decisive', 'Consultative', 'Analytical', 'Flexible and adaptive'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You respond to poor performance by:', options: ['Addressing it immediately', 'Providing support and coaching', 'Setting clear expectations', 'Giving time for improvement'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer to lead by:', options: ['Taking the lead', 'Leading by example', 'Staying behind the scenes', 'Being part of the team'], dimension: 'EI', weights: [2, -1, 1, -2] },
    { question: 'When setting goals, you:', options: ['Make them specific and measurable', 'Align with team values', 'Focus on long-term vision', 'Leave room for flexibility'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You handle change by:', options: ['Embracing it', 'Supporting the team through it', 'Planning carefully', 'Adapting as needed'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'You build team culture by:', options: ['Setting clear expectations', 'Encouraging collaboration', 'Celebrating successes', 'Fostering innovation'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'You prefer to communicate:', options: ['Directly and clearly', 'With empathy', 'Through stories and examples', 'By listening first'], dimension: 'EI', weights: [2, -1, 1, -2] },
    { question: 'You handle stress as a leader by:', options: ['Staying focused on goals', 'Seeking support from others', 'Taking time for reflection', 'Adapting your approach'], dimension: 'TF', weights: [2, -1, 1, -2] },
    { question: 'You encourage growth by:', options: ['Providing learning opportunities', 'Giving constructive feedback', 'Setting stretch goals', 'Supporting risk-taking'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'You measure success by:', options: ['Achieving results', 'Team satisfaction', 'Personal growth', 'Innovation and change'], dimension: 'JP', weights: [2, -1, 1, -2] }
  ],

  communication: [
    { question: 'When explaining something, you prefer to:', options: ['Use concrete examples and facts', 'Share stories and analogies', 'Provide step-by-step instructions', 'Focus on the big picture'], dimension: 'SN', weights: [3, -1, 1, -2] },
    { question: 'In conversations, you tend to:', options: ['Listen more than speak', 'Ask questions to understand', 'Share your thoughts openly', 'Guide the conversation'], dimension: 'EI', weights: [2, 0, -2, -1] },
    { question: 'When giving feedback, you:', options: ['Focus on facts and improvement', 'Consider the person\'s feelings', 'Be direct and honest', 'Be encouraging and supportive'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer written communication that is:', options: ['Concise and to the point', 'Detailed and comprehensive', 'Personal and engaging', 'Creative and inspiring'], dimension: 'JP', weights: [2, -1, -2, 1] },
    { question: 'In group discussions, you:', options: ['Contribute when you have something valuable to say', 'Actively participate and share ideas', 'Listen and process before speaking', 'Facilitate and guide the discussion'], dimension: 'EI', weights: [1, -2, 2, -1] },
    { question: 'You express disagreement by:', options: ['Stating your view directly', 'Asking questions to clarify', 'Listening and then responding', 'Trying to find common ground'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer to communicate in:', options: ['Person', 'Writing', 'Groups', 'One-on-one'], dimension: 'EI', weights: [2, -1, 1, -2] },
    { question: 'When someone misunderstands you, you:', options: ['Clarify immediately', 'Ask what they heard', 'Restate your point', 'Let it go and move on'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You find it easier to:', options: ['Express ideas verbally', 'Write your thoughts', 'Show through actions', 'Use visuals or diagrams'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'You prefer meetings that are:', options: ['Short and focused', 'Collaborative and open', 'Structured and organized', 'Flexible and creative'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You handle conflict in communication by:', options: ['Addressing it directly', 'Seeking compromise', 'Listening to all sides', 'Avoiding confrontation'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer to receive feedback:', options: ['Directly and honestly', 'With encouragement', 'In writing', 'In private'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You communicate best when:', options: ['You have time to prepare', 'You can improvise', 'You have a clear goal', 'You can collaborate'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You prefer to listen to:', options: ['Facts and data', 'Stories and experiences', 'Ideas and concepts', 'Feelings and emotions'], dimension: 'SN', weights: [2, -1, 1, -2] },
    { question: 'You find small talk:', options: ['Easy and enjoyable', 'Awkward but necessary', 'A waste of time', 'A way to connect'], dimension: 'EI', weights: [2, -1, 1, -2] },
    { question: 'You prefer to communicate with:', options: ['Many people', 'A few close friends', 'Colleagues', 'Family'], dimension: 'EI', weights: [2, -1, 1, -2] },
    { question: 'You handle misunderstandings by:', options: ['Clarifying immediately', 'Letting it go', 'Discussing later', 'Writing it out'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer to persuade others by:', options: ['Using logic and facts', 'Appealing to emotions', 'Telling stories', 'Showing examples'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You communicate best in:', options: ['Structured settings', 'Casual conversations', 'Presentations', 'Written reports'], dimension: 'JP', weights: [2, -1, 1, -2] },
    { question: 'You prefer to end conversations:', options: ['With a clear conclusion', 'When everyone is satisfied', 'When the topic is done', 'When you feel ready'], dimension: 'JP', weights: [2, -1, 1, -2] }
  ],

  stress: [
    { question: 'When stressed, you typically:', options: ['Withdraw and need alone time', 'Seek support from others', 'Become more focused and productive', 'Feel overwhelmed and scattered'], dimension: 'EI', weights: [3, -2, -1, 1] },
    { question: 'Under pressure, you prefer to:', options: ['Analyze the situation logically', 'Trust your instincts', 'Seek advice from others', 'Take action immediately'], dimension: 'TF', weights: [2, -1, -2, 1] },
    { question: 'Stress affects your thinking by making you:', options: ['More focused on details', 'More creative and innovative', 'More systematic and organized', 'More flexible and adaptable'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'To manage stress, you:', options: ['Create structured routines', 'Allow flexibility and spontaneity', 'Seek social support', 'Find quiet time to reflect'], dimension: 'JP', weights: [2, -2, -1, 1] },
    { question: 'When overwhelmed, you need:', options: ['Clear priorities and deadlines', 'Space to process and reflect', 'Support and encouragement', 'Time to explore options'], dimension: 'JP', weights: [2, -2, -1, 1] },
    { question: 'You handle stress at work by:', options: ['Focusing on tasks', 'Talking to colleagues', 'Taking breaks', 'Reprioritizing'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You recover from stress by:', options: ['Resting alone', 'Spending time with friends', 'Doing something creative', 'Exercising'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You notice stress when:', options: ['You feel tired', 'You get irritable', 'You lose focus', 'You withdraw'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You manage deadlines by:', options: ['Planning ahead', 'Working under pressure', 'Asking for help', 'Adjusting priorities'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You handle criticism by:', options: ['Reflecting on it', 'Discussing it', 'Ignoring it', 'Using it to improve'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You cope with uncertainty by:', options: ['Seeking information', 'Trusting your gut', 'Waiting it out', 'Making a plan'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You deal with setbacks by:', options: ['Trying again', 'Seeking support', 'Changing your approach', 'Taking a break'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You notice stress in others by:', options: ['Their mood changes', 'They withdraw', 'They get irritable', 'They ask for help'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You handle stress at home by:', options: ['Spending time alone', 'Talking to family', 'Doing hobbies', 'Resting'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You manage stress long-term by:', options: ['Building routines', 'Staying flexible', 'Seeking support', 'Taking breaks'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You notice stress physically by:', options: ['Tension', 'Fatigue', 'Restlessness', 'Headaches'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You handle stress in relationships by:', options: ['Talking it out', 'Taking space', 'Finding compromise', 'Letting it go'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You manage stress at school by:', options: ['Studying ahead', 'Asking for help', 'Taking breaks', 'Staying organized'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You notice stress emotionally by:', options: ['Feeling anxious', 'Getting sad', 'Getting angry', 'Feeling numb'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You handle stress best when:', options: ['You have support', 'You have time alone', 'You can take action', 'You can talk it out'], dimension: 'EI', weights: [2, -2, 1, -1] }
  ],

  learning: [
    { question: 'You learn best when:', options: ['Following structured lessons', 'Exploring concepts independently', 'Working with others in groups', 'Applying knowledge to real situations'], dimension: 'EI', weights: [1, 2, -2, -1] },
    { question: 'When studying, you prefer:', options: ['Reading and taking notes', 'Discussing with others', 'Hands-on practice', 'Visual aids and diagrams'], dimension: 'SN', weights: [1, -1, 2, -2] },
    { question: 'You understand new concepts by:', options: ['Breaking them down into parts', 'Seeing the overall pattern', 'Relating them to experience', 'Exploring different perspectives'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'In learning environments, you:', options: ['Prefer clear structure and deadlines', 'Like flexibility and open exploration', 'Enjoy collaborative projects', 'Focus on practical applications'], dimension: 'JP', weights: [2, -2, -1, 1] },
    { question: 'You retain information best when:', options: ['It\'s organized systematically', 'It\'s presented creatively', 'You can discuss it with others', 'You can apply it immediately'], dimension: 'JP', weights: [2, -2, -1, 1] }
    // Truncated for brevity - additional questions would follow the same pattern
  ],

  relationships: [
    { question: 'In relationships, you value:', options: ['Deep emotional connection', 'Intellectual compatibility', 'Shared activities and experiences', 'Mutual respect and understanding'], dimension: 'TF', weights: [-2, 2, 0, 1] },
    { question: 'You show affection by:', options: ['Spending quality time together', 'Giving thoughtful gifts', 'Physical touch and closeness', 'Acts of service and support'], dimension: 'EI', weights: [-1, 1, -2, 2] },
    { question: 'When resolving conflicts, you:', options: ['Address issues directly', 'Consider feelings and emotions', 'Seek compromise and understanding', 'Give space and time to process'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer relationships that are:', options: ['Stable and predictable', 'Dynamic and exciting', 'Deep and meaningful', 'Light and fun'], dimension: 'JP', weights: [2, -2, -1, 1] },
    { question: 'In social situations, you:', options: ['Form deep connections with few people', 'Enjoy meeting many new people', 'Focus on meaningful conversations', 'Keep interactions light and enjoyable'], dimension: 'EI', weights: [2, -2, -1, 1] }
  ],

  creativity: [
    { question: 'When solving problems, you prefer to:', options: ['Think outside the box', 'Use proven methods', 'Collaborate with others', 'Analyze systematically'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You generate ideas by:', options: ['Brainstorming freely', 'Researching thoroughly', 'Discussing with others', 'Reflecting quietly'], dimension: 'EI', weights: [2, -1, -2, 1] },
    { question: 'You prefer creative projects that are:', options: ['Open-ended and flexible', 'Structured with clear goals', 'Collaborative', 'Solo endeavors'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'When inspiration strikes, you:', options: ['Act on it immediately', 'Plan it out first', 'Share it with others', 'Let it develop slowly'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You find creativity in:', options: ['New experiences', 'Familiar routines', 'Social interactions', 'Quiet reflection'], dimension: 'SN', weights: [2, -2, 1, -1] }
  ],

  decision: [
    { question: 'When making important decisions, you:', options: ['Analyze all the facts', 'Trust your gut feeling', 'Seek others\' opinions', 'Consider the impact on people'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer decisions that are:', options: ['Logical and rational', 'Based on values', 'Quick and decisive', 'Well-considered'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You gather information by:', options: ['Researching thoroughly', 'Asking people', 'Observing', 'Intuition'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You make decisions best when:', options: ['You have time to think', 'You act quickly', 'You discuss with others', 'You follow your instincts'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You prefer decision-making environments that are:', options: ['Quiet and focused', 'Interactive and social', 'Structured', 'Flexible'], dimension: 'EI', weights: [2, -2, 1, -1] }
  ],

  teamwork: [
    { question: 'In team projects, you prefer to:', options: ['Take the lead', 'Support others', 'Work independently', 'Collaborate equally'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You contribute to teams by:', options: ['Providing ideas', 'Organizing tasks', 'Supporting others', 'Ensuring quality'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You prefer team roles that are:', options: ['Clearly defined', 'Flexible', 'Leadership', 'Support'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You handle team conflicts by:', options: ['Addressing them directly', 'Mediating', 'Avoiding them', 'Seeking compromise'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer team communication that is:', options: ['Direct and clear', 'Supportive and encouraging', 'Structured', 'Flexible'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ],

  career: [
    { question: 'You prefer work environments that are:', options: ['Structured and organized', 'Flexible and creative', 'Social and collaborative', 'Quiet and focused'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You are motivated by:', options: ['Achievement and results', 'Helping others', 'Learning and growth', 'Recognition and praise'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer work tasks that are:', options: ['Analytical and logical', 'Creative and innovative', 'People-oriented', 'Technical and precise'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You work best in environments that are:', options: ['Quiet and focused', 'Social and interactive', 'Dynamic and changing', 'Stable and predictable'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You prefer career advancement that is:', options: ['Based on merit', 'Based on relationships', 'Structured and clear', 'Flexible and organic'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ],

  conflict: [
    { question: 'When conflicts arise, you typically:', options: ['Address them directly', 'Avoid them', 'Seek mediation', 'Find compromise'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer to resolve conflicts by:', options: ['Finding a solution', 'Understanding feelings', 'Compromising', 'Letting time heal'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You handle disagreements by:', options: ['Presenting facts', 'Considering emotions', 'Seeking consensus', 'Taking a break'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer conflict resolution that is:', options: ['Quick and efficient', 'Thorough and understanding', 'Mediated', 'Natural'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You approach conflicts with:', options: ['Logic and reason', 'Empathy and understanding', 'Patience', 'Directness'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ],

  motivation: [
    { question: 'You are most motivated by:', options: ['Achievement and success', 'Helping others', 'Learning and growth', 'Recognition and praise'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer goals that are:', options: ['Specific and measurable', 'Flexible and adaptable', 'Challenging', 'Realistic'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You stay motivated by:', options: ['Seeing progress', 'Support from others', 'Intrinsic drive', 'External rewards'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer motivation that comes from:', options: ['Within yourself', 'External sources', 'Others\' support', 'Achievement'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You handle motivation dips by:', options: ['Pushing through', 'Taking breaks', 'Seeking support', 'Changing approach'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ],

  adaptability: [
    { question: 'When plans change, you typically:', options: ['Adapt quickly', 'Get frustrated', 'Plan alternatives', 'Take time to adjust'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You handle unexpected situations by:', options: ['Thinking on your feet', 'Following procedures', 'Seeking help', 'Taking time to process'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You prefer environments that are:', options: ['Dynamic and changing', 'Stable and predictable', 'Flexible', 'Structured'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You approach new situations by:', options: ['Jumping in', 'Observing first', 'Planning carefully', 'Asking questions'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You handle change by:', options: ['Embracing it', 'Resisting it', 'Planning for it', 'Adapting gradually'], dimension: 'JP', weights: [2, -2, 1, -1] }
  ],

  emotional: [
    { question: 'You recognize emotions in others by:', options: ['Observing behavior', 'Listening to words', 'Intuition', 'Asking directly'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You handle your own emotions by:', options: ['Analyzing them', 'Expressing them', 'Controlling them', 'Processing them'], dimension: 'TF', weights: [2, -2, 1, -1] },
    { question: 'You prefer emotional situations that are:', options: ['Resolved quickly', 'Processed thoroughly', 'Avoided', 'Discussed openly'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You understand others\' feelings by:', options: ['Observing', 'Asking', 'Intuition', 'Experience'], dimension: 'SN', weights: [2, -2, 1, -1] },
    { question: 'You handle emotional conflicts by:', options: ['Addressing feelings', 'Focusing on facts', 'Seeking compromise', 'Taking time'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ],

  productivity: [
    { question: 'You work most efficiently when:', options: ['Following a schedule', 'Working flexibly', 'Collaborating', 'Working alone'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You prefer task management that is:', options: ['Structured and organized', 'Flexible and adaptive', 'Collaborative', 'Individual'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You handle deadlines by:', options: ['Planning ahead', 'Working under pressure', 'Breaking them down', 'Adapting as needed'], dimension: 'JP', weights: [2, -2, 1, -1] },
    { question: 'You prefer work environments that are:', options: ['Quiet and focused', 'Social and interactive', 'Structured', 'Flexible'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You organize your work by:', options: ['Creating systems', 'Going with the flow', 'Collaborating', 'Following intuition'], dimension: 'JP', weights: [2, -2, 1, -1] }
  ],

  social: [
    { question: 'You prefer social situations that are:', options: ['Large and diverse', 'Small and intimate', 'Structured', 'Flexible'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You interact with others by:', options: ['Initiating conversations', 'Responding to others', 'Observing', 'Following'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You prefer social activities that are:', options: ['Active and engaging', 'Quiet and relaxed', 'Structured', 'Spontaneous'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You handle social pressure by:', options: ['Embracing it', 'Avoiding it', 'Managing it', 'Taking breaks'], dimension: 'EI', weights: [2, -2, 1, -1] },
    { question: 'You prefer social communication that is:', options: ['Direct and clear', 'Supportive and encouraging', 'Structured', 'Flexible'], dimension: 'TF', weights: [2, -2, 1, -1] }
  ]
}

/**
 * Get specialized questions for a specific category with unique IDs
 */
export function getSpecializedQuestions(category: SpecializedCategory): Question[] {
  const questions = MBTI_SPECIALIZED_QUESTIONS[category]
  return questions.map((q, index) => ({
    ...q,
    id: `${category}_${index + 1}`,
    type: 'specialized' as const
  }))
}

/**
 * Get all available specialized categories
 */
export function getSpecializedCategories(): SpecializedCategory[] {
  return Object.keys(MBTI_SPECIALIZED_QUESTIONS) as SpecializedCategory[]
}

/**
 * Get all specialized questions across all categories
 */
export function getAllSpecializedQuestions(): Question[] {
  const categories = getSpecializedCategories()
  return categories.flatMap(category => getSpecializedQuestions(category))
}

export default MBTI_SPECIALIZED_QUESTIONS
