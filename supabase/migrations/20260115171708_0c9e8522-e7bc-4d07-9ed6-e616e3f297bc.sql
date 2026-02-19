-- Create enum for restriction categories
CREATE TYPE public.restriction_category AS ENUM ('allergy', 'intolerance', 'health', 'dietary', 'religious');

-- Create table for predefined dietary restrictions
CREATE TABLE public.dietary_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category restriction_category NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  alternatives TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for user-selected restrictions
CREATE TABLE public.user_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restriction_id UUID REFERENCES public.dietary_restrictions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, restriction_id)
);

-- Enable RLS
ALTER TABLE public.dietary_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

-- RLS for dietary_restrictions (read-only for all authenticated users)
CREATE POLICY "Anyone can view dietary restrictions"
ON public.dietary_restrictions
FOR SELECT
TO authenticated
USING (true);

-- RLS for user_restrictions
CREATE POLICY "Users can view their own restrictions"
ON public.user_restrictions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own restrictions"
ON public.user_restrictions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own restrictions"
ON public.user_restrictions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert predefined restrictions

-- ===== ALERGIAS (allergy - red) =====
INSERT INTO public.dietary_restrictions (code, name, category, icon, color, keywords, alternatives, description) VALUES
('amendoim', 'Amendoim', 'allergy', '⚠️', 'red', ARRAY['amendoim', 'pasta de amendoim', 'manteiga de amendoim', 'paçoca'], ARRAY['Pasta de castanha de caju', 'Pasta de amêndoas', 'Tahine'], 'Alergia a amendoim e derivados'),
('frutos_mar', 'Frutos do Mar', 'allergy', '⚠️', 'red', ARRAY['camarão', 'lagosta', 'caranguejo', 'siri', 'ostra', 'mexilhão', 'lula', 'polvo', 'marisco'], ARRAY['Frango', 'Peixe de água doce', 'Tofu'], 'Alergia a frutos do mar'),
('ovo', 'Ovo', 'allergy', '⚠️', 'red', ARRAY['ovo', 'ovos', 'omelete', 'ovo cozido', 'ovo frito', 'clara', 'gema'], ARRAY['Tofu mexido', 'Chia com água', 'Linhaça'], 'Alergia a ovos'),
('nozes', 'Nozes e Castanhas', 'allergy', '⚠️', 'red', ARRAY['nozes', 'castanha', 'amêndoa', 'avelã', 'pistache', 'macadâmia', 'castanha de caju', 'castanha do pará'], ARRAY['Sementes de girassol', 'Sementes de abóbora', 'Coco'], 'Alergia a nozes e castanhas'),
('soja', 'Soja', 'allergy', '⚠️', 'red', ARRAY['soja', 'tofu', 'edamame', 'leite de soja', 'molho de soja', 'shoyu', 'missô'], ARRAY['Grão de bico', 'Lentilha', 'Leite de aveia'], 'Alergia a soja e derivados'),
('trigo', 'Trigo', 'allergy', '⚠️', 'red', ARRAY['trigo', 'farinha de trigo', 'pão', 'macarrão', 'biscoito', 'bolo'], ARRAY['Farinha de arroz', 'Farinha de amêndoas', 'Tapioca'], 'Alergia a trigo'),
('leite_vaca', 'Leite de Vaca', 'allergy', '⚠️', 'red', ARRAY['leite', 'queijo', 'iogurte', 'manteiga', 'cream cheese', 'requeijão', 'nata', 'creme de leite'], ARRAY['Leite de amêndoas', 'Leite de coco', 'Leite de aveia'], 'Alergia a proteína do leite de vaca'),
('peixe', 'Peixe', 'allergy', '⚠️', 'red', ARRAY['peixe', 'salmão', 'atum', 'tilápia', 'bacalhau', 'sardinha', 'anchova'], ARRAY['Frango', 'Carne bovina', 'Tofu'], 'Alergia a peixes');

-- ===== INTOLERÂNCIAS (intolerance - yellow) =====
INSERT INTO public.dietary_restrictions (code, name, category, icon, color, keywords, alternatives, description) VALUES
('lactose', 'Lactose', 'intolerance', '⚡', 'yellow', ARRAY['leite', 'queijo', 'iogurte', 'manteiga', 'cream cheese', 'requeijão', 'nata', 'creme de leite', 'sorvete'], ARRAY['Leite sem lactose', 'Leite de amêndoas', 'Leite de aveia', 'Queijo sem lactose'], 'Intolerância à lactose'),
('gluten', 'Glúten', 'intolerance', '⚡', 'yellow', ARRAY['pão', 'macarrão', 'trigo', 'cevada', 'centeio', 'aveia', 'biscoito', 'bolo', 'pizza', 'cerveja'], ARRAY['Pão sem glúten', 'Macarrão de arroz', 'Tapioca', 'Quinoa'], 'Intolerância ao glúten (doença celíaca)'),
('frutose', 'Frutose', 'intolerance', '⚡', 'yellow', ARRAY['mel', 'xarope de milho', 'agave', 'maçã', 'pera', 'manga'], ARRAY['Glicose', 'Dextrose', 'Frutas com baixa frutose'], 'Intolerância à frutose'),
('fodmap', 'FODMAPs', 'intolerance', '⚡', 'yellow', ARRAY['alho', 'cebola', 'feijão', 'lentilha', 'maçã', 'pera', 'leite', 'trigo'], ARRAY['Cebolinha verde', 'Gengibre', 'Arroz', 'Batata'], 'Sensibilidade a FODMAPs');

