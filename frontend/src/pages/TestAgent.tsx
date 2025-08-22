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

export interface Agent {
  id: number;
  name: string;
  description: string;
  avatar: string;
  capabilities: string[];
  personality: string;
}

const TestAgent: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Array<{ id: number; type: 'user' | 'agent'; content: string; timestamp: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Dados de exemplo dos agentes disponíveis para teste
  const availableAgents = [
    {
      id: 1,
      name: t.salesAgent,
      description: t.salesAgentDesc,
      avatar: '🛒',
      capabilities: [t.leadQualification, t.productPresentation, t.negotiation],
      personality: t.professionalPersuasive
    },
    {
      id: 2,
      name: t.technicalSupport,
      description: t.technicalSupportDesc,
      avatar: '🔧',
      capabilities: [t.problemDiagnosis, t.technicalSolutions, t.usageGuide],
      personality: t.patientDetailed
    },
    {
      id: 3,
      name: t.marketingAgent,
      description: t.marketingAgentDesc,
      avatar: '📢',
      capabilities: [t.marketingStrategies, t.marketAnalysis, t.campaigns],
      personality: t.creativeStrategic
    },
    {
      id: 4,
      name: t.financialAgent,
      description: t.financialAgentDesc,
      avatar: '💰',
      capabilities: [t.financialManagement, t.billing, t.reports],
      personality: t.preciseOrganized
    }
  ];

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

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage: { id: number; type: 'user' | 'agent'; content: string; timestamp: string } = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simular resposta do agente
    setTimeout(() => {
      const agentResponse = generateAgentResponse(inputMessage, selectedAgent);
      const botMessage: { id: number; type: 'user' | 'agent'; content: string; timestamp: string } = {
        id: Date.now() + 1,
        type: 'agent' as 'agent',
        content: agentResponse,
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // Simular tempo de processamento
  };

  const generateAgentResponse = (userMessage: string, agent: Agent) => {
    const responses = {
      1: { // Agente Vendas
        greetings: [
          "Olá! Sou o Agente de Vendas da ConvergIA. Como posso ajudá-lo hoje?",
          "Oi! Estou aqui para auxiliar com suas necessidades de vendas. O que você gostaria de saber?"
        ],
        product: [
          "Temos uma solução perfeita para suas necessidades! Nossa plataforma oferece recursos avançados de IA para otimizar suas vendas.",
          "Deixe-me apresentar nossos produtos. Temos opções que podem aumentar significativamente sua taxa de conversão."
        ],
        pricing: [
          "Nossos preços são competitivos e oferecemos diferentes planos para atender seu orçamento. Posso detalhar as opções?",
          "Temos planos flexíveis que se adaptam ao seu negócio. Qual é o seu volume de vendas atual?"
        ]
      },
      2: { // Suporte Técnico
        greetings: [
          "Olá! Sou o Agente de Suporte Técnico. Como posso ajudá-lo com problemas técnicos?",
          "Oi! Estou aqui para resolver suas questões técnicas. Qual é o problema que você está enfrentando?"
        ],
        technical: [
          "Vou ajudá-lo a resolver esse problema. Primeiro, vamos fazer um diagnóstico básico.",
          "Entendo sua situação. Vamos seguir alguns passos para identificar e resolver o problema."
        ],
        troubleshooting: [
          "Vamos resolver isso juntos. Pode me dar mais detalhes sobre o erro que está vendo?",
          "Vou guiá-lo através do processo de solução. Primeiro, vamos verificar algumas configurações."
        ]
      },
      3: { // Agente Marketing
        greetings: [
          "Olá! Sou o Agente de Marketing. Como posso ajudá-lo com suas estratégias de marketing?",
          "Oi! Estou aqui para otimizar suas campanhas de marketing. Qual é seu objetivo atual?"
        ],
        strategy: [
          "Vamos criar uma estratégia de marketing eficaz para seu negócio. Qual é seu público-alvo?",
          "Posso ajudá-lo a desenvolver campanhas que gerem mais leads qualificados."
        ],
        analytics: [
          "Vamos analisar seus dados de marketing para identificar oportunidades de melhoria.",
          "Posso ajudá-lo a interpretar suas métricas e otimizar suas campanhas."
        ]
      },
      4: { // Agente Financeiro
        greetings: [
          "Olá! Sou o Agente Financeiro. Como posso ajudá-lo com questões financeiras?",
          "Oi! Estou aqui para auxiliar com gestão financeira e cobranças. O que você precisa?"
        ],
        billing: [
          "Vou ajudá-lo com suas questões de cobrança. Pode me fornecer mais detalhes?",
          "Vamos resolver essa questão de cobrança. Primeiro, preciso de algumas informações."
        ],
        reports: [
          "Posso gerar relatórios financeiros detalhados para você. Que período gostaria de analisar?",
          "Vou preparar um relatório financeiro completo com todas as informações relevantes."
        ]
      }
    };

    const agentResponses = responses[1];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('hello')) {
      return agentResponses.greetings[Math.floor(Math.random() * agentResponses.greetings.length)];
    }

    if (lowerMessage.includes('produto') || lowerMessage.includes('solução') || lowerMessage.includes('oferta')) {
      return agentResponses.product ? agentResponses.product[Math.floor(Math.random() * agentResponses.product.length)] : "Posso ajudá-lo com isso. Pode me dar mais detalhes?";
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custo')) {
      return agentResponses.pricing ? agentResponses.pricing[Math.floor(Math.random() * agentResponses.pricing.length)] : "Posso ajudá-lo com informações sobre preços. Pode me dar mais detalhes?";
    }

    // Resposta padrão
    return "Entendo sua pergunta. Como posso ajudá-lo especificamente com isso?";
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
                {availableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent as Agent)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedAgent?.id === agent.id
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
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          </div>
                          {message.type === 'user' && (
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
                         <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                         <div className="w-2 h-2 bg-neutral rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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