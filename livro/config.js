/*
 * Configuração do site Missão Dinheiro Club.
 * Preencha os campos abaixo quando tiver cada informação. Nada mais precisa mudar no código.
 */
window.MDC_CONFIG = {
  // Link do checkout da Hotmart (R$ 27,97 com os 4 bônus).
  // Enquanto estiver vazio, o botão da oferta só rola até a própria oferta.
  checkoutUrl: 'https://pay.hotmart.com/T108540780S',

  // Para onde vão os cadastros do guia grátis.
  // Pode ser o endpoint de formulário da ferramenta de e-mail (MailerLite, Brevo, RD Station...)
  // ou uma função própria. O site envia um POST em JSON: { nome, email, consentimento, origem, data }.
  // Enquanto estiver vazio, o cadastro só libera o download do PDF (nada é salvo).
  leadEndpoint: '',

  // Link do PDF do guia grátis. Por padrão, o arquivo que já está na pasta assets.
  guiaPdfUrl: 'assets/guia-gratuito-3-descobertas.pdf'
};
