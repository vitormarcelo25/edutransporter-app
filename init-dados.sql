INSERT IGNORE INTO cidade (id, nome, estado) VALUES (1, 'Florianopolis', 'SC');

INSERT IGNORE INTO faculdade (id, nome, cidade_id) VALUES (1, 'UFSC', 1);

INSERT IGNORE INTO aluno (cpf, nome, numero_celular, senha, cidade_id, faculdade_id)
VALUES ('71409312060', 'Vitor Teste', '48999999999', '$2b$12$2r82vbqJVrlFi0YKRoUD0.DLM3izVIQnkr4XB2SOocJaPUnoWVV2a', 1, 1);

INSERT IGNORE INTO motorista (cpf, nome, numero_celular, senha, carteira_conducao, cidade_id)
VALUES ('11122233344', 'Motorista Teste', '48988888888', '$2b$12$2r82vbqJVrlFi0YKRoUD0.DLM3izVIQnkr4XB2SOocJaPUnoWVV2a', '12345678900', 1);

INSERT IGNORE INTO veiculo (id, placa, modelo) VALUES (1, 'ABC1D23', 'Van Escolar');

INSERT IGNORE INTO viagem (id, nome_rota, tipo_viagem, data, motorista_cpf, veiculo_id)
VALUES (2, 'Rota Centro', 'IDA', CURDATE(), '11122233344', 1);
