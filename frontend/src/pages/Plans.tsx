import { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Loader
  
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { usePlansStore } from '../store/plansStore';
import { useAuthStore } from '../store/auth';

type PlanForCheckout = { price_id: string; plan_id?: number; mode?: 'subscription' | 'payment' };

const Plans = () => {
  const language  = useLanguage();
  const t = useTranslation(language);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const creditsRef = useRef<HTMLDivElement>(null);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const {
    products,
    invoices,
    userPlan,
    userCredits,
    userUsage,
    isLoadingProducts,
    isLoadingInvoices,
    isLoadingUserData,
    isCreatingCheckout,
    error,
    fetchProducts,
    fetchInvoices,
    fetchUserPlan,
    fetchUserCredits,
    fetchUserUsage,
    createCheckoutSession,
    createBillingPortalSession,
    clearError
  } = usePlansStore();

  useEffect(() => {
    fetchProducts();
    fetchUserPlan();
    fetchUserCredits();
    fetchUserUsage();
    
    fetchInvoices(userPlan?.provider_data?.customer_id);
  }, [fetchProducts, fetchInvoices, fetchUserPlan, fetchUserCredits, fetchUserUsage, userPlan?.provider_data?.customer_id]);

  const handlePlanPurchase = async (plan: PlanForCheckout) => {
    try {
      const authState = useAuthStore.getState();
      const user = authState.user as any;
      const numericUserId = typeof user?.id === 'number' ? (user.id as number) : undefined;
      const email = user?.email as string | undefined;
      const checkoutData = {
        price_id: plan.price_id,
        mode: plan.mode || 'subscription',
        user_id: numericUserId,
        plan_id: plan.plan_id,
        customer_email: email,
        success_url: `${window.location.origin}/plans?success=true`,
        cancel_url: `${window.location.origin}/plans?canceled=true`
      };

      const sessionUrl = await createCheckoutSession(checkoutData);
      
      if (sessionUrl?.checkout_url) {
        window.location.href = sessionUrl.checkout_url;
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const authState = useAuthStore.getState();
      const user = authState.user as any;
      const numericUserId = typeof user?.id === 'number' ? (user.id as number) : undefined;
      
      const portalData = {
        user_id: numericUserId,
        customer_id: userPlan?.provider_data?.customer_id,
        return_url: `${window.location.origin}/plans`
      };

      await createBillingPortalSession(portalData);
    } catch (error) {
      console.error('Erro ao abrir portal de cobrança:', error);
    }
  };

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

  const scrollToCredits = () => {
    creditsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const plans = (products || [])
    .filter((p) => p.active && p.type === "subscription")
    .map((product, index) => {
      const iconMap = [Zap, Star, Crown];
      const colorMap = ['text-primary', 'text-primary', 'text-primary'];
      const planTypeMeta = (product.metadata?.plan_type as string | undefined)?.toLowerCase?.() || '';
      const nameLower = product.name?.toLowerCase?.() || '';
      const isProfessional = ['pro', 'professional', 'profissional'].includes(planTypeMeta) 
        || nameLower === 'professional' 
        || nameLower === 'profissional' 
        || nameLower.includes('professional') 
        || nameLower.includes('profissional');
      const defaultPriceObj = typeof product.default_price === 'object' ? product.default_price : undefined;
      const allPrices = Array.isArray((product as any).prices) ? (product as any).prices as any[] : [];
      const monthlyPrice = allPrices.find(p => p.recurring?.interval === 'month');
      const yearlyPrice = allPrices.find(p => p.recurring?.interval === 'year');
      const chosenPrice = (billingPeriod === 'month' ? (monthlyPrice || defaultPriceObj) : (yearlyPrice || defaultPriceObj)) || allPrices[0];
      const priceId = chosenPrice?.id || (typeof product.default_price === 'string' ? product.default_price : '');

      const apiFeatures = product.description 
        ? product.description.split('\n').filter(line => line.trim() !== '')
        : [];
      
      const fallbackFeatures = getPlanFeatures(product.metadata?.plan_type || product.name.toLowerCase());
      
      const finalFeatures = apiFeatures.length > 0 ? apiFeatures : fallbackFeatures;

  const isPopular = isProfessional;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        icon: iconMap[index] || Star,
        color: colorMap[index] || 'text-primary',
        price: chosenPrice,
        price_id: priceId,
        features: finalFeatures,
        popular: isPopular,
        plan_id: Number(product.metadata?.plan_id ?? index + 1),
      };
    })
    .sort((a, b) => {
      const toKey = (name: string): number => {
        const n = name?.toLowerCase?.() || '';
        if (n.includes('starter') || n.includes('inicial') || n.includes('basic')) return 0;
        if (n.includes('professional') || n.includes('profissional') || n === 'pro') return 1;
        return 2;
      };
      return toKey(a.name) - toKey(b.name);
    });

  const creditProducts = (products || [])
    .filter((p) => p.active && p.type === "transactional")
    .map((product) => {
      const defaultPriceObj = typeof product.default_price === 'object' ? product.default_price : undefined;
      const productPrices = (product as any).prices ?? [];
      const allPrices = Array.isArray(productPrices) ? productPrices : [];
      const chosenPrice = defaultPriceObj ?? (allPrices.length > 0 ? allPrices[0] : null);
      const unitAmount = chosenPrice && typeof chosenPrice.unit_amount === 'number' ? chosenPrice.unit_amount : 0;
      const priceAmount = unitAmount / 100;
      const priceId = chosenPrice && chosenPrice.id ? String(chosenPrice.id) : 
                     (typeof product.default_price === 'string' ? product.default_price : '');
      
      return {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        credits: parseInt(product.name) || 0,
        price: priceAmount,
        price_id: priceId,
        bonus: 0,
      };
    })
    .sort((a, b) => a.credits - b.credits);

  const creditOptions = creditProducts;

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat(language.language === 'pt' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency
    }).format(price);
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.plan_id === userPlan?.plan_id);
  };

  const getCreditsPercentage = () => {
    if (!userCredits || userCredits.total === 0) return 0;
    return (userCredits.available / userCredits.total) * 100;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(language.language === 'pt' ? 'pt-BR' : 'en-US');
  };

  const exportInvoicesToCSV = () => {
    if (!invoices || invoices.length === 0) {
      return;
    }

    const headers = ['Data', 'Descrição', 'Valor', 'Status', 'Fatura ID'];
    
    const csvData = invoices.map(invoice => [
      formatDate(invoice.created),
      invoice.description ?? 'Cobrança via Stripe',
      `"${formatPrice(invoice.amount_paid / 100)}"`,
      invoice.status === 'paid' ? 'Pago' : invoice.status === 'open' ? 'Pendente' : invoice.status,
      invoice.id
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-pagamentos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <div className="badge bg-emerald-400 text-white border-emerald-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t.paid}
          </div>
        );
      case 'open':
        return (
          <div className="badge badge-warning">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t.pending}
          </div>
        );
      default:
        return (
          <div className="badge badge-ghost">
            {status}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-base-content">{t.plansAndBilling}</h1>
            <p className="text-neutral mt-1">{t.managePlanCredits}</p>
          </div>
        </div>
        
        {/* Mostrar erros se houver */}
        {error && (
          <div className="alert alert-warning mb-4">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">Problema de Conexão</div>
              <div className="text-sm opacity-75">{error}</div>
            </div>
            <button onClick={clearError} className="btn btn-sm btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Current Plan Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Status */}
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.currentPlan}</h3>
              <div className={`badge ${userPlan?.status === 'active' ? 'badge-primary' : 'badge-ghost'}`}>
                {userPlan?.status === 'active' ? t.active : userPlan?.status || 'N/A'}
              </div>
            </div>
            {isLoadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
              </div>
            ) : getCurrentPlan() ? (
              <>
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
                    <span className="font-medium">
                      {userPlan?.provider_data?.current_period_end
                        ? new Date(userPlan.provider_data.current_period_end).toLocaleDateString(language.language === 'pt' ? 'pt-BR' : 'en-US')
                        : (userPlan?.updated_at ? new Date(userPlan.updated_at).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.value}</span>
                    <span className="font-medium">
                      {getCurrentPlan()?.price?.unit_amount
                        ? formatPrice((getCurrentPlan()!.price!.unit_amount as number) / 100, getCurrentPlan()?.price?.currency?.toUpperCase?.() || 'BRL')
                        : '—'}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-outline btn-sm mt-4 w-full"
                  onClick={() => void handleManageBilling()}
                >
                  {t.manageBilling}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Sem plano ativo</p>
                <p className="text-neutral mb-4">Selecione um plano para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Credits Status */}
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.credits}</h3>
              <button 
                className="btn btn-primary btn-sm"
                onClick={scrollToCredits}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t.buy}
              </button>
            </div>
            {isLoadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
              </div>
            ) : userCredits ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t.available}</span>
                    <span className="font-medium">{userCredits.available} de {userCredits.total}</span>
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
                    <div className="stat-value text-lg">{userCredits.used.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Dados não disponíveis</p>
                <p className="text-neutral mb-4">Não foi possível carregar informações de créditos</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="card bg-base-100">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">{t.monthlyUsage}</h3>
            {isLoadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
              </div>
            ) : userUsage ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.sentMessages}</span>
                    <span className="font-medium">{userUsage.messages.used.toLocaleString()} de {userUsage.messages.limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${userUsage.messages.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.qualifiedLeads}</span>
                    <span className="font-medium">{userUsage.leads.used} de {userUsage.leads.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${userUsage.leads.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.activeAgents}</span>
                    <span className="font-medium">{userUsage.agents.used} de {userUsage.agents.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${userUsage.agents.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.activeConversations}</span>
                    <span className="font-medium">{userUsage.conversations.used} de {userUsage.conversations.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${userUsage.conversations.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Dados não disponíveis</p>
                <p className="text-neutral mb-4">Não foi possível carregar estatísticas de uso</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-2xl font-bold">{t.changePlan}</h3>
            <div className="join">
              <button
                className={`btn btn-sm join-item ${billingPeriod === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setBillingPeriod('month')}
              >
                {language.language === 'pt' ? 'Mensal' : 'Monthly'}
              </button>
              <button
                className={`btn btn-sm join-item ${billingPeriod === 'year' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setBillingPeriod('year')}
                title={language.language === 'pt' ? 'Economize 17% no anual' : 'Save 17% yearly'}
              >
                {language.language === 'pt' ? 'Anual' : 'Annual'}
                <span className={`ml-2 text-xs font-semibold ${billingPeriod === 'year' ? 'text-white' : 'text-primary'}`}>-17%</span>
              </button>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Carregando planos...</p>
                <p className="text-sm text-neutral mt-2">Conectando com o servidor</p>
              </div>
            </div>
          ) : plans.length === 0 && !error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-warning mx-auto mb-6" />
                <p className="text-xl font-semibold mb-2">Sem planos disponíveis</p>
                <p className="text-neutral mb-6">Não foi possível carregar os planos do servidor</p>
                <div className="space-x-4">
                  <button 
                    onClick={() => fetchProducts()} 
                    className="btn btn-primary"
                  >
                    <Loader className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-outline"
                  >
                    Recarregar página
                  </button>
                </div>
              </div>
            </div>
          ) : plans.length === 0 && error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-6" />
                <p className="text-xl font-semibold mb-2">Erro ao carregar planos</p>
                <p className="text-neutral mb-6">Verifique sua conexão e tente novamente</p>
                <div className="space-x-4">
                  <button 
                    onClick={() => {
                      clearError();
                      fetchProducts();
                    }} 
                    className="btn btn-primary"
                  >
                    <Loader className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-outline"
                  >
                    Recarregar página
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map(plan => {
                const Icon = plan.icon;
                const isCurrentPlan = userPlan?.plan_id === plan.plan_id;
                const hasAccess = !userPlan || userPlan.plan_id >= plan.plan_id;
                const priceAmount = plan.price?.unit_amount ? plan.price.unit_amount / 100 : undefined;
                const priceCurrency = plan.price?.currency?.toUpperCase?.() || 'BRL';
                
                return (
                  <div key={plan.id} className={`card h-full border-2 ${isCurrentPlan ? 'border-primary bg-primary/5' : plan.popular ? 'border-accent' : 'border-base-300'} ${plan.popular ? 'transform scale-105' : ''}`}>
                    <div className="card-body flex flex-col h-full">
                      {plan.popular && (
                        <div className="badge badge-accent absolute -top-3 left-1/2 transform -translate-x-1/2">
                          {t.mostPopular}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${plan.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl">{plan.name}</h4>
                          {isCurrentPlan && <span className="badge badge-primary badge-sm">{t.current}</span>}
                        </div>
                      </div>

                      <div className="mb-6">
                        {priceAmount !== undefined ? (
                          <div className="text-3xl font-bold">
                            {formatPrice(priceAmount, priceCurrency)}
                            {plan.price?.recurring?.interval && (
                              <span className="text-base font-normal text-neutral">
                                /{plan.price.recurring.interval}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-neutral">
                            {language.language === 'pt' ? 'Entre em contato' : 'Contact us'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex justify-center">
                        <button 
                          className={`btn ${isCurrentPlan ? 'btn-outline' : 'btn-success'}`}
                          disabled={isCurrentPlan || isCreatingCheckout || !plan.price_id}
                          onClick={() => handlePlanPurchase({ price_id: plan.price_id, plan_id: plan.plan_id })}
                        >
                          {isCreatingCheckout ? (
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {isCurrentPlan 
                            ? t.currentPlan 
                            : hasAccess 
                              ? t.buyNow 
                              : t.makeUpgrade
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Credit Packages */}
      <div ref={creditsRef} className="card bg-base-100">
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
            {creditOptions.length === 0 ? (
              <div className="col-span-4 text-center py-8">
                <p className="text-neutral">{t.noCreditsAvailable || 'No credit packages available at the moment.'}</p>
              </div>
            ) : (
              creditOptions.map((option, index) => {
                return (
                  <div key={option.id ?? index} className="card border-2 border-base-300 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col">
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
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => {
                        if (option.price_id) {
                          void handlePlanPurchase({ price_id: option.price_id, mode: 'payment' });
                        }
                      }}
                      disabled={!option.price_id}
                    >
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
            }))}
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
            <button 
              className="btn btn-outline btn-sm"
              onClick={exportInvoicesToCSV}
              disabled={!invoices || invoices.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {t.export}
            </button>
          </div>
          
          {isLoadingInvoices ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Carregando histórico...</p>
                <p className="text-sm text-neutral mt-2">Buscando faturas do Stripe</p>
              </div>
            </div>
          ) : invoices && invoices.length > 0 ? (
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
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-neutral" />
                          <span>{formatDate(invoice.created)}</span>
                        </div>
                      </td>
                      <td>{invoice.description ?? 'Cobrança via Stripe'}</td>
                      <td className="font-semibold">{formatPrice(invoice.amount_paid / 100)}</td>
                      <td>{getInvoiceStatusBadge(invoice.status)}</td>
                      <td>
                        <code className="text-xs">{invoice.id}</code>
                      </td>
                      <td>
                        {invoice.invoice_pdf && (
                          <a 
                            href={invoice.invoice_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-info mx-auto mb-6" />
                <p className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</p>
                <p className="text-neutral mb-6">Você ainda não possui histórico de pagamentos</p>
                <p className="text-sm text-neutral">As faturas aparecerão aqui após suas primeiras compras</p>
              </div>
            </div>
          )}
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