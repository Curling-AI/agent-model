import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Agent, AgentDocument } from "@/types/agent";
import React, { useState } from "react";
import FaqModal from "./FaqModal";
import { Edit, Plus, Trash2 } from "lucide-react";

interface FaqDocument extends AgentDocument {
  type: 'faq';
}

interface FaqInputProps {
  agent: Agent;
  onCreateDocument: (document: FaqDocument) => void;
}

const FaqInput: React.FC<FaqInputProps> = ({ agent, onCreateDocument }) => {

  const language = useLanguage();
  const t = useTranslation(language);

  const [faqDocument, setFaqDocument] = useState<FaqDocument>({id: Date.now(), type: 'faq', name: '', content: '', agentId: agent.id});
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<AgentDocument | null>(null);

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

  return (
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
    </div>
  );
}

export default FaqInput;