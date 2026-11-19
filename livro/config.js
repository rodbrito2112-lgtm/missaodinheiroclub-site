/*
 * Configuração do site Missão Dinheiro Club.
 * Preencha os campos abaixo quando tiver cada informação. Nada mais precisa mudar no código.
 */
window.MDC_CONFIG = {
  // Link do checkout da Hotmart (R$ 27,97 com os 4 bônus).
  // Enquanto estiver vazio, o botão da oferta só rola até a própria oferta.
  checkoutUrl: 'https://pay.hotmart.com/F108547611O',

  // Para onde vão os cadastros do guia grátis.
  // Endereço do formulário do MailerLite (termina em /subscribe). Não é segredo: nenhuma chave fica no site.
  // O site envia fields[email] e fields[name]; a pessoa entra no grupo "Guia grátis" e a automação manda o e-mail 1 com o guia.
  // Enquanto estiver vazio, o cadastro só libera o download do PDF (nada é salvo).
  leadEndpoint: 'https://assets.mailerlite.com/jsonp/2805335/forms/204441931417126597/subscribe',

  // Link do PDF do guia grátis. Por padrão, o arquivo que já está na pasta assets.
  guiaPdfUrl: 'assets/guia-gratuito-3-descobertas.pdf'
};
