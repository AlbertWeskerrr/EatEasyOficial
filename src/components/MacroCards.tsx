import { useApp } from '@/contexts/AppContext';
import { useMacroPlan } from '@/hooks/useMacroPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/utils/nutritionalCalculations';
import { Flame, Drumstick, Wheat, Droplets, Info, Loader2 } from 'lucide-react';

interface MacroCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  subtitle: string;
  color: string;
  delay: number;
}

function MacroCard({ icon, title, value, unit, subtitle, color, delay }: MacroCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className={`absolute inset-0 opacity-5 ${color}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color} text-white`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">
            {formatNumber(value)}
          </span>
          <span className="text-lg font-medium text-muted-foreground">{unit}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function MacroCards() {
  const { nutritionalData } = useApp();
  const { plan, isLoading: planLoading } = useMacroPlan();

  // Loading state
  if (planLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">📊 Suas Metas Diárias</h2>
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando metas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state - prioritize plan from DB, fallback to nutritionalData
  if (!plan && !nutritionalData) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">📊 Suas Metas Diárias</h2>
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Complete o questionário para ver suas metas personalizadas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use plan from DB if available, otherwise fallback to calculated nutritionalData
  const calorias = plan?.calorias_alvo || nutritionalData?.metaDiaria || 0;
  const proteinas = plan?.proteina_g || nutritionalData?.proteinas || 0;
  const carboidratos = plan?.carboidrato_g || nutritionalData?.carboidratos || 0;
  const gorduras = plan?.gordura_g || nutritionalData?.gorduras || 0;

  // Percentages from plan or defaults
  const proteinaPct = plan?.proteina_pct || 30;
  const carboidratoPct = plan?.carboidrato_pct || 40;
  const gorduraPct = plan?.gordura_pct || 30;

  // TMB and GET for tooltip - use plan data or fallback
  const tmb = nutritionalData?.tmb || Math.round(calorias / 1.5);
  const get = nutritionalData?.get || calorias;

  const cards = [
    {
      icon: <Flame className="w-5 h-5" />,
      title: 'Meta Calórica',
      value: calorias,
      unit: 'kcal',
      subtitle: plan?.objetivo ? `Objetivo: ${plan.objetivo}` : 'Seu consumo diário alvo',
      color: 'bg-orange-500',
    },
    {
      icon: <Drumstick className="w-5 h-5" />,
      title: 'Proteínas',
      value: proteinas,
      unit: 'g',
      subtitle: `${proteinaPct}% das calorias`,
      color: 'bg-chart-protein',
    },
    {
      icon: <Wheat className="w-5 h-5" />,
      title: 'Carboidratos',
      value: carboidratos,
      unit: 'g',
      subtitle: `${carboidratoPct}% das calorias`,
      color: 'bg-chart-carbs',
    },
    {
      icon: <Droplets className="w-5 h-5" />,
      title: 'Gorduras',
      value: gorduras,
      unit: 'g',
      subtitle: `${gorduraPct}% das calorias`,
      color: 'bg-chart-fat',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">📊 Suas Metas Diárias</h2>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              <strong>Como calculamos:</strong><br />
              1. TMB (Harris-Benedict): {formatNumber(tmb)} kcal<br />
              2. GET (TMB × fator atividade): {formatNumber(get)} kcal<br />
              3. Meta ajustada pelo objetivo: {formatNumber(calorias)} kcal
              {plan?.is_customized && <><br /><em className="text-yellow-500">⚙️ Personalizado por você</em></>}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <MacroCard key={card.title} {...card} delay={index * 100} />
        ))}
      </div>
    </div>
  );
}
