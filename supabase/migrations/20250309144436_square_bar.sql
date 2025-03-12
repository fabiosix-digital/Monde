/*
  # Adicionar coluna de telefone aos perfis

  1. Alterações
    - Adiciona coluna 'phone' à tabela 'profiles'
    
  2. Motivo
    - Permitir armazenar o número de telefone dos usuários
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;