-- Create custom_foods table for user-created food entries
CREATE TABLE public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Identification
  nome TEXT NOT NULL,
  marca TEXT,
  
  -- Categorization
  categoria TEXT NOT NULL CHECK (categoria IN ('alimento', 'bebida', 'doce')),
  subcategoria TEXT NOT NULL,
  
  -- Portion
  porcao_tamanho NUMERIC NOT NULL DEFAULT 100,
  porcao_unidade TEXT NOT NULL DEFAULT 'g',
  porcao_descricao TEXT,
  
  -- Nutritional Information (per portion)
  calorias NUMERIC NOT NULL CHECK (calorias >= 0),
  carboidratos NUMERIC NOT NULL CHECK (carboidratos >= 0),
  proteinas NUMERIC NOT NULL CHECK (proteinas >= 0),
  gorduras NUMERIC NOT NULL CHECK (gorduras >= 0),
  
  -- Restrictions (arrays of codes)
  alergenicos TEXT[] DEFAULT '{}',
  dietas_incompativeis TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom foods"
  ON public.custom_foods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom foods"
  ON public.custom_foods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods"
  ON public.custom_foods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods"
  ON public.custom_foods FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_foods_updated_at
  BEFORE UPDATE ON public.custom_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_custom_foods_user_id ON public.custom_foods(user_id);
CREATE INDEX idx_custom_foods_categoria ON public.custom_foods(categoria);
CREATE INDEX idx_custom_foods_is_favorite ON public.custom_foods(is_favorite) WHERE is_favorite = true;