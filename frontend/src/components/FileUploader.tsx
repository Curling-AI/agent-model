import { useLanguage } from "@/context/LanguageContext";
import { generateChunksFromFile } from "@/services/chunker";
import { useTranslation } from "@/translations";
import { Document } from "@/types/agent";
import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import { useNotifications } from "@/context/NotificationsProvider";
import { useAgentStore } from "@/store/agent";

interface FileDocument extends Document {
  type: 'file';
}

interface FileUploaderProps {
  supportedFileTypes?: string[];
  maxSize?: number // in bytes;
  isLoading?: boolean;
  handleLoading?: (isLoading: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
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

  const { addNotification } = useNotifications()

  const { agent, setAgent } = useAgentStore();

  const [isDragging, setIsDragging] = useState(false)
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
      addNotification(
        `Tipo de arquivo não suportado. Por favor, envie arquivos: ${supportedFileTypes.filter((type) => type.startsWith('.')).join(', ')}`,
      )
      return false
    }

    if (file.size > maxSize) {
      addNotification(`Arquivo muito grande. O tamanho máximo é ${formatFileSize(maxSize)}`)
      return false
    }

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
      }
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (files && files.length) {
      const file = files[0]
      if (validateFile(file)) {
        const result = await generateChunksFromFile(file);

        const newDocument: FileDocument = {
          id: Date.now(),
          type: 'file',
          name: file.name,
          content: result.chunks[0].pageContent,
          chunks: result.chunks,
          agentId: agent.id
        };
        
        setAgent({
          ...agent,
          documents: [...agent.documents, newDocument]
        });

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
