import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { WelcomeOverlay } from './WelcomeOverlay';
import logoYellow from '@/assets/logo-yellow.png';
type AuthTab = 'login' | 'register';
interface WelcomeData {
  nome: string;
  sexo: 'masculino' | 'feminino' | 'outro';
}
export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const handleLoginSuccess = (userData: WelcomeData) => {
    setWelcomeData(userData);
  };
  // Force light theme for login screen
  return <div className="light">
      {welcomeData && <WelcomeOverlay nome={welcomeData.nome} sexo={welcomeData.sexo} />}
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Column - Yellow Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-easyeat-primary to-easyeat-secondary flex flex-col items-center justify-center p-8 lg:p-16">
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <img alt="Easy Eat Logo" className="w-32 h-32 lg:w-64 lg:h-64 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300" src="/lovable-uploads/c4acf755-fbe4-431a-8daa-a2c909426bb0.png" />
            <h1 className="text-3xl lg:text-5xl font-bold text-easyeat-dark tracking-tight">
              EASY EAT
            </h1>
            <p className="text-easyeat-dark/80 text-center text-sm lg:text-base max-w-xs">
              Seu plano alimentar personalizado
            </p>
          </div>
        </div>

        {/* Right Column - Auth Forms */}
        <div className="lg:w-1/2 bg-easyeat-light flex flex-col items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-md space-y-6 animate-fade-in">
            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm">
              <button onClick={() => setActiveTab('login')} className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'login' ? 'bg-easyeat-primary text-easyeat-dark shadow-md' : 'text-gray-500 hover:text-easyeat-dark'}`}>
                LOGIN
              </button>
              <button onClick={() => setActiveTab('register')} className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'register' ? 'bg-easyeat-primary text-easyeat-dark shadow-md' : 'text-gray-500 hover:text-easyeat-dark'}`}>
                REGISTRO
              </button>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeTab === 'login' ? 'Bem-vindo ao EASY EAT!' : 'Crie sua conta'}
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                {activeTab === 'login' ? 'Acesse seu plano alimentar personalizado' : 'Preencha os dados para começar'}
              </p>

              {activeTab === 'login' ? <LoginForm onForgotPassword={() => setShowForgotPassword(true)} onSuccess={handleLoginSuccess} /> : <RegisterForm onSuccess={() => setActiveTab('login')} />}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <img src={logoYellow} alt="Easy Eat" className="w-8 h-8 rounded" />
              <span>© 2026 EASY EAT. Seu Plano Alimentar Personalizado.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal open={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>;
}