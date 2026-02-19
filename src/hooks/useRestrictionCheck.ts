import { useState, useCallback } from 'react';
import { Food } from '@/types';
import { RestrictionMatch, DietaryRestriction } from '@/types/restrictions';
import { useRestrictions } from './useRestrictions';

interface UseRestrictionCheckResult {
  checkFood: (food: Food) => RestrictionMatch[];
  showWarning: boolean;
  currentMatches: RestrictionMatch[];
  currentFoodName: string;
  pendingFood: Food | null;
  pendingCallback: (() => void) | null;
  handleConfirmAdd: () => void;
  handleCancel: () => void;
  checkAndMaybeWarn: (food: Food, onConfirm: () => void) => boolean;
  userRestrictions: DietaryRestriction[];
}

/**
 * Hook for checking foods against user restrictions with warning dialog support.
 * 
 * Usage:
 * 1. Call checkAndMaybeWarn(food, onConfirmCallback) when user tries to add a food
 * 2. If returns true, a warning was shown - wait for user response
 * 3. If returns false, no restriction matched - proceed with adding
 * 4. Render RestrictionWarningDialog with showWarning, currentMatches, etc.
 */
export function useRestrictionCheck(): UseRestrictionCheckResult {
  const { checkFood: baseCheckFood, userRestrictions } = useRestrictions();
  
  const [showWarning, setShowWarning] = useState(false);
  const [currentMatches, setCurrentMatches] = useState<RestrictionMatch[]>([]);
  const [currentFoodName, setCurrentFoodName] = useState('');
  const [pendingFood, setPendingFood] = useState<Food | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const checkAndMaybeWarn = useCallback((food: Food, onConfirm: () => void): boolean => {
    const matches = baseCheckFood(food);
    
    if (matches.length > 0) {
      setCurrentMatches(matches);
      setCurrentFoodName(food.nome);
      setPendingFood(food);
      setPendingCallback(() => onConfirm);
      setShowWarning(true);
      return true; // Warning was shown
    }
    
    return false; // No restriction matched
  }, [baseCheckFood]);

  const handleConfirmAdd = useCallback(() => {
    if (pendingCallback) {
      pendingCallback();
    }
    setShowWarning(false);
    setCurrentMatches([]);
    setCurrentFoodName('');
    setPendingFood(null);
    setPendingCallback(null);
  }, [pendingCallback]);

  const handleCancel = useCallback(() => {
    setShowWarning(false);
    setCurrentMatches([]);
    setCurrentFoodName('');
    setPendingFood(null);
    setPendingCallback(null);
  }, []);

  return {
    checkFood: baseCheckFood,
    showWarning,
    currentMatches,
    currentFoodName,
    pendingFood,
    pendingCallback,
    handleConfirmAdd,
    handleCancel,
    checkAndMaybeWarn,
    userRestrictions,
  };
}
