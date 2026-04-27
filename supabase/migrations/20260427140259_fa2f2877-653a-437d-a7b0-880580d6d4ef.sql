-- Técnico: ver apenas OS atribuídas
DROP POLICY IF EXISTS "Technicians can view all OS" ON public.service_orders;

CREATE POLICY "Technicians can view assigned OS"
ON public.service_orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'technician'::app_role)
  AND assigned_to = auth.uid()
);

-- Administrativo: visão completa OS
CREATE POLICY "Administrative can view all OS"
ON public.service_orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'administrative'::app_role));

CREATE POLICY "Administrative can update OS"
ON public.service_orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'administrative'::app_role));

CREATE POLICY "Administrative can insert OS"
ON public.service_orders
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrative'::app_role));

-- Administrativo: gerenciar clientes
CREATE POLICY "Administrative can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'administrative'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrative'::app_role));

-- Coordenador
CREATE POLICY "Coordinators can view all OS"
ON public.service_orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Coordinators can update OS"
ON public.service_orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Coordinators can insert OS"
ON public.service_orders
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'coordinator'::app_role));