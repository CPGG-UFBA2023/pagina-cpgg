-- Excluir Ana Virgínia Alves de Santana
DELETE FROM researchers WHERE name = 'Ana Virgínia Alves de Santana';

-- Inserir Marcos Vasconcelos2 no programa oil
INSERT INTO researchers (name, program, institution, is_chief)
VALUES ('Marcos Vasconcelos2', 'oil', 'UFBA', false)
ON CONFLICT DO NOTHING;