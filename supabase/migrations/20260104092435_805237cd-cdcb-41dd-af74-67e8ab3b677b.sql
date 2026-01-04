-- Deletar Amin Bassrei do programa oil
DELETE FROM researchers WHERE id = '6947f4cb-41eb-45d5-bb44-efa485369f89';

-- Inserir Marcos Vasconcelos2 no programa oil
INSERT INTO researchers (name, program, institution, is_chief, email)
VALUES ('Marcos Vasconcelos2', 'oil', 'UFBA', false, 'marcos.vasconcelos@ufba.br');