import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, User, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LegalDocsDialog, type LegalDocTab } from '@/components/legal/LegalDocsDialog';
import { loadStripe } from '@stripe/stripe-js';

// Inicializa o Stripe fora do componente para evitar recriação
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_eVq4gz8qg16B3BM6Tc8og00";

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsTab, setDocsTab] = useState<LegalDocTab>('terms');

  const openDocs = (tab: LegalDocTab) => {
    setDocsTab(tab);
    setDocsOpen(true);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (!validateName(nome)) {
      newErrors.nome = 'Nome inválido (apenas letras)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Você deve aceitar os termos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Verifica se o email já tem uma conta ativa
      const { data: existingSub } = await supabase
        .from('stripe_subscriptions')
        .select('subscription_status')
        .eq('email', email.toLowerCase().trim())
        .eq('subscription_status', 'active')
        .maybeSingle();

      if (existingSub) {
        toast.error('Este email já possui uma conta ativa. Faça login.');
        setIsLoading(false);
        return;
      }

      console.log('Iniciando processo de checkout...');

      // 2. Tenta usar a Edge Function (método preferido)
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          email: email.toLowerCase().trim(),
          nome: nome.trim(),
          origin: window.location.origin // Passa a origem dinâmica para a Edge Function
        },
      });

      if (!error && data?.url) {
        console.log('Checkout criado via Edge Function');
        window.location.href = data.url;
        return;
      }

      console.warn('Falha na Edge Function, tentando servidor local...', error);

      // 3. Fallback: Tenta servidor local (apenas para desenvolvimento/testes locais)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          const response = await fetch('http://localhost:3001/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.toLowerCase().trim(),
              nome: nome.trim(),
              origin: window.location.origin
            }),
          });

          const localData = await response.json();

          if (localData.url) {
            console.log('Checkout criado via servidor local');
            window.location.href = localData.url;
            return;
          }
        } catch (localError) {
          console.error('Falha também no servidor local:', localError);
        }
      }

      // 4. Último Recurso: Redireciona para o Link de Pagamento fixo fornecido
      console.log('Usando link de pagamento fixo como último recurso');
      toast.info('Redirecionando para página de pagamento...');
      setTimeout(() => {
        window.location.href = STRIPE_PAYMENT_LINK + `?prefilled_email=${encodeURIComponent(email.toLowerCase().trim())}`;
      }, 1500);

    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviso de pagamento */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Acesso Vitalício</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Após o pagamento único, você terá acesso completo e permanente à plataforma.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome" className="text-easyeat-dark font-medium">Nome</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErrors((prev) => ({ ...prev, nome: '' }));
              }}
              className={`pl-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${errors.nome
                ? 'border-easyeat-error focus:border-easyeat-error'
                : 'border-gray-200 focus:border-easyeat-primary'
                }`}
              disabled={isLoading}
            />
          </div>
          {errors.nome && (
            <p className="text-sm text-easyeat-error flex items-center gap-1">⚠️ {errors.nome}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-easyeat-dark font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              className={`pl-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${errors.email
                ? 'border-easyeat-error focus:border-easyeat-error'
                : 'border-gray-200 focus:border-easyeat-primary'
                }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-easyeat-error flex items-center gap-1">⚠️ {errors.email}</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setAcceptTerms(checked === true);
              setErrors((prev) => ({ ...prev, terms: '' }));
            }}
            className="mt-1 data-[state=checked]:bg-easyeat-primary data-[state=checked]:border-easyeat-primary"
          />
          <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight cursor-pointer">
            Aceito os{' '}
            <button
              type="button"
              className="text-easyeat-primary hover:underline"
              onClick={(e) => { e.preventDefault(); openDocs('terms'); }}
            >
              Termos de Serviço
            </button>{' '}
            e a{' '}
            <button
              type="button"
              className="text-easyeat-primary hover:underline"
              onClick={(e) => { e.preventDefault(); openDocs('privacy'); }}
            >
              Política de Privacidade
            </button>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-sm text-easyeat-error flex items-center gap-1">⚠️ {errors.terms}</p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-easyeat-primary hover:bg-easyeat-secondary text-easyeat-dark transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecionando para pagamento...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              PAGAR E CRIAR CONTA
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      <LegalDocsDialog open={docsOpen} onOpenChange={setDocsOpen} initialTab={docsTab} />
    </>
  );
}
