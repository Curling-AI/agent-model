import { useState } from 'react'
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react'

import { useConversationStore } from '@/store/conversation'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../translations'

interface ImageMessageProps {
  messageId: number
  thumbnailBase64?: string
  textContent?: string
  className?: string
  userId?: number
  agentId?: number
  integration?: 'uazapi' | 'meta'
}

export function ImageMessage({
  messageId,
  thumbnailBase64,
  textContent,
  className = '',
  userId,
  agentId,
  integration,
}: ImageMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedHighQuality, setHasLoadedHighQuality] = useState(false)
  const [highQualityImageUrl, setHighQualityImageUrl] = useState<string>('')
  const [error, setError] = useState(false)
  const [imageBase64, setImageBase64] = useState<string>('')
  const language = useLanguage()
  const t = useTranslation(language)

  const { getMediaContent } = useConversationStore()

  const handleImageClick = async () => {
    if (hasLoadedHighQuality || isLoading) return

    setIsLoading(true)
    setError(false)

    try {
      const data = await getMediaContent(messageId, userId, agentId, integration)
      if (data.success) {
        if (integration === 'meta') {
          setHighQualityImageUrl(`data:${data.data.mimetype};base64,${data.data.base64Data}`)
          setImageBase64(data.data.base64Data)
        } else {
          setHighQualityImageUrl(data.data.fileURL)
          setImageBase64(data.data.base64Data)
        }
        setHasLoadedHighQuality(true)
      } else {
        setError(true)
      }
      return data.data.base64Data
    } catch (err) {
      console.error('Erro ao carregar imagem em alta qualidade:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
    return null
  }

  const handleDownload = async () => {
    try {
      let base64: string | null = null

      if (hasLoadedHighQuality) {
        // Se já está carregada, buscar o base64Data diretamente
        base64 = imageBase64
      } else {
        // Se não está carregada, usar handleImageClick
        base64 = await handleImageClick()
      }

      if (base64) {
        const link = document.createElement('a')
        link.href = `data:image/jpeg;base64,${base64}`
        link.download = `image-${messageId}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Erro ao baixar imagem:', err)
      setError(true)
    }
  }

  const imageUrl = hasLoadedHighQuality
    ? highQualityImageUrl
    : `data:image/jpeg;base64,${thumbnailBase64}`

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Container da imagem */}
      <div className="group relative">
        <div
          className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
            !hasLoadedHighQuality ? 'hover:scale-105 hover:shadow-lg' : ''
          }`}
          onClick={handleImageClick}
        >
          {/* Imagem */}
          {hasLoadedHighQuality || thumbnailBase64 ? (
            <img
              src={imageUrl}
              alt="Image message"
              className={`h-3xl w-3xl object-contain ${
                !hasLoadedHighQuality ? 'brightness-90 filter' : ''
              }`}
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex size-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                <p className="text-sm font-medium">{t.imageMessage || 'Imagem'}</p>
                <p className="text-xs opacity-75">{t.clickToLoad || 'Clique para carregar'}</p>
              </div>
            </div>
          )}
          {/* Overlay de loading */}
          {isLoading && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {/* Overlay de erro */}
          {error && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-red-500">
              <div className="text-center text-white">
                <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">{t.errorLoadingImage}</p>
              </div>
            </div>
          )}

          {/* Indicador de qualidade baixa */}
          {!hasLoadedHighQuality && !isLoading && !error && thumbnailBase64 && (
            <div className="bg-opacity-60 absolute top-2 right-2 rounded bg-black px-2 py-1 text-xs text-white">
              {t.lowQuality}
            </div>
          )}

          {/* Botão de download */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className="bg-opacity-60 hover:bg-opacity-80 absolute top-2 left-2 rounded bg-black p-1.5 text-white opacity-0 transition-all duration-200 group-hover:opacity-100"
            title={t.downloadImage}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo textual */}
      {textContent && <div className="text-sm leading-relaxed">{textContent}</div>}
    </div>
  )
}
