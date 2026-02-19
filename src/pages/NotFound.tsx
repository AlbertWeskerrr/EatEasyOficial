import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Check if this is a recovery link that landed on 404
    const hash = location.hash;
    const search = location.search;
    const fullUrl = location.pathname + search + hash;
    
    const isRecoveryLink = 
      hash.includes('type=recovery') || 
      hash.includes('access_token') ||
      search.includes('type=recovery') ||
      hash.includes('type=signup') ||
      hash.includes('type=magiclink');
    
    if (isRecoveryLink) {
      // Redirect to reset-password preserving the hash/search params
      navigate('/reset-password' + search + hash, { replace: true });
    }
  }, [location, navigate]);

  const handleReturnToLogin = async () => {
    setIsLoading(true);
    try {
      // Sign out to ensure we go to login, not dashboard
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Página não encontrada</p>
        <Button 
          onClick={handleReturnToLogin}
          disabled={isLoading}
          variant="link"
          className="text-primary underline hover:text-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecionando...
            </>
          ) : (
            "Voltar para Login"
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
