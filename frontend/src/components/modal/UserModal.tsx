// User Modal Component

import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { useState } from "react";

interface Department {
  id: string | number;
  name: string;
}

interface Permission {
  id: string | number;
  category: string;
  description: string;
}

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: string;
  permissions?: Array<string | number>;
}

interface UserModalProps {
  user?: User | null;
  departments: Department[];
  permissions: Permission[];
  onClose: () => void;
  onSave: (formData: any) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, departments, permissions, onClose, onSave }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    department: user?.department || '',
    status: user?.status || 'active',
    password: '',
    confirmPassword: '',
    permissions: user?.permissions || []
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t.passwordsDontMatch);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {user ? t.editUser : t.createUser}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.firstName}</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.lastName}</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.email}</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t.phone}</span>
            </label>
            <input
              type="tel"
              className="input input-bordered"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.role}</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="admin">{t.adminRole}</option>
                <option value="manager">{t.managerRole}</option>
                <option value="user">{t.userRole}</option>
                <option value="viewer">{t.viewerRole}</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.department}</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">{t.noDepartment}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.status}</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
                <option value="suspended">{t.suspended}</option>
              </select>
            </div>
          </div>
          
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t.password}</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!user}
                  minLength={6}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t.confirmPassword}</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required={!user}
                />
              </div>
            </div>
          )}
          
          {/* Permissions Section */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">{t.userPermissions}</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {['agent', 'crm', 'conversation', 'admin'].map(category => {
                const permissionLabels: Record<string, string> = {
                  agent: t.agentPermissions,
                  crm: t.crmPermissions,
                  conversation: t.conversationPermissions,
                  admin: t.adminPermissions,
                };
                return (
                  <div key={category} className="card bg-base-200">
                    <div className="card-body p-4">
                      <h4 className="card-title text-sm capitalize mb-3">{permissionLabels[category]}</h4>
                      <div className="space-y-2">
                        {permissions
                          .filter(permission => permission.category === category)
                          .map(permission => (
                            <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      permissions: [...formData.permissions, permission.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      permissions: formData.permissions.filter(id => id !== permission.id)
                                    });
                                  }
                                }}
                              />
                              <span className="text-sm">{permission.description}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

export default UserModal;