'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Question, QuizAttempt } from '@/types'

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [shortAnswer, setShortAnswer] = useState('')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<{
    isCorrect: boolean
    score: number
    feedback: string
    correctAnswer: string
    explanation: string
  } | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('questions')
    if (!stored) {
      setLoaded(true)
      return
    }
    const parsed = JSON.parse(stored)
    if (!parsed || parsed.length === 0) {
      setLoaded(true)
      return
    }
    setQuestions(parsed)
    setLoaded(true)
  }, [])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0

  const handleSubmit = async () => {
    if (!currentQuestion) return
    const answer =
      currentQuestion.type === 'short' ? shortAnswer.trim() : selectedAnswer
    if (!answer) return

    setGrading(true)
    setError('')

    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userAnswer: answer,
          documentId: localStorage.getItem('documentId'),
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Grading failed')
        setGrading(false)
        return
      }

      setResult(data.data)
      setAttempts((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          userAnswer: answer,
          isCorrect: data.data.isCorrect,
          score: data.data.score,
          feedback: data.data.feedback,
        },
      ])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGrading(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      localStorage.setItem('quizAttempts', JSON.stringify([...attempts]))
      router.push('/results')
      return
    }
    setCurrentIndex((prev) => prev + 1)
    setSelectedAnswer('')
    setShortAnswer('')
    setResult(null)
    setError('')
  }

  // Not loaded yet — show nothing to prevent flash
  if (!loaded) {
    return null
  }

  // Loaded but no questions — show friendly message
  if (loaded && questions.length === 0) {
    return (
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎯</div>
        <h3
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '12px',
          }}
        >
          No Quiz Generated Yet
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>
          Please upload a document and generate questions first.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn-primary"
            onClick={() => router.push('/upload')}
            style={{ padding: '14px 32px', fontSize: '15px' }}
          >
            📄 Upload Document
          </button>
          <button
            className="btn-secondary"
            onClick={() => router.push('/generate')}
            style={{ padding: '14px 32px', fontSize: '15px' }}
          >
            🧠 Generate Questions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span className="badge badge-purple">
            Step 3 of 3
          </span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            Question{' '}
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
              {currentIndex + 1}
            </span>{' '}
            of {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div
        className="glass"
        style={{
          padding: '36px',
          marginBottom: '24px',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Question meta */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <span
            className={`badge ${
              currentQuestion.difficulty === 'easy'
                ? 'badge-green'
                : currentQuestion.difficulty === 'medium'
                ? 'badge-blue'
                : 'badge-red'
            }`}
          >
            {currentQuestion.difficulty === 'easy'
              ? '🟢'
              : currentQuestion.difficulty === 'medium'
              ? '🟡'
              : '🔴'}{' '}
            {currentQuestion.difficulty}
          </span>
          <span className="badge badge-purple">
            {currentQuestion.type === 'mcq'
              ? '🔘 MCQ'
              : currentQuestion.type === 'truefalse'
              ? '⚖️ True/False'
              : '✍️ Short Answer'}
          </span>
        </div>

        {/* Question text */}
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(16px, 3vw, 22px)',
            fontWeight: 600,
            lineHeight: 1.5,
            color: '#f1f5f9',
            marginBottom: '28px',
          }}
        >
          {currentQuestion.question}
        </h2>

        {/* MCQ Options */}
        {(currentQuestion.type === 'mcq' || currentQuestion.type === 'truefalse') &&
          currentQuestion.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.label
                const isCorrect = result && option.label === result.correctAnswer
                const isWrong = result && isSelected && !result.isCorrect

                let borderColor = '#1e1e3a'
                let bgColor = 'transparent'
                let textColor = '#f1f5f9'

                if (result) {
                  if (isCorrect) {
                    borderColor = '#22c55e'
                    bgColor = 'rgba(34,197,94,0.1)'
                    textColor = '#86efac'
                  } else if (isWrong) {
                    borderColor = '#ef4444'
                    bgColor = 'rgba(239,68,68,0.1)'
                    textColor = '#fca5a5'
                  }
                } else if (isSelected) {
                  borderColor = '#7c3aed'
                  bgColor = 'rgba(124,58,237,0.1)'
                  textColor = '#a78bfa'
                }

                return (
                  <button
                    key={option.label}
                    onClick={() => !result && setSelectedAnswer(option.label)}
                    disabled={!!result}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: `2px solid ${borderColor}`,
                      background: bgColor,
                      cursor: result ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!result && !isSelected) {
                        e.currentTarget.style.borderColor = '#7c3aed66'
                        e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!result && !isSelected) {
                        e.currentTarget.style.borderColor = '#1e1e3a'
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected || isCorrect
                          ? borderColor + '33'
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: textColor,
                        flexShrink: 0,
                      }}
                    >
                      {result && isCorrect
                        ? '✓'
                        : result && isWrong
                        ? '✗'
                        : option.label}
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontSize: '15px',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {option.text}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

        {/* Short Answer */}
        {currentQuestion.type === 'short' && (
          <textarea
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={!!result}
            placeholder="Type your answer here..."
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid #1e1e3a',
              borderRadius: '12px',
              padding: '16px',
              color: '#f1f5f9',
              fontSize: '15px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1e1e3a'
            }}
          />
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div
          style={{
            background: result.isCorrect
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(239,68,68,0.08)',
            border: `1px solid ${
              result.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
            }`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '28px' }}>
              {result.isCorrect ? '🎉' : '💡'}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: result.isCorrect ? '#86efac' : '#fca5a5',
                }}
              >
                {result.isCorrect ? 'Correct!' : 'Not quite right'}
                {currentQuestion.type === 'short' && (
                  <span
                    style={{ marginLeft: '10px', fontSize: '14px', color: '#94a3b8' }}
                  >
                    Score: {result.score}/100
                  </span>
                )}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>
                {result.feedback}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              padding: '16px',
              borderLeft: '3px solid #7c3aed',
            }}
          >
            <p
              style={{
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Explanation
            </p>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7 }}>
              {result.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#fca5a5',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {!result ? (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={
              grading ||
              (currentQuestion.type === 'short'
                ? !shortAnswer.trim()
                : !selectedAnswer)
            }
            style={{ flex: 1, padding: '16px', fontSize: '16px' }}
          >
            {grading ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Grading...
              </span>
            ) : (
              '✓ Submit Answer'
            )}
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleNext}
            style={{ flex: 1, padding: '16px', fontSize: '16px' }}
          >
            {isLastQuestion ? '🏆 See Results' : 'Next Question →'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}