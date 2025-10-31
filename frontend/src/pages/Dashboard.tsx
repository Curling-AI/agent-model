import { useEffect, useState } from 'react'
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
  Download,
  BarChart3,
  Filter,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from '@/translations'
import { useAuthStore } from '@/store/auth'
import { useConversationStore } from '@/store/conversation'
import { useAgentStore } from '@/store/agent'
import { Agent } from '@/types/agent'
import { useCrmColumnStore } from '@/store/crm-column'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useLeadStore } from '@/store/lead'

interface Kpi {
  title: any
  value: string
  change: string
  trending: string
  icon: React.ComponentType<any>
  color: string
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  agent: string
  time: Date
  priority: string
  icon: React.ComponentType<any>
  color: string
  iconColor: string
  status: string
  platform: string
  phone: string
}
const Dashboard: React.FC = () => {
  const language = useLanguage()
  const t = useTranslation(language)
  const [activityFilter, setActivityFilter] = useState(t.all)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last30Days')
  const [selectedAgent, setSelectedAgent] = useState<number>(-1)

  const { user, getLoggedUser } = useAuthStore()
  //const { leads, fetchLeads } = useLeadStore();
  const { conversations, listConversations } = useConversationStore()
  const { agents, fetchAgents } = useAgentStore()
  const { crmColumns, fetchCrmColumns } = useCrmColumnStore()
  const { leadsCRMHistory, fetchLeadsCRMHistory } = useLeadStore()
  const [kpisData, setKpisData] = useState<Record<number, Kpi[]>>({})
  const [funnelData, setFunnelData] = useState<
    Record<number, { namePt: string; nameEn: string; value: number; fill: string }[]>
  >({})
  const [agentsPerformance, setAgentsPerformance] = useState<
    { name: string; atendimentos: number }[]
  >([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<RecentActivity[]>([])
  const navigate = useNavigate()

  const periodToDate = {
    ['today']: new Date().setHours(0, 0, 0, 0),
    ['last7Days']: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
    ['last30Days']: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
    ['thisMonth']: new Date(new Date().getFullYear(), new Date().getMonth(), 1).setHours(
      0,
      0,
      0,
      0,
    ),
    ['thisYear']: new Date(new Date().getFullYear(), 0, 1).setHours(0, 0, 0, 0),
  }

  useEffect(() => {
    getLoggedUser()
  }, [])

  useEffect(() => {
    if (user?.organizationId) {
      listConversations(user.organizationId)
      fetchAgents(user.organizationId, 'all')
      fetchCrmColumns(user.organizationId)
      fetchLeadsCRMHistory(user.organizationId)
    }
  }, [user?.organizationId])

  // Lista de agentes disponíveis
  const availableAgents = [{ id: -1, name: t.allAgents }].concat(
    agents.map((agent: Agent) => ({ id: agent.id, name: agent.name })),
  )

  // Dados de exemplo filtrados por agente

  const getKpisByAgent = (agentId?: number, selectedPeriod?: string) => {
    agentId = agentId ?? -1
    const startDate =
      periodToDate[selectedPeriod as keyof typeof periodToDate] ?? periodToDate['last30Days']
    const previousPeriod = startDate - (Date.now() - startDate)
    const leadsAttended = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        Date.parse(conversation.lead.createdAt!) >= startDate,
    ).length
    const previousLeadsAttended = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        Date.parse(conversation.lead.createdAt!) >= previousPeriod &&
        Date.parse(conversation.lead.createdAt!) < startDate,
    ).length
    const changeLeadsAttended = previousLeadsAttended
      ? ((leadsAttended - previousLeadsAttended) / previousLeadsAttended) * 100
      : 0
    const qualifiedLeads = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        conversation.lead.status <= 2 &&
        Date.parse(conversation.lead.createdAt!) >= startDate,
    ).length
    const previousQualifiedLeads = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        conversation.lead.status <= 2 &&
        Date.parse(conversation.lead.createdAt!) >= previousPeriod &&
        Date.parse(conversation.lead.createdAt!) < startDate,
    ).length
    const changeQualifiedLeads = previousQualifiedLeads
      ? ((qualifiedLeads - previousQualifiedLeads) / previousQualifiedLeads) * 100
      : 0
    const conversionRate = leadsAttended ? (qualifiedLeads / leadsAttended) * 100 : 0
    const previousConversionRate = previousLeadsAttended
      ? (previousQualifiedLeads / previousLeadsAttended) * 100
      : 0
    const changeConversionRate = previousConversionRate
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
      : 0
    const activeConversations = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        conversation.messages[conversation.messages.length - 1].timestamp > new Date(startDate),
    ).length
    const previousActiveConversations = conversations.filter(
      (conversation) =>
        (agentId === -1 ? true : conversation.agent.id === agentId) &&
        conversation.messages[conversation.messages.length - 1].timestamp >
          new Date(previousPeriod) &&
        conversation.messages[conversation.messages.length - 1].timestamp < new Date(startDate),
    ).length
    const changeActiveConversations = previousActiveConversations
      ? ((activeConversations - previousActiveConversations) / previousActiveConversations) * 100
      : 0
    const kpisData: Record<number, Kpi[]> = {
      [agentId ?? -1]: [
        {
          title: t.leadsAttended,
          value: leadsAttended.toString(),
          change: changeLeadsAttended.toFixed(0) + '%',
          trending: changeLeadsAttended > 0 ? 'up' : 'down',
          icon: Users,
          color: 'text-primary',
        },
        {
          title: t.qualifiedLeads,
          value: qualifiedLeads.toString(),
          change: changeQualifiedLeads.toFixed(0) + '%',
          trending: changeQualifiedLeads > 0 ? 'up' : 'down',
          icon: Target,
          color: 'text-primary',
        },
        {
          title: t.conversionRate,
          value: conversionRate.toFixed(2).toString() + '%',
          change: changeConversionRate.toFixed(0) + '%',
          trending: changeConversionRate > 0 ? 'up' : 'down',
          icon: TrendingUp,
          color: 'text-accent',
        },
        {
          title: t.activeConversations,
          value: activeConversations.toString(),
          change: changeActiveConversations.toFixed(0) + '%',
          trending: changeActiveConversations > 0 ? 'up' : 'down',
          icon: MessageSquare,
          color: 'text-primary',
        },
      ],
    }
    return kpisData[agentId ?? -1] || []
  }

  useEffect(() => {
    setKpisData((prev) => ({
      ...prev,
      [selectedAgent as number]: getKpisByAgent(selectedAgent as number, selectedPeriod),
    }))
  }, [selectedAgent, selectedPeriod, conversations])

  // Dados de conversas filtrados por agente
  const getConversationsDataByAgent = (agentId?: number) => {
    agentId = agentId ?? -1
    const conversationsData = conversations.filter((conversation) =>
      agentId === -1 ? true : conversation.agent.id === agentId,
    )
    const conversationsDataByAgent = {
      [agentId ?? -1]: [
        {
          name: t.jan,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 0,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 0 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.feb,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 1,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 1 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.mar,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 2,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 2 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.apr,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 3,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 3 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.may,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 4,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 4 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.jun,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 5,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 5 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.jul,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 6,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 6 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.aug,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 7,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 7 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.sep,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 8,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 8 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.oct,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 9,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 9 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.nov,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 10,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 10 &&
              conversation.lead.status <= 2,
          ).length,
        },
        {
          name: t.dec,
          conversas: conversationsData.filter(
            (conversation) => new Date(conversation.lead.createdAt!).getMonth() === 11,
          ).length,
          qualificados: conversationsData.filter(
            (conversation) =>
              new Date(conversation.lead.createdAt!).getMonth() === 11 &&
              conversation.lead.status <= 2,
          ).length,
        },
      ],
    }
    return conversationsDataByAgent[agentId ?? -1] || []
  }
  const conversationsData = getConversationsDataByAgent(selectedAgent as number)

  // Dados do funil filtrados por agente
  const getFunnelDataByAgent = (agentId?: number) => {
    if (crmColumns.length === 0) {
      setFunnelData((prev) => ({ ...prev, [agentId ?? -1]: [] }))
      return
    }
    const startDate =
      periodToDate[selectedPeriod as keyof typeof periodToDate] ?? periodToDate['last30Days']
    const leads = conversations
      .filter(
        (conversation) =>
          (agentId === -1 ? true : conversation.agent.id === agentId) &&
          Date.parse(conversation.lead.createdAt!) >= startDate,
      )
      .map((conversation) => conversation.lead)
    const funnelDataByAgent = {
      [agentId ?? -1]: [
        {
          namePt: crmColumns.find((column) => column.id === 1)?.titlePt ?? '',
          nameEn: crmColumns.find((column) => column.id === 1)?.titleEn ?? '',
          value: leads.filter((lead) => lead.status >= 1).length,
          fill: '#229ad2',
        },
        {
          namePt: crmColumns.find((column) => column.id === 2)?.titlePt ?? '',
          nameEn: crmColumns.find((column) => column.id === 2)?.titleEn ?? '',
          value: leads.filter((lead) => lead.status >= 2).length,
          fill: '#3ba8e0',
        },
        {
          namePt: crmColumns.find((column) => column.id === 3)?.titlePt ?? '',
          nameEn: crmColumns.find((column) => column.id === 3)?.titleEn ?? '',
          value: leads.filter((lead) => lead.status >= 3).length,
          fill: '#6b7280',
        },
        {
          namePt: crmColumns.find((column) => column.id === 4)?.titlePt ?? '',
          nameEn: crmColumns.find((column) => column.id === 4)?.titleEn ?? '',
          value: leads.filter((lead) => lead.status >= 4).length,
          fill: '#9ca3af',
        },
        {
          namePt: crmColumns.find((column) => column.id === 5)?.titlePt ?? '',
          nameEn: crmColumns.find((column) => column.id === 5)?.titleEn ?? '',
          value: leads.filter((lead) => lead.status >= 5).length,
          fill: '#9ca3af',
        },
      ],
    }
    setFunnelData((prev) => ({ ...prev, [agentId ?? -1]: funnelDataByAgent[agentId ?? -1] }))
  }

  const getAgentsPerformance = (period: string) => {
    const periodToDate = {
      ['today']: new Date().setHours(0, 0, 0, 0),
      ['last7Days']: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
      ['last30Days']: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
      ['thisMonth']: new Date(new Date().getFullYear(), new Date().getMonth(), 1).setHours(
        0,
        0,
        0,
        0,
      ),
      ['thisYear']: new Date(new Date().getFullYear(), 0, 1).setHours(0, 0, 0, 0),
    }
    const startDate =
      periodToDate[period as keyof typeof periodToDate] ?? periodToDate['last30Days']
    const agentsPerformance = agents.map((agent) => ({
      name: agent.name,
      atendimentos: conversations.filter(
        (conversation) =>
          conversation.agent.id === agent.id &&
          Date.parse(conversation.lead.createdAt!) >= startDate,
      ).length,
    }))
    setAgentsPerformance(agentsPerformance)
  }

  useEffect(() => {
    getAgentsPerformance(selectedPeriod)
  }, [selectedPeriod, conversations])

  useEffect(() => {
    getFunnelDataByAgent(selectedAgent as number)
  }, [selectedAgent, selectedPeriod, conversations])

  const getRecentActivities = (agentId: number) => {
    const startDate =
      periodToDate[selectedPeriod as keyof typeof periodToDate] ?? periodToDate['last30Days']
    const activityById = new Map<string, RecentActivity>()

    // lead activities
    conversations.forEach((conversation) => {
      if (agentId === -1 || conversation.agent.id === agentId) {
        if (new Date(conversation.lead.createdAt!) > new Date(startDate)) {
          activityById.set(conversation.id.toString() + '_new_lead', {
            id: conversation.id.toString() + '_new_lead',
            type: 'whatsapp_lead',
            title: t.newWhatsappLead,
            description: `${conversation.lead.name}: ${conversation.messages[0].content}`,
            agent: conversation.agent.name,
            time: new Date(conversation.lead.createdAt!),
            priority: conversation.lead.priority ?? 'medium',
            icon: UserPlus,
            color: 'bg-success',
            iconColor: 'text-success-content',
            status: conversation.messages.some((message) => message.sender === 'agent')
              ? 'completed'
              : 'pending',
            platform: conversation.lead.source,
            phone: conversation.lead.phone ?? 'N/A',
          })
        }
      }
    })

    // conversation activities
    conversations.forEach((conversation) => {
      if (agentId === -1 || conversation.agent.id === agentId) {
        if (new Date(conversation.lead.archivedAt!) > new Date(startDate)) {
          activityById.set(conversation.id.toString() + '_conversation_ended', {
            id: conversation.id.toString() + '_conversation_ended',
            type: 'whatsapp_conversation',
            title: t.whatsappConversationEnded,
            description: `${conversation.lead.name}: ${conversation.messages[conversation.messages.length - 1].content}`,
            agent: conversation.agent.name,
            time: new Date(conversation.lead.archivedAt!),
            priority: conversation.lead.priority ?? 'medium',
            icon: CheckCircle,
            color: conversation.lead.status === 5 ? 'bg-success' : 'bg-primary',
            iconColor: 'text-primary-content',
            status: 'completed',
            platform: conversation.lead.source,
            phone: conversation.lead.phone,
          })
        }
      }
    })
    // lead status history
    leadsCRMHistory.filter((crmHistory) => ( agentId === -1 || crmHistory.agentId === agentId)).forEach((crmHistory) => {
      if (new Date(crmHistory.createdAt!) > new Date(startDate)) {
        const oldStatusColumn = crmColumns.find((column) => column.id === crmHistory.oldStatus)?.[language.language === 'pt' ? 'titlePt' : 'titleEn']
        const newStatusColumn = crmColumns.find((column) => column.id === crmHistory.newStatus)?.[language.language === 'pt' ? 'titlePt' : 'titleEn']
        const conversationId = conversations.find((conversation) => conversation.lead.id === crmHistory.lead.id)?.id.toString() ?? ''
        activityById.set(conversationId + '_' + crmHistory.id.toString() + '_lead_status_history', {
          id: conversationId + '_' + crmHistory.id.toString() + '_lead_status_history',
          type: 'lead_status_updated',
          title: t.leadStatusUpdated,
          description: `${crmHistory.lead.name}: ${t.from} "${oldStatusColumn}" ${t.to} "${newStatusColumn}"`,
          agent: agents.find(agent => agent.id === crmHistory.agentId)?.name ?? '',
          time: new Date(crmHistory.createdAt!),
          priority: crmHistory.lead.priority ?? 'medium',
          icon: CheckCircle,
          color: crmHistory.newStatus > crmHistory.oldStatus ? 'bg-success' : 'bg-warning',
          iconColor: crmHistory.newStatus > crmHistory.oldStatus ? 'text-success-content' : 'text-warning-content',
          status: 'completed',
          platform: crmHistory.lead.source,
          phone: crmHistory.lead.phone,
        })
      }
    })
    const deduped = Array.from(activityById.values()).sort(
      (a, b) => b.time.getTime() - a.time.getTime(),
    )
    setRecentActivities(deduped)
  }

  useEffect(() => {
    getRecentActivities(selectedAgent as number)
  }, [selectedAgent, selectedPeriod, conversations, language.language])

  // Filtrar atividades baseado no filtro selecionado e agente
  useEffect(() => {
    setFilteredActivities(
      recentActivities.filter((activity) => {
        // Filtro por tipo de atividade
        let typeMatch = true
        switch (activityFilter) {
          case 'messages':
            typeMatch = activity.type === 'whatsapp_message' || activity.type === 'whatsapp_media'
            break
          case 'leads':
            typeMatch = activity.type === 'whatsapp_lead' || activity.type === 'lead_status_updated'
            break
          case 'sales':
            typeMatch = activity.type === 'whatsapp_conversation'
            break
          default:
            typeMatch = true
        }

        // Filtro por agente - só filtra se um agente específico estiver selecionado (não -1)
        let agentMatch = true
        if (selectedAgent !== null && selectedAgent !== -1) {
          const agentName = availableAgents.find((agent) => agent.id === selectedAgent)?.name
          agentMatch = activity.agent === agentName
        }

        return typeMatch && agentMatch
      }),
    )
  }, [recentActivities, activityFilter, selectedAgent])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-base-content text-3xl font-bold">{t.dashboardTitle}</h1>
          <p className="text-neutral mt-1">
            {t.dashboardSubtitle}
            {selectedAgent !== null && (
              <span className="badge badge-primary badge-sm ml-2">
                {availableAgents.find((agent) => agent.id === selectedAgent)?.name ?? t.allAgents}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-row items-center space-x-2 md:space-x-3">
          {/* Filtro por Agente */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className={`btn btn-sm gap-2 ${
                selectedAgent !== null ? 'btn-primary' : 'btn-outline hover:bg-base-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {availableAgents.find((agent) => agent.id === selectedAgent)?.name || t.allAgents}
              </span>
              <span className="sm:hidden">{t.filter}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
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
          {selectedAgent !== -1 && (
            <button
              onClick={() => setSelectedAgent(-1)}
              className="btn btn-ghost btn-sm"
              title={t.clearFilter}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-outline btn-sm hover:bg-base-200 gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t[selectedPeriod as keyof typeof t]}</span>
              <span className="sm:hidden">{t.period}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <a href="#today" onClick={() => setSelectedPeriod('today')}>
                  {t.today}
                </a>
              </li>
              <li>
                <a href="#7days" onClick={() => setSelectedPeriod('last7Days')}>
                  {t.last7Days}
                </a>
              </li>
              <li>
                <a href="#30days" onClick={() => setSelectedPeriod('last30Days')}>
                  {t.last30Days}
                </a>
              </li>
              <li>
                <a href="#month" onClick={() => setSelectedPeriod('thisMonth')}>
                  {t.thisMonth}
                </a>
              </li>
              <li>
                <a href="#year" onClick={() => setSelectedPeriod('thisYear')}>
                  {t.thisYear}
                </a>
              </li>
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-primary btn-sm hover:bg-primary-focus gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>{t.report}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow"
            >
              <li className="menu-title">
                <span>{t.exportReport}</span>
              </li>
              <li>
                <a href="#export-pdf">
                  <Download className="h-4 w-4" />
                  {t.exportPDF}
                </a>
              </li>
              <li>
                <a href="#export-excel">
                  <Download className="h-4 w-4" />
                  {t.exportExcel}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="responsive-grid gap-4 md:gap-6">
        {kpisData[selectedAgent as number]?.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div key={index} className="card bg-base-100">
              <div className="card-body p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`bg-opacity-10 rounded-xl p-2 md:p-3`}>
                    <Icon className={`h-6 w-6 md:h-8 md:w-8 ${kpi.color}`} />
                  </div>
                  <div
                    className={`flex items-center text-xs md:text-sm ${kpi.trending === 'up' ? 'text-primary' : 'text-accent'}`}
                  >
                    {kpi.trending === 'up' ? (
                      <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                    ) : (
                      <ArrowDown className="h-3 w-3 md:h-4 md:w-4" />
                    )}
                    <span className="ml-1">{kpi.change}</span>
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <h3 className="mobile-text-xl text-base-content font-bold md:text-2xl">
                    {kpi.value}
                  </h3>
                  <p className="text-neutral mobile-text">{kpi.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Conversas por Mês */}
        <div className="card bg-base-100">
          <div className="card-body p-4 md:p-6">
            <h3 className="card-title mobile-text-lg md:text-xl">{t.conversationsPerMonth}</h3>
            <div className="responsive-chart mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={conversationsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
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
                      fontSize: '14px',
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
            <div className="mt-6 flex justify-center space-x-8">
              <div className="flex items-center">
                <div className="bg-primary mr-3 h-4 w-4 rounded-full shadow-sm"></div>
                <span className="text-base-content text-sm font-medium">
                  {t.totalConversations}
                </span>
              </div>
              <div className="flex items-center">
                <div className="bg-accent mr-3 h-4 w-4 rounded-full shadow-sm"></div>
                <span className="text-base-content text-sm font-medium">
                  {t.qualifiedLeadsChart}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Funil de Conversão */}
        <div className="card bg-base-100">
          <div className="card-body">
            <h3 className="card-title mb-4">{t.conversionFunnel}</h3>
            <div className="min-h-[500px] py-4">
              <div className="flex flex-col items-center justify-start space-y-4 px-6">
                {funnelData[selectedAgent]?.map((entry, index) => {
                  const percentage = funnelData[selectedAgent]?.[0]?.value
                    ? (entry.value / funnelData[selectedAgent]?.[0]?.value) * 100
                    : 0
                  const width = Math.max(percentage, 25) // Largura mínima de 25%
                  const conversionRate =
                    index > 0 && funnelData[selectedAgent]?.[index - 1]?.value
                      ? (
                          (entry.value / funnelData[selectedAgent]?.[index - 1]?.value) *
                          100
                        ).toFixed(1)
                      : 0

                  return (
                    <div key={entry.nameEn} className="group flex w-full flex-col items-center">
                      <div
                        className="relative flex h-14 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-md transition-all duration-500 hover:scale-105 hover:shadow-xl"
                        style={{
                          width: `${width}%`,
                          background: `linear-gradient(135deg, ${entry.fill} 0%, ${entry.fill}dd 50%, ${entry.fill}aa 100%)`,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: `0 4px 20px ${entry.fill}22`,
                          animationDelay: `${index * 0.1}s`,
                          animation: 'slideInFunnel 0.6s ease-out forwards',
                        }}
                      >
                        <span className="z-10 drop-shadow-md">
                          {language.language === 'pt' ? entry.namePt : entry.nameEn}
                        </span>
                        <div className="bg-opacity-10 absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      </div>

                      <div className="text-base-content mt-2 flex w-full max-w-xs items-center justify-between text-xs">
                        <span className="font-medium">
                          {entry.value.toLocaleString()} {t.users}
                        </span>
                        {index > 0 && (
                          <span className="text-accent font-medium">
                            {conversionRate}% {t.conversion}
                          </span>
                        )}
                      </div>

                      {index < funnelData[selectedAgent]?.length - 1 && (
                        <div className="border-t-base-300 mt-1 h-0 w-0 border-t-6 border-r-4 border-l-4 border-r-transparent border-l-transparent opacity-50"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid h-full gap-6 lg:grid-cols-2">
        {/* Performance dos Agentes */}
        <div className="card bg-base-100">
          <div className="card-body p-4 md:p-6">
            <h3 className="card-title mobile-text-lg mb-4 md:text-xl">{t.agentPerformance}</h3>
            <div className="responsive-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agentsPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
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
                      fontSize: '14px',
                      color: '#374151',
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, _) => [value, t.attendances]}
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
            <div className="mb-4 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
              <div className="flex items-center space-x-2">
                <h3 className="card-title mobile-text-lg md:text-xl">{t.whatsappActivity}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="select select-bordered select-xs bg-base-200"
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                >
                  <option value="all">{t.all}</option>
                  <option value="messages">{t.messages}</option>
                  <option value="leads">{t.leadsActivity}</option>
                  <option value="sales">{t.sales}</option>
                </select>
                <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/conversations`)}>
                  <MessageSquare className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto">
              {filteredActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={`${activity.id}_${activity.time.getTime()}`}
                    className={`activity-item group relative cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${
                      activity.status === 'pending'
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-base-300 hover:border-primary/30'
                    }`}
                  >
                    {/* Indicador de prioridade */}
                    <div
                      className={`absolute top-3 right-3 h-2 w-2 rounded-full ${
                        activity.priority === 'high'
                          ? 'bg-error'
                          : activity.priority === 'medium'
                            ? 'bg-warning'
                            : 'bg-success'
                      }`}
                    ></div>

                    <div className="flex items-start space-x-2 md:space-x-3">
                      <div
                        className={`mobile-avatar ${activity.color} flex items-center justify-center rounded-full shadow-sm transition-shadow group-hover:shadow-md`}
                      >
                        <Icon className={`mobile-icon ${activity.iconColor}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h4 className="text-base-content truncate text-sm font-semibold">
                            {activity.title}
                          </h4>
                          {activity.status === 'pending' && (
                            <span className="badge badge-warning badge-xs">{t.pending}</span>
                          )}
                        </div>

                        <p className="text-neutral mb-2 text-xs leading-relaxed">
                          {activity.description}
                        </p>

                        <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
                          <div className="flex flex-wrap items-center space-x-2 text-xs md:space-x-3">
                            <span className="text-primary font-medium">{activity.agent}</span>
                            {activity.phone !== 'N/A' && (
                              <span className="text-success hidden font-mono sm:inline">
                                {activity.phone}
                              </span>
                            )}
                            <span className="text-neutral flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDistanceToNow(activity.time, {
                                addSuffix: true,
                                locale: language.language === 'pt' ? ptBR : enUS,
                              })}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              className="btn btn-ghost btn-xs"
                              title={t.respond}
                              onClick={() =>
                                navigate(
                                  `/conversations?conversationId=${activity.id.split('_')[0]}`,
                                )
                              }
                            >
                              <MessageSquare className="h-3 w-3" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              title={t.viewConversation}
                              onClick={() =>
                                navigate(
                                  `/conversations?conversationId=${activity.id.split('_')[0]}`,
                                )
                              }
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-base-300 mt-4 border-t pt-4">
              <div className="text-neutral flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <span>
                    {t.showing} {filteredActivities.length} {t.of} {recentActivities.length}{' '}
                    {t.activities}
                  </span>
                  {selectedAgent !== -1 && (
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 bg-${agents.find((agent) => agent.id === selectedAgent)?.active ? 'success' : 'warning'} rounded-full`}
                      ></div>
                      <span>
                        {agents.find((agent) => agent.id === selectedAgent)?.active
                          ? t.online
                          : t.offline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

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
`

// Adicionar estilos ao head se não existirem
if (!document.getElementById('dashboard-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'dashboard-styles'
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
