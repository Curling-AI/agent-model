import { useLanguage } from '@/context/LanguageContext';
import { useLeadStore } from '@/store/lead';
import { useTranslation } from '@/translations';
import { Lead } from '@/types/lead';
import { isValidEmail } from '@/utils/email';
import { Building, DollarSign, Mail, Phone, User, X } from 'lucide-react';
import { useState } from 'react';

interface LeadModalProps {
  onClose: () => void;
  lead: Lead | null;
  organizationId: number;
}

const LeadModal: React.FC<LeadModalProps> = ({ onClose, lead, organizationId }) => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { upsertLead } = useLeadStore();

  const [emailError, setEmailError] = useState(false);
  const [newLead, setNewLead] = useState<Lead>(lead ||{
      name: '',
      company: '',
      email: '',
      phone: '',
      value: 0,
      source: 'whatsapp' as 'whatsapp' | 'email' | 'website' | 'phone' | 'referral',
      observation: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      tags: [],
      organizationId: organizationId,
      id: 0,
      status: 1
    });

  const tags = [
    { value: 'enterprise', label: t.enterprise },
    { value: 'startup', label: t.startup },
    { value: 'individual', label: t.individual },
    { value: 'education', label: t.education },
    { value: 'urgent', label: t.urgent },
    { value: 'premium', label: t.premium }
  ];
  
  // Função para criar novo lead
  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email) {
      alert(`${t.nameRequired} e ${t.emailRequired}`);
      return;
    }

    const avatar = newLead.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newLeadData = {
      id: newLead.id || 0,
      name: newLead.name,
      company: newLead.company,
      avatar: avatar,
      email: newLead.email,
      phone: newLead.phone.replace(/\D/g, ''),
      value: newLead.value || 0,
      status: newLead.status || 0,
      priority: newLead.priority,
      lastContact: t.now,
      source: newLead.source,
      tags: newLead.tags,
      observation: newLead.observation,
      organizationId: organizationId
    };

    await upsertLead(newLeadData);

    onClose();
  };

  // Função para adicionar/remover tags
  const toggleTag = (tag: string) => {
    setNewLead(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
    console.log(newLead.tags);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{lead ? t.editLead : t.newLead}</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => onClose()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t.name} *
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder={t.fullName}
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  {t.company}
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder={t.companyName}
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {t.email} *
                </span>
              </label>
              <input
                required
                type="email"
                className={`input input-bordered input-sm ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder={t.emailPlaceholder}
                value={newLead.email}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isValidEmail(value)) {
                    setEmailError(true);
                  } else {
                    setEmailError(false);
                  }
                  setNewLead({ ...newLead, email: value });
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {t.phone}
                </span>
              </label>
              <input
                type="tel"
                className="input input-bordered input-sm"
                placeholder={t.phonePlaceholder}
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t.estimatedValue}
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered input-sm"
                placeholder={t.valuePlaceholder}
                value={newLead.value}
                onChange={(e) => setNewLead({ ...newLead, value: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.source}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value as 'whatsapp' | 'email' | 'website' | 'phone' | 'referral' })}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Telefone</option>
                <option value="website">Site</option>
                <option value="referral">Indicação</option>
              </select>
            </div>
          </div>

          {/* Prioridade */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.priority}</span>
            </label>
            <div className="flex space-x-2">
              {['low', 'medium', 'high'].map(priority => (
                <button
                  key={priority}
                  style={{ textTransform: 'uppercase' }}
                  className={`btn btn-sm ${newLead.priority === priority
                      ? 'btn-primary'
                      : 'btn-outline'
                    }`}
                  onClick={() => setNewLead({ ...newLead, priority: priority as 'low' | 'medium' | 'high' })}
                >
                  {priority === 'low' ? t.low :
                    priority === 'medium' ? t.medium : t.high}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.tags}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.value}
                  className={`badge ${newLead.tags.includes(tag.value)
                      ? 'badge-primary'
                      : 'badge-outline'
                    } cursor-pointer`}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.notes}</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm h-24"
              style={{ width: '100%' }}
              placeholder={t.notesPlaceholder}
              value={newLead.observation}
              onChange={(e) => setNewLead({ ...newLead, observation: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onClose()}
            style={{ textTransform: 'uppercase' }}
          >
            {t.cancel}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreateLead}
            style={{ textTransform: 'uppercase' }}
          >
            {lead ? t.update : t.create}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;