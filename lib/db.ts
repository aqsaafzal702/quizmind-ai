import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS documents (
      id          TEXT PRIMARY KEY,
      filename    TEXT NOT NULL,
      content     TEXT NOT NULL,
      uploadedAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id          TEXT PRIMARY KEY,
      documentId  TEXT NOT NULL,
      text        TEXT NOT NULL,
      chunkIndex  INTEGER NOT NULL,
      totalChunks INTEGER NOT NULL,
      startChar   INTEGER NOT NULL,
      endChar     INTEGER NOT NULL,
      embedding   TEXT NOT NULL
    );
  `)
  console.log('Turso database initialized ✅')
}

// Save a document record
export async function saveDocument(
  id: string,
  filename: string,
  content: string
): Promise<void> {
  await db.execute({
    sql: `INSERT OR REPLACE INTO documents (id, filename, content, uploadedAt)
          VALUES (?, ?, ?, ?)`,
    args: [id, filename, content, new Date().toISOString()],
  })
}

// Save a chunk with its embedding
export async function saveChunk(
  id: string,
  documentId: string,
  text: string,
  chunkIndex: number,
  totalChunks: number,
  startChar: number,
  endChar: number,
  embedding: number[]
): Promise<void> {
  // Store embedding as JSON string instead of Buffer
  const embeddingJson = JSON.stringify(embedding)

  await db.execute({
    sql: `INSERT OR REPLACE INTO chunks 
          (id, documentId, text, chunkIndex, totalChunks, startChar, endChar, embedding)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, documentId, text, chunkIndex, totalChunks, startChar, endChar, embeddingJson],
  })
}

// Get all chunks for a document
export async function getChunksByDocument(documentId: string) {
  const result = await db.execute({
    sql: `SELECT * FROM chunks WHERE documentId = ? ORDER BY chunkIndex ASC`,
    args: [documentId],
  })
  return result.rows
}

// Get all documents
export async function getAllDocuments() {
  const result = await db.execute({
    sql: `SELECT id, filename, uploadedAt FROM documents ORDER BY uploadedAt DESC`,
    args: [],
  })
  return result.rows
}

// Get all chunks with their embeddings (for vector search)
export async function getAllChunksWithEmbeddings() {
  const result = await db.execute({
    sql: `SELECT id, documentId, text, chunkIndex, totalChunks,
                 startChar, endChar, embedding 
          FROM chunks`,
    args: [],
  })

  // Convert JSON string back to number[]
  return result.rows.map((row) => ({
    id: row.id as string,
    documentId: row.documentId as string,
    text: row.text as string,
    chunkIndex: row.chunkIndex as number,
    totalChunks: row.totalChunks as number,
    startChar: row.startChar as number,
    endChar: row.endChar as number,
    embedding: JSON.parse(row.embedding as string) as number[],
  }))
}

// Delete a document and all its chunks
export async function deleteDocument(documentId: string): Promise<void> {
  await db.execute({
    sql: `DELETE FROM chunks WHERE documentId = ?`,
    args: [documentId],
  })
  await db.execute({
    sql: `DELETE FROM documents WHERE id = ?`,
    args: [documentId],
  })
}