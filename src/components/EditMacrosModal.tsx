import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMacroPlan } from '@/hooks/useMacroPlan';
import { 
  validateMacros, 
  calculateMacroGrams, 
  hasBlockingWarnings,
  getWarningColorClass 
} from '@/utils/nutritionRecommendations';
import { Objetivo, MACRO_RULES } from '@/types/nutrition';

interface EditMacrosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peso?: number;
  sexo?: 'masculino' | 'feminino' | 'outro';
}

export function EditMacrosModal({ open, onOpenChange, peso, sexo }: EditMacrosModalProps) {
  const { plan, savePlan, isSaving, createCustomPlan } = useMacroPlan();
  
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);

  // Initialize with current plan values when modal opens
  useEffect(() => {
    if (open && plan) {
      setProteinPct(plan.proteina_pct);
      setCarbsPct(plan.carboidrato_pct);
      setFatPct(plan.gordura_pct);
    }
  }, [open, plan]);

  const macroSum = proteinPct + carbsPct + fatPct;
  const isSumValid = Math.abs(macroSum - 100) <= 2;

  const calorias = plan?.calorias_alvo || 2000;
  const userPeso = peso || 70;
  const userSexo = sexo || 'masculino';
  const objetivo = (plan?.objetivo || 'Manutenção') as Objetivo;

  // Calculate grams
  const macroGrams = useMemo(() => {
    return calculateMacroGrams(proteinPct, carbsPct, fatPct, calorias);
  }, [proteinPct, carbsPct, fatPct, calorias]);

  // Validate macros
  const warnings = useMemo(() => {
    return validateMacros(
      proteinPct,
      carbsPct,
      fatPct,
      userPeso,
      calorias,
      objetivo,
      userSexo
    );
  }, [proteinPct, carbsPct, fatPct, userPeso, calorias, objetivo, userSexo]);

  const hasBlocking = hasBlockingWarnings(warnings);

  // Get recommended ranges
  const ranges = MACRO_RULES[objetivo]?.faixas;

  // Adjust other macros when one changes
  const adjustMacros = (type: 'protein' | 'carbs' | 'fat', value: number) => {
    const remaining = 100 - value;
    
    switch (type) {
      case 'protein':
        setProteinPct(value);
        const carbRatio1 = carbsPct / (carbsPct + fatPct || 1);
        setCarbsPct(Math.round(remaining * carbRatio1));
        setFatPct(100 - value - Math.round(remaining * carbRatio1));
        break;
      case 'carbs':
        setCarbsPct(value);
        const protRatio = proteinPct / (proteinPct + fatPct || 1);
        setProteinPct(Math.round(remaining * protRatio));
        setFatPct(100 - Math.round(remaining * protRatio) - value);
        break;
      case 'fat':
        setFatPct(value);
        const protRatio2 = proteinPct / (proteinPct + carbsPct || 1);
        setProteinPct(Math.round(remaining * protRatio2));
        setCarbsPct(100 - Math.round(remaining * protRatio2) - value);
        break;
    }
  };

  // Reset to recommended
  const resetToRecommended = () => {
    const rules = MACRO_RULES[objetivo];
    if (rules) {
      // Calculate protein from g/kg
      const protG = Math.round(userPeso * rules.proteina_g_kg);
      const protPct = Math.round((protG * 4 / calorias) * 100);
      const remainingPct = 100 - protPct;
      const carbRatio = rules.carboidrato_pct / (rules.carboidrato_pct + rules.gordura_pct);
      const carbPct = Math.round(remainingPct * carbRatio);
      const fatPctCalc = 100 - protPct - carbPct;
      
      setProteinPct(protPct);
      setCarbsPct(carbPct);
      setFatPct(fatPctCalc);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!plan) return;

    const customPlan = createCustomPlan(
      plan.user_id,
      objetivo,
      calorias,
      proteinPct,
      carbsPct,
      fatPct,
      userPeso,
      userSexo
    );

    savePlan(customPlan);
    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Macros</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sum Indicator */}
          <div className={`p-2 rounded-lg text-center text-sm ${isSumValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            Soma: {macroSum}% {isSumValid ? '✓' : `(deve ser 100%)`}
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Proteína</span>
              <span className="text-sm text-muted-foreground">
                {proteinPct}% = {macroGrams.proteina_g}g ({(macroGrams.proteina_g / userPeso).toFixed(1)}g/kg)
              </span>
            </div>
            <Slider
              value={[proteinPct]}
              onValueChange={([val]) => adjustMacros('protein', val)}
              min={10}
              max={50}
              step={1}
            />
            {ranges && (
              <p className="text-xs text-muted-foreground">
                Faixa recomendada: {ranges.proteina.min_pct}-{ranges.proteina.max_pct}%
              </p>
            )}
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carboidrato</span>
              <span className="text-sm text-muted-foreground">
                {carbsPct}% = {macroGrams.carboidrato_g}g
              </span>
            </div>
            <Slider
              value={[carbsPct]}
              onValueChange={([val]) => adjustMacros('carbs', val)}
              min={20}
              max={70}
              step={1}
            />
            {ranges && (
              <p className="text-xs text-muted-foreground">
                Faixa recomendada: {ranges.carboidrato.min_pct}-{ranges.carboidrato.max_pct}%
              </p>
            )}
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gordura</span>
              <span className="text-sm text-muted-foreground">
                {fatPct}% = {macroGrams.gordura_g}g
              </span>
            </div>
            <Slider
              value={[fatPct]}
              onValueChange={([val]) => adjustMacros('fat', val)}
              min={10}
              max={50}
              step={1}
            />
            {ranges && (
              <p className="text-xs text-muted-foreground">
                Faixa recomendada: {ranges.gordura.min_pct}-{ranges.gordura.max_pct}% (mín {ranges.gordura.min_g}g)
              </p>
            )}
          </div>

          {/* Visual Bar */}
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 transition-all" style={{ width: `${proteinPct}%` }} />
            <div className="bg-amber-500 transition-all" style={{ width: `${carbsPct}%` }} />
            <div className="bg-purple-500 transition-all" style={{ width: `${fatPct}%` }} />
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warning, i) => (
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={resetToRecommended}
            className="w-full sm:w-auto"
          >
            Usar Recomendado
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isSumValid || hasBlocking || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
