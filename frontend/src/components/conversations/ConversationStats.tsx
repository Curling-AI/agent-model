import React from 'react'
import { Clock, MessageSquare, CheckCircle, AlertCircle, Activity } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from '../../translations'
import { Conversation } from '@/types/conversation'

const ConversationStats: React.FC<{ conversations: Conversation[] }> = ({
  conversations,
}: {
  conversations: Conversation[]
}) => {
  const { language } = useLanguage()
  const t = useTranslation(language)
  // Calcular estatísticas
  const stats = {
    total: conversations.length,
    active: conversations.filter((c) => c.lead.status in [1, 2, 3, 4]).length,
    waiting: conversations.filter((c) => c.lead.status === 2).length,
    closed: conversations.filter((c) => c.lead.status === 4).length,
    qualified: conversations.filter((c) => c.lead.status === 2).length,
    high: conversations.filter((c) => c.lead.priority === 'high').length,
  }

  const statCards = [
    {
      title: t.totalConversations,
      value: stats.total,
      icon: MessageSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t.activeConversations,
      value: stats.active,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: t.waitingResponse,
      value: stats.waiting,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: t.qualifiedConversations,
      value: stats.qualified,
      icon: CheckCircle,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-base-100 border-base-300 rounded-lg border p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral text-sm font-medium">{stat.title}</p>
                <p className="text-base-content text-2xl font-bold">{stat.value}</p>
                <div className="mt-1 flex items-center"></div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ConversationStats
