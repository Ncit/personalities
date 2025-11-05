/**
 * MBTI Personality Types Data
 * Centralized data for all 16 personality types
 */

import type { PersonalityType } from '~/utils/types'

export const MBTI_TYPES: Record<string, PersonalityType> = {
  ISTJ: {
    code: 'ISTJ',
    title: 'The Inspector',
    subtitle: 'Practical and Fact-minded',
    description: 'Quiet, serious, earn success by thoroughness and dependability. Practical, matter-of-fact, realistic, and responsible. Decide logically what should be done and work toward it steadily, regardless of distractions. Take pleasure in making everything orderly and organized - their work, their home, their life. Value traditions and loyalty.',
    traits: ['Organized', 'Practical', 'Dependable', 'Logical', 'Traditional'],
    strengths: ['Reliable', 'Detail-oriented', 'Systematic', 'Hardworking', 'Loyal'],
    weaknesses: ['Inflexible', 'Judgmental', 'Insensitive', 'Stubborn', 'Too focused on rules'],
    percentage: 13
  },
  ISFJ: {
    code: 'ISFJ',
    title: 'The Protector',
    subtitle: 'Dedicated and Warm',
    description: 'Quiet, friendly, responsible, and conscientious. Committed and steady in meeting their obligations. Thorough, painstaking, and accurate. Loyal, considerate, notice and remember specifics about people who are important to them, concerned with how others feel. Strive to create an orderly and harmonious environment at work and at home.',
    traits: ['Caring', 'Loyal', 'Patient', 'Practical', 'Dependable'],
    strengths: ['Supportive', 'Reliable', 'Patient', 'Hardworking', 'Observant'],
    weaknesses: ['Shy', 'Takes things personally', 'Dislikes change', 'Overloaded', 'Reluctant to change'],
    percentage: 14
  },
  INFJ: {
    code: 'INFJ',
    title: 'The Counselor',
    subtitle: 'Idealistic and Organized',
    description: 'Seek meaning and connection in ideas, relationships, and material possessions. Want to understand what motivates people and are insightful about others. Conscientious and committed to their firm values. Develop a clear vision about how best to serve the common good. Organized and decisive in implementing their vision.',
    traits: ['Insightful', 'Creative', 'Determined', 'Idealistic', 'Compassionate'],
    strengths: ['Creative', 'Insightful', 'Principled', 'Passionate', 'Altruistic'],
    weaknesses: ['Sensitive', 'Perfectionistic', 'Private', 'Can burn out', 'Dislikes confrontation'],
    percentage: 1.5
  },
  INTJ: {
    code: 'INTJ',
    title: 'The Mastermind',
    subtitle: 'Strategic and Logical',
    description: 'Have original minds and great drive for implementing their ideas and achieving their goals. Quickly see patterns in external events and develop long-range explanatory perspectives. When committed, organize a job and carry it through. Skeptical and independent, have high standards of competence and performance - for themselves and others.',
    traits: ['Strategic', 'Independent', 'Analytical', 'Determined', 'Innovative'],
    strengths: ['Rational', 'Informed', 'Independent', 'Determined', 'Curious'],
    weaknesses: ['Arrogant', 'Dismissive of emotions', 'Overly critical', 'Combative', 'Socially clueless'],
    percentage: 2
  },
  ISTP: {
    code: 'ISTP',
    title: 'The Craftsman',
    subtitle: 'Flexible and Tolerant',
    description: 'Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions. Analyze what makes things work and can handle large amounts of information. Interested in cause and effect, organize facts using logical principles, value efficiency. Like to work with things that can be handled, broken down, or analyzed.',
    traits: ['Practical', 'Flexible', 'Logical', 'Observant', 'Independent'],
    strengths: ['Optimistic', 'Energetic', 'Creative', 'Practical', 'Spontaneous'],
    weaknesses: ['Stubborn', 'Insensitive', 'Private', 'Easily bored', 'Risky behavior'],
    percentage: 5
  },
  ISFP: {
    code: 'ISFP',
    title: 'The Composer',
    subtitle: 'Sensitive and Kind',
    description: 'Quiet, friendly, sensitive, and kind. Enjoy the present moment, what\'s going on around them. Like to have their own space and to work within their own time frame. Loyal and committed to their values and to people who are important to them. Dislike disagreements and conflicts, do not force their opinions or values on others.',
    traits: ['Artistic', 'Sensitive', 'Loyal', 'Peaceful', 'Flexible'],
    strengths: ['Charming', 'Sensitive', 'Imaginative', 'Passionate', 'Curious'],
    weaknesses: ['Fiercely independent', 'Unpredictable', 'Easily stressed', 'Overly competitive', 'Fluctuating self-esteem'],
    percentage: 9
  },
  INFP: {
    code: 'INFP',
    title: 'The Healer',
    subtitle: 'Idealistic and Adaptable',
    description: 'Idealistic, loyal to their values and to people who are important to them. Want an external life that is congruent with their values. Curious, quick to see possibilities, can be catalysts for implementing ideas. Seek to understand people and to help them fulfill their potential. Adaptable, flexible, and accepting unless a value is threatened.',
    traits: ['Idealistic', 'Creative', 'Empathetic', 'Adaptable', 'Loyal'],
    strengths: ['Idealistic', 'Seek harmony', 'Open-minded', 'Flexible', 'Very creative'],
    weaknesses: ['Too idealistic', 'Too altruistic', 'Impractical', 'Dislikes criticism', 'Difficult to know'],
    percentage: 4
  },
  INTP: {
    code: 'INTP',
    title: 'The Architect',
    subtitle: 'Logical and Original',
    description: 'Seek logical explanations for everything that interests them. Theoretical and abstract, interested more in ideas than in social interaction. Quiet, contained, flexible, and adaptable. Have unusual ability to focus in depth to solve problems in their area of interest. Skeptical, sometimes critical, always analytical.',
    traits: ['Analytical', 'Creative', 'Independent', 'Logical', 'Curious'],
    strengths: ['Analytical', 'Original', 'Open-minded', 'Curious', 'Objective'],
    weaknesses: ['Disconnected', 'Insensitive', 'Dissatisfied', 'Impatient', 'Perfectionistic'],
    percentage: 3
  },
  ESTP: {
    code: 'ESTP',
    title: 'The Dynamo',
    subtitle: 'Flexible and Tolerant',
    description: 'Flexible and tolerant, they take a pragmatic approach focused on immediate results. Theories and conceptual explanations bore them - they want to act energetically to solve the problem. Focus on the here-and-now, spontaneous, enjoy each moment that they can be active with others. Enjoy material comforts and style. Learn best through doing.',
    traits: ['Energetic', 'Practical', 'Spontaneous', 'Adaptable', 'Confident'],
    strengths: ['Bold', 'Rational', 'Practical', 'Original', 'Perceptive'],
    weaknesses: ['Insensitive', 'Impatient', 'Risk-prone', 'Unstructured', 'May miss the bigger picture'],
    percentage: 4
  },
  ESFP: {
    code: 'ESFP',
    title: 'The Performer',
    subtitle: 'Spontaneous and Playful',
    description: 'Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts. Enjoy working with others to make things happen. Bring common sense and a realistic approach to their work, and make work fun. Flexible and spontaneous, adapt readily to new people and environments. Learn best by trying a new skill with other people.',
    traits: ['Enthusiastic', 'Sociable', 'Practical', 'Spontaneous', 'Optimistic'],
    strengths: ['Bold', 'Original', 'Aesthetic', 'Practical', 'Observant'],
    weaknesses: ['Sensitive', 'Conflict-averse', 'Easily bored', 'Poor long-term planners', 'Unfocused'],
    percentage: 9
  },
  ENFP: {
    code: 'ENFP',
    title: 'The Champion',
    subtitle: 'Enthusiastic and Creative',
    description: 'Warmly enthusiastic and imaginative. See life as full of possibilities. Make connections between events and information very quickly, and confidently proceed based on the patterns they see. Want a lot of affirmation from others, and readily give appreciation and support. Spontaneous and flexible, often rely on their ability to improvise and their verbal fluency.',
    traits: ['Enthusiastic', 'Creative', 'Sociable', 'Independent', 'Curious'],
    strengths: ['Curious', 'Observant', 'Energetic', 'Enthusiastic', 'Excellent communicators'],
    weaknesses: ['Poor practical skills', 'Difficulty focusing', 'Overthinking', 'Gets stressed easily', 'Overly emotional'],
    percentage: 8
  },
  ENTP: {
    code: 'ENTP',
    title: 'The Visionary',
    subtitle: 'Innovative and Strategic',
    description: 'Quick, ingenious, stimulating, alert, and outspoken. Resourceful in solving new and challenging problems. Adept at generating conceptual possibilities and then analyzing them strategically. Good at reading other people. Bored by routine, will seldom do the same thing the same way, apt to turn to one new interest after another.',
    traits: ['Innovative', 'Strategic', 'Energetic', 'Analytical', 'Adaptable'],
    strengths: ['Knowledgeable', 'Quick thinkers', 'Original', 'Charismatic', 'Energetic'],
    weaknesses: ['Very argumentative', 'Insensitive', 'Intolerant', 'Can find it difficult to focus', 'Dislikes practical matters'],
    percentage: 3
  },
  ESTJ: {
    code: 'ESTJ',
    title: 'The Supervisor',
    subtitle: 'Practical and Realistic',
    description: 'Practical, realistic, matter-of-fact. Born to lead, organize and run operations. Decisive, quickly move to implement decisions. Organize projects, operations, and people to get things done, focus on getting results in the most efficient way possible. Take care of routine details. Have a clear set of logical standards, systematically follow them and want others to also.',
    traits: ['Organized', 'Decisive', 'Practical', 'Dependable', 'Direct'],
    strengths: ['Dedicated', 'Strong-willed', 'Direct', 'Honest', 'Patient'],
    weaknesses: ['Inflexible', 'Uncomfortable with unconventional situations', 'Judgmental', 'Too focused on social status', 'Difficult expressing emotion'],
    percentage: 11
  },
  ESFJ: {
    code: 'ESFJ',
    title: 'The Provider',
    subtitle: 'Caring and Social',
    description: 'Warmhearted, conscientious, and cooperative. Want harmony in their environment, work with determination to establish it. Like to work with others to complete tasks accurately and on time. Loyal, follow through even in small matters. Notice what others need in their day-to-day lives and try to provide it. Want to be appreciated for who they are and for what they contribute.',
    traits: ['Caring', 'Social', 'Loyal', 'Organized', 'Dutiful'],
    strengths: ['Strong practical skills', 'Strong sense of duty', 'Very loyal', 'Sensitive', 'Warm'],
    weaknesses: ['Worried about social status', 'Inflexible', 'Vulnerable to criticism', 'Too selfless', 'Too needy'],
    percentage: 12
  },
  ENFJ: {
    code: 'ENFJ',
    title: 'The Teacher',
    subtitle: 'Charismatic and Inspiring',
    description: 'Warm, empathetic, responsive, and responsible. Highly attuned to the emotions, needs, and motivations of others. Find potential in everyone, want to help others fulfill their potential. May act as catalysts for individual and group growth. Loyal, responsive to praise and criticism. Sociable, facilitate others in a group, and provide inspiring leadership.',
    traits: ['Charismatic', 'Inspiring', 'Empathetic', 'Organized', 'Altruistic'],
    strengths: ['Tolerant', 'Reliable', 'Charismatic', 'Altruistic', 'Natural leaders'],
    weaknesses: ['Overly idealistic', 'Too selfless', 'Too sensitive', 'Fluctuating self-esteem', 'Struggle with tough decisions'],
    percentage: 2.5
  },
  ENTJ: {
    code: 'ENTJ',
    title: 'The Commander',
    subtitle: 'Bold and Imaginative',
    description: 'Frank, decisive, assume leadership readily. Quickly see illogical and inefficient procedures and policies, develop and implement comprehensive systems to solve organizational problems. Enjoy long-term planning and goal setting. Usually well informed, well read, enjoy expanding their knowledge and passing it on to others. Forceful in presenting their ideas.',
    traits: ['Bold', 'Imaginative', 'Strong-willed', 'Efficient', 'Charismatic'],
    strengths: ['Efficient', 'Energetic', 'Self-confident', 'Strong-willed', 'Strategic thinkers'],
    weaknesses: ['Stubborn', 'Intolerant', 'Impatient', 'Arrogant', 'Poor handling of emotions'],
    percentage: 1.8
  }
}

/**
 * Get personality type data by code
 */
export function getPersonalityType(code: string): PersonalityType | undefined {
  return MBTI_TYPES[code.toUpperCase()]
}

/**
 * Get all personality types
 */
export function getAllPersonalityTypes(): PersonalityType[] {
  return Object.values(MBTI_TYPES)
}

/**
 * Get personality types by dimension preferences
 */
export function getPersonalityTypesByDimensions(
  ei: 'E' | 'I',
  sn: 'S' | 'N',
  tf: 'T' | 'F',
  jp: 'J' | 'P'
): PersonalityType | undefined {
  const code = `${ei}${sn}${tf}${jp}`
  return getPersonalityType(code)
}
