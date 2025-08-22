import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  Zap,
  Star,
  Crown,
  Plus,
  Download,
  Calendar,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const Plans: React.FC = () => {
  const language  = useLanguage();
  const t = useTranslation(language);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Dados do usuário atual
  const currentUser = {
    plan: 'pro',
    credits: 5000,
    creditsUsed: 3200,
    billingDate: '15/12/2024',
    status: 'active'
  };

  // Dados de uso mockados
  const usageData = {
    messages: {
      used: 3200,
      limit: 5000,
      percentage: 64
    },
    leads: {
      used: 78,
      limit: 100,
      percentage: 78
    },
    agents: {
      used: 3,
      limit: 5,
      percentage: 60
    },
    conversations: {
      used: 156,
      limit: 200,
      percentage: 78
    }
  };

  // Planos disponíveis
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      color: 'text-accent',
      price: { monthly: 49, yearly: 490 },
      credits: 1000,
      features: [
        '1 Agente de IA',
        '1.000 mensagens/mês',
        '2 canais de integração',
        'Dashboard básico',
        'Suporte por email'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      icon: Star,
      color: 'text-primary',
      price: { monthly: 149, yearly: 1490 },
      credits: 5000,
      features: [
        '5 Agentes de IA',
        '5.000 mensagens/mês',
        'Todos os canais',
        'Dashboard avançado',
        'CRM integrado',
        'Follow-ups automáticos',
        'Suporte prioritário'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      color: 'text-primary',
      price: { monthly: 499, yearly: 4990 },
      credits: 20000,
      features: [
        'Agentes ilimitados',
        '20.000 mensagens/mês',
        'Todos os canais',
        'Analytics avançado',
        'API personalizada',
        'White-label',
        'Suporte dedicado',
        'Treinamento customizado'
      ],
      popular: false
    }
  ];

  // Opções de créditos avulsos
  const creditOptions = [
    { credits: 1000, price: 29, bonus: 0 },
    { credits: 2500, price: 69, bonus: 100 },
    { credits: 5000, price: 129, bonus: 250 },
    { credits: 10000, price: 249, bonus: 750 }
  ];

  // Histórico de pagamentos
  const paymentHistory = [
    {
      id: 1,
      date: '15/11/2024',
      description: t.professionalPlanMonthly,
      amount: 149,
      status: 'paid',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      date: '05/11/2024',
      description: t.individualCredits2500,
      amount: 69,
      status: 'paid',
      invoice: 'INV-2024-002'
    },
    {
      id: 3,
      date: '15/10/2024',
      description: t.professionalPlanMonthly,
      amount: 149,
      status: 'paid',
      invoice: 'INV-2024-003'
    },
    {
      id: 4,
      date: '15/09/2024',
      description: t.professionalPlanMonthly,
      amount: 149,
      status: 'paid',
      invoice: 'INV-2024-004'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language.language === 'pt' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === currentUser.plan);
  };

  const getCreditsPercentage = () => {
    return ((currentUser.credits - currentUser.creditsUsed) / currentUser.credits) * 100;
  };

  // Função para obter as features traduzidas de cada plano
  const getPlanFeatures = (planId: string) => {
    switch (planId) {
      case 'starter':
        return [
          `1 ${t.agentIA}`,
          `1.000 ${t.messagesPerMonth}`,
          `2 ${t.integrationChannels}`,
          t.basicDashboard,
          t.emailSupport
        ];
      case 'pro':
        return [
          `5 ${t.agentsIA}`,
          `5.000 ${t.messagesPerMonth}`,
          t.allChannels,
          t.advancedDashboard,
          t.integratedCRM,
          t.automaticFollowUps,
          t.prioritySupport
        ];
      case 'enterprise':
        return [
          t.unlimitedAgents,
          `20.000 ${t.messagesPerMonth}`,
          t.allChannels,
          t.advancedAnalytics,
          t.customAPI,
          t.whiteLabel,
          t.dedicatedSupport,
          t.customTraining
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-base-content">{t.plansAndBilling}</h1>
        <p className="text-neutral mt-1">{t.managePlanCredits}</p>
      </div>

      {/* Current Plan Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Status */}
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.currentPlan}</h3>
              <div className="badge badge-primary">{t.active}</div>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-xl">{getCurrentPlan()?.name}</h4>
                <p className="text-neutral text-sm">{t.autoRenewal}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.nextBilling}</span>
                <span className="font-medium">{currentUser.billingDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.value}</span>
                <span className="font-medium">{formatPrice(getCurrentPlan()?.price.monthly || 0)}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-sm mt-4 w-full">
              {t.manageBilling}
            </button>
          </div>
        </div>

        {/* Credits Status */}
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.credits}</h3>
              <button className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4 mr-1" />
                {t.buy}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t.available}</span>
                  <span className="font-medium">{currentUser.credits - currentUser.creditsUsed} de {currentUser.credits}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getCreditsPercentage()}%` }}
                  ></div>
                </div>
              </div>
              <div className="stats stats-vertical w-full">
                <div className="stat p-3">
                  <div className="stat-title text-xs">{t.usedThisMonth}</div>
                  <div className="stat-value text-lg">{currentUser.creditsUsed.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="card bg-base-100">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">{t.monthlyUsage}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t.sentMessages}</span>
                  <span className="font-medium">{usageData.messages.used.toLocaleString()} de {usageData.messages.limit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${usageData.messages.percentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t.qualifiedLeads}</span>
                  <span className="font-medium">{usageData.leads.used} de {usageData.leads.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${usageData.leads.percentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t.activeAgents}</span>
                  <span className="font-medium">{usageData.agents.used} de {usageData.agents.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${usageData.agents.percentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t.activeConversations}</span>
                  <span className="font-medium">{usageData.conversations.used} de {usageData.conversations.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${usageData.conversations.percentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-2xl font-bold">{t.changePlan}</h3>
            <div className="join w-full sm:w-auto">
              <button 
                className={`btn join-item flex-1 sm:flex-none ${billingPeriod === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                {t.monthly}
              </button>
              <button 
                className={`btn join-item flex-1 sm:flex-none ${billingPeriod === 'yearly' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setBillingPeriod('yearly')}
              >
                {t.yearly} <span className="badge badge-success badge-sm ml-2">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === currentUser.plan;
              const price = plan.price[billingPeriod];
              
              return (
                <div key={plan.id} className={`card border-2 ${isCurrentPlan ? 'border-primary bg-primary/5' : plan.popular ? 'border-accent' : 'border-base-300'} ${plan.popular ? 'transform scale-105' : ''}`}>
                  <div className="card-body">
                    {plan.popular && (
                      <div className="badge badge-accent absolute -top-3 left-1/2 transform -translate-x-1/2">
                        {t.mostPopular}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-opacity-10 rounded-xl flex items-center justify-center ${plan.color.replace('text-', 'bg-')}`}>
                        <Icon className={`w-6 h-6 ${plan.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl">{plan.name}</h4>
                        {isCurrentPlan && <span className="badge badge-primary badge-sm">{t.current}</span>}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-3xl font-bold">
                        {formatPrice(price)}
                        <span className="text-base font-normal text-neutral">
                          {billingPeriod === 'monthly' ? t.perMonth : t.perYearPlan}
                        </span>
                      </div>
                                             {billingPeriod === 'yearly' && (
                         <div className="text-sm text-primary">
                           {t.savings} {formatPrice(plan.price.monthly * 12 - plan.price.yearly)} {t.perYear}
                         </div>
                       )}
                    </div>

                                           <div className="space-y-3 mb-6">
                         {getPlanFeatures(plan.id).map((feature, index) => (
                           <div key={index} className="flex items-center space-x-2">
                             <Check className="w-4 h-4 text-primary" />
                             <span className="text-sm">{feature}</span>
                           </div>
                         ))}
                       </div>

                    <button 
                      className={`btn w-full ${isCurrentPlan ? 'btn-outline' : plan.popular ? 'btn-primary' : 'btn-outline'}`}
                      disabled={isCurrentPlan}
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      {isCurrentPlan ? t.currentPlan : plan.id === 'enterprise' ? t.talkToSales : t.makeUpgrade}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{t.individualCredits}</h3>
              <p className="text-neutral text-sm mt-1">{t.buyExtraCredits}</p>
            </div>
            <div className="badge badge-info badge-lg hidden md:flex">
              <Zap className="w-4 h-4 mr-1" />
              {t.noAutoRenewal}
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {creditOptions.map((option, index) => {
  
              
              return (
                <div key={index} className="card border-2 border-base-300 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col">
                  <div className="card-body p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {option.credits.toLocaleString()}
                      </div>
                      <div className="text-sm text-neutral">{t.creditsLabel}</div>
                    </div>

                    {/* Bonus Badge */}
                    {option.bonus > 0 && (
                      <div className="text-center mb-4">
                        <div className="badge badge-success badge-lg">
                          +{option.bonus} {t.bonus}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-base-content">
                        {formatPrice(option.price)}
                      </div>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-grow"></div>

                    {/* Action Button */}
                    <button className="btn btn-primary w-full">
                      {t.buyNow}
                    </button>

                    {/* Popular Badge */}
                    {index === 1 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="badge badge-accent badge-sm">
                          {t.bestSeller}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <div className="flex items-center justify-center space-x-6 text-sm text-neutral">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>{t.creditsDontExpire}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>{t.immediateActivation}</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>{t.noAutoRenewalInfo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{t.paymentHistory}</h3>
            <button className="btn btn-outline btn-sm">
              <Download className="w-4 h-4 mr-2" />
              {t.export}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.description}</th>
                  <th>{t.value}</th>
                  <th>{t.status}</th>
                  <th>{t.invoice}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-neutral" />
                        <span>{payment.date}</span>
                      </div>
                    </td>
                    <td>{payment.description}</td>
                    <td className="font-semibold">{formatPrice(payment.amount)}</td>
                    <td>
                      <div className="badge bg-emerald-400 text-white border-emerald-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.paid}
                      </div>
                    </td>
                    <td>
                      <code className="text-xs">{payment.invoice}</code>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs">
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{t.confirmUpgrade}</h3>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <AlertCircle className="w-5 h-5" />
                <span>{t.currentPlanCancelled}</span>
              </div>
              
              <div className="bg-base-200 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>{t.newPlan}</span>
                  <span className="font-semibold">Enterprise</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>{t.monthlyValue}</span>
                  <span className="font-semibold">{formatPrice(499)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.firstBilling}</span>
                  <span className="font-semibold">{t.today}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn btn-outline flex-1"
                >
                  {t.cancel}
                </button>
                <button className="btn btn-primary flex-1">
                  {t.confirmUpgradeButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans; 