import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { useState } from "react"

const NewAgentBehavior: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent, updateAgentAttribute } = useAgentStore();

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [checkboxWorkingHours, setCheckboxWorkingHours] = useState(false);

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

  return (
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
              checked={agent.promptType === 'simple'}
              onChange={(_) => {
                updateAgentAttribute('promptType', 'simple')
                setSelectedTemplate('');
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
              checked={agent.promptType === 'advanced'}
              onChange={(_) => updateAgentAttribute('promptType', 'advanced' )}
              className="radio radio-primary mr-2"
            />
            <span>{t.advancedMode}</span>
          </label>
        </div>

        {/* Templates */}
        {agent.promptType === 'simple' && (
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
                      updateAgentAttribute('prompt', template ? template.prompt : '');
                      setSelectedTemplate(e.target.value);
                    }}
                    className="hidden"
                  />
                  <div className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 border-2 ${selectedTemplate === template.id
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
            {agent.promptType && (
              <div className="mt-6">
                <label className="label">
                  <span className="label-text font-medium">{t.systemPromptEditable}</span>
                </label>
                <textarea
                  placeholder={t.systemPromptEditablePlaceholder}
                  className="textarea textarea-bordered w-full h-48"
                  value={agent.prompt}
                  onChange={(e) => updateAgentAttribute('prompt', e.target.value)}
                />
                <div className="label">
                  <span className="label-text-alt">{t.systemPromptEditableHelp}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modo Avançado */}
        {agent.promptType === 'advanced' && (
          <div>
            <textarea
              placeholder={t.advancedTemplatePlaceholder}
              className="textarea textarea-bordered w-full h-48"
              value={agent.prompt}
              onChange={(e) => {
                updateAgentAttribute('prompt', e.target.value);
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
          <option value="0">{t.immediate}</option>
          <option value="1">{t.responseTime1}</option>
          <option value="5">{t.responseTime5}</option>
          <option value="15">{t.responseTime15}</option>
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
              checked={checkboxWorkingHours || agent.scheduleAgentBegin != ''}
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
  )
}

export default NewAgentBehavior
