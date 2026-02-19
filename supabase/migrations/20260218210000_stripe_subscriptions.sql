-- Tabela para rastrear pagamentos e assinaturas do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nome TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'active' | 'cancelled' | 'expired'
  amount_paid INTEGER, -- em centavos
  currency TEXT DEFAULT 'brl',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_email ON public.stripe_subscriptions(email);

-- Índice para busca por session_id (usado pelo webhook)
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_session ON public.stripe_subscriptions(stripe_session_id);

-- RLS
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Permite leitura pública por email (para verificar status antes do login)
CREATE POLICY "Allow read by email" ON public.stripe_subscriptions
  FOR SELECT USING (true);

-- Apenas service_role pode inserir/atualizar (via Edge Functions)
CREATE POLICY "Allow service role to insert" ON public.stripe_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role to update" ON public.stripe_subscriptions
  FOR UPDATE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON public.stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
