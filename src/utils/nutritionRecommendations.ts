import { 
  Objetivo, 
  MacroRecommendation, 
  MacroWarning, 
  MACRO_RULES, 
  TIPS_BY_OBJECTIVE 
} from '@/types/nutrition';

type Sexo = 'masculino' | 'feminino' | 'outro';
type NivelAtividade = 'Sedentário' | 'Leve' | 'Moderada' | 'Alta' | 'Muito Alta';

// Activity factors
const ACTIVITY_FACTORS: Record<NivelAtividade, number> = {
  'Sedentário': 1.2,
  'Leve': 1.375,
  'Moderada': 1.55,
  'Alta': 1.725,
  'Muito Alta': 1.9,
};

// Minimum calories by sex
const MIN_CALORIES: Record<Sexo, number> = {
  'masculino': 1500,
  'feminino': 1200,
  'outro': 1350, // Average
};

/**
 * Calculate TMB using Mifflin-St Jeor equation
 */
export function calculateTMB(
  peso: number, 
  altura: number, 
  idade: number, 
  sexo: Sexo
): number {
  // Mifflin-St Jeor: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
  // where s is +5 for males and -161 for females
  const base = (10 * peso) + (6.25 * altura) - (5 * idade);
  
  if (sexo === 'masculino') {
    return base + 5;
  } else {
    return base - 161;
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(
  peso: number,
  altura: number,
  idade: number,
  sexo: Sexo,
  nivelAtividade: NivelAtividade
): number {
  const tmb = calculateTMB(peso, altura, idade, sexo);
  const factor = ACTIVITY_FACTORS[nivelAtividade] || 1.55;
  return Math.round(tmb * factor);
}

/**
 * Calculate target calories based on objective
 */
export function calculateTargetCalories(
  tdee: number,
  objetivo: Objetivo,
  sexo: Sexo
): number {
  let target: number;
  
  switch (objetivo) {
    case 'Ganho de Massa':
      target = tdee + 300;
      break;
    case 'Perda de Peso':
      target = tdee - 500;
      break;
    case 'Manutenção':
    default:
      target = tdee;
  }
  
  // Apply minimum calories
  const minCalories = MIN_CALORIES[sexo] || 1350;
  return Math.max(target, minCalories);
}

/**
 * Get macro recommendation based on objective
 */
export function getRecommendationByGoal(
  objetivo: Objetivo,
  peso: number,
  calorias: number
): MacroRecommendation {
  const rules = MACRO_RULES[objetivo];
  
  // Calculate protein in grams based on g/kg
  const proteinaG = Math.round(peso * rules.proteina_g_kg);
  // Calculate protein percentage from grams
  const proteinaPct = Math.round((proteinaG * 4 / calorias) * 100);
  
  // Adjust carbs and fat to sum to 100%
  const remainingPct = 100 - proteinaPct;
  const carbRatio = rules.carboidrato_pct / (rules.carboidrato_pct + rules.gordura_pct);
  const carboidratoPct = Math.round(remainingPct * carbRatio);
  const gorduraPct = 100 - proteinaPct - carboidratoPct;
  
  // Calculate grams
  const carboidratoG = Math.round((calorias * carboidratoPct / 100) / 4);
  const gorduraG = Math.round((calorias * gorduraPct / 100) / 9);
  
  return {
    objetivo,
    calorias_alvo: calorias,
    proteina: {
      pct: proteinaPct,
      g: proteinaG,
      g_kg: rules.proteina_g_kg,
    },
    carboidrato: {
      pct: carboidratoPct,
      g: carboidratoG,
    },
    gordura: {
      pct: gorduraPct,
      g: gorduraG,
    },
    fibra_g: 28,
    faixas: rules.faixas,
    dicas: TIPS_BY_OBJECTIVE[objetivo],
  };
}

/**
 * Validate macro distribution and return warnings
 */
export function validateMacros(
  proteinaPct: number,
  carboidratoPct: number,
  gorduraPct: number,
  peso: number,
  calorias: number,
  objetivo: Objetivo,
  sexo: Sexo
): MacroWarning[] {
  const warnings: MacroWarning[] = [];
  const rules = MACRO_RULES[objetivo];
  
  // Check if sum equals 100%
  const total = proteinaPct + carboidratoPct + gorduraPct;
  if (Math.abs(total - 100) > 2) {
    warnings.push({
      level: 'critical',
      field: 'total',
      message: `A soma deve ser 100%. Atual: ${total}%`,
      blocking: true,
    });
  }
  
  // Calculate grams
  const proteinaG = Math.round((calorias * proteinaPct / 100) / 4);
  const gorduraG = Math.round((calorias * gorduraPct / 100) / 9);
  const proteinaGKg = proteinaG / peso;
  
  // Critical warnings - blocking
  if (proteinaPct < 15) {
    warnings.push({
      level: 'critical',
      field: 'proteina',
      message: '🔴 Proteína muito baixa. Risco de perda muscular',
      blocking: true,
    });
  }
  
  if (gorduraPct < 15) {
    warnings.push({
      level: 'critical',
      field: 'gordura',
      message: '🔴 Gordura muito baixa. Afeta produção hormonal',
      blocking: true,
    });
  }
  
  // Critical for weight loss - protein must be high
  if (objetivo === 'Perda de Peso' && proteinaGKg < 1.6) {
    warnings.push({
      level: 'critical',
      field: 'proteina',
      message: `🔴 CRÍTICO: Aumentar proteína durante déficit. Atual: ${proteinaGKg.toFixed(1)}g/kg, mínimo: 1.6g/kg`,
      blocking: true,
    });
  }
  
  // Minimum calories warning
  const minCalories = MIN_CALORIES[sexo] || 1350;
  if (calorias < minCalories) {
    warnings.push({
      level: 'critical',
      field: 'calorias',
      message: `🔴 Calorias abaixo do mínimo seguro (${minCalories} kcal)`,
      blocking: true,
    });
  }
  
  // Check against recommended ranges - non-blocking
  if (proteinaPct < rules.faixas.proteina.min_pct || proteinaPct > rules.faixas.proteina.max_pct) {
    warnings.push({
      level: 'warn',
      field: 'proteina',
      message: `⚠️ Proteína fora da faixa recomendada (${rules.faixas.proteina.min_pct}-${rules.faixas.proteina.max_pct}%)`,
      blocking: false,
    });
  }
  
  if (carboidratoPct < rules.faixas.carboidrato.min_pct || carboidratoPct > rules.faixas.carboidrato.max_pct) {
    warnings.push({
      level: 'warn',
      field: 'carboidrato',
      message: `⚠️ Carboidrato fora da faixa recomendada (${rules.faixas.carboidrato.min_pct}-${rules.faixas.carboidrato.max_pct}%)`,
      blocking: false,
    });
  }
  
  if (gorduraPct < rules.faixas.gordura.min_pct || gorduraPct > rules.faixas.gordura.max_pct) {
    warnings.push({
      level: 'warn',
      field: 'gordura',
      message: `⚠️ Gordura fora da faixa recomendada (${rules.faixas.gordura.min_pct}-${rules.faixas.gordura.max_pct}%)`,
      blocking: false,
    });
  }
  
  // Check minimum fat in grams
  if (gorduraG < rules.faixas.gordura.min_g) {
    warnings.push({
      level: 'warn',
      field: 'gordura',
      message: `⚠️ Gordura abaixo do mínimo (${rules.faixas.gordura.min_g}g)`,
      blocking: false,
    });
  }
  
  return warnings;
}

/**
 * Calculate macros in grams from percentages
 */
export function calculateMacroGrams(
  proteinaPct: number,
  carboidratoPct: number,
  gorduraPct: number,
  calorias: number
): { proteina_g: number; carboidrato_g: number; gordura_g: number } {
  return {
    proteina_g: Math.round((calorias * proteinaPct / 100) / 4),
    carboidrato_g: Math.round((calorias * carboidratoPct / 100) / 4),
    gordura_g: Math.round((calorias * gorduraPct / 100) / 9),
  };
}

/**
 * Get warning color class based on level
 */
export function getWarningColorClass(level: MacroWarning['level']): string {
  switch (level) {
    case 'critical':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'warn':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'info':
    default:
      return 'text-blue-500 bg-blue-50 border-blue-200';
  }
}

/**
 * Check if any warnings are blocking
 */
export function hasBlockingWarnings(warnings: MacroWarning[]): boolean {
  return warnings.some(w => w.blocking);
}
