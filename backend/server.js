// server.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

// --- Validação de Variáveis de Ambiente ---
// Garante que o servidor não inicie sem as chaves necessárias.
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.FRONTEND_URL) {
    console.error('ERRO CRÍTICO: Uma ou mais variáveis de ambiente necessárias (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL) não estão definidas no seu arquivo .env');
    process.exit(1); // Encerra o processo se chaves estiverem faltando
}

// Inicializa o Stripe com sua chave secreta
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 4242; // Porta em que o servidor vai rodar

// --- Middlewares ---
// Permite que seu frontend se comunique com este servidor
app.use(cors({
    origin: '*' // Para desenvolvimento. Em produção, restrinja para o domínio do seu frontend.
}));

// =================================================================================
// IMPORTANTE: A rota de Webhook DEVE VIR ANTES de `app.use(express.json())`.
// O Stripe requer o corpo bruto (raw body) da requisição para verificar a assinatura.
// O middleware `express.json()` alteraria o corpo, quebrando a verificação de segurança.
// =================================================================================
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`⚠️  Erro na verificação da assinatura do webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lidar com o evento de pagamento bem-sucedido
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log(`✅ Pagamento bem-sucedido para a sessão ${session.id}!`);
      // AQUI É ONDE VOCÊ ATUALIZA SEU BANCO DE DADOS
      // 1. Encontre o usuário no seu banco de dados (usando o session.customer_details.email).
      // 2. Verifique qual plano foi assinado.
      // 3. Atualize o status da assinatura do usuário para 'ativo' e conceda acesso aos recursos premium.
      console.log('E-mail do cliente para atualizar a assinatura:', session.customer_details.email);
      break;
    }
    // Adicione outros tipos de eventos que você queira monitorar (ex: 'customer.subscription.deleted')
    default:
      console.log(`Evento não tratado do tipo: ${event.type}`);
  }

  // Retorne uma resposta 200 para o Stripe saber que você recebeu o evento com sucesso.
  res.status(200).json({ received: true });
});


// Middleware para parsear JSON - para todas as outras rotas que vêm DEPOIS desta linha.
app.use(express.json());

// --- Outras Rotas ---

// Rota para criar a sessão de checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID é obrigatório.' });
    }

    const frontendUrl = process.env.FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // ou 'payment' para pagamentos únicos
      success_url: `${frontendUrl}/library?payment_success=true`,
      cancel_url: `${frontendUrl}/pricing?payment_cancelled=true`,
    });

    // Envia a URL da sessão de volta para o frontend
    res.json({ url: session.url });

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor ao criar a sessão de checkout.' });
  }
});


// Inicia o servidor
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));