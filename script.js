// =========================================
// script.js
// Lógica principal do frontend: criação, leitura, atualização e deleção (CRUD)
// - Prioriza a API `window.AppAuth` (Firebase SDK) quando disponível.
// - Usa um fallback via REST para testes locais quando Firebase não estiver configurado.
// - Evita innerHTML sempre que possível: monta elementos DOM para maior segurança.
// =========================================

// URL base do banco de dados (usada apenas pelo fallback REST)
let url = 'https://desafio-15-dias-315e5-default-rtdb.firebaseio.com/';

// Flag para evitar múltiplas edições simultâneas (ui guard)
let estaEditado = false;

// Referência para a subscrição do Firebase (para poder cancelar se necessário)
let unsubscribeAuth = null;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa handlers de autenticação
  initAuthHandlers();

  // Configura listeners para criação de tarefa
  const btnCriar = document.querySelector('button[onclick="criarTarefa()"]');
  if (btnCriar) {
    // Remove onclick do HTML e adiciona listener
    btnCriar.removeAttribute('onclick');
    btnCriar.addEventListener('click', criarTarefa);
  }

  // Tenta carregar a lista inicialmente (fallback ou se já estiver logado)
  if (!window.AppAuth) {
    // getLista(); // Comentado para evitar erro 401 no console (priorizando Firebase)
  }
});

function initAuthHandlers() {
  // Aguarda o AppAuth carregar via evento ou check direto
  if (window.__FIREBASE_INITIALIZED__) {
    setupAuthListeners();
  } else {
    window.addEventListener('firebase-ready', setupAuthListeners);
  }
}

function setupAuthListeners() {
  const btnSignOut = document.getElementById('btnSignOut');
  const btnSignIn = document.getElementById('btnSignIn');
  const btnSignUp = document.getElementById('btnSignUp');
  const authForm = document.getElementById('authForm');
  const emailEl = document.getElementById('authEmail');
  const passEl = document.getElementById('authPass');

  if (!window.AppAuth) return;

  window.AppAuth.onAuthStateChanged((user) => {
    if (user) {
      if (authForm) authForm.style.display = 'none';
      if (btnSignOut) btnSignOut.style.display = 'inline-block';
      if (btnSignIn) btnSignIn.style.display = 'none';
      if (btnSignUp) btnSignUp.style.display = 'none';

      // Inscreve para atualizações em tempo real
      if (window.AppAuth.subscribeToTasks) {
        if (unsubscribeAuth) unsubscribeAuth(); // limpa anterior se houver
        unsubscribeAuth = window.AppAuth.subscribeToTasks((dados) => {
          renderizarLista(dados);
        });
      } else {
        getLista();
      }
    } else {
      if (authForm) authForm.style.display = 'block';
      if (btnSignOut) btnSignOut.style.display = 'none';
      if (btnSignIn) btnSignIn.style.display = 'inline-block';
      if (btnSignUp) btnSignUp.style.display = 'inline-block';

      // Limpa lista ao deslogar
      const ul = document.getElementById('montarLista');
      if (ul) ul.innerHTML = '';
      const emptyEl = document.getElementById('emptyState');
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.innerText = 'Faça login para ver suas tarefas.';
      }
    }
  });

  if (btnSignIn) {
    btnSignIn.addEventListener('click', async () => {
      try {
        await window.AppAuth.signIn(emailEl.value, passEl.value);
      } catch (e) {
        alert('Erro ao entrar: ' + e.message);
      }
    });
  }

  if (btnSignUp) {
    btnSignUp.addEventListener('click', async () => {
      try {
        await window.AppAuth.signUp(emailEl.value, passEl.value);
      } catch (e) {
        alert('Erro ao registrar: ' + e.message);
      }
    });
  }

  if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
      try {
        await window.AppAuth.signOut();
      } catch (e) {
        console.error(e);
      }
    });
  }
}

/**
 * getLista()
 * - Busca a lista de tarefas no servidor (Fallback REST ou AppAuth one-time)
 */
