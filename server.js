/**
 * XBOX LOCADORA - Servidor Web & API REST Vanilla (sem frameworks)
 * Tecnologias: Node.js (módulo nativo http), PostgreSQL (driver pg)
 * Banco de Dados: locadora_xbox na porta 5432
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'locadora_xbox',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Tipos MIME suportados
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
};

// Envio de respostas JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// Leitura do corpo das requisições
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Corpo da requisição excedeu o limite'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Dados inválidos recebidos'));
      }
    });
    req.on('error', reject);
  });
}

// Tratamento amigável e limpo de regras de validação (sem expor termos técnicos)
function handleDBError(err, res) {
  console.error('[Erro Operacional]', err.message);

  if (err.code === '23505') {
    if (err.detail && err.detail.includes('email')) {
      return sendJSON(res, 400, { error: 'Este e-mail já está cadastrado para outro cliente.' });
    }
    if (err.detail && err.detail.includes('nome')) {
      return sendJSON(res, 400, { error: 'Já existe um gênero com este nome cadastrado.' });
    }
    return sendJSON(res, 400, { error: 'Este registro já existe no sistema.' });
  }

  if (err.code === '23503') {
    return sendJSON(res, 400, {
      error: 'Não é possível excluir este item pois existem locações vinculadas a ele.'
    });
  }

  if (err.code === '23514') {
    if (err.constraint === 'chk_status') {
      return sendJSON(res, 400, { error: 'A situação deve ser "Em aberto" ou "Devolvido".' });
    }
    if (err.constraint === 'chk_datas') {
      return sendJSON(res, 400, { error: 'A data de devolução não pode ser anterior à data da locação.' });
    }
    if (err.message && (err.message.includes('ano_lancamento') || err.message.includes('ano_publicacao'))) {
      return sendJSON(res, 400, { error: 'O ano de lançamento deve ser válido (a partir de 1980).' });
    }
    return sendJSON(res, 400, { error: 'Os dados informados não atendem aos critérios de validação.' });
  }

  return sendJSON(res, 500, { error: 'Não foi possível completar a operação. Tente novamente.' });
}

// Servir páginas e arquivos estáticos
function serveStaticFile(req, res, pathname) {
  let safePath = pathname === '/' ? '/index.html' : pathname;
  safePath = path.normalize(safePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('Página não encontrada');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Roteador da API
async function handleApiRequest(req, res, pathname) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // Status do Sistema
  if (pathname === '/api/status' && req.method === 'GET') {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1;');
      client.release();
      return sendJSON(res, 200, { status: 'online', message: 'Sistema operacional' });
    } catch (err) {
      return sendJSON(res, 503, { status: 'offline', message: 'Sistema indisponível' });
    }
  }

  // Estatísticas do Painel
  if (pathname === '/api/stats' && req.method === 'GET') {
    try {
      const [jogos, clientes, categorias, abertas, totalLocacoes] = await Promise.all([
        pool.query('SELECT COUNT(*) AS total FROM jogo;'),
        pool.query('SELECT COUNT(*) AS total FROM cliente;'),
        pool.query('SELECT COUNT(*) AS total FROM categoria;'),
        pool.query("SELECT COUNT(*) AS total FROM locacao WHERE status = 'Em aberto';"),
        pool.query('SELECT COUNT(*) AS total FROM locacao;'),
      ]);
      return sendJSON(res, 200, {
        totalJogos: parseInt(jogos.rows[0].total, 10),
        totalClientes: parseInt(clientes.rows[0].total, 10),
        totalCategorias: parseInt(categorias.rows[0].total, 10),
        locacoesAbertas: parseInt(abertas.rows[0].total, 10),
        locacoesTotal: parseInt(totalLocacoes.rows[0].total, 10),
      });
    } catch (err) {
      return handleDBError(err, res);
    }
  }

  // ==========================================
  // CRUD JOGOS (tabela: jogo)
  // ==========================================
  if (pathname === '/api/jogos' || pathname === '/api/livros') {
    if (req.method === 'GET') {
      try {
        const result = await pool.query(`
          SELECT j.id_jogo, j.titulo, j.desenvolvedora, j.ano_lancamento, j.id_categoria,
                 c.nome AS categoria_nome,
                 COUNT(l.id_locacao) AS total_locacoes,
                 COUNT(CASE WHEN l.status = 'Em aberto' THEN 1 END) AS locacoes_ativas
          FROM jogo j
          JOIN categoria c ON j.id_categoria = c.id_categoria
          LEFT JOIN locacao l ON j.id_jogo = l.id_jogo
          GROUP BY j.id_jogo, c.nome
          ORDER BY j.id_jogo DESC;
        `);
        return sendJSON(res, 200, result.rows);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { titulo, desenvolvedora, autor, ano_lancamento, ano_publicacao, id_categoria } = body;
        const tit = titulo ? titulo.trim() : '';
        const dev = (desenvolvedora || autor || '').trim();
        const ano = parseInt(ano_lancamento || ano_publicacao, 10);
        const catId = parseInt(id_categoria, 10);

        if (!tit) return sendJSON(res, 400, { error: 'O título do jogo é obrigatório.' });
        if (!dev) return sendJSON(res, 400, { error: 'A desenvolvedora é obrigatória.' });
        if (isNaN(ano) || ano < 1980) return sendJSON(res, 400, { error: 'Informe um ano de lançamento válido (a partir de 1980).' });
        if (isNaN(catId)) return sendJSON(res, 400, { error: 'Selecione um gênero.' });

        const result = await pool.query(
          `INSERT INTO jogo (titulo, desenvolvedora, ano_lancamento, id_categoria) 
           VALUES ($1, $2, $3, $4) RETURNING *;`,
          [tit, dev, ano, catId]
        );
        return sendJSON(res, 201, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  const jogoIdMatch = pathname.match(/^\/api\/(?:jogos|livros)\/(\d+)$/);
  if (jogoIdMatch) {
    const id = parseInt(jogoIdMatch[1], 10);

    if (req.method === 'GET') {
      try {
        const result = await pool.query(
          `SELECT j.*, c.nome AS categoria_nome FROM jogo j JOIN categoria c ON j.id_categoria = c.id_categoria WHERE j.id_jogo = $1;`,
          [id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Jogo não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const { titulo, desenvolvedora, autor, ano_lancamento, ano_publicacao, id_categoria } = body;
        const tit = titulo ? titulo.trim() : '';
        const dev = (desenvolvedora || autor || '').trim();
        const ano = parseInt(ano_lancamento || ano_publicacao, 10);
        const catId = parseInt(id_categoria, 10);

        if (!tit) return sendJSON(res, 400, { error: 'O título do jogo é obrigatório.' });
        if (!dev) return sendJSON(res, 400, { error: 'A desenvolvedora é obrigatória.' });
        if (isNaN(ano) || ano < 1980) return sendJSON(res, 400, { error: 'Informe um ano de lançamento válido (a partir de 1980).' });
        if (isNaN(catId)) return sendJSON(res, 400, { error: 'Selecione um gênero.' });

        const result = await pool.query(
          `UPDATE jogo SET titulo = $1, desenvolvedora = $2, ano_lancamento = $3, id_categoria = $4 
           WHERE id_jogo = $5 RETURNING *;`,
          [tit, dev, ano, catId, id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Jogo não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await pool.query(`DELETE FROM jogo WHERE id_jogo = $1 RETURNING id_jogo;`, [id]);
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Jogo não encontrado.' });
        return sendJSON(res, 200, { success: true, message: 'Jogo removido com sucesso.' });
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  // ==========================================
  // CRUD CLIENTES (tabela: cliente)
  // ==========================================
  if (pathname === '/api/clientes' || pathname === '/api/alunos') {
    if (req.method === 'GET') {
      try {
        const result = await pool.query(`
          SELECT c.id_cliente, c.nome, c.email, 
                 TO_CHAR(c.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
                 COUNT(l.id_locacao) AS total_locacoes,
                 COUNT(CASE WHEN l.status = 'Em aberto' THEN 1 END) AS locacoes_ativas
          FROM cliente c
          LEFT JOIN locacao l ON c.id_cliente = l.id_cliente
          GROUP BY c.id_cliente
          ORDER BY c.id_cliente DESC;
        `);
        return sendJSON(res, 200, result.rows);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { nome, email, data_nascimento } = body;
        if (!nome || !nome.trim()) return sendJSON(res, 400, { error: 'O nome do cliente é obrigatório.' });
        if (!email || !email.trim()) return sendJSON(res, 400, { error: 'O e-mail é obrigatório.' });

        const result = await pool.query(
          `INSERT INTO cliente (nome, email, data_nascimento) VALUES ($1, $2, $3) RETURNING *;`,
          [nome.trim(), email.trim().toLowerCase(), data_nascimento || null]
        );
        return sendJSON(res, 201, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  const clienteIdMatch = pathname.match(/^\/api\/(?:clientes|alunos)\/(\d+)$/);
  if (clienteIdMatch) {
    const id = parseInt(clienteIdMatch[1], 10);

    if (req.method === 'GET') {
      try {
        const result = await pool.query(
          `SELECT id_cliente, nome, email, TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento FROM cliente WHERE id_cliente = $1;`,
          [id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Cliente não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const { nome, email, data_nascimento } = body;
        if (!nome || !nome.trim()) return sendJSON(res, 400, { error: 'O nome é obrigatório.' });
        if (!email || !email.trim()) return sendJSON(res, 400, { error: 'O e-mail é obrigatório.' });

        const result = await pool.query(
          `UPDATE cliente SET nome = $1, email = $2, data_nascimento = $3 WHERE id_cliente = $4 RETURNING *;`,
          [nome.trim(), email.trim().toLowerCase(), data_nascimento || null, id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Cliente não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await pool.query(`DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente;`, [id]);
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Cliente não encontrado.' });
        return sendJSON(res, 200, { success: true, message: 'Cliente excluído com sucesso.' });
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  // ==========================================
  // CRUD CATEGORIAS / GÊNEROS (tabela: categoria)
  // ==========================================
  if (pathname === '/api/categorias') {
    if (req.method === 'GET') {
      try {
        const result = await pool.query(`
          SELECT c.id_categoria, c.nome, COUNT(j.id_jogo) AS total_jogos
          FROM categoria c
          LEFT JOIN jogo j ON c.id_categoria = j.id_categoria
          GROUP BY c.id_categoria
          ORDER BY c.nome ASC;
        `);
        return sendJSON(res, 200, result.rows);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { nome } = body;
        if (!nome || !nome.trim()) return sendJSON(res, 400, { error: 'O nome do gênero é obrigatório.' });

        const result = await pool.query(
          `INSERT INTO categoria (nome) VALUES ($1) RETURNING *;`,
          [nome.trim()]
        );
        return sendJSON(res, 201, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  const categoriaIdMatch = pathname.match(/^\/api\/categorias\/(\d+)$/);
  if (categoriaIdMatch) {
    const id = parseInt(categoriaIdMatch[1], 10);

    if (req.method === 'GET') {
      try {
        const result = await pool.query(`SELECT * FROM categoria WHERE id_categoria = $1;`, [id]);
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Gênero não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const { nome } = body;
        if (!nome || !nome.trim()) return sendJSON(res, 400, { error: 'O nome do gênero é obrigatório.' });

        const result = await pool.query(
          `UPDATE categoria SET nome = $1 WHERE id_categoria = $2 RETURNING *;`,
          [nome.trim(), id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Gênero não encontrado.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await pool.query(`DELETE FROM categoria WHERE id_categoria = $1 RETURNING id_categoria;`, [id]);
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Gênero não encontrado.' });
        return sendJSON(res, 200, { success: true, message: 'Gênero removido com sucesso.' });
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  // ==========================================
  // CRUD LOCAÇÕES (tabela: locacao)
  // ==========================================
  if (pathname === '/api/locacoes' || pathname === '/api/emprestimos') {
    if (req.method === 'GET') {
      try {
        const result = await pool.query(`
          SELECT l.id_locacao, l.id_cliente, l.id_jogo,
                 TO_CHAR(l.data_locacao, 'YYYY-MM-DD') AS data_locacao,
                 TO_CHAR(l.data_devolucao, 'YYYY-MM-DD') AS data_devolucao,
                 l.status,
                 c.nome AS cliente_nome, c.email AS cliente_email,
                 j.titulo AS jogo_titulo, j.desenvolvedora AS jogo_desenvolvedora,
                 cat.nome AS categoria_nome
          FROM locacao l
          JOIN cliente c ON l.id_cliente = c.id_cliente
          JOIN jogo j ON l.id_jogo = j.id_jogo
          JOIN categoria cat ON j.id_categoria = cat.id_categoria
          ORDER BY (CASE WHEN l.status = 'Em aberto' THEN 0 ELSE 1 END), l.id_locacao DESC;
        `);
        return sendJSON(res, 200, result.rows);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const id_cliente = parseInt(body.id_cliente || body.id_aluno, 10);
        const id_jogo = parseInt(body.id_jogo || body.id_livro, 10);
        const data_locacao = body.data_locacao || body.data_emprestimo || new Date().toISOString().split('T')[0];
        const status = body.status || 'Em aberto';
        let data_devolucao = body.data_devolucao || null;

        if (isNaN(id_cliente)) return sendJSON(res, 400, { error: 'Selecione o cliente.' });
        if (isNaN(id_jogo)) return sendJSON(res, 400, { error: 'Selecione o jogo.' });

        if (status === 'Devolvido' && !data_devolucao) {
          data_devolucao = data_locacao;
        }

        const result = await pool.query(
          `INSERT INTO locacao (id_cliente, id_jogo, data_locacao, data_devolucao, status)
           VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
          [id_cliente, id_jogo, data_locacao, data_devolucao, status]
        );
        return sendJSON(res, 201, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  // Devolução Rápida (1 toque)
  const devolverMatch = pathname.match(/^\/api\/(?:locacoes|emprestimos)\/(\d+)\/devolver$/);
  if (devolverMatch && (req.method === 'PATCH' || req.method === 'POST')) {
    const id = parseInt(devolverMatch[1], 10);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const result = await pool.query(
        `UPDATE locacao 
         SET status = 'Devolvido', 
             data_devolucao = COALESCE(data_devolucao, $1) 
         WHERE id_locacao = $2 
         RETURNING *;`,
        [hoje, id]
      );
      if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Locação não encontrada.' });
      return sendJSON(res, 200, { success: true, message: 'Jogo marcado como Devolvido!', locacao: result.rows[0] });
    } catch (err) {
      return handleDBError(err, res);
    }
  }

  const locacaoIdMatch = pathname.match(/^\/api\/(?:locacoes|emprestimos)\/(\d+)$/);
  if (locacaoIdMatch) {
    const id = parseInt(locacaoIdMatch[1], 10);

    if (req.method === 'GET') {
      try {
        const result = await pool.query(
          `SELECT l.*, 
                  TO_CHAR(l.data_locacao, 'YYYY-MM-DD') AS data_locacao,
                  TO_CHAR(l.data_devolucao, 'YYYY-MM-DD') AS data_devolucao,
                  c.nome AS cliente_nome, j.titulo AS jogo_titulo 
           FROM locacao l
           JOIN cliente c ON l.id_cliente = c.id_cliente
           JOIN jogo j ON l.id_jogo = j.id_jogo
           WHERE l.id_locacao = $1;`,
          [id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Locação não encontrada.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const id_cliente = parseInt(body.id_cliente || body.id_aluno, 10);
        const id_jogo = parseInt(body.id_jogo || body.id_livro, 10);
        const data_locacao = body.data_locacao || body.data_emprestimo;
        const status = body.status || 'Em aberto';
        let data_devolucao = body.data_devolucao || null;

        if (isNaN(id_cliente)) return sendJSON(res, 400, { error: 'Selecione o cliente.' });
        if (isNaN(id_jogo)) return sendJSON(res, 400, { error: 'Selecione o jogo.' });
        if (!data_locacao) return sendJSON(res, 400, { error: 'A data de locação é obrigatória.' });

        if (status === 'Devolvido' && !data_devolucao) {
          data_devolucao = new Date().toISOString().split('T')[0];
        }

        const result = await pool.query(
          `UPDATE locacao 
           SET id_cliente = $1, id_jogo = $2, data_locacao = $3, data_devolucao = $4, status = $5
           WHERE id_locacao = $6 RETURNING *;`,
          [id_cliente, id_jogo, data_locacao, data_devolucao, status, id]
        );
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Locação não encontrada.' });
        return sendJSON(res, 200, result.rows[0]);
      } catch (err) {
        return handleDBError(err, res);
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await pool.query(`DELETE FROM locacao WHERE id_locacao = $1 RETURNING id_locacao;`, [id]);
        if (result.rows.length === 0) return sendJSON(res, 404, { error: 'Locação não encontrada.' });
        return sendJSON(res, 200, { success: true, message: 'Locação removida com sucesso.' });
      } catch (err) {
        return handleDBError(err, res);
      }
    }
  }

  return sendJSON(res, 404, { error: 'Serviço não encontrado.' });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, pathname);
  } else {
    serveStaticFile(req, res, pathname);
  }
});

const os = require('os');

function getLocalIPv4List() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIPv4List();
  const primaryLocalIp = localIps.find(i => i.name.toLowerCase().includes('ethernet') || i.name.toLowerCase().includes('wi-fi'))?.address || (localIps[0] ? localIps[0].address : '127.0.0.1');

  console.log(`\n======================================================`);
  console.log(`  🎮 XBOX LOCADORA - Plataforma Web Responsiva`);
  console.log(`======================================================`);
  console.log(`  🌐 Localhost:           http://localhost:${PORT}`);
  console.log(`  📱 Celular / Wi-Fi:     http://${primaryLocalIp}:${PORT}`);
  console.log(`  🌍 IP Público IPv4:     http://45.172.97.186:${PORT}`);
  console.log(`  🐘 Banco de Dados:      Porta 5432 (banco: locadora_xbox)`);
  console.log(`======================================================\n`);
});

