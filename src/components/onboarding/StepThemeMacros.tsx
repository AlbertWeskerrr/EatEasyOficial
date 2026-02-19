import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Palette, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StepThemeMacrosProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const themeColors = [
  { id: 'azul', label: 'Azul', color: '#3B82F6', emoji: '💙' },
  { id: 'rosa', label: 'Rosa', color: '#EC4899', emoji: '💗' },
  { id: 'laranja', label: 'Laranja', color: '#F97316', emoji: '🧡' },
  { id: 'amarelo', label: 'Amarelo', color: '#FFDD00', emoji: '💛' },
];

export function StepThemeMacros({ data, updateData, onNext, onBack }: StepThemeMacrosProps) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Calculate macro warnings
  const checkMacroWarnings = () => {
    const w: string[] = [];
    if (data.macros_proteina_pct < 20) {
      w.push('⚠️ Proteína abaixo de 20% pode comprometer a manutenção muscular');
    }
    if (data.macros_carboidrato_pct > 60) {
      w.push('⚠️ Carboidrato acima de 60% pode dificultar o controle glicêmico');
    }
    if (data.macros_lipidio_pct < 20) {
      w.push('⚠️ Lipídio abaixo de 20% pode afetar a absorção de vitaminas');
    }
    return w;
  };

  // Ensure macros sum to 100%
  const adjustMacros = (type: 'proteina' | 'carboidrato' | 'lipidio', value: number) => {
    const remaining = 100 - value;
    
    if (type === 'proteina') {
      const ratio = data.macros_carboidrato_pct / (data.macros_carboidrato_pct + data.macros_lipidio_pct);
      updateData({
        macros_proteina_pct: value,
        macros_carboidrato_pct: Math.round(remaining * ratio),
        macros_lipidio_pct: Math.round(remaining * (1 - ratio)),
      });
    } else if (type === 'carboidrato') {
      const ratio = data.macros_proteina_pct / (data.macros_proteina_pct + data.macros_lipidio_pct);
      updateData({
        macros_carboidrato_pct: value,
        macros_proteina_pct: Math.round(remaining * ratio),
        macros_lipidio_pct: Math.round(remaining * (1 - ratio)),
      });
    } else {
      const ratio = data.macros_proteina_pct / (data.macros_proteina_pct + data.macros_carboidrato_pct);
      updateData({
        macros_lipidio_pct: value,
        macros_proteina_pct: Math.round(remaining * ratio),
        macros_carboidrato_pct: Math.round(remaining * (1 - ratio)),
      });
    }
  };

  const handleNext = () => {
    const w = checkMacroWarnings();
    if (w.length > 0) {
      setWarnings(w);
      setShowWarningDialog(true);
    } else {
      onNext();
    }
  };

  const total = data.macros_proteina_pct + data.macros_carboidrato_pct + data.macros_lipidio_pct;
  const isValid = total === 100;

  return (
    <>
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-[hsl(50,100%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-[hsl(0,0%,12%)]" />
          </div>
          <CardTitle className="text-2xl text-[hsl(0,0%,12%)]">Tema e Macros</CardTitle>
          <CardDescription className="text-[hsl(0,0%,40%)]">Personalize sua experiência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Color */}
          <div className="space-y-3">
            <Label className="text-[hsl(0,0%,12%)] font-medium">Escolha seu tema de cor</Label>
            <div className="grid grid-cols-4 gap-3">
              {themeColors.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateData({ tema_cor: theme.id as OnboardingData['tema_cor'] })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 bg-white",
                    "hover:opacity-90 min-h-[80px]",
                    data.tema_cor === theme.id
                      ? 'ring-2 ring-offset-2'
                      : 'border-[hsl(0,0%,83%)] hover:border-current'
                  )}
                  style={{ 
                    borderColor: data.tema_cor === theme.id ? theme.color : undefined,
                    '--tw-ring-color': theme.color,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-[hsl(0,0%,83%)]"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-sm font-medium text-[hsl(0,0%,12%)]">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Macros Distribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[hsl(0,0%,12%)] font-medium">Distribuição de Macros</Label>
              <span className={cn(
                "text-sm font-bold px-3 py-1 rounded-full",
                total === 100 
                  ? 'text-[hsl(142,70%,30%)] bg-[hsl(142,70%,90%)]' 
                  : 'text-[hsl(0,84%,40%)] bg-[hsl(0,84%,95%)]'
              )}>
                Total: {total}%
              </span>
            </div>

            {/* Proteína */}
            <div className="space-y-2 p-3 bg-[hsl(0,84%,97%)] rounded-lg border border-[hsl(0,84%,90%)]">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-[hsl(0,0%,12%)] font-medium">
                  🥩 Proteína
                  {data.macros_proteina_pct < 20 && (
                    <AlertTriangle className="w-4 h-4 text-[hsl(24,95%,50%)]" />
                  )}
                </span>
                <span className="font-bold text-[hsl(0,84%,45%)]">{data.macros_proteina_pct}%</span>
              </div>
              <Slider
                value={[data.macros_proteina_pct]}
                onValueChange={([value]) => adjustMacros('proteina', value)}
                min={10}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-[hsl(0,84%,60%)] [&_[role=slider]]:border-[hsl(0,84%,50%)]"
              />
            </div>

            {/* Carboidrato */}
            <div className="space-y-2 p-3 bg-[hsl(50,100%,97%)] rounded-lg border border-[hsl(50,100%,85%)]">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-[hsl(0,0%,12%)] font-medium">
                  🍞 Carboidrato
                  {data.macros_carboidrato_pct > 60 && (
                    <AlertTriangle className="w-4 h-4 text-[hsl(24,95%,50%)]" />
                  )}
                </span>
                <span className="font-bold text-[hsl(45,80%,35%)]">{data.macros_carboidrato_pct}%</span>
              </div>
              <Slider
                value={[data.macros_carboidrato_pct]}
                onValueChange={([value]) => adjustMacros('carboidrato', value)}
                min={20}
                max={70}
                step={5}
                className="[&_[role=slider]]:bg-[hsl(50,100%,50%)] [&_[role=slider]]:border-[hsl(48,100%,40%)]"
              />
            </div>

            {/* Lipídio */}
            <div className="space-y-2 p-3 bg-[hsl(142,70%,97%)] rounded-lg border border-[hsl(142,70%,85%)]">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-[hsl(0,0%,12%)] font-medium">
                  🥑 Lipídio
                  {data.macros_lipidio_pct < 20 && (
                    <AlertTriangle className="w-4 h-4 text-[hsl(24,95%,50%)]" />
                  )}
                </span>
                <span className="font-bold text-[hsl(142,70%,30%)]">{data.macros_lipidio_pct}%</span>
              </div>
              <Slider
                value={[data.macros_lipidio_pct]}
                onValueChange={([value]) => adjustMacros('lipidio', value)}
                min={10}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-[hsl(142,70%,45%)] [&_[role=slider]]:border-[hsl(142,70%,35%)]"
              />
            </div>

            {/* Visual Bar */}
            <div className="h-6 rounded-full overflow-hidden flex shadow-inner border border-[hsl(0,0%,90%)]">
              <div 
                className="bg-[hsl(0,84%,60%)] transition-all flex items-center justify-center"
                style={{ width: `${data.macros_proteina_pct}%` }}
              >
                <span className="text-xs font-bold text-[hsl(0,0%,12%)]">{data.macros_proteina_pct}%</span>
              </div>
              <div 
                className="bg-[hsl(50,100%,50%)] transition-all flex items-center justify-center"
                style={{ width: `${data.macros_carboidrato_pct}%` }}
              >
                <span className="text-xs font-bold text-[hsl(0,0%,12%)]">{data.macros_carboidrato_pct}%</span>
              </div>
              <div 
                className="bg-[hsl(142,70%,45%)] transition-all flex items-center justify-center"
                style={{ width: `${data.macros_lipidio_pct}%` }}
              >
                <span className="text-xs font-bold text-[hsl(0,0%,12%)]">{data.macros_lipidio_pct}%</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 border-[hsl(50,100%,50%)] text-[hsl(0,0%,12%)] bg-white hover:bg-[hsl(50,100%,95%)] min-h-[52px] font-semibold"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isValid}
              className="flex-1 bg-[hsl(50,100%,50%)] hover:bg-[hsl(48,100%,46%)] text-[hsl(0,0%,12%)] font-bold min-h-[52px] shadow-md hover:shadow-lg transition-all disabled:bg-[hsl(0,0%,83%)] disabled:text-[hsl(0,0%,60%)]"
            >
              Finalizar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="bg-white border-2 border-[hsl(24,95%,50%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[hsl(0,0%,12%)]">
              <AlertTriangle className="w-5 h-5 text-[hsl(24,95%,50%)]" />
              Macros Desequilibradas?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-[hsl(0,0%,40%)]">Detectamos alguns pontos de atenção na sua distribuição de macros:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-sm text-[hsl(0,0%,20%)]">{w}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowWarningDialog(false)}
              className="text-[hsl(0,0%,12%)] border-[hsl(0,0%,83%)] bg-white hover:bg-[hsl(0,0%,96%)]"
            >
              Ajustar Macros
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { setShowWarningDialog(false); onNext(); }}
              className="bg-[hsl(50,100%,50%)] text-[hsl(0,0%,12%)] hover:bg-[hsl(48,100%,46%)] font-bold"
            >
              Continuar Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
