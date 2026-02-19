import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CustomFood, CreateCustomFoodInput } from '@/hooks/useCustomFoods';
import { FOOD_CATEGORIES } from '@/data/foodCategories';
import { AlertTriangle, Star, Check } from 'lucide-react';

const ALLERGENS = [
  { id: 'gluten', label: 'Glúten', icon: '🌾' },
  { id: 'lactose', label: 'Lactose', icon: '🥛' },
  { id: 'ovo', label: 'Ovo', icon: '🥚' },
  { id: 'amendoim', label: 'Amendoim', icon: '🥜' },
  { id: 'castanhas', label: 'Castanhas', icon: '🌰' },
  { id: 'soja', label: 'Soja', icon: '🫘' },
  { id: 'peixe', label: 'Peixe', icon: '🐟' },
  { id: 'frutos_mar', label: 'Frutos do Mar', icon: '🦐' },
];

const INCOMPATIBLE_DIETS = [
  { id: 'vegetariano', label: 'Vegetariano', icon: '🥬' },
  { id: 'vegano', label: 'Vegano', icon: '🌱' },
  { id: 'sem_gluten', label: 'Sem Glúten', icon: '🚫🌾' },
  { id: 'sem_lactose', label: 'Sem Lactose', icon: '🚫🥛' },
  { id: 'low_carb', label: 'Low Carb', icon: '📉' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
];

// Category options for select
const CATEGORY_OPTIONS = [
  { id: 'alimento', label: 'Alimento', icon: '🍗' },
  { id: 'bebida', label: 'Bebida', icon: '🥤' },
  { id: 'doce', label: 'Doce', icon: '🍫' },
];

interface EditCustomFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFood: CustomFood | null;
  onUpdate: (id: string, updates: Partial<CreateCustomFoodInput>) => Promise<boolean>;
}

