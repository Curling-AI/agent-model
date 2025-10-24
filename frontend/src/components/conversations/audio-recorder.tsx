import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Send, Trash2, Volume2, X } from 'lucide-react'

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void
  onClose: () => void
  disabled?: boolean
  className?: string
  show?: boolean
}

export function AudioRecorder({
  onSendAudio,
  onClose,
  disabled = false,
  className = '',
  show = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [recordingTime, setRecordingTime] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const recordingStartTimeRef = useRef<number>(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (show) {
      startRecording()
    }
  }, [show])

  // Limpa recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [audioUrl])

  // Atualiza o tempo de reprodução
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
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

  // Calcula waveform do áudio gravado
  const calculateWaveform = async (audioBlob: Blob): Promise<number[]> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(audioBlob)

      audio.addEventListener('loadedmetadata', async () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const response = await fetch(url)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

          const channelData = audioBuffer.getChannelData(0)
          const samples = 64
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
            let normalized = Math.max(10, Math.floor(average * 255 * 10))
            if (normalized > 128) {
              normalized = 128
            }
            waveformData.push(normalized)
          }

          URL.revokeObjectURL(url)
          resolve(waveformData)
        } catch (error) {
          console.error('Erro ao calcular waveform:', error)
          URL.revokeObjectURL(url)
          resolve([])
        }
      })

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        resolve([])
      })

      audio.src = url
      audio.load()
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)

        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Calcula waveform
        const waveform = await calculateWaveform(audioBlob)
        setWaveformData(waveform)

        // Para o stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      recordingStartTimeRef.current = Date.now()

      // Atualiza o tempo de gravação a cada 100ms
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000))
      }, 100)
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        recordingStartTimeRef.current = Date.now() - recordingTime * 1000
      } else {
        mediaRecorderRef.current.pause()
      }
      setIsPaused(!isPaused)
    }
  }

  const playRecordedAudio = () => {
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return

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

  const sendAudio = () => {
    if (recordedAudio) {
      onSendAudio(recordedAudio, duration)
      resetRecording()
      onClose()
    }
  }

  const resetRecording = () => {
    setRecordedAudio(null)
    setAudioUrl('')
    setDuration(0)
    setCurrentTime(0)
    setIsPlaying(false)
    setRecordingTime(0)
    setWaveformData([])

    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Container principal - similar à textarea */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="textarea textarea-bordered flex min-h-[60px] w-full items-center justify-center">
          {!recordedAudio ? (
            /* Estado de gravação */
            isRecording && (
              <div className="flex w-full items-center space-x-2">
                <div className="bg-error h-2 w-2 animate-pulse rounded-full" />
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            )
          ) : (
            /* Estado de preview do áudio */
            <div className="flex w-full items-center space-x-2">
              {/* Controles de reprodução */}
              <button onClick={playRecordedAudio} className="btn btn-outline btn-xs">
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>

              {/* Waveform */}
              {waveformData.length > 0 && (
                <div
                  className="hidden cursor-pointer items-center space-x-px md:flex md:h-6"
                  onClick={handleSeek}
                >
                  {waveformData.map((value, index) => {
                    const height = (value / 255) * 100
                    const isActive = (index / waveformData.length) * 100 <= progress

                    return (
                      <div
                        key={index}
                        className="bg-primary/50 w-0.5 transition-colors"
                        style={{
                          height: `${Math.max(height, 8)}%`,
                          backgroundColor: isActive
                            ? 'var(--color-primary)'
                            : 'var(--color-primary/50)',
                        }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Barra de progresso (fallback) */}
              {waveformData.length === 0 && (
                <div className="bg-base-300 h-2 cursor-pointer rounded-full" onClick={handleSeek}>
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="text-base-content/70 text-xs">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <Volume2 className="text-base-content/70 h-3 w-3" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="bg-base-300 h-1 w-12 cursor-pointer appearance-none rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
        {/* Botões de ação - similar aos da textarea */}
        {!recordedAudio && (
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button onClick={onClose} className="btn btn-ghost btn-xs">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {!recordedAudio ? (
        !isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="btn btn-primary btn-circle"
          >
            <Mic className="h-4 w-4" />
          </button>
        ) : (
          /* Estado de gravação */
          <div className="flex items-center space-x-2">
            <button onClick={pauseRecording} className="btn btn-outline btn-circle">
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button onClick={stopRecording} className="btn btn-error btn-circle">
              <Square className="h-4 w-4" />
            </button>
          </div>
        )
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              resetRecording()
              onClose()
            }}
            className="btn btn-outline btn-circle"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              sendAudio()
              onClose()
            }}
            disabled={disabled}
            className="btn btn-primary btn-circle"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
