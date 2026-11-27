/* Planejador do Sonho: preço em semanas de esforço, sem juros e sem ponte com investimento.
 * O nome do sonho e os valores ficam só na tela; nada é guardado ou enviado. */
(function () {
  'use strict';
  var F = window.MDC_FERRAMENTA;
  var MAX_QUADRO = 104;
  var el = function (id) { return document.getElementById(id); };
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function num(id, min) {
    var v = Number(el(id).value);
    return isFinite(v) && v >= min ? v : min;
  }
  function semanas(falta, porSemana) { return falta <= 0 ? 0 : Math.ceil(falta / porSemana); }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }

  function render() {
    var nome = el('s-nome').value.trim();
    var preco = num('s-preco', 1), ja = num('s-ja', 0), sem = num('s-semana', 1);
    var falta = Math.max(preco - ja, 0);
    var n = semanas(falta, sem);
    var alvo = nome ? nome : 'o sonho';
    var data = new Date();
    data.setDate(data.getDate() + n * 7);
    var mais = sem + 2, n2 = semanas(falta, mais);
    var pct = Math.min(ja / preco, 1);

    F.bind({
      titulo: (nome ? 'Para ter ' + nome : 'Para chegar ao sonho') + ' (' + F.reais(preco) + '), faltam:',
      semanas: n === 0 ? 'Já dá!' : plural(n, 'semana', 'semanas'),
      quando: n === 0
        ? 'O que ele guardou já paga ' + alvo + '. Hora de decidir junto: comprar agora ou guardar para um sonho maior?'
        : 'Guardando ' + F.reais(sem) + ' por semana, ele chega lá por volta de ' + MESES[data.getMonth()] + ' de ' + data.getFullYear() + '. Faltam ' + F.reais(falta) + '.',
      barraTxt: 'Já guardado: ' + F.reais(Math.min(ja, preco)) + ' de ' + F.reais(preco) + ' (' + Math.round(pct * 100) + '%).',
      alternativa: n > 1
        ? 'E se ele guardar ' + F.reais(mais) + ' por semana? Chega em ' + plural(n2, 'semana', 'semanas') + (n - n2 > 0 ? ', ' + plural(n - n2, 'semana', 'semanas') + ' antes.' : '.')
        : n === 1 ? 'Falta só uma semana. Celebrem juntos quando chegar.' : '',
      quadroTit: n === 0 ? '' : n <= MAX_QUADRO
        ? 'Quadro do Sonho: pinte um quadrinho a cada semana guardada.'
        : 'São mais de ' + MAX_QUADRO + ' semanas. Que tal dividir em sonhos menores, um de cada vez?'
    });
    el('s-barra').style.width = Math.round(pct * 100) + '%';
    el('s-barra').parentNode.setAttribute('aria-label', 'Já guardado: ' + Math.round(pct * 100) + '% do preço');

    var q = el('s-quadro');
    q.innerHTML = '';
    if (n > 0 && n <= MAX_QUADRO) {
      for (var i = 1; i <= n; i++) {
        var s = document.createElement('span');
        s.textContent = i;
        q.appendChild(s);
      }
    }
    el('s-imprimir').hidden = !(n > 0 && n <= MAX_QUADRO);
  }

  ['s-nome', 's-preco', 's-ja', 's-semana'].forEach(function (id) {
    el(id).addEventListener('input', function () { F.usou('sonho'); render(); });
  });
  el('s-imprimir').addEventListener('click', function () { window.print(); });
  render();
  F.checkout('sonho');
})();
