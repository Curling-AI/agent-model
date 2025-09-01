import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Agent, AgentDocument } from "@/types/agent";
import { Upload } from "lucide-react"
import React, { useRef, useState } from "react"

interface FileDocument extends AgentDocument {
  type: 'file';
}

interface FileUploaderProps {
  agent: Agent;
  onCreateDocument: (document: FileDocument) => void;
  onFileUpload: (file: File) => void;
  supportedFileTypes?: string[];
  maxSize?: number // in bytes;
  isLoading?: boolean;
  handleLoading?: (isLoading: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ agent, onCreateDocument, onFileUpload,
  supportedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  maxSize = 10 * 1024 * 1024,
  isLoading = false, }) => {

  const language = useLanguage();
  const t = useTranslation(language);

  const [fileDocument, setFileDocument] = useState<FileDocument>({ id: Date.now(), type: 'file', name: '', content: '', agentId: agent.id });

  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const validateFile = (file: File): boolean => {
    const fileType = file.type
    const fileExtension = `.${file.name.split('.').pop()}`

    if (!supportedFileTypes.includes(fileType) && !supportedFileTypes.includes(fileExtension)) {
      setError(
        `Tipo de arquivo não suportado. Por favor, envie arquivos: ${supportedFileTypes.filter((type) => type.startsWith('.')).join(', ')}`,
      )
      return false
    }

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. O tamanho máximo é ${formatFileSize(maxSize)}`)
      return false
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const { files } = e.dataTransfer
    if (files && files.length) {
      const file = files[0]
      if (validateFile(file)) {
        onFileUpload(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (files && files.length) {
      const file = files[0]
      if (validateFile(file)) {
        onFileUpload(file)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
    e.stopPropagation()
    if (fileInputRef.current && !isLoading) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={supportedFileTypes.join(',')}
        style={{ display: 'none' }}
        disabled={isLoading}
      />
      <label className="label">
        <span className="label-text font-medium">{t.documents}</span>
      </label>
      <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 mx-auto text-neutral mb-4" />
        <p className="text-neutral mb-2">{t.dragFilesHere}</p>
        <button className="btn btn-outline btn-sm" onClick={(e) => handleButtonClick(e)}
          style={{ cursor: 'pointer' }}>
          {t.selectFiles}
        </button>
        <p className="text-xs text-neutral mt-2">{t.fileTypes}</p>
      </div>
    </div>

  )
}

export default FileUploader
