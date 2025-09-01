import { Document } from '@/services/documents'
import { Chunk, ProcessedDocument } from '@/types/documents'

export const simulateProcessingTime = (fileSize: number): number => {
  const baseDuration = fileSize / (1024 * 1024)
  const randomFactor = 0.5 + Math.random()
  return Math.max(2, Math.ceil(baseDuration * randomFactor))
}

export const simulateProcessingProgress = (
  durationSec: number,
  onProgress: (progress: number) => void,
  onComplete: () => Promise<void>,
): (() => void) => {
  let isPaused = false
  let progress = 0
  const intervalTime = 300
  const totalSteps = (durationSec * 1000) / intervalTime

  const intervalId = setInterval(async () => {
    if (isPaused) return

    if (progress >= 100) {
      clearInterval(intervalId)
      await onComplete()
      return
    }

    if (progress < 60) {
      progress += (100 / totalSteps) * 1.5
    } else if (progress < 85) {
      progress += (100 / totalSteps) * 0.8
    } else if (progress < 95) {
      progress += (100 / totalSteps) * 0.5
    } else {
      progress += (100 / totalSteps) * 0.2
    }

    onProgress(Math.min(progress, 100))
  }, intervalTime)

  return () => {
    isPaused = true
    clearInterval(intervalId)
  }
}

export const processDocument = (
  file: File,
  document: Document,
  onProgress: (progress: number) => void,
  onComplete: (document: ProcessedDocument) => void,
): (() => Promise<void>) => {
  let hasCompleted = false

  const processingTime = simulateProcessingTime(file.size)

  const cancel = simulateProcessingProgress(processingTime, onProgress, async () => {
    if (hasCompleted) return
    hasCompleted = true

    const chunks: Chunk[] = []
    const totalTokens = 0

    const processedDoc: ProcessedDocument = {
      id: document.id ? document.id.toString() : '-1',
      name: file.name,
      size: file.size,
      chunks,
      totalTokens,
      pageCount: undefined,
      processed: false,
      processingProgress: 100,
      status: 'pending',
    }

    onComplete(processedDoc)
  })

  return async () => {
    hasCompleted = true
    cancel()
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4)
}
