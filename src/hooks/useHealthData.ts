import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HealthData {
  id?: string;
  user_id: string;
  peso_kg: number | null;
  altura_cm: number | null;
  imc: number | null;
  circunferencia_abdominal_cm: number | null;
  tmb: number | null;
  calorias_diarias: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface HealthHistoryEntry {
  id: string;
  user_id: string;
  peso_kg: number | null;
  altura_cm: number | null;
  imc: number | null;
  circunferencia_abdominal_cm: number | null;
  tmb: number | null;
  calorias_diarias: number | null;
  source: string;
  recorded_at: string;
}

interface UseHealthDataReturn {
  healthData: HealthData | null;
  healthHistory: HealthHistoryEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateHealthData: (updates: Partial<HealthData>) => Promise<boolean>;
  upsertHealthData: (data: Omit<HealthData, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
}

export function useHealthData(userId?: string): UseHealthDataReturn {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch current health data
      const { data: currentData, error: currentError } = await supabase
        .from('user_health_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (currentError) {
        throw new Error(currentError.message);
      }

      setHealthData(currentData);

      // Fetch health history (last 12 entries)
      const { data: historyData, error: historyError } = await supabase
        .from('user_health_history')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(12);

      if (historyError) {
        console.error('Error fetching health history:', historyError);
        // Don't throw - history is optional
      } else {
        setHealthHistory(historyData || []);
      }
    } catch (err: any) {
      console.error('Error fetching health data:', err);
      setError(err.message || 'Erro ao carregar dados de saúde');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  const updateHealthData = useCallback(async (updates: Partial<HealthData>): Promise<boolean> => {
    if (!userId || !healthData?.id) {
      console.error('Cannot update health data: missing userId or healthData');
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('user_health_data')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refetch to get updated data
      await fetchHealthData();
      return true;
    } catch (err: any) {
      console.error('Error updating health data:', err);
      setError(err.message || 'Erro ao atualizar dados de saúde');
      return false;
    }
  }, [userId, healthData, fetchHealthData]);

  const upsertHealthData = useCallback(async (data: Omit<HealthData, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!userId) {
      console.error('Cannot upsert health data: missing userId');
      return false;
    }

    try {
      const { error: upsertError } = await supabase
        .from('user_health_data')
        .upsert({
          ...data,
          user_id: userId,
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // If this is a new entry, also add to history
      if (!healthData) {
        const { error: historyError } = await supabase
          .from('user_health_history')
          .insert({
            user_id: userId,
            peso_kg: data.peso_kg,
            altura_cm: data.altura_cm,
            imc: data.imc,
            circunferencia_abdominal_cm: data.circunferencia_abdominal_cm,
            tmb: data.tmb,
            calorias_diarias: data.calorias_diarias,
            source: 'onboarding',
          });

        if (historyError) {
          console.error('Error inserting initial health history:', historyError);
          // Don't throw - the main data was saved
        }
      }

      // Refetch to get updated data
      await fetchHealthData();
      return true;
    } catch (err: any) {
      console.error('Error upserting health data:', err);
      setError(err.message || 'Erro ao salvar dados de saúde');
      return false;
    }
  }, [userId, healthData, fetchHealthData]);

  return {
    healthData,
    healthHistory,
    loading,
    error,
    refetch: fetchHealthData,
    updateHealthData,
    upsertHealthData,
  };
}
