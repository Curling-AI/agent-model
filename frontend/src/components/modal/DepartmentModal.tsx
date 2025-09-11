import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { useState } from "react";

// Department Modal Component
const DepartmentModal: React.FC<{ department?: any; onClose: () => void; onSave: (data: any) => void }> = ({ department, onClose, onSave }) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    manager: department?.manager || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.departmentDescription}</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
            />
          </div>
          
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;