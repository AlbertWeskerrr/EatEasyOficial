// Adapter to convert CustomFood from database to Food type for UI components

import { CustomFood } from '@/hooks/useCustomFoods';
import { Food, Beverage, Sweet } from '@/types';

/**
 * Maps custom food subcategory to Food categoria (1:1 direct mapping)
 */
function mapSubcategoriaToCategoria(
  categoria: CustomFood['categoria'],
  subcategoria: string
): Food['categoria'] {
  if (categoria === 'bebida') return 'Bebidas';
  if (categoria === 'doce') return 'Doces';
  
  // Direct 1:1 mapping for 'alimento' subcategories
  const subcategoryMap: Record<string, Food['categoria']> = {
    proteinas: 'Proteínas',
    graos: 'Grãos',
    frutas: 'Frutas',
    verduras: 'Verduras',
    laticinios: 'Laticínios',
    oleaginosas: 'Oleaginosas',
  };
  
  return subcategoryMap[subcategoria] || 'Proteínas';
}

/**
 * Maps custom beverage subcategory to Beverage tipoBebida
 */
export function mapSubcategoriaToTipoBebida(subcategoria: string): Beverage['tipoBebida'] {
  const map: Record<string, Beverage['tipoBebida']> = {
    agua_isotonico: 'agua',
    cha_cafe: 'cafe',
    suco: 'suco_natural',
    refrigerante: 'refrigerante',
    leite: 'leite',
    iogurte_lacteo: 'lacteo',
    bebida_alcoolica: 'suco_industrial', // fallback
  };
  
  return map[subcategoria] || 'leite';
}

/**
 * Maps custom sweet subcategory to Sweet tipoDoce
 */
export function mapSubcategoriaToTipoDoce(subcategoria: string): Sweet['tipoDoce'] {
  const map: Record<string, Sweet['tipoDoce']> = {
    chocolate: 'chocolate',
    bolos_biscoitos: 'bolo',
    pudim_gelatina: 'sobremesa',
    sorvete: 'sorvete',
    candy_gomas: 'biscoito',
    doces_caseiros: 'doce_caseiro',
  };
  
  return map[subcategoria] || 'chocolate';
}

/**
 * Converts a CustomFood from the database to a Food type for UI components
 */
export function customFoodToFood(customFood: CustomFood): Food & { isCustom: true } {
  const baseFood: Food & { isCustom: true } = {
    id: customFood.id,
    nome: customFood.nome + (customFood.marca ? ` (${customFood.marca})` : ''),
    categoria: mapSubcategoriaToCategoria(customFood.categoria, customFood.subcategoria),
    calorias: Number(customFood.calorias),
    proteinas: Number(customFood.proteinas),
    carboidratos: Number(customFood.carboidratos),
    gorduras: Number(customFood.gorduras),
    unidade: customFood.porcao_unidade,
    porcaoPadrao: customFood.porcao_tamanho,
    porcaoDescricao: customFood.porcao_descricao || undefined,
    allergens: [...(customFood.alergenicos || []), ...(customFood.dietas_incompativeis || [])],
    isCustom: true,
  };

  // Add type-specific properties
  if (customFood.categoria === 'bebida') {
    return {
      ...baseFood,
      tipoBebida: mapSubcategoriaToTipoBebida(customFood.subcategoria),
    } as Beverage & { isCustom: true };
  }

  if (customFood.categoria === 'doce') {
    return {
      ...baseFood,
      tipoDoce: mapSubcategoriaToTipoDoce(customFood.subcategoria),
    } as Sweet & { isCustom: true };
  }

  return baseFood;
}

/**
 * Filters and converts custom foods by category
 */
export function getCustomFoodsByCategory(
  customFoods: CustomFood[],
  categoria: 'alimento' | 'bebida' | 'doce'
): (Food & { isCustom: true })[] {
  return customFoods
    .filter(cf => cf.categoria === categoria)
    .map(customFoodToFood);
}

/**
 * Searches custom foods by query and optional category
 */
export function searchCustomFoodsConverted(
  customFoods: CustomFood[],
  query: string,
  categoria?: 'alimento' | 'bebida' | 'doce'
): (Food & { isCustom: true })[] {
  const lowerQuery = query.toLowerCase();
  
  return customFoods
    .filter(cf => {
      const matchesCategory = !categoria || cf.categoria === categoria;
      const matchesQuery = 
        cf.nome.toLowerCase().includes(lowerQuery) ||
        (cf.marca && cf.marca.toLowerCase().includes(lowerQuery));
      
      return matchesCategory && matchesQuery;
    })
    .map(customFoodToFood);
}
