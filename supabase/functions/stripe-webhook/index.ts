import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Received Stripe event:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const email = (session.customer_email || session.metadata?.email || '').toLowerCase().trim();
        const nome = session.metadata?.nome || '';
        const customerId = typeof session.customer === 'string' ? session.customer : null;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
        const amountTotal = session.amount_total;

        if (!email) {
            console.error('No email found in session:', session.id);
            return new Response('No email in session', { status: 400 });
        }

        // Atualiza o registro existente (criado no create-checkout-session)
        const { error: updateError } = await supabase
            .from('stripe_subscriptions')
            .update({
                subscription_status: 'active',
                stripe_customer_id: customerId,
                stripe_payment_intent_id: paymentIntentId,
                amount_paid: amountTotal,
                nome: nome || undefined,
            })
            .eq('stripe_session_id', session.id);

        if (updateError) {
            console.error('Error updating subscription:', updateError);
            // Tenta inserir caso não exista
            const { error: insertError } = await supabase
                .from('stripe_subscriptions')
                .insert({
                    email,
                    nome,
                    stripe_session_id: session.id,
                    stripe_customer_id: customerId,
                    stripe_payment_intent_id: paymentIntentId,
                    subscription_status: 'active',
                    amount_paid: amountTotal,
                });

            if (insertError) {
                console.error('Error inserting subscription:', insertError);
                return new Response('Database error', { status: 500 });
            }
        }

        console.log(`Payment confirmed for ${email}, session: ${session.id}`);
    }

    if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
            .from('stripe_subscriptions')
            .update({ subscription_status: 'expired' })
            .eq('stripe_session_id', session.id);
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
});
