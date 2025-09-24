import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useDocumentStore } from "@/store/document";
import { useTranslation } from "@/translations";
import { Document } from "@/types/agent";

import { X } from "lucide-react";
import { useState } from "react";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document;
}

const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, document }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  const { agent } = useAgentStore();
  const { createDocument, fetchDocuments } = useDocumentStore();
  const [faqDocument, setFaqDocument] = useState<Document>(document || { id: 0, type: 'faq', name: '', content: '', agentId: agent.id });

  const handleSubmit = async () => {
    if (faqDocument) {
      await createDocument({ ...faqDocument, agentId: agent.id });

      fetchDocuments(agent.id);
      
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black  flex items-center justify-center z-50 p-4 bg-opacity-custom">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold">{faqDocument.id !== 0 ? t.editFaq : t.addFaq}</h2>
            <p className="text-neutral mt-1">Configure a pergunta e resposta</p>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="label">
              <span className="label-text label-medium-custom">{t.question}</span>
            </label>
            <input
              type="text"
              placeholder={t.questionPlaceholder}
              className="input input-bordered w-full"
              value={faqDocument.name}
              onChange={(e) => setFaqDocument(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text label-medium-custom">{t.answer}</span>
            </label>
            <textarea
              placeholder={t.answerPlaceholder}
              className="textarea textarea-bordered w-full h-32"
              value={faqDocument.content}
              onChange={(e) => setFaqDocument(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300">
          <button onClick={handleClose} className="btn btn-ghost" style={{ textTransform: 'uppercase' }}>
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!faqDocument.name.trim() || !faqDocument.content!.trim()}
            className="btn btn-primary"
            style={{ textTransform: 'uppercase' }}
          >
            {faqDocument.id !== 0 ? t.update : t.add}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;