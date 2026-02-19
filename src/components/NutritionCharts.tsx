import { useApp } from '@/contexts/AppContext';
import { useMacroPlan } from '@/hooks/useMacroPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = {
  protein: 'hsl(142, 70%, 45%)',
  carbs: 'hsl(24, 95%, 53%)',
  fat: 'hsl(0, 72%, 51%)',
};

export function NutritionCharts() {
  const { nutritionalData } = useApp();
  const { plan, isLoading: planLoading } = useMacroPlan();

  // Loading state
  if (planLoading) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-8 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando gráficos...</p>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!plan && !nutritionalData) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            📊 Os gráficos aparecerão após você responder o questionário
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use plan from DB if available, otherwise fallback to calculated nutritionalData
  const proteinaPct = plan?.proteina_pct || 30;
  const carboidratoPct = plan?.carboidrato_pct || 40;
  const gorduraPct = plan?.gordura_pct || 30;

  const proteinaG = plan?.proteina_g || nutritionalData?.proteinas || 0;
  const carboidratoG = plan?.carboidrato_g || nutritionalData?.carboidratos || 0;
  const gorduraG = plan?.gordura_g || nutritionalData?.gorduras || 0;

  const pieData = [
    { name: 'Proteínas', value: proteinaPct, color: COLORS.protein },
    { name: 'Carboidratos', value: carboidratoPct, color: COLORS.carbs },
    { name: 'Gorduras', value: gorduraPct, color: COLORS.fat },
  ];

  const barData = [
    { name: 'Proteínas', gramas: proteinaG, fill: COLORS.protein },
    { name: 'Carboidratos', gramas: carboidratoG, fill: COLORS.carbs },
    { name: 'Gorduras', gramas: gorduraG, fill: COLORS.fat },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="border-0 shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            🥧 Distribuição de Macronutrientes
            {plan?.is_customized && (
              <span className="text-xs font-normal text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                Personalizado
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="border-0 shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            📊 Metas em Gramas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tickFormatter={(value) => `${value}g`} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}g`, 'Meta']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="gramas" 
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
