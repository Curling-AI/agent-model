import { useLanguage } from "@/context/LanguageContext";
import { useFollowUpStore } from "@/store/follow-up";
import { useSystemStore } from "@/store/system";
import { useTranslation } from "@/translations";
import { FollowUp, FollowUpMessage, FollowUpMessageDocument } from "@/types/follow_up";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FileUtils } from "@/utils/file";

// Componente Modal Follow-up
interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUp?: FollowUp;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ isOpen, onClose, followUp }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  const { crmColumns, followUpTriggers } = useSystemStore();
  const { followUpMessages, followUpMessageDocuments, setFollowUpMessages, setFollowUpMessageDocuments, addOrUpdateFollowUp } = useFollowUpStore();

  const [negativeId, setNegativeId] = useState(-1);
  const [followUpData, setFollowUpData] = useState<FollowUp>(followUp || {
    id: 0,
    name: "",
    description: "",
    organizationId: 0,
    agentId: 0,
    crmColumn: crmColumns[0],
    trigger: followUpTriggers[0],
    messages: []
  });

  const messageTemplateOptions = [
    { value: 'custom', label: t.customMessage },
    { value: 'welcome', label: t.welcomeTemplate },
    { value: 'follow_up', label: t.followUpTemplate },
    { value: 'reminder', label: t.reminderTemplate },
    { value: 'offer', label: t.offerTemplate }
  ];

  const delayOptions = [
    { value: '30min', label: t.thirtyMinutes },
    { value: '1h', label: t.oneHour },
    { value: '2h', label: t.twoHours },
    { value: '6h', label: t.sixHours },
    { value: '1d', label: t.oneDay },
    { value: '3d', label: t.threeDays },
    { value: '7d', label: t.oneWeek }
  ];

  useEffect(() => {
    if (followUpMessages.length === 0) {
      addMessage();
    }
  }, [followUp]);

  const addMessage = () => {
    setFollowUpMessages([...followUpMessages,
    {
      id: negativeId,
      followUpId: 0,
      message: '',
      template: 'custom',
      documents: [],
      delayType: 'immediate',
      days: 0,
      hours: 0,
      minutes: 0
    } as FollowUpMessage]);
    setNegativeId(negativeId - 1);
  };

  const removeMessage = (messageId: number) => {
    if (followUpMessages.length > 1) {
      setFollowUpMessages([...followUpMessages.filter(m => m.id !== messageId)]);
    }
  };

  const updateMessage = (messageId: number, field: string, value: any) => {
    setFollowUpMessages([
      ...followUpMessages.map(m =>
        m.id === messageId ? { ...m, [field]: value } : m
      )
    ]);
  };

  const addAttachment = async (messageId: number, type: string, file: File) => {
    const attachment = {
      id: negativeId,
      followUpMessageId: messageId,
      name: file.name,
      type: type as 'document' | 'video' | 'audio',
      content: await FileUtils.fileToBase64(file),
    } as FollowUpMessageDocument;
    setFollowUpMessageDocuments([...followUpMessageDocuments, attachment]);
    setNegativeId(negativeId - 1);
  };

  const removeAttachment = (attachmentId: number) => {
    setFollowUpMessageDocuments([...followUpMessageDocuments.filter(a => a.id !== attachmentId)]);
  };

  const handleTemplateChange = (message: FollowUpMessage, templateValue: 'welcome' | 'follow_up' | 'reminder' | 'offer' | 'custom') => {
    const templates = {
      welcome: 'Olá! Bem-vindo à nossa empresa. Como posso ajudá-lo hoje?',
      follow_up: 'Oi! Só passando para ver como está indo. Precisa de alguma ajuda?',
      reminder: 'Lembrete: Não se esqueça do nosso compromisso agendado.',
      offer: 'Temos uma oferta especial para você! Que tal dar uma olhada?'
    };

    setFollowUpMessages([
      ...followUpMessages.map(m =>
        m.id === message.id ? {
          ...m,
          message: templateValue === 'custom' ? m.message : templates[templateValue] || ''
        } : m
      )
    ]);
  };

  const handleSubmit = () => {
    followUpMessages.map(m => {
      m.documents = followUpMessageDocuments.filter(d => d.followUpMessageId === m.id);
    });
    followUpData.messages = followUpMessages;
    addOrUpdateFollowUp(followUpData);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold">{followUp ? t.editSequence : t.createFollowUpSequence}</h2>
            <p className="text-neutral mt-1">{t.configureAutoMessages}</p>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">{t.sequenceName}</span>
              </label>
              <input
                type="text"
                placeholder={t.sequenceNamePlaceholder}
                className="input input-bordered w-full"
                value={followUpData.name}
                onChange={(e) => setFollowUpData({ ...followUpData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t.crmColumns}</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={followUpData.crmColumn?.id || ''}
                onChange={(e) => setFollowUpData({
                  ...followUpData,
                  crmColumn: crmColumns.find(c => c.id === Number(e.target.value)) || crmColumns[0]
                })}>

                {crmColumns.length > 0 && crmColumns.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">{t.triggers}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={followUpData.trigger?.id || ''}
              onChange={(e) => setFollowUpData({ ...followUpData, trigger: followUpTriggers.find(t => t.id === Number(e.target.value)) || followUpTriggers[0] })}
            >
              {followUpTriggers.length > 0 && followUpTriggers.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">{t.sequenceDescription}</span>
            </label>
            <textarea
              placeholder={t.sequenceDescriptionPlaceholder}
              className="textarea textarea-bordered w-full h-20"
              value={followUpData.description}
              onChange={(e) => setFollowUpData({ ...followUpData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">{t.sequenceMessages}</span>
            </label>
            <div className="space-y-4">
              {followUpMessages.map((message, index) => (
                <div key={message.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{t.messageNumber} {index + 1}</h4>
                      {followUpMessages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeMessage(message.id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Template Selection */}
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">{t.messageTemplates}</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={message.message}
                          onChange={(e) => handleTemplateChange(message, e.target.value as 'welcome' | 'follow_up' | 'reminder' | 'offer' | 'custom')}
                        >
                          {messageTemplateOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Message Content */}
                      <div>
                        <label className="label">
                          <span className="label-text">{t.message}</span>
                        </label>
                        <textarea
                          placeholder={t.messagePlaceholder}
                          className="textarea textarea-bordered w-full h-24"
                          value={message.message}
                          onChange={(e) => updateMessage(message.id, 'message', e.target.value)}
                          required
                        />
                      </div>

                      {/* Attachments */}
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">{t.attachments}</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById(`doc-${message.id}`)!.click()}
                            className="btn btn-outline btn-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t.addDocument}
                          </button>
                          <input
                            id={`doc-${message.id}`}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => e.target.files && addAttachment(message.id, 'document', e.target.files[0])}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => document.getElementById(`video-${message.id}`)!.click()}
                            className="btn btn-outline btn-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {t.addVideo}
                          </button>
                          <input
                            id={`video-${message.id}`}
                            type="file"
                            accept="video/*"
                            onChange={(e) => e.target.files && addAttachment(message.id, 'video', e.target.files[0])}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => document.getElementById(`audio-${message.id}`)!.click()}
                            className="btn btn-outline btn-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {t.addAudio}
                          </button>
                          <input
                            id={`audio-${message.id}`}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => e.target.files && addAttachment(message.id, 'audio', e.target.files[0])}
                            className="hidden"
                          />
                        </div>

                        {/* Display Attachments */}
                        {followUpMessageDocuments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <div className="text-sm font-medium text-neutral mb-2">{t.attachments}:</div>
                            {followUpMessageDocuments.map(attachment => {
                              if (attachment.followUpMessageId !== message.id) return null;
                              return (
                                <div key={attachment.id} className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-400">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center ${attachment.type === 'document' ? 'bg-blue-100 text-blue-600' :
                                      attachment.type === 'video' ? 'bg-red-100 text-red-600' :
                                        'bg-green-100 text-green-600'
                                      }`}>
                                      {attachment.type === 'document' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      )}
                                      {attachment.type === 'video' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                      {attachment.type === 'audio' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">{attachment.name}</div>
                                      {/* <div className="text-xs text-neutral">
                                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                    </div> */}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-white"
                                    title={t.removeAttachment}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Delay */}
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">{t.delay}</span>
                        </label>
                        <div className="space-y-3">
                          <select
                            className="select select-bordered w-full"
                            value={message.delayType}
                            onChange={(e) => updateMessage(message.id, 'delayType', e.target.value)}
                          >
                            <option value="immediate">{t.immediate}</option>
                            <option value="custom">{t.customDelay}</option>
                          </select>

                          {message.delayType === 'custom' && (
                            <div className="grid md:grid-cols-3 gap-2">
                              <div>
                                <label className="label">
                                  <span className="label-text text-xs">{t.days}</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  className="input input-bordered w-full"
                                  placeholder="0"
                                  value={message.days}
                                  onChange={(e) => updateMessage(message.id, 'days', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="label">
                                  <span className="label-text text-xs">{t.hours}</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="23"
                                  className="input input-bordered w-full"
                                  placeholder="0"
                                  value={message.hours}
                                  onChange={(e) => updateMessage(message.id, 'hours', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="label">
                                  <span className="label-text text-xs">{t.minutes}</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="59"
                                  className="input input-bordered w-full"
                                  placeholder="0"
                                  value={message.minutes}
                                  onChange={(e) => updateMessage(message.id, 'minutes', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          )}

                          {message.delayType === 'custom' && (
                            <div className="text-xs text-neutral mt-1">
                              {message.days > 0 && `${message.days} ${message.days === 1 ? t.days.slice(0, -1) : t.days}`}
                              {message.hours > 0 && `${message.days > 0 ? ', ' : ''}${message.hours} ${message.hours === 1 ? t.hours.slice(0, -1) : t.hours}`}
                              {message.minutes > 0 && `${(message.days > 0 || message.hours > 0) ? ', ' : ''}${message.minutes} ${message.minutes === 1 ? t.minutes.slice(0, -1) : t.minutes}`}
                              {message.days === 0 && message.hours === 0 && message.minutes === 0 && t.delayPlaceholder}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMessage}
                className="btn btn-outline btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addMessage}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300">
          <button onClick={handleClose} className="btn btn-ghost">
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!followUpData.name.trim() || !followUpMessages.some(m => m.message.trim())}
            className="btn btn-primary"
          >
            {followUp ? t.update : t.create}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;