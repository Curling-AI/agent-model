import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Building2, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { Department, Permission, User } from '@/types/user';
import UserModal from '@/components/modal/UserModal';
import DepartmentModal from '@/components/modal/DepartmentModal';
import { useDepartmentStore } from '@/store/department';
import { useUserStore } from '@/store/user';
import { useSystemStore } from '@/store/system';
import DepartmentUserCount from '@/components/DepartmentUserCount';
import { get } from 'http';
import { useAuthStore } from '@/store/auth';

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
};

const Admin: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState('users');
  const { users, fetchUsers, deleteUser } = useUserStore();
  const { departments, fetchDepartments, deleteDepartment, getDepartmentUserCount } = useDepartmentStore();
  const { permissions, fetchPermissions } = useSystemStore();
  const { jobs, fetchJobs } = useSystemStore();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    department: 0,
    role: 0,
    status: 'all'
  });
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department>();
  const [departmentUserCounts, setDepartmentUserCounts] = useState<number>(0);

  const { user, getLoggedUser } = useAuthStore();

  // Mock data
  useEffect(() => {
    setLoading(true);
    getLoggedUser();
    fetchPermissions();
    fetchDepartments();
    fetchUsers(user?.organizationId!);
    fetchJobs();
    setLoading(false);
    handleUserCount();
  }, []);

  const handleUserCount = useCallback(async () => {
    setDepartmentUserCounts(await getDepartmentUserCount(0));
  }, [departments, getDepartmentUserCount]);

  const getRoleLabel = (id: number) => {
    return jobs.find(job => {
      if (job.id === id) return job;
    })?.title;
  };

  const getDepartmentLabel = (id: number) => {
    return departments.find(department => {
      if (department.id === id) return department;
    })?.name || t.noDepartment;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'badge-success-custom', icon: CheckCircle },
      inactive: { color: 'badge-warning', icon: Clock },
      suspended: { color: 'badge-error', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {(t as Record<string, string>)[status]}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedFilters.department === 0 || user.departmentId === selectedFilters.department;
    const matchesRole = selectedFilters.role === 0 || user.jobId === selectedFilters.role;
    const matchesStatus = selectedFilters.status === 'all' || user.status === selectedFilters.status;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(t.confirmDeleteUser)) {
      await deleteUser(userId);
    }
  };

  const handleCreateDepartment = () => {
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    if (window.confirm(t.confirmDeleteDepartment)) {
      await deleteDepartment(departmentId);
      fetchDepartments();
    }
  };

  const tabs: Tab[] = [
    { id: 'users', label: t.users, icon: Users, count: users.length },
    { id: 'departments', label: t.departments, icon: Building2, count: departments.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-base-content">{t.admin}</h1>
          <p className="text-neutral mt-1">{t.adminSubtitle}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-base-200 rounded-xl p-1 shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-content shadow-md' 
                  : 'text-base-content hover:bg-base-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-content' : 'text-base-content'}`} />
              <span className="text-sm">{tab.label}</span>
              <span className={`badge badge-sm ${
                isActive 
                  ? 'bg-primary-content text-primary' 
                  : 'bg-base-300 text-base-content'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? t.searchUsers : t.searchDepartments}
              className="input input-bordered input-sm pl-10 bg-base-200 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === 'users' && (
            <select
              className="select select-bordered select-sm bg-base-200 w-full sm:w-auto"
              value={selectedFilters.department}
              onChange={(e) => setSelectedFilters({...selectedFilters, department: Number(e.target.value)})}
            >
              <option value="0">{t.allDepartments}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'users' && (
            <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={handleCreateUser} style={{ textTransform: 'uppercase' }}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t.createUser}
            </button>
          )}
          {activeTab === 'departments' && (
            <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={handleCreateDepartment} style={{ textTransform: 'uppercase' }}>
              <Building className="w-4 h-4 mr-2" />
              {t.createDepartment}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100">
                  <div className="card-body">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{users.length}</h3>
                        <p className="text-neutral text-sm">{t.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</h3>
                        <p className="text-neutral text-sm">{t.activeUsers}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="card bg-base-100">
                <div className="card-body p-0">
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>{t.name}</th>
                          <th>{t.email}</th>
                          <th>{t.role}</th>
                          <th>{t.department}</th>
                          <th>{t.status}</th>
                          <th>{t.lastLogin}</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                                    {/* <span className="text-sm">{user.avatar}</span> */}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{user.name} {user.surname}</div>
                                  <div className="text-sm opacity-50">{user.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge badge-outline">{getRoleLabel(user.jobId)}</span>
                            </td>
                            <td>{getDepartmentLabel(user?.departmentId!)}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                              <div className="text-sm">
                                {new Date(user.updatedAt!).toLocaleDateString()}
                                <br />
                                <span className="opacity-50">
                                  {new Date(user.updatedAt!).toLocaleTimeString()}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button 
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleEditUser(user)}
                                  title={t.editUser}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  className="btn btn-ghost btn-sm text-error"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title={t.deleteUser}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                      <p className="text-base-content/70">{t.noUsersFound}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100">
                  <div className="card-body">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{departments.length}</h3>
                        <p className="text-neutral text-sm">{t.totalDepartments}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{departmentUserCounts}</h3>
                        <p className="text-neutral text-sm">Total de Usuários</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartments.map(department => (
                  <div key={department.id} className="card bg-base-100">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="card-title">{department.name}</h3>
                          <p className="text-base-content/70">{department.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleEditDepartment(department)}
                            title={t.editDepartment}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDeleteDepartment(department.id!)}
                            title={t.deleteDepartment}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="opacity-70">{t.departmentManager}:</span>
                          <span>{department.managerName}</span>
                        </div>
                        <DepartmentUserCount departmentId={department.id!} label={t.usersInDepartment} />
                        <div className="flex justify-between text-sm">
                          <span className="opacity-70">{t.createdAt}:</span>
                          <span>{new Date(department.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredDepartments.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/70">{t.noDepartmentsFound}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          departments={departments}
          permissions={permissions}
          onClose={() => {
            fetchUsers(user?.organizationId!);
            handleUserCount();
            setShowUserModal(false);
          }}
        />
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => {
            fetchDepartments();
            setShowDepartmentModal(false);
          }}
        />
      )}


    </div>
  );
};



export default Admin; 