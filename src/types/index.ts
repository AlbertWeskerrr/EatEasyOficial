// Types for the Easy Eat application

export interface ClientData {
  email: string;
  nome: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  idade: number;
  altura: number; // cm
  peso: number; // kg
  circunferenciaAbdominal: number; // cm
  nivelAtividade: 'Sedentário' | 'Leve' | 'Moderada' | 'Alta' | 'Muito Alta';
  praticaExercicio: boolean;
  frequenciaExercicio: number; // days per week
  preferenciasAlimentares: string;
  restricoesAlimentares: string;
  alergias: string;
  objetivo: 'Perda de Peso' | 'Manutenção' | 'Ganho de Massa';
}

export interface NutritionalData {
  tmb: number; // Taxa Metabólica Basal
  get: number; // Gasto Energético Total
  metaDiaria: number; // Meta calórica diária
  proteinas: number; // gramas
  carboidratos: number; // gramas
  gorduras: number; // gramas
}

export interface Food {
  id: string;
  nome: string;
  categoria: 'Proteínas' | 'Grãos' | 'Frutas' | 'Verduras' | 'Laticínios' | 'Oleaginosas' | 'Doces' | 'Bebidas';
  calorias: number; // per 100g/ml
  proteinas: number; // per 100g/ml
  carboidratos: number; // per 100g/ml
  gorduras: number; // per 100g/ml
  fibra?: number; // per 100g/ml
  unidade: string; // 'g' or 'ml'
  porcaoPadrao?: number; // standard portion size
  porcaoDescricao?: string; // e.g., "1 filé", "1 xícara"
  isFavorite?: boolean;
  isCustom?: boolean; // Flag for user-created custom foods
  /** Tags/indicadores de restrição (ex.: "contém leite", "contém glúten", "não vegano") */
  allergens?: string[];
}

export interface Beverage extends Food {
  categoria: 'Bebidas';
  tipoBebida: 'agua' | 'cafe' | 'cha' | 'suco_natural' | 'suco_industrial' | 'refrigerante' | 'energetico' | 'leite' | 'lacteo';
}

export interface Sweet extends Food {
  categoria: 'Doces';
  tipoDoce: 'chocolate' | 'bolo' | 'sobremesa' | 'sorvete' | 'biscoito' | 'fruta_calda' | 'doce_caseiro';
}

export interface MealType {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  ordem: number;
}

export interface MealItem {
  id: string;
  food: Food;
  quantidade: number;
  mealTypeId: string;
}

export interface DailyProgress {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  hidratacao: number; // ml
}

export interface Diet {
  id: string;
  nome: string;
  mealTypes: MealType[];
  mealItems: MealItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DietState {
  diets: Diet[];
  activeDietId: string;
  favorites: string[]; // food IDs
  hydrationGoal: number; // ml, default 2000
}

export type ThemeType = 'male' | 'female' | 'other';

// Default meal types
export const DEFAULT_MEAL_TYPES: MealType[] = [
  { id: 'cafe', nome: 'Café da Manhã', icone: '☕', cor: 'amber', ordem: 1 },
  { id: 'almoco', nome: 'Almoço', icone: '🍽️', cor: 'green', ordem: 2 },
  { id: 'lanche', nome: 'Lanche', icone: '🍪', cor: 'orange', ordem: 3 },
  { id: 'jantar', nome: 'Jantar', icone: '🌙', cor: 'purple', ordem: 4 },
];

export const createEmptyDiet = (id: string, nome: string): Diet => ({
  id,
  nome,
  mealTypes: [...DEFAULT_MEAL_TYPES],
  mealItems: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const INITIAL_DIET_STATE: DietState = {
  diets: [
    createEmptyDiet('diet-1', 'Dieta 1'),
    createEmptyDiet('diet-2', 'Dieta 2'),
    createEmptyDiet('diet-3', 'Dieta 3'),
    createEmptyDiet('diet-4', 'Dieta 4'),
  ],
  activeDietId: 'diet-1',
  favorites: [],
  hydrationGoal: 2000,
};
