import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSweetsByType, searchFoods, sweets } from '@/data/foodsDatabase';
import { Sweet, MealItem, Food, NutritionalData } from '@/types';
import { formatNumber } from '@/utils/nutritionalCalculations';
import { useAllergyAlert } from '@/hooks/useAllergyAlert';
import { CustomFood } from '@/hooks/useCustomFoods';
import { getCustomFoodsByCategory, searchCustomFoodsConverted } from '@/utils/customFoodAdapter';
import { Badge } from '@/components/ui/badge';
import { Plus, Cake, Search, AlertTriangle, Check, Sparkles, Edit2, Star, Pencil, Trash2 } from 'lucide-react';

interface SweetsSectionProps {
  nutritionalData: NutritionalData;
  currentCalories: number;
  onAdd: (item: MealItem) => void;
  mealTypes: { id: string; nome: string; icone: string }[];
  defaultMealTypeId: string;
  customFoods: CustomFood[];
  onEditCustomFood: (food: Food) => void;
  onDeleteCustomFood: (food: Food) => void;
}

// Map sweet types to appropriate emoji icons
const SWEET_ICON_MAP: Record<string, string> = {
  chocolate: '🍫',
  bolo: '🎂',
  sobremesa: '🍮',
  sorvete: '🍦',
  biscoito: '🍪',
  doce_caseiro: '🍬',
};

function getSweetIcon(sweet: Food): string {
  const tipoDoce = (sweet as any).tipoDoce as string | undefined;
  if (tipoDoce && SWEET_ICON_MAP[tipoDoce]) {
    return SWEET_ICON_MAP[tipoDoce];
  }
  // Fallback based on name
  const nome = sweet.nome.toLowerCase();
  if (nome.includes('chocolate') || nome.includes('brigadeiro') || nome.includes('trufa')) return '🍫';
  if (nome.includes('bolo') || nome.includes('brownie')) return '🎂';
  if (nome.includes('sorvete') || nome.includes('picolé')) return '🍦';
  if (nome.includes('biscoito') || nome.includes('cookie') || nome.includes('wafer')) return '🍪';
  if (nome.includes('pudim') || nome.includes('mousse') || nome.includes('torta')) return '🍮';
  return '🍰';
}

const SWEET_TYPES = [
  { id: 'chocolate', label: 'Chocolates', icon: '🍫' },
  { id: 'bolo', label: 'Bolos', icon: '🎂' },
  { id: 'sobremesa', label: 'Sobremesas', icon: '🍮' },
  { id: 'sorvete', label: 'Sorvetes', icon: '🍦' },
  { id: 'biscoito', label: 'Biscoitos', icon: '🍪' },
  { id: 'doce_caseiro', label: 'Caseiros', icon: '🍬' },
];

// Map subcategoria to tipoDoce for filtering custom sweets
const SUBCATEGORIA_TO_TYPE: Record<string, string> = {
  chocolate: 'chocolate',
  bolos_biscoitos: 'bolo',
  pudim_gelatina: 'sobremesa',
  sorvete: 'sorvete',
  candy_gomas: 'biscoito',
  doces_caseiros: 'doce_caseiro',
};

const FAVORITE_SWEET_KEY = 'easyeat_favorite_sweet';

