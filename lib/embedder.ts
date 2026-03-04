import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

export async function embedText(text: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  })

  // Convert to plain number array
  if (Array.isArray(response)) {
    return response as number[]
  }

  return Array.from(response as unknown as Float32Array)
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []

  for (const text of texts) {
    const embedding = await embedText(text)
    embeddings.push(embedding)
  }

  return embeddings
}