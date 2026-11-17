/*
 * Medição de visitas do site Missão Dinheiro Club (Google Analytics 4) com consentimento (LGPD).
 *
 * Como funciona:
 * - Enquanto GA_ID estiver vazio, nada acontece: sem aviso e sem medição.
 * - Com GA_ID preenchido, aparece um aviso com "Aceitar" e "Recusar".
 *   O Google Analytics só é carregado depois de "Aceitar" (Consent Mode v2, tudo negado por padrão).
 * - Anúncios ficam sempre negados. Nenhum evento leva nome, e-mail ou qualquer dado pessoal.
 * - O link "Preferências de cookies" no rodapé reabre o aviso.
 */
(function () {
  'use strict';

  // ID de medição do GA4 (formato G-XXXXXXXXXX). Vem da propriedade "Missão Dinheiro Club".
  var GA_ID = 'G-RQFP60SYDZ';

  var CHAVE = 'mdc_consentimento';
  var VALIDADE_DIAS = 365;

  var script = document.currentScript;
  var raiz = script ? new URL('./', script.src).href : '/';

  function lerEscolha() {
    try {
      var r = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (!r || (Date.now() - r.d) > VALIDADE_DIAS * 864e5) return null;
      return r.v;
    } catch (e) { return null; }
  }
  function salvarEscolha(v) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ v: v, d: Date.now() })); } catch (e) {}
  }

  // Sem ID: esconde o link de preferências e não faz mais nada.
  if (!GA_ID) {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-cookies]').forEach(function (el) { el.hidden = true; });
    });
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  var carregado = false;
  function ligar() {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (carregado) return;
    carregado = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function apagarCookiesGA() {
    var dominios = ['', location.hostname, '.' + location.hostname.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var nome = c.split('=')[0].trim();
      if (nome.indexOf('_ga') !== 0) return;
      dominios.forEach(function (d) {
        document.cookie = nome + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }
  function desligar() {
    gtag('consent', 'update', { analytics_storage: 'denied' });
    apagarCookiesGA();
  }

  // ---------- Eventos (só são enviados com consentimento) ----------
  function evento(nome, el) {
    if (lerEscolha() !== 'aceito') return;
    var secao = el.closest('section[id], header, footer');
    var local = secao ? (secao.id || secao.tagName.toLowerCase()) : 'pagina';
    gtag('event', nome, { local: local });
  }
  function classificar(href) {
    if (!href) return null;
    if (/trilha-missao-dinheiro/.test(href)) return 'jogar_gratis';
    if (/sub_confirmation=1/.test(href)) return 'inscrever_canal';
    if (/youtu\.be\/|youtube\.com\/(watch|shorts)/.test(href)) return 'ver_youtube';
    if (/hotmart\.com|pay\.hotmart|go\.hotmart/.test(href)) return 'ir_hotmart';
    return null;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a) {
      var nome = classificar(a.href);
      if (nome) evento(nome, a);
      return;
    }
    var play = e.target.closest('#video-play');
    if (play) evento('assistir_episodio', play);
  }, true);

  // ---------- Aviso de cookies ----------
  var css = '' +
    '.mdc-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:520px;margin:0 auto;' +
    'background:#0B1E3D;color:#E8EEF7;border:2px solid #24467A;border-radius:16px;padding:14px 16px;' +
    'font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.45)}' +
    '.mdc-cookies[hidden]{display:none!important}' +
    '.mdc-cookies h2{margin:0 0 4px;font:800 16px/1.3 Nunito,system-ui,sans-serif;color:#FFFFFF}' +
    '.mdc-cookies p{margin:0}' +
    '.mdc-cookies a{color:#FFC12E}' +
    '.mdc-cookies-botoes{display:flex;gap:10px;margin-top:12px}' +
    '.mdc-cookies button{flex:1;min-height:44px;border-radius:10px;border:2px solid #FFFFFF;background:transparent;' +
    'color:#FFFFFF;font:600 15px Inter,system-ui,sans-serif;cursor:pointer}' +
    '.mdc-cookies button:hover{background:#FFFFFF;color:#09274D}' +
    '.mdc-cookies button:focus-visible{outline:3px solid #FFC12E;outline-offset:2px}';

  var aviso;
  function montarAviso() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    aviso = document.createElement('div');
    aviso.className = 'mdc-cookies';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-labelledby', 'mdc-cookies-titulo');
    aviso.hidden = true;
    aviso.innerHTML =
      '<h2 id="mdc-cookies-titulo">Podemos medir as visitas?</h2>' +
      '<p>Com a sua permissão, o Google Analytics conta as visitas e de onde elas vêm. Sem anúncios e sem dados de crianças. ' +
      '<a href="' + raiz + 'privacidade/">Saiba mais</a>.</p>' +
      '<div class="mdc-cookies-botoes">' +
      '<button type="button" data-escolha="recusado">Recusar</button>' +
      '<button type="button" data-escolha="aceito">Aceitar</button>' +
      '</div>';
    aviso.addEventListener('click', function (e) {
      var b = e.target.closest('[data-escolha]');
      if (!b) return;
      var v = b.getAttribute('data-escolha');
      salvarEscolha(v);
      if (v === 'aceito') ligar(); else desligar();
      aviso.hidden = true;
    });
    document.body.appendChild(aviso);
  }

  function abrirAviso() {
    if (!aviso) montarAviso();
    aviso.hidden = false;
  }

  var escolha = lerEscolha();
  if (escolha === 'aceito') ligar();

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-cookies]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        abrirAviso();
        var b = aviso.querySelector('button');
        if (b) b.focus();
      });
    });
    if (!escolha) abrirAviso();
  });
})();
