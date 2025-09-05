import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Agent, Document } from "@/types/agent";
import { useState } from "react";
import FaqModal from "./FaqModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useDocumentStore } from "@/store/document";

interface FaqDocument extends Document {
  type: 'faq';
}

const FaqInput: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Document | null>(null);
  const { faqDocuments, setFaqDocuments } = useDocumentStore();

  const editFaq = (faq: Document) => {
    setEditingFaq(faq);
    setShowFaqModal(true);
  };

  const deleteFaq = (faqId: number) => {
    setFaqDocuments(faqDocuments.filter((faq: Document) => faq.id !== faqId));
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
        {faqDocuments.length > 0 && (
          <div className="space-y-3">
            {faqDocuments.map((faq) => (
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
          }}
          document={editingFaq ?? undefined}
        />
      )}
    </div>
  );
}

export default FaqInput;