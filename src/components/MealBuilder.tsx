import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { searchFoods, getFoodsByCategory } from '@/data/foodsDatabase';
import { Food, MealItem } from '@/types';
import { calculateProgress, getProgressMessage, formatNumber } from '@/utils/nutritionalCalculations';
import { useRestrictionCheck } from '@/hooks/useRestrictionCheck';
import { RestrictionWarningDialog } from '@/components/restrictions/RestrictionWarningDialog';
import { RestrictionBadge } from '@/components/restrictions/RestrictionBadge';
import { useRestrictions } from '@/hooks/useRestrictions';
import { AddCustomFoodModal } from '@/components/foods/AddCustomFoodModal';
import { EditCustomFoodModal } from '@/components/foods/EditCustomFoodModal';
import { useCustomFoods, CustomFood, CreateCustomFoodInput } from '@/hooks/useCustomFoods';
import { getCustomFoodsByCategory, searchCustomFoodsConverted } from '@/utils/customFoodAdapter';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, Trash2, Search, Utensils, Droplets, Cake, PlusSquare, Star, Pencil } from 'lucide-react';
import { DietSwitcher } from '@/components/DietSwitcher';
import { MealTypeManager } from '@/components/MealTypeManager';
import { BeveragesSection } from '@/components/BeveragesSection';
import { SweetsSection } from '@/components/SweetsSection';
import { useExportDietPDFCanvas } from '@/hooks/useExportDietPDFCanvas';

const categories: Food['categoria'][] = ['Proteínas', 'Grãos', 'Frutas', 'Verduras', 'Laticínios', 'Oleaginosas'];

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

function ProgressBar({ label, current, target, unit, color }: ProgressBarProps) {
  const percentage = calculateProgress(current, target);
  const message = getProgressMessage(percentage);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm gap-4">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground whitespace-nowrap">
          {formatNumber(Math.round(current))} / {formatNumber(target)} {unit}
          {message && <span className="ml-2">{message}</span>}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="h-1">
        {percentage > 100 && (
          <div className="text-xs text-destructive">
            ⚠️ Excedido em {formatNumber(Math.round(current - target))} {unit}
          </div>
        )}
      </div>
    </div>
  );
}

interface AddFoodDialogProps {
  onAdd: (item: MealItem) => void;
  mealTypes: { id: string; nome: string; icone: string }[];
  defaultMealTypeId: string;
  customFoods: CustomFood[];
  onEditCustomFood: (food: Food) => void;
  onDeleteCustomFood: (food: Food) => void;
}

