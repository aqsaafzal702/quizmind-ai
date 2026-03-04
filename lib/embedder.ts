import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers'

// Singleton pattern - load model only once
let embedder: FeatureExtractionPipeline | null = null
let isLoading = false

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  // If already loaded return it
  if (embedder) return embedder

  // If currently loading wait for it
  if (isLoading) {
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return embedder!
  }

  // Load the model for first time
  isLoading = true
  console.log('Loading embedding model...')

  embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  ) as FeatureExtractionPipeline

  console.log('Embedding model loaded ')
  isLoading = false
  return embedder
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getEmbedder()

  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  })

  // Convert to plain number array
  return Array.from(output.data as Float32Array)
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []

  // Process one by one to avoid memory issues
  for (const text of texts) {
    const embedding = await embedText(text)
    embeddings.push(embedding)
  }

  return embeddings
}