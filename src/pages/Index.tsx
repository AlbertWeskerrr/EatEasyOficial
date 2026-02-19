import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingQuestionnaire } from '@/components/onboarding/OnboardingQuestionnaire';
import { WelcomeOverlay } from '@/components/auth/WelcomeOverlay';
import { supabase } from '@/integrations/supabase/client';
import { calculateTMB, calculateTDEE, calculateTargetCalories, getRecommendationByGoal } from '@/utils/nutritionRecommendations';
import type { Objetivo } from '@/types/nutrition';

const Index = () => {
  const { isLoggedIn, client, setClientData, setIsLoggedIn } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ nome: string; sexo: 'masculino' | 'feminino' | 'outro' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [isFirstTime, setIsFirstTime] = useState(false);

  const handleRedoQuestionnaire = () => {
    setShowOnboarding(true);
  };

  useEffect(() => {
    checkAuthAndProfile();

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuthAndProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsFirstTime(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // CRITICAL: Always filter by user_id
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (!profile) {
        // Se o usuário existe na autenticação mas ainda não tem linha em profiles,
        // criamos um perfil mínimo para evitar o estado "logado com tela em branco".
        const email = session.user.email || '';
        const fallbackName = (email && email.includes('@')) ? email.split('@')[0] : 'Usuário';
        const nome = (session.user.user_metadata as any)?.nome || fallbackName;

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              user_id: session.user.id,
              email,
              nome,
              perfil_completo: false,
            },
            { onConflict: 'user_id' }
          );

        if (upsertError) {
          console.error('Error creating minimal profile:', upsertError);
          setLoading(false);
          return;
        }

        // Re-busca o perfil recém-criado
        const { data: createdProfile, error: createdProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (createdProfileError || !createdProfile) {
          console.error('Error fetching created profile:', createdProfileError);
          setLoading(false);
          return;
        }

        setClientData({
          email: createdProfile.email,
          nome: createdProfile.nome,
          sexo: 'Outro',
          idade: 25,
          altura: 170,
          peso: 70,
          circunferenciaAbdominal: 80,
          nivelAtividade: 'Moderada',
          praticaExercicio: false,
          frequenciaExercicio: 0,
          preferenciasAlimentares: '',
          restricoesAlimentares: '',
          alergias: '',
          objetivo: 'Manutenção',
        });

        setIsLoggedIn(true);
        setIsFirstTime(true);
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      // Fetch health data from user_health_data table
      const { data: healthData, error: healthError } = await supabase
        .from('user_health_data')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (healthError) {
        console.error('Error fetching health data:', healthError);
        // Continue - health data might not exist yet
      }

      // Check if user has macro plan - migrate if needed
      const { data: existingPlan } = await supabase
        .from('user_macro_plans')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Auto-migrate existing users without macro plan
      if (!existingPlan && profile.perfil_completo && healthData) {
        try {
          const sexo = (profile.sexo?.toLowerCase() || 'outro') as 'masculino' | 'feminino' | 'outro';
          const nivelAtividade = (profile.nivel_atividade || 'Moderada') as 'Sedentário' | 'Leve' | 'Moderada' | 'Alta' | 'Muito Alta';
          const objetivo = (profile.objetivo || 'Manutenção') as Objetivo;
          
          const peso = Number(healthData.peso_kg) || 70;
          const altura = healthData.altura_cm || 170;
          const idade = profile.idade || 30;
          
          const tdee = calculateTDEE(peso, altura, idade, sexo, nivelAtividade);
          const calorias = calculateTargetCalories(tdee, objetivo, sexo);
          const recommendation = getRecommendationByGoal(objetivo, peso, calorias);
          
          await supabase.from('user_macro_plans').insert({
            user_id: session.user.id,
            objetivo,
            calorias_alvo: recommendation.calorias_alvo,
            proteina_pct: recommendation.proteina.pct,
            proteina_g: recommendation.proteina.g,
            proteina_g_kg: recommendation.proteina.g_kg,
            carboidrato_pct: recommendation.carboidrato.pct,
            carboidrato_g: recommendation.carboidrato.g,
            gordura_pct: recommendation.gordura.pct,
            gordura_g: recommendation.gordura.g,
            fibra_g: recommendation.fibra_g,
            is_customized: false,
            fonte_recomendacao: 'auto_migration',
            avisos: [],
          });
          console.log('Auto-migrated user macro plan');
        } catch (migrationError) {
          console.error('Error auto-migrating macro plan:', migrationError);
        }
      }

      if (!profile.perfil_completo) {
        setClientData({
          email: profile.email,
          nome: profile.nome,
          sexo: 'Outro',
          idade: 25,
          altura: 170,
          peso: 70,
          circunferenciaAbdominal: 80,
          nivelAtividade: 'Moderada',
          praticaExercicio: false,
          frequenciaExercicio: 0,
          preferenciasAlimentares: '',
          restricoesAlimentares: '',
          alergias: '',
          objetivo: 'Manutenção',
        });
        setIsLoggedIn(true);
        setIsFirstTime(true);
        setLoading(false);
        return;
      }

      // Apply theme from profile
      if (profile.tema_cor) {
        document.documentElement.setAttribute('data-theme', profile.tema_cor);
      }

      // Combine profile data with health data
      setClientData({
        email: profile.email,
        nome: profile.nome,
        sexo: (profile.sexo as 'Masculino' | 'Feminino' | 'Outro') || 'Outro',
        idade: profile.idade || 25,
        altura: healthData?.altura_cm || 170,
        peso: healthData?.peso_kg ? Number(healthData.peso_kg) : 70,
        circunferenciaAbdominal: healthData?.circunferencia_abdominal_cm || 80,
        nivelAtividade: (profile.nivel_atividade as any) || 'Moderada',
        praticaExercicio: profile.pratica_exercicio || false,
        frequenciaExercicio: profile.frequencia_exercicio || 0,
        preferenciasAlimentares: profile.preferencias_alimentares || '',
        restricoesAlimentares: profile.restricoes_alimentares || '',
        alergias: profile.alergias || '',
        objetivo: (profile.objetivo as any) || 'Manutenção',
      });

      setIsLoggedIn(true);
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    // Re-fetch profile to get updated data
    await checkAuthAndProfile();
    
    if (client) {
      const sexoMap: Record<string, 'masculino' | 'feminino' | 'outro'> = {
        'Masculino': 'masculino',
        'Feminino': 'feminino',
        'Outro': 'outro',
      };
      setWelcomeData({ nome: client.nome, sexo: sexoMap[client.sexo] || 'outro' });
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  if (showOnboarding && client) {
    return (
      <OnboardingQuestionnaire
        userEmail={client.email}
        userName={client.nome}
        userId={userId}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <>
      {showWelcome && welcomeData && (
        <WelcomeOverlay nome={welcomeData.nome} sexo={welcomeData.sexo} />
      )}
      <Dashboard onRedoQuestionnaire={handleRedoQuestionnaire} isFirstTime={isFirstTime} />
    </>
  );
};

export default Index;