function getLista() {
  // Se tiver AppAuth com subscribe, a lógica é tratada no onAuthStateChanged
  if (window.AppAuth && window.AppAuth.subscribeToTasks) return;

  let ul = document.getElementById('montarLista');
  let emptyEl = document.getElementById('emptyState');

  if (!ul) return;

  if (window.AppAuth) {
    window.AppAuth.getTasks()
      .then((dados) => renderizarLista(dados))
      .catch((err) => console.error('Erro ao obter tarefas via AppAuth', err));
    return;
  }

  // Fallback REST
  fetch(url + '/tarefas.json').then((response) => {
    if (response.status === 200) {
      response.json().then((dados) => renderizarLista(dados));
    }
  });
}

function renderizarLista(dados) {
  let ul = document.getElementById('montarLista');
  let emptyEl = document.getElementById('emptyState');

  if (!ul) return;

  ul.innerHTML = ''; // Limpa lista atual

  if (!dados) {
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.innerText = 'Nenhuma tarefa encontrada.';
    }
    return;
  }

  const arrayListaTarefas = Object.entries(dados);
  if (arrayListaTarefas.length === 0) {
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.innerText = 'Nenhuma tarefa encontrada.';
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  arrayListaTarefas.forEach((element) => {
    const node = montarLista(element[1], element[0]);
    ul.appendChild(node);
  });
}

function montarLista(tarefa, idBanco) {
  const li = document.createElement('li');
  // Fix: remove aspas extras no ID
  li.id = idBanco;

  const main = document.createElement('div');
  main.className = 'task-main';

  const text = document.createElement('div');
  text.className = 'task-text';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = tarefa.titulo || '';

  const desc = document.createElement('div');
  desc.className = 'task-desc';
  desc.textContent = tarefa.descricao || '';

  text.appendChild(title);
  text.appendChild(desc);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const btnEdit = document.createElement('button');
  btnEdit.textContent = 'Editar';
  btnEdit.addEventListener('click', function () {
    editarTarefas(idBanco, tarefa);
  });

  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Deletar';
  btnDelete.addEventListener('click', function () {
    deletarTarefas(idBanco);
  });

  actions.appendChild(btnEdit);
  actions.appendChild(btnDelete);

  main.appendChild(text);
  main.appendChild(actions);
  li.appendChild(main);

  return li;
}

function editarTarefas(idBanco, tarefaAtual) {
  if (estaEditado) return;

  const liParaEditar = document.getElementById(idBanco);
  if (!liParaEditar) return;

  estaEditado = true;

  // Limpa o LI e constrói o form via DOM
  liParaEditar.innerHTML = '';

  const main = document.createElement('div');
  main.className = 'task-main';

  const textDiv = document.createElement('div');
  textDiv.className = 'task-text';

  // Grupo Título
  const groupTitle = document.createElement('div');
  groupTitle.className = 'form-group';
  const labelTitle = document.createElement('label');
  labelTitle.textContent = 'Editar Título';
  const inputTitle = document.createElement('input');
  inputTitle.type = 'text';
  inputTitle.value = tarefaAtual.titulo || '';
  inputTitle.placeholder = 'Título da tarefa';
  groupTitle.appendChild(labelTitle);
  groupTitle.appendChild(document.createElement('br'));
  groupTitle.appendChild(inputTitle);

  // Grupo Descrição
  const groupDesc = document.createElement('div');
  groupDesc.className = 'form-group';
  const labelDesc = document.createElement('label');
  labelDesc.textContent = 'Editar Descrição';
  const areaDesc = document.createElement('textarea');
  areaDesc.value = tarefaAtual.descricao || '';
  areaDesc.placeholder = 'Descrição da tarefa';
  groupDesc.appendChild(labelDesc);
  groupDesc.appendChild(document.createElement('br'));
  groupDesc.appendChild(areaDesc);

  textDiv.appendChild(groupTitle);
  textDiv.appendChild(groupDesc);

  // Ações
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-actions';

  const btnSave = document.createElement('button');
  btnSave.textContent = 'Salvar';
  btnSave.addEventListener('click', () => {
    salvarTarefa(idBanco, inputTitle.value, areaDesc.value);
  });

  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Cancelar';
  btnCancel.style.marginLeft = '5px'; // pequeno ajuste visual
  btnCancel.addEventListener('click', () => {
    estaEditado = false;
    // Recarrega a lista para restaurar o item (ou usa dados locais se tivesse cache)
    // Como estamos com listener, talvez o ideal fosse apenas redesenhar este item,
    // mas o listener vai cuidar se houver update.
    // Aqui, forçamos um re-render simples ou esperamos o listener.
    // Simplificação: chama getLista() ou espera o listener atualizar se algo mudou.
    // Mas se cancelou, nada mudou no server. Então precisamos restaurar o visual.
    if (window.AppAuth && window.AppAuth.subscribeToTasks) {
      // O listener deve estar ativo, mas como alteramos o DOM localmente,
      // precisamos forçar um refresh visual.
      // Uma forma é ler o estado atual do banco (que não mudou).
      // Ou simplesmente recarregar a página/lista.
      // Vamos confiar no listener disparando ou chamar renderizarLista com o que temos?
      // O listener não dispara se não houver mudança no server.
      // Então vamos restaurar manualmente chamando renderizarLista com dados atuais se possível,
      // ou apenas recarregando tudo.
      window.location.reload(); // Brutal mas resolve rápido no curto prazo.
      // Melhor:
      // renderizarLista(dadosCacheados); // mas não temos cache global aqui fácil.
    } else {
      getLista();
    }
  });

  actionsDiv.appendChild(btnSave);
  actionsDiv.appendChild(btnCancel);

  main.appendChild(textDiv);
  main.appendChild(actionsDiv);
  liParaEditar.appendChild(main);
}

