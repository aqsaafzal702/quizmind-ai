'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { QuizAttempt } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [filename, setFilename] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('quizAttempts')
    const fname = localStorage.getItem('filename')

    if (!stored) {
      router.push('/upload')
      return
    }

    setAttempts(JSON.parse(stored))
    setFilename(fname || 'Unknown file')
    setMounted(true)
  }, [router])

  const totalQuestions = attempts.length
  const correctAnswers = attempts.filter((a) => a.isCorrect).length
  const averageScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0
  const percentage = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', label: 'Outstanding!', color: '#22c55e', emoji: '🏆' }
    if (percentage >= 80) return { grade: 'A', label: 'Excellent!', color: '#22c55e', emoji: '🎉' }
    if (percentage >= 70) return { grade: 'B', label: 'Great Job!', color: '#3b82f6', emoji: '👍' }
    if (percentage >= 60) return { grade: 'C', label: 'Good Effort!', color: '#f59e0b', emoji: '💪' }
    if (percentage >= 50) return { grade: 'D', label: 'Keep Practicing!', color: '#f97316', emoji: '📚' }
    return { grade: 'F', label: 'Need More Study!', color: '#ef4444', emoji: '💡' }
  }

  const gradeInfo = getGrade()

  const handleRetry = () => {
    localStorage.removeItem('quizAttempts')
    localStorage.removeItem('questions')
    router.push('/generate')
  }

  const handleNewDocument = () => {
    localStorage.clear()
    router.push('/upload')
  }

  if (!mounted) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <p style={{ color: '#94a3b8' }}>Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
        }}
      >
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>
          {gradeInfo.emoji}
        </div>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: '8px',
          }}
        >
          Quiz{' '}
          <span className="gradient-text">Complete!</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
          {gradeInfo.label} Here is how you did on{' '}
          <span style={{ color: '#a78bfa' }}>{filename}</span>
        </p>
      </div>

      {/* Score Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* Grade */}
        <div
          className="glass"
          style={{
            padding: '28px 20px',
            textAlign: 'center',
            border: `1px solid ${gradeInfo.color}44`,
            background: `${gradeInfo.color}08`,
          }}
        >
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '52px',
              fontWeight: 800,
              color: gradeInfo.color,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {gradeInfo.grade}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
            Grade
          </div>
        </div>

        {/* Percentage */}
        <div className="glass" style={{ padding: '28px 20px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '52px',
              fontWeight: 800,
              backgroundImage: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              WebkitBackgroundClip: 'text' as const,
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text' as const,
              color: 'transparent',
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {percentage}%
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
            Score
          </div>
        </div>

        {/* Correct */}
        <div className="glass" style={{ padding: '28px 20px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '52px',
              fontWeight: 800,
              color: '#22c55e',
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {correctAnswers}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
            Correct
          </div>
        </div>

        {/* Total */}
        <div className="glass" style={{ padding: '28px 20px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '52px',
              fontWeight: 800,
              color: '#f1f5f9',
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {totalQuestions}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
            Total
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass" style={{ padding: '24px', marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Overall Performance</span>
          <span
            style={{
              color: gradeInfo.color,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {percentage}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}aa)`,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}
        >
          <span style={{ color: '#475569', fontSize: '12px' }}>0%</span>
          <span style={{ color: '#475569', fontSize: '12px' }}>100%</span>
        </div>
      </div>

      {/* Question Review */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#f1f5f9',
          }}
        >
          Question Review
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {attempts.map((attempt, index) => (
            <div
              key={attempt.questionId}
              className="glass"
              style={{
                padding: '20px 24px',
                borderLeft: `3px solid ${attempt.isCorrect ? '#22c55e' : '#ef4444'}`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.4s ease ${index * 0.08}s`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                      }}
                    >
                      {attempt.isCorrect ? '✅' : '❌'}
                    </span>
                    <span
                      style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      Question {index + 1}
                    </span>
                  </div>

                  <div
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Your answer: </span>
                    <span
                      style={{
                        color: attempt.isCorrect ? '#86efac' : '#fca5a5',
                        fontWeight: 500,
                      }}
                    >
                      {attempt.userAnswer}
                    </span>
                  </div>

                  {attempt.feedback && (
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                      {attempt.feedback}
                    </div>
                  )}
                </div>

                {/* Score badge */}
                <div
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: attempt.isCorrect
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${attempt.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: attempt.isCorrect ? '#86efac' : '#fca5a5',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {attempt.score}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          onClick={handleRetry}
          style={{ flex: 1, padding: '16px', fontSize: '15px', minWidth: '200px' }}
        >
          🔄 Try Again with Same Document
        </button>
        <button
          className="btn-secondary"
          onClick={handleNewDocument}
          style={{ flex: 1, padding: '16px', fontSize: '15px', minWidth: '200px' }}
        >
          📄 Upload New Document
        </button>
      </div>

      {/* Home link */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link
          href="/"
          style={{
            color: '#475569',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#94a3b8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#475569'
          }}
        >
          ← Back to Home
        </Link>
      </div>

    </div>
  )
}