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

/**
 * getLista()
 * - Busca a lista de tarefas no servidor
 * - Converte o resultado em HTML chamando montarLista para cada item
 * - Mostra ou esconde o elemento #emptyState dependendo do resultado
 */
function getLista() {
  let ul = document.getElementById('montarLista');
  let emptyEl = document.getElementById('emptyState');
  let html = '';
  // Se a página não tiver o elemento de listagem, sair silenciosamente.
  // Isso evita erros quando chamamos getLista() em páginas que não mostram a lista.
  if (!ul) {
    console.warn('getLista: elemento "montarLista" não encontrado. Pulando.');
    return;
  }

  // Observability: logs ajudam a diagnosticar quando o AppAuth está presente
  console.debug(
    'getLista: window.AppAuth=',
    !!window.AppAuth,
    '__FIREBASE_INITIALIZED__=',
    !!window.__FIREBASE_INITIALIZED__
  );
  // Se o Firebase foi inicializado, use a API AppAuth que garante que
  // estamos lendo os dados do nó por-usuário (/users/{uid}/tarefas).
  // Se a API AppAuth estiver disponível, sempre priorize ela e NÃO tente o fallback REST
  // O fallback pode gerar 401 se o Realtime Database estiver protegido por regras.
  if (window.AppAuth) {
    console.debug('getLista: usando AppAuth.getTasks()');
    window.AppAuth.getTasks()
      .then((dados) => {
        if (!dados) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          console.debug('getLista: AppAuth.getTasks retornou vazio/null');
          return;
        }

        const arrayListaTarefas = Object.entries(dados);
        if (arrayListaTarefas.length === 0) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        ul.innerHTML = '';
        arrayListaTarefas.forEach((element) => {
          const node = montarLista(element[1], element[0]);
          ul.appendChild(node);
        });
        if (emptyEl) emptyEl.style.display = 'none';
      })
      .catch((err) => {
        console.error('Erro ao obter tarefas via AppAuth', err);
      });
    return;
  }

  // Fallback: comportamento antigo via REST (sem autenticação)
  console.warn(
    'getLista: AppAuth não disponível — usando fallback REST (pode gerar 401).'
  );
  fetch(url + '/tarefas.json').then((response) => {
    if (response.status === 200) {
      response.json().then((dados) => {
        if (!dados) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        let arrayListaTarefas = Object.entries(dados);
        if (arrayListaTarefas.length === 0) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        ul.innerHTML = '';
        arrayListaTarefas.forEach((element) => {
          const node = montarLista(element[1], element[0]);
          ul.appendChild(node);
        });
        if (emptyEl) emptyEl.style.display = 'none';
      });
    }
  });
}

/**
 * montarLista(tarefa, idBanco)
 * - Recebe um objeto `tarefa` (com título e descrição) e o id no banco
 * - Retorna uma string HTML representando um item de lista estruturado
 * - Observação: o HTML gerado inclui classes usadas pelo CSS (.task-title, .task-desc, .task-actions)
 */
/**
 * montarLista(tarefa, idBanco)
 * - Versão refatorada: cria elementos DOM (mais seguro e testável)
 * - Retorna um elemento <li> pronto para ser anexado ao <ul>
 *
 * Abaixo, deixamos comentada a versão antiga que retornava string HTML
 * (mantida para aprendizado/comparação). A versão com DOM evita
 * problemas com injeção de HTML e é mais fácil de manipular programaticamente.
 */

/*
function montarLista_old(tarefa, idBanco) {
  return `<li id="'${tarefa.id}'">
      <div class="task-main">
        <div class="task-text">
          <div class="task-title">${tarefa.titulo}</div>
          <div class="task-desc">${tarefa.descricao}</div>
        </div>
        <div class="task-actions">
          <button onclick="editarTarefas('${tarefa.id}', '${idBanco}')">Editar</button>
          <button onclick="deletarTarefas('${idBanco}')">Deletar</button>
        </div>
      </div>
    </li>`;
}
*/

