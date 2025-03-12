/*
  # Criar tabela de atendimentos

  1. Nova Tabela
    - `tickets`
      - `id` (uuid, chave primária)
      - `customer_name` (texto, nome do cliente)
      - `customer_email` (texto, email do cliente)
      - `customer_phone` (texto, telefone do cliente)
      - `observations` (texto, observações)
      - `return_date` (timestamp com timezone, data de retorno)
      - `status` (texto, status do atendimento)
      - `color` (texto, cor do card)
      - `user_id` (uuid, referência ao usuário)
      - `created_at` (timestamp com timezone)
      - `updated_at` (timestamp com timezone)

  2. Segurança
    - Habilitar RLS
    - Adicionar políticas para usuários autenticados
*/

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

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Política para inserir tickets
CREATE POLICY "Usuários podem criar tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para visualizar tickets
CREATE POLICY "Usuários podem ver seus tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para atualizar tickets
CREATE POLICY "Usuários podem atualizar seus tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para deletar tickets
CREATE POLICY "Usuários podem deletar seus tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();