function AddFoodDialog({ onAdd, mealTypes, defaultMealTypeId, customFoods, onEditCustomFood, onDeleteCustomFood }: AddFoodDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Food['categoria'] | 'all'>('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealTypeId, setMealTypeId] = useState(defaultMealTypeId);
  
  const { 
    checkAndMaybeWarn, 
    showWarning, 
    currentMatches, 
    currentFoodName, 
    handleConfirmAdd, 
    handleCancel 
  } = useRestrictionCheck();

  // Get custom foods for 'alimento' category
  const customAlimentos = useMemo(() => 
    getCustomFoodsByCategory(customFoods, 'alimento'),
    [customFoods]
  );

  // Combine static foods with custom foods
  const availableFoods = useMemo(() => {
    if (searchQuery) {
      const staticResults = searchFoods(searchQuery, category === 'all' ? undefined : category);
      const customResults = searchCustomFoodsConverted(customFoods, searchQuery, 'alimento')
        .filter(f => category === 'all' || f.categoria === category);
      // Custom foods first, then static
      return [...customResults, ...staticResults];
    }
    
    if (category && category !== 'all') {
      const staticResults = getFoodsByCategory(category);
      const customResults = customAlimentos.filter(f => f.categoria === category);
      return [...customResults, ...staticResults];
    }
    
    return [];
  }, [searchQuery, category, customFoods, customAlimentos]);

  const previewCalories = selectedFood ? (selectedFood.calorias * Number(quantity)) / 100 : 0;
  const previewProtein = selectedFood ? (selectedFood.proteinas * Number(quantity)) / 100 : 0;
  const previewCarbs = selectedFood ? (selectedFood.carboidratos * Number(quantity)) / 100 : 0;
  const previewFat = selectedFood ? (selectedFood.gorduras * Number(quantity)) / 100 : 0;

  const doAdd = () => {
    if (!selectedFood || !quantity) return;

    const newItem: MealItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      food: selectedFood,
      quantidade: Number(quantity),
      mealTypeId: mealTypeId,
    };

    onAdd(newItem);
    setOpen(false);
    setSearchQuery('');
    setCategory('all');
    setSelectedFood(null);
    setQuantity('100');
  };

  const handleAdd = () => {
    if (!selectedFood || !quantity) return;

    // Check for restrictions - if warning shown, wait for user response
    const warningShown = checkAndMaybeWarn(selectedFood, doAdd);
    
    if (!warningShown) {
      // No restriction matched, add directly
      doAdd();
    }
  };

  return (
    <>
      <RestrictionWarningDialog
        open={showWarning}
        onOpenChange={(open) => !open && handleCancel()}
        foodName={currentFoodName}
        matches={currentMatches}
        onConfirmAdd={handleConfirmAdd}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gradient-theme text-primary-foreground font-semibold h-12">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Alimento
          </Button>
        </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento</DialogTitle>
        </DialogHeader>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar Alimento</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Digite para buscar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedFood(null);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={(v) => {
              setCategory(v as Food['categoria'] | 'all');
              setSelectedFood(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Food List */}
          {(searchQuery || (category && category !== 'all')) && availableFoods.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              {availableFoods.slice(0, 20).map((food) => (
                <div
                  key={food.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    selectedFood?.id === food.id 
                      ? 'bg-primary/20 border border-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedFood(food);
                      if (food.porcaoPadrao) setQuantity(String(food.porcaoPadrao));
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm flex-1">{food.nome}</span>
                      {food.isCustom && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          <Star className="w-3 h-3 mr-0.5" />
                          Meu
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {food.calorias} kcal/100{food.unidade} • {food.categoria}
                    </div>
                  </button>
                  {food.isCustom && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCustomFood(food);
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
                          onDeleteCustomFood(food);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          {selectedFood && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantidade ({selectedFood.unidade})
                {selectedFood.porcaoDescricao && (
                  <span className="text-muted-foreground ml-2">
                    Sugestão: {selectedFood.porcaoPadrao}{selectedFood.unidade} ({selectedFood.porcaoDescricao})
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-12"
              />
            </div>
          )}

          {/* Preview */}
          {selectedFood && quantity && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium">Você está adicionando:</p>
              <p className="text-lg font-bold">{selectedFood.nome} ({quantity}{selectedFood.unidade})</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>🔥 {formatNumber(Math.round(previewCalories))} kcal</span>
                <span>💪 {formatNumber(Math.round(previewProtein))}g proteína</span>
                <span>🌾 {formatNumber(Math.round(previewCarbs))}g carbos</span>
                <span>🥑 {formatNumber(Math.round(previewFat))}g gordura</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleAdd} 
            disabled={!selectedFood || !quantity}
            className="w-full gradient-theme text-primary-foreground font-semibold"
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function MealBuilder() {
  const { 
    client,
    nutritionalData, 
    mealItems, 
    mealTypes,
    dailyProgress, 
    hydrationGoal,
    dietState,
    activeDiet,
    addMealItem, 
    removeMealItem, 
    clearMeals,
    switchDiet,
    renameDiet,
    clearDiet,
    cloneDiet,
    addMealType,
    updateMealType,
    removeMealType,
    reorderMealTypes,
  } = useApp();

  // PDF export hook
  const { exportToPDF, isExportingDietId } = useExportDietPDFCanvas();
  // Custom foods hook at top level
  const { 
    customFoods, 
    deleteCustomFood, 
    updateCustomFood,
    fetchCustomFoods 
  } = useCustomFoods();

  const [activeTab, setActiveTab] = useState('refeicoes');
  const [showAddCustomFood, setShowAddCustomFood] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { checkFood } = useRestrictions();

  if (!nutritionalData) return null;

  const groupedMeals = mealTypes.map(type => ({
    ...type,
    items: mealItems.filter(item => item.mealTypeId === type.id),
  }));

  const defaultMealTypeId = mealTypes[0]?.id || 'cafe';

  // Handle editing custom food
  const handleEditCustomFood = (food: Food) => {
    const customFood = customFoods.find(cf => cf.id === food.id);
    if (customFood) {
      setEditingFood(customFood);
      setShowEditModal(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteCustomFood = (food: Food) => {
    setFoodToDelete(food);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (foodToDelete) {
      await deleteCustomFood(foodToDelete.id);
      setShowDeleteConfirm(false);
      setFoodToDelete(null);
    }
  };

  return (
    <div className="space-y-6">

      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
        <DietSwitcher
          diets={dietState.diets}
          activeDietId={dietState.activeDietId}
          onSwitch={switchDiet}
          onRename={renameDiet}
          onClear={clearDiet}
          onClone={cloneDiet}
          onExportPDF={(dietId) => {
            const diet = dietState.diets.find((d) => d.id === dietId);
            if (!diet) return;

            const debug =
              typeof window !== 'undefined' &&
              localStorage.getItem('pdf_export_debug') === '1';

            exportToPDF({
              diet,
              dietName: diet.nome || 'Dieta',
              profileName: client?.nome,
              debug,
            });
          }}
          isExportingDietId={isExportingDietId}
        />
      </div>

      {/* Main Card */}
      <Card id={`diet-content-${activeDiet?.id}`} className="border-0 shadow-lg opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              🍽️ Construtor de Dieta
            </CardTitle>
            <MealTypeManager
              mealTypes={mealTypes}
              onAdd={addMealType}
              onUpdate={updateMealType}
              onRemove={removeMealType}
              onReorder={reorderMealTypes}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bars */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
            <ProgressBar 
              label="🔥 Calorias" 
              current={dailyProgress.calorias} 
              target={nutritionalData.metaDiaria} 
              unit="kcal"
              color="bg-orange-500"
            />
            <ProgressBar 
              label="💪 Proteínas" 
              current={dailyProgress.proteinas} 
              target={nutritionalData.proteinas} 
              unit="g"
              color="bg-green-500"
            />
            <ProgressBar 
              label="🌾 Carboidratos" 
              current={dailyProgress.carboidratos} 
              target={nutritionalData.carboidratos} 
              unit="g"
              color="bg-amber-500"
            />
            <ProgressBar 
              label="🥑 Gorduras" 
              current={dailyProgress.gorduras} 
              target={nutritionalData.gorduras} 
              unit="g"
              color="bg-red-500"
            />
            <ProgressBar 
              label="💧 Hidratação" 
              current={dailyProgress.hidratacao} 
              target={hydrationGoal} 
              unit="ml"
              color="bg-blue-500"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 h-auto">
              <TabsTrigger value="refeicoes" className="py-2.5">
                <Utensils className="w-4 h-4 mr-2" />
                Refeições
              </TabsTrigger>
              <TabsTrigger value="bebidas" className="py-2.5">
                <Droplets className="w-4 h-4 mr-2" />
                Bebidas
              </TabsTrigger>
              <TabsTrigger value="doces" className="py-2.5">
                <Cake className="w-4 h-4 mr-2" />
                Doces
              </TabsTrigger>
            </TabsList>

            {/* Refeições Tab */}
            <TabsContent value="refeicoes" className="space-y-4 mt-4">
              {/* Add Food Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddFoodDialog 
                  onAdd={addMealItem} 
                  mealTypes={mealTypes}
                  defaultMealTypeId={defaultMealTypeId}
                  customFoods={customFoods}
                  onEditCustomFood={handleEditCustomFood}
                  onDeleteCustomFood={handleDeleteCustomFood}
                />
                <Button 
                  variant="outline" 
                  className="w-full h-12 font-semibold border-dashed border-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => setShowAddCustomFood(true)}
                >
                  <PlusSquare className="w-5 h-5 mr-2" />
                  Criar Alimento
                </Button>
              </div>

              {/* Grouped Meals */}
              <div className="space-y-4">
                {groupedMeals.map((group) => {
                  const groupCalories = group.items.reduce((sum, item) => 
                    sum + (item.food.calorias * item.quantidade) / 100, 0
                  );
                  const groupProtein = group.items.reduce((sum, item) => 
                    sum + (item.food.proteinas * item.quantidade) / 100, 0
                  );
                  
                  return (
                    <div key={group.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span>{group.icone}</span>
                          {group.nome}
                        </h3>
                        {group.items.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(Math.round(groupCalories))} kcal • {formatNumber(Math.round(groupProtein))}g prot
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        {group.items.length > 0 ? (
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const calories = (item.food.calorias * item.quantidade) / 100;
                              const matches = checkFood(item.food);
                              const hasConflict = matches.length > 0;
                              return (
                                <div 
                                  key={item.id} 
                                  className="flex items-center justify-between p-2 rounded-lg group hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1 text-sm">
                                    <span className="font-medium inline-flex items-center gap-2">
                                      {item.food.nome}
                                      {hasConflict && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span
                                              className="inline-flex items-center justify-center rounded-full bg-muted text-foreground text-xs px-2 py-0.5 cursor-help"
                                              aria-label="Alimento com restrição"
                                            >
                                              ⚠️
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <div className="space-y-1">
                                              <p className="font-medium">Conflita com suas restrições</p>
                                              <ul className="text-xs text-muted-foreground list-disc pl-4">
                                                {matches.slice(0, 3).map((m) => (
                                                  <li key={m.restriction.id}>
                                                    {m.restriction.name} ("{m.matchedKeyword}")
                                                  </li>
                                                ))}
                                                {matches.length > 3 && <li>+{matches.length - 3} outras</li>}
                                              </ul>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                      ({item.quantidade}{item.food.unidade}) - {formatNumber(Math.round(calories))} kcal
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                    onClick={() => removeMealItem(item.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            Nenhum alimento adicionado
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear All */}
              {mealItems.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={clearMeals}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todas as Refeições
                </Button>
              )}
            </TabsContent>

            {/* Bebidas Tab */}
            <TabsContent value="bebidas" className="mt-4">
              <BeveragesSection
                mealItems={mealItems}
                hydrationGoal={hydrationGoal}
                onAdd={addMealItem}
                onRemove={removeMealItem}
                currentMealTypeId={defaultMealTypeId}
                customFoods={customFoods}
                onEditCustomFood={handleEditCustomFood}
                onDeleteCustomFood={handleDeleteCustomFood}
              />
            </TabsContent>

            {/* Doces Tab */}
            <TabsContent value="doces" className="space-y-4 mt-4">
              <SweetsSection
                nutritionalData={nutritionalData}
                currentCalories={dailyProgress.calorias}
                onAdd={addMealItem}
                mealTypes={mealTypes}
                defaultMealTypeId={defaultMealTypeId}
                customFoods={customFoods}
                onEditCustomFood={handleEditCustomFood}
                onDeleteCustomFood={handleDeleteCustomFood}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Custom Food Modal */}
      <AddCustomFoodModal
        open={showAddCustomFood}
        onOpenChange={setShowAddCustomFood}
        onSuccess={fetchCustomFoods}
      />

      {/* Edit Custom Food Modal */}
      <EditCustomFoodModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        customFood={editingFood}
        onUpdate={updateCustomFood}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Alimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{foodToDelete?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
