import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminCustomFoodsExport from "./pages/AdminCustomFoodsExport";
import RestrictionsSettings from "./pages/RestrictionsSettings";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/custom-foods-export" element={<AdminCustomFoodsExport />} />
            <Route path="/settings/restricoes" element={<RestrictionsSettings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/*" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<ResetPassword />} />
            <Route path="/auth/callback/*" element={<ResetPassword />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
