/*
  # Atualizar tabela de atendimentos

  1. Verificações e Atualizações
    - Verifica se a tabela existe antes de criar
    - Adiciona políticas de segurança
    - Configura trigger de atualização

  2. Segurança
    - Habilita RLS na tabela
    - Adiciona políticas para usuários autenticados:
      - Inserção
      - Leitura
      - Atualização
      - Deleção

  3. Automação
    - Trigger para atualizar timestamp
*/

-- Função para atualizar o timestamp
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';
END $$;

-- Criar tabela se não existir
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
    CREATE TABLE tickets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name text NOT NULL,
      customer_email text NOT NULL,
      customer_phone text NOT NULL,
      observations text,
      return_date timestamptz NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      color text NOT NULL,
      user_id uuid REFERENCES auth.users(id) NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DO $$ BEGIN
  DROP POLICY IF EXISTS "Usuários podem criar tickets" ON tickets;
  DROP POLICY IF EXISTS "Usuários podem ver seus tickets" ON tickets;
  DROP POLICY IF EXISTS "Usuários podem atualizar seus tickets" ON tickets;
  DROP POLICY IF EXISTS "Usuários podem deletar seus tickets" ON tickets;
END $$;

-- Criar novas políticas
CREATE POLICY "Usuários podem criar tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

-- Criar novo trigger
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();