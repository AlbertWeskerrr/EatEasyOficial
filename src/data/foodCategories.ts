// Food categories, subcategories, brands, allergens, and measurement units

export interface Subcategory {
  label: string;
  examples: string;
}

export interface Category {
  label: string;
  icon: string;
  subcategorias: Record<string, Subcategory>;
}

export const FOOD_CATEGORIES: Record<string, Category> = {
  alimento: {
    label: 'Alimento',
    icon: '🍗',
    subcategorias: {
      proteinas: { label: 'Proteínas', examples: 'frango, carne, peixe, ovos, tofu' },
      graos: { label: 'Grãos', examples: 'arroz, macarrão, pão, aveia, quinoa' },
      frutas: { label: 'Frutas', examples: 'maçã, banana, laranja, morango, abacaxi' },
      verduras: { label: 'Verduras', examples: 'brócolis, alface, cenoura, tomate, espinafre' },
      laticinios: { label: 'Laticínios', examples: 'queijo, leite em pó, iogurte natural' },
      oleaginosas: { label: 'Oleaginosas', examples: 'amendoim, amêndoa, castanha, nozes' },
    }
  },
  bebida: {
    label: 'Bebida',
    icon: '🥤',
    subcategorias: {
      iogurte_lacteo: { label: 'Iogurte/Bebida Láctea', examples: 'YoPro, Itambé, Nestlé, caseiro' },
      leite: { label: 'Leite', examples: 'integral, desnatado, semidesnatado' },
      suco: { label: 'Suco', examples: 'natural, industrializado' },
      refrigerante: { label: 'Refrigerante', examples: 'normal, diet, zero' },
      bebida_alcoolica: { label: 'Bebida Alcoólica', examples: 'cerveja, vinho, destilado' },
      cha_cafe: { label: 'Chá/Café', examples: 'chá verde, café, cappuccino, café com leite' },
      agua_isotonico: { label: 'Água/Isotônico', examples: 'água, água com gás, bebida isotônica' },
    }
  },
  doce: {
    label: 'Doce',
    icon: '🍫',
    subcategorias: {
      chocolate: { label: 'Chocolate', examples: 'chocolate em pó, barra de chocolate, chocolate derretido' },
      bolos_biscoitos: { label: 'Bolos/Biscoitos', examples: 'bolo, brownie, biscoito, torta' },
      pudim_gelatina: { label: 'Pudim/Gelatina', examples: 'pudim, gelatina, flan' },
      sorvete: { label: 'Sorvete', examples: 'sorvete, picolé, gelato' },
      candy_gomas: { label: 'Candy/Gomas', examples: 'bala, goma, chiclete' },
      doces_caseiros: { label: 'Doces Caseiros', examples: 'brigadeiro, beijinho, docinho' },
    }
  }
};

export const POPULAR_BRANDS: Record<string, string[]> = {
  bebida: ['YoPro', 'Itambé', 'Nestlé', 'Danone', 'Vigor', 'Corpus', 'Batavo'],
  iogurte: ['Danone', 'Activia', 'Nestlé', 'YoPro', 'Vigor', 'Batavo', 'Corpus'],
  chocolate: ['Nestlé', 'Lacta', 'Callebaut', 'Lindt', 'Hershey', 'Garoto', 'Cacau Show'],
  biscoito: ['Tostines', 'Marilan', 'Mabel', 'Nestlé', 'Bauducco', 'Piraquê', 'Vitarella'],
  refrigerante: ['Coca-Cola', 'Pepsi', 'Guaraná Antarctica', 'Fanta', 'Sprite', 'Sukita'],
  cafe: ['Nescafé', 'Illy', 'Melitta', 'Lavazza', '3 Corações', 'Pilão', 'Baggio'],
  leite: ['Italac', 'Piracanjuba', 'Parmalat', 'Nestlé', 'Elegê', 'Shefa'],
  sorvete: ['Kibon', 'Häagen-Dazs', 'Ben & Jerry\'s', 'Nestlé', 'La Basque'],
};

