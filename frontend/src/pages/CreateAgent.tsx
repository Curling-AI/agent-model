import { useEffect, useState } from 'react';
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
  Check,
  ArrowLeft
} from 'lucide-react';
import { useAgentStore } from '@/store/agent';
import NewAgentPersonality from '@/components/agent/NewAgentPersonality';
import NewAgentBehavior from '@/components/agent/NewAgentBehavior';
import NewAgentKnowledge from '@/components/agent/NewAgentKnowledge';
import NewAgentFollowUp from '@/components/agent/NewAgentFollowUp';
import NewAgentChannel from '@/components/agent/NewAgentChannel';
import { useAuthStore } from '@/store/auth';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(1);

  const { agent, createOrUpdateAgent } = useAgentStore();

  const { user, getLoggedUser } = useAuthStore();
  
  useEffect(() => {
    getLoggedUser();
  }, []);

  const steps = [
    { id: 1, name: t.personality, icon: User },
    { id: 2, name: t.behavior, icon: Brain },
    { id: 3, name: t.knowledgeBase, icon: BookOpen },
    { id: 4, name: t.followUps, icon: Mail },
    { id: 5, name: t.channels, icon: MessageCircle }
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
    navigate('/agents');
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
            <h1 className="text-3xl font-bold text-base-content">{agent.id && agent.id > 0 ? t.editAgent : t.createNewAgent}</h1>
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
            <NewAgentPersonality />
          )}

          {currentStep === 2 && (
            <NewAgentBehavior />
          )}

          {currentStep === 3 && (
            <NewAgentKnowledge />
          )}

          {currentStep === 4 && (
            <NewAgentFollowUp organizationId={user?.organizationId!} />
          )}

          {currentStep === 5 && (
            <NewAgentChannel />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn btn-sm btn-ghost"
          style={{ textTransform: 'uppercase' }}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t.previous}
        </button>

        <div className="text-sm text-neutral">
          {t.step} {currentStep} {t.of} {steps.length}
        </div>

        {currentStep === steps.length ? (
          <button onClick={handleSubmit} className="btn btn-sm btn-primary" style={{ textTransform: 'uppercase' }}>
            <Check className="w-4 h-4 mr-1" />
            {t.createAgent}
          </button>
        ) : (
          <button onClick={async () => { 
            switch (currentStep) {
              case 1:
              case 2:
                await createOrUpdateAgent(agent); 
                break;
              default:
                break;
            }
            nextStep();
          }} className="btn btn-sm btn-primary" style={{ textTransform: 'uppercase' }}>
            {t.next}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateAgent; 