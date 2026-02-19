import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, User, Utensils, AlertTriangle, Shield } from 'lucide-react';
import { useState } from 'react';
import { useRestrictions } from '@/hooks/useRestrictions';
import { RestrictionBadge, RestrictionBadgeGroup } from '@/components/restrictions/RestrictionBadge';
import { RESTRICTION_CATEGORIES, RestrictionCategory } from '@/types/restrictions';

export function BiometricData() {
  const { client } = useApp();
  const [isOpen, setIsOpen] = useState(true);

  if (!client) return null;

  const biometricItems = [
    { label: 'Sexo', value: client.sexo },
    { label: 'Idade', value: `${client.idade} anos` },
    { label: 'Altura', value: `${client.altura} cm` },
    { label: 'Peso', value: `${client.peso} kg` },
    { label: 'Circunferência Abdominal', value: `${client.circunferenciaAbdominal} cm` },
    { label: 'Nível de Atividade', value: client.nivelAtividade },
    { label: 'Pratica Exercício', value: client.praticaExercicio ? `Sim (${client.frequenciaExercicio}x/semana)` : 'Não' },
    { label: 'Objetivo', value: client.objetivo },
  ];

  return (
    <Card className="border-0 shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                📊 Seus Dados Biométricos
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {biometricItems.map((item) => (
                <div 
                  key={item.label} 
                  className="flex justify-between items-center p-4 bg-muted/30 rounded-lg gap-4"
                >
                  <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                  <span className="font-semibold text-sm text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Helper to parse comma-separated allergies into array
function parseAllergies(allergiesStr: string | undefined): string[] {
  if (!allergiesStr || allergiesStr.toLowerCase() === 'nenhuma') return [];
  return allergiesStr
    .split(/[,;]/)
    .map(a => a.trim())
    .filter(a => a.length > 0);
}

export function PreferencesData() {
  const { client } = useApp();
  const { userRestrictions, loading: restrictionsLoading } = useRestrictions();
  const [isOpen, setIsOpen] = useState(false);

  if (!client) return null;

  const preferences = parseAllergies(client.preferenciasAlimentares);

  // Group restrictions by category
  const groupedRestrictions = userRestrictions.reduce((acc, r) => {
    const cat = r.category as RestrictionCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<RestrictionCategory, typeof userRestrictions>);

  const categoryOrder: RestrictionCategory[] = ['allergy', 'intolerance', 'health', 'dietary', 'religious'];
  const hasRestrictions = userRestrictions.length > 0;

  return (
    <Card className="border-0 shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                🛡️ Suas Restrições
                {hasRestrictions && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20">
                    {userRestrictions.length}
                  </Badge>
                )}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Restrictions by Category */}
            {restrictionsLoading ? (
              <div className="text-center py-4 text-muted-foreground">Carregando restrições...</div>
            ) : hasRestrictions ? (
              <div className="space-y-4">
                {categoryOrder.map((cat) => {
                  const restrictions = groupedRestrictions[cat];
                  if (!restrictions || restrictions.length === 0) return null;

                  const categoryInfo = RESTRICTION_CATEGORIES[cat];

                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span>{categoryInfo.icon}</span>
                        <span className={categoryInfo.textClass}>{categoryInfo.label}</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {restrictions.map((r) => (
                          <RestrictionBadge key={r.id} restriction={r} size="md" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma restrição alimentar cadastrada
              </div>
            )}

            {/* Legacy: Preferences */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Preferências Alimentares
              </h4>
              {preferences.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/20 text-foreground border-0 px-3 py-1.5">
                      {pref}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Não informado</p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
