import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// Configuração
const PORT = 3001;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''; // Não coloque sua chave real aqui! Ela deve estar no .env 
const FRONTEND_URL = 'http://localhost:3001'; // Ajuste se necessário

const app = express();
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { email, nome } = req.body;

        if (!email || !nome) {
            return res.status(400).json({ error: 'Email e nome são obrigatórios' });
        }

        console.log(`Criando sessão para: ${email} (${nome})`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            metadata: { nome, email },
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Easy Eat — Acesso Vitalício',
                            description: 'Acesso completo e permanente à plataforma.',
                        },
                        unit_amount: 4990, // R$ 49,90
                    },
                    quantity: 1,
                },
            ],
            success_url: `${FRONTEND_URL}/payment-success?email=${encodeURIComponent(email)}&nome=${encodeURIComponent(nome)}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/?cancelled=true`,
            locale: 'pt-BR',
        });

        console.log('Sessão criada:', session.id);
        res.json({ url: session.url, session_id: session.id });
    } catch (error) {
        console.error('Erro Stripe:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de pagamento rodando em http://localhost:${PORT}`);
});
