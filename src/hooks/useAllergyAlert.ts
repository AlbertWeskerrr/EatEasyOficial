import { useApp } from '@/contexts/AppContext';
import { Food } from '@/types';
import { toast } from 'sonner';
import { useCallback } from 'react';

// Parse comma-separated allergies into array of lowercase terms
function parseAllergies(allergiesStr: string | undefined): string[] {
  if (!allergiesStr || allergiesStr.toLowerCase() === 'nenhuma') return [];
  return allergiesStr
    .split(/[,;]/)
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 0);
}

// Check if food name contains any allergy term
function checkFoodAgainstAllergies(foodName: string, allergies: string[]): string | null {
  const foodNameLower = foodName.toLowerCase();
  
  for (const allergy of allergies) {
    if (foodNameLower.includes(allergy)) {
      return allergy;
    }
  }
  return null;
}

export function useAllergyAlert() {
  const { client } = useApp();
  
  const allergies = parseAllergies(client?.alergias);
  
  const checkAndAlertAllergy = useCallback((food: Food): boolean => {
    if (allergies.length === 0) return false;
    
    const matchedAllergy = checkFoodAgainstAllergies(food.nome, allergies);
    
    if (matchedAllergy) {
      toast.error(
        `⚠️ Alerta de Alergia!`,
        {
          description: `O alimento "${food.nome}" pode conter "${matchedAllergy}", que está na sua lista de alergias.`,
          duration: 8000,
          style: {
            background: 'hsl(0, 84%, 95%)',
            border: '2px solid hsl(0, 84%, 60%)',
            color: 'hsl(0, 0%, 12%)',
          },
        }
      );
      return true;
    }
    
    return false;
  }, [allergies]);
  
  return { checkAndAlertAllergy, hasAllergies: allergies.length > 0 };
}