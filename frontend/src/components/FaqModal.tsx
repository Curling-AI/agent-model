// Componente Modal FAQ

import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Faq } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faq: Faq) => void;
  faq?: Faq;
}

const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, onSave, faq }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [formData, setFormData] = useState({
    question: faq?.question || '',
    answer: faq?.answer || ''
  });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.question.trim() && formData.answer.trim()) {
//       onSave({
//         ...faq,
//         ...formData
//       });
//     }
//   };

  const handleClose = () => {
    setFormData({ question: '', answer: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold">{faq ? t.editFaq : t.addFaq}</h2>
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
              value={formData.question}
              onChange={(e) => setFormData(prev => ({...prev, question: e.target.value}))}
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
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({...prev, answer: e.target.value}))}
              required
            />
          </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300">
          <button onClick={handleClose} className="btn btn-ghost">
            {t.cancel}
          </button>
          <button 
            // onClick={handleSubmit}
            disabled={!formData.question.trim() || !formData.answer.trim()}
            className="btn btn-primary"
          >
            {faq ? t.update : t.add}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;