import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/translations';
import { CrmColumn, CrmFilter } from '@/types';
import { ArrowUpDown, Building, DollarSign, FilterX, MessageSquare, Settings, Sliders, Tag, X } from 'lucide-react';

interface FilterLeadModalProps {
  onClose: () => void;
  hasActiveFilters: () => boolean;
  getFilterStats: () => { total: number; filtered: number };
  columns: CrmColumn[];
  filters: CrmFilter;
  setFilters: (filters: React.SetStateAction<CrmFilter>) => void;
}

const FilterLeadModal: React.FC<FilterLeadModalProps> = ({ onClose, hasActiveFilters, getFilterStats, columns, filters, setFilters }) => {
  const language = useLanguage();
  const t = useTranslation(language);

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

  return (
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
            onClick={() => onClose()}
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
                  className={`badge ${filters.status.includes(column.id)
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
                  {language.language === 'pt' ? column.titlePt : column.titleEn}
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
                  className={`badge ${filters.priority.includes(priority)
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
                  className={`badge ${filters.source.includes(source)
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
                  className={`badge ${filters.tags.includes(tag)
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
            style={{ textTransform: 'uppercase' }}
          >
            <FilterX className="w-4 h-4 mr-2" />
            {t.clearAllFilters}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onClose()}
            style={{ textTransform: 'uppercase' }}
          >
            {t.applyFilters}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterLeadModal;