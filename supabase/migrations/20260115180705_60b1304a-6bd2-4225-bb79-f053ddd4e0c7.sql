-- =============================================
-- FORTALECER RLS POLICIES - Segurança Aprimorada
-- =============================================

-- 1. DROP políticas antigas da tabela PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON profiles;
DROP POLICY IF EXISTS "No one can delete profiles" ON profiles;

-- 2. Novas políticas PROFILES (mais rigorosas)
CREATE POLICY "Users can view own profile only"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile only"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile only"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "No one can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (false);

-- 3. DROP políticas antigas da tabela CUSTOM_FOODS
DROP POLICY IF EXISTS "Users can view their own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can insert their own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can update their own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can delete their own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can view own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can create own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can update own custom foods" ON custom_foods;
DROP POLICY IF EXISTS "Users can delete own custom foods" ON custom_foods;

-- 4. Novas políticas CUSTOM_FOODS
CREATE POLICY "Users can view own custom foods"
  ON custom_foods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom foods"
  ON custom_foods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom foods"
  ON custom_foods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom foods"
  ON custom_foods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. DROP políticas antigas da tabela USER_RESTRICTIONS
DROP POLICY IF EXISTS "Users can view their own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Users can insert their own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Users can delete their own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Users can view own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Users can create own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Users can delete own restrictions" ON user_restrictions;

-- 6. Novas políticas USER_RESTRICTIONS (consistente com as outras)
CREATE POLICY "Users can view own restrictions"
  ON user_restrictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own restrictions"
  ON user_restrictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own restrictions"
  ON user_restrictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);