function salvarTarefa(idBanco, titulo, descricao) {
  const tarefa = {
    titulo: titulo,
    descricao: descricao,
  };

  if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
    window.AppAuth.updateTask(idBanco, tarefa)
      .then(() => {
        estaEditado = false;
        // Listener vai atualizar a UI
      })
      .catch((e) => console.error('Erro ao salvar', e));
  } else {
    fetch(url + `/tarefas/${idBanco}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa),
    }).then((response) => {
      if (response.status == 200) {
        estaEditado = false;
        getLista();
      }
    });
  }
}

function deletarTarefas(idBanco) {
  const confirme = confirm('Tem certeza que deseja deletar esta tarefa?');
  if (confirme) {
    if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
      window.AppAuth.deleteTask(idBanco).catch((e) =>
        console.error('Erro ao deletar', e)
      );
      // Listener atualiza UI
    } else {
      fetch(url + `/tarefas/${idBanco}.json`, {
        method: 'DELETE',
      }).then((response) => {
        if (response.status == 200) {
          getLista();
        }
      });
    }
  }
}

function criarTarefa() {
  let titulo = document.getElementById('titulo').value;
  let descricao = document.getElementById('descricao').value;
  let mensagem = document.getElementById('mensagem');

  if (typeof window._mensagemTimeout === 'undefined')
    window._mensagemTimeout = null;

  const tarefa = {
    id: new Date().toISOString(), // Ainda usado para fallback, mas Firebase gera pushID
    titulo: titulo,
    descricao: descricao,
  };

  const onSucesso = () => {
    if (mensagem) {
      clearTimeout(window._mensagemTimeout);
      mensagem.className = ''; // limpa classes
      mensagem.classList.add('msg-success', 'visible');
      mensagem.innerText = 'Salvo com sucesso';
      window._mensagemTimeout = setTimeout(() => {
        mensagem.classList.remove('visible');
      }, 4000);
    }
    // Limpa form
    const t = document.getElementById('titulo');
    const d = document.getElementById('descricao');
    if (t) {
      t.value = '';
      t.focus();
    }
    if (d) d.value = '';

    if (!window.AppAuth) getLista(); // Se não tem listener, atualiza manual
  };

  const onErro = (err) => {
    console.error(err);
    if (mensagem) {
      clearTimeout(window._mensagemTimeout);
      mensagem.className = '';
      mensagem.classList.add('msg-error', 'visible');
      mensagem.innerText = 'Erro ao salvar: ' + (err.message || err);
      window._mensagemTimeout = setTimeout(() => {
        mensagem.classList.remove('visible');
      }, 6000);
    }
  };

  if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
    window.AppAuth.createTask(tarefa).then(onSucesso).catch(onErro);
  } else {
    fetch(url + '/tarefas.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa),
    })
      .then((response) => {
        if (response.ok) onSucesso();
        else onErro('HTTP ' + response.status);
      })
      .catch(onErro);
  }
}
