// firebase-init.js (module)
// --------------------------------------
// Objetivo:
// - Inicializar o Firebase SDK (Auth + Realtime Database) quando o arquivo
//   `/firebaseConfig.js` estiver presente e exportar `FIREBASE_CONFIG`.
// - Expor uma API global leve `window.AppAuth` para uso no frontend.
// - Arquitetura: os dados do usuário são armazenados no nó
//   `users/{uid}/tarefas` (cada usuário tem seu próprio conjunto de tarefas).
//
// Observações educativas:
// - O arquivo `firebaseConfig.js` NÃO é fornecido no repositório por segurança.
//   Ele deve exportar o objeto `FIREBASE_CONFIG` como um ES module.
// - Se `firebaseConfig.js` não existir, o app continuará funcionando usando
//   o fallback REST (útil para testes locais), mas sem autenticação por usuário.
// - Em produção, configure regras do Realtime Database para restringir acesso
//   a `users/$uid` apenas para `auth.uid === $uid`.
// --------------------------------------

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child,
  update,
  remove,
  onValue,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Tenta importar a configuração exportada pelo arquivo `firebaseConfig.js` (criado pelo usuário).
// Se não existir, não inicializa o Firebase e o projeto continuará a usar o fallback REST.
let firebaseConfig = null;
try {
  // eslint-disable-next-line no-undef
  // Se o usuário criou `firebaseConfig.js` que faz `export const FIREBASE_CONFIG = {...}`
  // podemos importá-lo dinamicamente. Import relativo funciona quando o arquivo
  // está no mesmo diretório do bundle. Tentar importar './firebaseConfig.js'.
  const mod = await import('./firebaseConfig.js');
  firebaseConfig = mod.FIREBASE_CONFIG || null;
} catch (e) {
  // não encontrou firebaseConfig.js — tudo bem, faremos fallback
  console.info(
    'firebase-init: nenhum firebaseConfig.js encontrado. Usando fallback REST.'
  );
}

if (firebaseConfig) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  // API simples exposta em window.AppAuth
  window.AppAuth = {
    // registra um callback para mudanças de estado de autenticação
    onAuthStateChanged: (cb) => onAuthStateChanged(auth, (user) => cb(user)),
    signIn: async (email, password) => {
      console.debug('AppAuth.signIn called', email);
      return signInWithEmailAndPassword(auth, email, password);
    },
    signUp: async (email, password) => {
      console.debug('AppAuth.signUp called', email);
      return createUserWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      console.debug('AppAuth.signOut called');
      return signOut(auth);
    },
    getUid: () => (auth.currentUser ? auth.currentUser.uid : null),
    // tarefas
    getTasks: async () => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      console.debug('AppAuth.getTasks called, uid=', uid);
      if (!uid) return null;
      const snap = await get(child(ref(db), `users/${uid}/tarefas`));
      const val = snap.exists() ? snap.val() : null;
      console.debug(
        'AppAuth.getTasks result keys=',
        val ? Object.keys(val) : null
      );
      return val;
    },
    subscribeToTasks: (callback) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      console.debug('AppAuth.subscribeToTasks called, uid=', uid);
      if (!uid) return null;
      const tasksRef = ref(db, `users/${uid}/tarefas`);
      return onValue(tasksRef, (snapshot) => {
        const val = snapshot.exists() ? snapshot.val() : null;
        callback(val);
      });
    },
    createTask: async (task) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      console.debug('AppAuth.createTask called, uid=', uid, 'task=', task);
      if (!uid) throw new Error('Usuário não autenticado');
      const newRef = push(ref(db, `users/${uid}/tarefas`));
      await set(newRef, task);
      console.debug('AppAuth.createTask wrote key=', newRef.key);
      return newRef.key;
    },
    updateTask: async (taskId, task) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      console.debug(
        'AppAuth.updateTask called, uid=',
        uid,
        'taskId=',
        taskId,
        'task=',
        task
      );
      if (!uid) throw new Error('Usuário não autenticado');
      await update(ref(db, `users/${uid}/tarefas/${taskId}`), task);
      console.debug('AppAuth.updateTask ok');
    },
    deleteTask: async (taskId) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      console.debug('AppAuth.deleteTask called, uid=', uid, 'taskId=', taskId);
      if (!uid) throw new Error('Usuário não autenticado');
      await remove(ref(db, `users/${uid}/tarefas/${taskId}`));
      console.debug('AppAuth.deleteTask ok');
    },
  };

  // marca que inicializou
  window.__FIREBASE_INITIALIZED__ = true;
  console.info('firebase-init: Firebase inicializado e AppAuth disponível.');
}
