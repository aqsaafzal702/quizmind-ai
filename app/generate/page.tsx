'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DifficultyLevel, QuestionType } from '@/types'

const difficultyOptions: { value: DifficultyLevel; label: string; color: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', color: '#22c55e', desc: 'Basic recall & understanding' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', desc: 'Application & analysis' },
  { value: 'hard', label: 'Hard', color: '#ef4444', desc: 'Critical thinking & synthesis' },
]

const questionTypeOptions: { value: QuestionType; label: string; icon: string; desc: string }[] = [
  { value: 'mcq', label: 'Multiple Choice', icon: '🔘', desc: '4 options, one correct answer' },
  { value: 'truefalse', label: 'True / False', icon: '⚖️', desc: 'Simple true or false statements' },
  { value: 'short', label: 'Short Answer', icon: '✍️', desc: 'AI grades your written answer' },
]

export default function GeneratePage() {
  const router = useRouter()
  const [documentId, setDocumentId] = useState('')
  const [filename, setFilename] = useState('')
  const [totalChunks, setTotalChunks] = useState(0)
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [questionType, setQuestionType] = useState<QuestionType>('mcq')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const docId = localStorage.getItem('documentId')
    const fname = localStorage.getItem('filename')
    const chunks = localStorage.getItem('totalChunks')

    if (!docId) {
      // No redirect — just show empty state
      return
    }

    setDocumentId(docId)
    setFilename(fname || 'Unknown file')
    setTotalChunks(Number(chunks) || 0)
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          numberOfQuestions,
          difficulty,
          questionType,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate questions')
        setGenerating(false)
        return
      }

      // Store questions for quiz page
      localStorage.setItem('questions', JSON.stringify(data.data.questions))
      localStorage.setItem('quizConfig', JSON.stringify({ difficulty, questionType, numberOfQuestions }))

      router.push('/quiz')
    } catch {
      setError('Something went wrong. Please try again.')
      setGenerating(false)
    }
  }

  // No document uploaded yet — show friendly message
  if (!documentId) {
    return (
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📂</div>
        <h3
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '12px',
          }}
        >
          No Document Uploaded Yet
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '32px' }}>
          Please upload a study document first before generating questions.
        </p>
        <button
          className="btn-primary"
          onClick={() => router.push('/upload')}
          style={{ padding: '14px 32px', fontSize: '15px' }}
        >
          📄 Upload Document
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-purple" style={{ marginBottom: '16px' }}>
          Step 2 of 3
        </span>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: '12px',
          }}
        >
          Configure Your{' '}
          <span className="gradient-text">Quiz</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
          Customize how your questions are generated
        </p>
      </div>

      {/* Document Info Card */}
      {filename && (
        <div
          className="glass"
          style={{
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            📄
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontWeight: 600,
                color: '#f1f5f9',
                fontSize: '15px',
                marginBottom: '4px',
              }}
            >
              {filename}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              {totalChunks} chunks processed • Ready for question generation
            </p>
          </div>
          <span className="badge badge-green">✅ Ready</span>
        </div>
      )}

      {/* Number of Questions */}
      <div className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                marginBottom: '4px',
              }}
            >
              Number of Questions
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Choose between 1 and 20</p>
          </div>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              backgroundImage: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              WebkitBackgroundClip: 'text' as const,
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text' as const,
              color: 'transparent',
              minWidth: '48px',
              textAlign: 'right',
            }}
          >
            {numberOfQuestions}
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={20}
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #7c3aed ${(numberOfQuestions / 20) * 100}%, #1e1e3a ${(numberOfQuestions / 20) * 100}%)`,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          <span style={{ color: '#475569', fontSize: '12px' }}>1</span>
          <span style={{ color: '#475569', fontSize: '12px' }}>20</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '4px',
          }}
        >
          Difficulty Level
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
          How challenging should the questions be?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              style={{
                padding: '16px 12px',
                borderRadius: '12px',
                border: `2px solid ${difficulty === opt.value ? opt.color : '#1e1e3a'}`,
                background: difficulty === opt.value ? `${opt.color}15` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                if (difficulty !== opt.value) {
                  e.currentTarget.style.border = `2px solid ${opt.color}66`
                  e.currentTarget.style.background = `${opt.color}08`
                }
              }}
              onMouseLeave={(e) => {
                if (difficulty !== opt.value) {
                  e.currentTarget.style.border = '2px solid #1e1e3a'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>
                {opt.value === 'easy' ? '🟢' : opt.value === 'medium' ? '🟡' : '🔴'}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: difficulty === opt.value ? opt.color : '#f1f5f9',
                  marginBottom: '4px',
                }}
              >
                {opt.label}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Type */}
      <div className="glass" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '4px',
          }}
        >
          Question Type
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
          What format should the questions be in?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questionTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuestionType(opt.value)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: `2px solid ${questionType === opt.value ? '#7c3aed' : '#1e1e3a'}`,
                background: questionType === opt.value
                  ? 'rgba(124,58,237,0.1)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (questionType !== opt.value) {
                  e.currentTarget.style.border = '2px solid #7c3aed66'
                  e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (questionType !== opt.value) {
                  e.currentTarget.style.border = '2px solid #1e1e3a'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: questionType === opt.value
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                {opt.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: questionType === opt.value ? '#a78bfa' : '#f1f5f9',
                    marginBottom: '3px',
                  }}
                >
                  {opt.label}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>{opt.desc}</div>
              </div>
              {questionType === opt.value && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        className="btn-primary"
        onClick={handleGenerate}
        disabled={generating}
        style={{
          width: '100%',
          padding: '18px',
          fontSize: '17px',
          opacity: generating ? 0.7 : 1,
        }}
      >
        {generating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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
            Generating Questions...
          </span>
        ) : (
          '🧠 Generate Questions'
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}