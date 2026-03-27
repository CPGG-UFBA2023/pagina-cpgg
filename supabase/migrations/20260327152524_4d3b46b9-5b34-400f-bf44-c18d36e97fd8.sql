
-- Insert missing laboratories
INSERT INTO public.laboratories (name, acronym, chief_name, chief_alternative_email)
VALUES 
  ('Laboratório de Geofísica de Exploração de Petróleo', 'LAGEP', 'prof. Milton José Porsani', NULL),
  ('Laboratório de Modelagem Física', 'LAMOD', 'Prof. Dr. Luiz Cesar Correa Gomes', 'lccgomes@ufba.br'),
  ('Laboratório de Tecnologia Mineral - Raios X', 'LTM-RX', 'Renato Carlos Vieira Santiago', 'rcsantiago@ufba.br')
ON CONFLICT DO NOTHING;
