import { useState, useEffect, useRef } from 'react'
import {
  Search,
  MoreVertical,
  Zap,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Eye,
  Archive,
  Clock,
  RefreshCw,
  Paperclip,
  Smile,
  Filter as FilterIcon,
  X,
  BarChart3,
  Mic,
} from 'lucide-react'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { FileUpload } from '@/components/conversations/file-upload'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../translations'
import ConversationStats from '@/components/conversations/ConversationStats'
import ConversationSkeleton from '@/components/conversations/ConversationSkeleton'
import { AudioMessage } from '@/components/conversations/audio-message'
import { AudioRecorder } from '@/components/conversations/audio-recorder'
import { ImageMessage } from '@/components/conversations/image-message'
import { VideoMessage } from '@/components/conversations/video-message'
import { DocumentMessage } from '@/components/conversations/document-message'
import { Conversation, ConversationMessage } from '@/types/conversation'
import { useConversationStore } from '@/store/conversation'
import { useOrganizationStore } from '@/store/organization'
import { formatDistanceStrict, formatRelative } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { useCrmColumnStore } from '@/store/crm-column'

const Conversations = () => {
  const language = useLanguage()
  const t = useTranslation(language)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState<ConversationMessage | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [quickReplies, setQuickReplies] = useState(false)
  const [isTyping] = useState(false)

  const [channelFilter, setChannelFilter] = useState('all')
  const [showStats, setShowStats] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)

  // Refs para scroll automático
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    isLoading,
    listConversations,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    channel,
    sendMessage: sendMessageStore,
    sendMedia,
    changeConversationMode,
  } = useConversationStore()
  const [unread, setUnread] = useState<{ [key: number]: number }>({})
  const { organization } = useOrganizationStore()
  const organizationId = organization.id
  const userId = 1

  const { fetchCrmColumns, crmColumns } = useCrmColumnStore()
  useEffect(() => {
    fetchCrmColumns()
  }, [fetchCrmColumns])

  useEffect(() => {
    listConversations(organizationId).then((conversations) => {
      conversations.forEach((conversation) => {
        if (conversation.mode !== 'agent') {
          const lastHumanMessage = [...conversation.messages]
            .reverse()
            .findIndex((message: ConversationMessage) => message.sender === 'human')
          const lastMemberMessage = [...conversation.messages]
            .reverse()
            .findIndex((message: ConversationMessage) =>
              ['member', 'agent'].includes(message.sender),
            )
          if (lastMemberMessage > lastHumanMessage) {
            setUnread((prev) => ({
              ...prev,
              [conversation.id]: lastMemberMessage,
            }))
          }
        }
      })
      subscribeToUpdates(conversations, (payload: any) => {
        // Atualizar contador de mensagens não lidas
        if (payload.new.conversation_id !== selectedConversation?.id) {
          setUnread((prev) => ({
            ...prev,
            [payload.new.conversation_id]: (prev[payload.new.conversation_id] || 0) + 1,
          }))
        }
      })
    })
  }, [listConversations, organizationId, subscribeToUpdates])

  // Effect para cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (channel) {
        unsubscribeFromUpdates(channel)
      }
    }
  }, [channel, unsubscribeFromUpdates])

  // Effect para sincronizar a conversa selecionada com as atualizações do store
  useEffect(() => {
    if (selectedConversation) {
      const updatedConversation = conversations.find((c) => c.id === selectedConversation.id)
      if (updatedConversation) {
        // Verificar se há novas mensagens comparando o número de mensagens primeiro (mais eficiente)
        if (updatedConversation.messages.length !== selectedConversation.messages.length) {
          setSelectedConversation(updatedConversation)
        } else {
          // Se o número é igual, verificar se há mensagens diferentes pelos IDs
          const currentMessageIds = selectedConversation.messages.map((m) => m.id).sort()
          const updatedMessageIds = updatedConversation.messages.map((m) => m.id).sort()

          if (JSON.stringify(currentMessageIds) !== JSON.stringify(updatedMessageIds)) {
            setSelectedConversation(updatedConversation)
          }
        }
      }
    }
  }, [conversations, selectedConversation])

  // Respostas rápidas
  const quickReplyOptions = [
    t.quickReply1,
    t.quickReply2,
    t.quickReply3,
    t.quickReply4,
    t.quickReply5,
  ]

  const filteredConversations = conversations.filter((conv: Conversation) => {
    // Filtro por status
    const statusMatch = filter === 'all' || conv.lead.status === Number(filter)

    // Filtro por canal
    const channelMatch = channelFilter === 'all' || conv.lead.source === channelFilter

    // Filtro por busca
    const searchMatch =
      searchTerm === '' ||
      conv.lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages[conv.messages.length - 1].content
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    return statusMatch && channelMatch && searchMatch
  })

  const sendMessage = () => {
    if (newMessage?.content.trim() && selectedConversation) {
      sendMessageStore(
        selectedConversation.agent.id,
        userId,
        newMessage.content,
        selectedConversation.lead.phone,
        selectedConversation.id,
        selectedConversation.integration ?? 'uazapi',
      )
      setNewMessage(null)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return

    try {
      // Converter arquivo para base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const mediaData = base64.split(',')[1] // Remove o prefixo data:image/...;base64,

        // Determinar o tipo de arquivo
        let fileType = 'document'
        if (file.type.startsWith('image/')) {
          fileType = 'image'
        } else if (file.type.startsWith('video/')) {
          fileType = 'video'
        }

        await sendMedia(
          selectedConversation.agent.id,
          userId,
          selectedConversation.lead.phone,
          mediaData,
          file.name,
          fileType,
          selectedConversation.id,
          file.type,
          selectedConversation.integration ?? 'uazapi',
        )
      }
      reader.readAsDataURL(file)
      setShowFileUpload(false)
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
    }
  }

  const handleAudioSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedConversation) return

    try {
      // Converter áudio para base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const mediaData = base64.split(',')[1] // Remove o prefixo data:audio/...;base64,

        // TODO: duration pode ser usado para metadata futura do áudio
        console.log('Duração do áudio:', duration, 'segundos')
        await sendMedia(
          selectedConversation.agent.id,
          userId,
          selectedConversation.lead.phone,
          mediaData,
          `audio_${Date.now()}.webm`,
          'audio',
          selectedConversation.id,
        )
      }
      reader.readAsDataURL(audioBlob)
      setShowAudioRecorder(false)
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (newMessage) {
      setNewMessage({
        ...newMessage,
        content: newMessage.content + emoji,
      })
    } else if (selectedConversation) {
      setNewMessage({
        id: 0,
        conversationId: selectedConversation.id,
        sender: 'human' as const,
        content: emoji,
        timestamp: new Date(),
        metadata: {},
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agent':
        return 'badge-success'
      case 'human':
        return 'badge-neutral'
      default:
        return 'badge-neutral'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agent':
        return t.agent
      case 'human':
        return t.human
      default:
        return t.unknown
    }
  }

  const calculateResponseTime = (conversation: Conversation) => {
    const reversedMessages = [...conversation.messages].reverse()
    const lastAgentMessage = reversedMessages.find((message) => message.sender === 'agent')
    const firstHumanMessage = reversedMessages.find((message) => message.sender === 'human')
    if (!lastAgentMessage || !firstHumanMessage) {
      return
    }
    if (lastAgentMessage.timestamp < firstHumanMessage.timestamp) {
      return
    }
    const responseTime = formatDistanceStrict(
      new Date(lastAgentMessage.timestamp),
      new Date(firstHumanMessage.timestamp),
      { locale: language.language === 'pt' ? ptBR : enUS },
    )
    return responseTime
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="text-error h-4 w-4" />
      case 'medium':
        return <AlertCircle className="text-warning h-4 w-4" />
      case 'low':
        return <CheckCircle className="text-success h-4 w-4" />
      default:
        return <Clock className="text-neutral h-4 w-4" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getColumnName = (columnId: number) => {
    const column = crmColumns.find((column) => column.id === columnId)
    return column ? (language.language == 'pt' ? column.titlePt : column.titleEn) : ''
  }

  const getProfileImage = (conversation: Conversation) => {
    if (conversation.lead.source === 'whatsapp') {
      return (
        [...conversation.messages].reverse().find((message) => message.sender === 'human')?.metadata
          ?.chat?.imagePreview ?? ''
      )
    }
    return ''
  }

  // Função para fazer scroll automático para o final
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
      if (mobileMessagesContainerRef.current) {
        mobileMessagesContainerRef.current.scrollTop =
          mobileMessagesContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    if (selectedConversation) {
      setUnread((prev) => ({
        ...prev,
        [conversation.id]: 0,
        [selectedConversation.id]: 0,
      }))
    } else {
      setUnread((prev) => ({
        ...prev,
        [conversation.id]: 0,
      }))
    }
    setSelectedConversation(conversation)
  }

  const handleSwitchConversationMode = async (conversation: Conversation) => {
    const newMode = conversation.mode === 'agent' ? 'human' : 'agent'
    await changeConversationMode(conversation.id, newMode)
    if (selectedConversation) {
      setSelectedConversation((prev) =>
        prev?.id === conversation.id ? { ...prev, mode: newMode } : prev,
      )
    }
  }

  // Effect para scroll automático quando uma conversa é selecionada
  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom()
    }
  }, [selectedConversation])

  // Effect para scroll automático quando novas mensagens chegam
  useEffect(() => {
    if (selectedConversation && !isTyping) {
      scrollToBottom()
    }
  }, [selectedConversation?.messages, isTyping])

  // Effect adicional para scroll quando a conversa selecionada é atualizada
  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom()
    }
  }, [selectedConversation])

  // Effect para fechar o emoji picker quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as HTMLElement
        if (!target.closest('.emoji-picker-container')) {
          setShowEmojiPicker(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const getMessageComponent = (
    message: ConversationMessage,
    selectedConversation: Conversation,
  ) => {
    if (
      message.metadata?.message?.messageType === 'ImageMessage' ||
      message.metadata?.messageType === 'ImageMessage' ||
      message.metadata?.message?.type === 'image'
    ) {
      return (
        <ImageMessage
          messageId={message.id}
          thumbnailBase64={
            message.metadata.message?.content?.JPEGThumbnail ||
            message.metadata?.content?.JPEGThumbnail
          }
          textContent={message.content}
          userId={userId}
          agentId={selectedConversation.agent.id}
          integration={selectedConversation.integration ?? 'uazapi'}
        />
      )
    }
    if (
      message.metadata?.message?.messageType === 'VideoMessage' ||
      message.metadata?.messageType === 'VideoMessage' ||
      message.metadata?.message?.type === 'video'
    ) {
      return (
        <VideoMessage
          messageId={message.id}
          thumbnailBase64={
            message.metadata.message?.content?.JPEGThumbnail ||
            message.metadata?.content?.JPEGThumbnail
          }
          textContent={message.content}
          userId={userId}
          agentId={selectedConversation.agent.id}
          integration={selectedConversation.integration ?? 'uazapi'}
        />
      )
    }
    if (
      message.metadata?.message?.messageType === 'DocumentMessage' ||
      message.metadata?.messageType === 'DocumentMessage' ||
      message.metadata?.message?.type === 'document'
    ) {
      return (
        <DocumentMessage
          messageId={message.id}
          documentTitle={
            message.metadata.message?.content?.title || message.metadata?.content?.fileName
          }
          textContent={message.content}
          userId={userId}
          agentId={selectedConversation.agent.id}
          integration={selectedConversation.integration ?? 'uazapi'}
        />
      )
    }
    if (
      message.metadata?.message?.messageType === 'AudioMessage' ||
      message.metadata?.type === 'audio' ||
      message.metadata?.messageType === 'AudioMessage' ||
      message.metadata?.message?.type === 'audio'
    ) {
      return (
        <AudioMessage
          messageId={message.id}
          waveform={
            message.metadata.message?.content?.waveform || message.metadata?.content?.waveform
          }
          durationSeconds={
            message.metadata.message?.content?.seconds || message.metadata?.content?.seconds
          }
          sender={message.sender}
          audioBase64={message.sender === 'agent' ? message.metadata?.output : undefined}
          userId={userId}
          agentId={selectedConversation.agent.id}
          integration={selectedConversation.integration ?? 'uazapi'}
        />
      )
    }
    return <p className="text-sm leading-relaxed">{message.content}</p>
  }

  return (
    <div className="bg-base-100 flex h-[calc(100vh-8rem)] flex-col">
      {/* Estatísticas */}
      {showStats && (
        <div className="border-base-300 border-b p-4">
          <ConversationStats conversations={conversations} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Conversas */}
        <div className="bg-base-100 border-base-300 flex w-full flex-col border-r md:w-1/3">
          {/* Header */}
          <div className="border-base-300 bg-base-100 border-b p-4">
            <div className="mb-4 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
              <div className="flex items-center space-x-2">
                <h2 className="mobile-text-lg font-bold md:text-xl">{t.conversationsTitle}</h2>
                {isLoading ? (
                  <div className="badge badge-neutral badge-sm">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  </div>
                ) : (
                  <div className="badge badge-primary badge-sm">{filteredConversations.length}</div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`btn btn-ghost btn-sm ${showStats ? 'btn-active' : ''}`}
                  title={t.stats}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-ghost btn-sm ${showFilters ? 'btn-active' : ''}`}
                >
                  <FilterIcon className="h-4 w-4" />
                </button>
                <button className="btn btn-ghost btn-sm">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filtros Avançados */}
            {showFilters && (
              <div className="bg-base-200 mb-4 space-y-3 rounded-lg p-3">
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    disabled={isLoading}
                    className="select select-bordered select-sm flex-1"
                  >
                    <option key="all" value="all">
                      {t.allStatus}
                    </option>
                    {crmColumns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {getColumnName(column.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  disabled={isLoading}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="all">{t.allChannels}</option>
                  <option value="whatsapp">{t.whatsapp}</option>
                </select>
              </div>
            )}

            <div className="relative">
              <Search className="text-neutral absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isLoading ? t.loading : t.searchConversations}
                disabled={isLoading}
                className="input input-bordered input-sm w-full pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform"
                >
                  <X className="text-neutral h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 flex-1 overflow-x-hidden overflow-y-auto">
            {isLoading ? (
              // Skeleton loading state
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, index) => (
                  <ConversationSkeleton key={index} />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="text-neutral mx-auto mb-2 h-12 w-12" />
                  <p className="text-neutral text-sm">{t.noConversationsFound}</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation as Conversation)}
                  className={`conversation-card border-base-300 hover:bg-base-200 cursor-pointer border-b p-4 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : ''
                  } ${conversation.lead.priority === 'high' ? 'border-l-error urgent-indicator border-l-4' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center overflow-hidden rounded-full font-semibold">
                        {getProfileImage(conversation) ? (
                          <img
                            src={getProfileImage(conversation)}
                            alt="Whatsapp"
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center overflow-hidden rounded-full font-semibold">
                            {conversation.lead.name
                              .split(' ')
                              .map((name) => name[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      {conversation.mode === 'agent' && (
                        <div className="bg-success absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white"></div>
                      )}
                      {conversation.lead.priority === 'high' && (
                        <div className="bg-error absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
                          <Zap className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="truncate text-sm font-semibold">
                            {conversation.lead.name}
                          </h3>
                          {getPriorityIcon(conversation.lead.priority)}
                        </div>
                        <span className="text-neutral text-xs">
                          {formatRelative(
                            new Date(
                              conversation.messages[conversation.messages.length - 1].timestamp,
                            ),
                            new Date(),
                            { locale: language.language === 'pt' ? ptBR : enUS },
                          )}
                        </span>
                      </div>

                      <p className="text-neutral mb-2 truncate text-sm">
                        {conversation.messages[conversation.messages.length - 1].content}
                      </p>

                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`badge badge-xs py-2 ${getStatusColor(conversation.mode)}`}
                          >
                            {getStatusText(conversation.mode)}
                          </span>
                          <span
                            className={`badge badge-xs py-2`}
                            style={{
                              backgroundColor: crmColumns.find(
                                (column) => column.id === conversation.lead.status,
                              )?.color,
                            }}
                          >
                            {getColumnName(conversation.lead.status)}
                          </span>
                          {conversation.tags.some((tag) => tag.name === 'qualified') && (
                            <span className="badge badge-xs badge-info py-2">{t.qualified}</span>
                          )}
                          {conversation.mode === 'agent' && (
                            <span className="text-neutral text-xs">
                              {calculateResponseTime(conversation) ?? ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {unread[conversation.id] > 0 && (
                            <span className="badge badge-xs badge-primary bg-primary text-primary-content py-2">
                              {unread[conversation.id]}
                            </span>
                          )}
                          {getChannelIcon(conversation.lead.source)}
                        </div>
                      </div>

                      {/* Agente */}
                      <div className="flex items-center justify-between">
                        <span className="text-neutral text-xs">{conversation.agent.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área do Chat - Desktop */}
        <div className="hidden flex-1 flex-col overflow-hidden md:flex">
          {selectedConversation ? (
            <>
              {/* Header do Chat */}
              <div className="border-base-300 bg-base-100 border-b p-4">
                <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="mobile-avatar bg-primary text-primary-content flex items-center justify-center overflow-hidden rounded-full font-semibold">
                        {getProfileImage(selectedConversation) ? (
                          <img
                            src={getProfileImage(selectedConversation)}
                            alt="Whatsapp"
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          selectedConversation.lead.name
                            .split(' ')
                            .map((name) => name[0])
                            .join('')
                            .toUpperCase()
                        )}
                      </div>
                      {selectedConversation.mode === 'agent' && (
                        <div className="bg-success absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="mobile-text-lg font-semibold">
                          {selectedConversation.lead.name}
                        </h3>
                        {getPriorityIcon(selectedConversation.lead.priority)}
                      </div>
                      <div className="text-neutral flex flex-wrap items-center space-x-2 text-sm">
                        {getChannelIcon(selectedConversation.lead.source)}
                        <span className="hidden sm:inline">{selectedConversation.lead.source}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          Agente: {selectedConversation.agent.name}
                        </span>
                        {selectedConversation.mode === 'agent' && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-success">
                              {calculateResponseTime(selectedConversation) ?? ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-ghost btn-sm">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg"
                      >
                        <li>
                          <a href="#view-archive">
                            <Eye className="h-4 w-4" />
                            Ver Arquivo
                          </a>
                        </li>
                        <li>
                          <a href="#archive">
                            <Archive className="h-4 w-4" />
                            Arquivar
                          </a>
                        </li>
                        <li>
                          <hr className="my-1" />
                        </li>
                        <li>
                          <a href="#finish" className="text-error">
                            Finalizar Conversa
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div
                ref={messagesContainerRef}
                className="bg-base-200 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200 flex-1 overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'human' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`chat-message max-w-xs rounded-2xl px-4 py-3 shadow-sm lg:max-w-md ${
                          message.sender === 'human'
                            ? 'bg-base-100 text-base-content border-base-300 border'
                            : 'bg-primary text-primary-content'
                        }`}
                      >
                        {getMessageComponent(message, selectedConversation)}
                        <div className="mt-2 flex items-center justify-end space-x-1">
                          <span className="text-xs opacity-70">
                            {formatRelative(new Date(message.timestamp), new Date(), {
                              locale: language.language === 'pt' ? ptBR : enUS,
                            })}
                          </span>
                          {message.sender === 'agent' && (
                            <CheckCircle className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Indicador de digitação */}
                  {isTyping && (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-content rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-white"
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-white"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                          <span className="text-xs">Digitando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Área de Digitação */}
              <div className="border-base-300 bg-base-100 border-t p-4">
                {/* Respostas Rápidas */}
                {quickReplies && (
                  <div className="bg-base-200 mb-3 rounded-lg p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{t.quickReplies}</span>
                      <button
                        onClick={() => setQuickReplies(false)}
                        className="btn btn-ghost btn-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplyOptions.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (selectedConversation) {
                              setNewMessage({
                                id: 0,
                                conversationId: selectedConversation.id,
                                sender: 'human' as const,
                                content: reply,
                                timestamp: new Date(),
                                metadata: {},
                              })
                              sendMessage()
                            }
                          }}
                          className="btn btn-outline btn-xs"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!showAudioRecorder ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <textarea
                        value={newMessage?.content || ''}
                        onChange={(e) =>
                          setNewMessage({
                            id: 0,
                            conversationId: selectedConversation?.id ?? 0,
                            sender: 'human' as const,
                            content: e.target.value,
                            timestamp: new Date(),
                            metadata: {},
                          })
                        }
                        onKeyPress={handleKeyPress}
                        placeholder={t.typeMessage}
                        className="textarea textarea-bordered min-h-[60px] w-full resize-none"
                        rows={1}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                        <div className="emoji-picker-container relative">
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="btn btn-ghost btn-xs"
                          >
                            <Smile className="h-4 w-4" />
                          </button>
                          <EmojiPicker
                            isOpen={showEmojiPicker}
                            onClose={() => setShowEmojiPicker(false)}
                            onEmojiSelect={handleEmojiSelect}
                          />
                        </div>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setShowFileUpload(!showFileUpload)}
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setShowAudioRecorder(true)}
                        >
                          <Mic className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage?.content.trim()}
                      className="btn btn-primary btn-circle"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <AudioRecorder
                    onSendAudio={handleAudioSend}
                    disabled={!selectedConversation}
                    onClose={() => setShowAudioRecorder(false)}
                    show={showAudioRecorder}
                  />
                )}

                {/* Componente de upload de arquivos */}
                <div className="relative">
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    disabled={!selectedConversation}
                    isOpen={showFileUpload}
                    onClose={() => setShowFileUpload(false)}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-neutral flex items-center space-x-4 text-xs">
                    {selectedConversation?.mode === 'agent' && (
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>{t.agentActive}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setQuickReplies(!quickReplies)}
                      className="btn btn-ghost btn-xs"
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      {t.quickReplies}
                    </button>
                  </div>
                  <button
                    className="btn btn-outline btn-xs text-accent"
                    onClick={() =>
                      handleSwitchConversationMode(selectedConversation as Conversation)
                    }
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {selectedConversation?.mode === 'agent'
                      ? t.assumeConversation
                      : t.switchToAgent}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-base-200 flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="text-neutral mx-auto mb-4 h-16 w-16" />
                <h3 className="text-neutral mb-2 text-lg font-semibold">{t.selectConversation}</h3>
                <p className="text-neutral text-sm">{t.chooseConversationToStart}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Área do Chat - Mobile */}
      {selectedConversation && (
        <div className="bg-base-100 fixed inset-0 z-50 flex flex-col md:hidden">
          {/* Header do Chat Mobile */}
          <div className="border-base-300 bg-base-100 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="btn btn-ghost btn-sm"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>
                <div className="relative">
                  <div className="bg-primary text-primary-content flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold">
                    {getProfileImage(selectedConversation) ? (
                      <img
                        src={getProfileImage(selectedConversation)}
                        alt="Whatsapp"
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      selectedConversation.lead.name
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .toUpperCase()
                    )}
                  </div>
                  {selectedConversation.mode === 'agent' && (
                    <div className="bg-success absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{selectedConversation.lead.name}</h3>
                  <p className="text-neutral text-xs">{selectedConversation.mode}</p>
                </div>
              </div>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-ghost btn-sm">
                  <MoreVertical className="h-4 w-4" />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg"
                >
                  <li>
                    <a href="#view-archive">
                      <Eye className="h-4 w-4" />
                      Ver Arquivo
                    </a>
                  </li>
                  <li>
                    <a href="#archive">
                      <Archive className="h-4 w-4" />
                      Arquivar
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mensagens Mobile */}
          <div ref={mobileMessagesContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {selectedConversation.messages?.map((message) => (
              <div
                key={message.id}
                className={`chat-message flex ${message.sender === 'human' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 md:max-w-md lg:max-w-lg ${
                    message.sender === 'human'
                      ? 'bg-base-300 text-base-content'
                      : 'bg-primary text-primary-content'
                  }`}
                >
                  {message.metadata?.message?.messageType === 'AudioMessage' ||
                  message.metadata?.type === 'audio' ||
                  message.metadata?.messageType === 'AudioMessage' ||
                  message.metadata?.message?.type === 'audio' ? (
                    <AudioMessage
                      messageId={message.id}
                      waveform={
                        message.metadata.message?.content?.waveform ||
                        message.metadata?.content?.waveform
                      }
                      durationSeconds={
                        message.metadata.message?.content?.seconds ||
                        message.metadata?.content?.seconds
                      }
                      sender={message.sender}
                      audioBase64={
                        message.sender === 'agent' ? message.metadata?.output : undefined
                      }
                      userId={userId}
                      agentId={selectedConversation.agent.id}
                      integration={selectedConversation.integration ?? 'uazapi'}
                    />
                  ) : message.metadata?.message?.messageType === 'ImageMessage' ||
                    message.metadata?.messageType === 'ImageMessage' ||
                    message.metadata?.message?.type === 'image' ? (
                    <ImageMessage
                      messageId={message.id}
                      thumbnailBase64={
                        message.metadata.message?.content?.JPEGThumbnail ||
                        message.metadata?.content?.JPEGThumbnail
                      }
                      textContent={message.content}
                      userId={userId}
                      agentId={selectedConversation.agent.id}
                      integration={selectedConversation.integration ?? 'uazapi'}
                    />
                  ) : message.metadata?.message?.messageType === 'VideoMessage' ||
                    message.metadata?.messageType === 'VideoMessage' ||
                    message.metadata?.message?.type === 'video' ? (
                    <VideoMessage
                      messageId={message.id}
                      thumbnailBase64={
                        message.metadata.message?.content?.JPEGThumbnail ||
                        message.metadata?.content?.JPEGThumbnail
                      }
                      textContent={message.content}
                      userId={userId}
                      agentId={selectedConversation.agent.id}
                      integration={selectedConversation.integration ?? 'uazapi'}
                    />
                  ) : message.metadata?.message?.messageType === 'DocumentMessage' ||
                    message.metadata?.messageType === 'DocumentMessage' ||
                    message.metadata?.message?.type === 'document' ? (
                    <DocumentMessage
                      messageId={message.id}
                      documentTitle={
                        message.metadata.message?.content?.title ||
                        message.metadata?.content?.fileName
                      }
                      textContent={message.content}
                      userId={userId}
                      agentId={selectedConversation.agent.id}
                      integration={selectedConversation.integration ?? 'uazapi'}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  <p className="mt-1 text-xs opacity-70">
                    {formatRelative(new Date(message.timestamp), new Date(), {
                      locale: language.language === 'pt' ? ptBR : enUS,
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message flex justify-end">
                <div className="bg-primary text-primary-content rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="bg-primary-content h-2 w-2 animate-bounce rounded-full"></div>
                    <div
                      className="bg-primary-content h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="bg-primary-content h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de Digitação Mobile */}
          <div className="border-base-300 bg-base-100 border-t p-4">
            {!showAudioRecorder ? (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <textarea
                    value={newMessage?.content || ''}
                    onChange={(e) =>
                      setNewMessage({
                        id: 0,
                        conversationId: selectedConversation?.id ?? 0,
                        sender: 'human' as const,
                        content: e.target.value,
                        timestamp: new Date(),
                        metadata: {},
                      })
                    }
                    onKeyPress={handleKeyPress}
                    placeholder={t.typeMessage}
                    className="textarea textarea-bordered min-h-[50px] w-full resize-none pr-12"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <div className="emoji-picker-container relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="btn btn-ghost btn-xs"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      <EmojiPicker
                        isOpen={showEmojiPicker}
                        onClose={() => setShowEmojiPicker(false)}
                        onEmojiSelect={handleEmojiSelect}
                      />
                    </div>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setShowAudioRecorder(true)}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage?.content.trim()}
                  className="btn btn-primary btn-circle"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <AudioRecorder
                onSendAudio={handleAudioSend}
                disabled={!selectedConversation}
                onClose={() => setShowAudioRecorder(false)}
                show={showAudioRecorder}
              />
            )}

            {/* Componente de upload de arquivos - Mobile */}
            <div className="relative">
              <FileUpload
                onFileSelect={handleFileUpload}
                disabled={!selectedConversation}
                isOpen={showFileUpload}
                onClose={() => setShowFileUpload(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Conversations
