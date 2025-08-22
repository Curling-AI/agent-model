import React, { useState } from 'react';
import { 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const Profile = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dados do usuário
  const [userData, setUserData] = useState({
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '+55 11 99999-9999',
    company: 'Minha Empresa LTDA',
    position: 'CEO',
    location: 'São Paulo, SP',
    joinDate: '2024-01-15',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  // Dados da senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });



  const handleSaveProfile = () => {
    // Salvar dados do perfil
    console.log('Saving profile:', userData);
    setIsEditing(false);
    // Mostrar toast de sucesso
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t.passwordsDontMatch);
      return;
    }
    
    // Alterar senha
    console.log('Changing password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    // Mostrar toast de sucesso
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-base-content">{t.profile}</h1>
        <p className="text-neutral mt-1">{t.managePersonalInfo}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold">{t.personalInformation}</h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline btn-sm w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t.edit}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="btn btn-primary btn-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t.save}
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-content text-2xl font-bold">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 btn btn-circle btn-xs btn-primary">
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userData.name}</h3>
                  <p className="text-neutral">{userData.position} • {userData.company}</p>
                  <div className="flex items-center space-x-1 text-sm text-neutral mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{t.memberSince} {new Date(userData.joinDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.fullName}</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({...prev, name: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.email}</span>
                  </label>
                  <input 
                    type="email" 
                    className="input input-bordered w-full"
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.phone}</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input input-bordered w-full"
                    value={userData.phone}
                    onChange={(e) => setUserData(prev => ({...prev, phone: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.company}</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full"
                    value={userData.company}
                    onChange={(e) => setUserData(prev => ({...prev, company: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.position}</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full"
                    value={userData.position}
                    onChange={(e) => setUserData(prev => ({...prev, position: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.location}</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full"
                    value={userData.location}
                    onChange={(e) => setUserData(prev => ({...prev, location: e.target.value}))}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.timezone}</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={userData.timezone}
                    onChange={(e) => setUserData(prev => ({...prev, timezone: e.target.value}))}
                    disabled={!isEditing}
                  >
                    <option value="America/Sao_Paulo">{t.brasilia}</option>
                    <option value="America/New_York">{t.newYork}</option>
                    <option value="Europe/London">{t.london}</option>
                    <option value="Asia/Tokyo">{t.tokyo}</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.language}</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={userData.language}
                    onChange={(e) => setUserData(prev => ({...prev, language: e.target.value}))}
                    disabled={!isEditing}
                  >
                    <option value="pt-BR">{t.portuguese}</option>
                    <option value="en-US">{t.english}</option>
                    <option value="es-ES">{t.spanish}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="text-lg font-bold mb-4">{t.security}</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowPasswordForm(true)}
                  className="btn btn-outline w-full justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t.changePassword}
                </button>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="text-lg font-bold mb-4">{t.accountStats}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t.agentsCreated}</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t.conversationsAttended}</span>
                  <span className="font-bold">1.247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t.qualifiedLeads}</span>
                  <span className="font-bold">328</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t.conversionRate}</span>
                  <span className="font-bold text-primary">26.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{t.changePasswordTitle}</h3>
                <button 
                  onClick={() => setShowPasswordForm(false)}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="alert alert-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{t.passwordStrengthWarning}</span>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.currentPassword}</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      placeholder={t.enterCurrentPassword}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.newPassword}</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      placeholder={t.enterNewPassword}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.confirmNewPassword}</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      placeholder={t.confirmNewPasswordPlaceholder}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-outline flex-1"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleChangePassword}
                    className="btn btn-primary flex-1"
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {t.changePasswordButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 