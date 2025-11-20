// auth-banner.js
// --------------------------------------
// Widget responsável por exibir informações do usuário autenticado dentro
// do cabeçalho (`.topnav .auth-left`). O script:
// - Aguarda até que a `.topnav` exista (polling suave)
// - Injeta avatar, nome e botão de logout
// - Registra `AppAuth.onAuthStateChanged` para atualizar o estado em tempo real
//
// Projetado para ser simples e educativo — pode ser estendido para suportar
// upload de avatar (Firebase Storage) ou menu dropdown com mais opções.
// --------------------------------------
(function () {
  // tenta inicializar o widget de autenticação dentro da .topnav
  function initBanner() {
    // preferimos um placeholder específico dentro do topnav
    const banner =
      document.getElementById('topnavAuth') ||
      document.querySelector('.topnav .auth-left');
    if (!banner) return;

    // cria estrutura interna apenas uma vez
    banner.innerHTML = `
      <span class="auth-avatar" id="authAvatar" aria-hidden="true"></span>
      <span class="auth-name" id="authName"></span>
      <button id="authLogout" class="auth-logout-button" style="display:none">Sair</button>
    `;

    const avatarEl = banner.querySelector('#authAvatar');
    const nameEl = banner.querySelector('#authName');
    const logoutBtn = banner.querySelector('#authLogout');

    logoutBtn.addEventListener('click', async () => {
      try {
        if (window.AppAuth && typeof window.AppAuth.signOut === 'function') {
          await window.AppAuth.signOut();
        }
      } catch (err) {
        console.error('Erro ao deslogar', err);
      }
    });

    // Atualiza o banner a partir do objeto user do Firebase Auth
    function update(user) {
      if (!banner) return;
      if (user) {
        const displayName =
          user.displayName ||
          (user.email ? user.email.split('@')[0] : user.uid);
        const formatted = formatName(displayName);
        nameEl.textContent = formatted;
        logoutBtn.style.display = 'inline-block';

        // Se o Auth fornecer photoURL, usamos; senão, mostramos iniciais
        if (user.photoURL) {
          avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${formatted}"/>`;
          avatarEl.classList.add('has-photo');
        } else {
          avatarEl.classList.remove('has-photo');
          avatarEl.textContent = initials(formatted);
        }
      } else {
        nameEl.textContent = '';
        avatarEl.textContent = '';
        avatarEl.classList.remove('has-photo');
        logoutBtn.style.display = 'none';
      }
    }

    // Registra callback se disponível
    if (
      window.AppAuth &&
      typeof window.AppAuth.onAuthStateChanged === 'function'
    ) {
      window.AppAuth.onAuthStateChanged((user) => update(user));
    }

    // init successful
    return true;
  }

  function initials(name) {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function formatName(s) {
    if (!s) return '';
    // remove pontos/underscores comuns em emails/usernames e capitaliza
    s = s.replace(/[._]/g, ' ');
    if (s.includes('@')) s = s.split('@')[0];
    const parts = s.split(' ').filter(Boolean);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  let tries = 0;
  const iv = setInterval(() => {
    tries += 1;
    try {
      const done = initBanner();
      if (done) {
        clearInterval(iv);
      }
    } catch (err) {
      // swallow and retry until limit
    }
    if (tries > 40) {
      clearInterval(iv);
    }
  }, 300);
})();
