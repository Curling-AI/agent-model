import React, { useState, useMemo } from 'react';
import { 
  Plus,
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  Clock,
  Tag,
  GripVertical,
  X,
  User,
  Building,
  DollarSign,
  Settings,
  Palette,
  GripVertical as DragHandle,
  Sliders,
  FilterX,
  ArrowUpDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { Lead } from '@/types';

type Column = {
  id: string;
  title: string;
  color: string;
};

type ValueRange = {
  min: string;
  max: string;
};

type DateRange = {
  start: string;
  end: string;
};

type Filter = {
  status: string[];
  priority: string[];
  source: string[];
  tags: string[];
  valueRange: ValueRange;
  dateRange: DateRange;
  company: string;
  hasNotes: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
};

const CRM: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  
  // Estado para filtros
  const [filters, setFilters] = useState<Filter>({
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

  const [newLead, setNewLead] = useState<Lead>({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: 0,
    source: 'WhatsApp',
    notes: '',
    priority: 'medium',
    tags: []
  });
  const [leadsData, setLeadsData] = useState([
    {
      id: 1,
      name: 'Maria Silva',
      company: 'Tech Corp',
      avatar: 'MS',
      email: 'maria@techcorp.com',
      phone: '+55 11 99999-9999',
      value: 15000,
      status: 'novo',
      priority: 'high',
      lastContact: `2${t.hoursAgo}`,
      source: 'WhatsApp',
      tags: [t.enterprise, t.urgent],
      notes: t.interestedInEnterprise
    },
    {
      id: 2,
      name: 'João Santos',
      company: 'StartupABC',
      avatar: 'JS',
      email: 'joao@startupabc.com',
      phone: '+55 11 88888-8888',
      value: 5000,
      status: 'qualificado',
      priority: 'medium',
      lastContact: `1 ${t.dayAgo}`,
      source: 'WhatsApp',
      tags: [t.startup],
      notes: t.needsIntegration
    },
    {
      id: 3,
      name: 'Ana Costa',
      company: 'Freelancer',
      avatar: 'AC',
      email: 'ana@freelancer.com',
      phone: '+55 11 77777-7777',
      value: 2000,
      status: 'proposta',
      priority: 'low',
      lastContact: `3 ${t.daysAgo}`,
      source: 'WhatsApp',
      tags: [t.individual],
      notes: t.limitedBudget
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      company: 'MegaCorp',
      avatar: 'CO',
      email: 'carlos@megacorp.com',
      phone: '+55 11 66666-6666',
      value: 25000,
      status: 'negociacao',
      priority: 'high',
      lastContact: `5${t.hoursAgo}`,
      source: 'WhatsApp',
      tags: [t.enterprise, t.premium],
      notes: t.finalDecision
    },
    {
      id: 5,
      name: 'Paula Ferreira',
      company: 'EduTech',
      avatar: 'PF',
      email: 'paula@edutech.com',
      phone: '+55 11 55555-5555',
      value: 8000,
      status: 'fechado',
      priority: 'medium',
      lastContact: `1 ${t.weekAgo}`,
      source: 'WhatsApp',
      tags: [t.education],
      notes: t.clientClosed
    }
  ]);
  const [columns, setColumns] = useState([
    { id: 'novo', title: t.newLeads, color: '#229ad2' },           // Azul principal
    { id: 'qualificado', title: t.qualified, color: '#22d2a2' },   // Verde complementar
    { id: 'proposta', title: t.proposalSent, color: '#5a22d2' },   // Roxo das cores sugeridas
    { id: 'negociacao', title: t.inNegotiation, color: '#d222a2' }, // Rosa complementar
    { id: 'fechado', title: t.closed, color: '#a2d222' }           // Verde-amarelado complementar
  ]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Função para aplicar filtros aos leads
  const filteredLeadsData = useMemo(() => {
    return leadsData.filter(lead => {
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
      if (filters.hasNotes && !lead.notes) {
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
  }, [leadsData, searchTerm, filters]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
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
  };

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
  const getLeadsByStatus = (status: string) => {
    return filteredLeadsData.filter(lead => lead.status === status);
  };

  // Função para obter estatísticas dos filtros
  const getFilterStats = () => {
    const total = leadsData.length;
    const filtered = filteredLeadsData.length;
    return { total, filtered, active: hasActiveFilters() };
  };

  // Função para criar novo lead
  const handleCreateLead = () => {
    if (!newLead.name || !newLead.email) {
      alert(`${t.nameRequired} e ${t.emailRequired}`);
      return;
    }

    const avatar = newLead.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newLeadData = {
      id: Date.now(),
      name: newLead.name,
      company: newLead.company,
      avatar: avatar,
      email: newLead.email,
      phone: newLead.phone,
      value: newLead.value || 0,
      status: 'novo',
      priority: newLead.priority,
      lastContact: t.now,
      source: newLead.source,
      tags: newLead.tags,
      notes: newLead.notes
    };

    setLeadsData([...leadsData, newLeadData]);
    setShowNewLeadModal(false);
    resetNewLeadForm();
  };

  // Função para resetar o formulário
  const resetNewLeadForm = () => {
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      value: 0,
      source: 'WhatsApp',
      notes: '',
      priority: 'medium',
      tags: []
    });
  };

  // Função para adicionar/remover tags
  const toggleTag = (tag: string) => {
    setNewLead(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Função para editar coluna
  const handleEditColumn = (column: Column) => {
    setEditingColumn({
      id: column.id,
      title: column.title,
      color: column.color
    });
  };

  // Função para salvar edição da coluna
  const handleSaveColumnEdit = () => {
    if (!editingColumn || !editingColumn.title.trim()) {
      alert(t.columnNameRequired);
      return;
    }

    setColumns(prev => prev.map(col => 
      col.id === editingColumn.id 
        ? { ...col, title: editingColumn.title, color: editingColumn.color }
        : col
    ));
    setEditingColumn(null);
  };

  // Função para deletar coluna (agora permite deletar qualquer coluna)
  const handleDeleteColumn = (columnId: string) => {
    const leadsInColumn = getLeadsByStatus(columnId);
    
    if (leadsInColumn.length > 0) {
      const confirmDelete = window.confirm(
        t.confirmDeleteColumn.replace('{count}', leadsInColumn.length.toString())
      );
      
      if (confirmDelete) {
        // Mover leads para a primeira coluna disponível
        const firstAvailableColumn = columns.find(col => col.id !== columnId);
        if (firstAvailableColumn) {
          const updatedLeads = leadsData.map(lead => 
            lead.status === columnId 
              ? { ...lead, status: firstAvailableColumn.id }
              : lead
          );
          setLeadsData(updatedLeads);
        }
        
        // Deletar a coluna
        setColumns(prev => prev.filter(col => col.id !== columnId));
      }
    } else {
      setColumns(prev => prev.filter(col => col.id !== columnId));
    }
  };

  // Função para adicionar nova coluna
  const handleAddColumn = () => {
    const newColumnId = `coluna_${Date.now()}`;
    const complementaryColors = generateComplementaryColors();
    const availableColors = complementaryColors.filter(color => 
      !columns.some(col => col.color === color)
    );
    
    const newColumn = {
      id: newColumnId,
      title: t.newColumn,
      color: availableColors.length > 0 ? availableColors[0] : complementaryColors[5] // Roxo como fallback
    };
    setColumns([...columns, newColumn]);
  };

  // Funções de Drag and Drop para colunas
  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, column: Column) => {
    setDraggedColumn(column);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    
    if (draggedColumn && draggedColumn.id !== targetColumnId) {
      const draggedIndex = columns.findIndex(col => col.id === draggedColumn.id);
      const targetIndex = columns.findIndex(col => col.id === targetColumnId);
      
      const newColumns = [...columns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      
      setColumns(newColumns);
    }
    
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Funções de Drag and Drop para leads
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    
    if (draggedLead && draggedLead.status !== newStatus) {
      const updatedLeads = leadsData.map(lead => 
        lead.id === draggedLead.id 
          ? { ...lead, status: newStatus }
          : lead
      );
      setLeadsData(updatedLeads);
    }
    
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  // Função para gerar cores complementares baseadas na cor principal
  const generateComplementaryColors = (baseColor = '#229ad2') => {
    // Converte a cor base para HSL
    const hexToHsl = (hex:string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    // Converte HSL para hex
    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0;
      } else if (1/6 <= h && h < 1/3) {
        r = x; g = c; b = 0;
      } else if (1/3 <= h && h < 1/2) {
        r = 0; g = c; b = x;
      } else if (1/2 <= h && h < 2/3) {
        r = 0; g = x; b = c;
      } else if (2/3 <= h && h < 5/6) {
        r = x; g = 0; b = c;
      } else if (5/6 <= h && h <= 1) {
        r = c; g = 0; b = x;
      }

      const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
      const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
      const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
      
      return `#${rHex}${gHex}${bHex}`;
    };

    const [h, s, l] = hexToHsl(baseColor);
    
    // Gera cores complementares em diferentes ângulos do círculo cromático
    return [
      baseColor,                    // Cor original
      hslToHex((h + 120) % 360, s, l),  // 120° - Verde
      hslToHex((h + 60) % 360, s, l),   // 60° - Amarelo
      hslToHex((h + 300) % 360, s, l),  // 300° - Rosa
      hslToHex((h + 90) % 360, s, l),   // 90° - Verde-amarelado
      hslToHex((h + 240) % 360, s, l),  // 240° - Roxo
    ];
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
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.columns}
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewLeadModal(true)}
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
          {columns.map(column => (
            <div key={column.id} className="w-80 flex-shrink-0">
              {/* Column Header */}
              <div 
                className="card bg-base-100 border-t-4 p-4 mb-4 transition-all duration-200"
                style={{ borderTopColor: column.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="badge badge-neutral">{getLeadsByStatus(column.id).length}</span>
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleEditColumn(column)}
                      title={t.editColumn}
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div 
                className={`space-y-4 min-h-[500px] transition-all duration-200 ${
                  dragOverColumn === column.id && draggedLead && draggedLead.status !== column.id
                    ? 'bg-base-200/50 rounded-lg p-2 border-2 border-dashed border-primary/30' 
                    : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {getLeadsByStatus(column.id).map(lead => (
                  <div 
                    key={lead.id} 
                    className={`card bg-base-100 hover:shadow-md transition-all duration-200 cursor-move ${
                      draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
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
                            {lead.avatar}
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
                              <li><a href="#details"><Eye className="w-3 h-3" />{t.viewDetails}</a></li>
                              <li><a href="#edit"><Edit className="w-3 h-3" />{t.edit}</a></li>
                              <li><a href="#chat"><MessageSquare className="w-3 h-3" />{t.chat}</a></li>
                              <li><hr className="my-1" /></li>
                              <li><a href="#delete" className="text-error"><Trash2 className="w-3 h-3" />{t.delete}</a></li>
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
                      {lead.notes && (
                        <div className="text-xs text-neutral bg-base-200 rounded p-2 mb-3">
                          {lead.notes}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-neutral">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{lead.lastContact}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{lead.source}</span>
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
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t.newLead}</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowNewLeadModal(false)}
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
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
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
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
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
                    type="email" 
                    className="input input-bordered input-sm" 
                    placeholder={t.emailPlaceholder}
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
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
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
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
                    onChange={(e) => setNewLead({...newLead, value: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t.source}</span>
                  </label>
                  <select 
                    className="select select-bordered select-sm"
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Site">Site</option>
                    <option value="Indicação">Indicação</option>
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
                      className={`btn btn-sm ${
                        newLead.priority === priority 
                          ? 'btn-primary' 
                          : 'btn-outline'
                      }`}
                      onClick={() => setNewLead({...newLead, priority})}
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
                  {[t.enterprise, t.startup, t.individual, t.education, t.urgent, t.premium].map(tag => (
                    <button
                      key={tag}
                      className={`badge ${
                        newLead.tags.includes(tag) 
                          ? 'badge-primary' 
                          : 'badge-outline'
                      } cursor-pointer`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
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
                  placeholder={t.notesPlaceholder}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNewLeadModal(false)}
              >
                {t.cancel}
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleCreateLead}
              >
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurações de Colunas */}
      {showColumnSettings && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t.configureColumns}</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowColumnSettings(false)}
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
                  {columns.map(column => (
                    <div 
                      key={column.id} 
                      className={`card bg-base-200 p-4 transition-all duration-200 ${
                        draggedColumn?.id === column.id ? 'opacity-50 scale-95' : ''
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
                          <span className="font-medium">{column.title}</span>
                          <span className="badge badge-neutral">{getLeadsByStatus(column.id).length} {t.leads}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEditColumn(column)}
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowColumnSettings(false)}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Coluna */}
      {editingColumn && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t.editColumn}</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setEditingColumn(null)}
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
                  value={editingColumn.title}
                  onChange={(e) => setEditingColumn({...editingColumn, title: e.target.value})}
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
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          editingColumn.color === color 
                            ? 'border-2 border-primary scale-110' 
                            : 'border-base-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingColumn({...editingColumn, color})}
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
                    value={editingColumn.color}
                    onChange={(e) => setEditingColumn({...editingColumn, color: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="input input-bordered input-sm flex-1 font-mono text-sm"
                    value={editingColumn.color}
                    onChange={(e) => setEditingColumn({...editingColumn, color: e.target.value})}
                    placeholder="#000000"
                  />
                </div>
                <div className="mt-2">
                  <div 
                    className="w-full h-8 rounded border-2"
                    style={{ borderColor: editingColumn.color }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingColumn(null)}
              >
                {t.cancel}
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleSaveColumnEdit}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Filtros */}
      {showFiltersModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Sliders className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">{t.filters}</h3>
                {hasActiveFilters() && (
                  <span className="badge badge-primary badge-sm">
                    {getFilterStats().filtered}/{getFilterStats().total}
                  </span>
                )}
              </div>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowFiltersModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Filtros por Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {t.status}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {columns.map(column => (
                    <button
                      key={column.id}
                      className={`badge ${
                        filters.status.includes(column.title) 
                          ? 'badge-primary' 
                          : 'badge-outline'
                      } cursor-pointer`}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          status: prev.status.includes(column.id)
                            ? prev.status.filter(s => s !== column.id)
                            : [...prev.status, column.id]
                        }))
                      }}
                    >
                      {column.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros por Prioridade */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {t.priority}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['low', 'medium', 'high'].map(priority => (
                    <button
                      key={priority}
                      className={`badge ${
                        filters.priority.includes(priority) 
                          ? 'badge-primary' 
                          : 'badge-outline'
                      } cursor-pointer`}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          priority: prev.priority.includes(priority)
                            ? prev.priority.filter(p => p !== priority)
                            : [...prev.priority, priority]
                        }))
                      }}
                    >
                      {priority === 'low' ? t.low : 
                       priority === 'medium' ? t.medium : t.high}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros por Fonte */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t.source}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['WhatsApp', 'Email', 'Telefone', 'Site', 'Indicação'].map(source => (
                    <button
                      key={source}
                      className={`badge ${
                        filters.source.includes(source) 
                          ? 'badge-primary' 
                          : 'badge-outline'
                      } cursor-pointer`}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          source: prev.source.includes(source)
                            ? prev.source.filter(s => s !== source)
                            : [...prev.source, source]
                        }))
                      }}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros por Tags */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {t.tags}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[t.enterprise, t.startup, t.individual, t.education, t.urgent, t.premium].map(tag => (
                    <button
                      key={tag}
                      className={`badge ${
                        filters.tags.includes(tag) 
                          ? 'badge-primary' 
                          : 'badge-outline'
                      } cursor-pointer`}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag)
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }))
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros por Valor */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {t.estimatedValue}
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-sm">{t.minimumValue}</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered input-sm" 
                      placeholder="0.00"
                      value={filters.valueRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        valueRange: { ...prev.valueRange, min: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-sm">{t.maximumValue}</span>
                    </label>
                    <input 
                      type="number" 
                      className="input input-bordered input-sm" 
                      placeholder="100000.00"
                      value={filters.valueRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        valueRange: { ...prev.valueRange, max: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Filtros por Empresa */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {t.company}
                  </span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered input-sm" 
                  placeholder={t.searchByCompany}
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    company: e.target.value
                  }))}
                />
              </div>

              {/* Filtros por Campos Obrigatórios */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    {t.requiredFields}
                  </span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="label cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm mr-2"
                      checked={filters.hasNotes}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        hasNotes: e.target.checked
                      }))}
                    />
                    <span className="label-text">{t.hasNotes}</span>
                  </label>
                  
                  <label className="label cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm mr-2"
                      checked={filters.hasPhone}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        hasPhone: e.target.checked
                      }))}
                    />
                    <span className="label-text">{t.hasPhone}</span>
                  </label>
                  
                  <label className="label cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm mr-2"
                      checked={filters.hasEmail}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        hasEmail: e.target.checked
                      }))}
                    />
                    <span className="label-text">{t.hasEmail}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters()}
              >
                <FilterX className="w-4 h-4 mr-2" />
                {t.clearAllFilters}
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowFiltersModal(false)}
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM; 