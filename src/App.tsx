import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseProvider, useSupabaseData } from "@/contexts/SupabaseContext";

// Layouts and Pages
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/Login";
import { UpdatePasswordPage } from "@/pages/UpdatePassword";
import NotFoundPage from "@/pages/NotFound";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Portal Aluno
import PortalLayout from "@/components/portal/PortalLayout";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import MeusDadosPage from "@/pages/portal/MeusDadosPage";
import FrequenciaPage from "@/pages/portal/FrequenciaPage";
import MensalidadesPage from "@/pages/portal/MensalidadesPage";

// Main Content Components
import { Dashboard } from "@/components/Dashboard";
import { ClientList } from "@/components/ClientList";
import { EnrollmentList } from "@/components/EnrollmentList";
import { PaymentManagement } from "@/components/PaymentManagement";
import { Reports } from "@/pages/Reports";
import { ClientProfile } from "@/pages/ClientProfile";

const queryClient = new QueryClient();

// Main layout for authenticated users
const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { refresh } = useSupabaseData();
  const location = useLocation();

  useEffect(() => {
    refresh();
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="PersonalSystem Pro" onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border shadow-card">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
};

const AppRoutes = () => {
  const { supabase } = useSupabaseData();
  const navigate = useNavigate();

  // Efeito para lidar com mudanças de estado dinâmicas (ex: logout)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/client/:id" element={<ClientProfile />} />
          <Route path="/enrollments" element={<EnrollmentList />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Portal do Aluno */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalDashboard />} />
          <Route path="dados" element={<MeusDadosPage />} />
          <Route path="frequencia" element={<FrequenciaPage />} />
          <Route path="mensalidades" element={<MensalidadesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <TooltipProvider>
          <Router>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </Router>
        </TooltipProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

export default App;