CREATE TABLE IF NOT EXISTS checklist_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler checklist" ON checklist_templates FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem gerenciar checklist" ON checklist_templates FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO checklist_templates (item, order_index) VALUES
  ('Verificar alimentação elétrica dos equipamentos', 1),
  ('Limpar lentes das câmeras', 2),
  ('Testar funcionamento das catracas', 3),
  ('Verificar conexões de rede', 4),
  ('Checar armazenamento do DVR/NVR', 5),
  ('Testar acionamento do controle de acesso', 6),
  ('Verificar logs de eventos', 7),
  ('Registrar observações gerais', 8);

CREATE TABLE IF NOT EXISTS os_checklist_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES service_orders(id) ON DELETE CASCADE,
  template_id uuid REFERENCES checklist_templates(id) ON DELETE CASCADE,
  item text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  checked_by_name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, template_id)
);

ALTER TABLE os_checklist_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler respostas" ON os_checklist_responses FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem gerenciar respostas" ON os_checklist_responses FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for checklist tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.os_checklist_responses;

-- Create function to auto-populate checklist responses when OS is created
CREATE OR REPLACE FUNCTION public.create_checklist_for_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.os_checklist_responses (order_id, template_id, item)
  SELECT NEW.id, id, item
  FROM public.checklist_templates
  WHERE active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-create checklist when new OS is inserted
DROP TRIGGER IF EXISTS auto_create_checklist ON public.service_orders;
CREATE TRIGGER auto_create_checklist
  AFTER INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_checklist_for_order();