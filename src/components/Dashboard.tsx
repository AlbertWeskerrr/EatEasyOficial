import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { MacroCards } from '@/components/MacroCards';
import { NutritionCharts } from '@/components/NutritionCharts';
import { NutritionPlanCard } from '@/components/NutritionPlanCard';
import { BiometricData, PreferencesData } from '@/components/BiometricData';
import { MealBuilder } from '@/components/MealBuilder';
import logoEasyEat from '@/assets/logo-easyeat.png';
import { LogOut, HelpCircle, Moon, Sun, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppFooter } from '@/components/layout/AppFooter';

interface DashboardProps {
  onRedoQuestionnaire?: () => void;
  isFirstTime?: boolean;
}

export function Dashboard({ onRedoQuestionnaire, isFirstTime }: DashboardProps) {
  const { client, logout } = useApp();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    document.documentElement.classList.toggle('dark', newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-foreground font-medium">Carregando seu dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoEasyEat} alt="Easy Eat" className="w-10 h-10 object-contain rounded-lg" />
            <span className="font-bold text-lg hidden sm:inline text-foreground">Easy Eat</span>
            
            {/* Mensagem para usuários de primeira vez */}
            {isFirstTime && (
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-300 dark:border-yellow-700">
                <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  👋 Primeira vez aqui?{' '}
                  <button 
                    onClick={onRedoQuestionnaire}
                    className="underline hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors"
                  >
                    Faça o questionário e defina suas metas!
                  </button>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRedoQuestionnaire}
              className="text-foreground hover:bg-muted"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Refazer Questionário</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings/restricoes')}
              className="text-foreground hover:bg-muted"
            >
              <Shield className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Restrições</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
              <HelpCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Suporte</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Olá, {client.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Bem-vindo ao seu plano alimentar personalizado
          </p>
        </section>

        {/* Nutrition Plan Card + Macro Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <NutritionPlanCard 
              peso={client.peso}
              sexo={client.sexo?.toLowerCase() as 'masculino' | 'feminino' | 'outro'}
              onEditProfile={onRedoQuestionnaire}
            />
          </div>
          <div className="lg:col-span-2">
            <MacroCards />
          </div>
        </section>

        {/* Charts */}
        <section>
          <NutritionCharts />
        </section>

        {/* Meal Builder - Now includes Diet Switcher, Beverages, Sweets */}
        <section>
          <MealBuilder />
        </section>

        {/* Biometric & Preferences */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BiometricData />
          <PreferencesData />
        </section>
      </main>

      <AppFooter />
    </div>
  );
}