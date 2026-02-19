-- Persistência de dietas por usuário (backend)

CREATE TABLE IF NOT EXISTS public.user_diet_states (
  user_id uuid PRIMARY KEY,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_diet_states ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias dietas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_diet_states'
      AND policyname = 'Users can view own diet states'
  ) THEN
    CREATE POLICY "Users can view own diet states"
    ON public.user_diet_states
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Usuários podem criar seu próprio estado de dietas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_diet_states'
      AND policyname = 'Users can create own diet states'
  ) THEN
    CREATE POLICY "Users can create own diet states"
    ON public.user_diet_states
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Usuários podem atualizar apenas seu próprio estado de dietas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_diet_states'
      AND policyname = 'Users can update own diet states'
  ) THEN
    CREATE POLICY "Users can update own diet states"
    ON public.user_diet_states
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger para manter updated_at consistente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_user_diet_states_updated_at'
  ) THEN
    CREATE TRIGGER trg_user_diet_states_updated_at
    BEFORE UPDATE ON public.user_diet_states
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_diet_states_updated_at
  ON public.user_diet_states (updated_at DESC);