export function SweetsSection({
  nutritionalData,
  currentCalories,
  onAdd,
  mealTypes,
  defaultMealTypeId,
  customFoods,
  onEditCustomFood,
  onDeleteCustomFood,
}: SweetsSectionProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSweet, setSelectedSweet] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealTypeId, setMealTypeId] = useState(defaultMealTypeId);
  const [activeType, setActiveType] = useState<string>('chocolate');
  const [showWarning, setShowWarning] = useState(false);
  const [favoriteSweet, setFavoriteSweet] = useState<Food | null>(null);

  const { checkAndAlertAllergy } = useAllergyAlert();

  // Get custom sweets
  const customSweets = useMemo(() => 
    getCustomFoodsByCategory(customFoods, 'doce'),
    [customFoods]
  );

  // All sweets combined (for favorite selection)
  const allSweets = useMemo(() => [...customSweets, ...sweets], [customSweets]);

  // Load favorite sweet from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(FAVORITE_SWEET_KEY);
    if (savedId) {
      // Check custom sweets first, then static sweets
      const foundCustom = customSweets.find(s => s.id === savedId);
      const foundStatic = sweets.find(s => s.id === savedId);
      if (foundCustom) setFavoriteSweet(foundCustom);
      else if (foundStatic) setFavoriteSweet(foundStatic);
    }
    // If no favorite, set default to first chocolate
    if (!savedId && allSweets.length > 0) {
      const defaultSweet = allSweets.find(s => (s as any).tipoDoce === 'chocolate') || allSweets[0];
      setFavoriteSweet(defaultSweet);
    }
  }, [customSweets, allSweets]);

  const displayedSweet = favoriteSweet || allSweets[0];
  const sweetIcon = displayedSweet ? getSweetIcon(displayedSweet) : '🍰';
  
  const remainingCalories = nutritionalData.metaDiaria - currentCalories;

  // Get sweets by type or search - combined with custom sweets
  const availableSweets = useMemo(() => {
    if (searchQuery) {
      const staticResults = searchFoods(searchQuery, 'Doces');
      const customResults = searchCustomFoodsConverted(customFoods, searchQuery, 'doce');
      return [...customResults, ...staticResults];
    }
    
    const staticResults = getSweetsByType(activeType as Sweet['tipoDoce']);
    // Filter custom sweets by the active type
    const customFiltered = customSweets.filter(sweet => {
      const originalCustomFood = customFoods.find(cf => cf.id === sweet.id);
      if (!originalCustomFood) return false;
      const mappedType = SUBCATEGORIA_TO_TYPE[originalCustomFood.subcategoria];
      return mappedType === activeType;
    });
    
    return [...customFiltered, ...staticResults];
  }, [searchQuery, activeType, customFoods, customSweets]);

  const previewCalories = selectedSweet ? (selectedSweet.calorias * Number(quantity)) / 100 : 0;
  const wouldExceed = currentCalories + previewCalories > nutritionalData.metaDiaria;
  const exceedAmount = Math.round(currentCalories + previewCalories - nutritionalData.metaDiaria);

  const handleSelectFavorite = (sweet: Food) => {
    setFavoriteSweet(sweet);
    localStorage.setItem(FAVORITE_SWEET_KEY, sweet.id);
    setEditOpen(false);
    setSearchQuery('');
  };

  const openAddDialogForSweet = (sweet: Food) => {
    setSelectedSweet(sweet);
    setQuantity(String(sweet.porcaoPadrao || 100));
    const tipoDoce = (sweet as any).tipoDoce as string | undefined;
    if (tipoDoce) setActiveType(tipoDoce);
    setSearchQuery('');
    setShowWarning(false);
    setOpen(true);
  };

  const handleAdd = (sweet: Food, qty: number) => {
    // Check for allergies first
    checkAndAlertAllergy(sweet);

    const sweetCalories = (sweet.calorias * qty) / 100;
    const willExceed = currentCalories + sweetCalories > nutritionalData.metaDiaria;

    if (willExceed && !showWarning) {
      setSelectedSweet(sweet);
      setQuantity(String(qty));
      setShowWarning(true);
      return;
    }

    const newItem: MealItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      food: sweet,
      quantidade: qty,
      mealTypeId,
    };

    onAdd(newItem);
    setOpen(false);
    setSelectedSweet(null);
    setQuantity('100');
    setSearchQuery('');
    setShowWarning(false);
  };

  const handleConfirmAdd = () => {
    if (selectedSweet) {
      // Check for allergies
      checkAndAlertAllergy(selectedSweet);

      const newItem: MealItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        food: selectedSweet,
        quantidade: Number(quantity),
        mealTypeId,
      };
      onAdd(newItem);
      setOpen(false);
      setSelectedSweet(null);
      setQuantity('100');
      setShowWarning(false);
    }
  };

  return (
    <>
      {/* Favorite Sweet Card */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-amber-50 dark:from-pink-950/30 dark:to-amber-950/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {sweetIcon} Doce Favorito
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{sweetIcon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{displayedSweet.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {displayedSweet.porcaoPadrao || 100}{displayedSweet.unidade} • {formatNumber(displayedSweet.calorias)} kcal/100g
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {displayedSweet.proteinas}g prot • {displayedSweet.carboidratos}g carbs
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openAddDialogForSweet(displayedSweet)}
              disabled={remainingCalories < displayedSweet.calorias * 0.3}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          {remainingCalories > 0 && remainingCalories < displayedSweet.calorias && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              💡 Você tem {formatNumber(Math.round(remainingCalories))} kcal disponíveis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Favorite Sweet Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              Escolher Doce Favorito
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar doce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Pills */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                {SWEET_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={activeType === type.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveType(type.id)}
                  >
                    {type.icon} {type.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Sweet List - includes custom sweets */}
            <div className="space-y-1 max-h-60 overflow-y-auto border rounded-lg p-2">
              {availableSweets.map((sweet) => (
                <button
                  key={sweet.id}
                  onClick={() => handleSelectFavorite(sweet)}
                  className={`
                    w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-3
                    ${favoriteSweet?.id === sweet.id
                      ? 'bg-primary/20 border border-primary'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <span className="text-2xl">{getSweetIcon(sweet)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{sweet.nome}</span>
                      {sweet.isCustom && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          <Star className="w-3 h-3 mr-0.5" />
                          Meu
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sweet.calorias} kcal/100g
                    </div>
                  </div>
                  {favoriteSweet?.id === sweet.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sweets Browser Dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); setShowWarning(false); }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Cake className="w-4 h-4 mr-2" />
            Explorar Doces
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" />
              Doces
            </DialogTitle>
          </DialogHeader>

          {showWarning ? (
            <div className="space-y-4">
              {/* Meal Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Refeição</label>
                <Select value={mealTypeId} onValueChange={setMealTypeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span>{type.icone}</span>
                          {type.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-700 dark:text-amber-400">Atenção!</h4>
                    <p className="text-sm mt-1">
                      Adicionar <strong>{selectedSweet?.nome}</strong> excederia sua meta em{' '}
                      <strong>{formatNumber(exceedAmount)} kcal</strong>!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Opções:</p>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Reduce portion to fit
                    const maxQty = Math.floor((remainingCalories / (selectedSweet?.calorias || 1)) * 100);
                    if (maxQty > 10) {
                      setQuantity(String(maxQty));
                      setShowWarning(false);
                    }
                  }}
                >
                  ✂️ Reduzir porção para caber nas calorias
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowWarning(false);
                    setSelectedSweet(null);
                  }}
                >
                  🔄 Escolher um doce menor
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleConfirmAdd}>
                  Adicionar mesmo assim
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Meal Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Refeição</label>
                <Select value={mealTypeId} onValueChange={setMealTypeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span>{type.icone}</span>
                          {type.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar doce..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedSweet(null);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Category Pills */}
              {!searchQuery && (
                <div className="flex flex-wrap gap-2">
                  {SWEET_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant={activeType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveType(type.id)}
                    >
                      {type.icon} {type.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Sweet List */}
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                {availableSweets.length > 0 ? (
                  availableSweets.map((sweet) => (
                    <button
                      key={sweet.id}
                      onClick={() => {
                        setSelectedSweet(sweet);
                        if (sweet.porcaoPadrao) setQuantity(String(sweet.porcaoPadrao));
                      }}
                      className={`
                        w-full text-left p-2 rounded-lg text-sm transition-colors
                        ${selectedSweet?.id === sweet.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium flex-1">{sweet.nome}</span>
                        {sweet.isCustom && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            <Star className="w-3 h-3 mr-0.5" />
                            Meu
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sweet.calorias} kcal/100g
                        {sweet.porcaoDescricao && ` • ${sweet.porcaoDescricao}`}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhum doce encontrado
                  </p>
                )}
              </div>

              {/* Quantity */}
              {selectedSweet && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade (g)</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="10"
                    max="500"
                  />
                </div>
              )}

              {/* Preview */}
              {selectedSweet && quantity && (
                <div className={`p-3 rounded-lg space-y-1 ${wouldExceed ? 'bg-amber-500/10' : 'bg-muted/50'}`}>
                  <p className="font-medium">{selectedSweet.nome} ({quantity}g)</p>
                  <p className="text-sm">
                    🔥 {formatNumber(Math.round(previewCalories))} kcal
                  </p>
                  {wouldExceed ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Excede meta em {formatNumber(exceedAmount)} kcal
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Cabe nas suas calorias!
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={() => selectedSweet && handleAdd(selectedSweet, Number(quantity))}
                disabled={!selectedSweet || !quantity}
                className="w-full"
              >
                Adicionar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
