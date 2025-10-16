import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Shield, BarChart3, Hexagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const Landing: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  
  console.log('Rendering Landing Page');

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-lg flex items-center justify-center shadow-lg">
              <Hexagon className="w-5 h-5 text-primary-content drop-shadow-sm" />
            </div>
            <span className="font-bold text-xl">ConvergIA</span>
          </div>
        </div>
        <div className="navbar-end">
          <div className="flex items-center space-x-2">
            <Link to="/login" className="btn btn-ghost btn-apple">
              Entrar
            </Link>
            <Link to="/register" className="btn btn-primary btn-apple">
              Criar Conta
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero py-12 md:py-20">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Hexagon className="w-8 h-8 md:w-10 md:h-10 text-primary-content drop-shadow-sm" />
              </div>
            </div>
            <h1 className="mobile-text-xl md:text-5xl font-bold mb-6 text-base-content">
              {t.createAIAgents}
              <br />
              {t.intelligent}
            </h1>
            <p className="mobile-text md:text-xl text-neutral mb-8 max-w-2xl mx-auto">
              {t.transformService}
              <br />
              {t.automateConversations}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg btn-apple">
                {t.startNow}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg btn-apple">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="mobile-text-lg md:text-3xl font-bold mb-4">{t.powerfulFeatures}</h2>
            <p className="text-neutral mobile-text md:text-lg">{t.everythingYouNeed}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="card bg-base-100 card-hover">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title justify-center">{t.quickCreation}</h3>
                <p className="text-neutral">
                  {t.quickCreationDesc}
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-hover">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title justify-center">{t.secureReliable}</h3>
                <p className="text-neutral">
                  {t.secureReliableDesc}
                </p>
              </div>
            </div>

            <div className="card bg-base-100 card-hover">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title justify-center">{t.advancedAnalytics}</h3>
                <p className="text-neutral">
                  {t.advancedAnalyticsDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-content">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar seu Atendimento?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de empresas que já automatizaram seus processos
          </p>
          <Link to="/register" className="btn btn-accent btn-lg btn-apple">
            Criar Primeiro Agente
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-lg flex items-center justify-center shadow-lg">
              <Hexagon className="w-5 h-5 text-primary-content drop-shadow-sm" />
            </div>
            <span className="font-bold text-xl">ConvergIA</span>
          </div>
          <p>© 2024 ConvergIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 