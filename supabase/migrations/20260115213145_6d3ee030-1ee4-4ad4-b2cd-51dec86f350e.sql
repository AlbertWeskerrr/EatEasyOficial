-- Create table for storing user macro plans
CREATE TABLE public.user_macro_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  objetivo VARCHAR(50) NOT NULL,
  calorias_alvo INTEGER NOT NULL,
  
  -- Macros em percentuais
  proteina_pct INTEGER NOT NULL DEFAULT 30,
  carboidrato_pct INTEGER NOT NULL DEFAULT 40,
  gordura_pct INTEGER NOT NULL DEFAULT 30,
  
  -- Macros em gramas (calculados)
  proteina_g INTEGER NOT NULL,
  carboidrato_g INTEGER NOT NULL,
  gordura_g INTEGER NOT NULL,
  fibra_g INTEGER NOT NULL DEFAULT 28,
  
  -- Metadados de recomendação
  proteina_g_kg NUMERIC(3,1),
  fonte_recomendacao VARCHAR(50) DEFAULT 'sistema',
  
  -- Validações e avisos
  avisos JSONB DEFAULT '[]'::jsonb,
  is_customized BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT user_macro_plans_user_id_unique UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_macro_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own macro plan"
ON public.user_macro_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own macro plan"
ON public.user_macro_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own macro plan"
ON public.user_macro_plans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Block deletion to preserve history
CREATE POLICY "No one can delete macro plans"
ON public.user_macro_plans
FOR DELETE
TO authenticated
USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_user_macro_plans_updated_at
BEFORE UPDATE ON public.user_macro_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();