-- Corrigir search_path para função validate_health_data
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
$$ LANGUAGE plpgsql SET search_path = public;