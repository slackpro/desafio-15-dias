// layout.js
// --------------------------------------
// Gerencia o layout global da aplicação (barra de navegação e autenticação).
// Substitui os antigos topnav.js, topnav.html e auth-banner.js.
// --------------------------------------

(function () {
  // Template HTML da barra de navegação
  const TOPNAV_TEMPLATE = `
    <div class="topnav">
      <div class="auth-left" id="topnavAuth" aria-live="polite">
        <span class="auth-avatar" id="authAvatar" aria-hidden="true"></span>
        <span class="auth-name" id="authName"></span>
        <button id="authLogout" class="auth-logout-button" style="display:none">Sair</button>
      </div>
      <div class="links">
        <a href="index.html">Cadastrar</a>
        <a href="listarTarefas.html">Listar</a>
      </div>
    </div>
  `;

  // Inicializa a barra de navegação
  function initLayout() {
    // 1. Injeta o HTML da navbar
    const navContainer = document.createElement('div');
    navContainer.innerHTML = TOPNAV_TEMPLATE.trim();
    const nav = navContainer.firstElementChild;

    // Marca link ativo
    const current = (location.pathname || '/').split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === current) a.classList.add('active');
    });

    // Insere no DOM (antes do .panel ou no início do body)
    const panel = document.querySelector('.panel');
    if (panel && panel.parentNode) {
      panel.parentNode.insertBefore(nav, panel);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }

    // 2. Configura a lógica de autenticação (antigo auth-banner.js)
    initAuthWidget(nav);
  }

  // Configura o widget de usuário (avatar, nome, logout)
  function initAuthWidget(navElement) {
    const avatarEl = navElement.querySelector('#authAvatar');
    const nameEl = navElement.querySelector('#authName');
    const logoutBtn = navElement.querySelector('#authLogout');

    // Listener de Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          if (window.AppAuth && typeof window.AppAuth.signOut === 'function') {
            await window.AppAuth.signOut();
          }
        } catch (err) {
          console.error('Erro ao deslogar', err);
        }
      });
    }

    // Atualiza UI com dados do usuário
    function update(user) {
      if (user) {
        const displayName =
          user.displayName ||
          (user.email ? user.email.split('@')[0] : user.uid);
        const formatted = formatName(displayName);

        if (nameEl) nameEl.textContent = formatted;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';

        if (avatarEl) {
          if (user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${formatted}"/>`;
            avatarEl.classList.add('has-photo');
          } else {
            avatarEl.classList.remove('has-photo');
            avatarEl.textContent = initials(formatted);
          }
        }
      } else {
        if (nameEl) nameEl.textContent = '';
        if (avatarEl) {
          avatarEl.textContent = '';
          avatarEl.classList.remove('has-photo');
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    }

    // Helpers de formatação
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
      s = s.replace(/[._]/g, ' ');
      if (s.includes('@')) s = s.split('@')[0];
      const parts = s.split(' ').filter(Boolean);
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // Registra listener do Firebase Auth
    function setup() {
      if (
        window.AppAuth &&
        typeof window.AppAuth.onAuthStateChanged === 'function'
      ) {
        window.AppAuth.onAuthStateChanged(update);
      }
    }

    if (window.__FIREBASE_INITIALIZED__) {
      setup();
    } else {
      window.addEventListener('firebase-ready', setup);
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
