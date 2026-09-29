/**
 * XBOX LOCADORA - Aplicação Front-End Vanilla JS
 * Sem frameworks: Fetch API, DOM API, navegação fluida e diálogos nativos
 */

// Estado da Aplicação
const state = {
  currentView: 'dashboard',
  jogos: [],
  clientes: [],
  generos: [],
  locacoes: [],
  stats: {},
  loanFilter: 'todos',
  deleteCallback: null,
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModals();
  setupSearchAndFilters();
  setupForms();
  
  checkSystemStatus();
  loadAllData();

  const initialHash = window.location.hash.replace('#', '');
  if (['dashboard', 'jogos', 'clientes', 'locacoes', 'generos'].includes(initialHash)) {
    navigateTo(initialHash);
  }
});

// ============================================================
// NAVEGAÇÃO ENTRE TELAS (SPA)
// ============================================================
function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      navigateTo(view);
    });
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-goto');
      navigateTo(target);
    });
  });

  document.getElementById('btn-quick-new-loan')?.addEventListener('click', () => openLocacaoModal());
  document.getElementById('btn-quick-new-game')?.addEventListener('click', () => openJogoModal());
  document.getElementById('btn-quick-new-client')?.addEventListener('click', () => openClienteModal());
}

function navigateTo(viewName) {
  state.currentView = viewName;
  window.location.hash = viewName;

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) targetSection.classList.add('active');

  document.querySelectorAll('[data-view]').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// REQUISIÇÕES E CONEXÃO
// ============================================================
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(endpoint, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Não foi possível completar a operação');
    }
    return data;
  } catch (err) {
    console.error(`[API] ${method} ${endpoint}:`, err);
    throw err;
  }
}

async function checkSystemStatus() {
  const badge = document.getElementById('db-status-badge');
  try {
    await apiRequest('/api/status');
    badge.className = 'status-badge online';
    badge.innerHTML = `<span class="status-dot"></span><span class="status-text">Sistema Online</span>`;
    badge.title = 'A locadora está aberta e conectada';
  } catch (err) {
    badge.className = 'status-badge offline';
    badge.innerHTML = `<span class="status-dot"></span><span class="status-text">Sem Conexão</span>`;
    badge.title = 'Não foi possível conectar ao servidor da locadora';
  }
}

