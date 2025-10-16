import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building, 
  MapPin, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Hexagon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../translations';
import { useUserStore } from '@/store/user';
import { useOrganizationStore } from '@/store/organization';
import { User as UserObject } from '@/types/user';

const Register: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { organization, setOrganization, upsertOrganization} = useOrganizationStore();
  const { upsertUser } = useUserStore();

  const [user, setUser] = useState<UserObject>({
    id: 0,
    fullname: '',
    name: '',
    surname: '',
    jobId: 1,
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    departmentId: 1,
    organizationId: 0,
    authId: '',
  });

  const segmentOptions = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'E-commerce',
    'Finanças',
    'Consultoria',
    'Varejo',
    'Indústria',
    'Serviços',
    'Outros'
  ];

  const validateUser = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user.fullname.trim()) {
      newErrors.fullname = 'Nome completo é obrigatório';
    }

    if (!user.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!user.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!user.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (user.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (user.password !== user.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrganization = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep == 2) {
      if (!organization.companyName.trim()) {
        newErrors.companyName = 'Nome da empresa é obrigatório';
      }

      if (!organization.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório';
      }

      if (!organization.cep.trim()) {
        newErrors.cep = 'CEP é obrigatório';
      }

      if (!organization.address.trim()) {
        newErrors.address = 'Endereço é obrigatório';
      }

      if (!organization.number.trim()) {
        newErrors.number = 'Número é obrigatório';
      }

      if (!organization.city.trim()) {
        newErrors.city = 'Cidade é obrigatória';
      }

      if (!organization.state.trim()) {
        newErrors.state = 'Estado é obrigatório';
      }
    } else if (currentStep == 3) {
      if (!organization.segment) {
        newErrors.segment = 'Segmento é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrganization({
      ...organization,
      [name]: value
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setOrganization({
      ...organization,
      cep: cep
    });

    // Buscar CEP quando tiver 8 dígitos
    if (cep.length > 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setOrganization({
            ...organization,
            address: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateUser()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateOrganization()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOrganization()) {
      return;
    }

    try {
      upsertOrganization(organization).then(async (data) => {
        setIsLoading(true);
        setErrors({});
        user.organizationId = data?.id || 0;
        const nameParts = user.fullname.trim().split(' ');
        user.name = nameParts[0];
        user.surname = nameParts.slice(1).join(' ');
        await upsertUser(user);
      });
      
      setSuccess(true);
    } catch (error) {
      setErrors({ submit: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-6">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center p-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-content" />
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-2">
              Cadastro realizado com sucesso!
            </h2>
            <p className="text-neutral mb-6">
              Sua conta foi criada com sucesso. Você já pode fazer login na plataforma.
            </p>
            <Link to="/login" className="btn btn-primary w-full btn-apple">
              Fazer Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
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
              Junte-se à ConvergIA!
            </h2>
            <p className="text-lg text-neutral">
              Crie sua conta e comece a revolucionar o atendimento da sua empresa com agentes inteligentes.
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

            {/* Indicador de progresso */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
                }`}>
                  2
                </div>
                <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content'
                }`}>
                  3
                </div>
              </div>
              <p className="text-center text-sm text-neutral mt-2">
                Etapa {currentStep} de 3
              </p>
            </div>

            {/* Formulário */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-base-content mb-2">
                    {currentStep === 1 ? 'Dados Pessoais' : 
                     currentStep === 2 ? 'Dados da Empresa' : 
                     'Detalhes da Empresa'}
                  </h2>
                  <p className="text-neutral">
                    {currentStep === 1 
                      ? 'Preencha suas informações pessoais' 
                      : currentStep === 2
                      ? 'Complete os dados da sua empresa'
                      : 'Finalize as informações da sua empresa'
                    }
                  </p>
                </div>

                {errors.submit && (
                  <div className="alert alert-error mb-4">
                    <span>{errors.submit}</span>
                  </div>
                )}

                <form onSubmit={currentStep < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
                  {currentStep === 1 ? (
                    // Etapa 1 - Dados Pessoais
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Nome Completo *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          className={`input input-bordered w-full ${errors.fullname ? 'input-error' : ''}`}
                          placeholder="Seu nome completo"
                          value={user.fullname}
                          onChange={handleUserChange}
                          disabled={isLoading}
                        />
                        {errors.fullname && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.fullname}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            E-mail Corporativo *
                          </span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                          placeholder="seu@empresa.com"
                          value={user.email}
                          onChange={handleUserChange}
                          disabled={isLoading}
                        />
                        {errors.email && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.email}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            Telefone / WhatsApp *
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                          placeholder="(11) 99999-9999"
                          value={user.phone}
                          onChange={handleUserChange}
                          disabled={isLoading}
                        />
                        {errors.phone && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.phone}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Senha *
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
                            placeholder="Mínimo 6 caracteres"
                            value={user.password}
                            onChange={handleUserChange}
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
                        {errors.password && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.password}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Confirmação de Senha *
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className={`input input-bordered w-full pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                            placeholder="Confirme sua senha"
                            value={user.confirmPassword}
                            onChange={handleUserChange}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral hover:text-base-content transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                          </label>
                        )}
                      </div>
                    </div>
                  ) : currentStep === 2 ? (
                    // Etapa 2 - Dados da Empresa
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Building className="w-4 h-4 mr-2" />
                            Nome da Empresa *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          className={`input input-bordered w-full ${errors.companyName ? 'input-error' : ''}`}
                          placeholder="Nome da sua empresa"
                          value={organization.companyName}
                          onChange={handleOrganizationChange}
                          disabled={isLoading}
                        />
                        {errors.companyName && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.companyName}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom">CNPJ *</span>
                        </label>
                        <input
                          type="text"
                          name="cnpj"
                          className={`input input-bordered w-full ${errors.cnpj ? 'input-error' : ''}`}
                          placeholder="00.000.000/0000-00"
                          value={organization.cnpj}
                          onChange={handleOrganizationChange}
                          disabled={isLoading}
                        />
                        {errors.cnpj && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.cnpj}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            CEP *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="cep"
                          className={`input input-bordered w-full ${errors.cep ? 'input-error' : ''}`}
                          placeholder="00000-000"
                          value={organization.cep}
                          onChange={handleCepChange}
                          disabled={isLoading}
                        />
                        {errors.cep && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.cep}</span>
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text label-medium-custom">Endereço *</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
                            placeholder="Rua, Avenida..."
                            value={organization.address}
                            onChange={handleOrganizationChange}
                            disabled={isLoading}
                          />
                          {errors.address && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.address}</span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text label-medium-custom">Número *</span>
                          </label>
                          <input
                            type="text"
                            name="number"
                            className={`input input-bordered w-full ${errors.number ? 'input-error' : ''}`}
                            placeholder="123"
                            value={organization.number}
                            onChange={handleOrganizationChange}
                            disabled={isLoading}
                          />
                          {errors.number && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.number}</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text label-medium-custom">Cidade *</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
                            placeholder="São Paulo"
                            value={organization.city}
                            onChange={handleOrganizationChange}
                            disabled={isLoading}
                          />
                          {errors.city && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.city}</span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text label-medium-custom">Estado *</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            className={`input input-bordered w-full ${errors.state ? 'input-error' : ''}`}
                            placeholder="SP"
                            value={organization.state}
                            onChange={handleOrganizationChange}
                            disabled={isLoading}
                          />
                          {errors.state && (
                            <label className="label">
                              <span className="label-text-alt text-error">{errors.state}</span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Etapa 3 - Detalhes da Empresa
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Site da Empresa
                          </span>
                        </label>
                        <input
                          type="url"
                          name="website"
                          className="input input-bordered w-full"
                          placeholder="https://www.empresa.com"
                          value={organization.website}
                          onChange={handleOrganizationChange}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom">Segmento de Atuação *</span>
                        </label>
                        <select
                          name="segment"
                          className={`select select-bordered w-full ${errors.segment ? 'select-error' : ''}`}
                          value={organization.segment}
                          onChange={handleOrganizationChange}
                          disabled={isLoading}
                        >
                          <option value="">Selecione um segmento</option>
                          {segmentOptions.map(segment => (
                            <option key={segment} value={segment}>{segment}</option>
                          ))}
                        </select>
                        {errors.segment && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.segment}</span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text label-medium-custom">Idioma Principal</span>
                        </label>
                        <div className="flex space-x-4">
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="language"
                              value="pt"
                              className="radio radio-primary"
                              checked={organization.language === 'pt'}
                              onChange={handleOrganizationChange}
                              disabled={isLoading}
                            />
                            <span className="label-text ml-2">Português</span>
                          </label>
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="language"
                              value="en"
                              className="radio radio-primary"
                              checked={organization.language === 'en'}
                              onChange={handleOrganizationChange}
                              disabled={isLoading}
                            />
                            <span className="label-text ml-2">English</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex space-x-4 mt-8">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={handlePreviousStep}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      className={`btn btn-primary flex-1 btn-apple ${
                        isLoading ? 'loading' : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          {currentStep === 1 ? 'Validando...' : 
                           currentStep === 2 ? 'Validando...' : 
                           'Criando conta...'}
                        </>
                      ) : (
                        <>
                          {currentStep === 1 ? 'Próxima Etapa' : 
                           currentStep === 2 ? 'Próxima Etapa' : 
                           'Cadastrar'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Link para login */}
                <div className="text-center mt-6 pt-6 border-t border-base-300">
                  <p className="text-neutral">
                    Já tem uma conta?{' '}
                    <Link 
                      to="/login" 
                      className="link link-primary hover:link-hover font-medium"
                    >
                      Fazer login
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

export default Register;
