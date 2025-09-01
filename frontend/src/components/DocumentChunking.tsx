import React, { useState } from 'react'
import styles from './DocumentChunking.module.css'
import { estimateTokenCount } from '@/utils/tokenEstimator'
import { Trash2 } from 'lucide-react'
import { Chunk } from '@/types/agent'

interface DocumentChunkingProps {
  documentId: number
  documentName: string
  chunks?: Chunk[]
  status: 'pending' | 'processing' | 'processed' | 'failed'
  onChunkRemove: (chunkId: number) => void
  onAllChunksRemove: (documentId: number) => void
}

const DocumentChunking: React.FC<DocumentChunkingProps> = ({
  documentId,
  documentName,
  chunks,
  status,
  onChunkRemove,
  onAllChunksRemove,
}) => {
  const [expandedChunkId, setExpandedChunkId] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const calculateTokens = (text: string): number => {
    return estimateTokenCount(text, 'gpt-3.5-turbo')
  }

  const totalTokens = chunks!.reduce((sum, chunk) => sum + calculateTokens(chunk.text), 0)

  const toggleChunk = (chunkId: number) => {
    if (expandedChunkId === chunkId) {
      setExpandedChunkId(null)
    } else {
      setExpandedChunkId(chunkId)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (expandedChunkId) {
      setExpandedChunkId(null)
    }
  }

  return (
    <div className={styles.chunkingContainer}>
      <div className={styles.chunkingHeader}>
        <div className={styles.documentInfo}>
          <h3 className={styles.documentName}>{documentName}</h3>
          {status === 'processed' && (
            <span className={styles.chunkCount}>
              {chunks!.length} chunks • {totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          {status === 'processed' && (
            <button className={styles.expandButton} onClick={toggleExpand}>
              {isExpanded ? 'Recolher' : 'Expandir'}
            </button>
          )}
          <button className={styles.removeAllButton} onClick={() => onAllChunksRemove(documentId)}>
            Remover todos
          </button>
        </div>
      </div>

      {(isExpanded || expandedChunkId) && (
        <div className={styles.chunksGrid}>
          {chunks!.map((chunk) => (
            <div
              key={chunk.id}
              className={`${styles.chunkItem} ${expandedChunkId === chunk.id ? styles.expanded : ''}`}
            >
              <div className={styles.chunkHeader} onClick={() => toggleChunk(chunk.id)}>
                <div className={styles.chunkInfo}>
                  <span className={styles.chunkId}>Chunk #{chunk.id}</span>
                  <span className={styles.chunkTokens}>{calculateTokens(chunk.text)} tokens</span>
                </div>
                <div className={styles.chunkActions}>
                  <span className={styles.similarityScore}>
                    <span className={styles.similarityLabel}>Semelhança:</span>
                    <span
                      className={`${styles.similarityValue} ${
                        chunk.similarity > 90
                          ? styles.highSimilarity
                          : chunk.similarity > 80
                            ? styles.mediumSimilarity
                            : styles.lowSimilarity
                      }`}
                    >
                      {chunk.similarity}%
                    </span>
                  </span>
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      onChunkRemove(chunk.id)
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedChunkId === chunk.id && (
                <div className={styles.chunkContent}>
                  <p className={styles.chunkText}>{chunk.text}</p>
                  {chunk.pageNumber && (
                    <span className={styles.pageNumber}>Página {chunk.pageNumber}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentChunking
