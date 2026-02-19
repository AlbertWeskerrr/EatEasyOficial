import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  ClientData,
  NutritionalData,
  MealItem,
  DailyProgress,
  MealType,
  Diet,
  DietState,
  INITIAL_DIET_STATE,
  DEFAULT_MEAL_TYPES,
} from '@/types';
import { calculateNutritionalData, getThemeClass } from '@/utils/nutritionalCalculations';
import { findClientByEmail } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { DietSyncConflictDialog } from '@/components/DietSyncConflictDialog';

const STORAGE_KEY = 'easyeat-diet-state';
const STORAGE_META_KEY = 'easyeat-diet-state-meta';

type DietStateMeta = {
  updatedAtMs: number;
  lastSyncedAtMs: number;
  lastRemoteUpdatedAt?: string;
};

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function statesEqual(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

interface AppContextType {
  // User state
  client: ClientData | null;
  nutritionalData: NutritionalData | null;
  isLoggedIn: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  setIsLoggedIn: (value: boolean) => void;
  setClientData: (data: ClientData) => void;

  // Diet state
  dietState: DietState;
  activeDiet: Diet;
  mealTypes: MealType[];
  mealItems: MealItem[];
  dailyProgress: DailyProgress;
  favorites: string[];
  hydrationGoal: number;

  // Diet actions
  switchDiet: (dietId: string) => void;
  renameDiet: (dietId: string, name: string) => void;
  clearDiet: (dietId: string) => void;
  cloneDiet: (sourceId: string, targetId: string) => void;

  // Meal item actions
  addMealItem: (item: MealItem) => void;
  removeMealItem: (id: string) => void;
  clearMeals: () => void;

  // Meal type actions
  addMealType: (mealType: MealType) => void;
  updateMealType: (id: string, updates: Partial<MealType>) => void;
  removeMealType: (id: string) => void;
  reorderMealTypes: (types: MealType[]) => void;

  // Other actions
  toggleFavorite: (foodId: string) => void;
  setHydrationGoal: (goal: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [nutritionalData, setNutritionalData] = useState<NutritionalData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [authUserId, setAuthUserId] = useState<string>('');

  const [dietMeta, setDietMeta] = useState<DietStateMeta>(() => {
    const stored = safeParseJson<DietStateMeta>(localStorage.getItem(STORAGE_META_KEY));
    return (
      stored ?? {
        updatedAtMs: Date.now(),
        lastSyncedAtMs: 0,
      }
    );
  });

  // Diet state with localStorage persistence
  const [dietState, setDietState] = useState<DietState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate and merge with initial state, fixing any corrupt data
        return {
          ...INITIAL_DIET_STATE,
          ...parsed,
          diets:
            parsed.diets?.length === 4
              ? parsed.diets.map((diet: Diet) => ({
                  ...diet,
                  // Ensure mealItems have valid food categories
                  mealItems: (diet.mealItems || []).filter(
                    (item: MealItem) => item && item.food && typeof item.food.categoria === 'string'
                  ),
                  mealTypes: diet.mealTypes?.length > 0 ? diet.mealTypes : DEFAULT_MEAL_TYPES,
                }))
              : INITIAL_DIET_STATE.diets,
        };
      }
    } catch (e) {
      console.error('Failed to load diet state, resetting to default:', e);
      // Clear corrupt storage
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    return INITIAL_DIET_STATE;
  });

  const applyingRemoteRef = useRef(false);
  const skipFirstLocalMetaUpdateRef = useRef(true);

  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictRemoteState, setConflictRemoteState] = useState<DietState | null>(null);
  const [conflictRemoteUpdatedAt, setConflictRemoteUpdatedAt] = useState<string | null>(null);

  // Persist diet state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dietState));
    } catch (e) {
      console.error('Failed to save diet state:', e);
    }
  }, [dietState]);

  // Persist meta (and track local changes)
  useEffect(() => {
    // evita marcar como "edit" o carregamento inicial
    if (skipFirstLocalMetaUpdateRef.current) {
      skipFirstLocalMetaUpdateRef.current = false;
      return;
    }

    const now = Date.now();
    setDietMeta(prev => {
      const next: DietStateMeta = applyingRemoteRef.current
        ? {
            ...prev,
            updatedAtMs: now,
            lastSyncedAtMs: now,
            lastRemoteUpdatedAt: prev.lastRemoteUpdatedAt,
          }
        : {
            ...prev,
            updatedAtMs: now,
          };

      try {
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      return next;
    });

    applyingRemoteRef.current = false;
  }, [dietState]);

  // Get active diet
  const activeDiet = useMemo(
    () => dietState.diets.find(d => d.id === dietState.activeDietId) || dietState.diets[0],
    [dietState]
  );

  // Get meal types with fallback
  const mealTypes = useMemo(
    () => (activeDiet.mealTypes.length > 0 ? activeDiet.mealTypes : DEFAULT_MEAL_TYPES),
    [activeDiet.mealTypes]
  );

  // Get meal items for active diet
  const mealItems = activeDiet.mealItems;

  // Calculate daily progress from meal items
  const dailyProgress: DailyProgress = mealItems.reduce(
    (acc, item) => {
      const factor = item.quantidade / 100;
      const isBeverage = item.food.categoria === 'Bebidas';
      return {
        calorias: acc.calorias + item.food.calorias * factor,
        proteinas: acc.proteinas + item.food.proteinas * factor,
        carboidratos: acc.carboidratos + item.food.carboidratos * factor,
        gorduras: acc.gorduras + item.food.gorduras * factor,
        hidratacao: acc.hidratacao + (isBeverage ? item.quantidade : 0),
      };
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, hidratacao: 0 }
  );

  // Apply theme class to body based on client's sex
  useEffect(() => {
    if (client) {
      const themeClass = getThemeClass(client.sexo);
      document.body.classList.remove('theme-male', 'theme-female', 'theme-other');
      document.body.classList.add(themeClass);
    } else {
      document.body.classList.remove('theme-male', 'theme-female', 'theme-other');
    }
  }, [client]);

  // Track auth user id when logged in
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isLoggedIn) {
        if (!cancelled) setAuthUserId('');
        return;
      }
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id || '';
      if (!cancelled) setAuthUserId(uid);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Initial sync on login
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isLoggedIn) return;

      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;

      const { data: remoteRow, error } = await supabase
        .from('user_diet_states')
        .select('state, updated_at')
        .eq('user_id', uid)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Diet sync: failed to fetch remote state', error);
        return;
      }

      // Sem estado remoto ainda: cria com o estado local atual
      if (!remoteRow) {
        const { error: upsertError } = await supabase
          .from('user_diet_states')
          .upsert([{ user_id: uid, state: dietState as unknown as any }], { onConflict: 'user_id' });

        if (upsertError) console.error('Diet sync: failed to create remote state', upsertError);

        const now = Date.now();
        setDietMeta(prev => {
          const next = { ...prev, lastSyncedAtMs: now };
          try {
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        return;
      }

      const remoteUpdatedAtMs = Date.parse(remoteRow.updated_at);
      const localUpdatedAtMs = dietMeta.updatedAtMs;
      const lastSyncedAtMs = dietMeta.lastSyncedAtMs;

      const hasRemoteChanges = remoteUpdatedAtMs > lastSyncedAtMs;
      const hasLocalChanges = localUpdatedAtMs > lastSyncedAtMs;
      const isDifferent = !statesEqual(remoteRow.state, dietState);

      // Conflito: ambos mudaram desde o último sync e o conteúdo diverge
      if (hasRemoteChanges && hasLocalChanges && isDifferent) {
        setConflictRemoteState(remoteRow.state as unknown as DietState);
        setConflictRemoteUpdatedAt(remoteRow.updated_at);
        setConflictOpen(true);
        return;
      }

      // Apenas remoto é mais novo: puxa
      if (remoteUpdatedAtMs > localUpdatedAtMs && isDifferent) {
        applyingRemoteRef.current = true;
        setDietState(remoteRow.state as unknown as DietState);

        const now = Date.now();
        setDietMeta(prev => {
          const next = {
            ...prev,
            updatedAtMs: now,
            lastSyncedAtMs: now,
            lastRemoteUpdatedAt: remoteRow.updated_at,
          };
          try {
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        return;
      }

      // Apenas local é mais novo: empurra (debounce fará o resto)
      if (localUpdatedAtMs > remoteUpdatedAtMs) {
        // no-op aqui; o efeito de debounce vai fazer o upsert
        return;
      }

      // Se iguais, marca como sincronizado
      if (!isDifferent) {
        const now = Date.now();
        setDietMeta(prev => {
          const next = {
            ...prev,
            lastSyncedAtMs: now,
            lastRemoteUpdatedAt: remoteRow.updated_at,
          };
          try {
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Debounced push local -> backend
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!authUserId) return;
    if (conflictOpen) return;

    if (dietMeta.updatedAtMs <= dietMeta.lastSyncedAtMs) return;

    const t = window.setTimeout(async () => {
      const { error } = await supabase
        .from('user_diet_states')
        .upsert([{ user_id: authUserId, state: dietState as unknown as any }], { onConflict: 'user_id' });

      if (error) {
        console.error('Diet sync: failed to push local state', error);
        return;
      }

      const now = Date.now();
      setDietMeta(prev => {
        const next = { ...prev, lastSyncedAtMs: now };
        try {
          localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }, 1200);

    return () => window.clearTimeout(t);
  }, [authUserId, conflictOpen, dietMeta.lastSyncedAtMs, dietMeta.updatedAtMs, dietState, isLoggedIn]);

  const resolveConflictUseRemote = useCallback(() => {
    if (!conflictRemoteState) {
      setConflictOpen(false);
      return;
    }

    applyingRemoteRef.current = true;
    setDietState(conflictRemoteState);

    const now = Date.now();
    setDietMeta(prev => {
      const next = {
        ...prev,
        updatedAtMs: now,
        lastSyncedAtMs: now,
        lastRemoteUpdatedAt: conflictRemoteUpdatedAt ?? prev.lastRemoteUpdatedAt,
      };
      try {
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    setConflictOpen(false);
    setConflictRemoteState(null);
    setConflictRemoteUpdatedAt(null);
  }, [conflictRemoteState, conflictRemoteUpdatedAt]);

  const resolveConflictKeepLocal = useCallback(async () => {
    // fecha primeiro para liberar o debounce e evitar UI travada
    setConflictOpen(false);

    const uid = authUserId;
    if (isLoggedIn && uid) {
      const { error } = await supabase
        .from('user_diet_states')
        .upsert([{ user_id: uid, state: dietState as unknown as any }], { onConflict: 'user_id' });
      if (error) console.error('Diet sync: failed to overwrite remote state', error);

      const now = Date.now();
      setDietMeta(prev => {
        const next = { ...prev, lastSyncedAtMs: now };
        try {
          localStorage.setItem(STORAGE_META_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    setConflictRemoteState(null);
    setConflictRemoteUpdatedAt(null);
  }, [authUserId, dietState, isLoggedIn]);

  // Auth actions (legado)
  const login = (email: string): boolean => {
    const foundClient = findClientByEmail(email);
    if (foundClient) {
      setClient(foundClient);
      setNutritionalData(calculateNutritionalData(foundClient));
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const setClientData = (data: ClientData) => {
    setClient(data);
    setNutritionalData(calculateNutritionalData(data));
  };

  const logout = () => {
    setClient(null);
    setNutritionalData(null);
    setIsLoggedIn(false);
  };

  // Diet switching actions
  const switchDiet = useCallback((dietId: string) => {
    setDietState(prev => ({
      ...prev,
      activeDietId: dietId,
    }));
  }, []);

  const renameDiet = useCallback((dietId: string, newName: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => (d.id === dietId ? { ...d, nome: newName, updatedAt: new Date() } : d)),
    }));
  }, []);

  const clearDiet = useCallback((dietId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d => (d.id === dietId ? { ...d, mealItems: [], updatedAt: new Date() } : d)),
    }));
  }, []);

  const cloneDiet = useCallback((sourceDietId: string, targetDietId: string) => {
    setDietState(prev => {
      const sourceDiet = prev.diets.find(d => d.id === sourceDietId);
      if (!sourceDiet) return prev;

      return {
        ...prev,
        diets: prev.diets.map(d =>
          d.id === targetDietId
            ? {
                ...d,
                mealItems: sourceDiet.mealItems.map(item => ({
                  ...item,
                  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                })),
                mealTypes: [...sourceDiet.mealTypes],
                updatedAt: new Date(),
              }
            : d
        ),
      };
    });
  }, []);

  // Meal item actions
  const addMealItem = useCallback((item: MealItem) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealItems: [...d.mealItems, item],
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  const removeMealItem = useCallback((itemId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealItems: d.mealItems.filter(item => item.id !== itemId),
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  const clearMeals = useCallback(() => {
    clearDiet(dietState.activeDietId);
  }, [clearDiet, dietState.activeDietId]);

  // Meal type actions
  const addMealType = useCallback((mealType: MealType) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealTypes: [...d.mealTypes, mealType],
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  const updateMealType = useCallback((mealTypeId: string, updates: Partial<MealType>) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealTypes: d.mealTypes.map(mt => (mt.id === mealTypeId ? { ...mt, ...updates } : mt)),
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  const removeMealType = useCallback((mealTypeId: string) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealTypes: d.mealTypes.filter(mt => mt.id !== mealTypeId),
              mealItems: d.mealItems.filter(item => item.mealTypeId !== mealTypeId),
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  const reorderMealTypes = useCallback((reorderedTypes: MealType[]) => {
    setDietState(prev => ({
      ...prev,
      diets: prev.diets.map(d =>
        d.id === prev.activeDietId
          ? {
              ...d,
              mealTypes: reorderedTypes,
              updatedAt: new Date(),
            }
          : d
      ),
    }));
  }, []);

  // Favorites
  const toggleFavorite = useCallback((foodId: string) => {
    setDietState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(foodId)
        ? prev.favorites.filter(id => id !== foodId)
        : [...prev.favorites, foodId],
    }));
  }, []);

  // Hydration goal
  const setHydrationGoal = useCallback((goal: number) => {
    setDietState(prev => ({
      ...prev,
      hydrationGoal: goal,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        client,
        nutritionalData,
        isLoggedIn,
        login,
        logout,
        setIsLoggedIn,
        setClientData,
        dietState,
        activeDiet,
        mealTypes,
        mealItems,
        dailyProgress,
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
      }}
    >
      {children}
      <DietSyncConflictDialog
        open={conflictOpen}
        remoteUpdatedAt={conflictRemoteUpdatedAt}
        localUpdatedAtMs={dietMeta.updatedAtMs}
        onUseRemote={resolveConflictUseRemote}
        onKeepLocal={resolveConflictKeepLocal}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

