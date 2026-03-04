import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type {
  ApiResponse,
  GradeAnswerRequest,
  GradeResponse,
} from '@/types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body: GradeAnswerRequest = await req.json()
    const { question, userAnswer } = body

    if (!question || !userAnswer) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For MCQ and True/False — grade instantly without Groq
    if (question.type === 'mcq' || question.type === 'truefalse') {
      const isCorrect =
        userAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase()

      return NextResponse.json<ApiResponse<GradeResponse>>({
        success: true,
        data: {
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect
            ? '✅ Correct! Well done!'
            : `❌ Incorrect. The correct answer is: ${question.correctAnswer}`,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        },
      })
    }

    // For short answer — use Groq to grade
    const prompt = `You are a strict but fair teacher grading a student's answer.

QUESTION: ${question.question}

EXPECTED ANSWER: ${question.correctAnswer}

STUDENT'S ANSWER: ${userAnswer}

Grade the student's answer based on:
1. Accuracy — is the core concept correct?
2. Completeness — does it cover the key points?
3. Understanding — does the student understand the topic?

Respond with ONLY a valid JSON object in this exact format:
{
  "isCorrect": true or false,
  "score": a number between 0 and 100,
  "feedback": "specific feedback about the student's answer in 2-3 sentences"
}

Return ONLY the JSON object, no other text.`

    console.log('Grading short answer with Groq...')
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON response
    let gradeData
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      gradeData = JSON.parse(jsonMatch[0])
    } catch {
      console.error('Failed to parse grade response:', responseText)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to parse grading response' },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<GradeResponse>>({
      success: true,
      data: {
        isCorrect: gradeData.isCorrect,
        score: gradeData.score,
        feedback: gradeData.feedback,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      },
    })
  } catch (error) {
    console.error('Grade error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grade answer',
      },
      { status: 500 }
    )
  }
}