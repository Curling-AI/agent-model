import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Zap, 
  MoreVertical,
  MessageSquare,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const Agents = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const t = useTranslation(language);

  // Dados de exemplo dos agentes
  const [agents, setAgents] = React.useState([
    {
      id: 1,
      name: t.salesAgent,
      description: t.salesAgentDesc,
      status: 'active',
      lastActive: `2 ${t.minutesAgo}`
    },
    {
      id: 2,
      name: t.technicalSupport,
      description: t.technicalSupportDesc,
      status: 'active',
      lastActive: `5 ${t.minutesAgo}`
    },
    {
      id: 3,
      name: t.marketingAgent,
      description: t.marketingAgentDesc,
      status: 'paused',
      lastActive: `1${t.hourAgo}`
    },
    {
      id: 4,
      name: t.financialAgent,
      description: t.financialAgentDesc,
      status: 'active',
      lastActive: `10 ${t.minutesAgo}`
    }
  ]);

  const toggleAgentStatus = (agentId: number) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
          : agent
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content">{t.yourAgents}</h1>
            <p className="text-neutral mt-1">{t.manageAgents}</p>
          </div>
          <div className="flex flex-row items-center space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => navigate('/agents/test')}
              className="btn btn-primary btn-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.testAgents}
            </button>
            <select className="select select-bordered select-sm bg-base-200">
              <option>{t.allAgents}</option>
              <option>{t.active}</option>
              <option>{t.paused}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{agents.length}</h3>
                <p className="text-neutral text-sm">{t.totalAgents}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-success rounded-full"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</h3>
                <p className="text-neutral text-sm">{t.activeAgents}</p>
              </div>
            </div>
          </div>
        </div>
        

      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {/* Create New Agent Card */}
        <div 
          onClick={() => navigate('/agents/create')}
          className="card bg-base-100 border-2 border-dashed hover:border-primary cursor-pointer card-hover group"
        >
          <div className="card-body items-center text-center justify-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t.createNewAgent}</h3>
            <p className="text-neutral text-sm">{t.configureAgent}</p>
          </div>
        </div>

        {/* Existing Agents */}
        {agents.map((agent) => (
          <div key={agent.id} className="card bg-base-100 card-hover">
            <div className="card-body p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">{agent.name}</h3>
                  <p className="text-neutral text-sm line-clamp-2">{agent.description}</p>
                </div>
                <div className="dropdown dropdown-end flex-shrink-0">
                  <button tabIndex={0} className="btn btn-ghost btn-sm">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52">
                    <li><a href="#edit"><Edit className="w-4 h-4" />{t.edit}</a></li>
                    <li><a href="#duplicate"><Copy className="w-4 h-4" />{t.duplicate}</a></li>
                    <li><hr className="my-1" /></li>
                    <li><a href="#delete" className="text-error"><Trash2 className="w-4 h-4" />{t.delete}</a></li>
                  </ul>
                </div>
              </div>

              {/* Status and Last Active */}
              <div className="flex items-center justify-between mb-3">
                <div className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {agent.status === 'active' ? t.activeStatus : t.pausedStatus}
                </div>
                <span className="text-xs text-neutral">{agent.lastActive}</span>
              </div>



              {/* Actions */}
              <div className="card-actions justify-end items-center mt-auto">
                {/* Toggle Switch */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral">{t.status}:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agent.status === 'active'}
                      onChange={() => toggleAgentStatus(agent.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral rounded-full peer peer-checked:bg-success relative">
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${agent.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default Agents; 