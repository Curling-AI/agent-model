import { useEffect, useState } from 'react';
import { 
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Camera,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { useSystemStore } from '@/store/system';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { upsertUser } = useUserStore();
  const { jobs, fetchJobs } = useSystemStore();

  const {user, setUser, getLoggedUser, changePassword} = useAuthStore();

  const navigate  = useNavigate();

  useEffect(() => {
    getLoggedUser();
    fetchJobs();
  }, []);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    if (user?.fullname.trim() === '' 
      || user?.email.trim() === '' 
      || !user?.jobId
      || !user?.language
      || !user?.timezone
      || user?.phone.trim() === ''
    ) {
      alert(t.fillAllFields);
      return;
    }

    user!.name = user!.fullname.split(' ')[0];
    user!.surname = user!.fullname.split(' ').slice(1).join(' ');
    
    await upsertUser(user!);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {

    if (passwordData.newPassword.length < 8) {
      alert(t.passwordTooShort);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t.passwordsDontMatch);
      return;
    }
    
    const response = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (response?.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert(t.passwordChangeSuccess);
      navigate('/login');
    } else {
      alert(t.invalidCurrentPassword);
    }
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
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 btn btn-circle btn-xs btn-primary">
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.name!.toLocaleLowerCase().charAt(0).toUpperCase() + user?.name.toLocaleLowerCase().slice(1)!}</h3>
                  <div className="flex items-center space-x-1 text-sm text-neutral mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{t.memberSince} {new Date(user?.createdAt!).toLocaleDateString(language.language === 'pt' ? 'pt-BR' : 'en-US')}</span>
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
                    value={user?.fullname}
                    onChange={(e) => setUser({...user!, fullname: e.target.value})}
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
                    value={user?.email}
                    onChange={(e) => setUser({...user!, email: e.target.value})}
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
                    value={user?.phone}
                    onChange={(e) => setUser({...user!, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.position}</span>
                  </label>
                  <select
                    className="select input-bordered w-full"
                    value={user?.jobId}
                    onChange={(e) => setUser({...user!, jobId: Number(e.target.value)})}
                    required
                    disabled={!isEditing}
                  >
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t.timezone}</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={user?.timezone}
                    onChange={(e) => setUser({...user!, timezone: e.target.value})}
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
                    value={user?.language}
                    onChange={(e) => setUser({...user!, language: e.target.value})}
                    disabled={!isEditing}
                  >
                    <option value="pt">{t.portuguese}</option>
                    <option value="en">{t.english}</option>
                    <option value="es">{t.spanish}</option>
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

          {/* Account Stats
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
          </div> */}
        </div>
      </div>



      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 bg-opacity-custom">
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