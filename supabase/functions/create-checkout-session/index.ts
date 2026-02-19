import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, nome, origin: bodyOrigin } = await req.json();

    if (!email || !nome) {
      return new Response(
        JSON.stringify({ error: 'email e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });

    // URL de retorno após pagamento (usa o origin vindo do body ou header)
    const origin = bodyOrigin || req.headers.get('origin') || 'http://localhost:8080';
    const successUrl = `${origin}/payment-success?email=${encodeURIComponent(email)}&nome=${encodeURIComponent(nome)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?cancelled=true`;

    // Cria a Checkout Session no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // pagamento único
      customer_email: email,
      metadata: {
        nome,
        email,
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Easy Eat — Acesso Vitalício',
              description: 'Acesso completo e permanente à plataforma Easy Eat de nutrição personalizada.',
              images: [],
            },
            unit_amount: 4990, // R$ 49,90 — ajuste conforme necessário
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'pt-BR',
    });

    // Salva a sessão pendente no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('stripe_subscriptions').insert({
      email: email.toLowerCase().trim(),
      nome,
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      subscription_status: 'pending',
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
