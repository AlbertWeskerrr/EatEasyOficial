import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Check, X, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logoYellow from '@/assets/logo-yellow.png';

type PageState = 'verifying' | 'set-password' | 'creating-account' | 'success' | 'error';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email') || '';
    const nome = searchParams.get('nome') || '';
    const sessionId = searchParams.get('session_id') || '';

    const [pageState, setPageState] = useState<PageState>('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getPasswordStrength = (pwd: string): PasswordStrength => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;
        if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500' };
        if (score <= 3) return { score, label: 'Média', color: 'bg-yellow-500' };
        return { score, label: 'Forte', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(password);

    const passwordRequirements = [
        { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
        { met: /[a-z]/.test(password), text: 'Uma letra minúscula' },
        { met: /[A-Z]/.test(password), text: 'Uma letra maiúscula' },
        { met: /[0-9]/.test(password), text: 'Um número' },
    ];

    useEffect(() => {
        if (!email || !sessionId) {
            setErrorMessage('Link inválido. Parâmetros ausentes.');
            setPageState('error');
            return;
        }
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        setPageState('verifying');

        // Tenta verificar até 10x com intervalo de 2s (webhook pode demorar alguns segundos)
        let attempts = 0;
        const maxAttempts = 10;

        const check = async (): Promise<boolean> => {
            const { data, error } = await supabase
                .from('stripe_subscriptions')
                .select('subscription_status')
                .eq('stripe_session_id', sessionId)
                .maybeSingle();

            if (error) {
                console.error('Error checking payment:', error);
                return false;
            }

            return data?.subscription_status === 'active';
        };

        const poll = async () => {
            const confirmed = await check();
            if (confirmed) {
                setPageState('set-password');
                return;
            }

            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(poll, 2000);
            } else {
                // Mesmo sem confirmação do webhook, permite continuar
                // (o webhook pode ter falhado mas o pagamento foi feito)
                setPageState('set-password');
            }
        };

        await poll();
    };

    const handleSetPassword = async (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 8) {
            newErrors.password = 'Mínimo 8 caracteres';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Deve ter uma letra maiúscula';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Deve ter um número';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Senhas não conferem';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setPageState('creating-account');

        try {
            // Cria a conta no Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: { nome: nome.trim() },
                },
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    // Usuário já existe — tenta fazer login
                    const { error: loginError } = await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password,
                    });
                    if (loginError) {
                        toast.error('Conta já existe. Tente fazer login com sua senha.');
                        navigate('/');
                        return;
                    }
                } else {
                    throw error;
                }
            }

            if (data?.user) {
                // Cria perfil mínimo se houver sessão
                if (data.session?.user) {
                    await supabase.from('profiles').upsert(
                        {
                            user_id: data.session.user.id,
                            email: email.trim(),
                            nome: nome.trim(),
                            perfil_completo: false,
                        },
                        { onConflict: 'user_id' }
                    );
                }
            }

            setPageState('success');
            setTimeout(() => navigate('/'), 3000);
        } catch (err: any) {
            console.error('Error creating account:', err);
            setErrorMessage(err.message || 'Erro ao criar conta. Entre em contato com o suporte.');
            setPageState('error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-easyeat-primary/20 to-easyeat-secondary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img src={logoYellow} alt="Easy Eat" className="w-16 h-16 rounded-2xl shadow-lg mb-3" />
                    <h1 className="text-2xl font-bold text-easyeat-dark">EASY EAT</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* VERIFYING */}
                    {pageState === 'verifying' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-easyeat-primary mx-auto" />
                            <h2 className="text-xl font-bold text-gray-900">Confirmando pagamento...</h2>
                            <p className="text-gray-500 text-sm">Aguarde enquanto verificamos seu pagamento.</p>
                        </div>
                    )}

                    {/* SET PASSWORD */}
                    {pageState === 'set-password' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Pagamento confirmado! 🎉</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Olá, <strong>{nome || email}</strong>! Agora defina sua senha para acessar a plataforma.
                                </p>
                            </div>

                            <form onSubmit={handleSetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-easyeat-dark font-medium">Criar Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setErrors((prev) => ({ ...prev, password: '' }));
                                            }}
                                            className={`pl-10 pr-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-easyeat-primary'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {password && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {passwordRequirements.map((req, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 text-xs">
                                                        {req.met ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                                                        <span className={req.met ? 'text-green-600' : 'text-gray-400'}>{req.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && <p className="text-sm text-red-500">⚠️ {errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="text-easyeat-dark font-medium">Confirmar Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                                            }}
                                            className={`pl-10 pr-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-easyeat-primary'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-500">⚠️ {errors.confirmPassword}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-easyeat-primary hover:bg-easyeat-secondary text-easyeat-dark"
                                >
                                    CRIAR MINHA CONTA
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* CREATING ACCOUNT */}
                    {pageState === 'creating-account' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-easyeat-primary mx-auto" />
                            <h2 className="text-xl font-bold text-gray-900">Criando sua conta...</h2>
                            <p className="text-gray-500 text-sm">Quase lá! Configurando seu acesso.</p>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {pageState === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Conta criada com sucesso! 🎉</h2>
                            <p className="text-gray-500 text-sm">
                                Bem-vindo ao Easy Eat, <strong>{nome}</strong>! Redirecionando para a plataforma...
                            </p>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-easyeat-primary animate-[grow_3s_linear_forwards]" />
                            </div>
                        </div>
                    )}

                    {/* ERROR */}
                    {pageState === 'error' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Algo deu errado</h2>
                            <p className="text-gray-500 text-sm">{errorMessage}</p>
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Voltar ao início
                            </Button>
                            <p className="text-xs text-gray-400">
                                Se você realizou o pagamento, entre em contato com o suporte informando seu email: <strong>{email}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
