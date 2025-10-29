import { useLanguage } from "@/context/LanguageContext";
import { useDepartmentStore } from "@/store/department";
import { useTranslation } from "@/translations";
import { Department } from "@/types/user";
import { useState } from "react";

// Department Modal Component
const DepartmentModal: React.FC<{ department?: Department | null; organizationId: number; onClose: () => void; }> = ({ department, organizationId, onClose }) => {
  const  language = useLanguage();
  const t = useTranslation(language);

  const { upsertDepartment } = useDepartmentStore();

  const [newDepartment, setDepartment] = useState<Department>(department || {
    id: 0,
    organizationId: organizationId,
    name: '',
    description: '',
    managerName: '',
    createdAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertDepartment(newDepartment);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {department ? t.editDepartment : t.createDepartment}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.departmentName}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              style={{ width: '100%' }}
              value={newDepartment.name || ''}
              onChange={(e) => setDepartment({...newDepartment, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.departmentDescription}</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              style={{ width: '100%' }}
              value={newDepartment.description}
              onChange={(e) => setDepartment({...newDepartment, description: e.target.value})}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.departmentManager}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              style={{ width: '100%' }}
              value={newDepartment.managerName}
              onChange={(e) => setDepartment({...newDepartment, managerName: e.target.value})}
            />
          </div>
          
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} style={{ textTransform: 'uppercase' }}>
              {t.cancel}
            </button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ textTransform: 'uppercase' }}>
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;