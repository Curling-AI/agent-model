import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from '@/translations'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  isOpen: boolean
  onClose: () => void
}

interface FilePreview {
  file: File
  preview: string
  type: 'image' | 'video' | 'document'
}

export function FileUpload({ onFileSelect, disabled = false, isOpen, onClose }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const language = useLanguage()
  const t = useTranslation(language)

  if (!isOpen) return null

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles: FilePreview[] = []

    fileArray.forEach((file) => {
      // Validar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo permitido: 2MB`)
        return
      }

      const type = getFileType(file)
      let preview = ''

      if (type === 'image') {
        preview = URL.createObjectURL(file)
      } else if (type === 'video') {
        preview = URL.createObjectURL(file)
      }

      validFiles.push({ file, preview, type })
    })

    setSelectedFiles(validFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      for (const filePreview of selectedFiles) {
        await onFileSelect(filePreview.file)
      }
      setSelectedFiles([])
      toast.success(t.fileUploadedSuccessfully)
    } catch (error) {
      toast.error(t.errorUploadingFile)
    } finally {
      setUploading(false)
    }
  }

  const openFileDialog = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  return (
    <div className="file-upload-container absolute bottom-full right-0 mb-2 w-80 rounded-lg border border-base-300 bg-base-100 shadow-lg sm:w-96">
      {/* Header */}
      <div className="border-base-300 flex items-center justify-between border-b p-3">
        <h3 className="text-sm font-semibold">{t.sendFile}</h3>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Área de upload */}
      <div className="p-4">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <Upload className={`h-8 w-8 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary">{t.clickToSelect}</span> {t.orDragFilesHere}
            </div>
            <div className="text-xs text-gray-500">
              {t.supportsImagesVideosDocumentsMax2MB}
            </div>
          </div>
        </div>
      </div>

      {/* Preview dos arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-base-300 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{t.selectedFiles} ({selectedFiles.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles([])}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-1" />
                {t.clear}
              </Button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedFiles.map((filePreview, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {filePreview.file.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(filePreview.file.size)}
                      </span>
                    </div>
                    
                    {/* Preview para imagens */}
                    {filePreview.type === 'image' && filePreview.preview && (
                      <div className="mt-2">
                        <img
                          src={filePreview.preview}
                          alt={filePreview.file.name}
                          className="h-12 w-12 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Botão de upload */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={uploading}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="min-w-[100px]"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t.sending}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t.send}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}