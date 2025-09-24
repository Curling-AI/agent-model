import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Plus } from "lucide-react";

interface FaqInputProps {
  onClick?: () => void;
}

const FaqInput: React.FC<FaqInputProps> = ({ onClick }) => {

  const language = useLanguage();
  const t = useTranslation(language);

  return (
    <div>
      <label className="label">
        <span className="label-text label-medium-custom">{t.faqs}</span>
      </label>
      <div className="space-y-3">
        <button
          onClick={onClick}
          className="btn btn-outline btn-sm"
          style={{ textTransform: 'uppercase' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.addFaq}
        </button>
      </div>
    </div>
  );
}

export default FaqInput;