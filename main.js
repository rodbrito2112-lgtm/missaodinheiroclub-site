/* Página do jogo: link do jogo e teste para os pais. Nada é enviado nem guardado. */
(function () {
  'use strict';

  // Endereço do jogo. Se o jogo mudar de endereço, trocar só aqui.
  var JOGO_URL = 'https://rodbrito2112-lgtm.github.io/trilha-missao-dinheiro/';
  document.querySelectorAll('[data-jogo]').forEach(function (a) {
    a.href = JOGO_URL;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Episódio 1: o player do YouTube só entra depois do clique ---------- */
  var play = document.getElementById('video-play');
  if (play) {
    play.addEventListener('click', function () {
      var box = document.getElementById('video');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = 'O Mistério das 12 Moedas';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(f);
      f.focus();
    });
  }

  /* ---------- Experimente: pergunta real do jogo (conteúdo da trilha) ---------- */
  var demo = document.getElementById('demo-opcoes');
  if (demo) {
    var retorno = document.getElementById('demo-retorno');
    var veredito = document.getElementById('demo-veredito');
    var barra = document.querySelector('.demo-prog i');
    demo.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var acertou = b.getAttribute('data-v') === 'certa';
        demo.querySelectorAll('button').forEach(function (x) {
          x.disabled = true;
          if (x.getAttribute('data-v') === 'certa') x.classList.add('certa');
        });
        if (!acertou) b.classList.add('errada');
        veredito.textContent = acertou ? 'Isso! Mandou bem.' : 'Quase! Veja o porquê:';
        retorno.classList.toggle('erro', !acertou);
        retorno.hidden = false;
        if (barra) barra.style.width = '55%';
      });
    });
  }

  /* ---------- Teste para os pais ---------- */
  var PERGUNTAS = [
    { q: 'Quando vê algo que quer no mercado ou na loja, a criança consegue esperar ou desistir?',
      o: ['Ainda não, quer na hora', 'Às vezes consegue', 'Consegue esperar ou desistir sozinha'] },
    { q: 'Ela sabe que o dinheiro do cartão ou do Pix sai de algum lugar e acaba?',
      o: ['Acha que nunca acaba', 'Está começando a entender', 'Sabe que sai de uma conta e acaba'] },
    { q: 'Quando quer comprar algo dentro de um jogo ou aplicativo, o que costuma acontecer?',
      o: ['Insiste ou compra sem pensar', 'Pede e aceita conversar', 'Pensa antes ou junta o próprio dinheiro'] },
    { q: 'Ela percebe quando um vídeo ou influenciador está fazendo propaganda?',
      o: ['Ainda não percebe', 'Percebe às vezes', 'Percebe e comenta'] },
    { q: 'Ela já juntou dinheiro para comprar algo que queria?',
      o: ['Ainda não', 'Já tentou', 'Já juntou e comprou'] },
    { q: 'Em casa, vocês conversam sobre preços e escolhas na frente dela?',
      o: ['Quase nunca', 'De vez em quando', 'Com frequência'] },
    { q: 'Ela sabe que apostas e "jogos de ganhar dinheiro" não são um jeito de ganhar dinheiro?',
      o: ['Ainda não falamos disso', 'Já ouviu falar', 'Sabe e explica o porquê'] }
  ];

  var PERFIS = [
    { ate: 4, nome: 'Coração de vitrine',
      texto: 'Quer tudo na hora, e é normal. É o melhor momento para começar.',
      dica: 'Na próxima compra, combine "hoje escolhemos uma coisa só".' },
    { ate: 8, nome: 'Aprendiz de escolhas',
      texto: 'Já entende que o dinheiro acaba. Agora é treinar as escolhas.',
      dica: 'Dê um valor fixo para um passeio e deixe que ela decida como usar.' },
    { ate: 11, nome: 'Guardião do pote',
      texto: 'Sabe esperar e juntar. Dá para mirar objetivos maiores.',
      dica: 'Monte um objetivo com prazo, como um brinquedo daqui a 2 meses.' },
    { ate: 14, nome: 'Pronto para o próximo nível',
      texto: 'Já lida bem com o dia a dia. Hora de falar do mundo lá fora.',
      dica: 'Converse sobre propaganda, golpes e Pix.' }
  ];

  var form = document.getElementById('teste-form');
  if (!form) return;
  var elN = document.getElementById('teste-n');
  var elQ = document.getElementById('teste-q');
  var elOp = document.getElementById('teste-opcoes');
  var elBarra = document.getElementById('teste-progresso');
  var btnVoltar = document.getElementById('teste-voltar');
  var elRes = document.getElementById('teste-resultado');
  var respostas = [];
  var atual = 0;

  function mostrar(i) {
    atual = i;
    var p = PERGUNTAS[i];
    elN.textContent = 'Pergunta ' + (i + 1) + ' de ' + PERGUNTAS.length;
    elQ.textContent = p.q;
    elOp.innerHTML = '';
    p.o.forEach(function (texto, v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.setAttribute('aria-pressed', respostas[i] === v ? 'true' : 'false');
      b.addEventListener('click', function () { responder(v); });
      elOp.appendChild(b);
    });
    elBarra.style.width = (i / PERGUNTAS.length * 100) + '%';
    btnVoltar.hidden = i === 0;
  }

  function responder(v) {
    respostas[atual] = v;
    if (atual < PERGUNTAS.length - 1) {
      mostrar(atual + 1);
      var primeiro = elOp.querySelector('button');
      if (primeiro) primeiro.focus();
    } else {
      resultado();
    }
  }

  function resultado() {
    var total = respostas.reduce(function (s, v) { return s + v; }, 0);
    var perfil = PERFIS.filter(function (p) { return total <= p.ate; })[0];
    document.getElementById('res-nome').textContent = perfil.nome;
    document.getElementById('res-texto').textContent = perfil.texto;
    document.getElementById('res-dica').textContent = perfil.dica;
    elBarra.style.width = '100%';
    form.hidden = true;
    elRes.hidden = false;
    elRes.focus();
  }

  btnVoltar.addEventListener('click', function () { if (atual > 0) mostrar(atual - 1); });
  document.getElementById('teste-refazer').addEventListener('click', function () {
    respostas = [];
    elRes.hidden = true;
    form.hidden = false;
    mostrar(0);
    var primeiro = elOp.querySelector('button');
    if (primeiro) primeiro.focus();
  });

  mostrar(0);
})();
