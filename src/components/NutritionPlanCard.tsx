import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pencil, History, Target, Zap, TrendingUp, Lightbulb, AlertCircle } from 'lucide-react';
import { useMacroPlan } from '@/hooks/useMacroPlan';
import { TIPS_BY_OBJECTIVE, Objetivo } from '@/types/nutrition';
import { EditMacrosModal } from './EditMacrosModal';

interface NutritionPlanCardProps {
  peso?: number;
  sexo?: 'masculino' | 'feminino' | 'outro';
  onEditProfile?: () => void;
}

export function NutritionPlanCard({ peso, sexo, onEditProfile }: NutritionPlanCardProps) {
  const { plan, isLoading } = useMacroPlan();
  const [showEditModal, setShowEditModal] = useState(false);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">
            Complete o questionário para ver seu plano nutricional
          </p>
          {onEditProfile && (
            <Button variant="outline" onClick={onEditProfile}>
              Completar Perfil
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getObjectiveIcon = () => {
    switch (plan.objetivo) {
      case 'Perda de Peso': return <TrendingUp className="w-5 h-5" />;
      case 'Ganho de Massa': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const tips = TIPS_BY_OBJECTIVE[plan.objetivo as Objetivo] || [];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  const hasWarnings = plan.avisos && plan.avisos.length > 0;
  const criticalWarnings = plan.avisos?.filter(w => w.level === 'critical') || [];

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {getObjectiveIcon()}
              Seu Plano Nutricional
            </CardTitle>
            <Badge variant={plan.is_customized ? 'secondary' : 'outline'}>
              {plan.is_customized ? 'Customizado' : 'Recomendado'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{plan.objetivo}</span>
            <span>•</span>
            <span className="font-semibold text-foreground">{plan.calorias_alvo} kcal/dia</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Critical Warnings */}
          {criticalWarnings.length > 0 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Atenção</span>
              </div>
              {criticalWarnings.map((w, i) => (
                <p key={i} className="text-sm text-destructive mt-1">{w.message}</p>
              ))}
            </div>
          )}

          {/* Macro Progress Bars */}
          <div className="space-y-3">
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Proteína</span>
                <span className="font-medium">
                  {plan.proteina_g}g <span className="text-muted-foreground">({plan.proteina_pct}%)</span>
                </span>
              </div>
              <Progress value={plan.proteina_pct} className="h-2" />
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Carboidrato</span>
                <span className="font-medium">
                  {plan.carboidrato_g}g <span className="text-muted-foreground">({plan.carboidrato_pct}%)</span>
                </span>
              </div>
              <Progress value={plan.carboidrato_pct} className="h-2" />
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gordura</span>
                <span className="font-medium">
                  {plan.gordura_g}g <span className="text-muted-foreground">({plan.gordura_pct}%)</span>
                </span>
              </div>
              <Progress value={plan.gordura_pct} className="h-2" />
            </div>
          </div>

          {/* Tip */}
          {randomTip && (
            <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{randomTip}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              disabled
              title="Em breve"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditMacrosModal 
        open={showEditModal}
        onOpenChange={setShowEditModal}
        peso={peso}
        sexo={sexo}
      />
    </>
  );
}
