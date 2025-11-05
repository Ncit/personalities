// Core Types
export type PersonalityDimension = 'EI' | 'SN' | 'TF' | 'JP'
export type QuestionType = 'behavioral' | 'situational' | 'preference' | 'specialized'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type ScreenType = 'welcome' | 'quiz' | 'results'
export type Locale = 'en' | 'ru'
export type Theme = 'light' | 'dark'

// Question Types
export interface Question {
  id: string
  question: string
  options: string[]
  dimension: PersonalityDimension
  weights: number[]
  type?: QuestionType
  difficulty?: DifficultyLevel
}

export interface Answer {
  questionIndex: number
  selectedOption: number
  dimension: PersonalityDimension
  weights: number[]
  responseTime?: number
  timestamp: number
  questionType?: QuestionType
  difficulty?: DifficultyLevel
  questionId?: string
}

// MBTI Scores
export interface MBTIScores {
  E: number
  I: number
  S: number
  N: number
  T: number
  F: number
  J: number
  P: number
}

// Dimension Breakdown
export interface DimensionBreakdown {
  EI: { E: number; I: number; preference: 'E' | 'I' }
  SN: { S: number; N: number; preference: 'S' | 'N' }
  TF: { T: number; F: number; preference: 'T' | 'F' }
  JP: { J: number; P: number; preference: 'J' | 'P' }
}

// Quiz Results
export interface QuizResults {
  personalityType: string
  dimensionBreakdown: DimensionBreakdown
  scores: MBTIScores
  answers: Answer[]
  quizType: string
  timestamp: string
  isAdaptive: boolean
  totalQuestions: number
  answeredQuestions: number
  adaptiveAnalytics?: AdaptiveAnalytics
}

// Adaptive Assessment Types
export interface ConfidenceScores {
  EI: number
  SN: number
  TF: number
  JP: number
}

export interface AdaptiveAnalytics {
  confidenceScores: ConfidenceScores
  adaptationHistory: AdaptationEvent[]
  performanceMetrics: PerformanceMetrics
  personalizationData: PersonalizationData
  userProfile: UserProfile
  questionsSaved: number
  assessmentEfficiency: number
}

export interface AdaptationEvent {
  questionIndex: number
  adaptationType: 'reinforcement' | 'clarification' | 'exploration'
  confidence: number
  timestamp: number
}

export interface PerformanceMetrics {
  startTime: number
  processingTimes: number[]
  memoryUsage: MemoryUsage[]
  totalTime?: number
  averageProcessingTime?: number
  questionsPerMinute?: number
}

export interface MemoryUsage {
  used: number
  total: number
  timestamp: number
}

export interface PersonalizationData {
  questionTypes?: Record<QuestionType, number>
  difficulty?: Record<DifficultyLevel, number>
  responseTime?: { fast: number; medium: number; slow: number }
}

export interface UserProfile {
  preferences: {
    questionTypes: Record<QuestionType, number>
    difficulty: Record<DifficultyLevel, number>
    responseTime: { fast: number; medium: number; slow: number }
  }
  history: {
    previousAssessments: QuizResults[]
    responsePatterns: Record<string, any>
    accuracyHistory: number[]
  }
  personalization: {
    learningRate: number
    adaptationThreshold: number
  }
}

// Personality Type Data
export interface PersonalityType {
  code: string
  title: string
  subtitle: string
  description: string
  traits: string[]
  strengths: string[]
  weaknesses: string[]
  careers?: string[]
  relationships?: string[]
  percentage?: number
  compatibility?: string[]
}

// Quiz Configuration
export interface QuizConfig {
  name: string
  description: string
  questionCount: {
    free: number
    premium: number
  }
  dimensions: PersonalityDimension[]
}

export interface QuizType {
  mbti: QuizConfig
  [key: string]: QuizConfig
}

// User Types
export interface UserInfo {
  id?: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  isPremium: boolean
  locale: Locale
  theme: Theme
}

export interface UserPreferences {
  theme: Theme
  locale: Locale
  notifications: boolean
  analytics: boolean
}

export interface QuizHistory {
  quizType: string
  results: QuizResults
  date: string
}

// VK Types
export interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_url: string
  is_premium?: boolean
}

export interface VKPaymentStatus {
  orderId: string
  status: 'pending' | 'completed' | 'failed'
  item: string
  amount: number
  timestamp: number
}

export interface VKBridgeEvent {
  type: string
  data: any
}

// UI Types
export interface ModalState {
  types: boolean
  premium: boolean
  exitQuiz: boolean
  subscription: boolean
  clientCabinet: boolean
  [key: string]: boolean
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  duration?: number
  timestamp: number
}

// Adaptive Config
export interface AdaptiveConfig {
  enabled: boolean
  minQuestions: number
  maxQuestions: number
  confidenceThreshold: number
  questionSelection: {
    balanceWeight: number
    confidenceWeight: number
    diversityWeight: number
  }
  earlyTermination: {
    enabled: boolean
    minQuestionsAnswered: number
    minConfidence: number
    allDimensionsMustMeet: boolean
  }
  personalization: {
    enabled: boolean
    learningRate: number
    adaptationThreshold: number
  }
}

// Progress
export interface QuizProgress {
  current: number
  total: number
  percentage: number
  isAdaptive?: boolean
  confidence?: ConfidenceScores
}
