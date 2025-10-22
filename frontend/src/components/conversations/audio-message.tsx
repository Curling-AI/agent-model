import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { useConversationStore } from '@/store/conversation'

interface AudioMessageProps {
  waveform?: string
  className?: string
  messageId: number
  durationSeconds?: number
  sender: 'human' | 'agent'
  audioBase64?: string
}

export function AudioMessage({ waveform, className, messageId, durationSeconds, sender, audioBase64 }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds || 0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { getMediaContent } = useConversationStore()
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [audioUrl, setAudioUrl] = useState<string>('')

  useEffect(() => {
    if (waveform) {
      try {
        // Decodifica o base64
        const binaryString = atob(waveform)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Converte para array de números (0-255)
        const data = Array.from(bytes)
        setWaveformData(data)
      } catch (error) {
        console.error('Erro ao decodificar waveform:', error)
        setWaveformData([])
      }
    }
  }, [waveform])

  // Função para calcular waveform a partir do áudio
  const calculateWaveform = async (audioUrl: string): Promise<number[]> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      
      audio.addEventListener('loadedmetadata', async () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const response = await fetch(audioUrl)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          const channelData = audioBuffer.getChannelData(0)
          const samples = 64 // Número de amostras para o waveform
          const blockSize = Math.floor(channelData.length / samples)
          const waveformData: number[] = []
          
          for (let i = 0; i < samples; i++) {
            let sum = 0
            const start = i * blockSize
            const end = Math.min(start + blockSize, channelData.length)
            
            for (let j = start; j < end; j++) {
              sum += Math.abs(channelData[j])
            }
            
            const average = sum / (end - start)
            // Normaliza para 0-255 e adiciona um mínimo para visualização
            let normalized = Math.max(10, Math.floor(average * 255 * 10))
            if (normalized > 128) {
              normalized = 128
            }
            waveformData.push(normalized)
          }
          
          resolve(waveformData)
        } catch (error) {
          console.error('Erro ao calcular waveform:', error)
          resolve([])
        }
      })
      
      audio.addEventListener('error', () => {
        resolve([])
      })
      
      audio.src = audioUrl
      audio.load()
    })
  }

  // Carrega automaticamente o áudio se for uma mensagem do agent com base64
  useEffect(() => {
    if (sender === 'agent' && audioBase64 && !hasLoaded && !isLoading) {
      loadAudioContent()
    }
  }, [sender, audioBase64, hasLoaded, isLoading])

  // Limpa o URL do objeto quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Atualiza o tempo atual do áudio quando o audioUrl muda
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      // Se o áudio carregou uma duração válida, usa ela, senão mantém o valor do metadata
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [audioUrl])

  const loadAudioContent = async () => {
    if (hasLoaded || isLoading) return
    
    setIsLoading(true)
    try {
      if (sender === 'agent' && audioBase64) {
        // Para mensagens do agent, usa o base64 diretamente
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
        setHasLoaded(true)
        
        // Calcula o waveform se não tiver um waveform pré-definido
        if (!waveform) {
          const calculatedWaveform = await calculateWaveform(audioUrl)
          setWaveformData(calculatedWaveform)
        }
      } else {
        // Para mensagens human, busca do servidor
        const data = await getMediaContent(messageId)
        if (data.success) {
          setAudioUrl(data.data.fileURL)
          setHasLoaded(true)
        }
      }
      
      // Reset do tempo atual quando carrega novo áudio
      setCurrentTime(0)
    } catch (error) {
      console.error('Erro ao carregar áudio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = async () => {
    // Se ainda não carregou o áudio e não é uma mensagem do agent, carrega primeiro
    if (!hasLoaded && sender !== 'agent') {
      await loadAudioContent()
      // Aguarda um pouco para o áudio ser carregado e então reproduz
      setTimeout(() => {
        const audio = audioRef.current
        if (audio) {
          audio.play()
          setIsPlaying(true)
        }
      }, 100)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return

    // Se ainda não carregou o áudio e não é uma mensagem do agent, carrega primeiro
    if (!hasLoaded && sender !== 'agent') {
      await loadAudioContent()
      return
    }

    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={`flex flex-col space-y-2 ${className || ''}`}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" />}
      
      {/* Waveform visual - maior verticalmente */}
      {waveformData.length > 0 && (
        <div
          className="flex h-8 items-center space-x-px cursor-pointer"
          onClick={handleSeek}
        >
          {waveformData.map((value, index) => {
            const height = (value / 255) * 200
            const isActive = (index / waveformData.length) * 100 <= progress
            
            return (
              <div
                key={index}
                className="w-0.5 bg-base-content/50 transition-colors"
                style={{ 
                  height: `${Math.max(height, 12)}%`, 
                  backgroundColor: isActive ?  sender === 'agent' ? 'var(--color-base-300)' : 'var(--color-primary)' : 'var(--color-base-content/50)',
                }}
              />
            )
          })}
        </div>
      )}

      {/* Barra de progresso simples (fallback) - maior */}
      {waveformData.length === 0 && (
        <div
          className="h-2 bg-base-300 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Controles na parte de baixo - responsivo para mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="btn btn-outline btn-xs h-7 w-7 p-0 touch-manipulation disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>

          {/* Tempo */}
          <div className="text-xs text-base-content/70 min-w-0">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume - responsivo */}
        <div className="flex items-center space-x-2 sm:space-x-1">
          <Volume2 className="h-3 w-3 text-base-content/70 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!hasLoaded}
            className="w-16 sm:w-12 h-1 bg-base-300 rounded-lg appearance-none cursor-pointer touch-manipulation disabled:opacity-50 border-base-content/50 border" 

          />
        </div>
      </div>
    </div>
  )
}
