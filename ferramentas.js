/* Funções comuns das ferramentas grátis para pais (/mesada/ e /sonho/).
 * Tudo roda no navegador: nenhum número ou texto digitado é guardado ou enviado. */
window.MDC_FERRAMENTA = (function () {
  'use strict';
  function reais(v) {
    var c = Math.round(v * 100) / 100;
    return 'R$ ' + c.toLocaleString('pt-BR', { minimumFractionDigits: c % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  function bind(vals) {
    Object.keys(vals).forEach(function (k) {
      document.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.textContent = vals[k]; });
    });
  }
  // Mede só que a ferramenta foi usada (se a pessoa aceitou os cookies). Nenhum valor digitado vai junto.
  var usada = false;
  function usou(nome) {
    if (usada) return;
    usada = true;
    if (window.gtag) window.gtag('event', nome + '_uso');
  }
  // Botão de compra: checkout da Hotmart com a origem no sck (ig-dm-<palavra> quando vem do direct do Instagram).
  function checkout(padrao) {
    var cfg = window.MDC_CONFIG || {};
    if (!cfg.checkoutUrl) return;
    var origem = padrao;
    try { origem = sessionStorage.getItem('mdc_origem') || padrao; } catch (e) {}
    var link = cfg.checkoutUrl;
    try { var u = new URL(cfg.checkoutUrl); u.searchParams.set('sck', origem); link = u.toString(); } catch (e) {}
    document.querySelectorAll('[data-checkout]').forEach(function (a) {
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', function () { if (window.gtag) window.gtag('event', 'begin_checkout', { origem: origem }); });
    });
  }
  return { reais: reais, bind: bind, usou: usou, checkout: checkout };
})();