-- ===== CONDIÇÕES DE SAÚDE (health - blue) =====
INSERT INTO public.dietary_restrictions (code, name, category, icon, color, keywords, alternatives, description) VALUES
('diabetes', 'Diabetes', 'health', '🏥', 'blue', ARRAY['açúcar', 'mel', 'refrigerante', 'doce', 'bolo', 'sorvete', 'chocolate ao leite', 'suco industrializado'], ARRAY['Adoçante stevia', 'Chocolate 70% cacau', 'Frutas com baixo IG'], 'Restrição para controle de diabetes'),
('hipertensao', 'Hipertensão', 'health', '🏥', 'blue', ARRAY['sal', 'salsicha', 'bacon', 'presunto', 'embutidos', 'enlatados', 'temperos prontos', 'macarrão instantâneo'], ARRAY['Ervas frescas', 'Limão', 'Alho', 'Temperos naturais'], 'Restrição para controle de pressão alta'),
('colesterol', 'Colesterol Alto', 'health', '🏥', 'blue', ARRAY['bacon', 'manteiga', 'queijo amarelo', 'carne gorda', 'fritura', 'banha', 'pele de frango'], ARRAY['Azeite de oliva', 'Abacate', 'Peixes', 'Oleaginosas'], 'Restrição para controle de colesterol'),
('gota', 'Gota', 'health', '🏥', 'blue', ARRAY['cerveja', 'vísceras', 'frutos do mar', 'carne vermelha', 'sardinha', 'anchova'], ARRAY['Frango', 'Ovos', 'Laticínios', 'Vegetais'], 'Restrição para controle de ácido úrico'),
('renal', 'Doença Renal', 'health', '🏥', 'blue', ARRAY['sal', 'banana', 'laranja', 'tomate', 'batata', 'feijão', 'nozes'], ARRAY['Maçã', 'Uva', 'Arroz', 'Pão branco'], 'Restrição para doença renal crônica');

-- ===== DIETÉTICAS (dietary - green) =====
INSERT INTO public.dietary_restrictions (code, name, category, icon, color, keywords, alternatives, description) VALUES
('vegetariano', 'Vegetariano', 'dietary', '🌿', 'green', ARRAY['carne', 'frango', 'porco', 'peixe', 'camarão', 'bacon', 'salsicha', 'presunto', 'linguiça', 'bife', 'costela'], ARRAY['Tofu', 'Seitan', 'Grão de bico', 'Lentilha', 'Cogumelos'], 'Não consome carnes'),
('vegano', 'Vegano', 'dietary', '🌱', 'green', ARRAY['carne', 'frango', 'peixe', 'leite', 'queijo', 'ovo', 'mel', 'manteiga', 'iogurte', 'gelatina'], ARRAY['Leite vegetal', 'Queijo vegano', 'Tofu', 'Tempeh'], 'Não consome produtos de origem animal'),
('low_carb', 'Low Carb', 'dietary', '🥑', 'green', ARRAY['pão', 'arroz', 'macarrão', 'batata', 'açúcar', 'doce', 'refrigerante', 'suco', 'banana', 'uva'], ARRAY['Vegetais folhosos', 'Abacate', 'Ovos', 'Carnes', 'Oleaginosas'], 'Restrição de carboidratos'),
('keto', 'Cetogênica', 'dietary', '🥓', 'green', ARRAY['pão', 'arroz', 'macarrão', 'batata', 'açúcar', 'frutas doces', 'feijão', 'milho'], ARRAY['Carnes gordas', 'Abacate', 'Azeite', 'Manteiga', 'Queijos'], 'Dieta cetogênica (muito baixo carbo)'),
('paleo', 'Paleo', 'dietary', '🦴', 'green', ARRAY['grãos', 'leguminosas', 'laticínios', 'açúcar refinado', 'óleo vegetal', 'alimentos processados'], ARRAY['Carnes', 'Peixes', 'Vegetais', 'Frutas', 'Nozes'], 'Dieta paleolítica'),
('pescetariano', 'Pescetariano', 'dietary', '🐟', 'green', ARRAY['carne', 'frango', 'porco', 'bacon', 'salsicha', 'presunto', 'linguiça'], ARRAY['Peixe', 'Camarão', 'Frutos do mar', 'Ovos', 'Laticínios'], 'Come peixes, não come outras carnes');

-- ===== RELIGIOSAS (religious - purple) =====
INSERT INTO public.dietary_restrictions (code, name, category, icon, color, keywords, alternatives, description) VALUES
('kosher', 'Kosher', 'religious', '🔯', 'purple', ARRAY['porco', 'bacon', 'presunto', 'camarão', 'lagosta', 'caranguejo', 'polvo', 'lula'], ARRAY['Carne bovina kosher', 'Frango kosher', 'Peixe com escamas e barbatanas'], 'Alimentação kosher judaica'),
('halal', 'Halal', 'religious', '☪️', 'purple', ARRAY['porco', 'bacon', 'presunto', 'álcool', 'vinho', 'cerveja', 'licor'], ARRAY['Carne halal certificada', 'Frango halal', 'Peixe', 'Vegetais'], 'Alimentação halal islâmica'),
('hindu', 'Hindu (Sem Carne Bovina)', 'religious', '🕉️', 'purple', ARRAY['carne bovina', 'bife', 'hambúrguer', 'costela', 'carne moída'], ARRAY['Frango', 'Peixe', 'Cordeiro', 'Vegetais', 'Laticínios'], 'Não consome carne bovina'),
('quaresma', 'Quaresma/Sexta-feira Santa', 'religious', '✝️', 'purple', ARRAY['carne', 'frango', 'porco'], ARRAY['Peixe', 'Frutos do mar', 'Ovos', 'Vegetais'], 'Abstinência de carne em dias específicos');