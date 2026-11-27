/* Página da isca NATAL: download direto e sem condição; e-mail opcional, com consentimento (texto aprovado pela Copy, 27/11). */
(function () {
  'use strict';
  var F = window.MDC_FERRAMENTA;
  var cfg = window.MDC_CONFIG || {};
  var el = function (id) { return document.getElementById(id); };

  // Origem: sck (ig-dm-natal quando vem do direct) e, no MailerLite, instagram-natal.
  var origem = 'natal';
  try { origem = sessionStorage.getItem('mdc_origem') || 'natal'; } catch (e) {}
  var origemLead = origem.indexOf('ig-dm-') === 0 ? 'instagram-' + origem.slice(6) : origem;

  el('baixar').addEventListener('click', function () { if (window.gtag) window.gtag('event', 'isca_download', { isca: 'natal' }); });

  function erro(msg) { var p = el('n-erro'); p.textContent = msg; p.hidden = !msg; }

  el('n-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = el('n-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { erro('Confira o e-mail: falta alguma parte.'); el('n-email').focus(); return; }
    if (!el('n-ok').checked) { erro('Para receber os e-mails, marque a caixa "Quero, tenho 18 anos ou mais".'); return; }
    erro('');
    if (!cfg.leadEndpoint) return;
    var btn = el('n-btn');
    btn.disabled = true;
    var dados = new FormData();
    dados.append('fields[email]', email);
    dados.append('fields[origem]', origemLead);
    dados.append('ml-submit', '1');
    dados.append('anticsrf', 'true');
    fetch(cfg.leadEndpoint, { method: 'POST', body: dados }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      if (j && j.success === false) throw new Error('recusado');
      if (window.gtag) window.gtag('event', 'generate_lead', { local: 'isca_natal' });
      el('n-form').hidden = true;
      el('n-ok-msg').hidden = false;
    }).catch(function () {
      btn.disabled = false;
      erro('Não conseguimos enviar agora. Tente de novo em instantes. O checklist continua disponível no botão acima.');
    });
  });

  F.checkout(origem);
})();
