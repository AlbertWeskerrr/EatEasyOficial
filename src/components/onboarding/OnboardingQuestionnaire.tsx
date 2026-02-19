import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StepPersonalData } from './StepPersonalData';
import { StepAnthropometry } from './StepAnthropometry';
import { StepPhysicalActivity } from './StepPhysicalActivity';
import { StepObjectives } from './StepObjectives';
import { StepMacroRecommendation } from './StepMacroRecommendation';
import { StepSummary } from './StepSummary';
import { Progress } from '@/components/ui/progress';
import logoYellow from '@/assets/logo-yellow.png';
import { Objetivo } from '@/types/nutrition';
import { Json } from '@/integrations/supabase/types';
import { 
  calculateTDEE, 
  calculateTargetCalories, 
  getRecommendationByGoal,
  validateMacros,
  calculateMacroGrams 
} from '@/utils/nutritionRecommendations';

export interface OnboardingData {
  // Step 1: Personal Data
  nome: string;
  sexo: 'masculino' | 'feminino' | 'outro' | '';
  idade: number | null;
  
  // Step 2: Anthropometry
  altura_cm: number | null;
  peso_kg: number | null;
  circunferencia_abdominal_cm: number | null;
  imc: number | null;
  
  // Step 3: Physical Activity
  nivel_atividade: 'Sedentário' | 'Leve' | 'Moderada' | 'Alta' | 'Muito Alta' | '';
  pratica_exercicio: boolean;
  frequencia_exercicio: number;
  tipo_exercicio: string[];
  
  // Step 4: Objectives
  objetivo: 'Perda de Peso' | 'Manutenção' | 'Ganho de Massa' | '';
  alergias: string;
  restricoes_alimentares: string;
  preferencias_alimentares: string;
  
  // Step 5: Theme & Macros
  tema_cor: 'azul' | 'rosa' | 'laranja' | 'amarelo';
  macros_proteina_pct: number;
  macros_carboidrato_pct: number;
  macros_lipidio_pct: number;
  
  // Calculated values
  tmb: number | null;
  calorias_diarias: number | null;
}

interface OnboardingQuestionnaireProps {
  userEmail: string;
  userName: string;
  userId: string;
  onComplete: () => void;
}

