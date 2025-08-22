import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Brain, 
  BookOpen, 
  Mail, 
  MessageCircle,
  MessageSquare,
  Check,
  Upload,
  Plus,
  ArrowLeft,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Agent, Faq, FollowUp } from '@/types';
import FollowUpModal from '@/components/FollowUpModal';
import FaqModal from '@/components/FaqModal';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [agentData, setAgentData] = useState<Agent>({
    name: '',
    description: '',
    avatar: '🤖',
    personality: {
      tone: 'professional',
      style: 'helpful',
      greetingMessage: '',
      customInstructions: '',
      voiceSetting: 'never'
    },
    behavior: {
      responseTime: 'immediate',
      escalationRules: [],
      workingHours: {
        enabled: false,
        start: '09:00',
        end: '18:00',
        timezone: 'America/Sao_Paulo'
      },
      systemPrompt: {
        mode: 'template', // 'template' ou 'advanced'
        selectedTemplate: '',
        customPrompt: ''
      }
    },
    knowledgeBase: {
      documents: [],
      faqs: [],
      websiteUrl: '',
      youtubeVideos: []
    },
    followUps: {
      enabled: true,
      sequences: []
    },
    channels: []
  });

  const steps = [
    { id: 1, name: t.personality, icon: User },
    { id: 2, name: t.behavior, icon: Brain },
    { id: 3, name: t.knowledgeBase, icon: BookOpen },
    { id: 4, name: t.followUps, icon: Mail },
    { id: 5, name: t.channels, icon: MessageCircle }
  ];

  const toneOptions = [
    { value: 'professional', label: t.professional, description: t.professionalDesc },
    { value: 'friendly', label: t.friendly, description: t.friendlyDesc },
    { value: 'casual', label: t.casual, description: t.casualDesc },
    { value: 'formal', label: t.formal, description: t.formalDesc }
  ];

  const voiceOptions = [
    { value: 'always', label: t.always, description: t.alwaysDesc },
    { value: 'audio_response', label: t.audioResponse, description: t.audioResponseDesc },
    { value: 'when_requested', label: t.whenRequested, description: t.whenRequestedDesc },
    { value: 'never', label: t.never, description: t.neverDesc }
  ];

  const systemPromptTemplates = [
    {
      id: 'atendimento',
      name: t.attendance,
      description: t.attendanceDesc,
      prompt: 'Você é um assistente de atendimento ao cliente. Sua função é ajudar os clientes com dúvidas, fornecer informações sobre produtos e serviços, e resolver problemas de forma eficiente e cordial. Sempre seja paciente, prestativo e mantenha um tom profissional e amigável.'
    },
    {
      id: 'cobranca',
      name: t.billing,
      description: t.billingDesc,
      prompt: 'Você é um especialista em cobrança. Sua função é negociar pagamentos em atraso de forma respeitosa e eficaz. Você deve ser firme mas cordial, oferecer opções de pagamento flexíveis, e buscar acordos que sejam benéficos para ambas as partes. Sempre mantenha um tom profissional e empático.'
    },
    {
      id: 'comercial',
      name: t.commercial,
      description: t.commercialDesc,
      prompt: 'Você é um representante de vendas (SDR). Sua função é qualificar leads, identificar oportunidades de negócio, e agendar reuniões com prospects qualificados. Você deve ser proativo, fazer perguntas estratégicas, e demonstrar valor da solução. Mantenha um tom entusiasta e profissional.'
    },
    {
      id: 'suporte',
      name: t.support,
      description: t.supportDesc,
      prompt: 'Você é um técnico de suporte especializado. Sua função é resolver problemas técnicos dos clientes de forma eficiente. Você deve fazer diagnósticos precisos, fornecer soluções passo a passo, e garantir que o problema seja resolvido. Mantenha um tom técnico mas acessível.'
    }
  ];

  const channelOptions = [
    { 
      id: 'whatsapp_business', 
      name: t.whatsappBusinessOfficial, 
      icon: '🟢',
      description: t.whatsappBusinessDescription,
      status: 'disconnected'
    },
    { 
      id: 'whatsapp_evolution', 
      name: t.whatsappEvolutionAPI, 
      icon: '🟢',
      description: t.whatsappEvolutionDescription,
      status: 'disconnected'
    },
    { 
      id: 'hubsoft', 
      name: t.hubsoft, 
      icon: '🔵',
      description: t.hubsoftDescription,
      status: 'disconnected'
    }
  ];

  const updateAgentData = (section: string, data: Agent) => {
    // setAgentData(prev => ({
    //   ...prev,
    //   [section]: { ...prev[section], ...data }
    // }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Creating agent:', agentData);
    navigate('/agents');
  };

  const addFaq = (faq: Faq) => {
    const newFaq = {
      id: Date.now(),
      question: faq.question,
      answer: faq.answer
    };
    
    setAgentData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        faqs: [...prev.knowledgeBase.faqs, newFaq]
      }
    }));
    setShowFaqModal(false);
    setEditingFaq(null);
  };

  const editFaq = (faq: Faq) => {
    setEditingFaq(faq);
    setShowFaqModal(true);
  };

  const updateFaq = (updatedFaq:Faq) => {
    setAgentData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        faqs: prev.knowledgeBase.faqs.map(faq => 
          faq.id === updatedFaq.id ? updatedFaq : faq
        )
      }
    }));
    setShowFaqModal(false);
    setEditingFaq(null);
  };

  const deleteFaq = (faqId:number) => {
    setAgentData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        faqs: prev.knowledgeBase.faqs.filter(faq => faq.id !== faqId)
      }
    }));
  };

  const analyzeWebsite = async () => {
    if (!agentData.knowledgeBase.websiteUrl.trim()) {
      alert('Por favor, insira uma URL válida primeiro.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simular progresso da análise
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simular análise completa após 5 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      
      // Adicionar algumas FAQs baseadas na análise simulada
      const autoFaqs = [
        {
          id: Date.now(),
          question: "Quais são os horários de atendimento?",
          answer: "Nosso horário de atendimento é de segunda a sexta, das 8h às 18h."
        },
        {
          id: Date.now() + 1,
          question: "Como posso entrar em contato?",
          answer: "Você pode entrar em contato através do WhatsApp, email ou telefone disponível em nosso site."
        }
      ];

      setAgentData(prev => ({
        ...prev,
        knowledgeBase: {
          ...prev.knowledgeBase,
          faqs: [...prev.knowledgeBase.faqs, ...autoFaqs]
        }
      }));

      alert(t.siteAnalysisComplete);
    }, 5000);
  };

  const analyzeYouTubeVideo = async (videoUrl: string) => {
    if (!videoUrl.trim()) {
      alert('Por favor, insira uma URL válida do YouTube primeiro.');
      return;
    }

    // Validar se é uma URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
      alert('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    setIsAnalyzingVideo(true);
    setVideoAnalysisProgress(0);

    // Simular progresso da análise
    const progressInterval = setInterval(() => {
      setVideoAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzingVideo(false);
          return 100;
        }
        return prev + 15;
      });
    }, 300);

    // Simular análise completa após 3 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzingVideo(false);
      setVideoAnalysisProgress(100);
      
      // Extrair ID do vídeo da URL
      const videoId = extractYouTubeVideoId(videoUrl);
      const videoTitle = `Vídeo do YouTube (${videoId})`;
      
      // Adicionar vídeo à base de conhecimento
      const newVideo = {
        id: Date.now(),
        url: videoUrl,
        title: videoTitle,
        description: 'Conteúdo extraído do vídeo do YouTube',
        transcript: 'Transcrição simulada do vídeo...',
        addedAt: new Date().toISOString()
      };

      setAgentData(prev => ({
        ...prev,
        knowledgeBase: {
          ...prev.knowledgeBase,
          youtubeVideos: [...prev.knowledgeBase.youtubeVideos, newVideo]
        }
      }));

      alert(t.videoAnalysisComplete);
    }, 3000);
  };

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const removeYouTubeVideo = (videoId: number) => {
    setAgentData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        youtubeVideos: prev.knowledgeBase.youtubeVideos.filter(video => video.id !== videoId)
      }
    }));
  };

  const addFollowUp = (followUp: FollowUp) => {
    const newFollowUp = {
      id: Date.now(),
      name: followUp.name,
      description: followUp.description,
      messages: followUp.messages,
      trigger: followUp.trigger,
      delay: followUp.delay
    };
    
    setAgentData(prev => ({
      ...prev,
      followUps: {
        ...prev.followUps,
        sequences: [...prev.followUps.sequences, newFollowUp]
      }
    }));
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const editFollowUp = (followUp: FollowUp) => {
    // setEditingFollowUp(followUp);
    setShowFollowUpModal(true);
  };

  const updateFollowUp = (updatedFollowUp: FollowUp) => {
      // setAgentData(prev => ({
      //   ...prev,
      //   followUps: {
      //     ...prev.followUps,
      //     sequences: prev.followUps.sequences.map(seq => 
      //       seq.id === updatedFollowUp.id ? updatedFollowUp : seq
      //     )
      //   }
      // }));
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const deleteFollowUp = (followUpId: number) => {
    setAgentData(prev => ({
      ...prev,
      followUps: {
        ...prev.followUps,
        sequences: prev.followUps.sequences.filter(seq => seq.id !== followUpId)
      }
    }));
  };

  const connectChannel = (channelId: number) => {
    // Simular processo de conexão
    console.log(`Conectando ${channelId}...`);
    
    // Atualizar status do canal
    // setAgentData(prev => ({
    //   ...prev,
    //   channels: [...prev.channels, channelId]
    // }));

    // Simular delay de conexão
        // setTimeout(() => {
        //   alert(`${channelOptions.find(c => c.id === channelId)?.name} ${t.channelConnected}`);
        // }, 2000);
  };

  const disconnectChannel = (channelId: number  ) => {
    // Simular processo de desconexão
    console.log(`Desconectando ${channelId}...`);
    
    // Remover canal da lista
    // setAgentData(prev => ({
    //   ...prev,
    //   channels: prev.channels.filter(c => c !== channelId)
    // }));

    // Simular delay de desconexão
    // setTimeout(() => {
    //   alert(`${channelOptions.find(c => c.id === channelId)?.name} ${t.channelDisconnected}`);
    // }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/agents')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-base-content">{t.createNewAgent}</h1>
            <p className="text-neutral mt-1">{t.configureCustomAgent}</p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive ? 'bg-primary text-primary-content' :
                    isCompleted ? 'bg-primary text-primary-content' :
                    'bg-base-300 text-neutral'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-neutral'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-primary' : 'bg-base-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card bg-base-100">
        <div className="card-body">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">{t.agentPersonality}</h3>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.agentName}</span>
                </label>
                <input 
                  type="text" 
                  placeholder={t.agentNamePlaceholder}
                  className="input input-bordered w-full"
                  value={agentData.name}
                  onChange={(e) => setAgentData(prev => ({...prev, name: e.target.value}))}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.description}</span>
                </label>
                <textarea 
                  placeholder={t.descriptionPlaceholder}
                  className="textarea textarea-bordered w-full h-24"
                  value={agentData.description}
                  onChange={(e) => setAgentData(prev => ({...prev, description: e.target.value}))}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.voiceTone}</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toneOptions.map(option => (
                    <label key={option.value} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="tone" 
                        value={option.value}
                        checked={agentData.personality.tone === option.value}
                        // onChange={(e) => updateAgentData('personality', { tone: e.target.value })}
                        className="hidden"
                      />
                      <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2 ${
                        agentData.personality.tone === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent'
                      }`}>
                        <div className="card-body p-4">
                          <div>
                            <h4 className="font-semibold text-base-content">{option.label}</h4>
                            <p className="text-sm text-neutral mt-1">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.voiceSettings}</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voiceOptions.map(option => (
                    <label key={option.value} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="voice" 
                        value={option.value}
                        checked={agentData.personality.voiceSetting === option.value}
                        // onChange={(e) => updateAgentData('personality', { voiceSetting: e.target.value })}
                        className="hidden"
                      />
                      <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2 ${
                        agentData.personality.voiceSetting === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent'
                      }`}>
                        <div className="card-body p-4">
                          <div>
                            <h4 className="font-semibold text-base-content">{option.label}</h4>
                            <p className="text-sm text-neutral mt-1">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.greetingMessage}</span>
                </label>
                <textarea 
                  placeholder={t.greetingMessagePlaceholder}
                  className="textarea textarea-bordered w-full h-20"
                  value={agentData.personality.greetingMessage}
                  // onChange={(e) => updateAgentData('personality', { greetingMessage: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">{t.agentBehavior}</h3>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.systemPrompt}</span>
                </label>
                <p className="text-sm text-neutral mb-4">{t.systemPromptDesc}</p>
                
                {/* Modo de configuração */}
                <div className="flex space-x-4 mb-6">
                  <label className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="promptMode" 
                      value="template"
                      checked={agentData.behavior.systemPrompt.mode === 'template'}
                      // onChange={(e) => updateAgentData('behavior', { 
                      //   // systemPrompt: { ...agentData.behavior.systemPrompt, mode: e.target.value }
                      // })}
                      className="radio radio-primary mr-2"
                    />
                    <span>{t.useTemplate}</span>
                  </label>
                  <label className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="promptMode" 
                      value="advanced"
                      checked={agentData.behavior.systemPrompt.mode === 'advanced'}
                      // onChange={(e) => updateAgentData('behavior', { 
                      //   // systemPrompt: { ...agentData.behavior.systemPrompt, mode: e.target.value }
                      // })}
                      className="radio radio-primary mr-2"
                    />
                    <span>{t.advancedMode}</span>
                  </label>
                </div>

                {/* Templates */}
                {agentData.behavior.systemPrompt.mode === 'template' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {systemPromptTemplates.map(template => (
                        <label key={template.id} className="cursor-pointer">
                          <input 
                            type="radio" 
                            name="template" 
                            value={template.id}
                            checked={agentData.behavior.systemPrompt.selectedTemplate === template.id}
                            onChange={(e) => {
                              // const selectedTemplate = systemPromptTemplates.find(t => t.id === e.target.value);
                              // updateAgentData('behavior', { 
                              //   systemPrompt: { 
                              //     ...agentData.behavior.systemPrompt, 
                              //     selectedTemplate: e.target.value,
                              //     customPrompt: selectedTemplate ? selectedTemplate.prompt : ''
                              //   }
                              // });
                            }}
                            className="hidden"
                          />
                          <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2 ${
                            agentData.behavior.systemPrompt.selectedTemplate === template.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-transparent'
                          }`}>
                            <div className="card-body p-4">
                              <div>
                                <h4 className="font-semibold text-base-content">{template.name}</h4>
                                <p className="text-sm text-neutral mt-1">{template.description}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Campo editável do system prompt */}
                    {agentData.behavior.systemPrompt.selectedTemplate && (
                      <div className="mt-6">
                        <label className="label">
                          <span className="label-text font-medium">{t.systemPromptEditable}</span>
                        </label>
                        <textarea 
                          placeholder={t.systemPromptEditablePlaceholder}
                          className="textarea textarea-bordered w-full h-48"
                          value={agentData.behavior.systemPrompt.customPrompt}
                          // onChange={(e) => updateAgentData('behavior', { 
                          //   systemPrompt: { ...agentData.behavior.systemPrompt, customPrompt: e.target.value }
                          // })}
                        />
                        <div className="label">
                          <span className="label-text-alt">{t.systemPromptEditableHelp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Modo Avançado */}
                {agentData.behavior.systemPrompt.mode === 'advanced' && (
                  <div>
                    <textarea 
                      placeholder="Digite o system prompt personalizado para o agente..."
                      className="textarea textarea-bordered w-full h-48"
                      value={agentData.behavior.systemPrompt.customPrompt}
                      // onChange={(e) => updateAgentData('behavior', { 
                      //   systemPrompt: { ...agentData.behavior.systemPrompt, customPrompt: e.target.value }
                      // })}
                    />
                    <div className="label">
                      <span className="label-text-alt">Defina como o agente deve se comportar, suas responsabilidades e estilo de comunicação</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.responseTime}</span>
                </label>
                <select 
                  className="select select-bordered w-full max-w-xs"
                  value={agentData.behavior.responseTime}
                  // onChange={(e) => updateAgentData('behavior', { responseTime: e.target.value })}
                >
                  <option value="immediate">Imediato</option>
                  <option value="1min">1 minuto</option>
                  <option value="5min">5 minutos</option>
                  <option value="15min">15 minutos</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.workingHours}</span>
                </label>
                <div className="form-control">
                  <label className="cursor-pointer flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary"
                      checked={agentData.behavior.workingHours.enabled}
                      // onChange={(e) => updateAgentData('behavior', { 
                      //   workingHours: { ...agentData.behavior.workingHours, enabled: e.target.checked }
                      // })}
                    />
                    <span>{t.setWorkingHours}</span>
                  </label>
                </div>
                
                {agentData.behavior.workingHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="label">
                        <span className="label-text">{t.start}</span>
                      </label>
                      <input 
                        type="time" 
                        className="input input-bordered"
                        value={agentData.behavior.workingHours.start}
                        // onChange={(e) => updateAgentData('behavior', { 
                        //   workingHours: { ...agentData.behavior.workingHours, start: e.target.value }
                        // })}
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">{t.end}</span>
                      </label>
                      <input 
                        type="time" 
                        className="input input-bordered"
                        value={agentData.behavior.workingHours.end}
                        // onChange={(e) => updateAgentData('behavior', { 
                        //   workingHours: { ...agentData.behavior.workingHours, end: e.target.value }
                        // })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">{t.knowledgeBaseTitle}</h3>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.websiteUrl}</span>
                </label>
                <div className="flex space-x-3">
                  <input 
                    type="url" 
                    placeholder={t.websiteUrlPlaceholder}
                    className="input input-bordered flex-1"
                    value={agentData.knowledgeBase.websiteUrl}
                    // onChange={(e) => updateAgentData('knowledgeBase', { websiteUrl: e.target.value })}
                  />
                  <button 
                    onClick={analyzeWebsite}
                    disabled={isAnalyzing || !agentData.knowledgeBase.websiteUrl.trim()}
                    className="btn btn-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="loading loading-spinner loading-sm"></div>
                        {t.analyzing}
                      </>
                    ) : (
                      t.analyzeSite
                    )}
                  </button>
                </div>
                <div className="label">
                  <span className="label-text-alt">{t.analyzeSiteHelp}</span>
                </div>
                
                {/* Barra de Progresso */}
                {isAnalyzing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-neutral mb-2">
                      <span>{t.analyzingSite}</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={analysisProgress} 
                      max="100"
                    ></progress>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.documents}</span>
                </label>
                <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-neutral mb-4" />
                  <p className="text-neutral mb-2">{t.dragFilesHere}</p>
                  <button className="btn btn-outline btn-sm">
                    {t.selectFiles}
                  </button>
                  <p className="text-xs text-neutral mt-2">{t.fileTypes}</p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.youtubeVideos}</span>
                </label>
                <p className="text-sm text-neutral mb-4">{t.youtubeVideosDesc}</p>
                
                <div className="space-y-4">
                  {/* Input para URL do vídeo */}
                  <div className="flex space-x-3">
                    <input 
                      type="url" 
                      placeholder={t.youtubeUrlPlaceholder}
                      className="input input-bordered flex-1"
                      value={youtubeVideoUrl}
                      onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                      disabled={isAnalyzingVideo}
                    />
                    <button 
                      onClick={() => {
                        analyzeYouTubeVideo(youtubeVideoUrl);
                        setYoutubeVideoUrl('');
                      }}
                      disabled={isAnalyzingVideo || !youtubeVideoUrl.trim()}
                      className="btn btn-primary"
                    >
                      {isAnalyzingVideo ? (
                        <>
                          <div className="loading loading-spinner loading-sm"></div>
                          {t.analyzing}
                        </>
                      ) : (
                        t.analyzeVideo
                      )}
                    </button>
                  </div>
                  
                  {/* Barra de Progresso */}
                  {isAnalyzingVideo && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-neutral mb-2">
                        <span>{t.analyzingVideo}</span>
                        <span>{videoAnalysisProgress}%</span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={videoAnalysisProgress} 
                        max="100"
                      ></progress>
                    </div>
                  )}

                  {/* Lista de vídeos adicionados */}
                  {agentData.knowledgeBase.youtubeVideos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-base-content mb-3">{t.addedVideos}</h4>
                      <div className="space-y-3">
                        {agentData.knowledgeBase.youtubeVideos.map((video) => (
                          <div key={video.id} className="card bg-base-200">
                            <div className="card-body p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                      </svg>
                                    </div>
                                    <h5 className="font-semibold text-base-content">{video.title}</h5>
                                  </div>
                                  <p className="text-sm text-neutral mb-2">{video.description}</p>
                                  <p className="text-xs text-neutral">{t.addedOn} {new Date(video.addedAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button 
                                    onClick={() => window.open(video.url, '_blank')}
                                    className="btn btn-ghost btn-xs"
                                    title={t.openVideo}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => removeYouTubeVideo(video.id)}
                                    className="btn btn-ghost btn-xs text-error"
                                    title={t.removeVideo}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.faqs}</span>
                </label>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowFaqModal(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addFaq}
                  </button>
                  
                  {/* Lista de FAQs */}
                  {agentData.knowledgeBase.faqs.length > 0 && (
                    <div className="space-y-3">
                      {agentData.knowledgeBase.faqs.map((faq) => (
                        <div key={faq.id} className="card bg-base-200">
                          <div className="card-body p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base-content mb-2">{faq.question}</h4>
                                <p className="text-sm text-neutral">{faq.answer}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button 
                                  onClick={() => editFaq(faq)}
                                  className="btn btn-ghost btn-xs"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => deleteFaq(faq.id)}
                                  className="btn btn-ghost btn-xs text-error"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">{t.automaticFollowUps}</h3>
              
              <div className="form-control">
                <label className="cursor-pointer flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary"
                    checked={agentData.followUps.enabled}
                    // onChange={(e) => updateAgentData('followUps', { enabled: e.target.checked })}
                  />
                  <span>{t.enableFollowUps}</span>
                </label>
              </div>

              {agentData.followUps.enabled && (
                <div className="space-y-4">
                  <div className="alert bg-base-200 border border-base-300">
                    <div className="flex">
                      <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-base-content">{t.followUpsDesc}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowFollowUpModal(true)}
                    className="btn btn-outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createFollowUpSequence}
                  </button>

                  {/* Lista de Sequências */}
                  {agentData.followUps.sequences.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base-content">{t.createdSequences}</h4>
                      {agentData.followUps.sequences.map((sequence) => (
                        <div key={sequence.id} className="card bg-base-200">
                          <div className="card-body p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-base-content mb-1">{sequence.name}</h5>
                                <p className="text-sm text-neutral mb-2">{sequence.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-neutral">
                                  <span>Trigger: {sequence.trigger}</span>
                                  <span>
                                    Delay: {typeof sequence.delay === 'object'
                                      ? `${sequence.delay.days ?? 0}d ${sequence.delay.hours ?? 0}h ${sequence.delay.minutes ?? 0}m`
                                      : sequence.delay}
                                  </span>
                                  <span>{sequence.messages.length} mensagens</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button 
                                  // onClick={() => editFollowUp(sequence)}
                                  className="btn btn-ghost btn-xs"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => deleteFollowUp(sequence.id)}
                                  className="btn btn-ghost btn-xs text-error"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">{t.serviceChannels}</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {channelOptions.map(channel => {
                  const isConnected = agentData.channels.includes(channel.id);
                  
                  return (
                    <div key={channel.id} className="card bg-base-200 hover:bg-base-300 transition-colors">
                      <div className="card-body p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                              channel.id === 'hubsoft' ? '' : 'bg-green-500'
                            }`} style={{ 
                              minWidth: '48px', 
                              minHeight: '48px',
                              backgroundColor: channel.id === 'hubsoft' ? '#4884e4' : undefined
                            }}>
                              {channel.id === 'hubsoft' ? (
                                <img 
                                  src="/images/hubsoft-logo.png" 
                                  alt="Hubsoft Logo" 
                                  className="w-8 h-8 object-contain flex-shrink-0"
                                  style={{ width: '32px', height: '32px' }}
                                />
                              ) : (
                                <svg className="w-6 h-6 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-base-content">{channel.name}</h4>
                              <p className="text-sm text-neutral mt-1">{channel.description}</p>
                            </div>
                          </div>
                          <div className={`badge ${isConnected ? 'badge-success' : 'badge-neutral'}`}>
                            {isConnected ? t.connected : t.disconnected}
                          </div>
                        </div>
                        
                        {isConnected ? (
                          <button 
                            // onClick={() => disconnectChannel(channel.id)}
                            className="btn btn-outline btn-error w-full"
                          >
                            {t.disconnect}
                          </button>
                        ) : (
                          <button 
                            // onClick={() => connectChannel(channel.id)}
                            className="btn btn-primary w-full"
                          >
                            {t.connect}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button 
          onClick={prevStep} 
          disabled={currentStep === 1}
          className="btn btn-sm btn-ghost"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t.previous}
        </button>
        
        <div className="text-sm text-neutral">
          {t.step} {currentStep} {t.of} {steps.length}
        </div>
        
        {currentStep === steps.length ? (
          <button onClick={handleSubmit} className="btn btn-sm btn-primary">
            <Check className="w-4 h-4 mr-1" />
            {t.createAgent}
          </button>
        ) : (
          <button onClick={nextStep} className="btn btn-sm btn-primary">
            {t.next}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <FaqModal 
          isOpen={showFaqModal}
          onClose={() => {
            setShowFaqModal(false);
            setEditingFaq(null);
          }}
          onSave={editingFaq ? updateFaq : addFaq}
          faq={editingFaq ?? undefined}
        />
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <FollowUpModal 
          isOpen={showFollowUpModal}
          onClose={() => {
            setShowFollowUpModal(false);
            setEditingFollowUp(null);
          }}
          onSave={editingFollowUp ? updateFollowUp : addFollowUp}
          followUp={editingFollowUp}
        />
      )}
    </div>
  );
};

export default CreateAgent; 