function montarLista(tarefa, idBanco) {
  // cria o <li> e define o id no mesmo formato usado antes (com aspas simples)
  const li = document.createElement('li');
  li.id = `'${tarefa.id}'`;

  // estrutura principal
  const main = document.createElement('div');
  main.className = 'task-main';

  // texto: título + descrição
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

  // ações: botões Editar / Deletar
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const btnEdit = document.createElement('button');
  btnEdit.textContent = 'Editar';
  // chamamos a função global editarTarefas passando os ids
  btnEdit.addEventListener('click', function () {
    editarTarefas(tarefa.id, idBanco);
  });

  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Deletar';
  btnDelete.addEventListener('click', function () {
    deletarTarefas(idBanco);
  });

  actions.appendChild(btnEdit);
  actions.appendChild(btnDelete);

  // montar árvore
  main.appendChild(text);
  main.appendChild(actions);
  li.appendChild(main);

  return li;
}

/**
 * editarTarefas(id, idBanco)
 * - Quando o usuário clica em "Editar", substitui o conteúdo do <li> pelo formulário de edição
 * - A flag `estaEditado` impede que várias edições sejam abertas ao mesmo tempo
 * - O formulário usa a mesma estrutura visual (.task-main, .task-text, .task-actions)
 */
function editarTarefas(id, idBanco) {
  if (!estaEditado) {
    // Seleciona o <li> pelo id gerado
    let liParaEditar = document.getElementById(`'${id}'`);

    // HTML do formulário de edição (injetado diretamente no <li>)
    const html = `<div class="task-main">
      <div class="task-text">
        <div class="form-group">
          <label>Editar Título da tarefa</label><br />
          <input id="titulo" type="text" placeholder="Título da tarefa" />
        </div>
        <div class="form-group">
          <label>Edditar Descrição da tarefa</label><br />
          <textarea id="descricao" placeholder="Descrião da tarefa"></textarea>
        </div>
      </div>
      <div class="task-actions">
        <button onclick="salvarTarefa('${idBanco}')">Salvar</button>
      </div>
    </div>`;

    // Substitui o conteúdo do <li> e marca como editando
    liParaEditar.innerHTML = html;
    estaEditado = true;
  }
}

/**
 * salvarTarefa(idBanco)
 * - Lê os valores do formulário de edição e envia um PATCH para atualizar apenas os campos alterados
 * - Ao receber sucesso, recarrega a lista chamando getLista()
 */
