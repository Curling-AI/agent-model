import React from 'react';
import { 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../translations';

const ConversationStats: React.FC<{ conversations: any[] }> = ({ conversations }) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  // Calcular estatísticas
  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    waiting: conversations.filter(c => c.status === 'waiting').length,
    closed: conversations.filter(c => c.status === 'closed').length,
    qualified: conversations.filter(c => c.qualified).length,
    urgent: conversations.filter(c => c.priority === 'urgent').length,
    high: conversations.filter(c => c.priority === 'high').length,
    unread: conversations.reduce((sum, c) => sum + c.unread, 0),
    avgResponseTime: conversations.reduce((sum, c) => {
      const time = parseInt(c.responseTime.replace('min', ''));
      return sum + time;
    }, 0) / conversations.length || 0
  };

  const statCards = [
    {
      title: t.totalConversations,
      value: stats.total,
      icon: MessageSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t.activeConversations,
      value: stats.active,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: t.waitingResponse,
      value: stats.waiting,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: t.qualifiedConversations,
      value: stats.qualified,
      icon: CheckCircle,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: t.unreadMessages,
      value: stats.unread,
      icon: AlertCircle,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '-2',
      changeType: 'negative'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-base-100 rounded-lg p-4 border border-base-300 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-base-content">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-success' : 
                    stat.changeType === 'negative' ? 'text-error' : 'text-neutral'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-neutral ml-1">{t.vsYesterday}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationStats; 