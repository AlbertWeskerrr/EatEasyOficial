import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginFormProps {
  onForgotPassword: () => void;
  onSuccess: (userData: { nome: string; sexo: 'masculino' | 'feminino' | 'outro' }) => void;
}

export function LoginForm({ onForgotPassword, onSuccess }: LoginFormProps) {
  const { setIsLoggedIn, setClientData } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ email: 'Email ou senha incorretos' });
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        // Fetch health data from user_health_data table
        const { data: healthData } = await supabase
          .from('user_health_data')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profile) {
          // Update last login
          await supabase
            .from('profiles')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('user_id', data.user.id);

          // Combine profile data with health data
          setClientData({
            email: profile.email,
            nome: profile.nome,
            sexo: (profile.sexo as 'Masculino' | 'Feminino' | 'Outro') || 'Outro',
            idade: profile.idade || 30,
            altura: healthData?.altura_cm || 170,
            peso: healthData?.peso_kg ? Number(healthData.peso_kg) : 70,
            circunferenciaAbdominal: healthData?.circunferencia_abdominal_cm || 80,
            nivelAtividade: (profile.nivel_atividade as any) || 'Moderada',
            praticaExercicio: profile.pratica_exercicio || false,
            frequenciaExercicio: profile.frequencia_exercicio || 0,
            preferenciasAlimentares: profile.preferencias_alimentares || '',
            restricoesAlimentares: profile.restricoes_alimentares || '',
            alergias: profile.alergias || '',
            objetivo: (profile.objetivo as any) || 'Manutenção',
          });

          // Show welcome message
          onSuccess({ 
            nome: profile.nome, 
            sexo: (profile.sexo as 'masculino' | 'feminino' | 'outro') || 'outro' 
          });

          // Delay setting logged in to show welcome message
          setTimeout(() => {
            setIsLoggedIn(true);
          }, 4000);
        } else {
          // Deixa o Index (listener de auth) criar/buscar o perfil e liberar o dashboard.
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-easyeat-dark font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`pl-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
              errors.email 
                ? 'border-easyeat-error focus:border-easyeat-error' 
                : 'border-gray-200 focus:border-easyeat-primary'
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-easyeat-error flex items-center gap-1">
            ⚠️ {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-easyeat-dark font-medium">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`pl-10 pr-10 h-12 border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
              errors.password 
                ? 'border-easyeat-error focus:border-easyeat-error' 
                : 'border-gray-200 focus:border-easyeat-primary'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-easyeat-error flex items-center gap-1">
            ⚠️ {errors.password}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-easyeat-primary hover:text-easyeat-secondary transition-colors font-medium"
        >
          Recuperar acesso
        </button>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold bg-easyeat-primary hover:bg-easyeat-secondary text-easyeat-dark transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            ENTRAR
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