async function loadAllData() {
  try {
    const [stats, jogos, clientes, generos, locacoes] = await Promise.all([
      apiRequest('/api/stats'),
      apiRequest('/api/jogos'),
      apiRequest('/api/clientes'),
      apiRequest('/api/categorias'),
      apiRequest('/api/locacoes'),
    ]);

    state.stats = stats;
    state.jogos = jogos;
    state.clientes = clientes;
    state.generos = generos;
    state.locacoes = locacoes;

    renderDashboard();
    renderJogos();
    renderClientes();
    renderGeneros();
    renderLocacoes();
    populateSelectOptions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// RENDERIZAÇÃO: DASHBOARD
// ============================================================
function renderDashboard() {
  document.getElementById('dash-total-jogos').textContent = state.stats.totalJogos || 0;
  document.getElementById('dash-total-clientes').textContent = state.stats.totalClientes || 0;
  document.getElementById('dash-locacoes-abertas').textContent = state.stats.locacoesAbertas || 0;
  document.getElementById('dash-total-generos').textContent = state.stats.totalCategorias || 0;

  const recentContainer = document.getElementById('dash-recent-loans');
  const openLoans = state.locacoes.filter(l => l.status === 'Em aberto').slice(0, 4);

  if (openLoans.length === 0) {
    recentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎮</div>
        <p>Todos os jogos estão disponíveis na locadora!</p>
        <p style="font-size:0.85rem">Nenhuma locação em aberto no momento.</p>
      </div>`;
    return;
  }

  recentContainer.innerHTML = openLoans.map(l => `
    <article class="app-card">
      <div class="card-top">
        <div class="card-header-info">
          <div class="card-avatar">🎮</div>
          <div>
            <h4 class="card-title">${escapeHTML(l.jogo_titulo)}</h4>
            <p class="card-subtitle">Cliente: <strong>${escapeHTML(l.cliente_nome)}</strong></p>
          </div>
        </div>
        <span class="badge-tag loaned">Alugado</span>
      </div>
      <div class="card-meta-list">
        <span class="card-meta-item">📅 Retirada: ${formatDateBR(l.data_locacao)}</span>
        <span class="card-meta-item">🏷️ ${escapeHTML(l.categoria_nome)}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" onclick="quickReturnLoan(${l.id_locacao})">
          ✔️ Marcar como Devolvido
        </button>
      </div>
    </article>
  `).join('');
}

// ============================================================
// RENDERIZAÇÃO: JOGOS
// ============================================================
function renderJogos() {
  const container = document.getElementById('list-jogos');
  const search = document.getElementById('search-jogos').value.toLowerCase().trim();
  const catFilter = document.getElementById('filter-jogos-genero').value;

  const filtered = state.jogos.filter(j => {
    const matchesSearch = j.titulo.toLowerCase().includes(search) || j.desenvolvedora.toLowerCase().includes(search);
    const matchesCat = !catFilter || j.id_categoria == catFilter;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎮</div>
        <p>Nenhum jogo encontrado com os filtros aplicados.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(j => {
    const isLoaned = parseInt(j.locacoes_ativas, 10) > 0;
    return `
      <article class="app-card">
        <div class="card-top">
          <div class="card-header-info">
            <div class="card-avatar">👾</div>
            <div>
              <h4 class="card-title">${escapeHTML(j.titulo)}</h4>
              <p class="card-subtitle">${escapeHTML(j.desenvolvedora)}</p>
            </div>
          </div>
          <span class="badge-tag ${isLoaned ? 'loaned' : 'available'}">
            ${isLoaned ? 'Alugado' : 'Disponível'}
          </span>
        </div>
        
        <div class="card-meta-list">
          <span class="card-meta-item">🏷️ Gênero: <strong>${escapeHTML(j.categoria_nome)}</strong></span>
          <span class="card-meta-item">📅 Lançamento: <strong>${j.ano_lancamento}</strong></span>
          <span class="card-meta-item">🔄 ${j.total_locacoes} locação(ões) no histórico</span>
        </div>

        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="openJogoModal(${j.id_jogo})">
            ✏️ Editar
          </button>
          <button class="btn btn-secondary btn-sm btn-icon" title="Excluir Jogo" onclick="confirmDeleteJogo(${j.id_jogo}, '${escapeHTML(j.titulo)}')">
            🗑️
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAÇÃO: CLIENTES
// ============================================================
function renderClientes() {
  const container = document.getElementById('list-clientes');
  const search = document.getElementById('search-clientes').value.toLowerCase().trim();

  const filtered = state.clientes.filter(c => 
    c.nome.toLowerCase().includes(search) || c.email.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <p>Nenhum cliente cadastrado encontrado.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const activeLoans = parseInt(c.locacoes_ativas, 10);
    return `
      <article class="app-card">
        <div class="card-top">
          <div class="card-header-info">
            <div class="card-avatar">👤</div>
            <div>
              <h4 class="card-title">${escapeHTML(c.nome)}</h4>
              <p class="card-subtitle">${escapeHTML(c.email)}</p>
            </div>
          </div>
          ${activeLoans > 0 
            ? `<span class="badge-tag loaned">${activeLoans} Jogo(s) alugado(s)</span>` 
            : `<span class="badge-tag available">Sem pendências</span>`}
        </div>

        <div class="card-meta-list">
          <span class="card-meta-item">🎂 Nasc.: ${c.data_nascimento ? formatDateBR(c.data_nascimento) : 'Não informado'}</span>
          <span class="card-meta-item">📦 Total alugado: ${c.total_locacoes} vez(es)</span>
        </div>

        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="openClienteModal(${c.id_cliente})">
            ✏️ Editar
          </button>
          <button class="btn btn-secondary btn-sm btn-icon" title="Excluir Cliente" onclick="confirmDeleteCliente(${c.id_cliente}, '${escapeHTML(c.nome)}')">
            🗑️
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAÇÃO: LOCAÇÕES
// ============================================================
function renderLocacoes() {
  const container = document.getElementById('list-locacoes');
  
  let list = state.locacoes;
  if (state.loanFilter !== 'todos') {
    list = list.filter(l => l.status === state.loanFilter);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔄</div>
        <p>Nenhuma locação encontrada nesta categoria.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(l => {
    const isPending = l.status === 'Em aberto';
    return `
      <article class="app-card">
        <div class="card-top">
          <div class="card-header-info">
            <div class="card-avatar">🎮</div>
            <div>
              <h4 class="card-title">${escapeHTML(l.jogo_titulo)}</h4>
              <p class="card-subtitle">Cliente: <strong>${escapeHTML(l.cliente_nome)}</strong> (${escapeHTML(l.cliente_email)})</p>
            </div>
          </div>
          <span class="badge-tag ${isPending ? 'loaned' : 'returned'}">
            ${isPending ? 'Alugado' : 'Devolvido'}
          </span>
        </div>

        <div class="card-meta-list">
          <span class="card-meta-item">📅 Retirada: ${formatDateBR(l.data_locacao)}</span>
          <span class="card-meta-item">📦 Devolução: ${l.data_devolucao ? formatDateBR(l.data_devolucao) : '<em>Aguardando</em>'}</span>
        </div>

        <div class="card-actions">
          ${isPending ? `
            <button class="btn btn-primary btn-sm" onclick="quickReturnLoan(${l.id_locacao})">
              ✔️ Devolver Jogo
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="openLocacaoModal(${l.id_locacao})">
            ✏️ Editar
          </button>
          <button class="btn btn-secondary btn-sm btn-icon" title="Excluir Registro" onclick="confirmDeleteLocacao(${l.id_locacao})">
            🗑️
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAÇÃO: GÊNEROS
// ============================================================
function renderGeneros() {
  const container = document.getElementById('list-generos');
  const search = document.getElementById('search-generos').value.toLowerCase().trim();

  const filtered = state.generos.filter(g => g.nome.toLowerCase().includes(search));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏷️</div>
        <p>Nenhum gênero encontrado.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(g => `
    <article class="app-card">
      <div class="card-top">
        <div class="card-header-info">
          <div class="card-avatar">🏷️</div>
          <div>
            <h4 class="card-title">${escapeHTML(g.nome)}</h4>
            <p class="card-subtitle">Gênero de Jogo Xbox</p>
          </div>
        </div>
        <span class="badge-tag available">${g.total_jogos} Jogo(s)</span>
      </div>

      <div class="card-actions">
        <button class="btn btn-secondary btn-sm" onclick="openGeneroModal(${g.id_categoria})">
          ✏️ Editar
        </button>
        <button class="btn btn-secondary btn-sm btn-icon" title="Excluir Gênero" onclick="confirmDeleteGenero(${g.id_categoria}, '${escapeHTML(g.nome)}')">
          🗑️
        </button>
      </div>
    </article>
  `).join('');
}

// ============================================================
// SELECTS DINÂMICOS
// ============================================================
function populateSelectOptions() {
  const filterCat = document.getElementById('filter-jogos-genero');
  const prevVal = filterCat.value;
  filterCat.innerHTML = `<option value="">Todos os Gêneros (${state.generos.length})</option>` +
    state.generos.map(g => `<option value="${g.id_categoria}">${escapeHTML(g.nome)}</option>`).join('');
  filterCat.value = prevVal;

  const jogoCatSelect = document.getElementById('jogo-categoria');
  jogoCatSelect.innerHTML = `<option value="">Selecione um gênero...</option>` +
    state.generos.map(g => `<option value="${g.id_categoria}">${escapeHTML(g.nome)}</option>`).join('');

  const locClienteSelect = document.getElementById('locacao-cliente');
  locClienteSelect.innerHTML = `<option value="">Selecione o cliente...</option>` +
    state.clientes.map(c => `<option value="${c.id_cliente}">${escapeHTML(c.nome)} (${escapeHTML(c.email)})</option>`).join('');

  const locJogoSelect = document.getElementById('locacao-jogo');
  locJogoSelect.innerHTML = `<option value="">Selecione o jogo...</option>` +
    state.jogos.map(j => {
      const isLoaned = parseInt(j.locacoes_ativas, 10) > 0;
      return `<option value="${j.id_jogo}">${escapeHTML(j.titulo)} [${escapeHTML(j.categoria_nome)}] ${isLoaned ? '(⚠️ Alugado)' : ''}</option>`;
    }).join('');
}

// ============================================================
// BUSCAS E FILTROS EM TEMPO REAL
// ============================================================
function setupSearchAndFilters() {
  document.getElementById('search-jogos')?.addEventListener('input', () => renderJogos());
  document.getElementById('filter-jogos-genero')?.addEventListener('change', () => renderJogos());
  document.getElementById('search-clientes')?.addEventListener('input', () => renderClientes());
  document.getElementById('search-generos')?.addEventListener('input', () => renderGeneros());

  document.querySelectorAll('[data-loan-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-loan-filter]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.loanFilter = tab.getAttribute('data-loan-filter');
      renderLocacoes();
    });
  });
}

// ============================================================
// MODAIS NATIVOS (<dialog>)
// ============================================================
function setupModals() {
  document.querySelectorAll('.app-modal').forEach(dialog => {
    dialog.querySelectorAll('.modal-close, .btn-cancel-modal').forEach(btn => {
      btn.addEventListener('click', () => dialog.close());
    });

    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) dialog.close();
    });
  });

  document.getElementById('btn-new-game')?.addEventListener('click', () => openJogoModal());
  document.getElementById('btn-new-client')?.addEventListener('click', () => openClienteModal());
  document.getElementById('btn-new-loan')?.addEventListener('click', () => openLocacaoModal());
  document.getElementById('btn-new-genre')?.addEventListener('click', () => openGeneroModal());

  const locStatusSelect = document.getElementById('locacao-status');
  locStatusSelect?.addEventListener('change', () => {
    const devInput = document.getElementById('locacao-devolucao');
    if (locStatusSelect.value === 'Devolvido' && !devInput.value) {
      devInput.value = new Date().toISOString().split('T')[0];
    }
  });

  document.getElementById('btn-confirm-delete-action')?.addEventListener('click', async () => {
    if (typeof state.deleteCallback === 'function') {
      await state.deleteCallback();
    }
  });
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
}

function setFieldError(fieldId, message) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

// Modal Jogo
function openJogoModal(id = null) {
  const dialog = document.getElementById('modal-jogo');
  const form = document.getElementById('form-jogo');
  clearErrors(form);
  form.reset();

  if (id) {
    const jogo = state.jogos.find(j => j.id_jogo === id);
    if (!jogo) return;
    document.getElementById('modal-jogo-title').textContent = 'Editar Jogo';
    document.getElementById('jogo-id').value = jogo.id_jogo;
    document.getElementById('jogo-titulo').value = jogo.titulo;
    document.getElementById('jogo-desenvolvedora').value = jogo.desenvolvedora;
    document.getElementById('jogo-ano').value = jogo.ano_lancamento;
    document.getElementById('jogo-categoria').value = jogo.id_categoria;
  } else {
    document.getElementById('modal-jogo-title').textContent = 'Cadastrar Novo Jogo';
    document.getElementById('jogo-id').value = '';
    document.getElementById('jogo-ano').value = new Date().getFullYear();
  }

  dialog.showModal();
}

// Modal Cliente
function openClienteModal(id = null) {
  const dialog = document.getElementById('modal-cliente');
  const form = document.getElementById('form-cliente');
  clearErrors(form);
  form.reset();

  if (id) {
    const cliente = state.clientes.find(c => c.id_cliente === id);
    if (!cliente) return;
    document.getElementById('modal-cliente-title').textContent = 'Editar Cliente';
    document.getElementById('cliente-id').value = cliente.id_cliente;
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-email').value = cliente.email;
    document.getElementById('cliente-nascimento').value = cliente.data_nascimento || '';
  } else {
    document.getElementById('modal-cliente-title').textContent = 'Cadastrar Novo Cliente';
    document.getElementById('cliente-id').value = '';
  }

  dialog.showModal();
}

// Modal Locação
function openLocacaoModal(id = null) {
  const dialog = document.getElementById('modal-locacao');
  const form = document.getElementById('form-locacao');
  clearErrors(form);
  form.reset();

  const hoje = new Date().toISOString().split('T')[0];

  if (id) {
    const loc = state.locacoes.find(l => l.id_locacao === id);
    if (!loc) return;
    document.getElementById('modal-locacao-title').textContent = 'Editar Locação';
    document.getElementById('locacao-id').value = loc.id_locacao;
    document.getElementById('locacao-cliente').value = loc.id_cliente;
    document.getElementById('locacao-jogo').value = loc.id_jogo;
    document.getElementById('locacao-data').value = loc.data_locacao;
    document.getElementById('locacao-status').value = loc.status;
    document.getElementById('locacao-devolucao').value = loc.data_devolucao || '';
  } else {
    document.getElementById('modal-locacao-title').textContent = 'Registrar Nova Locação';
    document.getElementById('locacao-id').value = '';
    document.getElementById('locacao-data').value = hoje;
    document.getElementById('locacao-status').value = 'Em aberto';
  }

  dialog.showModal();
}

// Modal Gênero
function openGeneroModal(id = null) {
  const dialog = document.getElementById('modal-genero');
  const form = document.getElementById('form-genero');
  clearErrors(form);
  form.reset();

  if (id) {
    const gen = state.generos.find(g => g.id_categoria === id);
    if (!gen) return;
    document.getElementById('modal-genero-title').textContent = 'Editar Gênero';
    document.getElementById('genero-id').value = gen.id_categoria;
    document.getElementById('genero-nome').value = gen.nome;
  } else {
    document.getElementById('modal-genero-title').textContent = 'Cadastrar Novo Gênero';
    document.getElementById('genero-id').value = '';
  }

  dialog.showModal();
}

// ============================================================
// SUBMISSÃO DE FORMULÁRIOS
// ============================================================
function setupForms() {
  // Form Jogo
  document.getElementById('form-jogo').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(e.target);

    const id = document.getElementById('jogo-id').value;
    const titulo = document.getElementById('jogo-titulo').value.trim();
    const desenvolvedora = document.getElementById('jogo-desenvolvedora').value.trim();
    const ano = parseInt(document.getElementById('jogo-ano').value, 10);
    const catId = document.getElementById('jogo-categoria').value;

    let hasError = false;
    if (!titulo) { setFieldError('jogo-titulo', 'O título do jogo é obrigatório.'); hasError = true; }
    if (!desenvolvedora) { setFieldError('jogo-desenvolvedora', 'A desenvolvedora é obrigatória.'); hasError = true; }
    if (isNaN(ano) || ano < 1980) { setFieldError('jogo-ano', 'Informe um ano de lançamento válido.'); hasError = true; }
    if (!catId) { setFieldError('jogo-categoria', 'Selecione um gênero.'); hasError = true; }

    if (hasError) return;

    try {
      const payload = { titulo, desenvolvedora, ano_lancamento: ano, id_categoria: parseInt(catId, 10) };
      if (id) {
        await apiRequest(`/api/jogos/${id}`, 'PUT', payload);
        showToast('Jogo atualizado com sucesso!', 'success');
      } else {
        await apiRequest('/api/jogos', 'POST', payload);
        showToast('Jogo cadastrado no acervo!', 'success');
      }
      document.getElementById('modal-jogo').close();
      await loadAllData();
      navigateTo('jogos');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Form Cliente
  document.getElementById('form-cliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(e.target);

    const id = document.getElementById('cliente-id').value;
    const nome = document.getElementById('cliente-nome').value.trim();
    const email = document.getElementById('cliente-email').value.trim();
    const data_nascimento = document.getElementById('cliente-nascimento').value;

    let hasError = false;
    if (!nome) { setFieldError('cliente-nome', 'O nome do cliente é obrigatório.'); hasError = true; }
    if (!email || !email.includes('@')) { setFieldError('cliente-email', 'Informe um e-mail válido.'); hasError = true; }

    if (hasError) return;

    try {
      const payload = { nome, email, data_nascimento: data_nascimento || null };
      if (id) {
        await apiRequest(`/api/clientes/${id}`, 'PUT', payload);
        showToast('Dados do cliente atualizados!', 'success');
      } else {
        await apiRequest('/api/clientes', 'POST', payload);
        showToast('Cliente cadastrado com sucesso!', 'success');
      }
      document.getElementById('modal-cliente').close();
      await loadAllData();
      navigateTo('clientes');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Form Locação
  document.getElementById('form-locacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(e.target);

    const id = document.getElementById('locacao-id').value;
    const id_cliente = document.getElementById('locacao-cliente').value;
    const id_jogo = document.getElementById('locacao-jogo').value;
    const data_locacao = document.getElementById('locacao-data').value;
    const status = document.getElementById('locacao-status').value;
    const data_devolucao = document.getElementById('locacao-devolucao').value;

    let hasError = false;
    if (!id_cliente) { setFieldError('locacao-cliente', 'Selecione o cliente.'); hasError = true; }
    if (!id_jogo) { setFieldError('locacao-jogo', 'Selecione o jogo.'); hasError = true; }
    if (!data_locacao) { setFieldError('locacao-data', 'Informe a data de locação.'); hasError = true; }

    if (data_devolucao && data_locacao && data_devolucao < data_locacao) {
      setFieldError('locacao-devolucao', 'A data de devolução não pode ser anterior à locação.');
      hasError = true;
    }

    if (hasError) return;

    try {
      const payload = {
        id_cliente: parseInt(id_cliente, 10),
        id_jogo: parseInt(id_jogo, 10),
        data_locacao,
        data_devolucao: data_devolucao || null,
        status,
      };

      if (id) {
        await apiRequest(`/api/locacoes/${id}`, 'PUT', payload);
        showToast('Locação atualizada com sucesso!', 'success');
      } else {
        await apiRequest('/api/locacoes', 'POST', payload);
        showToast('Locação registrada com sucesso!', 'success');
      }
      document.getElementById('modal-locacao').close();
      await loadAllData();
      navigateTo('locacoes');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Form Gênero
  document.getElementById('form-genero').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(e.target);

    const id = document.getElementById('genero-id').value;
    const nome = document.getElementById('genero-nome').value.trim();

    if (!nome) {
      setFieldError('genero-nome', 'O nome do gênero é obrigatório.');
      return;
    }

    try {
      const payload = { nome };
      if (id) {
        await apiRequest(`/api/categorias/${id}`, 'PUT', payload);
        showToast('Gênero atualizado com sucesso!', 'success');
      } else {
        await apiRequest('/api/categorias', 'POST', payload);
        showToast('Gênero cadastrado com sucesso!', 'success');
      }
      document.getElementById('modal-genero').close();
      await loadAllData();
      navigateTo('generos');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ============================================================
// DEVOLUÇÃO RÁPIDA E EXCLUSÕES
// ============================================================
async function quickReturnLoan(id) {
  try {
    await apiRequest(`/api/locacoes/${id}/devolver`, 'PATCH');
    showToast('Jogo marcado como devolvido!', 'success');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openConfirmModal(message, onConfirm) {
  const dialog = document.getElementById('modal-confirm-delete');
  document.getElementById('confirm-delete-message').textContent = message;
  state.deleteCallback = async () => {
    try {
      await onConfirm();
      dialog.close();
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  dialog.showModal();
}

function confirmDeleteJogo(id, titulo) {
  openConfirmModal(`Deseja realmente remover o jogo "${titulo}" do acervo?`, async () => {
    await apiRequest(`/api/jogos/${id}`, 'DELETE');
    showToast('Jogo removido com sucesso.', 'success');
  });
}

function confirmDeleteCliente(id, nome) {
  openConfirmModal(`Deseja realmente excluir o cadastro de "${nome}"?`, async () => {
    await apiRequest(`/api/clientes/${id}`, 'DELETE');
    showToast('Cliente excluído com sucesso.', 'success');
  });
}

function confirmDeleteLocacao(id) {
  openConfirmModal(`Deseja cancelar o registro desta locação?`, async () => {
    await apiRequest(`/api/locacoes/${id}`, 'DELETE');
    showToast('Registro de locação excluído.', 'success');
  });
}

function confirmDeleteGenero(id, nome) {
  openConfirmModal(`Deseja realmente remover o gênero "${nome}"?`, async () => {
    await apiRequest(`/api/categorias/${id}`, 'DELETE');
    showToast('Gênero removido com sucesso.', 'success');
  });
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${type === 'error' ? 'Atenção' : (type === 'warning' ? 'Aviso' : 'Sucesso')}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button class="toast-close" aria-label="Fechar">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.openJogoModal = openJogoModal;
window.confirmDeleteJogo = confirmDeleteJogo;
window.openClienteModal = openClienteModal;
window.confirmDeleteCliente = confirmDeleteCliente;
window.openLocacaoModal = openLocacaoModal;
window.confirmDeleteLocacao = confirmDeleteLocacao;
window.openGeneroModal = openGeneroModal;
window.confirmDeleteGenero = confirmDeleteGenero;
window.quickReturnLoan = quickReturnLoan;
