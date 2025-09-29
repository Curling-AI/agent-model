import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/translations';
import { generateComplementaryColors } from '@/utils/colors';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import CrmColumnModal from './CrmColumnModal';
import { CrmColumn } from '@/types';

import { GripVertical as DragHandle } from 'lucide-react';
import { useCrmColumnStore } from '@/store/crm-column';
import { useLeadStore } from '@/store/lead';

interface SettingCrmColumnModalProps {
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const SettingCrmColumnModal: React.FC<SettingCrmColumnModalProps> = ({ onClose, title, children }) => {

  const language = useLanguage();
  const t = useTranslation(language);

  const [draggedColumn, setDraggedColumn] = useState<CrmColumn | null>(null);
  const [editingColumn, setEditingColumn] = useState<CrmColumn | null>(null);
 
  const { crmColumns, deleteCrmColumn } = useCrmColumnStore();
  const { leads } = useLeadStore();

  // Função para obter leads filtrados por status
  const getLeadsByStatus = (status: number) => {
    return leads.filter(lead => lead.status === status);
  };

  // Função para deletar coluna (agora permite deletar qualquer coluna)
  const handleDeleteColumn = async (columnId: number) => {
    const leadsInColumn = getLeadsByStatus(columnId);

    if (leadsInColumn.length > 0) {
      const confirmDelete = window.confirm(
        t.confirmDeleteColumn.replace('{count}', leadsInColumn.length.toString())
      );

      if (confirmDelete) {
        // Mover leads para a primeira coluna disponível
        const firstAvailableColumn = crmColumns.find(col => col.id !== columnId);
        if (firstAvailableColumn) {
          const updatedLeads = leads.map(lead =>
            lead.status === columnId
              ? { ...lead, status: firstAvailableColumn.id }
              : lead
          );
          // setLeadsData(updatedLeads);
        }
      }
    }
    
    await deleteCrmColumn(columnId);
  };

  // Funções de Drag and Drop para colunas
  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, column: CrmColumn) => {
    setDraggedColumn(column);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: number) => {
    e.preventDefault();

    if (draggedColumn && draggedColumn.id !== targetColumnId) {
      const draggedIndex = crmColumns.findIndex(col => col.id === draggedColumn.id);
      const targetIndex = crmColumns.findIndex(col => col.id === targetColumnId);

      const newColumns = [...crmColumns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);

      // setColumns(newColumns);
    }

    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Função para adicionar nova coluna
    const handleAddColumn = () => {
      const newColumnId = `coluna_${Date.now()}`;
      const complementaryColors = generateComplementaryColors();
      const availableColors = complementaryColors.filter(color => 
        !crmColumns.some(col => col.color === color)
      );
      
      const newColumn = {
        id: newColumnId,
        title: t.newColumn,

        color: availableColors.length > 0 ? availableColors[0] : complementaryColors[5] // Roxo como fallback
      };
      // setColumns([...crmColumns, newColumn]);
    };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{t.configureColumns}</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => onClose()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Lista de Colunas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">{t.existingColumns}</h4>
                <p className="text-sm text-neutral mt-1">{t.dragToReorder}</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddColumn}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addColumn}
              </button>
            </div>

            <div className="space-y-3">
              {crmColumns.map(column => (
                <div
                  key={column.id}
                  className={`card bg-base-200 p-4 transition-all duration-200 ${draggedColumn?.id === column.id ? 'opacity-50 scale-95' : ''
                    }`}
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, column)}
                  onDragOver={handleColumnDragOver}
                  onDrop={(e) => handleColumnDrop(e, column.id)}
                  onDragEnd={handleColumnDragEnd}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DragHandle className="w-4 h-4 text-neutral/50 cursor-move" />
                      <div
                        className="w-4 h-4 rounded border-2"
                        style={{ borderColor: column.color }}
                      ></div>
                      <span className="font-medium">{language.language == 'pt' ? column.titlePt : column.titleEn}</span>
                      <span className="badge badge-neutral">{getLeadsByStatus(column.id).length} {t.leads}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingColumn(column)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Modal Editar Coluna */}
                  {editingColumn && (
                    <CrmColumnModal crmColumn={column} onClose={() => setEditingColumn(null)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onClose()}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingCrmColumnModal;