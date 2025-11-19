// firebase-init.js (module)
// Este módulo inicializa o Firebase (quando o arquivo firebaseConfig.js existir)
// e expõe uma API global simples `window.AppAuth` com métodos para autenticação
// e leitura/escrita de tarefas no nó `users/{uid}/tarefas`.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getDatabase, ref, push, set, get, child, update, remove } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Tenta importar a configuração exportada pelo arquivo `firebaseConfig.js` (criado pelo usuário).
// Se não existir, não inicializa o Firebase e o projeto continuará a usar o fallback REST.
let firebaseConfig = null;
try {
  // eslint-disable-next-line no-undef
  // Se o usuário criou `firebaseConfig.js` que faz `export const FIREBASE_CONFIG = {...}`
  // podemos importá-lo dinamicamente. Como browsers não permitem imports dinâmicos fáceis
  // sem path absoluto, pedimos que o usuário coloque um arquivo `firebaseConfig.js` na raiz
  // que exporte `FIREBASE_CONFIG` (ES module). Tentar importar de '/firebaseConfig.js'.
  const mod = await import('/firebaseConfig.js');
  firebaseConfig = mod.FIREBASE_CONFIG || null;
} catch (e) {
  // não encontrou firebaseConfig.js — tudo bem, faremos fallback
  console.info('firebase-init: nenhum firebaseConfig.js encontrado. Usando fallback REST.');
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
      return signInWithEmailAndPassword(auth, email, password);
    },
    signUp: async (email, password) => {
      return createUserWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      return signOut(auth);
    },
    getUid: () => (auth.currentUser ? auth.currentUser.uid : null),
    // tarefas
    getTasks: async () => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      if (!uid) return null;
      const snap = await get(child(ref(db), `users/${uid}/tarefas`));
      return snap.exists() ? snap.val() : null;
    },
    createTask: async (task) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      if (!uid) throw new Error('Usuário não autenticado');
      const newRef = push(ref(db, `users/${uid}/tarefas`));
      await set(newRef, task);
      return newRef.key;
    },
    updateTask: async (taskId, task) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      if (!uid) throw new Error('Usuário não autenticado');
      await update(ref(db, `users/${uid}/tarefas/${taskId}`), task);
    },
    deleteTask: async (taskId) => {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      if (!uid) throw new Error('Usuário não autenticado');
      await remove(ref(db, `users/${uid}/tarefas/${taskId}`));
    }
  };

  // marca que inicializou
  window.__FIREBASE_INITIALIZED__ = true;
  console.info('firebase-init: Firebase inicializado e AppAuth disponível.');
}
