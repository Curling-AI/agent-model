const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-ms-wmv']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/html',
  'text/csv',
  'application/xml',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

export const validateFile = (
  mimetype: string,
  size: number,
): { valid: boolean; error?: string } => {
  const allAllowedTypes = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
  ]

  if (!allAllowedTypes.includes(mimetype)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado',
    }
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Limite: 10MB',
    }
  }

  return { valid: true }
}

export const getFileType = (mimetype: string): 'image' | 'video' | 'document' | 'audio' => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'image'
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return 'document'
}

export const getFileExtension = (mimetype?: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',

    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',

    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/m4a': 'm4a',

    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',

    'text/plain': 'txt',
    'text/csv': 'csv',
    'text/html': 'html',
  }
  return extensions[mimetype || ''] || 'file'
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}
