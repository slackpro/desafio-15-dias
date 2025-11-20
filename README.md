# Desafio - 15 Dias (Minhas Tarefas)

Este projeto é uma pequena aplicação de exemplo criada para fins educacionais e para compor um portfólio. Ele demonstra uma aplicação frontend em HTML/CSS/Vanilla JS com duas páginas: cadastro de tarefas e listagem. A autenticação e armazenamento persistente são opcionais e integráveis via Firebase (Realtime Database + Auth).

Resumo rápido

- UI: `index.html` (criar tarefa) e `listarTarefas.html` (ver/editar/deletar)
- Estilização: `style.css` (componentes, painel e navbar)
- Lógica: `script.js` (CRUD, renderização DOM, fallback REST)
- Autenticação/DB (opcional): `firebase-init.js` + `firebaseConfig.js` (do usuário)
- Componentes compartilhados: `topnav.html`, `topnav.js`, `auth-banner.js`

Principais objetivos do projeto

- Demonstrar boas práticas de DOM (evitar innerHTML quando possível)
- Demonstração de feature-detection: usar Firebase SDK quando configurado, caso contrário usar fallback via REST para testes locais
- Organização de um partial (topnav) carregado via JS para evitar duplicação
- Experiência UX simples: mensagens, validações mínimas, feedback visual

Como usar (local)

1. Clone o repositório
   git clone <repo>
2. Abra a pasta no VSCode e inicie o Live Server (recomendado) ou rode um servidor estático:

```powershell
# Python 3
python -m http.server 5500

# ou usando Live Server VSCode
```

3. Abra `http://127.0.0.1:5500/index.html` e `listarTarefas.html`.

Firebase (opcional, recomendado para uso real)

1. Crie um projeto no Firebase Console.
2. Habilite o **Realtime Database** e **Authentication (Email/Password)**.
3. Configure regras do Realtime Database para separar dados por usuário (exemplo mínimo):

```json
{
  "rules": {
    "users": {
      "$uid": {
        "tarefas": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

4. No Console, obtenha a configuração do Firebase (apiKey, authDomain, databaseURL, etc.) e crie um arquivo `firebaseConfig.js` na raiz do projeto com este conteúdo:

```javascript
// firebaseConfig.js - NÃO compartilhe este arquivo publicamente com chaves em produção
export const FIREBASE_CONFIG = {
  apiKey: '...',
  authDomain: '...',
  databaseURL: 'https://<your-db>.firebaseio.com',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

5. Abra a página: `firebase-init.js` tentará importar `/firebaseConfig.js` e, se existir, inicializará o Firebase e habilitará autenticação por usuário.

Importante: segurança e testes

- Em produção, nunca exponha chaves em repositórios públicos sem regras apropriadas.
- As regras do Realtime Database devem ser revisadas para garantir privacidade.

Arquivos e responsabilidades (detalhado)

- `index.html` — página para criar tarefas e UI de autenticação (entrar/registrar). Contém o formulário e carrega `script.js`.
- `listarTarefas.html` — página para listar, editar e excluir tarefas. Usa `getLista()` de `script.js`.
- `script.js` — lógica principal:
  - `getLista()` — busca tarefas; prioriza `window.AppAuth.getTasks()` quando disponível (Firebase SDK). Fallback: REST
  - `montarLista()` — cria nós DOM para cada tarefa (mais seguro que innerHTML)
  - `criarTarefa()`, `salvarTarefa()`, `deletarTarefas()` — CRUD com detecção de AppAuth
- `style.css` — todas as regras de estilo, componentes e responsividade. Contém `.panel`, `.form-group`, `.topnav`, `.auth-left`.
- `topnav.html` — partial do cabeçalho (pode ser aberto sozinho pelo Live Server também).
- `topnav.js` — carrega `topnav.html` dinamicamente e injeta no DOM; fornece fallback se fetch falhar.
- `auth-banner.js` — controla o widget de autenticação dentro do navbar (`.topnav .auth-left`); exibe avatar, nome formatado e botão sair.
- `firebase-init.js` — inicializa o Firebase (quando `firebaseConfig.js` estiver presente) e expõe `window.AppAuth` com métodos: `signIn`, `signUp`, `signOut`, `getTasks`, `createTask`, `updateTask`, `deleteTask`.

Dicas para portfólio

- Inclua capturas de tela (index + listagem + navbar autenticada) no README ou na página do repositório.
- Explique decisions técnicas: por que usar feature-detection, por que renderizar via DOM, e como a separação por `users/{uid}/tarefas` melhora segurança.
- Mostre variações: como adaptar para Firestore, adicionar upload de avatar (Firebase Storage) ou transformar em SPA com fetch + history API.

Contribuições e próximos passos

- Melhorias possíveis: validação de formulários, upload de avatar, teste automatizados, suporte a vários usuários em um modo admin, e migração para bundler/module build.

Licença

- Projeto de exemplo — adapte para seu portfólio. Remova chaves sensíveis antes de publicar.

Boa sorte! Se quiser, eu posso gerar imagens de exemplo para o README e scripts para deploy estático.

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

### Usando autenticação com Firebase (opcional)

Se quiser proteger os dados com autenticação (recomendado):

1. Crie um projeto no Firebase Console e habilite Authentication (Email/Password) e Realtime Database.
2. Copie o conteúdo de `firebaseConfig.sample.js` para um novo arquivo `firebaseConfig.js` na raiz do projeto e preencha os valores com as credenciais do seu projeto (Project Settings -> SDK -> Config).
3. Abra `index.html` e `listarTarefas.html` — o projeto já inclui um módulo `firebase-init.js` que tentará importar `firebaseConfig.js` automaticamente. Se encontrado, a UI de login/registro será ativada.

Observação: o arquivo `firebaseConfig.js` não é fornecido por motivos de segurança — não comite suas chaves públicas em repositórios abertos.

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
- Possíveis próximos passos: validar inputs, usar build tools ou migrar para framework (React/Vue) se necessário.

---
