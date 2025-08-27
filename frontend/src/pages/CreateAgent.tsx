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
  Edit,
  Trash2
} from 'lucide-react';
import FollowUpModal from '@/components/FollowUpModal';
import FaqModal from '@/components/FaqModal';
import { useAgentStore } from '@/store/agent';
import { Agent, AgentDocument } from '@/types/agent';
import { FollowUp } from '@/types/follow_up';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(1);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<AgentDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [checkboxWorkingHours, setCheckboxWorkingHours] = useState(false);

  const { agent, setAgent, updateAgent } = useAgentStore();

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
      prompt: t.attendancePromptTemplate
    },
    {
      id: 'cobranca',
      name: t.billing,
      description: t.billingDesc,
      prompt: t.billingPromptTemplate
    },
    {
      id: 'comercial',
      name: t.commercial,
      description: t.commercialDesc,
      prompt: t.commercialPromptTemplate
    },
    {
      id: 'suporte',
      name: t.support,
      description: t.supportDesc,
      prompt: t.supportPromptTemplate
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
    console.log('Creating agent:', agent);
    navigate('/agents');
  };

  const updateAgentAttribute = <K extends keyof Agent>(key: K, value: Agent[K]) => {
    setAgent({
      ...agent,
      [key]: value
    });
  };

  const addFaq = (faq: AgentDocument) => {
    const newFaq = {
      type: 'faq',
      name: faq.name,
      content: faq.content
    } as AgentDocument;

    agent!.documents.push(newFaq);
    setShowFaqModal(false);
    setEditingFaq(null);
  };

  const editFaq = (faq: AgentDocument) => {
    setEditingFaq(faq);
    setShowFaqModal(true);
  };

  const updateFaq = (updatedFaq: AgentDocument) => {
    agent?.documents.map((faq: AgentDocument) =>
      faq.id === updatedFaq.id ? updatedFaq : faq
    );
    setShowFaqModal(false);
    setEditingFaq(null);
  };

  const deleteFaq = (faqId: number) => {
    agent!.documents = agent!.documents.filter((faq: AgentDocument) => faq.id !== faqId);
  };

  const analyzeWebsite = async () => {
    // if (!agent.knowledgeBase.websiteUrl.trim()) {
    //   alert('Por favor, insira uma URL válida primeiro.');
    //   return;
    // }

    // setIsAnalyzing(true);
    // setAnalysisProgress(0);

    // // Simular progresso da análise
    // const progressInterval = setInterval(() => {
    //   setAnalysisProgress(prev => {
    //     if (prev >= 100) {
    //       clearInterval(progressInterval);
    //       setIsAnalyzing(false);
    //       return 100;
    //     }
    //     return prev + 10;
    //   });
    // }, 500);

    // // Simular análise completa após 5 segundos
    // setTimeout(() => {
    //   clearInterval(progressInterval);
    //   setIsAnalyzing(false);
    //   setAnalysisProgress(100);

    //   // Adicionar algumas FAQs baseadas na análise simulada
    //   const autoFaqs = [
    //     {
    //       id: Date.now(),
    //       question: "Quais são os horários de atendimento?",
    //       answer: "Nosso horário de atendimento é de segunda a sexta, das 8h às 18h."
    //     },
    //     {
    //       id: Date.now() + 1,
    //       question: "Como posso entrar em contato?",
    //       answer: "Você pode entrar em contato através do WhatsApp, email ou telefone disponível em nosso site."
    //     }
    //   ];

    //   setAgent(prev => ({
    //     ...prev,
    //     knowledgeBase: {
    //       ...prev.knowledgeBase,
    //       faqs: [...prev.knowledgeBase.faqs, ...autoFaqs]
    //     }
    //   }));

    //   alert(t.siteAnalysisComplete);
    // }, 5000);
  };

  // const analyzeYouTubeVideo = async (videoUrl: string) => {
  //   if (!videoUrl.trim()) {
  //     alert('Por favor, insira uma URL válida do YouTube primeiro.');
  //     return;
  //   }

  //   // Validar se é uma URL do YouTube
  //   const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  //   if (!youtubeRegex.test(videoUrl)) {
  //     alert('Por favor, insira uma URL válida do YouTube.');
  //     return;
  //   }

  //   setIsAnalyzingVideo(true);
  //   setVideoAnalysisProgress(0);

  //   // Simular progresso da análise
  //   const progressInterval = setInterval(() => {
  //     setVideoAnalysisProgress(prev => {
  //       if (prev >= 100) {
  //         clearInterval(progressInterval);
  //         setIsAnalyzingVideo(false);
  //         return 100;
  //       }
  //       return prev + 15;
  //     });
  //   }, 300);

  //   // Simular análise completa após 3 segundos
  //   setTimeout(() => {
  //     clearInterval(progressInterval);
  //     setIsAnalyzingVideo(false);
  //     setVideoAnalysisProgress(100);

  //     // Extrair ID do vídeo da URL
  //     const videoId = extractYouTubeVideoId(videoUrl);
  //     const videoTitle = `Vídeo do YouTube (${videoId})`;

  //     // Adicionar vídeo à base de conhecimento
  //     const newVideo = {
  //       id: Date.now(),
  //       url: videoUrl,
  //       title: videoTitle,
  //       description: 'Conteúdo extraído do vídeo do YouTube',
  //       transcript: 'Transcrição simulada do vídeo...',
  //       addedAt: new Date().toISOString()
  //     };

  //     setAgent(prev => ({
  //       ...prev,
  //       knowledgeBase: {
  //         ...prev.knowledgeBase,
  //         youtubeVideos: [...prev.knowledgeBase.youtubeVideos, newVideo]
  //       }
  //     }));

  //     alert(t.videoAnalysisComplete);
  //   }, 3000);
  // };



  // const removeYouTubeVideo = (videoId: number) => {
  //   setAgent(prev => ({
  //     ...prev,
  //     knowledgeBase: {
  //       ...prev.knowledgeBase,
  //       youtubeVideos: prev.knowledgeBase.youtubeVideos.filter(video => video.id !== videoId)
  //     }
  //   }));
  // };

  const addFollowUp = (followUp: FollowUp) => {
    agent.followUps.push(followUp);
    setAgent(agent);
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const editFollowUp = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setShowFollowUpModal(true);
  };

  const updateFollowUp = (updatedFollowUp: FollowUp) => {
    setAgent({
      ...agent,
      followUps: agent.followUps.map((followUp: FollowUp) =>
        followUp.id === updatedFollowUp.id ? updatedFollowUp : followUp
      )
    });
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const deleteFollowUp = (followUpId: number) => {
    setAgent({
      ...agent,
      followUps: agent.followUps.filter((followUp: FollowUp) =>
          followUp.id === followUpId ? null : followUp
      ),
    });
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

  const disconnectChannel = (channelId: number) => {
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
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isActive ? 'bg-primary text-primary-content' :
                      isCompleted ? 'bg-primary text-primary-content' :
                        'bg-base-300 text-neutral'
                    }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-neutral'
                    }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-primary' : 'bg-base-300'
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
                  value={agent!.name}
                  onChange={(e) => updateAgentAttribute('name', e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">{t.description}</span>
                </label>
                <textarea
                  placeholder={t.descriptionPlaceholder}
                  className="textarea textarea-bordered w-full h-24"
                  value={agent!.description}
                  onChange={(e) => updateAgentAttribute('description', e.target.value)}
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
                        checked={agent!.tone === option.value}
                        onChange={(e) => updateAgentAttribute('tone', e.target.value)}
                        className="hidden"
                      />
                      <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2
                        ${
                          agent.tone === option.value
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent'
                        }
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
                        checked={agent.voiceConfiguration === option.value}
                        onChange={(e) => updateAgentAttribute('voiceConfiguration', e.target.value)}
                        className="hidden"
                      />
                      <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2}
                        ${
                          agent.voiceConfiguration === option.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent'
                        }
                        `}>
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
                  value={agent.greetings}
                  onChange={(e) => updateAgentAttribute('greetings', e.target.value)}
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
                      value="simple"
                      checked={agent.prompt.type === 'simple'}
                      onChange={(_) => {
                        updateAgentAttribute('prompt', {id:0, agentId: agent.id, type: 'simple' })
                        setSelectedTemplate('');
                        alert(selectedTemplate);
                      }}
                      className="radio radio-primary mr-2"
                    />
                    <span>{t.useTemplate}</span>
                  </label>
                  <label className="cursor-pointer">  
                    <input
                      type="radio"
                      name="promptMode"
                      value="advanced"
                      checked={agent.prompt.type === 'advanced'}
                      onChange={(e) => updateAgentAttribute('prompt', { id:0, agentId: agent.id, type: 'advanced'})}
                      className="radio radio-primary mr-2"
                    />
                    <span>{t.advancedMode}</span>
                  </label>
                </div>

                {/* Templates */}
                {agent.prompt.type === 'simple' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {systemPromptTemplates.map(template => (
                        <label key={template.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="template"
                            value={template.id}
                            // checked={agentData.behavior.systemPrompt.selectedTemplate === template.id}
                            onChange={(e) => {
                              const template = systemPromptTemplates.find(t => t.id === e.target.value);
                              updateAgentAttribute('prompt', {
                                ...agent.prompt,
                                prompt:  template ? template.prompt : ''
                                });
                              setSelectedTemplate(e.target.value);
                            }}
                            className="hidden"
                          />
                          <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2 ${
                            selectedTemplate === template.id 
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
                    {agent.prompt.type && (
                      <div className="mt-6">
                        <label className="label">
                          <span className="label-text font-medium">{t.systemPromptEditable}</span>
                        </label>
                        <textarea
                          placeholder={t.systemPromptEditablePlaceholder}
                          className="textarea textarea-bordered w-full h-48"
                          value={agent.prompt.prompt}
                          onChange={(e) => updateAgentAttribute('prompt', { 
                            ...agent.prompt,
                            prompt: e.target.value
                          })}
                        />
                        <div className="label">
                          <span className="label-text-alt">{t.systemPromptEditableHelp}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Modo Avançado */}
                {agent.prompt.type === 'advanced' && (
                  <div>
                    <textarea
                      placeholder={t.advancedTemplatePlaceholder}
                      className="textarea textarea-bordered w-full h-48"
                      value={agent.prompt.prompt}
                      onChange={(e) => {
                        updateAgentAttribute('prompt', {
                          ...agent.prompt,
                          prompt: e.target.value
                        });
                      }}
                    />
                    <div className="label">
                      <span className="label-text-alt">{t.agentBehaviorPlaceholder}</span>
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
                  value={agent.responseTime}
                  onChange={(e) => updateAgentAttribute('responseTime', e.target.value as unknown as 0 | 1 | 5 | 15)}
                >
                  <option value="immediate">{t.immediate}</option>
                  <option value="1min">{t.responseTime1}</option>
                  <option value="5min">{t.responseTime5}</option>
                  <option value="15min">{t.responseTime15}</option>
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
                      checked={checkboxWorkingHours ||agent.scheduleAgentBegin != ''}
                      onChange={() => setCheckboxWorkingHours(!checkboxWorkingHours)}
                    />
                    <span>{t.setWorkingHours}</span>
                  </label>
                </div>

                {(checkboxWorkingHours || agent.scheduleAgentBegin != '') && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="label">
                        <span className="label-text">{t.start}</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered"
                        value={agent.scheduleAgentBegin}
                        onChange={(e) => updateAgentAttribute('scheduleAgentBegin', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">{t.end}</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered"
                        value={agent.scheduleAgentEnd}
                        onChange={(e) => updateAgentAttribute('scheduleAgentEnd', e.target.value)}
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
                    value={agent.description}
                  // onChange={(e) => updateAgentData('knowledgeBase', { websiteUrl: e.target.value })}
                  />
                  <button
                    onClick={analyzeWebsite}
                    // disabled={isAnalyzing || !agent.documents.websiteUrl.trim()}
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
                      // onClick={() => {
                      //   analyzeYouTubeVideo(youtubeVideoUrl);
                      //   setYoutubeVideoUrl('');
                      // }}
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
                  {agent.documents.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-base-content mb-3">{t.addedVideos}</h4>
                      <div className="space-y-3">
                        {agent.documents.map((video) => (
                          <div key={video.id} className="card bg-base-200">
                            <div className="card-body p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                      </svg>
                                    </div>
                                    <h5 className="font-semibold text-base-content">{''}</h5>
                                  </div>
                                  <p className="text-sm text-neutral mb-2">{''}</p>
                                  <p className="text-xs text-neutral">{t.addedOn} {new Date('').toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => window.open('', '_blank')}
                                    className="btn btn-ghost btn-xs"
                                    title={t.openVideo}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </button>
                                  <button
                                    // onClick={() => removeYouTubeVideo(video.id)}
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
                  {agent.documents.length > 0 && (
                    <div className="space-y-3">
                      {agent.documents.map((faq) => (
                        <div key={faq.id} className="card bg-base-200">
                          <div className="card-body p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base-content mb-2">{''}</h4>
                                <p className="text-sm text-neutral">{''}</p>
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
                    checked={agent.followUps.length > 0}
                  // onChange={(e) => updateAgentData('followUps', { enabled: e.target.checked })}
                  />
                  <span>{t.enableFollowUps}</span>
                </label>
              </div>

              {agent.followUps.length > 0 && (
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
                  {agent.followUps.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base-content">{t.createdSequences}</h4>
                      {agent.followUps[0].messageSequences.map((sequence) => (
                        <div key={sequence.id} className="card bg-base-200">
                          <div className="card-body p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-base-content mb-1">{''}</h5>
                                <p className="text-sm text-neutral mb-2">{''}</p>
                                <div className="flex items-center space-x-4 text-xs text-neutral">
                                  <span>Trigger: {''}</span>
                                  <span>
                                    Delay: `${sequence.days ?? 0}d ${sequence.hours ?? 0}h ${sequence.minutes ?? 0}m`
                                     
                                  </span>
                                  {/* <span>{sequence..length} mensagens</span> */}
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
                  // const isConnected = agent.serviceProviders.includes(channel);

                  return (
                    <div key={channel.id} className="card bg-base-200 hover:bg-base-300 transition-colors">
                      <div className="card-body p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${channel.id === 'hubsoft' ? '' : 'bg-green-500'
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
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-base-content">{channel.name}</h4>
                              <p className="text-sm text-neutral mt-1">{channel.description}</p>
                            </div>
                          </div>
                          {/* <div className={`badge ${isConnected ? 'badge-success' : 'badge-neutral'}`}>
                            {isConnected ? t.connected : t.disconnected}
                          </div> */}
                        </div>

                        {/* {isConnected ? (
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
                        )} */}
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
          document={editingFaq ?? undefined}
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