import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, ChevronRight, Settings2, Info, Zap, Target, TrendingUp } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { OnboardingData } from './OnboardingQuestionnaire';
import { 
  calculateTDEE, 
  calculateTargetCalories, 
  getRecommendationByGoal,
  validateMacros,
  calculateMacroGrams,
  hasBlockingWarnings,
  getWarningColorClass,
} from '@/utils/nutritionRecommendations';
import { MacroRecommendation, Objetivo, MacroWarning, TIPS_BY_OBJECTIVE } from '@/types/nutrition';

interface StepMacroRecommendationProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type ViewMode = 'recommendation' | 'ranges' | 'customize';

export function StepMacroRecommendation({ data, updateData, onNext, onBack }: StepMacroRecommendationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('recommendation');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<MacroWarning[]>([]);
  
  // Custom macro values (for customize mode)
  const [customProtein, setCustomProtein] = useState(data.macros_proteina_pct);
  const [customCarbs, setCustomCarbs] = useState(data.macros_carboidrato_pct);
  const [customFat, setCustomFat] = useState(data.macros_lipidio_pct);

  // Calculate recommendation
  const recommendation = useMemo<MacroRecommendation | null>(() => {
    if (!data.peso_kg || !data.altura_cm || !data.idade || !data.sexo || !data.nivel_atividade || !data.objetivo) {
      return null;
    }

    const tdee = calculateTDEE(
      data.peso_kg,
      data.altura_cm,
      data.idade,
      data.sexo as 'masculino' | 'feminino' | 'outro',
      data.nivel_atividade as any
    );

    const calorias = calculateTargetCalories(
      tdee, 
      data.objetivo as Objetivo,
      data.sexo as 'masculino' | 'feminino' | 'outro'
    );

    return getRecommendationByGoal(data.objetivo as Objetivo, data.peso_kg, calorias);
  }, [data]);

  // Calculate TDEE for display
  const tdee = useMemo(() => {
    if (!data.peso_kg || !data.altura_cm || !data.idade || !data.sexo || !data.nivel_atividade) {
      return 0;
    }
    return calculateTDEE(
      data.peso_kg,
      data.altura_cm,
      data.idade,
      data.sexo as 'masculino' | 'feminino' | 'outro',
      data.nivel_atividade as any
    );
  }, [data]);

  // Current warnings for custom values
  const customWarnings = useMemo(() => {
    if (!data.peso_kg || !data.objetivo || !data.sexo || !recommendation) return [];
    return validateMacros(
      customProtein,
      customCarbs,
      customFat,
      data.peso_kg,
      recommendation.calorias_alvo,
      data.objetivo as Objetivo,
      data.sexo as 'masculino' | 'feminino' | 'outro'
    );
  }, [customProtein, customCarbs, customFat, data, recommendation]);

  const macroSum = customProtein + customCarbs + customFat;
  const isSumValid = Math.abs(macroSum - 100) <= 2;

  // Custom macro grams
  const customGrams = useMemo(() => {
    if (!recommendation) return { proteina_g: 0, carboidrato_g: 0, gordura_g: 0 };
    return calculateMacroGrams(customProtein, customCarbs, customFat, recommendation.calorias_alvo);
  }, [customProtein, customCarbs, customFat, recommendation]);

  // Adjust other macros when one changes
  const adjustMacros = (type: 'protein' | 'carbs' | 'fat', value: number) => {
    const remaining = 100 - value;
    
    switch (type) {
      case 'protein':
        setCustomProtein(value);
        const carbRatio1 = customCarbs / (customCarbs + customFat || 1);
        setCustomCarbs(Math.round(remaining * carbRatio1));
        setCustomFat(100 - value - Math.round(remaining * carbRatio1));
        break;
      case 'carbs':
        setCustomCarbs(value);
        const protRatio = customProtein / (customProtein + customFat || 1);
        setCustomProtein(Math.round(remaining * protRatio));
        setCustomFat(100 - Math.round(remaining * protRatio) - value);
        break;
      case 'fat':
        setCustomFat(value);
        const protRatio2 = customProtein / (customProtein + customCarbs || 1);
        setCustomProtein(Math.round(remaining * protRatio2));
        setCustomCarbs(100 - Math.round(remaining * protRatio2) - value);
        break;
    }
  };

  // Apply recommendation values
  const applyRecommendation = () => {
    if (!recommendation) return;
    
    const macroGrams = calculateMacroGrams(
      recommendation.proteina.pct,
      recommendation.carboidrato.pct,
      recommendation.gordura.pct,
      recommendation.calorias_alvo
    );
    
    updateData({
      macros_proteina_pct: recommendation.proteina.pct,
      macros_carboidrato_pct: recommendation.carboidrato.pct,
      macros_lipidio_pct: recommendation.gordura.pct,
      calorias_diarias: recommendation.calorias_alvo,
      tmb: tdee,
    });
    
    setCustomProtein(recommendation.proteina.pct);
    setCustomCarbs(recommendation.carboidrato.pct);
    setCustomFat(recommendation.gordura.pct);
  };

  // Handle next with validation
  const handleNext = () => {
    if (viewMode === 'customize') {
      // Validate custom values
      const warnings = customWarnings;
      const blocking = hasBlockingWarnings(warnings);
      
      if (blocking) {
        // Can't proceed with blocking warnings
        return;
      }
      
      if (warnings.length > 0) {
        // Show warning dialog for non-blocking warnings
        setPendingWarnings(warnings);
        setShowWarningDialog(true);
        return;
      }
    }
    
    // Apply current values and proceed
    if (viewMode === 'customize') {
      updateData({
        macros_proteina_pct: customProtein,
        macros_carboidrato_pct: customCarbs,
        macros_lipidio_pct: customFat,
        calorias_diarias: recommendation?.calorias_alvo || data.calorias_diarias,
        tmb: tdee,
      });
    } else {
      applyRecommendation();
    }
    
    onNext();
  };

  // Confirm with warnings
  const confirmWithWarnings = () => {
    updateData({
      macros_proteina_pct: customProtein,
      macros_carboidrato_pct: customCarbs,
      macros_lipidio_pct: customFat,
      calorias_diarias: recommendation?.calorias_alvo || data.calorias_diarias,
      tmb: tdee,
    });
    setShowWarningDialog(false);
    onNext();
  };

  if (!recommendation) {
    return (
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Dados insuficientes para calcular recomendação.</p>
          <Button onClick={onBack} className="mt-4">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  const getObjectiveIcon = () => {
    switch (data.objetivo) {
      case 'Perda de Peso': return <TrendingUp className="w-5 h-5" />;
      case 'Ganho de Massa': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const tips = TIPS_BY_OBJECTIVE[data.objetivo as Objetivo] || [];

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-gray-900 flex items-center justify-center gap-2">
            {getObjectiveIcon()}
            Seu Plano Nutricional
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-gray-700 border-gray-300">
              {data.objetivo}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Calories Display */}
          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">CALORIAS ALVO</p>
            <p className="text-4xl font-bold text-gray-900">{recommendation.calorias_alvo}</p>
            <p className="text-sm text-gray-500">kcal/dia</p>
            <p className="text-xs text-gray-400 mt-2">TDEE: {tdee} kcal × ajuste por objetivo</p>
          </div>

          {/* Recommendation View */}
          {viewMode === 'recommendation' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">SUA RECOMENDAÇÃO IDEAL</h3>
                </div>

                {/* Macro Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">PROTEÍNA</p>
                    <p className="text-2xl font-bold text-blue-700">{recommendation.proteina.g}g</p>
                    <p className="text-xs text-blue-500">{recommendation.proteina.pct}%</p>
                    <p className="text-xs text-blue-400">{recommendation.proteina.g_kg}g/kg</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center border border-amber-200">
                    <p className="text-xs text-amber-600 font-medium">CARBOIDRATO</p>
                    <p className="text-2xl font-bold text-amber-700">{recommendation.carboidrato.g}g</p>
                    <p className="text-xs text-amber-500">{recommendation.carboidrato.pct}%</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">GORDURA</p>
                    <p className="text-2xl font-bold text-purple-700">{recommendation.gordura.g}g</p>
                    <p className="text-xs text-purple-500">{recommendation.gordura.pct}%</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Dicas para {data.objetivo}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tips.slice(0, 2).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('ranges')}
                  className="text-gray-700 border-gray-300"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Ver Faixas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('customize')}
                  className="text-gray-700 border-gray-300"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Editar Macros
                </Button>
              </div>
            </>
          )}

          {/* Ranges View */}
          {viewMode === 'ranges' && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">FAIXAS ACEITÁVEIS</h3>
                <p className="text-sm text-gray-600">Use estas faixas se preferir ajustar os valores:</p>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-700">Proteína</p>
                    <p className="text-sm text-blue-600">
                      {Math.round(data.peso_kg! * recommendation.faixas.proteina.min_g_kg)}g - 
                      {Math.round(data.peso_kg! * recommendation.faixas.proteina.max_g_kg)}g 
                      ({recommendation.faixas.proteina.min_pct}-{recommendation.faixas.proteina.max_pct}%)
                    </p>
                    <p className="text-xs text-blue-500">
                      {recommendation.faixas.proteina.min_g_kg}-{recommendation.faixas.proteina.max_g_kg}g/kg
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="font-medium text-amber-700">Carboidrato</p>
                    <p className="text-sm text-amber-600">
                      {Math.round(recommendation.calorias_alvo * recommendation.faixas.carboidrato.min_pct / 100 / 4)}g - 
                      {Math.round(recommendation.calorias_alvo * recommendation.faixas.carboidrato.max_pct / 100 / 4)}g 
                      ({recommendation.faixas.carboidrato.min_pct}-{recommendation.faixas.carboidrato.max_pct}%)
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-medium text-purple-700">Gordura</p>
                    <p className="text-sm text-purple-600">
                      {Math.round(recommendation.calorias_alvo * recommendation.faixas.gordura.min_pct / 100 / 9)}g - 
                      {Math.round(recommendation.calorias_alvo * recommendation.faixas.gordura.max_pct / 100 / 9)}g 
                      ({recommendation.faixas.gordura.min_pct}-{recommendation.faixas.gordura.max_pct}%)
                    </p>
                    <p className="text-xs text-purple-500">Mínimo: {recommendation.faixas.gordura.min_g}g</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('recommendation')}
                  className="text-gray-700 border-gray-300"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setViewMode('customize')}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Customizar
                </Button>
              </div>
            </>
          )}

          {/* Customize View */}
          {viewMode === 'customize' && (
            <>
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-900">EDITAR MACROS MANUALMENTE</h3>

                {/* Sum indicator */}
                <div className={`p-2 rounded-lg text-center ${isSumValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className={isSumValid ? 'text-green-700' : 'text-red-700'}>
                    Soma: {macroSum}% {isSumValid ? '✓' : `(deve ser 100%)`}
                  </span>
                </div>

                {/* Protein Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Proteína</span>
                    <span className="text-sm text-gray-600">
                      {customProtein}% = {customGrams.proteina_g}g ({(customGrams.proteina_g / data.peso_kg!).toFixed(1)}g/kg)
                    </span>
                  </div>
                  <Slider
                    value={[customProtein]}
                    onValueChange={([val]) => adjustMacros('protein', val)}
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Carbs Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700">Carboidrato</span>
                    <span className="text-sm text-gray-600">
                      {customCarbs}% = {customGrams.carboidrato_g}g
                    </span>
                  </div>
                  <Slider
                    value={[customCarbs]}
                    onValueChange={([val]) => adjustMacros('carbs', val)}
                    min={20}
                    max={70}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Fat Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-700">Gordura</span>
                    <span className="text-sm text-gray-600">
                      {customFat}% = {customGrams.gordura_g}g
                    </span>
                  </div>
                  <Slider
                    value={[customFat]}
                    onValueChange={([val]) => adjustMacros('fat', val)}
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Visual Bar */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 transition-all" 
                    style={{ width: `${customProtein}%` }}
                  />
                  <div 
                    className="bg-amber-500 transition-all" 
                    style={{ width: `${customCarbs}%` }}
                  />
                  <div 
                    className="bg-purple-500 transition-all" 
                    style={{ width: `${customFat}%` }}
                  />
                </div>

                {/* Warnings */}
                {customWarnings.length > 0 && (
                  <div className="space-y-2">
                    {customWarnings.map((warning, i) => (
                      <div 
                        key={i} 
                        className={`p-2 rounded-lg border text-sm ${getWarningColorClass(warning.level)}`}
                      >
                        {warning.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewMode('recommendation');
                    if (recommendation) {
                      setCustomProtein(recommendation.proteina.pct);
                      setCustomCarbs(recommendation.carboidrato.pct);
                      setCustomFat(recommendation.gordura.pct);
                    }
                  }}
                  className="text-gray-700 border-gray-300"
                >
                  Usar Recomendado
                </Button>
                <Button
                  onClick={() => setViewMode('recommendation')}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Voltar
                </Button>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              Voltar
            </Button>
            <Button 
              onClick={handleNext}
              disabled={viewMode === 'customize' && (!isSumValid || hasBlockingWarnings(customWarnings))}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Confirmar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Sua distribuição difere da recomendada
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              <div className="space-y-2 mt-3">
                {pendingWarnings.map((w, i) => (
                  <div key={i} className={`p-2 rounded border ${getWarningColorClass(w.level)}`}>
                    {w.message}
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowWarningDialog(false)}
              className="text-gray-700"
            >
              Ajustar Macros
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmWithWarnings}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Continuar Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
