import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Zap,
  User,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/translations';
import { useAgentStore } from '@/store/agent';
import { Agent } from '@/types/agent';
import { useConversationStore } from '@/store/conversation';
import { ConversationMessage } from '@/types/conversation';

const TestAgent: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { agents, fetchAgents } = useAgentStore();
  const { sendMessage } = useConversationStore();

  useEffect(() => {
    fetchAgents(1, 'all');
  }, [fetchAgents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage: ConversationMessage = {
      id: Date.now(),
      conversationId: 0,
      sender: 'human',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const agentResponse = await sendMessage(selectedAgent.id, 1, inputMessage);

    const botMessage: ConversationMessage = {
      id: Date.now(),
      conversationId: 0,
      sender: 'agent',
      content: agentResponse!,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const resetConversation = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/agents')}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-base-content">{t.testAgent}</h1>
            <p className="text-neutral mt-1">{t.testAgentSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Agentes */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-lg">{t.availableAgents}</h2>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedAgent?.id === agent.id
                        ? 'border-primary bg-primary/5'
                        : 'border-base-300 hover:border-primary/50'
                      }`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-neutral">{agent.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interface de Chat */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 h-[600px] flex flex-col">
            <div className="card-body flex flex-col h-full p-0">
              {/* Header do Chat */}
              <div className="p-4 border-b border-base-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {selectedAgent ? (
                      <div>
                        <h3 className="font-semibold">{selectedAgent.name}</h3>
                        <p className="text-sm text-neutral">{selectedAgent.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-neutral" />
                        <span className="text-neutral">{t.selectAgentToStart}</span>
                      </div>
                    )}
                  </div>
                  {selectedAgent && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={resetConversation}
                        className="btn btn-ghost btn-sm"
                        title={t.restartConversation}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!selectedAgent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-neutral mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t.selectAnAgent}</h3>
                      <p className="text-neutral">{t.chooseAgentToTest}</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{t.helloIAm} {selectedAgent.name}</h3>
                      <p className="text-neutral mb-4">{selectedAgent.description}</p>
                      <div className="bg-base-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-neutral mb-2">{t.testSuggestions}</p>
                        <ul className="text-sm space-y-1">
                          <li>• "{t.testSuggestion1}"</li>
                          <li>• "{t.testSuggestion2}"</li>
                          <li>• "{t.testSuggestion3}"</li>
                          <li>• "{t.testSuggestion4}"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.sender === 'human'
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-200'
                          }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                          {message.sender === 'human' && (
                            <User className="w-4 h-4 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-base-200 max-w-xs lg:max-w-md p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neutral rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              {selectedAgent && (
                <div className="p-4 border-t border-base-300">
                  <div className="flex items-center space-x-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t.typeYourMessage}
                      className="textarea textarea-bordered flex-1 resize-none"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="btn btn-primary"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAgent;