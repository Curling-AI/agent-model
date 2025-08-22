import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { FollowUp } from "@/types";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

// Componente Modal Follow-up
interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  followUp?: any;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ isOpen, onClose, onSave, followUp }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [formData, setFormData] = useState<FollowUp>({
    name: followUp?.name || '',
    description: followUp?.description || '',
    crmColumn: followUp?.crmColumn || 'new_leads',
    trigger: followUp?.trigger || 'new_lead',
    delay: followUp?.delay || { type: 'immediate', days: 0, hours: 0, minutes: 0 },
    messages: followUp?.messages || [{ 
      id: 1, 
      content: '', 
      template: 'custom',
      attachments: [],
      delay: { type: 'immediate', days: 0, hours: 0, minutes: 0 }
    }]
  });

  const crmColumnOptions = [
    { value: 'new_leads', label: t.newLeads },
    { value: 'qualified', label: t.qualified },
    { value: 'proposal_sent', label: t.proposalSent },
    { value: 'negotiation', label: t.negotiation },
    { value: 'closed', label: t.closed }
  ];

  const triggerOptions = [
    { value: 'new_lead', label: t.newLeadTrigger },
    { value: 'lead_qualified', label: t.leadQualifiedTrigger },
    { value: 'proposal_sent', label: t.proposalSentTrigger },
    { value: 'payment_received', label: t.paymentReceivedTrigger },
    { value: 'follow_up_reminder', label: t.followUpReminderTrigger },
    { value: 'birthday', label: t.birthdayTrigger },
    { value: 'custom', label: t.customTrigger }
  ];

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

//   const addMessage = () => {
//     const newId = Math.max(...formData.messages.map(m => m.id), 0) + 1;
//     setFormData(prev => ({
//       ...prev,
//       messages: [...prev.messages, { 
//         id: newId, 
//         content: '', 
//         template: 'custom',
//         attachments: [],
//         delay: { type: 'immediate', days: 0, hours: 0, minutes: 0 }
//       }]
//     }));
//   };

//   const removeMessage = (messageId: number) => {
//     if (formData.messages.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         messages: prev.messages.filter(m => m.id !== messageId)
//       }));
//     }
//   };

//   const updateMessage = (messageId: number, field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       messages: prev.messages.map(m => 
//         m.id === messageId ? { ...m, [field]: value } : m
//       )
//     }));
//   };

//   const addAttachment = (messageId: number, type: string, file: File) => {
//     const attachment = {
//       id: Date.now(),
//       type,
//       name: file.name,
//       size: file.size,
//       url: URL.createObjectURL(file)
//     };
    
//     setFormData(prev => ({
//       ...prev,
//       messages: prev.messages.map(m => 
//         m.id === messageId ? { 
//           ...m, 
//           attachments: [...m.attachments, attachment] 
//         } : m
//       )
//     }));
//   };

//   const removeAttachment = (messageId: number, attachmentId: number) => {
//     setFormData(prev => ({
//       ...prev,
//       messages: prev.messages.map(m => 
//         m.id === messageId ? { 
//           ...m, 
//           attachments: m.attachments.filter(a => a.id !== attachmentId) 
//         } : m
//       )
//     }));
//   };

//   const handleTemplateChange = (messageId: number, templateValue: string) => {
//     const templates = {
//       welcome: 'Olá! Bem-vindo à nossa empresa. Como posso ajudá-lo hoje?',
//       follow_up: 'Oi! Só passando para ver como está indo. Precisa de alguma ajuda?',
//       reminder: 'Lembrete: Não se esqueça do nosso compromisso agendado.',
//       offer: 'Temos uma oferta especial para você! Que tal dar uma olhada?'
//     };
    
