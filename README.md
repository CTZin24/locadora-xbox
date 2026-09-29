# 🎮 XBOX LOCADORA - Plataforma Web Responsiva de Locação de Jogos

Plataforma Web moderna desenvolvida com **HTML5, CSS3 e JavaScript puro (Vanilla - sem frameworks)**, com arquitetura **Mobile-First** e integrada ao banco de dados relacional **PostgreSQL** rodando na **porta 5432**.

O sistema foi modelado especificamente para uma **Locadora de Jogos Eletrônicos Xbox**, com catálogo de títulos exclusivos, controle de clientes e gerenciamento ágil de locações e devoluções. Todas as telas utilizam linguagem comercial, intuitiva e livre de jargões técnicos.

---

## 📋 Sumário
1. [Sobre a Locadora](#-sobre-a-locadora)
2. [Estrutura do Banco de Dados (`locadora_xbox`)](#-estrutura-do-banco-de-dados-locadora_xbox)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Como Executar o Projeto em 1 Clique](#-como-executar-o-projeto)
5. [Como Conectar e Visualizar no DBeaver](#-como-conectar-e-visualizar-no-dbeaver)
6. [Módulos do Sistema (CRUD Completo)](#-módulos-do-sistema-crud-completo)
7. [Regras de Negócio e Validações](#-regras-de-negócio-e-validações)
8. [Estrutura de Arquivos](#-estrutura-de-arquivos)

---

## 🎮 Sobre a Locadora

A **Xbox Locadora** simula a experiência de um aplicativo nativo para celular, permitindo aos atendentes e clientes:
- Explorar o catálogo de jogos exclusivos Xbox (como *Halo Infinite*, *Forza Horizon 5*, *Starfield*, *Senua's Saga*, *Gears 5* e *Hi-Fi RUSH*).
- Acompanhar quais jogos estão disponíveis e quais estão alugados no momento.
- Realizar cadastro de novos clientes com validação de dados em tempo real.
- Registrar locações e realizar a devolução rápida com **1 toque**.

A interface foi projetada para uso em telas sensíveis ao toque, com botões amplos ($\ge 44\text{px}$), barra de navegação inferior estilo app, modais fluidos e alertas visuais animados (*toasts*).

---

## 🗄️ Estrutura do Banco de Dados (`locadora_xbox`)

O banco de dados foi nomeado como **`locadora_xbox`** e substituiu a antiga tabela de livros pela tabela oficial **`jogo`**:

| Tabela | Descrição | Principais Campos |
| :--- | :--- | :--- |
| **`jogo`** | Catálogo de jogos Xbox (substitui `livro`) | `id_jogo`, `titulo`, `desenvolvedora`, `ano_lancamento`, `id_categoria` |
| **`cliente`** | Jogadores cadastrados na locadora | `id_cliente`, `nome`, `email` (único), `data_nascimento` |
| **`categoria`** | Gêneros dos jogos (Ação, RPG, Corrida, etc.) | `id_categoria`, `nome` (único) |
| **`locacao`** | Registro de locações e devoluções | `id_locacao`, `id_cliente`, `id_jogo`, `data_locacao`, `data_devolucao`, `status` |

> 📌 **Compatibilidade Pedagógica**: O script SQL também cria *views* automáticas (`aluno`, `livro`, `emprestimo`), garantindo que qualquer consulta legada do professor continue funcionando perfeitamente sem erros.

---

## 🛠️ Tecnologias Utilizadas

### Front-end (100% Vanilla - Sem Frameworks)
- **HTML5 Semântico**: Tags nativas acessíveis, navegação SPA e diálogos modais `<dialog>`.
- **CSS3 Moderno**: Abordagem Mobile-First, flexbox, CSS Grid, variáveis CSS, suporte a safe-area de celulares e transições.
- **JavaScript (ES6+)**: Fetch API, manipulação de DOM, buscas e filtros em tempo real, validações client-side e feedback visual com *toasts*.

### Backend
- **Node.js (Módulo nativo `http`)**: Servidor e API REST construídos puramente em JavaScript vanilla, sem frameworks pesados (sem Express).
- **Driver `pg` (node-postgres)**: Conexão direta de alto desempenho com o PostgreSQL na porta 5432.

### Banco de Dados
- **PostgreSQL 16**: Porta padrão **5432**, banco **`locadora_xbox`**.

---

## 🚀 Como Executar e Acessar (Local e no Celular via IPv4)

### Opção 1: Inicialização em 1 Clique (Recomendada no Windows)
Na pasta do projeto, basta dar **dois cliques** no arquivo:
```
iniciar_tudo.bat
```
Ele irá automaticamente iniciar o PostgreSQL na porta 5432, o servidor Node.js e abrir o navegador.

---

### 📱 Como Acessar pelo Celular ou outros Dispositivos

O servidor está configurado para responder em **todas as interfaces de rede (`0.0.0.0`)**:

1. **Pelo Celular (no mesmo Wi-Fi da sua casa/rede)**:
   Abra o navegador do celular e digite:
   👉 **`http://192.168.1.6:3000`**

2. **Pelo IP Público IPv4**:
   O IP público da sua conexão de internet é:
   👉 **`http://45.172.97.186:3000`**
   *(Nota: Se o seu roteador bloquear conexões externas diretas via NAT/firewall do provedor, use o atalho abaixo).*

3. **Acesso Público Global (4G / 5G / Qualquer Rede Externa)**:
   Dê dois cliques no arquivo:
   👉 **`acesso_publico_internet.bat`**
   Ele gera na hora um link público oficial seguro (HTTPS) para você abrir no celular via 4G/5G ou enviar para qualquer pessoa testar pela internet!


---

### Opção 2: Pelo Terminal (PowerShell ou CMD)

1. Inicie o banco de dados:
   ```cmd
   iniciar_banco.bat
   ```

2. Inicie o servidor da aplicação:
   ```cmd
   node server.js
   ```

3. Acesse no navegador:
   [http://localhost:3000](http://localhost:3000)

---

## 🐘 Como Conectar e Visualizar no DBeaver

O banco de dados está ativo na porta 5432 e pronto para ser visualizado no **DBeaver**.

### Credenciais de Acesso:
- **Host / Servidor**: `localhost` (ou `127.0.0.1`)
- **Porta**: `5432`
- **Banco de Dados**: `locadora_xbox`
- **Usuário**: `postgres`
- **Senha**: `postgres`

### Passo a Passo no DBeaver:
1. Abra o DBeaver (ou execute [`abrir_dbeaver.bat`](file:///C:/Users/eduar/.gemini/antigravity/scratch/xbox-biblioteca/abrir_dbeaver.bat)).
2. Clique no menu **Banco de Dados** > **Nova Conexão**.
3. Selecione **PostgreSQL** e clique em **Avançar**.
4. Configure as opções:
   - **Host**: `localhost`
   - **Porta**: `5432`
   - **Banco de dados**: `locadora_xbox`
   - **Nome de usuário**: `postgres`
   - **Senha**: `postgres`
5. Clique em **Testar Conexão...** e depois em **Concluir**.
6. No painel esquerdo do DBeaver, navegue em:
   `locadora_xbox` ➔ `Schemas` ➔ `public` ➔ `Tabelas (Tables)`.
7. Dê dois cliques em qualquer tabela (`jogo`, `cliente`, `locacao`, `categoria`) e abra a aba **Dados** para ver as locações em tempo real ou a aba **Diagrama ER** para ver os relacionamentos.

---

## 📱 Módulos do Sistema (CRUD Completo)

### 1. Catálogo de Jogos (`jogo`)
- **Cadastrar**: Título, Desenvolvedora, Ano de lançamento e Gênero.
- **Consultar**: Filtro por gênero e busca em tempo real por título ou estúdio.
- **Indicador de Disponibilidade**: Badge verde `Disponível` ou amarela `Alugado` calculada dinamicamente com base nas locações em aberto.
- **Alterar & Excluir**: Atualização de dados cadastrais e remoção com confirmação de segurança.

### 2. Clientes da Locadora (`cliente`)
- **Cadastrar**: Nome completo, e-mail e data de nascimento.
- **Consultar**: Busca por nome ou e-mail, exibição da quantidade de jogos em posse no momento.
- **Alterar & Excluir**: Edição e exclusão segura.

### 3. Controle de Locações (`locacao`)
- **Registrar Locação**: Seleção do cliente e do jogo através de dropdowns inteligentes, data de saída e situação inicial.
- **Filtros por Abas**: `Todas as Locações`, `Em Aberto (Alugados)` e `Devolvidos`.
- **Devolução Rápida (1 Toque)**: Botão verde *"Devolver Jogo"* que preenche automaticamente a data de devolução com o dia de hoje e altera o status para *Devolvido*.
- **Editar & Cancelar**: Ajuste de datas e cancelamento de registros.

### 4. Gêneros de Jogos (`categoria`)
- **Cadastrar & Editar**: Cadastro de novos gêneros (Ação, RPG, Corrida, etc.).
- **Consultar**: Contador dinâmico de títulos vinculados a cada gênero.
- **Excluir**: Remoção segura que protege o catálogo caso haja jogos vinculados.

---

## 🛡️ Regras de Negócio e Validações

O sistema trata todas as regras de forma suave e amigável:
- **E-mail Único**: Impede cadastro duplicado avisando: *"Este e-mail já está cadastrado para outro cliente."*
- **Gênero Único**: Impede categorias repetidas.
- **Consistência de Datas**: A data de devolução não pode ser anterior à data em que o jogo foi retirado.
- **Proteção de Integridade**: Ao tentar excluir um cliente ou jogo com histórico de locações ativas, o sistema avisa com clareza a restrição sem exibir códigos de erro crus.

---

## 📂 Estrutura de Arquivos

```
xbox-biblioteca/
├── locadora_xbox.sql       # Script oficial do banco de dados (locadora_xbox)
├── server.js               # Servidor Web & API REST nativa (Node.js Vanilla + pg)
├── package.json            # Metadados do projeto
├── README.md               # Este guia completo de instruções
│
├── iniciar_tudo.bat        # Inicializador em 1 clique (Banco + Servidor + Navegador)
├── iniciar_banco.bat       # Inicia o PostgreSQL na porta 5432
├── parar_banco.bat         # Finaliza o PostgreSQL com segurança
├── resetar_banco.bat       # Restaura o banco 'locadora_xbox' com dados padrão
├── abrir_dbeaver.bat       # Abre o DBeaver automaticamente
│
├── pgsql/                  # Binários portáteis do PostgreSQL 16
│   ├── bin/                # Utilitários (pg_ctl, psql, createdb)
│   └── data/               # Dados do banco de dados local
│
└── public/                 # Front-End (HTML5, CSS3, Vanilla JS)
    ├── index.html          # Interface da aplicação SPA
    ├── css/
    │   └── style.css       # Estilos Mobile-First tema escuro Xbox
    └── js/
        └── app.js          # Lógica do app, rotas SPA e integração com a API
```
