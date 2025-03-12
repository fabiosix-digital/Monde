/*
  # Create Admin User

  1. Changes
    - Insert admin user into auth.users
    - Create admin profile in profiles table
    
  2. Security
    - Password will be hashed by Supabase
    - Email verification is disabled
*/

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Create admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_current,
    email_change,
    email_change_token_new,
    recovery_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    ''
  FROM (
    SELECT gen_random_uuid() as id
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
    )
  ) new_user
  RETURNING id INTO admin_user_id;

  -- Create admin profile if user was created
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@example.com',
      'Administrator',
      now(),
      now()
    );
  END IF;
END $$;