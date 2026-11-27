/* Simulador "Quanto vale começar cedo?" (página própria, isca TEMPO).
 * Tudo é calculado no navegador. Nenhum número digitado é guardado ou enviado. */
(function () {
  'use strict';
  var cfg = window.MDC_CONFIG || {};
  var RATES = [6, 8, 10, 12];
  var state = { monthly: 330, start: 20, years: 30, rate: 12, infOn: false, inf: 4 };

  function money(v) {
    if (v >= 1000000) return 'R$ ' + (v / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mi';
    if (v >= 10000) return 'R$ ' + Math.round(v / 1000).toLocaleString('pt-BR') + ' mil';
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }
  function pct(v) { return v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; }

  // Taxa anual usada na conta. Com inflação: taxa real, e o valor por mês sobe com a inflação (tudo em reais de hoje).
  function annualRate() {
    return state.infOn ? (1 + state.rate / 100) / (1 + state.inf / 100) - 1 : state.rate / 100;
  }

  // Aportes ao fim de cada mês; taxa anual efetiva convertida na mensal equivalente.
  function series(start, end) {
    var i = Math.pow(1 + annualRate(), 1 / 12) - 1;
    var pts = [];
    for (var age = start; age <= end; age++) {
      var n = (age - start) * 12;
      var bal = n === 0 ? 0 : (i === 0 ? state.monthly * n : state.monthly * (Math.pow(1 + i, n) - 1) / i);
      pts.push({ age: age, bal: bal, dep: state.monthly * n });
    }
    return pts;
  }

  function compute() {
    var start = state.start, end = start + state.years;
    var wait = state.years > 15 ? 15 : Math.max(1, Math.floor(state.years / 2));
    var pts = series(start, end), late = series(start + wait, end);
    var last = pts[pts.length - 1], lateLast = late[late.length - 1];
    var maxV = Math.max(last.bal, 1) * 1.05;
    var X0 = 70, X1 = 630, Y0 = 300, Y1 = 20;
    function sx(age) { return X0 + (age - start) / Math.max(end - start, 1) * (X1 - X0); }
    function sy(v) { return Y0 - v / maxV * (Y0 - Y1); }
    function line(arr, key) {
      return arr.map(function (p, k) { return (k ? 'L' : 'M') + sx(p.age).toFixed(1) + ' ' + sy(p[key]).toFixed(1); }).join(' ');
    }
    var balPath = line(pts, 'bal');
    var ratio = lateLast.bal > 0 ? last.bal / lateLast.bal : 0;
    var hoje = state.infOn ? ' (em reais de hoje)' : '';
    var base = 'Simulação, não promessa: ' + money(state.monthly) + ' por mês, dos ' + start + ' aos ' + end + ' anos, ' + pct(state.rate) + ' ao ano, aportes no fim de cada mês, sem impostos ou taxas. ';
    var inflacao = state.infOn
      ? 'Valores em reais de hoje, com inflação de ' + pct(state.inf) + ' ao ano e o valor por mês corrigido pela inflação. '
      : 'Valores nominais: em ' + state.years + ' anos, a inflação reduz muito esse valor. ';
    return {
      monthlyFmt: money(state.monthly),
      startLabel: start + ' anos',
      yearsLabel: state.years + ' anos',
      infLabel: pct(state.inf),
      finalTitle: 'Saldo aos ' + end + ' anos' + hoje,
      finalFmt: money(last.bal),
      depositFmt: money(last.dep),
      gainFmt: money(Math.max(last.bal - last.dep, 0)),
      waitTitle: 'Quanto custa esperar ' + wait + (wait === 1 ? ' ano' : ' anos') + ' para começar',
      waitCostFmt: money(Math.max(last.bal - lateLast.bal, 0)),
      ressalva: base + inflacao + 'Rentabilidade não garantida. Não é recomendação de investimento.',
      yTop: money(maxV),
      yMid: money(maxV / 2),
      xStart: start + ' anos',
      xMid: Math.round((start + end) / 2) + ' anos',
      xEnd: end + ' anos',
      balPath: balPath,
      areaPath: balPath + ' L' + X1 + ' ' + Y0 + ' L' + X0 + ' ' + Y0 + ' Z',
      depPath: line(pts, 'dep'),
      latePath: line(late, 'bal'),
      lateLegend: 'Começando ' + wait + (wait === 1 ? ' ano' : ' anos') + ' depois, aos ' + (start + wait),
      chartLabel: 'Gráfico do saldo acumulado de ' + money(state.monthly) + ' por mês, dos ' + start + ' aos ' + end + ' anos, chegando a ' + money(last.bal) + '.',
      insight: ratio > 1
        ? 'Na simulação, com o mesmo valor por mês, quem começa aos ' + start + ' terminaria com ' + money(last.bal) + hoje + '. Quem deixa para os ' + (start + wait) + ' chegaria a ' + money(lateLast.bal) + hoje + ', cerca de ' + ratio.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' vezes menos. A diferença não é o valor. É o tempo.'
        : 'Com o mesmo valor por mês, começar antes sempre rende mais tempo para o dinheiro crescer.'
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
    box.innerHTML = '';
    RATES.forEach(function (r) {
      var on = r === state.rate;
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = r + '%';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.cssText = 'font: inherit; font-weight: 600; font-size: 15px; min-width: 64px; min-height: 44px; padding: 10px 14px; border-radius: 999px; border: 1.5px solid #09274D; cursor: pointer; background: ' + (on ? '#09274D' : '#FFFFFF') + '; color: ' + (on ? '#FFFFFF' : '#09274D');
      b.addEventListener('click', function () { state.rate = r; usou(); render(); });
      box.appendChild(b);
    });
  }

  var el = function (id) { return document.getElementById(id); };
  function render() {
    renderRates();
    bind(compute());
    el('sim-monthly').setAttribute('aria-valuetext', money(state.monthly) + ' por mês');
    el('sim-start').setAttribute('aria-valuetext', state.start + ' anos');
    el('sim-years').setAttribute('aria-valuetext', state.years + ' anos');
    el('sim-inf').setAttribute('aria-valuetext', pct(state.inf) + ' ao ano');
    el('sim-inf-box').hidden = !state.infOn;
  }

  // Medição de uso (só se a pessoa aceitou os cookies; nenhum número digitado vai junto).
  var jaUsou = false;
  function usou() {
    if (jaUsou) return;
    jaUsou = true;
    if (window.gtag) window.gtag('event', 'simulador_uso');
  }

  [['sim-monthly', 'monthly'], ['sim-start', 'start'], ['sim-years', 'years'], ['sim-inf', 'inf']].forEach(function (p) {
    el(p[0]).addEventListener('input', function (e) { state[p[1]] = Number(e.target.value); usou(); render(); });
  });
  el('sim-inf-on').addEventListener('change', function (e) { state.infOn = e.target.checked; usou(); render(); });
  render();

  /* Botão de compra: checkout da Hotmart com a origem no sck (ig-dm-tempo quando vem do direct do Instagram). */
  if (cfg.checkoutUrl) {
    var origem = 'simulador';
    try { origem = sessionStorage.getItem('mdc_origem') || 'simulador'; } catch (e) {}
    var link = cfg.checkoutUrl;
    try { var u = new URL(cfg.checkoutUrl); u.searchParams.set('sck', origem); link = u.toString(); } catch (e) {}
    document.querySelectorAll('[data-checkout]').forEach(function (a) {
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', function () { if (window.gtag) window.gtag('event', 'begin_checkout', { origem: origem }); });
    });
  }
})();
