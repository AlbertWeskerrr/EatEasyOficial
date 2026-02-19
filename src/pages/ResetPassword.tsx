import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import logoYellow from "@/assets/logo-yellow.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    // Check if already in a valid session from recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (): boolean => {
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes("same password")) {
          setError("A nova senha deve ser diferente da senha atual");
        } else {
          setError("Erro ao redefinir senha. Tente novamente.");
        }
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="animate-pulse text-[#1F1F1F]">Verificando sessão...</div>
      </div>
    );
  }

  if (!isValidSession && !isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <img src={logoYellow} alt="EasyEat" className="h-12 mx-auto" />
          </div>
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-2">
            Link Inválido ou Expirado
          </h1>
          <p className="text-[#1F1F1F]/70 mb-6">
            Este link de recuperação não é válido ou já expirou. 
            Solicite um novo link de recuperação.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-[#1F1F1F] font-semibold"
          >
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <img src={logoYellow} alt="EasyEat" className="h-12 mx-auto" />
          </div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1F1F1F] mb-2">
            Senha Redefinida!
          </h1>
          <p className="text-[#1F1F1F]/70 mb-6">
            Sua senha foi alterada com sucesso. 
            Agora você pode fazer login com sua nova senha.
          </p>
          <Button
            onClick={handleGoToLogin}
            className="w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-[#1F1F1F] font-semibold"
          >
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src={logoYellow} alt="EasyEat" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Redefinir Senha
          </h1>
          <p className="text-[#1F1F1F]/70 mt-2">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#1F1F1F] font-medium">
              Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1F1F1F]/50" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pl-10 pr-10 h-12 border-[#1F1F1F]/20 text-[#1F1F1F] placeholder:text-[#1F1F1F]/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50 hover:text-[#1F1F1F]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#1F1F1F] font-medium">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1F1F1F]/50" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="pl-10 pr-10 h-12 border-[#1F1F1F]/20 text-[#1F1F1F] placeholder:text-[#1F1F1F]/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50 hover:text-[#1F1F1F]"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-[#1F1F1F] font-semibold text-base"
          >
            {isLoading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-[#1F1F1F]/70 hover:text-[#1F1F1F] text-sm underline"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
}
