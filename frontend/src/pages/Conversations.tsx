import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { Conversation, Message } from '@/types';
import ConversationStats from '@/components/Conversations/ConversationStats';

const Conversations = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [quickReplies, setQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [channelFilter, setChannelFilter] = useState('all');
  const [showStats, setShowStats] = useState(false);

  // Dados de exemplo das conversas melhorados
  const conversations = [
    {
      id: 1,
      leadName: 'Maria Silva',
      avatar: 'MS',
      lastMessage: t.wouldLikeToKnow,
      timestamp: '10:30',
      status: 'active',
      agent: t.agentSales,
      channel: t.whatsapp,
      unread: 2,
      qualified: true,
      priority: 'high',
      responseTime: `2${t.minutes}`,
      messages: [
        { id: 1, type: 'lead', content: t.helloInterested, timestamp: '10:15' } as Message,
        { id: 2, type: 'bot', content: t.helloMaria, timestamp: '10:16' } as Message,
        { id: 3, type: 'lead', content: t.wantToKnowPlans, timestamp: '10:25' } as Message,
        { id: 4, type: 'bot', content: t.perfectPlans, timestamp: '10:26' } as Message,
        { id: 5, type: 'lead', content: t.wouldLikeToKnowMore, timestamp: '10:30' } as Message
      ]
    },
    {
      id: 2,
      leadName: 'João Santos',
      avatar: 'JS',
      lastMessage: t.agentTyping,
      timestamp: '09:45',
      status: 'waiting',
      agent: t.technicalSupport,
      channel: t.whatsapp,
      unread: 0,
      qualified: false,
      priority: 'urgent',
      responseTime: `5${t.minutes}`,
      messages: [
        { id: 1, type: 'lead', content: t.needHelpWithIntegration, timestamp: '09:30' } as Message,
        { id: 2, type: 'bot', content: t.helpWithIntegration, timestamp: '09:31' } as Message,
        { id: 3, type: 'lead', content: t.cannotConnectAPI, timestamp: '09:45' } as Message
      ]
    },
    {
      id: 3,
      leadName: 'Ana Costa',
      avatar: 'AC',
      lastMessage: t.thanksForHelp,
      timestamp: t.yesterday,
      status: 'closed',
      agent: t.marketingAgent,
      channel: t.whatsapp,
      unread: 0,
      qualified: true,
      priority: 'normal',
      responseTime: `1${t.minutes}`,
      messages: [
        { id: 1, type: 'lead', content: t.sawYouOnInstagram, timestamp: `${t.yesterday} 15:20` } as Message,
        { id: 2, type: 'bot', content: t.helloAna, timestamp: `${t.yesterday} 15:21` } as Message,
        { id: 3, type: 'lead', content: t.thanksForHelp, timestamp: `${t.yesterday} 16:30` } as Message
      ]
    },
    {
      id: 4,
      leadName: 'Carlos Mendes',
      avatar: 'CM',
      lastMessage: t.deliveryTime,
      timestamp: '08:20',
      status: 'active',
      agent: t.agentSales,
      channel: t.whatsapp,
      unread: 1,
      qualified: true,
      priority: 'high',
      responseTime: `1${t.minutes}`,
      messages: [
        { id: 1, type: 'lead', content: 'Bom dia! Quero comprar o plano empresarial', timestamp: '08:15' } as Message,
        { id: 2, type: 'bot', content: 'Excelente escolha! O plano empresarial inclui todas as funcionalidades avançadas. Qual o prazo de entrega?', timestamp: '08:16' } as Message,
        { id: 3, type: 'lead', content: t.deliveryTime, timestamp: '08:20' } as Message
      ]
    },
    {
      id: 5,
      leadName: 'Fernanda Lima',
      avatar: 'FL',
      lastMessage: 'Preciso de um orçamento personalizado',
      timestamp: t.yesterday,
      status: 'waiting',
      agent: 'Agente Comercial',
      channel: t.whatsapp,
      unread: 3,
      qualified: true,
      priority: 'urgent',
      responseTime: `15${t.minutes}`,
      messages: [
        { id: 1, type: 'lead', content: 'Olá! Preciso de um orçamento personalizado para minha empresa', timestamp: `${t.yesterday} 14:30` } as Message,
        { id: 2, type: 'bot', content: 'Perfeito! Vou te ajudar com um orçamento personalizado. Pode me contar mais sobre sua empresa?', timestamp: `${t.yesterday} 14:31` } as Message,
        { id: 3, type: 'lead', content: 'Preciso de um orçamento personalizado', timestamp: `${t.yesterday} 14:45` } as Message
      ]
    }
  ];

  // Respostas rápidas
  const quickReplyOptions = [
    t.quickReply1,
    t.quickReply2,
    t.quickReply3,
    t.quickReply4,
    t.quickReply5
  ];

  const filteredConversations = conversations.filter(conv => {
    // Filtro por status
    const statusMatch = filter === 'all' || 
      (filter === 'active' && conv.status === 'active') ||
      (filter === 'waiting' && conv.status === 'waiting') ||
      (filter === 'qualified' && conv.qualified) ||
      (filter === 'closed' && conv.status === 'closed');



    // Filtro por canal
    const channelMatch = channelFilter === 'all' || conv.channel === channelFilter;

    // Filtro por busca
    const searchMatch = searchTerm === '' || 
      conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && channelMatch && searchMatch;
  });

  const sendMessage = () => {
    if (newMessage?.content.trim() && selectedConversation) {
      console.log('Sending message:', newMessage);
      setNewMessage(null);
      setIsTyping(true);
      
      // Simular resposta automática
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const sendQuickReply = (message: string) => {
    // setNewMessage({ ...newMessage, content: message });
    setQuickReplies(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'waiting': return 'badge-warning';
      case 'closed': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'waiting': return t.waiting;
      case 'closed': return t.closed;
      default: return 'Indefinido';
    }
  };



  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4 text-error" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'normal': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <Clock className="w-4 h-4 text-neutral" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-base-100">
      {/* Estatísticas */}
      {showStats && (
        <div className="p-4 border-b border-base-300">
          <ConversationStats conversations={conversations} />
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Conversas */}
        <div className="w-full md:w-1/3 bg-base-100 border-r border-base-300 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-base-300 bg-base-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2">
                <h2 className="mobile-text-lg md:text-xl font-bold">{t.conversationsTitle}</h2>
                <div className="badge badge-primary badge-sm">{filteredConversations.length}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowStats(!showStats)}
                  className={`btn btn-ghost btn-sm ${showStats ? 'btn-active' : ''}`}
                  title={t.stats}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-ghost btn-sm ${showFilters ? 'btn-active' : ''}`}
                >
                  <FilterIcon className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Filtros Avançados */}
            {showFilters && (
              <div className="mb-4 p-3 bg-base-200 rounded-lg space-y-3">
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="select select-bordered select-sm flex-1"
                  >
                    <option value="all">{t.allStatus}</option>
                    <option value="active">{t.active}</option>
                    <option value="waiting">{t.waiting}</option>
                    <option value="qualified">{t.qualified}</option>
                    <option value="closed">{t.closed}</option>
                  </select>
                </div>
                <select 
                  value={channelFilter} 
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="all">{t.allChannels}</option>
                  <option value="WhatsApp">{t.whatsapp}</option>
                </select>
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchConversations} 
                className="input input-bordered input-sm w-full pl-10"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-neutral" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
            {filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-neutral mb-2" />
                  <p className="text-sm text-neutral">{t.noConversationsFound}</p>
                </div>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div 
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`conversation-card p-4 border-b border-base-300 cursor-pointer hover:bg-base-200 ${
                    selectedConversation?.id === conversation.id ? 'bg-primary/10 border-primary shadow-sm' : ''
                  } ${conversation.priority === 'urgent' ? 'border-l-4 border-l-error urgent-indicator' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
                        {conversation.avatar}
                      </div>
                      {conversation.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                      )}
                      {conversation.priority === 'urgent' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white flex items-center justify-center">
                          <Zap className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm truncate">{conversation.leadName}</h3>
                          {getPriorityIcon(conversation.priority)}
                        </div>
                        <span className="text-xs text-neutral">{conversation.timestamp}</span>
                      </div>
                      
                      <p className="text-sm text-neutral truncate mb-2">{conversation.lastMessage}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`badge badge-xs py-2 ${getStatusColor(conversation.status)}`}>
                            {getStatusText(conversation.status)}
                          </span>
                          {conversation.qualified && (
                            <span className="badge badge-xs py-2 badge-info">{t.qualified}</span>
                          )}
                          <span className="text-xs text-neutral">{conversation.responseTime}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {getChannelIcon(conversation.channel)}
                                                  {conversation.unread > 0 && (
                          <span className="badge badge-primary badge-xs py-2">{conversation.unread}</span>
                        )}
                        </div>
                      </div>

                      {/* Agente */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral">{conversation.agent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área do Chat - Desktop */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-base-300 bg-base-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="mobile-avatar bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
                        {selectedConversation.avatar}
                      </div>
                      {selectedConversation.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold mobile-text-lg">{selectedConversation.leadName}</h3>
                        {getPriorityIcon(selectedConversation.priority)}
                      </div>
                      <div className="flex flex-wrap items-center space-x-2 text-sm text-neutral">
                        {getChannelIcon(selectedConversation.channel)}
                        <span className="hidden sm:inline">{selectedConversation.channel}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">Agente: {selectedConversation.agent}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-success">{selectedConversation.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  
                                    <div className="flex items-center space-x-2">
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-ghost btn-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52 shadow-lg">
                        <li><a href="#view-archive"><Eye className="w-4 h-4" />Ver Arquivo</a></li>
                        <li><a href="#archive"><Archive className="w-4 h-4" />Arquivar</a></li>
                        <li><hr className="my-1" /></li>
                        <li><a href="#finish" className="text-error">Finalizar Conversa</a></li>
                      </ul>
                    </div>
                  </div>
                </div>


              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-base-200 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200">
                <div className="space-y-4">
                  {selectedConversation.messages?.map(message => (
                    <div key={message.id} className={`flex ${message.type === 'lead' ? 'justify-start' : 'justify-end'}`}>
                                          <div className={`chat-message max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      message.type === 'lead' 
                        ? 'bg-base-100 text-base-content border border-base-300' 
                        : 'bg-primary text-primary-content'
                    }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-end mt-2 space-x-1">
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                          {message.type === 'bot' && (
                            <CheckCircle className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador de digitação */}
                  {isTyping && (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-content px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-xs">Digitando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Área de Digitação */}
              <div className="p-4 border-t border-base-300 bg-base-100">
                {/* Respostas Rápidas */}
                {quickReplies && (
                  <div className="mb-3 p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.quickReplies}</span>
                      <button 
                        onClick={() => setQuickReplies(false)}
                        className="btn btn-ghost btn-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplyOptions.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => sendQuickReply(reply)}
                          className="btn btn-outline btn-xs"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage?.content}
                    // onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    onKeyPress={handleKeyPress}
                    placeholder={t.typeMessage}
                    className="textarea textarea-bordered w-full resize-none min-h-[60px]"
                    rows={1}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                    <button className="btn btn-ghost btn-xs">
                      <Smile className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-xs">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage?.content.trim()}
                  className="btn btn-primary btn-circle"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-xs text-neutral">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>{t.agentActive}</span>
                    </div>
                    <button 
                      onClick={() => setQuickReplies(!quickReplies)}
                      className="btn btn-ghost btn-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {t.quickReplies}
                    </button>
                  </div>
                  <button className="btn btn-outline btn-xs text-accent">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {t.assumeConversation}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-base-200">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-neutral mb-4" />
                <h3 className="text-lg font-semibold text-neutral mb-2">{t.selectConversation}</h3>
                <p className="text-sm text-neutral">{t.chooseConversationToStart}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Área do Chat - Mobile */}
      {selectedConversation && (
        <div className="md:hidden fixed inset-0 bg-base-100 z-50 flex flex-col">
          {/* Header do Chat Mobile */}
          <div className="p-4 border-b border-base-300 bg-base-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="btn btn-ghost btn-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
                    {selectedConversation.avatar}
                  </div>
                  {selectedConversation.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedConversation.leadName}</h3>
                  <p className="text-xs text-neutral">{selectedConversation.status}</p>
                </div>
              </div>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-ghost btn-sm">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52 shadow-lg">
                  <li><a href="#view-archive"><Eye className="w-4 h-4" />Ver Arquivo</a></li>
                  <li><a href="#archive"><Archive className="w-4 h-4" />Arquivar</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mensagens Mobile */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConversation.messages?.map((message) => (
              <div
                key={message.id}
                className={`chat-message flex ${message.type === 'lead' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.type === 'lead' 
                    ? 'bg-base-300 text-base-content' 
                    : 'bg-primary text-primary-content'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message flex justify-end">
                <div className="bg-primary text-primary-content px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-content rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-content rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-content rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de Digitação Mobile */}
          <div className="p-4 border-t border-base-300 bg-base-100">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage?.content}
                  // onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder={t.typeMessage}
                  className="textarea textarea-bordered w-full resize-none min-h-[50px]"
                  rows={1}
                />
              </div>
              <button 
                onClick={sendMessage}
                disabled={!newMessage?.content.trim()}
                className="btn btn-primary btn-circle"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations; 