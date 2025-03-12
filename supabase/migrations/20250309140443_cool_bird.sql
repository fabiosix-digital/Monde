/*
  # Criar tabela de atendimentos e configurar segurança

  1. Estrutura
    - Tabela `tickets` para armazenar atendimentos
    - Campos para informações do cliente e status
    - Timestamps para auditoria

  2. Segurança
    - RLS habilitado
    - Políticas para CRUD baseadas no usuário autenticado

  3. Automação
    - Trigger para atualização automática de timestamps
*/

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  observations text,
  return_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  color text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem criar tickets" ON tickets;
DROP POLICY IF EXISTS "Usuários podem ver seus tickets" ON tickets;
DROP POLICY IF EXISTS "Usuários podem atualizar seus tickets" ON tickets;
DROP POLICY IF EXISTS "Usuários podem deletar seus tickets" ON tickets;

-- Criar políticas de segurança
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

-- Configurar trigger de atualização
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();