// Types for the dietary restrictions system

export type RestrictionCategory = 'allergy' | 'intolerance' | 'health' | 'dietary' | 'religious';

export interface DietaryRestriction {
  id: string;
  code: string;
  name: string;
  category: RestrictionCategory;
  icon: string;
  color: string;
  keywords: string[];
  alternatives: string[];
  description: string | null;
}

export interface UserRestriction {
  id: string;
  user_id: string;
  restriction_id: string;
  created_at: string;
  restriction?: DietaryRestriction;
}

export interface RestrictionMatch {
  restriction: DietaryRestriction;
  matchedKeyword: string;
  alternatives: string[];
}

// Category metadata for UI
export const RESTRICTION_CATEGORIES: Record<RestrictionCategory, {
  label: string;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  allergy: {
    label: 'Alergias',
    icon: '⚠️',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-300 dark:border-red-700',
  },
  intolerance: {
    label: 'Intolerâncias',
    icon: '⚡',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
  },
  health: {
    label: 'Saúde',
    icon: '🏥',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-700',
  },
  dietary: {
    label: 'Dietéticas',
    icon: '🌿',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
  },
  religious: {
    label: 'Religiosas',
    icon: '🔯',
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-700',
  },
};
