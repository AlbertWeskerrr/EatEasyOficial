import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';
import { LegalDocsDialog, type LegalDocTab } from '@/components/legal/LegalDocsDialog';

interface StepSummaryProps {
  data: OnboardingData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Helper to display sex in Portuguese
const getSexoLabel = (sexo: string) => {
  const labels: Record<string, string> = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    outro: 'Outro',
  };
  return labels[sexo] || sexo;
};

// Parse comma-separated string into array
function parseToArray(str: string | undefined): string[] {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

export function StepSummary({ data, onBack, onSubmit, isSubmitting }: StepSummaryProps) {
  const [openDocsDialog, setOpenDocsDialog] = useState(false);
  const [docsTab, setDocsTab] = useState<LegalDocTab>('terms');

  const openDocs = (tab: LegalDocTab) => {
    setDocsTab(tab);
    setOpenDocsDialog(true);
  };

  // Calculate macros in grams
  const calorias = data.calorias_diarias || 0;
  const proteinasG = Math.round((calorias * (data.macros_proteina_pct / 100)) / 4);
  const carboidratosG = Math.round((calorias * (data.macros_carboidrato_pct / 100)) / 4);
  const lipiodiosG = Math.round((calorias * (data.macros_lipidio_pct / 100)) / 9);

  // Check warnings
  const hasWarnings = data.macros_proteina_pct < 20 || data.macros_carboidrato_pct > 60 || data.macros_lipidio_pct < 20;

  // Parse tags
  const allergies = parseToArray(data.alergias);
  const restrictions = parseToArray(data.restricoes_alimentares);
  const preferences = parseToArray(data.preferencias_alimentares);

  const getImcCategory = (imc: number | null) => {
    if (!imc) return { label: '', color: '' };
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-[hsl(217,91%,45%)]' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-[hsl(142,70%,30%)]' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-[hsl(24,95%,40%)]' };
    if (imc < 35) return { label: 'Obesidade I', color: 'text-[hsl(24,95%,35%)]' };
    return { label: 'Obesidade II+', color: 'text-[hsl(0,84%,45%)]' };
  };

  const imcInfo = getImcCategory(data.imc);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-[hsl(142,70%,90%)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[hsl(142,70%,35%)]" />
          </div>
          <CardTitle className="text-2xl text-[hsl(0,0%,12%)]">Resumo do seu Perfil</CardTitle>
          <CardDescription className="text-[hsl(0,0%,40%)]">Confira seus dados antes de continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personal Info */}
          <div className="p-4 bg-[hsl(0,0%,98%)] rounded-lg border border-[hsl(0,0%,90%)]">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-[hsl(0,0%,12%)]">👤 Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-[hsl(0,0%,40%)]">Nome:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{data.nome}</span>
              <span className="text-[hsl(0,0%,40%)]">Sexo:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{getSexoLabel(data.sexo)}</span>
              <span className="text-[hsl(0,0%,40%)]">Idade:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{data.idade} anos</span>
            </div>
          </div>

          {/* Body Info */}
          <div className="p-4 bg-[hsl(0,0%,98%)] rounded-lg border border-[hsl(0,0%,90%)]">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-[hsl(0,0%,12%)]">📏 Medidas Corporais</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-[hsl(0,0%,40%)]">Altura:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{data.altura_cm} cm</span>
              <span className="text-[hsl(0,0%,40%)]">Peso:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{data.peso_kg} kg</span>
              <span className="text-[hsl(0,0%,40%)]">IMC:</span>
              <span className={cn("font-medium", imcInfo.color)}>
                {data.imc?.toFixed(1)} ({imcInfo.label})
              </span>
              {data.circunferencia_abdominal_cm && (
                <>
                  <span className="text-[hsl(0,0%,40%)]">Cintura:</span>
                  <span className="font-medium text-[hsl(0,0%,12%)]">{data.circunferencia_abdominal_cm} cm</span>
                </>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="p-4 bg-[hsl(0,0%,98%)] rounded-lg border border-[hsl(0,0%,90%)]">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-[hsl(0,0%,12%)]">🏃 Atividade Física</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-[hsl(0,0%,40%)]">Nível:</span>
              <span className="font-medium text-[hsl(0,0%,12%)]">{data.nivel_atividade}</span>
              {data.pratica_exercicio && (
                <>
                  <span className="text-[hsl(0,0%,40%)]">Frequência:</span>
                  <span className="font-medium text-[hsl(0,0%,12%)]">{data.frequencia_exercicio}x/semana</span>
                </>
              )}
            </div>
          </div>

          {/* Goals & Preferences */}
          <div className="p-4 bg-[hsl(0,0%,98%)] rounded-lg border border-[hsl(0,0%,90%)]">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-[hsl(0,0%,12%)]">🎯 Objetivo</h3>
            <p className="text-lg font-semibold text-[hsl(0,0%,12%)] mb-4">{data.objetivo}</p>
            
            {/* Allergies */}
            {allergies.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-[hsl(0,0%,30%)] mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-[hsl(0,84%,50%)]" />
                  Alergias:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-[hsl(0,84%,95%)] text-[hsl(0,84%,35%)] border border-[hsl(0,84%,70%)] px-3 py-1"
                    >
                      ⚠️ {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions */}
            {restrictions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-[hsl(0,0%,30%)] mb-2">🚫 Restrições:</p>
                <div className="flex flex-wrap gap-2">
                  {restrictions.map((rest, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-[hsl(24,95%,95%)] text-[hsl(24,95%,30%)] border border-[hsl(24,95%,70%)] px-3 py-1"
                    >
                      {rest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {preferences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[hsl(0,0%,30%)] mb-2">💚 Preferências:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-[hsl(142,70%,95%)] text-[hsl(142,70%,25%)] border border-[hsl(142,70%,70%)] px-3 py-1"
                    >
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calculated Values Card */}
      <Card className="border-2 border-[hsl(50,100%,50%)] shadow-xl bg-gradient-to-br from-[hsl(50,100%,95%)] to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-[hsl(0,0%,12%)] flex items-center gap-2">
            ⚡ Suas Metas Calculadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TMB & Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-[hsl(0,0%,90%)] text-center shadow-sm">
              <p className="text-sm text-[hsl(0,0%,40%)] font-medium">TMB</p>
              <p className="text-2xl font-bold text-[hsl(0,0%,12%)]">{data.tmb} kcal</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[hsl(0,0%,90%)] text-center shadow-sm">
              <p className="text-sm text-[hsl(0,0%,40%)] font-medium">Meta Diária</p>
              <p className="text-2xl font-bold text-[hsl(0,0%,12%)]">{calorias} kcal</p>
            </div>
          </div>

          {/* Macros in Grams */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[hsl(0,84%,97%)] rounded-lg text-center border border-[hsl(0,84%,85%)]">
              <p className="text-xs text-[hsl(0,84%,40%)] font-semibold">🥩 Proteína</p>
              <p className="text-xl font-bold text-[hsl(0,84%,35%)]">{proteinasG}g</p>
              <p className="text-xs text-[hsl(0,84%,45%)] font-medium">{data.macros_proteina_pct}%</p>
            </div>
            <div className="p-3 bg-[hsl(50,100%,95%)] rounded-lg text-center border border-[hsl(50,100%,70%)]">
              <p className="text-xs text-[hsl(45,80%,30%)] font-semibold">🍞 Carboidrato</p>
              <p className="text-xl font-bold text-[hsl(45,80%,25%)]">{carboidratosG}g</p>
              <p className="text-xs text-[hsl(45,80%,35%)] font-medium">{data.macros_carboidrato_pct}%</p>
            </div>
            <div className="p-3 bg-[hsl(142,70%,95%)] rounded-lg text-center border border-[hsl(142,70%,80%)]">
              <p className="text-xs text-[hsl(142,70%,30%)] font-semibold">🥑 Lipídio</p>
              <p className="text-xl font-bold text-[hsl(142,70%,25%)]">{lipiodiosG}g</p>
              <p className="text-xs text-[hsl(142,70%,35%)] font-medium">{data.macros_lipidio_pct}%</p>
            </div>
          </div>

          {/* Hydration */}
          <div className="p-3 bg-[hsl(217,91%,95%)] rounded-lg text-center border border-[hsl(217,91%,80%)]">
            <p className="text-sm text-[hsl(217,91%,35%)] font-semibold">💧 Meta de Hidratação</p>
            <p className="text-xl font-bold text-[hsl(217,91%,30%)]">
              {data.peso_kg ? Math.round(data.peso_kg * 35) : 2000} ml/dia
            </p>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <div className="p-3 bg-[hsl(24,95%,95%)] border-2 border-[hsl(24,95%,70%)] rounded-lg">
              <p className="text-sm font-semibold text-[hsl(24,95%,30%)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Atenção: Distribuição de macros fora do recomendado
              </p>
              <p className="text-xs text-[hsl(24,95%,35%)] mt-1">
                Você pode ajustar isso a qualquer momento no dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="text-xs text-muted-foreground leading-relaxed">
        <p>
          Ao continuar, você confirma que leu os{' '}
          <Button type="button" variant="link" className="h-auto p-0 align-baseline" onClick={() => openDocs('terms')}>
            Termos de Uso
          </Button>{' '}
          e a{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline"
            onClick={() => openDocs('privacy')}
          >
            Política de Privacidade
          </Button>
          . Este app não substitui orientação profissional.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="flex-1 border-[hsl(50,100%,50%)] text-[hsl(0,0%,12%)] bg-white hover:bg-[hsl(50,100%,95%)] min-h-[52px] font-semibold"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Voltar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-[hsl(50,100%,50%)] hover:bg-[hsl(48,100%,46%)] text-[hsl(0,0%,12%)] font-bold py-6 min-h-[52px] shadow-lg hover:shadow-xl transition-all disabled:bg-[hsl(0,0%,83%)] disabled:text-[hsl(0,0%,60%)]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Ir para Dashboard 🚀
            </>
          )}
        </Button>
      </div>

      <LegalDocsDialog open={openDocsDialog} onOpenChange={setOpenDocsDialog} initialTab={docsTab} />
    </div>
  );
}
