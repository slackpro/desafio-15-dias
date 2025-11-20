// firebaseConfig.sample.js
// Copie este arquivo para `firebaseConfig.js` e substitua os valores
// com as credenciais do seu projeto Firebase (Project Settings -> SDK -> Config).

// Exemplo:
// const FIREBASE_CONFIG = {
//   apiKey: "...",
//   authDomain: "your-project.firebaseapp.com",
//   databaseURL: "https://your-project.firebaseio.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "...",
//   appId: "..."
// };

// Após preencher, adicione <script src="/firebaseConfig.js"></script> antes de /firebase-init.js
// Observação: por segurança, não compartilhe suas chaves publicamente em repositórios públicos.

/* Exemplo em branco (substitua pelos valores reais):
const FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  databaseURL: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};
*/

// firebaseConfig.js
// Coloque este arquivo na raiz do servidor para que /firebaseConfig.js seja importável pelo browser.
// Apenas exporte a constante FIREBASE_CONFIG — não inicialize o Firebase aqui.

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAhMWkMOtDg0kT95K7MWpYDQRkRnHlEcsk',
  authDomain: 'desafio-15-dias-315e5.firebaseapp.com',
  databaseURL: 'https://desafio-15-dias-315e5-default-rtdb.firebaseio.com',
  projectId: 'desafio-15-dias-315e5',
  storageBucket: 'desafio-15-dias-315e5.firebasestorage.app',
  messagingSenderId: '136597315026',
  appId: '1:136597315026:web:07c312bf34073a7616fc0b',
  measurementId: 'G-J5LX6T9SJN',
};
