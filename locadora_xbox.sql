-- ========================================================
-- BANCO DE DADOS: locadora_xbox
-- Sistema de Locadora de Jogos Eletrônicos Xbox
-- Porta: 5432 | SGBD: PostgreSQL
-- ========================================================

-- Tabela de Gêneros / Categorias dos Jogos
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de Clientes da Locadora
CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    data_nascimento DATE
);

-- Tabela de Jogos Xbox (substitui 'livro')
CREATE TABLE jogo (
    id_jogo SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    desenvolvedora VARCHAR(100) NOT NULL,
    ano_lancamento INT NOT NULL CHECK (ano_lancamento >= 1980),
    id_categoria INT NOT NULL,

    CONSTRAINT fk_jogo_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
);

-- Tabela de Locações de Jogos
CREATE TABLE locacao (
    id_locacao SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_jogo INT NOT NULL,
    data_locacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_devolucao DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Em aberto',

    CONSTRAINT fk_locacao_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),

    CONSTRAINT fk_locacao_jogo
        FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo),

    CONSTRAINT chk_status
        CHECK (status IN ('Em aberto', 'Devolvido')),

    CONSTRAINT chk_datas
        CHECK (data_devolucao IS NULL OR data_devolucao >= data_locacao)
);

-- Views de compatibilidade pedagógica (caso o professor ainda consulte os nomes antigos)
CREATE OR REPLACE VIEW aluno AS 
    SELECT id_cliente AS id_aluno, nome, email, data_nascimento FROM cliente;

CREATE OR REPLACE VIEW livro AS 
    SELECT id_jogo AS id_livro, titulo, desenvolvedora AS autor, ano_lancamento AS ano_publicacao, id_categoria FROM jogo;

CREATE OR REPLACE VIEW emprestimo AS 
    SELECT id_locacao AS id_emprestimo, id_cliente AS id_aluno, id_jogo AS id_livro, 
           data_locacao AS data_emprestimo, data_devolucao, status FROM locacao;

-- ========================================================
-- DADOS INICIAIS (TEMÁTICA EXCLUSIVA XBOX)
-- ========================================================

-- 1. Gêneros dos Jogos
INSERT INTO categoria (nome) VALUES
('Ação e Aventura'),
('Corrida e Simulador'),
('RPG e Fantasia'),
('Tiro (FPS)'),
('Esportes'),
('Sobrevivência e Sandbox');

-- 2. Clientes da Locadora
INSERT INTO cliente (nome, email, data_nascimento) VALUES
('Gabriel Mendes', 'gabriel.mendes@email.com', '2002-04-18'),
('Larissa Vasconcelos', 'larissa.v@email.com', '2004-11-23'),
('Matheus Albuquerque', 'matheus.gamer@email.com', '2001-08-05'),
('Camila Rocha', 'camila.rocha@email.com', '2003-02-14'),
('Rodrigo Silveira', 'rodrigo.xbox@email.com', '1999-12-30'),
('Amanda Farias', 'amanda.farias@email.com', '2005-07-09');

-- 3. Catálogo de Jogos Xbox
INSERT INTO jogo (titulo, desenvolvedora, ano_lancamento, id_categoria) VALUES
('Halo Infinite', '343 Industries', 2021, 4),
('Forza Horizon 5', 'Playground Games', 2021, 2),
('Gears 5', 'The Coalition', 2019, 1),
('Starfield', 'Bethesda Game Studios', 2023, 3),
('Senua''s Saga: Hellblade II', 'Ninja Theory', 2024, 1),
('Sea of Thieves', 'Rare', 2018, 1),
('Hi-Fi RUSH', 'Tango Gameworks', 2023, 1),
('Forza Motorsport', 'Turn 10 Studios', 2023, 2),
('Fable Anniversary', 'Lionhead Studios', 2014, 3),
('Minecraft', 'Mojang Studios', 2011, 6),
('Ori and the Will of the Wisps', 'Moon Studios', 2020, 1),
('EA Sports FC 24', 'EA Sports', 2023, 5);

-- 4. Histórico de Locações
INSERT INTO locacao (id_cliente, id_jogo, data_locacao, status) VALUES
(1, 1, '2026-09-20', 'Em aberto'),
(2, 2, '2026-09-22', 'Em aberto'),
(3, 4, '2026-09-15', 'Devolvido'),
(4, 6, '2026-09-25', 'Em aberto'),
(5, 3, '2026-09-10', 'Devolvido'),
(6, 7, '2026-09-26', 'Em aberto');

UPDATE locacao
SET data_devolucao = '2026-09-22', status = 'Devolvido'
WHERE id_locacao = 3;

UPDATE locacao
SET data_devolucao = '2026-09-18', status = 'Devolvido'
WHERE id_locacao = 5;
