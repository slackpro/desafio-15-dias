// URL base do banco de dados (Firebase Realtime Database neste projeto)
let url = 'https://desafio-15-dias-315e5-default-rtdb.firebaseio.com/';

// Flag para evitar múltiplas edições simultâneas
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

  // Faz uma requisição GET para /tarefas.json
  fetch(url + '/tarefas.json').then((response) => {
    if (response.status === 200) {
      response.json().then((dados) => {
        // Se não houver dados (null), mostrar mensagem de estado vazio
        if (!dados) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        // Converte o objeto retornado em um array de pares [key, value]
        let arrayListaTarefas = Object.entries(dados);

        // Se o array estiver vazio, mostrar mensagem de vazio
        if (arrayListaTarefas.length === 0) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        // Injeta os elementos DOM montados na lista e esconde o estado vazio
        ul.innerHTML = '';
        arrayListaTarefas.forEach((element) => {
          const node = montarLista(element[1], element[0]);
          // montarLista agora retorna um Element (li)
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
    fetch(url + `/tarefas/${idBanco}.json`, {
      method: 'DELETE',
    }).then((response) => {
      if (response.status == 200) {
        getLista();
      }
    });
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

  const tarefa = {
    id: new Date().toISOString(),
    titulo: titulo,
    descricao: descricao,
  };

  try {
    fetch(url + '/tarefas.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tarefa),
    }).then((Response) => {
      // Observação: alguns servidores retornam 200 como string, aqui mantemos a checagem original
      if (Response.status == '200') {
        mensagem.innerText = 'Salvo com sucesso';
      } else {
        mensagem.innerHTML = 'Erro ao salvar';
      }
    });
  } catch (error) {
    console.log(error);
    mensagem.innerHTML = error;
  }
}
