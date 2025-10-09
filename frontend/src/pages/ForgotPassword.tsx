import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Hexagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const ForgotPassword: React.FC = () => {
  const { language } = useLanguage();
  // const t = useTranslation(language);
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validação básica
      if (!email.trim()) {
        setError('Por favor, digite seu e-mail');
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('E-mail inválido');
        return;
      }

      // Aqui você implementaria a lógica de recuperação de senha
      // Por enquanto, apenas simular um delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      
    } catch (err) {
      setError('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-6">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center p-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-content" />
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-2">
              E-mail enviado!
            </h2>
            <p className="text-neutral mb-6">
              Enviamos um link para redefinir sua senha para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e siga as instruções.
            </p>
            <div className="space-y-3">
              <Link to="/login" className="btn btn-primary w-full btn-apple">
                Voltar ao Login
              </Link>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="btn btn-ghost w-full"
              >
                Tentar outro e-mail
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="flex min-h-screen">
        {/* Lado esquerdo - Imagem (apenas desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Hexagon className="w-12 h-12 text-primary-content drop-shadow-sm" />
            </div>
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Esqueceu sua senha?
            </h2>
            <p className="text-lg text-neutral">
              Não se preocupe! Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Hexagon className="w-8 h-8 text-primary-content drop-shadow-sm" />
              </div>
              <h1 className="text-2xl font-bold text-base-content">ConvergIA</h1>
            </div>

            {/* Formulário */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-base-content mb-2">
                    Recuperar Senha
                  </h2>
                  <p className="text-neutral">
                    Digite seu e-mail para receber instruções de recuperação
                  </p>
                </div>

                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text label-medium-custom flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        E-mail
                      </span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered w-full"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Botão de envio */}
                  <button
                    type="submit"
                    className={`btn btn-primary w-full btn-apple ${
                      isLoading ? 'loading' : ''
                    }`}
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Link de Recuperação'
                    )}
                  </button>
                </form>

                {/* Link para voltar ao login */}
                <div className="text-center mt-6 pt-6 border-t border-base-300">
                  <Link 
                    to="/login" 
                    className="link link-primary hover:link-hover font-medium flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
