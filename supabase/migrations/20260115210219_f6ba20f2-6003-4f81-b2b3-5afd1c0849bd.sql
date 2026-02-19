-- Create immutable hash_email function using pgcrypto from extensions schema
CREATE OR REPLACE FUNCTION public.hash_email(email_input TEXT)
RETURNS VARCHAR(64)
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT encode(extensions.digest(LOWER(email_input), 'sha256'), 'hex')
$$;

-- Add email_hash as generated column to profiles
ALTER TABLE profiles 
ADD COLUMN email_hash VARCHAR(64) GENERATED ALWAYS AS (
  public.hash_email(email)
) STORED;

-- Create unique index for fast lookups and duplicate prevention
CREATE UNIQUE INDEX idx_profiles_email_hash ON profiles(email_hash);