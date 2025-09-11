import { useState, useEffect } from 'react';
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
import { Department, Permission, User } from '@/types';
import UserModal from '@/components/modal/UserModal';
import DepartmentModal from '@/components/modal/DepartmentModal';

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
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    department: 'all',
    role: 'all',
    status: 'all'
  });
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Mock data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@empresa.com',
          role: 'admin',
          department: 'TI',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00',
          createdAt: '2023-06-15T09:00:00',
          phone: '+55 11 99999-9999',
          avatar: 'JS',
          permissions: [1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15, 16, 9, 10, 11, 12]
        },
        {
          id: 2,
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.santos@empresa.com',
          role: 'manager',
          department: 'Vendas',
          status: 'active',
          lastLogin: '2024-01-15T09:15:00',
          createdAt: '2023-08-20T14:30:00',
          phone: '+55 11 88888-8888',
          avatar: 'MS',
          permissions: [1, 2, 4, 5, 6, 8, 13, 14, 15, 16]
        },
        {
          id: 3,
          firstName: 'Pedro',
          lastName: 'Oliveira',
          email: 'pedro.oliveira@empresa.com',
          role: 'user',
          department: 'Marketing',
          status: 'inactive',
          lastLogin: '2024-01-10T16:45:00',
          createdAt: '2023-09-10T11:20:00',
          phone: '+55 11 77777-7777',
          avatar: 'PO',
          permissions: [4, 8, 13, 16]
        },
        {
          id: 4,
          firstName: 'Ana',
          lastName: 'Costa',
          email: 'ana.costa@empresa.com',
          role: 'viewer',
          department: 'RH',
          status: 'active',
          lastLogin: '2024-01-15T08:00:00',
          createdAt: '2023-10-05T13:15:00',
          phone: '+55 11 66666-6666',
          avatar: 'AC',
          permissions: [4, 8, 12, 13]
        }
      ]);

      setDepartments([
        {
          id: 1,
          name: 'TI',
          description: 'Tecnologia da Informação',
          manager: 'João Silva',
          userCount: 5,
          createdAt: '2023-01-15T09:00:00'
        },
        {
          id: 2,
          name: 'Vendas',
          description: 'Departamento de Vendas',
          manager: 'Maria Santos',
          userCount: 8,
          createdAt: '2023-02-20T10:30:00'
        },
        {
          id: 3,
          name: 'Marketing',
          description: 'Departamento de Marketing',
          manager: 'Carlos Lima',
          userCount: 4,
          createdAt: '2023-03-10T14:15:00'
        },
        {
          id: 4,
          name: 'RH',
          description: 'Recursos Humanos',
          manager: 'Ana Costa',
          userCount: 3,
          createdAt: '2023-04-05T11:45:00'
        }
      ]);

      setPermissions([
        { id: 1, name: 'createAgent', description: 'Criar Agente', category: 'agent' },
        { id: 2, name: 'editAgent', description: 'Editar Agente', category: 'agent' },
        { id: 3, name: 'deleteAgent', description: 'Excluir Agente', category: 'agent' },
        { id: 4, name: 'viewAgent', description: 'Visualizar Agente', category: 'agent' },
        { id: 5, name: 'createLead', description: 'Criar Lead', category: 'crm' },
        { id: 6, name: 'editLead', description: 'Editar Lead', category: 'crm' },
        { id: 7, name: 'deleteLead', description: 'Excluir Lead', category: 'crm' },
        { id: 8, name: 'viewLead', description: 'Visualizar Lead', category: 'crm' },
        { id: 13, name: 'viewConversation', description: 'Visualizar Conversa', category: 'conversation' },
        { id: 14, name: 'assumeConversation', description: 'Assumir Conversa', category: 'conversation' },
        { id: 15, name: 'finishConversation', description: 'Finalizar Conversa', category: 'conversation' },
        { id: 16, name: 'archiveConversation', description: 'Arquivar Conversa', category: 'conversation' },
        { id: 9, name: 'manageUsers', description: 'Gerenciar Usuários', category: 'admin' },
        { id: 10, name: 'manageDepartments', description: 'Gerenciar Departamentos', category: 'admin' },
        { id: 11, name: 'managePermissions', description: 'Gerenciar Permissões', category: 'admin' },
        { id: 12, name: 'viewReports', description: 'Visualizar Relatórios', category: 'admin' }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return t.adminRole as string;
      case 'manager':
        return t.managerRole as string;
      case 'user':
        return t.userRole as string;
      case 'viewer':
        return t.viewerRole as string;
      default:
        return role;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'badge-success', icon: CheckCircle },
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
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedFilters.department === 'all' || user.department === selectedFilters.department;
    const matchesRole = selectedFilters.role === 'all' || user.role === selectedFilters.role;
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

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(t.confirmDeleteUser)) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = (departmentId: number) => {
    if (window.confirm(t.confirmDeleteDepartment)) {
      setDepartments(departments.filter(dept => dept.id !== departmentId));
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
              onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
            >
              <option value="all">{t.allDepartments}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'users' && (
            <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={handleCreateUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              {t.createUser}
            </button>
          )}
          {activeTab === 'departments' && (
            <button className="btn btn-primary btn-sm w-full sm:w-auto" onClick={handleCreateDepartment}>
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
                                    <span className="text-sm">{user.avatar}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm opacity-50">{user.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge badge-outline">{getRoleLabel(user.role)}</span>
                            </td>
                            <td>{user.department || t.noDepartment}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                              <div className="text-sm">
                                {new Date(user.lastLogin).toLocaleDateString()}
                                <br />
                                <span className="opacity-50">
                                  {new Date(user.lastLogin).toLocaleTimeString()}
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
                        <h3 className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.userCount, 0)}</h3>
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
                            onClick={() => handleDeleteDepartment(department.id)}
                            title={t.deleteDepartment}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="opacity-70">{t.departmentManager}:</span>
                          <span>{department.manager}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="opacity-70">{t.usersInDepartment}:</span>
                          <span className="badge badge-primary">{department.userCount}</span>
                        </div>
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
          onClose={() => setShowUserModal(false)}
          onSave={(userData) => {
            if (editingUser) {
              setUsers(users.map(u => u.id === editingUser.id ? {...u, ...userData} : u));
            } else {
              setUsers([...users, { ...userData, id: Date.now() }]);
            }
            setShowUserModal(false);
          }}
        />
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => setShowDepartmentModal(false)}
          onSave={(deptData) => {
            if (editingDepartment) {
              setDepartments(departments.map(d => d.id === editingDepartment.id ? {...d, ...deptData} : d));
            } else {
              setDepartments([...departments, { ...deptData, id: Date.now(), userCount: 0 }]);
            }
            setShowDepartmentModal(false);
          }}
        />
      )}


    </div>
  );
};



export default Admin; 