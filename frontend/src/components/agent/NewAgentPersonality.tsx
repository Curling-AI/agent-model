import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";

const NewAgentPersonality: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent, updateAgentAttribute } = useAgentStore();

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

  return <div className="space-y-6">
    <h3 className="text-xl font-semibold mb-4">{t.agentPersonality}</h3>

    <div>
      <label className="label">
        <span className="label-text label-medium-custom">{t.agentName}</span>
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
        <span className="label-text label-medium-custom">{t.description}</span>
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
        <span className="label-text label-medium-custom">{t.voiceTone}</span>
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
                        ${agent.tone === option.value
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
        <span className="label-text label-medium-custom">{t.voiceSettings}</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {
        voiceOptions.map(option => (
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
                        ${agent.voiceConfiguration === option.value
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
        <span className="label-text label-medium-custom">{t.greetingMessage}</span>
      </label>
      <textarea
        placeholder={t.greetingMessagePlaceholder}
        className="textarea textarea-bordered w-full h-20"
        value={agent.greetings}
        onChange={(e) => updateAgentAttribute('greetings', e.target.value)}
      />
    </div>
  </div>;
};

export default NewAgentPersonality;
