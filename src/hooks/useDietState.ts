import { useState, useEffect, useCallback } from 'react';
import { Diet, DietState, MealItem, MealType, INITIAL_DIET_STATE, createEmptyDiet, DEFAULT_MEAL_TYPES } from '@/types';

const STORAGE_KEY = 'easyeat-diet-state';

export function useDietState() {
  const [dietState, setDietState] = useState<DietState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all diets have proper structure
        return {
          ...INITIAL_DIET_STATE,
          ...parsed,
          diets: parsed.diets?.length === 4 ? parsed.diets : INITIAL_DIET_STATE.diets,
        };
      }
    } catch (e) {
      console.error('Failed to load diet state:', e);
    }
    return INITIAL_DIET_STATE;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dietState));
    } catch (e) {
      console.error('Failed to save diet state:', e);
    }
  }, [dietState]);

  // Get active diet
  const activeDiet = dietState.diets.find(d => d.id === dietState.activeDietId) || dietState.diets[0];

  // Switch active diet
  const switchDiet = useCallback((dietId: string) => {
    setDietState(prev => ({
      ...prev,
      activeDietId: dietId,
    }));
  }, []);

  // Rename diet
  const renameDiet = useCallback((dietId: string, newName: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === dietId ? { ...d, nome: newName, updatedAt: new Date() } : d
      ),
    }));
  }, []);

  // Clear diet
  const clearDiet = useCallback((dietId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === dietId ? { ...d, mealItems: [], updatedAt: new Date() } : d
      ),
    }));
  }, []);

  // Clone diet to another slot
  const cloneDiet = useCallback((sourceDietId: string, targetDietId: string) => {
    setDietState(prev => {
      const sourceDiet = prev.diets.find(d => d.id === sourceDietId);
      if (!sourceDiet) return prev;
      
      return {
        ...prev,
        diets: prev.diets.map(d => 
          d.id === targetDietId ? {
            ...d,
            mealItems: sourceDiet.mealItems.map(item => ({
              ...item,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })),
            mealTypes: [...sourceDiet.mealTypes],
            updatedAt: new Date(),
          } : d
        ),
      };
    });
  }, []);

  // Add meal item to active diet
  const addMealItem = useCallback((item: MealItem) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealItems: [...d.mealItems, item],
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  // Remove meal item from active diet
  const removeMealItem = useCallback((itemId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealItems: d.mealItems.filter(item => item.id !== itemId),
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  // Clear all meals from active diet
  const clearMeals = useCallback(() => {
    clearDiet(dietState.activeDietId);
  }, [clearDiet, dietState.activeDietId]);

  // Meal type management
  const addMealType = useCallback((mealType: MealType) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealTypes: [...d.mealTypes, mealType],
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  const updateMealType = useCallback((mealTypeId: string, updates: Partial<MealType>) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealTypes: d.mealTypes.map(mt => 
            mt.id === mealTypeId ? { ...mt, ...updates } : mt
          ),
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  const removeMealType = useCallback((mealTypeId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealTypes: d.mealTypes.filter(mt => mt.id !== mealTypeId),
          mealItems: d.mealItems.filter(item => item.mealTypeId !== mealTypeId),
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  const reorderMealTypes = useCallback((reorderedTypes: MealType[]) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => 
        d.id === prev.activeDietId ? {
          ...d,
          mealTypes: reorderedTypes,
          updatedAt: new Date(),
        } : d
      ),
    }));
  }, []);

  // Get meal types for active diet (with fallback)
  const mealTypes = activeDiet.mealTypes.length > 0 ? activeDiet.mealTypes : DEFAULT_MEAL_TYPES;

  // Toggle favorite
  const toggleFavorite = useCallback((foodId: string) => {
    setDietState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(foodId)
        ? prev.favorites.filter(id => id !== foodId)
        : [...prev.favorites, foodId],
    }));
  }, []);

  // Set hydration goal
  const setHydrationGoal = useCallback((goal: number) => {
    setDietState(prev => ({
      ...prev,
      hydrationGoal: goal,
    }));
  }, []);

  return {
    dietState,
    activeDiet,
    mealTypes,
    mealItems: activeDiet.mealItems,
    favorites: dietState.favorites,
    hydrationGoal: dietState.hydrationGoal,
    switchDiet,
    renameDiet,
    clearDiet,
    cloneDiet,
    addMealItem,
    removeMealItem,
    clearMeals,
    addMealType,
    updateMealType,
    removeMealType,
    reorderMealTypes,
    toggleFavorite,
    setHydrationGoal,
  };
}