export const ALLERGENS = [
  { code: 'amendoim', label: 'Amendoim' },
  { code: 'nozes', label: 'Nozes' },
  { code: 'leite', label: 'Leite/Lactose' },
  { code: 'ovos', label: 'Ovos' },
  { code: 'peixes', label: 'Peixes' },
  { code: 'frutos_mar', label: 'Frutos do Mar' },
  { code: 'soja', label: 'Soja' },
  { code: 'gluten', label: 'Trigo/Glúten' },
  { code: 'castanha', label: 'Castanha de Caju' },
] as const;

export const INCOMPATIBLE_DIETS = [
  { code: 'vegetariano', label: 'Vegetariano' },
  { code: 'vegano', label: 'Vegano' },
  { code: 'pescetariano', label: 'Pescetariano' },
  { code: 'sem_gluten', label: 'Sem Glúten' },
  { code: 'sem_lactose', label: 'Sem Lactose' },
  { code: 'kosher', label: 'Kosher' },
  { code: 'halal', label: 'Halal' },
] as const;

export const MEASUREMENT_UNITS = [
  { value: 'g', label: 'g (gramas)' },
  { value: 'ml', label: 'ml (mililitros)' },
  { value: 'unidade', label: 'unidade' },
  { value: 'xicara', label: 'xícara' },
  { value: 'colher', label: 'colher' },
  { value: 'vidro', label: 'vidro' },
  { value: 'lata', label: 'lata' },
  { value: 'garrafa', label: 'garrafa' },
] as const;

// Helper function to get all brands for autocomplete
export function getAllBrands(): string[] {
  const allBrands = new Set<string>();
  Object.values(POPULAR_BRANDS).forEach(brands => {
    brands.forEach(brand => allBrands.add(brand));
  });
  return Array.from(allBrands).sort();
}

// Helper function to get brands by category/subcategory
export function getBrandSuggestions(categoria: string, subcategoria: string): string[] {
  const suggestions = new Set<string>();
  
  // Add category-specific brands
  if (POPULAR_BRANDS[categoria]) {
    POPULAR_BRANDS[categoria].forEach(b => suggestions.add(b));
  }
  
  // Add subcategory-specific brands
  if (POPULAR_BRANDS[subcategoria]) {
    POPULAR_BRANDS[subcategoria].forEach(b => suggestions.add(b));
  }
  
  // Map subcategories to brand categories
  const subcategoryBrandMap: Record<string, string> = {
    iogurte_lacteo: 'iogurte',
    leite: 'leite',
    refrigerante: 'refrigerante',
    cha_cafe: 'cafe',
    chocolate: 'chocolate',
    bolos_biscoitos: 'biscoito',
    sorvete: 'sorvete',
  };
  
  const mappedCategory = subcategoryBrandMap[subcategoria];
  if (mappedCategory && POPULAR_BRANDS[mappedCategory]) {
    POPULAR_BRANDS[mappedCategory].forEach(b => suggestions.add(b));
  }
  
  return Array.from(suggestions).sort();
}

// Macro validation function
export interface MacroValidationResult {
  isConsistent: boolean;
  calculatedCalories: number;
  informedCalories: number;
  difference: number;
  message: string;
  icon: string;
}

export function validateMacros(
  calorias: number,
  carboidratos: number,
  proteinas: number,
  gorduras: number
): MacroValidationResult {
  const calculatedCalories = Math.round((carboidratos * 4) + (proteinas * 4) + (gorduras * 9));
  const difference = Math.abs(calculatedCalories - calorias);
  const isConsistent = difference <= 10;
  
  return {
    isConsistent,
    calculatedCalories,
    informedCalories: calorias,
    difference,
    message: isConsistent
      ? 'Valores consistentes'
      : `Atenção: Macros calculam ${calculatedCalories} kcal, você informou ${calorias} kcal`,
    icon: isConsistent ? '✅' : '⚠️',
  };
}