function salvarTarefa(idBanco) {
  const titulo = document.getElementById('titulo').value;
  const descricao = document.getElementById('descricao').value;
  const tarefa = {
    titulo: titulo,
    descricao: descricao,
  };

  // Se AppAuth disponível, atualiza no nó do usuário
  if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
    console.debug('salvarTarefa: usando AppAuth.updateTask', idBanco, tarefa);
    window.AppAuth.updateTask(idBanco, tarefa)
      .then(() => getLista())
      .catch((e) => console.error('salvarTarefa erro AppAuth.updateTask', e));
  } else {
    fetch(url + `/tarefas/${idBanco}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tarefa),
    }).then((response) => {
      if (response.status == 200) {
        // Recarrega a lista para refletir as mudanças
        getLista();
      }
    });
  }

  // Permite futuras edições novamente
  estaEditado = false;

  console.log(titulo, descricao);
}

/**
 * deletarTarefas(idBanco)
 * - Pergunta ao usuário para confirmar e, se confirmado, envia DELETE para o servidor
 */
function deletarTarefas(idBanco) {
  const confirme = confirm('Tem certeza que deseja deletar esta tarefa?');
  if (confirme) {
    if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
      console.debug('deletarTarefas: usando AppAuth.deleteTask', idBanco);
      window.AppAuth.deleteTask(idBanco)
        .then(() => getLista())
        .catch((e) =>
          console.error('deletarTarefas erro AppAuth.deleteTask', e)
        );
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

/**
 * criarTarefa()
 * - Lê os campos do formulário de cadastro, monta um objeto tarefa com id baseado em timestamp
 * - Envia POST para /tarefas.json criando um novo registro
 * - Exibe uma mensagem simples em #mensagem dependendo do resultado
 */
function criarTarefa() {
  let titulo = document.getElementById('titulo').value;
  let descricao = document.getElementById('descricao').value;
  let mensagem = document.getElementById('mensagem');
  // timeout para esconder a mensagem depois do fade
  if (typeof window._mensagemTimeout === 'undefined')
    window._mensagemTimeout = null;

  const tarefa = {
    id: new Date().toISOString(),
    titulo: titulo,
    descricao: descricao,
  };

  try {
    // Se o AppAuth (Firebase SDK) estiver inicializado, use a API por-usuário
    // Isso evita erros 401 quando as regras do Realtime Database exigem autenticação
    if (window.AppAuth && window.__FIREBASE_INITIALIZED__) {
      console.debug('criarTarefa: usando AppAuth.createTask', tarefa);
      window.AppAuth.createTask(tarefa)
        .then(() => {
          if (mensagem) {
            clearTimeout(window._mensagemTimeout);
            mensagem.classList.remove('msg-error');
            mensagem.classList.add('msg-success');
            mensagem.innerText = 'Salvo com sucesso';
            mensagem.classList.add('visible');
            window._mensagemTimeout = setTimeout(() => {
              mensagem.classList.remove('visible');
            }, 4000);
          }
          // limpa campos do formulário após criar com sucesso
          try {
            const tituloEl = document.getElementById('titulo');
            const descEl = document.getElementById('descricao');
            if (tituloEl) {
              tituloEl.value = '';
              tituloEl.focus();
            }
            if (descEl) descEl.value = '';
          } catch (e) {
            /* ignorar se elementos não existirem na página atual */
          }
          if (typeof getLista === 'function') getLista();
        })
        .catch((err) => {
          console.error('Erro criando tarefa via AppAuth', err);
          if (mensagem) {
            clearTimeout(window._mensagemTimeout);
            mensagem.classList.remove('msg-success');
            mensagem.classList.add('msg-error');
            mensagem.innerText = 'Erro ao salvar: ' + (err.message || err);
            mensagem.classList.add('visible');
            window._mensagemTimeout = setTimeout(() => {
              mensagem.classList.remove('visible');
            }, 6000);
          }
        });
    } else {
      // Fallback antigo via REST (sem autenticação)
      fetch(url + '/tarefas.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefa),
      }).then((response) => {
        if (response.ok) {
          if (mensagem) {
            clearTimeout(window._mensagemTimeout);
            mensagem.classList.remove('msg-error');
            mensagem.classList.add('msg-success');
            mensagem.innerText = 'Salvo com sucesso';
            mensagem.classList.add('visible');
            window._mensagemTimeout = setTimeout(() => {
              mensagem.classList.remove('visible');
            }, 4000);
          }
          // limpa campos do formulário após criar com sucesso
          try {
            const tituloEl = document.getElementById('titulo');
            const descEl = document.getElementById('descricao');
            if (tituloEl) {
              tituloEl.value = '';
              tituloEl.focus();
            }
            if (descEl) descEl.value = '';
          } catch (e) {
            /* ignorar se elementos não existirem na página atual */
          }
          if (typeof getLista === 'function') getLista();
        } else {
          if (mensagem) {
            clearTimeout(window._mensagemTimeout);
            mensagem.classList.remove('msg-success');
            mensagem.classList.add('msg-error');
            mensagem.innerText =
              'Erro ao salvar (HTTP ' + response.status + ')';
            mensagem.classList.add('visible');
            window._mensagemTimeout = setTimeout(() => {
              mensagem.classList.remove('visible');
            }, 6000);
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    if (mensagem) {
      mensagem.classList.remove('msg-success');
      mensagem.classList.add('msg-error');
      mensagem.innerText = String(error);
    }
  }
}
