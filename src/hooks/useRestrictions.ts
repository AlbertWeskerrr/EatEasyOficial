import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DietaryRestriction, UserRestriction, RestrictionMatch } from '@/types/restrictions';
import { Food } from '@/types';
import { toast } from 'sonner';
import { foodRestrictionTags } from '@/data/foodRestrictionTags';

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function getFoodTokens(food: Food): string[] {
  const tokens = [food.nome];
  
  // Add allergens from custom foods
  if (Array.isArray(food.allergens)) tokens.push(...food.allergens);
  
  // Add tags from static foods database
  if (food.id && foodRestrictionTags[food.id]) {
    tokens.push(...foodRestrictionTags[food.id]);
  }
  
  return tokens.filter(Boolean);
}

export function useRestrictions() {
  const [allRestrictions, setAllRestrictions] = useState<DietaryRestriction[]>([]);
  const [userRestrictions, setUserRestrictions] = useState<DietaryRestriction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available restrictions
  const fetchAllRestrictions = useCallback(async () => {
    const { data, error } = await supabase
      .from('dietary_restrictions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching restrictions:', error);
      return;
    }

    setAllRestrictions(data as DietaryRestriction[]);
  }, []);

  // Fetch user's selected restrictions
  const fetchUserRestrictions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserRestrictions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_restrictions')
      .select(`
        id,
        user_id,
        restriction_id,
        created_at,
        dietary_restrictions (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user restrictions:', error);
      setLoading(false);
      return;
    }

    // Extract the restriction details from the joined data
    const restrictions = data
      ?.map((ur: any) => ur.dietary_restrictions as DietaryRestriction)
      .filter(Boolean) || [];

    setUserRestrictions(restrictions);
    setLoading(false);
  }, []);

  // Add a restriction for the user
  const addRestriction = useCallback(async (restrictionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_restrictions')
      .insert({ user_id: user.id, restriction_id: restrictionId });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - already exists
        return true;
      }
      console.error('Error adding restriction:', error);
      toast.error('Erro ao adicionar restrição');
      return false;
    }

    await fetchUserRestrictions();
    return true;
  }, [fetchUserRestrictions]);

  // Remove a restriction for the user
  const removeRestriction = useCallback(async (restrictionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_restrictions')
      .delete()
      .eq('user_id', user.id)
      .eq('restriction_id', restrictionId);

    if (error) {
      console.error('Error removing restriction:', error);
      toast.error('Erro ao remover restrição');
      return false;
    }

    await fetchUserRestrictions();
    return true;
  }, [fetchUserRestrictions]);

  // Set all restrictions at once (replaces existing)
  const setRestrictions = useCallback(async (restrictionIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Delete all existing restrictions
    const { error: deleteError } = await supabase
      .from('user_restrictions')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error clearing restrictions:', deleteError);
      return false;
    }

    // Insert new restrictions
    if (restrictionIds.length > 0) {
      const { error: insertError } = await supabase
        .from('user_restrictions')
        .insert(
          restrictionIds.map(rid => ({ user_id: user.id, restriction_id: rid }))
        );

      if (insertError) {
        console.error('Error setting restrictions:', insertError);
        return false;
      }
    }

    await fetchUserRestrictions();
    return true;
  }, [fetchUserRestrictions]);

  // Check if a food matches any user restrictions
  const checkFood = useCallback((food: Food): RestrictionMatch[] => {
    const matches: RestrictionMatch[] = [];

    const foodTokens = getFoodTokens(food).map(normalizeText);

    for (const restriction of userRestrictions) {
      for (const keyword of restriction.keywords) {
        const keywordNormalized = normalizeText(keyword);
        const hit = foodTokens.some((t) => t.includes(keywordNormalized));

        if (hit) {
          matches.push({
            restriction,
            matchedKeyword: keyword,
            alternatives: restriction.alternatives || [],
          });
          break; // Once found, no need to check more keywords for this restriction
        }
      }
    }

    return matches;
  }, [userRestrictions]);

  // Show alert for restriction matches
  const alertRestrictionMatch = useCallback((matches: RestrictionMatch[], foodName: string) => {
    if (matches.length === 0) return;

    const firstMatch = matches[0];
    const categoryInfo = getCategoryInfo(firstMatch.restriction.category);

    toast.error(
      `${categoryInfo.icon} Alerta: ${categoryInfo.label}`,
      {
        description: `"${foodName}" contém "${firstMatch.matchedKeyword}" (${firstMatch.restriction.name})`,
        duration: 8000,
      }
    );
  }, []);

  // Initialize
  useEffect(() => {
    fetchAllRestrictions();
    fetchUserRestrictions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRestrictions();
    });

    return () => subscription.unsubscribe();
  }, [fetchAllRestrictions, fetchUserRestrictions]);

  return {
    allRestrictions,
    userRestrictions,
    loading,
    addRestriction,
    removeRestriction,
    setRestrictions,
    checkFood,
    alertRestrictionMatch,
    refetch: fetchUserRestrictions,
  };
}

// Helper function to get category info
function getCategoryInfo(category: string) {
  const categories: Record<string, { icon: string; label: string }> = {
    allergy: { icon: '⚠️', label: 'Alergia' },
    intolerance: { icon: '⚡', label: 'Intolerância' },
    health: { icon: '🏥', label: 'Condição de Saúde' },
    dietary: { icon: '🌿', label: 'Restrição Dietética' },
    religious: { icon: '🔯', label: 'Restrição Religiosa' },
  };
  return categories[category] || { icon: '⚠️', label: 'Restrição' };
}
