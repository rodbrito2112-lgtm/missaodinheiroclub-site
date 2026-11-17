/* Comportamento do site: simulador de juros compostos, formulário do guia e links de compra. */
(function () {
  'use strict';
  var cfg = window.MDC_CONFIG || {};

  /* ---------- Simulador ---------- */
  var state = { monthly: 200, start: 20, rate: 12 };
  var RATES = [6, 8, 10, 12];

  function money(v) {
    if (v >= 1000000) return 'R$ ' + (v / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mi';
    if (v >= 10000) return 'R$ ' + Math.round(v / 1000).toLocaleString('pt-BR') + ' mil';
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  // Aportes ao fim de cada mês; taxa anual efetiva convertida na mensal equivalente.
  function series(monthly, start, rate) {
    var i = Math.pow(1 + rate / 100, 1 / 12) - 1;
    var pts = [];
    for (var age = start; age <= 60; age++) {
      var n = (age - start) * 12;
      var bal = n === 0 ? 0 : monthly * (Math.pow(1 + i, n) - 1) / i;
      pts.push({ age: age, bal: bal, dep: monthly * n });
    }
    return pts;
  }

  function computeSim() {
    var monthly = state.monthly, start = state.start, rate = state.rate;
    var pts = series(monthly, start, rate);
    var lateStart = Math.min(start + 10, 59);
    var late = series(monthly, lateStart, rate);
    var last = pts[pts.length - 1];
    var lateLast = late[late.length - 1];
    var maxV = Math.max(last.bal, 1) * 1.05;
    var X0 = 70, X1 = 630, Y0 = 300, Y1 = 20;
    function sx(age) { return X0 + (age - start) / Math.max(60 - start, 1) * (X1 - X0); }
    function sy(v) { return Y0 - v / maxV * (Y0 - Y1); }
    function line(arr, key) {
      return arr.map(function (p, k) { return (k ? 'L' : 'M') + sx(p.age).toFixed(1) + ' ' + sy(p[key]).toFixed(1); }).join(' ');
    }
    var balPath = line(pts, 'bal');
    var ratio = lateLast.bal > 0 ? last.bal / lateLast.bal : 0;
    return {
      monthlyFmt: 'R$ ' + monthly.toLocaleString('pt-BR'),
      startLabel: start + ' anos',
      finalFmt: money(last.bal),
      depositFmt: money(last.dep),
      gainFmt: money(last.bal - last.dep),
      yTop: money(maxV),
      yMid: money(maxV / 2),
      xStart: start + ' anos',
      xMid: Math.round((start + 60) / 2) + ' anos',
      balPath: balPath,
      areaPath: balPath + ' L' + X1 + ' ' + Y0 + ' L' + X0 + ' ' + Y0 + ' Z',
      depPath: line(pts, 'dep'),
      latePath: line(late, 'bal'),
      lateLegend: 'Começando 10 anos depois, aos ' + lateStart,
      chartLabel: 'Gráfico do saldo acumulado de ' + money(monthly) + ' por mês, dos ' + start + ' aos 60 anos, chegando a ' + money(last.bal) + '.',
      insight: ratio > 1
        ? 'Com o mesmo valor por mês, quem começa aos ' + start + ' termina com ' + money(last.bal) + '. Quem deixa para os ' + lateStart + ' chega a ' + money(lateLast.bal) + ', cerca de ' + ratio.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' vezes menos. Não é falta de dinheiro. É falta de tempo. E tempo é a única coisa que você ainda pode dar ao seu filho.'
        : 'Ajuste a idade para comparar.',
      waitCostFmt: money(Math.max(last.bal - lateLast.bal, 0))
    };
  }

  function bind(vals) {
    Object.keys(vals).forEach(function (k) {
      document.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.textContent = vals[k]; });
      document.querySelectorAll('[data-bind-d="' + k + '"]').forEach(function (el) { el.setAttribute('d', vals[k]); });
      document.querySelectorAll('[data-bind-aria-label="' + k + '"]').forEach(function (el) { el.setAttribute('aria-label', vals[k]); });
    });
  }

  function renderRates() {
    var box = document.getElementById('sim-rates');
    if (!box) return;
    box.innerHTML = '';
    RATES.forEach(function (r) {
      var on = r === state.rate;
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = r + '%';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.cssText = 'font: inherit; font-weight: 600; font-size: 15px; min-width: 64px; min-height: 44px; padding: 10px 14px; border-radius: 999px; border: 1.5px solid #09274D; cursor: pointer; background: ' + (on ? '#09274D' : '#FFFFFF') + '; color: ' + (on ? '#FFFFFF' : '#09274D');
      b.addEventListener('click', function () { state.rate = r; renderSim(); });
      box.appendChild(b);
    });
  }

  var inMonthly = document.getElementById('sim-monthly');
  var inStart = document.getElementById('sim-start');

  function renderSim() {
    renderRates();
    bind(computeSim());
    // Leitores de tela ouvem "R$ 200 por mês" e "20 anos", não só o número
    if (inMonthly) inMonthly.setAttribute('aria-valuetext', 'R$ ' + state.monthly.toLocaleString('pt-BR') + ' por mês');
    if (inStart) inStart.setAttribute('aria-valuetext', state.start + ' anos');
  }

  if (inMonthly) inMonthly.addEventListener('input', function (e) { state.monthly = Number(e.target.value); renderSim(); });
  if (inStart) inStart.addEventListener('input', function (e) { state.start = Number(e.target.value); renderSim(); });
  renderSim();

  /* ---------- Links de compra ---------- */
  if (cfg.checkoutUrl) {
    document.querySelectorAll('[data-checkout]').forEach(function (a) {
      a.href = cfg.checkoutUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  if (cfg.guiaPdfUrl) {
    document.querySelectorAll('[data-guia]').forEach(function (a) { a.href = cfg.guiaPdfUrl; });
  }

  /* ---------- Formulário do guia grátis ---------- */
  var form = document.getElementById('lead-form');
  // Sem ferramenta de e-mail (leadEndpoint vazio), não pedimos nome nem e-mail: o guia é baixado direto.
  if (form && !cfg.leadEndpoint) {
    var fw = document.getElementById('lead-form-wrap');
    var sw = document.getElementById('lead-sent');
    if (fw && sw) {
      fw.hidden = true;
      var titulo = sw.querySelector('p');
      if (titulo) titulo.textContent = 'O guia é grátis e não pede cadastro.';
      var copia = document.getElementById('lead-sent-copy');
      if (copia) copia.hidden = true;
      sw.hidden = false;
    }
    form = null;
  }
  if (form) {
    var errWrap = document.getElementById('lead-error-wrap');
    var formWrap = document.getElementById('lead-form-wrap');
    var sentWrap = document.getElementById('lead-sent');
    var showError = function (msg, campo) {
      bind({ leadError: msg });
      errWrap.hidden = !msg;
      ['email', 'consentimento'].forEach(function (n) {
        var el = form.elements[n];
        if (el) el.setAttribute('aria-invalid', n === campo ? 'true' : 'false');
      });
      if (campo && form.elements[campo]) form.elements[campo].focus();
    };
    form.addEventListener('input', function () { showError(''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (form.elements.nome.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var consent = form.elements.consentimento.checked;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Digite um e-mail válido, como nome@exemplo.com.', 'email'); return; }
      if (!consent) { showError('Marque a caixa de consentimento para receber o guia.', 'consentimento'); return; }
      var btn = form.querySelector('button[type="submit"], button:not([type])');
      if (btn) btn.disabled = true;
      var done = function () {
        bind({ firstName: nome.split(' ')[0] || 'tudo certo', leadEmail: email });
        formWrap.hidden = true;
        var copy = document.getElementById('lead-sent-copy');
        if (copy && !cfg.leadEndpoint) copy.hidden = true; // sem ferramenta de e-mail, não prometer envio
        sentWrap.hidden = false;
      };
      if (!cfg.leadEndpoint) { done(); return; }
      fetch(cfg.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome, email: email, consentimento: true, origem: 'site-guia-gratis', data: new Date().toISOString() })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        done();
      }).catch(function () {
        if (btn) btn.disabled = false;
        showError('Não conseguimos enviar agora. Tente de novo em instantes.');
      });
    });
  }
})();
