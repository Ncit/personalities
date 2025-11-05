/**
 * Question Loader Utility
 * Handles loading and managing quiz questions
 */

import type { Question } from '~/utils/types'
import { MBTI_QUESTIONS } from '~/data/mainQuiz'
import { getSpecializedQuestions, getSpecializedCategories, type SpecializedCategory } from '~/data/specializedQuiz'

/**
 * Load questions for a specific quiz type
 * @param quizType - Type of quiz ('mbti' or specialized category)
 * @param isPremium - Whether user has premium access
 * @returns Array of questions
 */
export async function loadQuestions(
  quizType: string = 'mbti',
  isPremium: boolean = false
): Promise<Question[]> {
  // Load main MBTI questions
  if (quizType === 'mbti') {
    return [...MBTI_QUESTIONS]
  }

  // Load specialized questions (premium only)
  if (isPremium) {
    const categories = getSpecializedCategories()
    if (categories.includes(quizType as SpecializedCategory)) {
      return getSpecializedQuestions(quizType as SpecializedCategory)
    }
  }

  // Default to main quiz if invalid type or not premium
  console.warn(`Invalid quiz type "${quizType}" or premium access required. Loading main quiz.`)
  return [...MBTI_QUESTIONS]
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Select adaptive questions based on confidence scores
 * Implements adaptive testing algorithm
 * @param allQuestions - All available questions
 * @param answers - Previously answered questions
 * @param confidenceScores - Current confidence scores for each dimension
 * @param targetCount - Target number of questions to return
 * @returns Selected questions for adaptive quiz
 */
export function selectAdaptiveQuestions(
  allQuestions: Question[],
  answers: any[],
  confidenceScores: Record<string, number>,
  targetCount: number = 30
): Question[] {
  // Get answered question IDs
  const answeredIds = new Set(answers.map(a => allQuestions[a.questionIndex]?.id).filter(Boolean))

  // Filter out already answered questions
  const availableQuestions = allQuestions.filter(q => !answeredIds.has(q.id))

  // Sort dimensions by confidence (lowest first = highest uncertainty)
  const dimensionsByUncertainty = Object.entries(confidenceScores)
    .sort(([, a], [, b]) => a - b)
    .map(([dim]) => dim)

  // Select questions prioritizing low-confidence dimensions
  const selectedQuestions: Question[] = []
  const questionsPerDimension = Math.ceil(targetCount / 4)

  for (const dimension of dimensionsByUncertainty) {
    const dimensionQuestions = availableQuestions
      .filter(q => q.dimension === dimension)
      .slice(0, questionsPerDimension)

    selectedQuestions.push(...dimensionQuestions)

    if (selectedQuestions.length >= targetCount) {
      break
    }
  }

  // If we need more questions, add remaining randomly
  if (selectedQuestions.length < targetCount) {
    const remaining = availableQuestions
      .filter(q => !selectedQuestions.includes(q))
      .slice(0, targetCount - selectedQuestions.length)

    selectedQuestions.push(...remaining)
  }

  return selectedQuestions.slice(0, targetCount)
}

/**
 * Calculate confidence scores based on answers
 * @param answers - Array of answers
 * @param questions - Array of questions
 * @returns Confidence scores for each dimension
 */
export function calculateConfidenceScores(
  answers: any[],
  questions: Question[]
): Record<string, number> {
  const dimensions = ['EI', 'SN', 'TF', 'JP']
  const confidence: Record<string, number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0
  }

  // Count answers per dimension
  const dimensionCounts: Record<string, number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0
  }

  for (const answer of answers) {
    const question = questions[answer.questionIndex]
    if (question) {
      dimensionCounts[question.dimension]++
    }
  }

  // Calculate confidence based on number of answers (more answers = higher confidence)
  const maxAnswersPerDimension = 15 // Typical max for basic assessment

  for (const dimension of dimensions) {
    const count = dimensionCounts[dimension] || 0
    confidence[dimension] = Math.min(count / maxAnswersPerDimension, 1)
  }

  return confidence
}

/**
 * Check if quiz should terminate early (adaptive mode)
 * @param confidenceScores - Current confidence scores
 * @param threshold - Minimum confidence threshold (0-1)
 * @returns True if all dimensions meet confidence threshold
 */
export function shouldTerminateEarly(
  confidenceScores: Record<string, number>,
  threshold: number = 0.85
): boolean {
  return Object.values(confidenceScores).every(score => score >= threshold)
}

/**
 * Get recommended quiz categories for user based on interests
 * @param interests - User interests or preferences
 * @returns Array of recommended specialized categories
 */
export function getRecommendedCategories(
  interests?: string[]
): SpecializedCategory[] {
  const categories = getSpecializedCategories()

  // If no interests provided, return all categories
  if (!interests || interests.length === 0) {
    return categories
  }

  // Simple recommendation logic - can be enhanced
  const recommendations: SpecializedCategory[] = []

  const interestMap: Record<string, SpecializedCategory[]> = {
    work: ['career', 'leadership', 'teamwork', 'productivity'],
    relationships: ['relationships', 'communication', 'social', 'emotional'],
    personal: ['stress', 'motivation', 'adaptability', 'emotional'],
    creative: ['creativity', 'decision', 'learning']
  }

  for (const interest of interests) {
    const mapped = interestMap[interest.toLowerCase()]
    if (mapped) {
      recommendations.push(...mapped)
    }
  }

  // Remove duplicates and return
  return [...new Set(recommendations)]
}

export default {
  loadQuestions,
  shuffleArray,
  selectAdaptiveQuestions,
  calculateConfidenceScores,
  shouldTerminateEarly,
  getRecommendedCategories
}
