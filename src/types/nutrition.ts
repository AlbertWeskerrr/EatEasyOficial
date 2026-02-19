// Types for the nutritional recommendation system

export type WarningLevel = 'info' | 'warn' | 'critical';

export interface MacroWarning {
  level: WarningLevel;
  field: 'proteina' | 'carboidrato' | 'gordura' | 'total' | 'calorias';
  message: string;
  blocking: boolean;
}

export type Objetivo = 'Manutenção' | 'Ganho de Massa' | 'Perda de Peso';

export interface MacroRanges {
  proteina: { min_pct: number; max_pct: number; min_g_kg: number; max_g_kg: number; };
  carboidrato: { min_pct: number; max_pct: number; };
  gordura: { min_pct: number; max_pct: number; min_g: number; };
}

export interface MacroRecommendation {
  objetivo: Objetivo;
  calorias_alvo: number;
  proteina: { pct: number; g: number; g_kg: number; };
  carboidrato: { pct: number; g: number; };
  gordura: { pct: number; g: number; };
  fibra_g: number;
  faixas: MacroRanges;
  dicas: string[];
}

export interface MacroPlan {
  id?: string;
  user_id: string;
  objetivo: Objetivo;
  calorias_alvo: number;
  proteina_pct: number;
  carboidrato_pct: number;
  gordura_pct: number;
  proteina_g: number;
  carboidrato_g: number;
  gordura_g: number;
  fibra_g: number;
  proteina_g_kg: number;
  fonte_recomendacao: 'sistema' | 'customizado';
  avisos: MacroWarning[];
  is_customized: boolean;
  created_at?: string;
  updated_at?: string;
}

// Tips by objective
export const TIPS_BY_OBJECTIVE: Record<Objetivo, string[]> = {
  'Manutenção': [
    'Distribuir proteína uniformemente nas refeições',
    'Carboidratos complexos (aveia, arroz integral)',
    'Gorduras saudáveis (azeite, abacate)',
    'Refeições a cada 3-4 horas',
  ],
  'Ganho de Massa': [
    '⭐ Proteína distribuída em 4 refeições (20-40g cada)',
    '⭐ Whey protein pós-treino (rápida absorção)',
    'Creatina 3-5g/dia (aumenta força e volume)',
    'Carbos complexos para energia de treino',
  ],
  'Perda de Peso': [
    '⭐ PROTEÍNA ALTA é crítico (preserva músculos durante déficit)',
    '⭐ Fibra aumenta saciedade (25-30g/dia)',
    'Distribuir proteína em 3-4 refeições para controlar fome',
    'Beber 2-3L água/dia',
    'Taxa esperada: 0.5-1kg/semana',
  ],
};

// Macro rules by objective
export const MACRO_RULES: Record<Objetivo, {
  proteina_g_kg: number;
  proteina_pct: number;
  carboidrato_pct: number;
  gordura_pct: number;
  faixas: MacroRanges;
}> = {
  'Manutenção': {
    proteina_g_kg: 1.4,
    proteina_pct: 22, // Will be calculated based on g/kg
    carboidrato_pct: 45,
    gordura_pct: 27,
    faixas: {
      proteina: { min_pct: 17, max_pct: 25, min_g_kg: 1.2, max_g_kg: 1.6 },
      carboidrato: { min_pct: 40, max_pct: 50 },
      gordura: { min_pct: 25, max_pct: 30, min_g: 40 },
    },
  },
  'Ganho de Massa': {
    proteina_g_kg: 1.8,
    proteina_pct: 30,
    carboidrato_pct: 48,
    gordura_pct: 22,
    faixas: {
      proteina: { min_pct: 25, max_pct: 35, min_g_kg: 1.6, max_g_kg: 2.2 },
      carboidrato: { min_pct: 45, max_pct: 50 },
      gordura: { min_pct: 20, max_pct: 25, min_g: 40 },
    },
  },
  'Perda de Peso': {
    proteina_g_kg: 1.9,
    proteina_pct: 32,
    carboidrato_pct: 44,
    gordura_pct: 24,
    faixas: {
      proteina: { min_pct: 25, max_pct: 35, min_g_kg: 1.6, max_g_kg: 2.2 },
      carboidrato: { min_pct: 40, max_pct: 50 },
      gordura: { min_pct: 20, max_pct: 30, min_g: 40 },
    },
  },
};
