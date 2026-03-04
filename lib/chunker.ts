export interface TextChunk {
  id: string
  text: string
  metadata: {
    source: string
    chunkIndex: number
    totalChunks: number
    startChar: number
    endChar: number
  }
}

export function chunkText(
  text: string,
  source: string,
  chunkSize: number = 500,
  overlap: number = 50
): TextChunk[] {
  // Clean up the text first
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const chunks: TextChunk[] = []
  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < cleaned.length) {
    // Calculate end of this chunk
    let endIndex = startIndex + chunkSize

    // If not at end of text, try to break at sentence or word
    if (endIndex < cleaned.length) {
      // Try to break at sentence end (. ! ?)
      const sentenceBreak = cleaned.lastIndexOf('.', endIndex)
      const exclamBreak = cleaned.lastIndexOf('!', endIndex)
      const questionBreak = cleaned.lastIndexOf('?', endIndex)

      const bestBreak = Math.max(sentenceBreak, exclamBreak, questionBreak)

      // Only use sentence break if it's not too far back
      if (bestBreak > startIndex + chunkSize * 0.5) {
        endIndex = bestBreak + 1
      } else {
        // Fall back to word boundary
        const wordBreak = cleaned.lastIndexOf(' ', endIndex)
        if (wordBreak > startIndex) {
          endIndex = wordBreak
        }
      }
    }

    const chunkText = cleaned.slice(startIndex, endIndex).trim()

    if (chunkText.length > 0) {
      chunks.push({
        id: `${source}-chunk-${chunkIndex}`,
        text: chunkText,
        metadata: {
          source,
          chunkIndex,
          totalChunks: 0, // will update after loop
          startChar: startIndex,
          endChar: endIndex,
        },
      })
      chunkIndex++
    }

    // Move forward with overlap
    startIndex = endIndex - overlap
    if (startIndex <= 0) startIndex = endIndex
  }

  // Now update totalChunks in all chunks
  const total = chunks.length
  return chunks.map((chunk) => ({
    ...chunk,
    metadata: { ...chunk.metadata, totalChunks: total },
  }))
}