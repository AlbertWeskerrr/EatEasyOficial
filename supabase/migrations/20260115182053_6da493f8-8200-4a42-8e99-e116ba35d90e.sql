-- =============================================
-- SEPARAR DADOS DE SAÚDE EM TABELAS PRIVADAS
-- =============================================

-- 1. Criar tabela user_health_data (dados atuais de saúde)
CREATE TABLE user_health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  peso_kg NUMERIC(5,2),
  altura_cm INTEGER,
  imc NUMERIC(4,1),
  circunferencia_abdominal_cm INTEGER,
  tmb NUMERIC(7,2),
  calorias_diarias INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela user_health_history (histórico de evolução)
CREATE TABLE user_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  peso_kg NUMERIC(5,2),
  altura_cm INTEGER,
  imc NUMERIC(4,1),
  circunferencia_abdominal_cm INTEGER,
  tmb NUMERIC(7,2),
  calorias_diarias INTEGER,
  source TEXT NOT NULL DEFAULT 'manual',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas de histórico por usuário e data
CREATE INDEX idx_health_history_user_date 
  ON user_health_history(user_id, recorded_at DESC);

-- Índice para user_health_data
CREATE INDEX idx_user_health_user_id ON user_health_data(user_id);

-- 3. Trigger de validação para user_health_data
CREATE OR REPLACE FUNCTION validate_health_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar peso (30-300 kg)
  IF NEW.peso_kg IS NOT NULL AND (NEW.peso_kg < 30 OR NEW.peso_kg > 300) THEN
    RAISE EXCEPTION 'Peso deve estar entre 30 e 300 kg';
  END IF;
  
  -- Validar altura (100-250 cm)
  IF NEW.altura_cm IS NOT NULL AND (NEW.altura_cm < 100 OR NEW.altura_cm > 250) THEN
    RAISE EXCEPTION 'Altura deve estar entre 100 e 250 cm';
  END IF;
  
  -- Validar IMC (10-60)
  IF NEW.imc IS NOT NULL AND (NEW.imc < 10 OR NEW.imc > 60) THEN
    RAISE EXCEPTION 'IMC deve estar entre 10 e 60';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_health_data_trigger
  BEFORE INSERT OR UPDATE ON user_health_data
  FOR EACH ROW
  EXECUTE FUNCTION validate_health_data();

-- 4. Trigger para log automático de mudanças no histórico
CREATE OR REPLACE FUNCTION log_health_data_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Salvar valores anteriores no histórico se houve mudança significativa
  IF OLD.peso_kg IS DISTINCT FROM NEW.peso_kg 
     OR OLD.altura_cm IS DISTINCT FROM NEW.altura_cm 
     OR OLD.circunferencia_abdominal_cm IS DISTINCT FROM NEW.circunferencia_abdominal_cm THEN
    INSERT INTO user_health_history (
      user_id, peso_kg, altura_cm, imc, 
      circunferencia_abdominal_cm, tmb, calorias_diarias, source
    ) VALUES (
      OLD.user_id, OLD.peso_kg, OLD.altura_cm, OLD.imc,
      OLD.circunferencia_abdominal_cm, OLD.tmb, OLD.calorias_diarias, 'update'
    );
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER health_data_change_trigger
  BEFORE UPDATE ON user_health_data
  FOR EACH ROW
  EXECUTE FUNCTION log_health_data_changes();

-- 5. RLS para user_health_data
ALTER TABLE user_health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health data"
  ON user_health_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
  ON user_health_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data"
  ON user_health_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "No one can delete health data"
  ON user_health_data FOR DELETE
  TO authenticated
  USING (false);

-- 6. RLS para user_health_history (apenas leitura, insert apenas via trigger)
ALTER TABLE user_health_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health history"
  ON user_health_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Permitir insert para o trigger SECURITY DEFINER funcionar
CREATE POLICY "System can insert health history"
  ON user_health_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "No update to history"
  ON user_health_history FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No delete from history"
  ON user_health_history FOR DELETE
  TO authenticated
  USING (false);

-- 7. Migrar dados existentes de profiles para user_health_data
INSERT INTO user_health_data (user_id, peso_kg, altura_cm, imc, 
  circunferencia_abdominal_cm, tmb, calorias_diarias)
SELECT user_id, peso_kg, altura_cm, imc, 
  circunferencia_abdominal_cm, tmb, calorias_diarias
FROM profiles
WHERE peso_kg IS NOT NULL OR altura_cm IS NOT NULL;

-- 8. Salvar snapshot inicial no histórico
INSERT INTO user_health_history (user_id, peso_kg, altura_cm, imc, 
  circunferencia_abdominal_cm, tmb, calorias_diarias, source, recorded_at)
SELECT user_id, peso_kg, altura_cm, imc, 
  circunferencia_abdominal_cm, tmb, calorias_diarias, 'initial', 
  COALESCE(questionario_respondido_em, created_at)
FROM profiles
WHERE peso_kg IS NOT NULL OR altura_cm IS NOT NULL;

-- 9. Remover colunas de saúde de profiles
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS peso_kg,
  DROP COLUMN IF EXISTS altura_cm,
  DROP COLUMN IF EXISTS imc,
  DROP COLUMN IF EXISTS circunferencia_abdominal_cm,
  DROP COLUMN IF EXISTS tmb,
  DROP COLUMN IF EXISTS calorias_diarias;