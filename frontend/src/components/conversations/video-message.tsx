import { useState, useRef, useEffect } from 'react'
import { Download, Video as VideoIcon, Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react'

import { useConversationStore } from '@/store/conversation'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../translations'

interface VideoMessageProps {
  messageId: number
  thumbnailBase64?: string
  textContent?: string
  className?: string
  userId?: number
  agentId?: number
}

export function VideoMessage({
  messageId,
  thumbnailBase64,
  textContent,
  className = '',
  userId,
  agentId,
}: VideoMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedHighQuality, setHasLoadedHighQuality] = useState(false)
  const [highQualityVideoUrl, setHighQualityVideoUrl] = useState<string>('')
  const [error, setError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [videoBase64, setVideoBase64] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  const language = useLanguage()
  const t = useTranslation(language)

  const videoRef = useRef<HTMLVideoElement>(null)

  const { getMediaContent } = useConversationStore()

  const handleVideoClick = async () => {
    if (hasLoadedHighQuality || isLoading) return videoBase64

    setIsLoading(true)
    setError(false)

    try {
      const data = await getMediaContent(messageId, userId, agentId)
      if (data.success && data.data.fileURL) {
        setHighQualityVideoUrl(data.data.fileURL)
        setHasLoadedHighQuality(true)
        setVideoBase64(data.data.base64Data)
      } else {
        setError(true)
      }
      return data.data.base64Data
    } catch (err) {
      console.error('Erro ao carregar vídeo em alta qualidade:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
    return null
  }

  const handleDownload = async () => {
    const base64 = await handleVideoClick()
    if (base64) {
      const link = document.createElement('a')
      link.href = `data:video/mp4;base64,${base64}`
      link.download = `video-${messageId}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      setError(true)
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      // Garantir que o vídeo não esteja mutado quando iniciar a reprodução
      videoRef.current.muted = isMuted
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((error) => {
          console.error('Erro ao reproduzir vídeo:', error)
          // Se falhar por causa de autoplay, tentar com muted
          if (error.name === 'NotAllowedError') {
            videoRef.current!.muted = true
            setIsMuted(true)
            videoRef
              .current!.play()
              .then(() => {
                setIsPlaying(true)
              })
              .catch(console.error)
          }
        })
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    const newMutedState = !isMuted
    videoRef.current.muted = newMutedState
    videoRef.current.volume = newMutedState ? 0 : 1
    setIsMuted(newMutedState)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return

    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressBarWidth = rect.width
    const clickTime = Math.max(0, Math.min(duration, (clickX / progressBarWidth) * duration))

    videoRef.current.currentTime = clickTime
    setCurrentTime(clickTime)
  }

  // Funções para controles mobile
  const showControlsTemporarily = () => {
    setShowControls(true)

    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }

    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    setControlsTimeout(timeout)
  }

  const handleVideoTouch = () => {
    if (isMobile) {
      showControlsTemporarily()
    } else {
      setShowControls(!showControls)
    }
  }

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [controlsTimeout])

  // Configurar o vídeo quando carregado e reproduzir automaticamente
  useEffect(() => {
    if (videoRef.current && hasLoadedHighQuality) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = isMuted ? 0 : 1

      // Reproduzir automaticamente após carregar
      const playVideo = async () => {
        try {
          await videoRef.current!.play()
          setIsPlaying(true)
        } catch (error: any) {
          console.error('Erro ao reproduzir vídeo:', error)
          // Se falhar por causa de autoplay, tentar com muted
          if (error.name === 'NotAllowedError') {
            videoRef.current!.muted = true
            setIsMuted(true)
            try {
              await videoRef.current!.play()
              setIsPlaying(true)
            } catch (mutedError) {
              console.error('Erro ao reproduzir vídeo muted:', mutedError)
            }
          }
        }
      }

      playVideo()
    }
  }, [hasLoadedHighQuality, isMuted])

  const videoUrl = hasLoadedHighQuality
    ? highQualityVideoUrl
    : `data:video/mp4;base64,${thumbnailBase64}`

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Container do vídeo */}
      <div className="group relative">
        <div
          className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
            !hasLoadedHighQuality ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
          }`}
          onClick={!hasLoadedHighQuality ? handleVideoClick : undefined}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Vídeo */}
          {hasLoadedHighQuality ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="h-auto w-full object-contain sm:max-w-sm"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnd}
              onError={() => setError(true)}
              muted={isMuted}
              preload="metadata"
              onTouchStart={handleVideoTouch}
              onClick={handleVideoTouch}
            />
          ) : (
            <img
              src={`data:image/jpeg;base64,${thumbnailBase64}`}
              alt="Video thumbnail"
              className={`h-xl w-xl object-contain sm:max-w-sm ${
                !hasLoadedHighQuality ? 'brightness-90 filter' : ''
              }`}
              onError={() => setError(true)}
            />
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
                <VideoIcon className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Erro ao carregar vídeo</p>
              </div>
            </div>
          )}

          {/* Botão de play para thumbnail */}
          {!hasLoadedHighQuality && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-opacity-60 cursor-pointer rounded-full bg-black p-4">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* Controles do vídeo */}
          {hasLoadedHighQuality && !isLoading && !error && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="bg-opacity-60 cursor-pointer rounded-full bg-black p-3 sm:p-4">
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white sm:h-8 sm:w-8" onClick={togglePlayPause} />
                ) : (
                  <Play className="h-6 w-6 text-white sm:h-8 sm:w-8" onClick={togglePlayPause} />
                )}
              </div>
            </div>
          )}

          {/* Botão de download */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className={`bg-opacity-60 hover:bg-opacity-80 absolute top-2 left-2 cursor-pointer rounded bg-black p-1.5 text-white transition-all duration-200 ${
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title={t.downloadVideo}
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Botão de áudio */}
          {hasLoadedHighQuality && !isLoading && !error && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleMute()
              }}
              className={`bg-opacity-60 hover:bg-opacity-80 absolute top-2 left-12 cursor-pointer rounded bg-black p-1.5 text-white transition-all duration-200 ${
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title={isMuted ? t.unmute : t.mute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          {/* Barra de progresso */}
          {hasLoadedHighQuality && !isLoading && !error && (
            <div
              className={`bg-opacity-60 absolute right-0 bottom-0 left-0 cursor-pointer bg-black px-2 py-1 text-xs text-white transition-opacity duration-200 ${
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">{formatTime(currentTime)}</span>
                <span className="text-xs">{formatTime(duration)}</span>
              </div>
              <div
                className="mt-1 h-1 w-full cursor-pointer rounded-full bg-gray-600 transition-colors duration-200 hover:bg-gray-500"
                onClick={handleProgressClick}
              >
                <div
                  className="h-1 rounded-full bg-white transition-all duration-200 hover:bg-blue-400"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
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
