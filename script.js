let url = 'https://desafio-15-dias-315e5-default-rtdb.firebaseio.com/';
let estaEditado = false;

function getLista() {
  let ul = document.getElementById('montarLista');
  let emptyEl = document.getElementById('emptyState');
  let html = '';
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

        let arrayListaTarefas = Object.entries(dados); // transforma em array
        if (arrayListaTarefas.length === 0) {
          ul.innerHTML = '';
          if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerText = 'Nenhuma tarefa encontrada.';
          }
          return;
        }

        arrayListaTarefas.forEach((element) => {
          html += montarLista(element[1], element[0]);
        });
        ul.innerHTML = html;
        if (emptyEl) emptyEl.style.display = 'none';
      });
    }
  });
}

function montarLista(tarefa, idBanco) {
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

function editarTarefas(id, idBanco) {
  if (!estaEditado) {
    let liParaEditar = document.getElementById(`'${id}'`);
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
    liParaEditar.innerHTML = html;
    estaEditado = true;
  }
}

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
      getLista();
    }
  });
  estaEditado = false;

  console.log(titulo, descricao);
}

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
