import { useEffect, useState } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,

  UserPlus,
  FileText,
  Download,
  BarChart3,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/translations';
import { useAuthStore } from '@/store/auth';

type AgentId = 'all' | 'sales' | 'technical' | 'marketing' | 'financial';

interface Kpi {
  title: any;
  value: string;
  change: string;
  trending: string;
  icon: React.ComponentType<any>;
  color: string;
}

const Dashboard: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  const [activityFilter, setActivityFilter] = useState(t.all);
  const [selectedPeriod, setSelectedPeriod] = useState(t.last30Days);
  const [selectedAgent, setSelectedAgent] = useState('all');

  // const { user, getLoggedUser } = useAuthStore();

  // Lista de agentes disponíveis
  const availableAgents = [
    { id: 'all', name: t.allAgents },
    { id: 'sales', name: t.salesAgent },
    { id: 'technical', name: t.technicalSupport },
    { id: 'marketing', name: t.marketingAgent },
    { id: 'financial', name: t.financialAgent }
  ];

  // Dados de exemplo filtrados por agente

  const getKpisByAgent = (agentId: AgentId) => {
    const kpisData: Record<AgentId, Kpi[]> = {
      all: [
        {
          title: t.leadsAttended,
          value: '1,247',
          change: '+12%',
          trending: 'up',
          icon: Users,
          color: 'text-primary'
        },
        {
          title: t.qualifiedLeads,
          value: '328',
          change: '+8%',
          trending: 'up',
          icon: Target,
          color: 'text-primary'
        },
        {
          title: t.conversionRate,
          value: '26.3%',
          change: '-2%',
          trending: 'down',
          icon: TrendingUp,
          color: 'text-accent'
        },
        {
          title: t.activeConversations,
          value: '89',
          change: '+15%',
          trending: 'up',
          icon: MessageSquare,
          color: 'text-primary'
        }
      ],
      sales: [
        {
          title: t.leadsAttended,
          value: '456',
          change: '+18%',
          trending: 'up',
          icon: Users,
          color: 'text-primary'
        },
        {
          title: t.qualifiedLeads,
          value: '128',
          change: '+12%',
          trending: 'up',
          icon: Target,
          color: 'text-primary'
        },
        {
          title: t.conversionRate,
          value: '28.1%',
          change: '+3%',
          trending: 'up',
          icon: TrendingUp,
          color: 'text-success'
        },
        {
          title: t.activeConversations,
          value: '32',
          change: '+8%',
          trending: 'up',
          icon: MessageSquare,
          color: 'text-primary'
        }
      ],
      technical: [
        {
          title: t.leadsAttended,
          value: '389',
          change: '+5%',
          trending: 'up',
          icon: Users,
          color: 'text-primary'
        },
        {
          title: t.qualifiedLeads,
          value: '95',
          change: '+2%',
          trending: 'up',
          icon: Target,
          color: 'text-primary'
        },
        {
          title: t.conversionRate,
          value: '24.4%',
          change: '-1%',
          trending: 'down',
          icon: TrendingUp,
          color: 'text-accent'
        },
        {
          title: t.activeConversations,
          value: '28',
          change: '+12%',
          trending: 'up',
          icon: MessageSquare,
          color: 'text-primary'
        }
      ],
      marketing: [
        {
          title: t.leadsAttended,
          value: '234',
          change: '+15%',
          trending: 'up',
          icon: Users,
          color: 'text-primary'
        },
        {
          title: t.qualifiedLeads,
          value: '67',
          change: '+9%',
          trending: 'up',
          icon: Target,
          color: 'text-primary'
        },
        {
          title: t.conversionRate,
          value: '28.6%',
          change: '+4%',
          trending: 'up',
          icon: TrendingUp,
          color: 'text-success'
        },
        {
          title: t.activeConversations,
          value: '18',
          change: '+6%',
          trending: 'up',
          icon: MessageSquare,
          color: 'text-primary'
        }
      ],
      financial: [
        {
          title: t.leadsAttended,
          value: '168',
          change: '+7%',
          trending: 'up',
          icon: Users,
          color: 'text-primary'
        },
        {
          title: t.qualifiedLeads,
          value: '38',
          change: '+3%',
          trending: 'up',
          icon: Target,
          color: 'text-primary'
        },
        {
          title: t.conversionRate,
          value: '22.6%',
          change: '-3%',
          trending: 'down',
          icon: TrendingUp,
          color: 'text-accent'
        },
        {
          title: t.activeConversations,
          value: '11',
          change: '+4%',
          trending: 'up',
          icon: MessageSquare,
          color: 'text-primary'
        }
      ]
    };

    return kpisData[agentId] || kpisData.all;
  };

  const kpis = getKpisByAgent(selectedAgent as AgentId);

  // Dados de conversas filtrados por agente
  const getConversationsDataByAgent = (agentId: AgentId) => {
    const conversationsDataByAgent = {
      all: [
        { name: 'Jan', conversas: 120, qualificados: 45 },
        { name: 'Fev', conversas: 150, qualificados: 52 },
        { name: 'Mar', conversas: 180, qualificados: 68 },
        { name: 'Abr', conversas: 220, qualificados: 78 },
        { name: 'Mai', conversas: 190, qualificados: 65 },
        { name: 'Jun', conversas: 240, qualificados: 85 },
      ],
      sales: [
        { name: 'Jan', conversas: 45, qualificados: 18 },
        { name: 'Fev', conversas: 52, qualificados: 22 },
        { name: 'Mar', conversas: 68, qualificados: 28 },
        { name: 'Abr', conversas: 78, qualificados: 32 },
        { name: 'Mai', conversas: 65, qualificados: 26 },
        { name: 'Jun', conversas: 85, qualificados: 35 },
      ],
      technical: [
        { name: 'Jan', conversas: 35, qualificados: 12 },
        { name: 'Fev', conversas: 42, qualificados: 15 },
        { name: 'Mar', conversas: 48, qualificados: 18 },
        { name: 'Abr', conversas: 55, qualificados: 22 },
        { name: 'Mai', conversas: 52, qualificados: 20 },
        { name: 'Jun', conversas: 58, qualificados: 25 },
      ],
      marketing: [
        { name: 'Jan', conversas: 25, qualificados: 10 },
        { name: 'Fev', conversas: 32, qualificados: 12 },
        { name: 'Mar', conversas: 38, qualificados: 15 },
        { name: 'Abr', conversas: 42, qualificados: 18 },
        { name: 'Mai', conversas: 35, qualificados: 14 },
        { name: 'Jun', conversas: 48, qualificados: 20 },
      ],
      financial: [
        { name: 'Jan', conversas: 15, qualificados: 5 },
        { name: 'Fev', conversas: 24, qualificados: 8 },
        { name: 'Mar', conversas: 26, qualificados: 10 },
        { name: 'Abr', conversas: 45, qualificados: 16 },
        { name: 'Mai', conversas: 38, qualificados: 12 },
        { name: 'Jun', conversas: 49, qualificados: 15 },
      ]
    };

    return conversationsDataByAgent[agentId] || conversationsDataByAgent.all;
  };

  const conversationsData = getConversationsDataByAgent(selectedAgent as AgentId);

  // Dados do funil filtrados por agente
  const getFunnelDataByAgent = (agentId: AgentId) => {
    const funnelDataByAgent = {
      all: [
        { name: t.visitors, value: 1000, fill: '#229ad2' },
        { name: t.leads, value: 400, fill: '#3ba8e0' },
        { name: t.qualified, value: 150, fill: '#6b7280' },
        { name: t.clients, value: 50, fill: '#9ca3af' },
      ],
      sales: [
        { name: t.visitors, value: 350, fill: '#229ad2' },
        { name: t.leads, value: 140, fill: '#3ba8e0' },
        { name: t.qualified, value: 55, fill: '#6b7280' },
        { name: t.clients, value: 18, fill: '#9ca3af' },
      ],
      technical: [
        { name: t.visitors, value: 280, fill: '#229ad2' },
        { name: t.leads, value: 110, fill: '#3ba8e0' },
        { name: t.qualified, value: 42, fill: '#6b7280' },
        { name: t.clients, value: 15, fill: '#9ca3af' },
      ],
      marketing: [
        { name: t.visitors, value: 220, fill: '#229ad2' },
        { name: t.leads, value: 88, fill: '#3ba8e0' },
        { name: t.qualified, value: 33, fill: '#6b7280' },
        { name: t.clients, value: 12, fill: '#9ca3af' },
      ],
      financial: [
        { name: t.visitors, value: 150, fill: '#229ad2' },
        { name: t.leads, value: 62, fill: '#3ba8e0' },
        { name: t.qualified, value: 20, fill: '#6b7280' },
        { name: t.clients, value: 5, fill: '#9ca3af' },
      ]
    };

    return funnelDataByAgent[agentId] || funnelDataByAgent.all;
  };

  const funnelData = getFunnelDataByAgent(selectedAgent as AgentId);

  const agentsPerformance = [
    { name: t.agent1, atendimentos: 45, satisfacao: 95 },
    { name: t.agent2, atendimentos: 38, satisfacao: 92 },
    { name: t.agent3, atendimentos: 52, satisfacao: 88 },
    { name: t.agent4, atendimentos: 41, satisfacao: 94 },
  ];

  // Dados de atividade recente focados em agentes WhatsApp
  const recentActivities = [
    {
      id: 1,
      type: 'whatsapp_message',
      title: t.whatsappMessageSent,
      description: `${t.proposalSent} +55 11 99999-9999`,
      agent: 'Maria Santos',
      time: 'há 5 min',
      priority: 'high',
      icon: MessageSquare,
      color: 'bg-success',
      iconColor: 'text-success-content',
      status: 'completed',
      platform: 'whatsapp',
      phone: '+55 11 99999-9999'
    },
    {
      id: 2,
      type: 'whatsapp_conversation',
      title: t.whatsappConversationEnded,
      description: t.saleCompleted,
      agent: 'Carlos Oliveira',
      time: 'há 12 min',
      priority: 'medium',
      icon: CheckCircle,
      color: 'bg-primary',
      iconColor: 'text-primary-content',
      status: 'completed',
      platform: 'whatsapp',
      phone: '+55 11 88888-8888'
    },
    {
      id: 3,
      type: 'whatsapp_lead',
      title: t.newWhatsappLead,
      description: t.interestedInPremium,
      agent: 'Ana Costa',
      time: 'há 1h',
      priority: 'high',
      icon: UserPlus,
      color: 'bg-warning',
      iconColor: 'text-warning-content',
      status: 'pending',
      platform: 'whatsapp',
      phone: '+55 11 77777-7777'
    },
    {
      id: 4,
      type: 'whatsapp_follow_up',
      title: t.whatsappFollowUpScheduled,
      description: t.sendProposalTomorrow,
      agent: 'Pedro Lima',
      time: 'há 2h',
      priority: 'medium',
      icon: Clock,
      color: 'bg-info',
      iconColor: 'text-info-content',
      status: 'pending',
      platform: 'whatsapp',
      phone: '+55 11 66666-6666'
    },
    {
      id: 5,
      type: 'whatsapp_media',
      title: t.whatsappMediaSent,
      description: t.productCatalogSent,
      agent: 'João Silva',
      time: 'há 3h',
      priority: 'low',
      icon: FileText,
      color: 'bg-accent',
      iconColor: 'text-accent-content',
      status: 'completed',
      platform: 'whatsapp',
      phone: '+55 11 55555-5555'
    },
    {
      id: 6,
      type: 'whatsapp_status',
      title: t.whatsappStatusUpdated,
      description: t.statusChangedToAvailable,
      agent: 'Carla Mendes',
      time: 'há 4h',
      priority: 'low',
      icon: CheckCircle,
      color: 'bg-secondary',
      iconColor: 'text-secondary-content',
      status: 'completed',
      platform: 'whatsapp',
      phone: 'N/A'
    }
  ];

  // Filtrar atividades baseado no filtro selecionado e agente
  const filteredActivities = recentActivities.filter(activity => {
    // Filtro por tipo de atividade
    let typeMatch = true;
    switch (activityFilter) {
      case t.messages:
        typeMatch = activity.type === 'whatsapp_message' || activity.type === 'whatsapp_media';
        break;
      case t.leadsActivity:
        typeMatch = activity.type === 'whatsapp_lead';
        break;
      case t.sales:
        typeMatch = activity.type === 'whatsapp_conversation';
        break;
      default:
        typeMatch = true;
    }

    // Filtro por agente
    let agentMatch = true;
    if (selectedAgent !== 'all') {
      const agentName = availableAgents.find(agent => agent.id === selectedAgent)?.name;
      agentMatch = activity.agent === agentName;
    }

    return typeMatch && agentMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-base-content">{t.dashboardTitle}</h1>
          <p className="text-neutral mt-1">
            {t.dashboardSubtitle}
            {selectedAgent !== 'all' && (
              <span className="ml-2 badge badge-primary badge-sm">
                {availableAgents.find(agent => agent.id === selectedAgent)?.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-row items-center space-x-2 md:space-x-3">
          {/* Filtro por Agente */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className={`btn btn-sm gap-2 ${selectedAgent !== 'all'
                  ? 'btn-primary'
                  : 'btn-outline hover:bg-base-200'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{availableAgents.find(agent => agent.id === selectedAgent)?.name || t.allAgents}</span>
              <span className="sm:hidden">{t.filter}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {availableAgents.map((agent) => (
                <li key={agent.id}>
                  <a
                    href={`#${agent.id}`}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={selectedAgent === agent.id ? 'active' : ''}
                  >
                    {agent.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Botão para limpar filtro */}
          {selectedAgent !== 'all' && (
            <button
              onClick={() => setSelectedAgent('all')}
              className="btn btn-ghost btn-sm"
              title={t.clearFilter}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-outline btn-sm gap-2 hover:bg-base-200"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedPeriod}</span>
              <span className="sm:hidden">{t.period}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="#today" onClick={() => setSelectedPeriod(t.today)}>{t.today}</a></li>
              <li><a href="#7days" onClick={() => setSelectedPeriod(t.last7Days)}>{t.last7Days}</a></li>
              <li><a href="#30days" onClick={() => setSelectedPeriod(t.last30Days)}>{t.last30Days}</a></li>
              <li><a href="#month" onClick={() => setSelectedPeriod(t.thisMonth)}>{t.thisMonth}</a></li>
              <li><a href="#year" onClick={() => setSelectedPeriod(t.thisYear)}>{t.thisYear}</a></li>
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-primary btn-sm gap-2 hover:bg-primary-focus"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.report}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
              <li className="menu-title">
                <span>{t.exportReport}</span>
              </li>
              <li>
                <a href="#export-pdf">
                  <Download className="w-4 h-4" />
                  {t.exportPDF}
                </a>
              </li>
              <li>
                <a href="#export-excel">
                  <Download className="w-4 h-4" />
                  {t.exportExcel}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="responsive-grid gap-4 md:gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card bg-base-100">
              <div className="card-body p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 md:p-3 rounded-xl bg-opacity-10 ${kpi.color.replace('text-', 'bg-')}`}>
                    <Icon className={`mobile-icon ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center text-xs md:text-sm ${kpi.trending === 'up' ? 'text-primary' : 'text-accent'}`}>
                    {kpi.trending === 'up' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />}
                    <span className="ml-1">{kpi.change}</span>
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <h3 className="mobile-text-xl md:text-2xl font-bold text-base-content">{kpi.value}</h3>
                  <p className="text-neutral mobile-text">{kpi.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Conversas por Mês */}
        <div className="card bg-base-100">
          <div className="card-body p-4 md:p-6">
            <h3 className="card-title mobile-text-lg md:text-xl">{t.conversationsPerMonth}</h3>
            <div className="responsive-chart mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversationsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="conversasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#229ad2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#229ad2" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="qualificadosGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversas"
                    stroke="#229ad2"
                    strokeWidth={3}
                    dot={{ fill: '#229ad2', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#229ad2', strokeWidth: 2, fill: 'white' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="qualificados"
                    stroke="#6b7280"
                    strokeWidth={3}
                    dot={{ fill: '#6b7280', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#6b7280', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full mr-3 shadow-sm"></div>
                <span className="text-sm font-medium text-base-content">{t.totalConversations}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-accent rounded-full mr-3 shadow-sm"></div>
                <span className="text-sm font-medium text-base-content">{t.qualifiedLeadsChart}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Funil de Conversão */}
        <div className="card bg-base-100">
          <div className="card-body">
            <h3 className="card-title">{t.conversionFunnel}</h3>
            <div className="h-80 mt-12">
              <div className="flex flex-col justify-center h-full space-y-4 px-6">
                {funnelData.map((entry, index) => {
                  const percentage = (entry.value / funnelData[0].value) * 100;
                  const width = Math.max(percentage, 25); // Largura mínima de 25%
                  const conversionRate = index > 0 ? ((entry.value / funnelData[index - 1].value) * 100).toFixed(1) : 100;

                  return (
                    <div key={entry.name} className="flex flex-col items-center group">
                      <div
                        className="relative h-14 flex items-center justify-center text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-500 hover:shadow-xl hover:scale-105"
                        style={{
                          width: `${width}%`,
                          background: `linear-gradient(135deg, ${entry.fill} 0%, ${entry.fill}dd 50%, ${entry.fill}aa 100%)`,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: `0 4px 20px ${entry.fill}22`,
                          animationDelay: `${index * 0.1}s`,
                          animation: 'slideInFunnel 0.6s ease-out forwards'
                        }}
                      >
                        <span className="drop-shadow-md z-10">
                          {entry.name}
                        </span>
                        <div className="absolute inset-0 bg-white bg-opacity-10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <div className="flex items-center justify-between w-full max-w-xs mt-2 text-xs text-base-content">
                        <span className="font-medium">{entry.value.toLocaleString()} {t.users}</span>
                        {index > 0 && (
                          <span className="text-accent font-medium">
                            {conversionRate}% {t.conversion}
                          </span>
                        )}
                      </div>

                      {index < funnelData.length - 1 && (
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-base-300 mt-1 opacity-50"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance dos Agentes */}
        <div className="card bg-base-100 h-full">
          <div className="card-body flex flex-col p-4 md:p-6">
            <h3 className="card-title mobile-text-lg md:text-xl">{t.agentPerformance}</h3>
            <div className="flex-1 mt-4 responsive-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentsPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#229ad2" stopOpacity={1} />
                      <stop offset="95%" stopColor="#3ba8e0" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, t.attendances]}
                  />
                  <Bar
                    dataKey="atendimentos"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="card bg-base-100">
          <div className="card-body p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2">
                <h3 className="card-title mobile-text-lg md:text-xl">{t.whatsappActivity}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="select select-bordered select-xs bg-base-200"
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                >
                  <option>{t.all}</option>
                  <option>{t.messages}</option>
                  <option>{t.leadsActivity}</option>
                  <option>{t.sales}</option>
                </select>
                <button className="btn btn-ghost btn-xs">
                  <MessageSquare className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={`activity-item group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${activity.status === 'pending'
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-base-300 hover:border-primary/30'
                      }`}
                  >
                    {/* Indicador de prioridade */}
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${activity.priority === 'high' ? 'bg-error' :
                        activity.priority === 'medium' ? 'bg-warning' : 'bg-success'
                      }`}></div>

                    <div className="flex items-start space-x-2 md:space-x-3">
                      <div className={`mobile-avatar ${activity.color} rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                        <Icon className={`mobile-icon ${activity.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-base-content text-sm truncate">
                            {activity.title}
                          </h4>
                          {activity.status === 'pending' && (
                            <span className="badge badge-warning badge-xs">{t.pending}</span>
                          )}
                        </div>

                        <p className="text-xs text-neutral mb-2 leading-relaxed">
                          {activity.description}
                        </p>

                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                          <div className="flex flex-wrap items-center space-x-2 md:space-x-3 text-xs">
                            <span className="text-primary font-medium">
                              {activity.agent}
                            </span>
                            {activity.phone !== 'N/A' && (
                              <span className="text-success font-mono hidden sm:inline">
                                {activity.phone}
                              </span>
                            )}
                            <span className="text-neutral flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.time}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn btn-ghost btn-xs" title={t.respond}>
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            <button className="btn btn-ghost btn-xs" title={t.viewConversation}>
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-base-300">
              <div className="flex items-center justify-between text-xs text-neutral">
                <div className="flex items-center space-x-4">
                  <span>{t.showing} {filteredActivities.length} {t.of} {recentActivities.length} {t.activities}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>{t.online}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;

// Estilos CSS personalizados
const styles = `
  @keyframes slideInFunnel {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .activity-item {
    animation: slideInFunnel 0.3s ease-out forwards;
  }
  
  .activity-item:nth-child(1) { animation-delay: 0.1s; }
  .activity-item:nth-child(2) { animation-delay: 0.2s; }
  .activity-item:nth-child(3) { animation-delay: 0.3s; }
  .activity-item:nth-child(4) { animation-delay: 0.4s; }
  .activity-item:nth-child(5) { animation-delay: 0.5s; }
  .activity-item:nth-child(6) { animation-delay: 0.6s; }
`;

// Adicionar estilos ao head se não existirem
if (!document.getElementById('dashboard-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'dashboard-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 