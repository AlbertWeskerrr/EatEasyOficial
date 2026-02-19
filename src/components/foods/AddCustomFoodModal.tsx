import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  FOOD_CATEGORIES, 
  MEASUREMENT_UNITS, 
  ALLERGENS, 
  INCOMPATIBLE_DIETS,
  getBrandSuggestions,
  validateMacros,
  type MacroValidationResult,
} from '@/data/foodCategories';
import { useCustomFoods, type CreateCustomFoodInput } from '@/hooks/useCustomFoods';
import { cn } from '@/lib/utils';

interface AddCustomFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCustomFoodModal({ open, onOpenChange, onSuccess }: AddCustomFoodModalProps) {
  const { createCustomFood } = useCustomFoods();
  const [saving, setSaving] = useState(false);

  // Form state
  const [categoria, setCategoria] = useState<string>('');
  const [subcategoria, setSubcategoria] = useState<string>('');
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [porcaoTamanho, setPorcaoTamanho] = useState('100');
  const [porcaoUnidade, setPorcaoUnidade] = useState('g');
  const [calorias, setCalorias] = useState('');
  const [carboidratos, setCarboidratos] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [gorduras, setGorduras] = useState('');
  const [alergenicos, setAlergenicos] = useState<string[]>([]);
  const [dietasIncompativeis, setDietasIncompativeis] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCategoria('');
      setSubcategoria('');
      setNome('');
      setMarca('');
      setPorcaoTamanho('100');
      setPorcaoUnidade('g');
      setCalorias('');
      setCarboidratos('');
      setProteinas('');
      setGorduras('');
      setAlergenicos([]);
      setDietasIncompativeis([]);
      setIsFavorite(false);
    }
  }, [open]);

  // Reset subcategoria when categoria changes
  useEffect(() => {
    setSubcategoria('');
  }, [categoria]);

  // Get subcategories for selected category
  const subcategorias = useMemo(() => {
    if (!categoria || !FOOD_CATEGORIES[categoria]) return [];
    return Object.entries(FOOD_CATEGORIES[categoria].subcategorias);
  }, [categoria]);

  // Get brand suggestions
  const brandSuggestions = useMemo(() => {
    if (!categoria) return [];
    return getBrandSuggestions(categoria, subcategoria);
  }, [categoria, subcategoria]);

  // Filter brand suggestions based on input
  const filteredBrandSuggestions = useMemo(() => {
    if (!marca) return brandSuggestions;
    const lower = marca.toLowerCase();
    return brandSuggestions.filter(b => b.toLowerCase().includes(lower));
  }, [marca, brandSuggestions]);

  // Macro validation
  const macroValidation: MacroValidationResult | null = useMemo(() => {
    const cal = parseFloat(calorias) || 0;
    const carb = parseFloat(carboidratos) || 0;
    const prot = parseFloat(proteinas) || 0;
    const gord = parseFloat(gorduras) || 0;
    
    if (cal === 0 && carb === 0 && prot === 0 && gord === 0) return null;
    if (cal === 0) return null;
    
    return validateMacros(cal, carb, prot, gord);
  }, [calorias, carboidratos, proteinas, gorduras]);

  // Validation
  const isValid = useMemo(() => {
    return (
      categoria &&
      subcategoria &&
      nome.trim() &&
      parseFloat(porcaoTamanho) > 0 &&
      porcaoUnidade &&
      parseFloat(calorias) >= 0 &&
      parseFloat(carboidratos) >= 0 &&
      parseFloat(proteinas) >= 0 &&
      parseFloat(gorduras) >= 0
    );
  }, [categoria, subcategoria, nome, porcaoTamanho, porcaoUnidade, calorias, carboidratos, proteinas, gorduras]);

  // Handle allergen toggle
  const toggleAllergen = (code: string) => {
    setAlergenicos(prev => 
      prev.includes(code) 
        ? prev.filter(a => a !== code)
        : [...prev, code]
    );
  };

  // Handle diet toggle
  const toggleDiet = (code: string) => {
    setDietasIncompativeis(prev => 
      prev.includes(code)
        ? prev.filter(d => d !== code)
        : [...prev, code]
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const input: CreateCustomFoodInput = {
        nome: nome.trim(),
        marca: marca.trim() || undefined,
        categoria: categoria as 'alimento' | 'bebida' | 'doce',
        subcategoria,
        porcao_tamanho: parseFloat(porcaoTamanho),
        porcao_unidade: porcaoUnidade,
        calorias: parseFloat(calorias),
        carboidratos: parseFloat(carboidratos),
        proteinas: parseFloat(proteinas),
        gorduras: parseFloat(gorduras),
        alergenicos,
        dietas_incompativeis: dietasIncompativeis,
        is_favorite: isFavorite,
      };

      const result = await createCustomFood(input);
      if (result) {
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Adicionar Alimento Personalizado
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Section: Identification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                📁 IDENTIFICAÇÃO
              </h3>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FOOD_CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoria *</Label>
                <Select 
                  value={subcategoria} 
                  onValueChange={setSubcategoria}
                  disabled={!categoria}
                >
                  <SelectTrigger id="subcategoria">
                    <SelectValue placeholder={categoria ? "Selecione a subcategoria" : "Selecione a categoria primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategorias.map(([key, sub]) => (
                      <SelectItem key={key} value={key}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subcategoria && categoria && FOOD_CATEGORIES[categoria]?.subcategorias[subcategoria] && (
                  <p className="text-xs text-muted-foreground">
                    Ex: {FOOD_CATEGORIES[categoria].subcategorias[subcategoria].examples}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: YoPro Doce de Leite Havana"
                />
                <p className="text-xs text-muted-foreground">
                  Descreva o produto específico que está adicionando
                </p>
              </div>

              {/* Brand */}
              <div className="space-y-2 relative">
                <Label htmlFor="marca">Marca (opcional)</Label>
                <Input
                  id="marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  onFocus={() => setShowBrandSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                  placeholder="Ex: YoPro, Nestlé, Itambé"
                />
                {showBrandSuggestions && filteredBrandSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-auto">
                    {filteredBrandSuggestions.slice(0, 6).map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onMouseDown={() => {
                          setMarca(brand);
                          setShowBrandSuggestions(false);
                        }}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Section: Portion */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                📏 PORÇÃO
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="porcaoTamanho">Tamanho da Porção *</Label>
                  <Input
                    id="porcaoTamanho"
                    type="number"
                    min="0"
                    step="1"
                    value={porcaoTamanho}
                    onChange={(e) => setPorcaoTamanho(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="porcaoUnidade">Unidade *</Label>
                  <Select value={porcaoUnidade} onValueChange={setPorcaoUnidade}>
                    <SelectTrigger id="porcaoUnidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Nutritional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                📊 INFORMAÇÃO NUTRICIONAL (por porção)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calorias">Calorias (kcal) *</Label>
                  <Input
                    id="calorias"
                    type="number"
                    min="0"
                    step="1"
                    value={calorias}
                    onChange={(e) => setCalorias(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carboidratos">Carboidratos (g) *</Label>
                  <Input
                    id="carboidratos"
                    type="number"
                    min="0"
                    step="0.1"
                    value={carboidratos}
                    onChange={(e) => setCarboidratos(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proteinas">Proteína (g) *</Label>
                  <Input
                    id="proteinas"
                    type="number"
                    min="0"
                    step="0.1"
                    value={proteinas}
                    onChange={(e) => setProteinas(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gorduras">Gordura (g) *</Label>
                  <Input
                    id="gorduras"
                    type="number"
                    min="0"
                    step="0.1"
                    value={gorduras}
                    onChange={(e) => setGorduras(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Macro Validation */}
              {macroValidation && (
                <div className={cn(
                  "p-3 rounded-lg flex items-start gap-2 text-sm",
                  macroValidation.isConsistent 
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                )}>
                  {macroValidation.isConsistent ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{macroValidation.message}</p>
                    <p className="text-xs opacity-80 mt-0.5">
                      Macros calculam: {macroValidation.calculatedCalories} kcal | Informado: {macroValidation.informedCalories} kcal
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Section: Restrictions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                ⚠️ RESTRIÇÕES (opcional)
              </h3>

              {/* Allergens */}
              <div className="space-y-3">
                <Label className="text-sm">Alérgenos presentes:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALLERGENS.map((allergen) => (
                    <label 
                      key={allergen.code}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={alergenicos.includes(allergen.code)}
                        onCheckedChange={() => toggleAllergen(allergen.code)}
                      />
                      <span className="text-sm">{allergen.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Incompatible Diets */}
              <div className="space-y-3">
                <Label className="text-sm">Dietas incompatíveis (marque se NÃO é apropriado):</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INCOMPATIBLE_DIETS.map((diet) => (
                    <label 
                      key={diet.code}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={dietasIncompativeis.includes(diet.code)}
                        onCheckedChange={() => toggleDiet(diet.code)}
                      />
                      <span className="text-sm">{diet.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Favorite */}
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={isFavorite}
                onCheckedChange={(checked) => setIsFavorite(checked === true)}
              />
              <span className="flex items-center gap-2">
                <Star className={cn(
                  "h-4 w-4",
                  isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                )} />
                Adicionar aos favoritos
              </span>
            </label>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || saving}
          >
            {saving ? 'Salvando...' : '✅ Salvar Alimento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
