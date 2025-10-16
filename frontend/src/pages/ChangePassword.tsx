import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Hexagon, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { supabase } from '@/config/supabaseClient';

const ChangePassword: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);

  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validação básica
      if (!password.trim()) {
        setError('Por favor, digite sua nova senha');
        return;
      }

      if (password !== confirmationPassword) {
        setError('As senhas não coincidem');
        return;
      }

      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError('Erro ao atualizar a senha. Tente novamente.');
        return;
      }
      
      navigate('/login');
      
    } catch (err) {
      setError('Erro ao atualizar a senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Hexagon className="w-12 h-12 text-primary-content drop-shadow-sm" />
            </div>
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Atualização de Senha
            </h2>
            <p className="text-lg text-neutral">
              Informe a nova senha que deseja utilizar na plataforma.
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
                    Atualização de Senha
                  </h2>
                  <p className="text-neutral">
                    Digite sua nova senha para <strong>atualizá-la</strong>.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text label-medium-custom flex items-center">
                        <Key className="w-4 h-4 mr-2" />
                        Senha
                      </span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text label-medium-custom flex items-center">
                        <Key className="w-4 h-4 mr-2" />
                        Senha
                      </span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      placeholder="Digite a confirmação de senha"
                      value={confirmationPassword}
                      onChange={(e) => {
                        setConfirmationPassword(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary w-full btn-apple ${
                      isLoading ? 'loading' : ''
                    }`}
                    disabled={isLoading || !password.trim() || !confirmationPassword.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Alterando senha...
                      </>
                    ) : (
                      'Alterar Senha'
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

export default ChangePassword;
