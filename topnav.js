// topnav.js
// --------------------------------------
// Carrega dinamicamente o partial `topnav.html` e injeta o elemento `.topnav`
// no DOM. Objetivos:
// - Evitar duplicação de markup entre páginas (DRY)
// - Permitir servir `topnav.html` standalone (útil para Live Server)
// - Fornecer um fallback simples caso o fetch do partial falhe
//
// Observações:
// - `topnav.html` pode ser um fragmento ou um documento completo; este script
//   faz parsing e remove a primeira `.topnav` encontrada.
// - O fallback injeta um placeholder com `#topnavAuth` para manter compatibilidade.
// --------------------------------------
(function () {
  async function insertTopnav() {
    try {
      const res = await fetch('topnav.html', { cache: 'no-cache' });
      if (!res.ok) throw new Error('partial not found');
      const html = await res.text();
      // Use template to parse fragment or full document, then pick the .topnav element
      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      // procura primeiro elemento com a classe .topnav dentro do conteúdo
      let nav =
        tpl.content.querySelector('.topnav') || tpl.content.firstElementChild;
      if (!nav) throw new Error('no nav element in partial');

      // marca link ativo com base no pathname
      const current =
        (location.pathname || '/').split('/').pop() || 'index.html';
      nav.querySelectorAll('a').forEach((a) => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        if (href === current) a.classList.add('active');
      });

      const panel = document.querySelector('.panel');
      if (panel && panel.parentNode) panel.parentNode.insertBefore(nav, panel);
      else document.body.insertBefore(nav, document.body.firstChild);
    } catch (err) {
      // fallback: constrói nav simples para evitar quebra da UI
      console.warn('topnav partial failed, using fallback', err);
      const nav = document.createElement('div');
      nav.className = 'topnav';
      nav.innerHTML = `
        <div class="auth-left" id="topnavAuth"></div>
        <div class="links">
          <a href="index.html">Cadastrar</a>
          <a href="listarTarefas.html">Listar</a>
        </div>
      `;
      const current =
        (location.pathname || '/').split('/').pop() || 'index.html';
      nav.querySelectorAll('a').forEach((a) => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        if (href === current) a.classList.add('active');
      });
      const panel = document.querySelector('.panel');
      if (panel && panel.parentNode) panel.parentNode.insertBefore(nav, panel);
      else document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', insertTopnav);
  else insertTopnav();
})();
