import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Hexagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';

const Login: React.FC = () => {
  const { language } = useLanguage();
  // const t = useTranslation(language);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validação básica
      if (!formData.email || !formData.password) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      // Aqui você implementaria a lógica de autenticação
      // Por enquanto, apenas simular um delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular erro para demonstração
      if (formData.email === 'erro@teste.com') {
        setError('E-mail ou senha inválidos');
        return;
      }

      // Redirecionar para dashboard em caso de sucesso
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
              Bem-vindo de volta!
            </h2>
            <p className="text-lg text-neutral">
              Acesse sua conta e continue criando agentes inteligentes que revolucionam o atendimento.
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
                    Fazer Login
                  </h2>
                  <p className="text-neutral">
                    Entre com suas credenciais para acessar a plataforma
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
                      name="email"
                      className="input input-bordered w-full"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Senha */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text label-medium-custom flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Senha
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="input input-bordered w-full pr-12"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral hover:text-base-content transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Links secundários */}
                  <div className="flex justify-between items-center text-sm">
                    <Link 
                      to="/forgot-password" 
                      className="link link-primary hover:link-hover"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  {/* Botão de login */}
                  <button
                    type="submit"
                    className={`btn btn-primary w-full btn-apple ${
                      isLoading ? 'loading' : ''
                    }`}
                    disabled={isLoading || !formData.email || !formData.password}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                {/* Link para cadastro */}
                <div className="text-center mt-6 pt-6 border-t border-base-300">
                  <p className="text-neutral">
                    Não tem uma conta?{' '}
                    <Link 
                      to="/register" 
                      className="link link-primary hover:link-hover font-medium"
                    >
                      Criar conta
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