//     setFormData(prev => ({
//       ...prev,
//       messages: prev.messages.map(m => 
//         m.id === messageId ? { 
//           ...m, 
//           template: templateValue,
//           content: templateValue === 'custom' ? m.content : templates[templateValue] || ''
//         } : m
//       )
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (formData.name.trim() && formData.messages.some(m => m.content.trim())) {
//       onSave({
//         ...followUp,
//         ...formData
//       });
//     }
//   };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      crmColumn: 'new_leads',
      trigger: 'new_lead',
      delay: { type: 'immediate', days: 0, hours: 0, minutes: 0 },
      messages: [{ 
        id: 1, 
        content: '', 
        template: 'custom',
        attachments: [],
        delay: { type: 'immediate', days: 0, hours: 0, minutes: 0 }
      }]
    });
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
        {/* <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh] space-y-6"> */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">{t.sequenceName}</span>
              </label>
              <input 
                type="text" 
                placeholder={t.sequenceNamePlaceholder}
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t.crmColumns}</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={formData.crmColumn}
                onChange={(e) => setFormData(prev => ({...prev, crmColumn: e.target.value}))}
              >
                {crmColumnOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
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
              value={formData.trigger}
              onChange={(e) => setFormData(prev => ({...prev, trigger: e.target.value}))}
            >
              {triggerOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">{t.sequenceMessages}</span>
            </label>
            <div className="space-y-4">
              {formData.messages.map((message, index) => (
                <div key={message.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{t.messageNumber} {index + 1}</h4>
                      {formData.messages.length > 1 && (
                        <button 
                          type="button"
                        //   onClick={() => removeMessage(message.id)}
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
                          value={message.template}
                        //   onChange={(e) => handleTemplateChange(message.id, e.target.value)}
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
                          value={message.content}
                        //   onChange={(e) => updateMessage(message.id, 'content', e.target.value)}
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
                            // onClick={() => document.getElementById(`doc-${message.id}`).click()}
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
                            // onChange={(e) => e.target.files[0] && addAttachment(message.id, 'document', e.target.files[0])}
                            className="hidden"
                          />
                          
                          <button
                            type="button"
                            // onClick={() => document.getElementById(`video-${message.id}`).click()}
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
                            // onChange={(e) => e.target.files[0] && addAttachment(message.id, 'video', e.target.files[0])}
                            className="hidden"
                          />
                          
                          <button
                            type="button"
                            // onClick={() => document.getElementById(`audio-${message.id}`).click()}
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
                            // onChange={(e) => e.target.files[0] && addAttachment(message.id, 'audio', e.target.files[0])}
                            className="hidden"
                          />
                        </div>
                        
                        {/* Display Attachments */}
                        {message.attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <div className="text-sm font-medium text-neutral mb-2">{t.attachments}:</div>
                            {message.attachments.map(attachment => (
                              <div key={attachment.id} className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-400">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                    attachment.type === 'document' ? 'bg-blue-100 text-blue-600' :
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
                                    <div className="text-xs text-neutral">
                                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                //   onClick={() => removeAttachment(message.id, attachment.id)}
                                  className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-white"
                                  title={t.removeAttachment}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
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
                            value={message.delay.type}
                            // onChange={(e) => updateMessage(message.id, 'delay', { 
                            //   ...message.delay, 
                            //   type: e.target.value 
                            // })}
                          >
                            <option value="immediate">{t.immediate}</option>
                            <option value="custom">{t.customDelay}</option>
                          </select>
                          
                          {message.delay.type === 'custom' && (
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
                                  value={message.delay.days}
                                //   onChange={(e) => updateMessage(message.id, 'delay', { 
                                //     ...message.delay, 
                                //     days: parseInt(e.target.value) || 0
                                //   })}
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
                                  value={message.delay.hours}
                                //   onChange={(e) => updateMessage(message.id, 'delay', { 
                                //     ...message.delay, 
                                //     hours: parseInt(e.target.value) || 0
                                //   })}
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
                                  value={message.delay.minutes}
                                //   onChange={(e) => updateMessage(message.id, 'delay', { 
                                //     ...message.delay, 
                                //     minutes: parseInt(e.target.value) || 0
                                //   })}
                                />
                              </div>
                            </div>
                          )}
                          
                          {message.delay.type === 'custom' && (
                            <div className="text-xs text-neutral mt-1">
                              {message.delay.days > 0 && `${message.delay.days} ${message.delay.days === 1 ? t.days.slice(0, -1) : t.days}`}
                              {message.delay.hours > 0 && `${message.delay.days > 0 ? ', ' : ''}${message.delay.hours} ${message.delay.hours === 1 ? t.hours.slice(0, -1) : t.hours}`}
                              {message.delay.minutes > 0 && `${(message.delay.days > 0 || message.delay.hours > 0) ? ', ' : ''}${message.delay.minutes} ${message.delay.minutes === 1 ? t.minutes.slice(0, -1) : t.minutes}`}
                              {message.delay.days === 0 && message.delay.hours === 0 && message.delay.minutes === 0 && t.delayPlaceholder}
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
                // onClick={addMessage}
                className="btn btn-outline btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addMessage}
              </button>
            </div>
          </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300">
          <button onClick={handleClose} className="btn btn-ghost">
            {t.cancel}
          </button>
          <button 
            // onClick={handleSubmit}
            // disabled={!formData.name.trim() || !formData.messages.some(m => m.content.trim())}
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