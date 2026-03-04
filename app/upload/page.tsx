'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) validateAndSetFile(droppedFile)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (f: File) => {
    setError('')
    const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'text/html']
    if (!allowed.includes(f.type) && !f.name.endsWith('.md')) {
      setError('Only PDF, TXT, MD and HTML files are allowed')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      clearInterval(interval)

      if (!data.success) {
        setError(data.error || 'Upload failed')
        setUploading(false)
        setProgress(0)
        return
      }

      setProgress(100)
      setSuccess(true)

      // Store documentId for next page
      localStorage.setItem('documentId', data.data.documentId)
      localStorage.setItem('filename', data.data.filename)
      localStorage.setItem('totalChunks', String(data.data.totalChunks))

      // Redirect after short delay
      setTimeout(() => {
        router.push('/generate')
      }, 1500)
    } catch {
      clearInterval(interval)
      setError('Something went wrong. Please try again.')
      setUploading(false)
      setProgress(0)
    }
  }

  const fileTypes = [
    { ext: 'PDF', color: '#ef4444', icon: '📕' },
    { ext: 'TXT', color: '#3b82f6', icon: '📄' },
    { ext: 'MD', color: '#8b5cf6', icon: '📝' },
    { ext: 'HTML', color: '#f97316', icon: '🌐' },
  ]

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-purple" style={{ marginBottom: '16px' }}>
          Step 1 of 3
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
          Upload Your{' '}
          <span className="gradient-text">Study Material</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
          Upload a document and our AI will generate smart questions from it
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && document.getElementById('fileInput')?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#7c3aed' : file ? '#22c55e' : '#1e1e3a'}`,
          borderRadius: '20px',
          padding: '64px 32px',
          textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          background: isDragging
            ? 'rgba(124, 58, 237, 0.05)'
            : file
            ? 'rgba(34, 197, 94, 0.05)'
            : 'rgba(19, 19, 31, 0.8)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          boxShadow: isDragging ? '0 0 40px rgba(124,58,237,0.2)' : 'none',
          marginBottom: '24px',
        }}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.txt,.md,.html"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {!file ? (
          <>
            <div
              style={{
                fontSize: '56px',
                marginBottom: '16px',
                filter: isDragging ? 'drop-shadow(0 0 20px #7c3aed)' : 'none',
                transition: 'filter 0.3s ease',
              }}
            >
              {isDragging ? '✨' : '📂'}
            </div>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#f1f5f9',
                marginBottom: '8px',
              }}
            >
              {isDragging ? 'Drop it here!' : 'Drag & drop your file here'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              or click to browse files
            </p>

            {/* File type badges */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {fileTypes.map((ft) => (
                <span
                  key={ft.ext}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: `${ft.color}22`,
                    border: `1px solid ${ft.color}44`,
                    color: ft.color,
                  }}
                >
                  {ft.icon} {ft.ext}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#22c55e',
                marginBottom: '8px',
              }}
            >
              {file.name}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              {(file.size / 1024).toFixed(1)} KB • Ready to upload
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                setError('')
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ef444444',
                color: '#ef4444',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Remove file
            </button>
          </>
        )}
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

      {/* Progress Bar */}
      {uploading && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              {success ? '✅ Upload complete!' : '⚡ Processing document...'}
            </span>
            <span style={{ color: '#7c3aed', fontSize: '13px', fontWeight: 600 }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        className="btn-primary"
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          opacity: !file || uploading ? 0.5 : 1,
        }}
      >
        {uploading
          ? success
            ? '✅ Redirecting to Generate...'
            : '⚡ Processing...'
          : '🚀 Upload & Process Document'}
      </button>

      {/* Info */}
      <p
        style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '13px',
          marginTop: '16px',
        }}
      >
        🔒 Your document stays private — processed locally on your machine
      </p>
    </div>
  )
}