import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBeveragesByType, searchFoods } from '@/data/foodsDatabase';
import { Beverage, MealItem, Food } from '@/types';
import { formatNumber } from '@/utils/nutritionalCalculations';
import { useAllergyAlert } from '@/hooks/useAllergyAlert';
import { CustomFood } from '@/hooks/useCustomFoods';
import { getCustomFoodsByCategory, searchCustomFoodsConverted } from '@/utils/customFoodAdapter';
import { Badge } from '@/components/ui/badge';
import { Plus, Droplets, Search, X, AlertTriangle, Star, Pencil, Trash2 } from 'lucide-react';

interface BeveragesSectionProps {
  mealItems: MealItem[];
  hydrationGoal: number;
  onAdd: (item: MealItem) => void;
  onRemove: (id: string) => void;
  currentMealTypeId: string;
  customFoods: CustomFood[];
  onEditCustomFood: (food: Food) => void;
  onDeleteCustomFood: (food: Food) => void;
}

const BEVERAGE_TYPES = [
  { id: 'agua', label: 'Água', icon: '💧' },
  { id: 'cafe', label: 'Café/Chá', icon: '☕' },
  { id: 'suco_natural', label: 'Sucos', icon: '🍊' },
  { id: 'refrigerante', label: 'Refri', icon: '🥤' },
  { id: 'leite', label: 'Leites', icon: '🥛' },
  { id: 'lacteo', label: 'Iogurtes', icon: '🥛' },
];

// Map subcategoria to tipoBebida for filtering custom beverages
const SUBCATEGORIA_TO_TAB: Record<string, string> = {
  agua_isotonico: 'agua',
  cha_cafe: 'cafe',
  suco: 'suco_natural',
  refrigerante: 'refrigerante',
  leite: 'leite',
  iogurte_lacteo: 'lacteo',
  bebida_alcoolica: 'suco_natural',
};

export function BeveragesSection({ mealItems, hydrationGoal, onAdd, onRemove, currentMealTypeId, customFoods, onEditCustomFood, onDeleteCustomFood }: BeveragesSectionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeverage, setSelectedBeverage] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('250');
  const [activeTab, setActiveTab] = useState('agua');
  
  const { checkAndAlertAllergy } = useAllergyAlert();

  // Get custom beverages
  const customBeverages = useMemo(() => 
    getCustomFoodsByCategory(customFoods, 'bebida'),
    [customFoods]
  );

  // Filter only beverages from meal items
  const beverageItems = mealItems.filter(item => item.food.categoria === 'Bebidas');
  
  // Calculate totals
  const totalLiquid = beverageItems.reduce((sum, item) => sum + item.quantidade, 0);
  const totalCalories = beverageItems.reduce((sum, item) => 
    sum + (item.food.calorias * item.quantidade) / 100, 0
  );
  const progressPercentage = (totalLiquid / hydrationGoal) * 100;

  // Get beverages by type or search - combined with custom beverages
  const availableBeverages = useMemo(() => {
    if (searchQuery) {
      const staticResults = searchFoods(searchQuery, 'Bebidas');
      const customResults = searchCustomFoodsConverted(customFoods, searchQuery, 'bebida');
      return [...customResults, ...staticResults];
    }
    
    const staticResults = getBeveragesByType(activeTab as Beverage['tipoBebida']);
    // Filter custom beverages by the active tab
    const customFiltered = customBeverages.filter(bev => {
      const originalCustomFood = customFoods.find(cf => cf.id === bev.id);
      if (!originalCustomFood) return false;
      const mappedTab = SUBCATEGORIA_TO_TAB[originalCustomFood.subcategoria];
      return mappedTab === activeTab;
    });
    
    return [...customFiltered, ...staticResults];
  }, [searchQuery, activeTab, customFoods, customBeverages]);

  const handleAdd = () => {
    if (!selectedBeverage || !quantity) return;

    // Check for allergies
    checkAndAlertAllergy(selectedBeverage);

    const newItem: MealItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      food: selectedBeverage,
      quantidade: Number(quantity),
      mealTypeId: currentMealTypeId,
    };

    onAdd(newItem);
    setOpen(false);
    setSelectedBeverage(null);
    setQuantity('250');
    setSearchQuery('');
  };

  const previewCalories = selectedBeverage ? (selectedBeverage.calorias * Number(quantity)) / 100 : 0;
  const isHighCalorie = previewCalories > 50;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Hidratação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hydration Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Meta: {formatNumber(hydrationGoal)}ml</span>
            <span className={progressPercentage >= 100 ? 'text-green-500' : 'text-muted-foreground'}>
              {formatNumber(Math.round(totalLiquid))}ml consumido
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Faltam: {formatNumber(Math.max(0, hydrationGoal - totalLiquid))}ml</span>
            <span>Calorias: {formatNumber(Math.round(totalCalories))} kcal</span>
          </div>
        </div>

        {/* Beverage breakdown */}
        {beverageItems.length > 0 && (
          <div className="space-y-2">
            {beverageItems.map((item) => {
              const calories = (item.food.calorias * item.quantidade) / 100;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm group"
                >
                  <div className="flex items-center gap-2">
                    <span>💧</span>
                    <span>{item.food.nome}</span>
                    <span className="text-muted-foreground">({item.quantidade}ml)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatNumber(Math.round(calories))} kcal</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemove(item.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add beverage button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Bebida
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Adicionar Bebida
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar bebida..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedBeverage(null);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Category Tabs */}
              {!searchQuery && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-6 h-auto">
                    {BEVERAGE_TYPES.map((type) => (
                      <TabsTrigger key={type.id} value={type.id} className="text-xs py-2">
                        <span className="mr-1">{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {/* Beverage List */}
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                {availableBeverages.length > 0 ? (
                  availableBeverages.map((bev) => (
                    <div
                      key={bev.id}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg text-sm transition-colors
                        ${selectedBeverage?.id === bev.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted'
                        }
                      `}
                    >
                      <button
                        onClick={() => {
                          setSelectedBeverage(bev);
                          if (bev.porcaoPadrao) setQuantity(String(bev.porcaoPadrao));
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium flex-1">{bev.nome}</span>
                          {bev.isCustom && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              <Star className="w-3 h-3 mr-0.5" />
                              Meu
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bev.calorias} kcal/100ml
                          {bev.porcaoDescricao && ` • ${bev.porcaoDescricao}`}
                        </div>
                      </button>
                      {bev.isCustom && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCustomFood(bev);
                              setOpen(false);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomFood(bev);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhuma bebida encontrada
                  </p>
                )}
              </div>

              {/* Quantity */}
              {selectedBeverage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume (ml)</label>
                  <div className="flex gap-2">
                    {[200, 250, 300, 350, 500].map((vol) => (
                      <Button
                        key={vol}
                        variant={quantity === String(vol) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuantity(String(vol))}
                      >
                        {vol}ml
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="50"
                    max="2000"
                  />
                </div>
              )}

              {/* Preview */}
              {selectedBeverage && quantity && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="font-medium">{selectedBeverage.nome} ({quantity}ml)</p>
                  <p className="text-sm">
                    🔥 {formatNumber(Math.round(previewCalories))} kcal
                  </p>
                  
                  {isHighCalorie && (
                    <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-700 dark:text-amber-400 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Bebida calórica!</p>
                        <p>💡 Alternativa: Água ou chá sem açúcar</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleAdd}
                disabled={!selectedBeverage || !quantity}
                className="w-full"
              >
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
