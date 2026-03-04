// Document types
export interface Document {
  id: string
  filename: string
  uploadedAt: string
}

export interface DocumentWithContent extends Document {
  content: string
}

// Chunk types
export interface Chunk {
  id: string
  documentId: string
  text: string
  chunkIndex: number
  totalChunks: number
  startChar: number
  endChar: number
  score?: number
}

// Question types
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type QuestionType = 'mcq' | 'short' | 'truefalse'

export interface MCQOption {
  label: string   // A, B, C, D
  text: string    // option text
}

export interface Question {
  id: string
  type: QuestionType
  difficulty: DifficultyLevel
  question: string
  options?: MCQOption[]       // only for mcq
  correctAnswer: string
  explanation: string
  sourceChunks: Chunk[]
}

// Quiz types
export interface QuizAttempt {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  score: number
  feedback: string
}

export interface QuizResult {
  totalQuestions: number
  correctAnswers: number
  score: number
  attempts: QuizAttempt[]
}

// API Request types
export interface GenerateQuestionsRequest {
  documentId: string
  numberOfQuestions: number
  difficulty: DifficultyLevel
  questionType: QuestionType
}

export interface GradeAnswerRequest {
  question: Question
  userAnswer: string
  documentId: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface IngestResponse {
  documentId: string
  filename: string
  totalChunks: number
}

export interface GenerateResponse {
  questions: Question[]
  documentId: string
}

export interface GradeResponse {
  isCorrect: boolean
  score: number
  feedback: string
  correctAnswer: string
  explanation: string
}