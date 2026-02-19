import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomFood {
  id: string;
  user_id: string;
  nome: string;
  marca: string | null;
  categoria: 'alimento' | 'bebida' | 'doce';
  subcategoria: string;
  porcao_tamanho: number;
  porcao_unidade: string;
  porcao_descricao: string | null;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  alergenicos: string[];
  dietas_incompativeis: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFoodInput {
  nome: string;
  marca?: string;
  categoria: 'alimento' | 'bebida' | 'doce';
  subcategoria: string;
  porcao_tamanho: number;
  porcao_unidade: string;
  porcao_descricao?: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  alergenicos?: string[];
  dietas_incompativeis?: string[];
  is_favorite?: boolean;
}

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all custom foods for the current user
  const fetchCustomFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCustomFoods([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('custom_foods')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setCustomFoods(data as CustomFood[] || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar alimentos';
      setError(message);
      console.error('Error fetching custom foods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new custom food
  const createCustomFood = useCallback(async (input: CreateCustomFoodInput): Promise<CustomFood | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para adicionar alimentos',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('custom_foods')
        .insert({
          user_id: user.id,
          nome: input.nome,
          marca: input.marca || null,
          categoria: input.categoria,
          subcategoria: input.subcategoria,
          porcao_tamanho: input.porcao_tamanho,
          porcao_unidade: input.porcao_unidade,
          porcao_descricao: input.porcao_descricao || null,
          calorias: input.calorias,
          carboidratos: input.carboidratos,
          proteinas: input.proteinas,
          gorduras: input.gorduras,
          alergenicos: input.alergenicos || [],
          dietas_incompativeis: input.dietas_incompativeis || [],
          is_favorite: input.is_favorite || false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newFood = data as CustomFood;
      setCustomFoods(prev => [newFood, ...prev]);
      
      toast({
        title: '✅ Alimento adicionado!',
        description: `"${input.nome}" foi salvo com sucesso.`,
      });

      return newFood;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar alimento';
      toast({
        title: 'Erro ao salvar',
        description: message,
        variant: 'destructive',
      });
      console.error('Error creating custom food:', err);
      return null;
    }
  }, [toast]);

  // Update an existing custom food
  const updateCustomFood = useCallback(async (id: string, updates: Partial<CreateCustomFoodInput>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('custom_foods')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      setCustomFoods(prev => prev.map(food => 
        food.id === id ? { ...food, ...updates, updated_at: new Date().toISOString() } : food
      ));

      toast({
        title: '✅ Alimento atualizado!',
        description: 'As alterações foram salvas.',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar alimento';
      toast({
        title: 'Erro ao atualizar',
        description: message,
        variant: 'destructive',
      });
      console.error('Error updating custom food:', err);
      return false;
    }
  }, [toast]);

  // Delete a custom food
  const deleteCustomFood = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('custom_foods')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCustomFoods(prev => prev.filter(food => food.id !== id));

      toast({
        title: '🗑️ Alimento removido',
        description: 'O alimento foi excluído da sua lista.',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir alimento';
      toast({
        title: 'Erro ao excluir',
        description: message,
        variant: 'destructive',
      });
      console.error('Error deleting custom food:', err);
      return false;
    }
  }, [toast]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    const food = customFoods.find(f => f.id === id);
    if (!food) return false;

    try {
      const newFavoriteStatus = !food.is_favorite;
      
      const { error: updateError } = await supabase
        .from('custom_foods')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      setCustomFoods(prev => prev.map(f => 
        f.id === id ? { ...f, is_favorite: newFavoriteStatus } : f
      ));

      toast({
        title: newFavoriteStatus ? '⭐ Adicionado aos favoritos' : '☆ Removido dos favoritos',
        description: food.nome,
      });

      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  }, [customFoods, toast]);

  // Search custom foods
  const searchCustomFoods = useCallback((query: string, categoria?: string): CustomFood[] => {
    const lowerQuery = query.toLowerCase();
    
    return customFoods.filter(food => {
      const matchesQuery = !query || 
        food.nome.toLowerCase().includes(lowerQuery) ||
        (food.marca && food.marca.toLowerCase().includes(lowerQuery));
      
      const matchesCategory = !categoria || food.categoria === categoria;
      
      return matchesQuery && matchesCategory;
    });
  }, [customFoods]);

  // Get favorites
  const getFavorites = useCallback((): CustomFood[] => {
    return customFoods.filter(food => food.is_favorite);
  }, [customFoods]);

  // Initial fetch
  useEffect(() => {
    fetchCustomFoods();
  }, [fetchCustomFoods]);

  return {
    customFoods,
    loading,
    error,
    fetchCustomFoods,
    createCustomFood,
    updateCustomFood,
    deleteCustomFood,
    toggleFavorite,
    searchCustomFoods,
    getFavorites,
  };
}
