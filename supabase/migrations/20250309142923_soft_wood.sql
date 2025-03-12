/*
  # Fix role column and policies

  1. Changes
    - Add role column if it doesn't exist
    - Update policies to use proper role checks
    - Ensure admin role exists

  2. Security
    - Update policies to handle role-based access
*/

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Recreate policies with proper role checks
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Ensure at least one admin exists (using the current user as admin if none exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE role = 'admin'
  ) THEN
    INSERT INTO profiles (id, email, role)
    SELECT 
      id,
      email,
      'admin'
    FROM auth.users
    WHERE email = 'admin@admin.com'
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
  END IF;
END $$;