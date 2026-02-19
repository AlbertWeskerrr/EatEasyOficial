import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MacroPlan, Objetivo, MacroWarning } from '@/types/nutrition';
import { 
  calculateTDEE, 
  calculateTargetCalories, 
  getRecommendationByGoal,
  validateMacros,
  calculateMacroGrams
} from '@/utils/nutritionRecommendations';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

type Sexo = 'masculino' | 'feminino' | 'outro';
type NivelAtividade = 'Sedentário' | 'Leve' | 'Moderada' | 'Alta' | 'Muito Alta';

interface HealthData {
  peso: number;
  altura: number;
  idade: number;
  sexo: Sexo;
  nivelAtividade: NivelAtividade;
}

export function useMacroPlan() {
  const queryClient = useQueryClient();

  // Fetch current macro plan
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ['macro-plan'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_macro_plans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Parse avisos from JSON
        const avisos = Array.isArray(data.avisos) 
          ? (data.avisos as unknown as MacroWarning[])
          : [];
          
        return {
          ...data,
          objetivo: data.objetivo as Objetivo,
          avisos,
          fonte_recomendacao: data.fonte_recomendacao as 'sistema' | 'customizado',
        } as MacroPlan;
      }
      
      return null;
    },
  });

  // Save or update macro plan
  const savePlanMutation = useMutation({
    mutationFn: async (planData: Omit<MacroPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Convert avisos to JSON-compatible format
      const avisosJson = planData.avisos as unknown as Json;

      // Check if plan exists
      const { data: existing } = await supabase
        .from('user_macro_plans')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_macro_plans')
          .update({
            objetivo: planData.objetivo,
            calorias_alvo: planData.calorias_alvo,
            proteina_pct: planData.proteina_pct,
            carboidrato_pct: planData.carboidrato_pct,
            gordura_pct: planData.gordura_pct,
            proteina_g: planData.proteina_g,
            carboidrato_g: planData.carboidrato_g,
            gordura_g: planData.gordura_g,
            fibra_g: planData.fibra_g,
            proteina_g_kg: planData.proteina_g_kg,
            fonte_recomendacao: planData.fonte_recomendacao,
            avisos: avisosJson,
            is_customized: planData.is_customized,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_macro_plans')
          .insert({
            user_id: planData.user_id,
            objetivo: planData.objetivo,
            calorias_alvo: planData.calorias_alvo,
            proteina_pct: planData.proteina_pct,
            carboidrato_pct: planData.carboidrato_pct,
            gordura_pct: planData.gordura_pct,
            proteina_g: planData.proteina_g,
            carboidrato_g: planData.carboidrato_g,
            gordura_g: planData.gordura_g,
            fibra_g: planData.fibra_g,
            proteina_g_kg: planData.proteina_g_kg,
            fonte_recomendacao: planData.fonte_recomendacao,
            avisos: avisosJson,
            is_customized: planData.is_customized,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['macro-plan'] });
      toast.success('Plano nutricional salvo!');
    },
    onError: (error) => {
      console.error('Error saving macro plan:', error);
      toast.error('Erro ao salvar plano nutricional');
    },
  });

  // Calculate recommendation based on health data
  const calculateRecommendation = (healthData: HealthData, objetivo: Objetivo) => {
    const tdee = calculateTDEE(
      healthData.peso,
      healthData.altura,
      healthData.idade,
      healthData.sexo,
      healthData.nivelAtividade
    );
    
    const calorias = calculateTargetCalories(tdee, objetivo, healthData.sexo);
    const recommendation = getRecommendationByGoal(objetivo, healthData.peso, calorias);
    
    return { tdee, recommendation };
  };

  // Create plan from recommendation
  const createPlanFromRecommendation = (
    userId: string,
    recommendation: ReturnType<typeof getRecommendationByGoal>,
    peso: number,
    sexo: Sexo,
    isCustomized: boolean = false
  ): Omit<MacroPlan, 'id' | 'created_at' | 'updated_at'> => {
    const warnings = validateMacros(
      recommendation.proteina.pct,
      recommendation.carboidrato.pct,
      recommendation.gordura.pct,
      peso,
      recommendation.calorias_alvo,
      recommendation.objetivo,
      sexo
    );

    return {
      user_id: userId,
      objetivo: recommendation.objetivo,
      calorias_alvo: recommendation.calorias_alvo,
      proteina_pct: recommendation.proteina.pct,
      carboidrato_pct: recommendation.carboidrato.pct,
      gordura_pct: recommendation.gordura.pct,
      proteina_g: recommendation.proteina.g,
      carboidrato_g: recommendation.carboidrato.g,
      gordura_g: recommendation.gordura.g,
      fibra_g: recommendation.fibra_g,
      proteina_g_kg: recommendation.proteina.g_kg,
      fonte_recomendacao: isCustomized ? 'customizado' : 'sistema',
      avisos: warnings,
      is_customized: isCustomized,
    };
  };

  // Create custom plan with validation
  const createCustomPlan = (
    userId: string,
    objetivo: Objetivo,
    calorias: number,
    proteinaPct: number,
    carboidratoPct: number,
    gorduraPct: number,
    peso: number,
    sexo: Sexo
  ): Omit<MacroPlan, 'id' | 'created_at' | 'updated_at'> => {
    const warnings = validateMacros(
      proteinaPct,
      carboidratoPct,
      gorduraPct,
      peso,
      calorias,
      objetivo,
      sexo
    );

    const macroGrams = calculateMacroGrams(proteinaPct, carboidratoPct, gorduraPct, calorias);
    const proteinaGKg = macroGrams.proteina_g / peso;

    return {
      user_id: userId,
      objetivo,
      calorias_alvo: calorias,
      proteina_pct: proteinaPct,
      carboidrato_pct: carboidratoPct,
      gordura_pct: gorduraPct,
      proteina_g: macroGrams.proteina_g,
      carboidrato_g: macroGrams.carboidrato_g,
      gordura_g: macroGrams.gordura_g,
      fibra_g: 28,
      proteina_g_kg: parseFloat(proteinaGKg.toFixed(1)),
      fonte_recomendacao: 'customizado',
      avisos: warnings,
      is_customized: true,
    };
  };

  return {
    plan,
    isLoading,
    error,
    savePlan: savePlanMutation.mutate,
    isSaving: savePlanMutation.isPending,
    calculateRecommendation,
    createPlanFromRecommendation,
    createCustomPlan,
  };
}
