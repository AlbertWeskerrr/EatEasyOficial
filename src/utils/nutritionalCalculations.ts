import { ClientData, NutritionalData, ThemeType } from '@/types';

/**
 * Calculate Basal Metabolic Rate (TMB) using Harris-Benedict equation
 */
export function calculateTMB(client: ClientData): number {
  const { sexo, peso, altura, idade } = client;
  
  if (sexo === 'Masculino') {
    // Men: TMB = 88.36 + (13.40 × weight) + (4.26 × height) - (5.68 × age)
    return 88.36 + (13.40 * peso) + (4.26 * altura) - (5.68 * idade);
  } else {
    // Women (and Other): TMB = 447.59 + (9.25 × weight) + (3.10 × height) - (4.33 × age)
    return 447.59 + (9.25 * peso) + (3.10 * altura) - (4.33 * idade);
  }
}

/**
 * Get activity factor multiplier
 */
export function getActivityFactor(nivel: ClientData['nivelAtividade']): number {
  const factors: Record<ClientData['nivelAtividade'], number> = {
    'Sedentário': 1.2,
    'Leve': 1.375,
    'Moderada': 1.55,
    'Alta': 1.725,
    'Muito Alta': 1.9,
  };
  return factors[nivel];
}

/**
 * Calculate Total Energy Expenditure (GET)
 */
export function calculateGET(tmb: number, nivelAtividade: ClientData['nivelAtividade']): number {
  return tmb * getActivityFactor(nivelAtividade);
}

/**
 * Calculate daily caloric goal based on objective
 */
export function calculateDailyGoal(get: number, objetivo: ClientData['objetivo']): number {
  switch (objetivo) {
    case 'Perda de Peso':
      return get - 500;
    case 'Ganho de Massa':
      return get + 400;
    case 'Manutenção':
    default:
      return get;
  }
}

/**
 * Calculate macronutrient distribution
 * Protein: 30% (4 kcal/g)
 * Carbs: 40% (4 kcal/g)
 * Fat: 30% (9 kcal/g)
 */
export function calculateMacros(metaDiaria: number): {
  proteinas: number;
  carboidratos: number;
  gorduras: number;
} {
  return {
    proteinas: Math.round((metaDiaria * 0.30) / 4),
    carboidratos: Math.round((metaDiaria * 0.40) / 4),
    gorduras: Math.round((metaDiaria * 0.30) / 9),
  };
}

/**
 * Calculate all nutritional data for a client
 */
export function calculateNutritionalData(client: ClientData): NutritionalData {
  const tmb = calculateTMB(client);
  const get = calculateGET(tmb, client.nivelAtividade);
  const metaDiaria = calculateDailyGoal(get, client.objetivo);
  const macros = calculateMacros(metaDiaria);

  return {
    tmb: Math.round(tmb),
    get: Math.round(get),
    metaDiaria: Math.round(metaDiaria),
    ...macros,
  };
}

/**
 * Get theme type based on client's sex
 */
export function getThemeType(sexo: ClientData['sexo']): ThemeType {
  switch (sexo) {
    case 'Masculino':
      return 'male';
    case 'Feminino':
      return 'female';
    case 'Outro':
      return 'other';
    default:
      return 'male';
  }
}

/**
 * Get theme class name
 */
export function getThemeClass(sexo: ClientData['sexo']): string {
  return `theme-${getThemeType(sexo)}`;
}

/**
 * Format number with locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Get progress status color
 */
export function getProgressStatus(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage >= 80 && percentage <= 110) return 'success';
  if (percentage >= 60 && percentage < 80) return 'warning';
  return 'danger';
}

/**
 * Get progress status message
 */
export function getProgressMessage(percentage: number): string {
  if (percentage >= 100 && percentage <= 110) return '🎉 Meta atingida!';
  if (percentage > 110) return '⚠️ Acima da meta';
  if (percentage >= 80) return '⚠️ Próximo da meta';
  return '';
}
