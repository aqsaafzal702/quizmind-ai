import { embedText } from '@/lib/embedder'
import { getAllChunksWithEmbeddings } from '@/lib/db'

export interface RetrievedChunk {
  id: string
  documentId: string
  text: string
  chunkIndex: number
  totalChunks: number
  startChar: number
  endChar: number
  score: number
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Main retrieval function
export async function retrieveRelevantChunks(
  query: string,
  topK: number = 5,
  documentId?: string
): Promise<RetrievedChunk[]> {
  // Step 1 — embed the query
  console.log('Embedding query...')
  const queryEmbedding = await embedText(query)

  // Step 2 — load all chunks from database
  console.log('Loading chunks from database...')
  let allChunks = await getAllChunksWithEmbeddings()

  // Step 3 — filter by document if specified
  if (documentId) {
    allChunks = allChunks.filter((chunk) => chunk.documentId === documentId)
  }

  if (allChunks.length === 0) {
    console.log('No chunks found in database')
    return []
  }

  // Step 4 — calculate similarity scores
  console.log(`Comparing query against ${allChunks.length} chunks...`)
  const scored = allChunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }))

  // Step 5 — sort by score descending and take topK
  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  console.log(
    `Top ${topChunks.length} chunks retrieved, best score: ${topChunks[0]?.score.toFixed(3)}`
  )

  return topChunks
}

// Format chunks into a single context string for LLM
export function formatChunksAsContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1} | Chunk ${chunk.chunkIndex + 1} of ${chunk.totalChunks}]\n${chunk.text}`
    )
    .join('\n\n---\n\n')
}