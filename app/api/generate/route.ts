import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { retrieveRelevantChunks, formatChunksAsContext } from '@/lib/retriever'
import type {
  ApiResponse,
  GenerateQuestionsRequest,
  GenerateResponse,
  Question,
  DifficultyLevel,
  QuestionType,
} from '@/types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

function buildPrompt(
  context: string,
  numberOfQuestions: number,
  difficulty: DifficultyLevel,
  questionType: QuestionType
): string {
  const difficultyGuide = {
    easy: 'basic recall and understanding',
    medium: 'application and analysis',
    hard: 'evaluation, synthesis and critical thinking',
  }

  const typeGuide = {
    mcq: `Multiple choice questions with exactly 4 options labeled A, B, C, D`,
    short: `Short answer questions requiring 1-3 sentence answers`,
    truefalse: `True/False questions`,
  }

  return `You are an expert educator. Based on the study material below, generate exactly ${numberOfQuestions} ${typeGuide[questionType]} questions at ${difficulty} difficulty level (${difficultyGuide[difficulty]}).

STUDY MATERIAL:
${context}

IMPORTANT INSTRUCTIONS:
- Generate exactly ${numberOfQuestions} questions
- Difficulty: ${difficulty} (${difficultyGuide[difficulty]})
- Base all questions ONLY on the provided study material
- Each question must have a clear correct answer found in the material
- Provide a detailed explanation for each answer

Respond with ONLY a valid JSON array in this exact format:
${
  questionType === 'mcq'
    ? `[
  {
    "type": "mcq",
    "difficulty": "${difficulty}",
    "question": "question text here",
    "options": [
      { "label": "A", "text": "option text" },
      { "label": "B", "text": "option text" },
      { "label": "C", "text": "option text" },
      { "label": "D", "text": "option text" }
    ],
    "correctAnswer": "A",
    "explanation": "detailed explanation here"
  }
]`
    : questionType === 'truefalse'
    ? `[
  {
    "type": "truefalse",
    "difficulty": "${difficulty}",
    "question": "statement here",
    "options": [
      { "label": "A", "text": "True" },
      { "label": "B", "text": "False" }
    ],
    "correctAnswer": "True",
    "explanation": "detailed explanation here"
  }
]`
    : `[
  {
    "type": "short",
    "difficulty": "${difficulty}",
    "question": "question text here",
    "correctAnswer": "expected answer here",
    "explanation": "detailed explanation here"
  }
]`
}

Return ONLY the JSON array, no other text.`
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await req.json()
    const { documentId, numberOfQuestions, difficulty, questionType } = body

    // Validate inputs
    if (!documentId || !numberOfQuestions || !difficulty || !questionType) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 20) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Number of questions must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Build a broad query to retrieve relevant chunks
    const searchQuery = `key concepts main topics important information`
    const chunks = await retrieveRelevantChunks(
      searchQuery,
      15,
      documentId
    )

    if (chunks.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'No content found for this document' },
        { status: 404 }
      )
    }

    // Format context for LLM
    const context = formatChunksAsContext(chunks)

    // Build prompt
    const prompt = buildPrompt(context, numberOfQuestions, difficulty, questionType)

    // Call Groq
    console.log('Calling Groq API...')
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON response
    let questions: Question[] = []
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])

      // Add IDs and source chunks
      questions = parsed.map((q: Omit<Question, 'id' | 'sourceChunks'>, index: number) => ({
        ...q,
        id: `q-${Date.now()}-${index}`,
        sourceChunks: chunks.slice(0, 3),
      }))
    } catch {
      console.error('Failed to parse Groq response:', responseText)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to parse generated questions' },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<GenerateResponse>>({
      success: true,
      data: {
        questions,
        documentId,
      },
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate questions',
      },
      { status: 500 }
    )
  }
}