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
}

export function ImageMessage({ 
  messageId, 
  thumbnailBase64, 
  textContent,
  className = '' 
}: ImageMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedHighQuality, setHasLoadedHighQuality] = useState(false)
  const [highQualityImageUrl, setHighQualityImageUrl] = useState<string>('')
  const [error, setError] = useState(false)
  const language = useLanguage()
  const t = useTranslation(language)
  
  const { getMediaContent } = useConversationStore()

  const handleImageClick = async () => {
    if (hasLoadedHighQuality || isLoading) return

    setIsLoading(true)
    setError(false)

    try {
      const data = await getMediaContent(messageId)
      if (data.success && data.data.fileURL) {
        setHighQualityImageUrl(data.data.fileURL)
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
    const base64 = await handleImageClick()
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
  }

  const imageUrl = hasLoadedHighQuality ? highQualityImageUrl : `data:image/jpeg;base64,${thumbnailBase64}`

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Container da imagem */}
      <div className="relative group">
        <div 
          className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
            !hasLoadedHighQuality ? 'hover:scale-105 hover:shadow-lg' : ''
          }`}
          onClick={handleImageClick}
        >
          {/* Imagem */}
          <img 
            src={imageUrl}
            alt="Image message"
            className={`w-3xl h-3xl object-contain ${
              !hasLoadedHighQuality ? 'filter brightness-90' : ''
            }`}
            onError={() => setError(true)}
          />
          
          {/* Overlay de loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          
          {/* Overlay de erro */}
          {error && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{t.errorLoadingImage}</p>
              </div>
            </div>
          )}
          
          {/* Indicador de qualidade baixa */}
          {!hasLoadedHighQuality && !isLoading && !error && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {t.lowQuality}
            </div>
          )}
          
          {/* Botão de download */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className="absolute top-2 left-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1.5 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
            title={t.downloadImage}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Conteúdo textual */}
      {textContent && (
        <div className="text-sm leading-relaxed">
          {textContent}
        </div>
      )}
    </div>
  )
}
