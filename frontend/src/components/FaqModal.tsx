// Componente Modal FAQ

import { useLanguage } from "@/context/LanguageContext";
import { generateChunksFromFaq } from "@/services/chunker";
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
  const [agentDocument, setAgentDocument] = useState<Document>(document || { id: 0, agentId: agent.id, type: 'faq', name: '', content: '' });
  const { faqDocuments, setFaqDocuments } = useDocumentStore();

  const handleSubmit = async () => {
    if (agentDocument) {
      const chunks = await generateChunksFromFaq(agentDocument.name, agentDocument.content!);
      setFaqDocuments([
        ...faqDocuments,
        { ...agentDocument, chunks }
      ])
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const clearDocument = () => {
    setAgentDocument({ id: 0, agentId: agent.id, type: 'faq', name: '', content: '' });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold">{agentDocument.id !== 0 ? t.editFaq : t.addFaq}</h2>
            <p className="text-neutral mt-1">Configure a pergunta e resposta</p>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>
          <label className="label">
            <span className="label-text font-medium">{t.question}</span>
          </label>
          <input
            type="text"
            placeholder={t.questionPlaceholder}
            className="input input-bordered w-full"
            value={agentDocument.name}
            onChange={(e) => setAgentDocument(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">{t.answer}</span>
          </label>
          <textarea
            placeholder={t.answerPlaceholder}
            className="textarea textarea-bordered w-full h-32"
            value={agentDocument.content}
            onChange={(e) => setAgentDocument(prev => ({ ...prev, content: e.target.value }))}
            required
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300">
          <button onClick={handleClose} className="btn btn-ghost">
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!agentDocument.name.trim() || !agentDocument.content!.trim()}
            className="btn btn-primary"
          >
            {agentDocument.id !== 0 ? t.update : t.add}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;