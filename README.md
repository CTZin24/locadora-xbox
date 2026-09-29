# 🎮 XBOX LOCADORA - Plataforma Web Responsiva de Locação de Jogos

Plataforma Web moderna desenvolvida com **HTML5, CSS3 e JavaScript puro (Vanilla - sem frameworks)**, com arquitetura **Mobile-First** e integrada ao banco de dados relacional **PostgreSQL** rodando na **porta 5432**.

O sistema foi modelado para uma **Locadora de Jogos Eletrônicos Xbox**, com catálogo de títulos exclusivos, controle de clientes e gerenciamento de locações e devoluções. Todas as telas utilizam linguagem comercial, intuitiva e sem termos técnicos de programação.

---

## 📋 Sumário
1. [Sobre a Locadora](#-sobre-a-locadora)
2. [Estrutura do Banco de Dados (`locadora_xbox`)](#-estrutura-do-banco-de-dados-locadora_xbox)
3. [Como Rodar no Computador da Escola (SEM .bat - Passo a Passo)](#-como-rodar-no-computador-da-escola-sem-bat---passo-a-passo)
4. [Como Rodar em Casa com os Scripts .bat](#-como-rodar-em-casa-com-os-scripts-bat)
5. [Como Conectar e Visualizar no DBeaver](#-como-conectar-e-visualizar-no-dbeaver)
6. [Como Acessar no Celular (Mobile Testing)](#-como-acessar-no-celular-mobile-testing)
7. [Módulos do Sistema (CRUD Completo)](#-módulos-do-sistema-crud-completo)
8. [Regras de Negócio e Validações](#-regras-de-negócio-e-validações)
9. [Estrutura de Arquivos](#-estrutura-de-arquivos)

---

## 🎮 Sobre a Locadora

A **Xbox Locadora** simula a experiência de um aplicativo mobile no navegador, permitindo:
- Explorar o catálogo de jogos exclusivos Xbox (*Halo Infinite*, *Forza Horizon 5*, *Starfield*, *Senua's Saga*, *Gears 5*, *Hi-Fi RUSH*, etc.).
- Acompanhar quais títulos estão disponíveis e quais estão alugados no momento.
- Realizar cadastro de novos clientes com validações em tempo real.
- Registrar locações e realizar devoluções rápidas com **1 toque**.

A interface foi projetada para telas sensíveis ao toque, com botões amplos ($\ge 44\text{px}$), barra de navegação inferior estilo app, modais nativos e avisos animados (*toasts*).

---

## 🗄️ Estrutura do Banco de Dados (`locadora_xbox`)

O banco de dados relacional oficial chama-se **`locadora_xbox`**:

| Tabela | Descrição | Principais Campos |
| :--- | :--- | :--- |
| **`jogo`** | Catálogo de jogos Xbox (substitui `livro`) | `id_jogo`, `titulo`, `desenvolvedora`, `ano_lancamento`, `id_categoria` |
| **`cliente`** | Jogadores cadastrados na locadora | `id_cliente`, `nome`, `email` (único), `data_nascimento` |
| **`categoria`** | Gêneros dos jogos (Ação, RPG, Corrida, etc.) | `id_categoria`, `nome` (único) |
| **`locacao`** | Registro de locações e devoluções | `id_locacao`, `id_cliente`, `id_jogo`, `data_locacao`, `data_devolucao`, `status` |

> 📌 **Compatibilidade Pedagógica**: O script SQL inclui *views* automáticas (`aluno`, `livro`, `emprestimo`), garantindo que consultas que utilizem os nomes antigos do modelo da biblioteca continuem funcionando sem falhas.

---

## 🏫 Como Rodar no Computador da Escola (SEM .bat - Passo a Passo)

Caso as políticas de segurança da escola impeçam a execução de arquivos `.bat` ou você prefira rodar manualmente pelo terminal / VS Code, siga este passo a passo garantido:

### 1. Preparar o Banco no DBeaver / pgAdmin da Escola
Nos computadores do laboratório, o PostgreSQL geralmente já está instalado e rodando como serviço do Windows na porta **5432**.

1. Abra o **DBeaver** ou **pgAdmin**.
2. Conecte-se ao PostgreSQL local (porta `5432`, usuário `postgres`).
3. Crie um novo banco de dados chamado **`locadora_xbox`**:
   - No DBeaver: Clique com botão direito em *Databases* > *Criar Novo Banco de Dados* > Nome: `locadora_xbox`.
4. Abra o arquivo **`locadora_xbox.sql`** dentro do DBeaver/pgAdmin.
5. Clique em **Executar Script** (atalho `Alt + X` ou ícone de play no DBeaver).
6. Pronto! As tabelas `jogo`, `cliente`, `categoria` e `locacao` serão criadas e populadas com os dados do catálogo Xbox.

---

### 2. Rodar a Aplicação pelo Terminal (CMD / PowerShell / VS Code)

1. Abra a pasta do projeto no **VS Code** (ou abra o **Prompt de Comando** / **PowerShell** na pasta do projeto).
2. Instale as dependências do Node.js (necessário apenas na primeira vez):
   ```bash
   npm install
   ```
3. Inicie o servidor da aplicação:
   ```bash
   node server.js
   ```

> 💡 **Dica (Senha diferente no PC da escola)**:  
> Se o PostgreSQL da escola usar uma senha diferente de `postgres`, você pode informá-la diretamente no comando:  
> - **No PowerShell**:  
>   ```powershell
>   $env:DB_USER="postgres"; $env:DB_PASSWORD="SENHA_DA_ESCOLA"; node server.js
>   ```  
> - **No CMD**:  
>   ```cmd
>   set DB_PASSWORD=SENHA_DA_ESCOLA && node server.js
>   ```

---

### 3. Acessar a Plataforma
Abra o navegador (Chrome, Edge) e acesse:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏠 Como Rodar em Casa com os Scripts .bat

Se estiver no seu computador pessoal, você pode iniciar tudo com **2 cliques**:

1. Dê dois cliques no arquivo:
   ```
   iniciar_tudo.bat
   ```
   Ele verifica se a pasta `node_modules` existe (instalando automaticamente se necessário), inicia o banco de dados e abre o navegador.

2. Outros atalhos úteis:
   - `iniciar_banco.bat`: Inicia apenas o banco na porta 5432.
   - `parar_banco.bat`: Finaliza o banco de dados.
   - `resetar_banco.bat`: Restaura o banco `locadora_xbox` para os dados iniciais.
   - `abrir_dbeaver.bat`: Abre o DBeaver diretamente.

---

## 🐘 Como Conectar e Visualizar no DBeaver

### Credenciais Padrão:
- **Host / Servidor**: `localhost` (ou `127.0.0.1`)
- **Porta**: `5432`
- **Banco de Dados**: `locadora_xbox`
- **Usuário**: `postgres`
- **Senha**: `postgres`

### Passo a Passo:
1. Abra o DBeaver.
2. Menu **Banco de Dados** > **Nova Conexão** > selecione **PostgreSQL**.
3. Preencha os campos com as credenciais acima.
4. Clique em **Testar Conexão** e depois em **Concluir**.
5. No painel esquerdo, navegue em:
   `locadora_xbox` ➔ `Schemas` ➔ `public` ➔ `Tabelas (Tables)`.
6. Dê dois cliques em qualquer tabela para ver os dados atualizados em tempo real ou no **Diagrama ER** para ver os relacionamentos.

---

## 📱 Como Acessar no Celular (Mobile Testing)

Como o sistema foi feito com foco em dispositivos móveis, você pode testá-lo diretamente no celular:

1. Conecte o celular na **mesma rede Wi-Fi** do computador.
2. Quando você inicia o servidor (`node server.js`), ele exibe o IP local da sua máquina:
   ```
   Local (neste PC):        http://localhost:3000
   Celular (mesmo Wi-Fi):   http://192.168.x.x:3000
   ```
3. Digite o endereço exibido no navegador do celular (Chrome ou Safari) para ver a interface em tela cheia com toque nativo!

---

## 📱 Módulos do Sistema (CRUD Completo)

1. **Catálogo de Jogos (`jogo`)**:
   - Cadastrar, listar, alterar e excluir jogos.
   - Filtros por gênero e busca em tempo real por título ou desenvolvedora.
   - Badge inteligente de disponibilidade (`Disponível` / `Alugado`).

2. **Clientes da Locadora (`cliente`)**:
   - Cadastro com nome, e-mail único e data de nascimento.
   - Contador de jogos alugados no momento por cada cliente.

3. **Controle de Locações (`locacao`)**:
   - Registro de novas locações associando cliente e jogo.
   - Filtros rápidos por abas (`Todas`, `Em Aberto`, `Devolvidos`).
   - Botão **"Devolver Jogo"** com 1 toque (preenche a devolução com a data de hoje).

4. **Gêneros (`categoria`)**:
   - Cadastro e edição de gêneros.
   - Contador automático de títulos em cada categoria.

---

## 🛡️ Regras de Negócio e Validações

- **E-mail Único**: Impede cadastro duplicado avisando: *"Este e-mail já está cadastrado para outro cliente."*
- **Gênero Único**: Impede categorias repetidas.
- **Consistência de Datas**: A data de devolução não pode ser anterior à data de saída do jogo.
- **Proteção de Integridade**: Ao tentar excluir um cliente ou jogo com locações vinculadas, o sistema orienta o usuário de forma amigável, sem códigos crus de banco.

---

## 📂 Estrutura de Arquivos

```
locadora-xbox/
├── locadora_xbox.sql       # Script SQL do banco de dados (tabelas e dados)
├── server.js               # Servidor Web & API REST nativa (Node.js puro + pg)
├── package.json            # Metadados e dependências (pg)
├── README.md               # Documentação e instruções de uso
├── .gitignore              # Ignora node_modules/ e arquivos locais
│
├── iniciar_tudo.bat        # Inicializador completo automático
├── iniciar_banco.bat       # Inicia o PostgreSQL
├── parar_banco.bat         # Finaliza o PostgreSQL
├── resetar_banco.bat       # Restaura os dados padrão no banco
├── abrir_dbeaver.bat       # Abre o DBeaver
│
└── public/                 # Front-End (HTML5, CSS3, JavaScript Vanilla)
    ├── index.html          # Interface da aplicação SPA
    ├── css/
    │   └── style.css       # Estilos Mobile-First tema escuro Xbox
    └── js/
        └── app.js          # Lógica do app, rotas e integração REST
```