export function OnboardingQuestionnaire({ userEmail, userName, userId, onComplete }: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    nome: userName,
    sexo: '',
    idade: null,
    altura_cm: null,
    peso_kg: null,
    circunferencia_abdominal_cm: null,
    imc: null,
    nivel_atividade: '',
    pratica_exercicio: false,
    frequencia_exercicio: 0,
    tipo_exercicio: [],
    objetivo: '',
    alergias: '',
    restricoes_alimentares: '',
    preferencias_alimentares: '',
    tema_cor: 'amarelo',
    macros_proteina_pct: 30,
    macros_carboidrato_pct: 40,
    macros_lipidio_pct: 30,
    tmb: null,
    calorias_diarias: null,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate final values and show summary
      calculateFinalValues();
      setShowSummary(true);
    }
  };

  const prevStep = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateFinalValues = () => {
    if (!data.peso_kg || !data.altura_cm || !data.idade || !data.sexo) return;

    // Calculate BMI
    const heightM = data.altura_cm / 100;
    const imc = data.peso_kg / (heightM * heightM);

    // Calculate BMR using Mifflin-St Jeor
    let tmb: number;
    if (data.sexo === 'masculino') {
      tmb = 10 * data.peso_kg + 6.25 * data.altura_cm - 5 * data.idade + 5;
    } else {
      tmb = 10 * data.peso_kg + 6.25 * data.altura_cm - 5 * data.idade - 161;
    }

    // Activity factor
    const activityFactors: Record<string, number> = {
      'Sedentário': 1.2,
      'Leve': 1.375,
      'Moderada': 1.55,
      'Alta': 1.725,
      'Muito Alta': 1.9,
    };
    const factor = activityFactors[data.nivel_atividade] || 1.2;

    // Calculate TDEE
    let calorias_diarias = tmb * factor;

    // Adjust for goal
    if (data.objetivo === 'Perda de Peso') {
      calorias_diarias *= 0.85; // 15% deficit
    } else if (data.objetivo === 'Ganho de Massa') {
      calorias_diarias *= 1.15; // 15% surplus
    }

    updateData({
      imc: Math.round(imc * 10) / 10,
      tmb: Math.round(tmb),
      calorias_diarias: Math.round(calorias_diarias),
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!userId) {
      toast.error('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    if (!data.nome || !data.sexo || !data.idade || !data.altura_cm || !data.peso_kg || !data.nivel_atividade || !data.objetivo) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for macro warnings
      const avisoProteinaBaixa = data.macros_proteina_pct < 20;
      const avisoCarboidratoAlto = data.macros_carboidrato_pct > 60;
      const avisoMacrosDesequilibrio = avisoProteinaBaixa || avisoCarboidratoAlto || data.macros_lipidio_pct < 20;

      // Update profile (without health data - now in separate table)
      const profilePayload = {
        nome: data.nome,
        sexo: data.sexo,
        idade: data.idade,
        nivel_atividade: data.nivel_atividade,
        pratica_exercicio: data.pratica_exercicio,
        frequencia_exercicio: data.frequencia_exercicio,
        tipo_exercicio: JSON.stringify(data.tipo_exercicio),
        objetivo: data.objetivo,
        alergias: data.alergias,
        restricoes_alimentares: data.restricoes_alimentares,
        preferencias_alimentares: data.preferencias_alimentares,
        tema_cor: data.tema_cor,
        macros_proteina_pct: data.macros_proteina_pct,
        macros_carboidrato_pct: data.macros_carboidrato_pct,
        macros_lipidio_pct: data.macros_lipidio_pct,
        aviso_macros_desequilibrio: avisoMacrosDesequilibrio,
        aviso_proteina_baixa: avisoProteinaBaixa,
        aviso_carboidrato_alto: avisoCarboidratoAlto,
        perfil_completo: true,
        questionario_respondido_em: new Date().toISOString(),
        macros_atualizados_em: new Date().toISOString(),
      };

      // CRITICAL: Always filter by user_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Supabase profile error:', profileError);
        throw new Error(profileError.message || 'Erro ao salvar perfil');
      }

      // Save health data to user_health_data table (upsert)
      const healthPayload = {
        user_id: userId,
        peso_kg: data.peso_kg,
        altura_cm: data.altura_cm,
        imc: data.imc,
        circunferencia_abdominal_cm: data.circunferencia_abdominal_cm,
        tmb: data.tmb,
        calorias_diarias: data.calorias_diarias,
      };

      const { error: healthError } = await supabase
        .from('user_health_data')
        .upsert(healthPayload, { onConflict: 'user_id' });

      if (healthError) {
        console.error('Supabase health data error:', healthError);
        throw new Error(healthError.message || 'Erro ao salvar dados de saúde');
      }

      // Add initial entry to health history
      const { error: historyError } = await supabase
        .from('user_health_history')
        .insert({
          user_id: userId,
          peso_kg: data.peso_kg,
          altura_cm: data.altura_cm,
          imc: data.imc,
          circunferencia_abdominal_cm: data.circunferencia_abdominal_cm,
          tmb: data.tmb,
          calorias_diarias: data.calorias_diarias,
          source: 'onboarding',
        });

      if (historyError) {
        console.error('Error saving initial health history:', historyError);
      }

      // Save macro plan to user_macro_plans table
      const macroGrams = calculateMacroGrams(
        data.macros_proteina_pct,
        data.macros_carboidrato_pct,
        data.macros_lipidio_pct,
        data.calorias_diarias || 2000
      );
      const proteinaGKg = macroGrams.proteina_g / (data.peso_kg || 70);
      const warnings = validateMacros(
        data.macros_proteina_pct,
        data.macros_carboidrato_pct,
        data.macros_lipidio_pct,
        data.peso_kg || 70,
        data.calorias_diarias || 2000,
        data.objetivo as Objetivo,
        data.sexo as 'masculino' | 'feminino' | 'outro'
      );

      const macroPlanPayload = {
        user_id: userId,
        objetivo: data.objetivo,
        calorias_alvo: data.calorias_diarias || 2000,
        proteina_pct: data.macros_proteina_pct,
        carboidrato_pct: data.macros_carboidrato_pct,
        gordura_pct: data.macros_lipidio_pct,
        proteina_g: macroGrams.proteina_g,
        carboidrato_g: macroGrams.carboidrato_g,
        gordura_g: macroGrams.gordura_g,
        fibra_g: 28,
        proteina_g_kg: parseFloat(proteinaGKg.toFixed(1)),
        fonte_recomendacao: 'sistema',
        avisos: warnings as unknown as Json,
        is_customized: false,
      };

      const { error: macroPlanError } = await supabase
        .from('user_macro_plans')
        .upsert(macroPlanPayload, { onConflict: 'user_id' });

      if (macroPlanError) {
        console.error('Error saving macro plan:', macroPlanError);
      }

      // Save user restrictions to user_restrictions table
      const selectedRestrictionIds = (data as any)._selectedRestrictionIds as string[] | undefined;
      if (selectedRestrictionIds && selectedRestrictionIds.length > 0) {
        // First, delete any existing restrictions
        await supabase
          .from('user_restrictions')
          .delete()
          .eq('user_id', userId);

        // Then insert new ones
        const { error: restrictionsError } = await supabase
          .from('user_restrictions')
          .insert(
            selectedRestrictionIds.map(rid => ({ user_id: userId, restriction_id: rid }))
          );

        if (restrictionsError) {
          console.error('Error saving restrictions:', restrictionsError);
          // Don't throw - profile was saved successfully
        }
      }

      // Apply theme immediately
      document.documentElement.setAttribute('data-theme', data.tema_cor);

      toast.success('Perfil salvo com sucesso!');
      onComplete();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Erro ao salvar perfil: ${error.message || 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = showSummary ? 100 : (currentStep / 5) * 100;

  return (
    <div className="light min-h-screen bg-gradient-to-br from-[hsl(50,100%,50%)] via-[hsl(50,100%,85%)] to-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm shadow-sm">
        <img src={logoYellow} alt="Easy Eat" className="w-10 h-10" />
        <h1 className="text-xl font-bold text-gray-900">Complete seu Perfil</h1>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            {showSummary ? 'Resumo' : `Etapa ${currentStep} de 5`}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progressValue)}%
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {showSummary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepSummary
                data={data}
                onBack={prevStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              {currentStep === 1 && (
                <StepPersonalData
                  data={data}
                  updateData={updateData}
                  onNext={nextStep}
                />
              )}
              {currentStep === 2 && (
                <StepAnthropometry
                  data={data}
                  updateData={updateData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 3 && (
                <StepPhysicalActivity
                  data={data}
                  updateData={updateData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 4 && (
                <StepObjectives
                  data={data}
                  updateData={updateData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 5 && (
                <StepMacroRecommendation
                  data={data}
                  updateData={updateData}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-900 font-medium">Salvando perfil...</p>
          </div>
        </div>
      )}
    </div>
  );
}
