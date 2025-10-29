import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Edit,
  Eye,
  Clock,
  Tag,
  Settings,
  Filter,
  GripVertical,
  Archive,

} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { CrmColumn, CrmFilter } from '@/types';
import LeadModal from '@/components/modal/LeadModal';
import { Lead } from '@/types/lead';
import SettingCrmColumnModal from '@/components/modal/SettingCrmColumnModal';
import { useCrmColumnStore } from '@/store/crm-column';
import { useLeadStore } from '@/store/lead';
import FilterLeadModal from '@/components/modal/FilterLeadModal';
import { formatDateDMYHM } from '@/utils/date';
import CrmColumnModal from '@/components/modal/CrmColumnModal';
import { useAuthStore } from '@/store/auth';

const CRM: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<CrmColumn | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { crmColumns, fetchCrmColumns } = useCrmColumnStore();
  const { leads, setLead, fetchLeads, upsertLead, deleteLead } = useLeadStore();
  const { user, getLoggedUser } = useAuthStore();
  // Estado para filtros
  const [filters, setFilters] = useState<CrmFilter>({
    status: [],
    priority: [],
    source: [],
    tags: [],
    valueRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    company: '',
    hasNotes: false,
    hasPhone: false,
    hasEmail: false
  });

  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  useEffect(() => {
    getLoggedUser();
  }, []);

  useEffect(() => {
    fetchCrmColumns(user?.organizationId!);
    fetchLeads(user?.organizationId!);
  }, []);

  // Função para aplicar filtros aos leads
  const filteredLeadsData = useMemo(() => {
    return leads.filter((lead: Lead) => {
      // Filtro por termo de busca
      if (searchTerm && !lead.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) {
        return false;
      }

      // Filtro por prioridade
      if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) {
        return false;
      }

      // Filtro por fonte
      if (filters.source.length > 0 && !filters.source.includes(lead.source)) {
        return false;
      }

      // Filtro por tags
      if (filters.tags.length > 0 && !filters.tags.some(tag => lead.tags.includes(tag))) {
        return false;
      }

      // Filtro por valor
      if (filters.valueRange.min !== '' && lead.value < parseFloat(filters.valueRange.min)) {
        return false;
      }
      if (filters.valueRange.max !== '' && lead.value > parseFloat(filters.valueRange.max)) {
        return false;
      }

      // Filtro por empresa
      if (filters.company && !lead.company.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }

      // Filtro por observações
      if (filters.hasNotes && !lead.observation) {
        return false;
      }

      // Filtro por telefone
      if (filters.hasPhone && !lead.phone) {
        return false;
      }

      // Filtro por email
      if (filters.hasEmail && !lead.email) {
        return false;
      }

      return true;
    });
  }, [leads, searchTerm, filters]);

  // Função para verificar se há filtros ativos
  const hasActiveFilters = () => {
    return filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.source.length > 0 ||
      filters.tags.length > 0 ||
      filters.valueRange.min !== '' ||
      filters.valueRange.max !== '' ||
      filters.dateRange.start !== '' ||
      filters.dateRange.end !== '' ||
      filters.company !== '' ||
      filters.hasNotes ||
      filters.hasPhone ||
      filters.hasEmail;
  };

  // Função para obter leads filtrados por status
  const getLeadsByStatus = (status: number) => {
    return filteredLeadsData.filter(lead => lead.status === status);
  };

  // Função para obter estatísticas dos filtros
  const getFilterStats = () => {
    const total = leads.length;
    const filtered = filteredLeadsData.length;
    return { total, filtered, active: hasActiveFilters() };
  };

  // Função para editar coluna
  const handleEditColumn = (column: CrmColumn) => {
    setEditingColumn({
      id: column.id,
      titlePt: column.titlePt,
      titleEn: column.titleEn,
      color: column.color,
      isSystem: column.isSystem,
      organizationId: column.organizationId,
      order: column.order
    });
  };

  // Funções de Drag and Drop para leads
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: number) => {
    e.preventDefault();

    if (draggedLead && draggedLead.status !== newStatus) {
      await upsertLead({ ...draggedLead, status: newStatus });
      setLead(leads.map(lead => lead.id === draggedLead.id ? { ...lead, status: newStatus } : lead));
    }

    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowNewLeadModal(true);
  };

  const handleDeleteLead = async (leadId: number) => {

    await deleteLead(leadId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content">{t.crmTitle}</h1>
            <p className="text-neutral mt-1">{t.crmSubtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral" />
              <input
                type="text"
                placeholder={t.searchLeads}
                className="input input-bordered input-sm pl-10 bg-base-200 w-full sm:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn btn-outline btn-sm ${hasActiveFilters() ? 'btn-primary' : ''}`}
                onClick={() => setShowFiltersModal(true)}
                style={{ textTransform: 'uppercase' }}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t.filters}
                {hasActiveFilters() && (
                  <span className="badge badge-primary badge-sm ml-2">
                    {getFilterStats().filtered}/{getFilterStats().total}
                  </span>
                )}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowColumnSettings(true)}
                title={t.configureColumns}
                style={{ textTransform: 'uppercase' }}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.columns}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingLead(null);
                  setShowNewLeadModal(true);
                }}
                style={{ textTransform: 'uppercase' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.newLead}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          {crmColumns.map(column => (
            <div key={column.id} className="w-80 flex-shrink-0">
              {/* Column Header */}
              <div
                className="card bg-base-100 border-t-4 p-4 mb-4 transition-all duration-200"
                style={{ borderTopColor: column.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{language.language == 'pt' ? column.titlePt : column.titleEn}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-neutral">{getLeadsByStatus(column.id).length}</span>
                    {!column.isSystem && (<button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleEditColumn(column)}
                      title={t.editColumn}
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div
                className={`space-y-4 min-h-[500px] transition-all duration-200 ${dragOverColumn === column.id && draggedLead && draggedLead.id !== column.id
                  ? 'bg-base-200/50 rounded-lg p-2 border-2 border-dashed border-primary/30'
                  : ''
                  }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {getLeadsByStatus(column.id).map(lead => (
                  <div
                    key={lead.id}
                    className={`card bg-base-100 hover:shadow-md transition-all duration-200 cursor-move ${draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                      }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="card-body p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content text-sm font-semibold">
                            {/* {lead.avatar} */}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{lead.name}</h4>
                            <p className="text-xs text-neutral">{lead.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            className="btn btn-ghost btn-xs text-neutral hover:text-primary hover:bg-primary/10"
                            title={t.chatWithClient}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </button>
                          <GripVertical className="w-4 h-4 text-neutral/50 cursor-move" />
                          <div className="dropdown dropdown-end">
                            <button tabIndex={0} className="btn btn-ghost btn-xs">
                              <MoreVertical className="w-3 h-3" />
                            </button>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-48">
                              <li><a href="#"><Eye className="w-3 h-3" />{t.viewDetails}</a></li>
                              <li><a href="#" onClick={() => handleEditLead(lead)}><Edit className="w-3 h-3" />{t.edit}</a></li>
                              <li><a href="#"><MessageSquare className="w-3 h-3" />{t.chat}</a></li>
                              <li><hr className="my-1" /></li>
                              <li><a href="#" className="text-error" onClick={() => handleDeleteLead(lead.id)}><Archive className="w-3 h-3" />{t.archive}</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center space-x-2 text-xs text-neutral">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-neutral">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {lead.observation && (
                        <div className="text-xs text-neutral bg-base-200 rounded p-2 mb-3">
                          {lead.observation}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-neutral">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateDMYHM(lead.createdAt!)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span style={{ textTransform: 'capitalize' }}>{lead.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Novo Lead */}
      {showNewLeadModal && (
        <LeadModal
          organizationId={user?.organizationId!}
          onClose={() => setShowNewLeadModal(false)}
          lead={editingLead} />
      )}

      {/* Modal de Filtros */}
      {showFiltersModal && (
        <FilterLeadModal
          onClose={() => setShowFiltersModal(false)}
          hasActiveFilters={() => hasActiveFilters()}
          getFilterStats={() => getFilterStats()}
          columns={crmColumns}
          filters={filters}
          setFilters={setFilters}
        />
      )}

      {/* Modal Configurações de Colunas */}
      {showColumnSettings && (
        <SettingCrmColumnModal 
        organizationId={user?.organizationId!}
        onClose={() => setShowColumnSettings(false)} 
        setEditingColumn={setEditingColumn} />
      )}

      {/* Modal Editar Coluna */}
      {editingColumn && (
        <CrmColumnModal crmColumn={editingColumn} onClose={() => setEditingColumn(null)} />
      )}
    </div>
  );
};

export default CRM; 