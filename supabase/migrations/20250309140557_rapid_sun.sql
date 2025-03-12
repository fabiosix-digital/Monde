/*
  # Configuração da tabela de atendimentos

  1. Estrutura
    - Tabela `tickets` para armazenar atendimentos
    - Relacionamento com usuários através de `user_id`
    - Campos para informações do cliente e status
    - Timestamps para auditoria

  2. Segurança
    - RLS habilitado
    - Políticas para CRUD baseadas no usuário autenticado
    - Restrições de chave estrangeira

  3. Automação
    - Trigger para atualização automática de timestamps
*/

-- Criar função para atualizar timestamp se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover tabela existente se necessário
DROP TABLE IF EXISTS tickets;

-- Criar nova tabela
CREATE TABLE tickets (
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
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

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

-- Criar trigger para atualização automática
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();