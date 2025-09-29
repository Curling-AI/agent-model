import { useLanguage } from '@/context/LanguageContext';
import { useCrmColumnStore } from '@/store/crm-column';
import { useTranslation } from '@/translations';
import { CrmColumn } from '@/types';
import { generateComplementaryColors } from '@/utils/colors';
import { Palette, X } from 'lucide-react';
import { useState } from 'react';

interface CrmColumnModalProps {
  onClose: () => void;
  crmColumn: CrmColumn;
}

const CrmColumnModal: React.FC<CrmColumnModalProps> = ({ onClose, crmColumn }) => {
  
  const language = useLanguage();
  const t = useTranslation(language);
  const [editingColumn, setEditingColumn] = useState<CrmColumn>(crmColumn);

  const { upsertCrmColumn} = useCrmColumnStore();

   // Função para salvar edição da coluna
  const handleSaveColumnEdit = async () => {
    if (!editingColumn || !editingColumn.titlePt.trim()) {
      alert(t.columnNameRequired);
      return;
    }

    await upsertCrmColumn(editingColumn);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{t.editColumn}</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => onClose()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome da Coluna */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.columnName}</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder={t.columnNamePlaceholder}
              value={editingColumn?.titlePt || ''}
              onChange={(e) => setEditingColumn({ ...editingColumn, titlePt: e.target.value } as CrmColumn)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.columnName}</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder={t.columnNamePlaceholder}
              value={editingColumn?.titleEn || ''}
              onChange={(e) => setEditingColumn({ ...editingColumn, titleEn: e.target.value } as CrmColumn)}
            />
          </div>

          {/* Cor da Borda - Color Picker Personalizado */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                {t.borderColor}
              </span>
            </label>

            {/* Cores Complementares Sugeridas */}
            <div className="mb-3">
              <label className="label">
                <span className="label-text text-sm">{t.suggestedComplementaryColors}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {generateComplementaryColors().map((color, index) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 transition-all ${editingColumn.color === color
                        ? 'border-2 border-primary scale-110'
                        : 'border-base-300 hover:scale-105'
                      }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditingColumn({ ...editingColumn, color })}
                    title={`${t.color} ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Color Picker Personalizado */}
            <div className="flex items-center space-x-3">
              <input
                type="color"
                className="w-16 h-12 rounded border cursor-pointer"
                value={editingColumn?.color || ''}
                onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })}
              />
              <input
                type="text"
                className="input input-bordered input-sm flex-1 font-mono text-sm"
                value={editingColumn?.color || ''}
                onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })}
                placeholder="#000000"
              />
            </div>
            <div className="mt-2">
              <div
                className="w-full h-8 rounded border-2"
                style={{ borderColor: editingColumn?.color }}
              ></div>
            </div>
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
            onClick={handleSaveColumnEdit}
            style={{ textTransform: 'uppercase' }}
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrmColumnModal;