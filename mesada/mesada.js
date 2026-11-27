/* Calculadora de mesada com os 4 potes (Padrão dos potes, 16/11: Agora, Reserva, Sonho e Compartilhar,
 * nesta ordem e sem porcentagem oficial). A divisão inicial é só um exemplo e aparece como tal. */
(function () {
  'use strict';
  var F = window.MDC_FERRAMENTA;
  var POTES = [
    { id: 'agora', nome: 'Agora', frase: 'Para gastar no dia a dia, com as pequenas vontades e as necessidades da semana', ic: '🛍️', cor: '#FFC12E' },
    { id: 'reserva', nome: 'Reserva', frase: 'Para imprevistos: só sai quando acontece algo que ninguém planejou', ic: '🛟', cor: '#0B7A7D' },
    { id: 'sonho', nome: 'Sonho', frase: 'Para um objetivo escolhido, com meta e prazo', ic: '🌳', cor: '#2E8B57' },
    { id: 'compartilhar', nome: 'Compartilhar', frase: 'Para doar ou dividir com alguém ou com uma causa. É uma escolha, nunca uma obrigação', ic: '🤝', cor: '#5B45B8' }
  ];
  var EXEMPLO = [4, 2, 3, 1]; // "por exemplo", R$ 4 / 2 / 3 / 1 em cada R$ 10
  var FREQ = [
    { id: 'semana', rotulo: 'semana', porAno: 52 },
    { id: 'quinzena', rotulo: 'quinzena', porAno: 26 },
    { id: 'mes', rotulo: 'mês', porAno: 12 }
  ];
  var state = { valor: 20, freq: 'semana', idade: 8, partes: [], exemplo: true };

  function dividirExemplo() {
    var total = state.valor;
    var p = EXEMPLO.map(function (x) { return Math.floor(total * x / 10); });
    p[0] += total - p.reduce(function (a, b) { return a + b; }, 0);
    state.partes = p;
    state.exemplo = true;
  }

  var el = function (id) { return document.getElementById(id); };

  function renderFreq() {
    var box = el('m-freq');
    box.innerHTML = '';
    FREQ.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = f.rotulo;
      b.setAttribute('aria-pressed', f.id === state.freq ? 'true' : 'false');
      b.addEventListener('click', function () { state.freq = f.id; F.usou('mesada'); render(); });
      box.appendChild(b);
    });
  }

  function renderPotes() {
    var box = el('m-potes');
    if (!box.children.length) {
      POTES.forEach(function (p, k) {
        var d = document.createElement('div');
        d.className = 'pote';
        d.style.setProperty('--cor', p.cor);
        d.innerHTML = '<span class="ic" aria-hidden="true">' + p.ic + '</span>' +
          '<span class="nome"><strong>' + p.nome + '</strong><span>' + p.frase + '</span></span>' +
          '<span class="valor"><button type="button" aria-label="Tirar R$ 1 do pote ' + p.nome + '">−</button>' +
          '<output aria-live="polite"></output>' +
          '<button type="button" aria-label="Pôr R$ 1 no pote ' + p.nome + '">+</button></span>';
        var bt = d.querySelectorAll('button');
        bt[0].addEventListener('click', function () { mudar(k, -1); });
        bt[1].addEventListener('click', function () { mudar(k, 1); });
        box.appendChild(d);
      });
    }
    Array.prototype.forEach.call(box.querySelectorAll('output'), function (o, k) { o.textContent = F.reais(state.partes[k]); });
  }

  function mudar(k, d) {
    state.partes[k] = Math.max(0, state.partes[k] + d);
    state.exemplo = false;
    F.usou('mesada');
    render();
  }

  function dica(idade) {
    if (idade <= 7) return 'De 5 a 7 anos: a mesada por semana e potes transparentes, onde ele vê o dinheiro, costumam funcionar melhor.';
    if (idade <= 12) return 'De 8 a 12 anos: dá para passar para a quinzena ou o mês e anotar o que entra e o que sai.';
    return 'De 13 a 17 anos: a mesada por mês ajuda a planejar o mês inteiro, como vai ser com o primeiro salário.';
  }

  function render() {
    renderFreq();
    renderPotes();
    var f = FREQ.filter(function (x) { return x.id === state.freq; })[0];
    var soma = state.partes.reduce(function (a, b) { return a + b; }, 0);
    var dif = state.valor - soma;
    var somaEl = document.querySelector('[data-bind="soma"]');
    somaEl.className = 'soma' + (dif ? ' erro' : '');
    F.bind({
      idadeLabel: state.idade + ' anos',
      dicaIdade: dica(state.idade),
      avisoDivisao: state.exemplo
        ? 'Por exemplo: R$ 4, R$ 2, R$ 3 e R$ 1 em cada R$ 10. Use o − e o + para combinar a divisão de vocês.'
        : 'Esta é a divisão de vocês. Ela pode mudar sempre que fizer sentido.',
      soma: dif === 0
        ? 'Os ' + F.reais(state.valor) + ' por ' + f.rotulo + ' estão divididos.'
        : dif > 0 ? 'Faltam ' + F.reais(dif) + ' para dividir.' : 'Passou ' + F.reais(-dif) + ' do valor da mesada.',
      anoTitulo: 'Em um ano (' + f.porAno + ' mesadas), cada pote recebe:'
    });
    var lista = el('m-ano');
    lista.innerHTML = '';
    POTES.forEach(function (p, k) {
      var li = document.createElement('li');
      li.innerHTML = '<b>' + F.reais(state.partes[k] * f.porAno) + '</b>' + p.nome;
      lista.appendChild(li);
    });
    el('m-idade').setAttribute('aria-valuetext', state.idade + ' anos');
  }

  el('m-valor').addEventListener('input', function (e) {
    var v = Math.round(Number(e.target.value));
    if (!(v >= 1)) return;
    state.valor = Math.min(v, 2000);
    if (state.exemplo) dividirExemplo();
    F.usou('mesada');
    render();
  });
  el('m-idade').addEventListener('input', function (e) { state.idade = Number(e.target.value); F.usou('mesada'); render(); });
  el('m-exemplo').addEventListener('click', function () { dividirExemplo(); render(); });
  el('m-imprimir').addEventListener('click', function () { window.print(); });

  dividirExemplo();
  render();
  F.checkout('mesada');
})();
