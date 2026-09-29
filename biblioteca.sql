CREATE TABLE aluno (
    id_aluno SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    data_nascimento DATE
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE livro (
    id_livro SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    ano_publicacao INT NOT NULL CHECK (ano_publicacao >= 1500),
    id_categoria INT NOT NULL,

    CONSTRAINT fk_livro_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
);

CREATE TABLE emprestimo (
    id_emprestimo SERIAL PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_livro INT NOT NULL,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_devolucao DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Em aberto',

    CONSTRAINT fk_emprestimo_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES aluno(id_aluno),

    CONSTRAINT fk_emprestimo_livro
        FOREIGN KEY (id_livro)
        REFERENCES livro(id_livro),

    CONSTRAINT chk_status
        CHECK (status IN ('Em aberto', 'Devolvido')),

    CONSTRAINT chk_datas
        CHECK (data_devolucao IS NULL OR data_devolucao >= data_emprestimo)
);


INSERT INTO categoria (nome) VALUES
('Programação'),
('Banco de Dados'),
('Literatura'),
('Tecnologia');

INSERT INTO aluno (nome, email, data_nascimento) VALUES
('Ana Souza', 'ana@email.com', '2009-03-15'),
('Bruno Santos', 'bruno@email.com', '2008-07-20'),
('Carla Oliveira', 'carla@email.com', '2009-01-10'),
('Diego Lima', 'diego@email.com', '2008-11-05'),
('Eduarda Costa', 'eduarda@email.com', '2009-09-25');

INSERT INTO livro (titulo, autor, ano_publicacao, id_categoria) VALUES
('Introdução à Programação', 'Carlos Silva', 2020, 1),
('Lógica de Programação', 'Maria Souza', 2019, 1),
('Banco de Dados', 'João Santos', 2021, 2),
('SQL para Iniciantes', 'Pedro Lima', 2022, 2),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 1943, 3),
('Dom Casmurro', 'Machado de Assis', 1899, 3),
('Tecnologia do Futuro', 'Ana Martins', 2023, 4),
('Desenvolvimento Web', 'Lucas Pereira', 2022, 4);

INSERT INTO emprestimo 
(id_aluno, id_livro, data_emprestimo, status) 
VALUES
(1, 1, '2026-08-10', 'Em aberto'),
(2, 3, '2026-08-10', 'Em aberto'),
(3, 5, '2026-08-09', 'Devolvido'),
(4, 2, '2026-08-08', 'Em aberto'),
(5, 4, '2026-08-07', 'Devolvido');

UPDATE emprestimo
SET data_devolucao = '2026-08-10',
    status = 'Devolvido'
WHERE id_emprestimo = 3;