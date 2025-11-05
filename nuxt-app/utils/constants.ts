export const QUIZ_TYPES = {
  MBTI: 'mbti',
  LEADERSHIP: 'leadership',
  COMMUNICATION: 'communication',
  STRESS: 'stress',
  LEARNING: 'learning',
  RELATIONSHIP: 'relationship',
  CREATIVITY: 'creativity',
  DECISION: 'decision',
  TEAM: 'team',
  CAREER: 'career',
  CONFLICT: 'conflict',
  MOTIVATION: 'motivation',
  ADAPTABILITY: 'adaptability',
  EMOTIONAL: 'emotional',
  PRODUCTIVITY: 'productivity',
  SOCIAL: 'social'
} as const

export const PERSONALITY_DIMENSIONS = {
  EI: 'EI',
  SN: 'SN',
  TF: 'TF',
  JP: 'JP'
} as const

export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const

export const ADAPTIVE_CONFIG = {
  enabled: true,
  minQuestions: 20,
  maxQuestions: 60,
  confidenceThreshold: 0.85,
  questionSelection: {
    balanceWeight: 0.4,
    confidenceWeight: 0.3,
    diversityWeight: 0.3
  },
  earlyTermination: {
    enabled: true,
    minQuestionsAnswered: 20,
    minConfidence: 0.85,
    allDimensionsMustMeet: true
  },
  personalization: {
    enabled: true,
    learningRate: 0.1,
    adaptationThreshold: 0.7
  }
} as const

export const LOCAL_STORAGE_KEYS = {
  STATE: 'mbti_state',
  RESULTS: 'mbti_last_results',
  USER_PREFERENCES: 'mbti_user_preferences',
  QUIZ_PROGRESS: 'mbti_quiz_progress',
  MIGRATED: 'mbti_migrated',
  VK_USER: 'mbti_vk_user',
  VK_PREMIUM: 'mbti_vk_premium'
} as const

export const DEFAULT_SCORES = {
  E: 0,
  I: 0,
  S: 0,
  N: 0,
  T: 0,
  F: 0,
  J: 0,
  P: 0
} as const

export const VK_CONFIG = {
  appId: 54109191,
  apiVersion: '5.131'
} as const
