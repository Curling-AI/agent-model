import { useState } from 'react'
import { Download, FileText, File, FileImage, FileVideo, FileAudio, Archive } from 'lucide-react'

import { useConversationStore } from '@/store/conversation'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../translations'

interface DocumentMessageProps {
  messageId: number
  documentTitle?: string
  textContent?: string
  className?: string
  userId?: number
  agentId?: number
}

export function DocumentMessage({
  messageId,
  documentTitle,
  textContent,
  className = '',
  userId,
  agentId,
}: DocumentMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const language = useLanguage()
  const t = useTranslation(language)

  const { getMediaContent } = useConversationStore()

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return <FileImage className="h-8 w-8 text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <FileVideo className="h-8 w-8 text-purple-500" />
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return <FileAudio className="h-8 w-8 text-orange-500" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-8 w-8 text-yellow-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return 'border-red-200 bg-red-50 hover:bg-red-100'
      case 'doc':
      case 'docx':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
      case 'txt':
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'border-green-200 bg-green-50 hover:bg-green-100'
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100'
      case 'zip':
      case 'rar':
      case '7z':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }
  }

  const handleDownload = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(false)

    try {
      const { data } = await getMediaContent(messageId, userId, agentId)
      if (data && data.base64Data) {
        // Usar base64Data se disponível
        const extension = documentTitle?.split('.').pop() || 'bin'
        const mimeType = data.mimeType || 'application/octet-stream'

        const link = document.createElement('a')
        link.href = `data:${mimeType};base64,${data.base64Data}`
        link.download = documentTitle || `document-${messageId}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Erro ao baixar documento:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Container do documento */}
      <div className="group relative">
        <div
          className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${getFileTypeColor(documentTitle || '')} ${
            isLoading ? 'opacity-50' : 'hover:scale-105 hover:shadow-lg'
          }`}
          onClick={handleDownload}
        >
          {/* Conteúdo do documento */}
          <div className="flex items-center space-x-3 p-4">
            {/* Ícone do arquivo */}
            <div className="flex-shrink-0">{getFileIcon(documentTitle || '')}</div>

            {/* Informações do documento */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                  {documentTitle || 'Documento'}
                </h3>
                <div className="flex-shrink-0">
                  <Download className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-gray-600" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t.downloadDocument || 'Clique para baixar'}
              </p>
            </div>
          </div>

          {/* Overlay de loading */}
          {isLoading && (
            <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600"></div>
                <span className="text-sm text-gray-600">{t.downloading || 'Baixando...'}</span>
              </div>
            </div>
          )}

          {/* Overlay de erro */}
          {error && (
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-red-500">
              <div className="text-center text-white">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">
                  {t.errorDownloadingDocument || 'Erro ao baixar documento'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo textual */}
      {textContent && <div className="text-sm leading-relaxed">{textContent}</div>}
    </div>
  )
}
