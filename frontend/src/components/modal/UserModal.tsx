// User Modal Component

import { useLanguage } from "@/context/LanguageContext";
import { useSystemStore } from "@/store/system";
import { useUserStore } from "@/store/user";
import { useTranslation } from "@/translations";
import { Department, Permission, User } from "@/types/user";
import { useState } from "react";

interface UserModalProps {
  user?: User | null;
  departments: Department[];
  permissions: Permission[];
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, departments, permissions, onClose }) => {
  const language = useLanguage();
  const t = useTranslation(language);
  const { upsertUser } = useUserStore();
  const { jobs } = useSystemStore();
  const [formData, setFormData] = useState(user || {
    id: 0,
    organizationId: 1,
    name: '',
    fullname: '',
    surname: '',
    email: '',
    phone: '',
    jobId: 0,
    departmentId: 0,
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: '',
    confirmPassword: '',
    authId: '',
    permissions: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t.passwordsDontMatch);
      return;
    }
    await upsertUser(formData);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {user ? t.editUser : t.createUser}
        </h3>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.firstName}</span>
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
                <span className="label-text">{t.lastName}</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
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
              maxLength={15}
              className="input input-bordered"
              value={formData.phone}
              style={{ width: '100%' }}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                setFormData({...formData, phone: numericValue})}
              }
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.role}</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.jobId}
                onChange={(e) => setFormData({...formData, jobId: Number(e.target.value)})}
                required
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t.department}</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: Number(e.target.value)})}
              >
                <option value="">{t.noDepartment}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'suspended'})}
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
              {[1,2,3,4].map(group => {
                const permissionLabels: Record<string, string> = {
                  1: t.agentPermissions,
                  2: t.crmPermissions,
                  3: t.conversationPermissions,
                  4: t.adminPermissions,
                };
                return (
                  <div key={group} className="card bg-base-200">
                    <div className="card-body p-4">
                      <h4 className="card-title text-sm capitalize mb-3">{permissionLabels[group]}</h4>
                      <div className="space-y-2">
                        {permissions
                          .filter(permission => permission.groupId === group)
                          .map(permission => (
                            <label key={permission.code} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={formData.permissions?.includes(permission.code)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      permissions: [...formData.permissions || [], permission.code]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      permissions: user?.permissions?.filter(code => code !== permission.code)
                                    });
                                  }
                                }}
                              />
                              <span className="text-sm">{language.language == 'en' ? permission.descriptionEn : permission.descriptionPt}</span>
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

export default UserModal;