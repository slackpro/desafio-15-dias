# Desafio 15 Dias - App de Tarefas

Pequeno projeto frontend para cadastrar, listar, editar e deletar tarefas usando o Firebase Realtime Database.

## O que tem aqui
- `index.html` - formulário para criar tarefas.
- `listarTarefas.html` - página que lista tarefas do banco.
- `script.js` - lógica de comunicação com o Firebase (GET/POST/PATCH/DELETE).
- `style.css` - estilos modernos e responsivos para ambas as páginas.

## Tecnologias usadas
- HTML5
- CSS3
- JavaScript (vanilla)
- Firebase Realtime Database (REST API)

## Como o front consome o Firebase
O projeto usa chamadas HTTP para a REST API do Realtime Database:
- GET `/tarefas.json` - busca todas as tarefas
- POST `/tarefas.json` - cria nova tarefa
- PATCH `/tarefas/{id}.json` - atualiza campos de uma tarefa
- DELETE `/tarefas/{id}.json` - remove uma tarefa

A URL base está em `script.js` na variável `url`.

> Observação: este projeto usa o banco sem autenticação (apenas para demonstração). Em projetos reais, proteja o banco com regras e autenticação.

## Como testar localmente
1. Abra a pasta do projeto no VS Code.
2. Recomendo instalar a extensão Live Server e abrir `index.html` e `listarTarefas.html` com ela.

Alternativa (terminal):

```powershell
# no PowerShell (Windows)
cd path\to\desafio-15-dias
python -m http.server 5500
# acesse http://localhost:5500/index.html
```

## O que aprendi com o projeto
- Como consumir a REST API do Firebase sem SDKs, usando fetch e JSON.
- Boas práticas de estrutura de UI: separar título/descrição e ações em contêineres.
- Como gerar elementos DOM dinâmicos de forma segura (evitando concatenar strings HTML).
- Melhoria de UX e responsividade com CSS moderno.

## Notas para portfólio
- Projeto simples e direto, bom para demonstrar entendimento de integração com backend via HTTP.
- Código comentado em português para facilitar entendimento e uso didático.
- Possíveis próximos passos: adicionar autenticação, validar inputs, usar build tools ou migrar para framework (React/Vue) se necessário.

---

Se quiser, eu posso:
- Adicionar instruções para configurar o Firebase (como criar o Realtime Database e obter a URL).
- Migrar a montagem de elementos para uma função testável separada e adicionar testes unitários.
