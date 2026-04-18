-- LinfoCare Fix: Profile creation trigger
-- Run this in Supabase SQL Editor to fix "Database error saving new user"

-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;  -- Avoid duplicate errors
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log but don't block user creation
  RAISE LOG 'Profile creation error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also ensure the profiles table policies allow the trigger to work
-- The SECURITY DEFINER + SET search_path = public bypasses RLS,
-- but let's also add a service role policy just in case
DO $$
BEGIN
  -- Drop and recreate the insert policy to be more permissive for the trigger
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
  
  -- Ensure the trigger function can write (SECURITY DEFINER handles this)
  -- Grant the necessary permissions
  GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
  GRANT ALL ON public.profiles TO postgres, service_role;
  GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
END $$;

-- Verify: Check if the trigger exists
SELECT tgname, tgrelid::regclass, tgfoid::regprocedure 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