export function EditCustomFoodModal({ open, onOpenChange, customFood, onUpdate }: EditCustomFoodModalProps) {
  // Form state
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState<'alimento' | 'bebida' | 'doce'>('alimento');
  const [subcategoria, setSubcategoria] = useState('');
  const [porcaoTamanho, setPorcaoTamanho] = useState('100');
  const [porcaoUnidade, setPorcaoUnidade] = useState('g');
  const [porcaoDescricao, setPorcaoDescricao] = useState('');
  const [calorias, setCalorias] = useState('');
  const [carboidratos, setCarboidratos] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [gorduras, setGorduras] = useState('');
  const [alergenicos, setAlergenicos] = useState<string[]>([]);
  const [dietasIncompativeis, setDietasIncompativeis] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load custom food data when modal opens
  useEffect(() => {
    if (customFood && open) {
      setNome(customFood.nome);
      setMarca(customFood.marca || '');
      setCategoria(customFood.categoria);
      setSubcategoria(customFood.subcategoria);
      setPorcaoTamanho(String(customFood.porcao_tamanho));
      setPorcaoUnidade(customFood.porcao_unidade);
      setPorcaoDescricao(customFood.porcao_descricao || '');
      setCalorias(String(customFood.calorias));
      setCarboidratos(String(customFood.carboidratos));
      setProteinas(String(customFood.proteinas));
      setGorduras(String(customFood.gorduras));
      setAlergenicos(customFood.alergenicos || []);
      setDietasIncompativeis(customFood.dietas_incompativeis || []);
      setIsFavorite(customFood.is_favorite);
    }
  }, [customFood, open]);

  // Get available subcategories based on categoria
  const availableSubcategories = useMemo(() => {
    const cat = FOOD_CATEGORIES[categoria];
    if (!cat) return [];
    return Object.entries(cat.subcategorias).map(([id, sub]) => ({
      id,
      label: sub.label,
      icon: categoria === 'alimento' ? '🍽️' : categoria === 'bebida' ? '🥤' : '🍬',
    }));
  }, [categoria]);

  // Macro validation
  const macroValidation = useMemo(() => {
    const carbs = Number(carboidratos) || 0;
    const prot = Number(proteinas) || 0;
    const fat = Number(gorduras) || 0;
    const cal = Number(calorias) || 0;

    const calculatedCalories = (carbs * 4) + (prot * 4) + (fat * 9);
    const difference = Math.abs(cal - calculatedCalories);

    return {
      calculatedCalories,
      difference,
      isValid: difference <= 10,
    };
  }, [carboidratos, proteinas, gorduras, calorias]);

  // Form validation
  const isValid = useMemo(() => {
    return (
      nome.trim().length > 0 &&
      subcategoria &&
      Number(porcaoTamanho) > 0 &&
      Number(calorias) >= 0 &&
      Number(carboidratos) >= 0 &&
      Number(proteinas) >= 0 &&
      Number(gorduras) >= 0
    );
  }, [nome, subcategoria, porcaoTamanho, calorias, carboidratos, proteinas, gorduras]);

  const toggleAllergen = (id: string) => {
    setAlergenicos(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleDiet = (id: string) => {
    setDietasIncompativeis(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!isValid || !customFood) return;

    setSaving(true);
    const updates: Partial<CreateCustomFoodInput> = {
      nome: nome.trim(),
      marca: marca.trim() || undefined,
      categoria,
      subcategoria,
      porcao_tamanho: Number(porcaoTamanho),
      porcao_unidade: porcaoUnidade,
      porcao_descricao: porcaoDescricao.trim() || undefined,
      calorias: Number(calorias),
      carboidratos: Number(carboidratos),
      proteinas: Number(proteinas),
      gorduras: Number(gorduras),
      alergenicos,
      dietas_incompativeis: dietasIncompativeis,
      is_favorite: isFavorite,
    };

    const success = await onUpdate(customFood.id, updates);
    setSaving(false);

    if (success) {
      onOpenChange(false);
    }
  };

  if (!customFood) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✏️ Editar Alimento
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Alimento *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Frango Grelhado"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca (opcional)</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Sadia, Seara..."
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={categoria} onValueChange={(v) => {
                    setCategoria(v as 'alimento' | 'bebida' | 'doce');
                    setSubcategoria('');
                    setPorcaoUnidade(v === 'bebida' ? 'ml' : 'g');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategoria *</Label>
                  <Select value={subcategoria} onValueChange={setSubcategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.icon} {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Portion Info */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Porção</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Tamanho *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={porcaoTamanho}
                    onChange={(e) => setPorcaoTamanho(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Unidade</Label>
                  <Select value={porcaoUnidade} onValueChange={setPorcaoUnidade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">gramas (g)</SelectItem>
                      <SelectItem value="ml">mililitros (ml)</SelectItem>
                      <SelectItem value="un">unidade (un)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    placeholder="1 fatia"
                    value={porcaoDescricao}
                    onChange={(e) => setPorcaoDescricao(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Nutritional Info */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Informação Nutricional (por {porcaoTamanho}{porcaoUnidade})
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">🔥 Calorias (kcal) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={calorias}
                    onChange={(e) => setCalorias(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">🌾 Carboidratos (g) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={carboidratos}
                    onChange={(e) => setCarboidratos(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">💪 Proteínas (g) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={proteinas}
                    onChange={(e) => setProteinas(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">🥑 Gorduras (g) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={gorduras}
                    onChange={(e) => setGorduras(e.target.value)}
                  />
                </div>
              </div>

              {/* Macro Validation */}
              {calorias && (carboidratos || proteinas || gorduras) && (
                <div className={`p-3 rounded-lg text-sm ${
                  macroValidation.isValid 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}>
                  {macroValidation.isValid ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Macros consistentes
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Verificar macros</p>
                        <p className="text-xs mt-1">
                          Cálculo: ({carboidratos || 0}×4) + ({proteinas || 0}×4) + ({gorduras || 0}×9) = {macroValidation.calculatedCalories} kcal
                        </p>
                        <p className="text-xs">
                          Diferença: {macroValidation.difference.toFixed(0)} kcal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Allergens & Diets */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Restrições (opcional)</Label>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Contém alérgenos:</Label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((allergen) => (
                    <Button
                      key={allergen.id}
                      type="button"
                      variant={alergenicos.includes(allergen.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAllergen(allergen.id)}
                    >
                      {allergen.icon} {allergen.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Incompatível com dietas:</Label>
                <div className="flex flex-wrap gap-2">
                  {INCOMPATIBLE_DIETS.map((diet) => (
                    <Button
                      key={diet.id}
                      type="button"
                      variant={dietasIncompativeis.includes(diet.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDiet(diet.id)}
                    >
                      {diet.icon} {diet.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Favorite Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                id="favorite"
                checked={isFavorite}
                onCheckedChange={(checked) => setIsFavorite(checked === true)}
              />
              <Label htmlFor="favorite" className="flex items-center gap-2 cursor-pointer">
                <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                Marcar como favorito
              </Label>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className="flex-1" 
            disabled={!isValid || saving}
            onClick={handleSubmit}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
