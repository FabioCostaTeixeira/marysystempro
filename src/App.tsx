import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Notification } from "@/types";
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
  const { 
    supabase, 
    clients, 
    enrollments, 
    payments, 
    setNotifications 
  } = useSupabaseData();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Busca o usuário autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  // Lida com o logout e atualiza o usuário no estado
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]);

  // Gera notificações de forma sensível ao contexto da rota
  useEffect(() => {
    if (!payments.length || !enrollments.length || !clients.length) {
      setNotifications([]); // Limpa as notificações se os dados não estiverem carregados
      return;
    }

    const today = new Date();
    let overdueNotifications: Notification[] = [];

    const allOverduePayments = payments.filter(p => 
      p.statusPagamento === 'Pendente' && differenceInDays(today, new Date(p.dataVencimento)) >= 5
    );

    if (location.pathname.startsWith('/portal_aluno')) {
      // Contexto do Aluno: filtra notificações para o usuário logado
      if (user) {
        const currentUserClient = clients.find(c => c.user_id === user.id);
        if (currentUserClient) {
          const clientEnrollments = enrollments.filter(e => e.id_aluno === currentUserClient.id);
          const clientEnrollmentIds = clientEnrollments.map(e => e.id);
          
          const clientOverduePayments = allOverduePayments.filter(p => 
            clientEnrollmentIds.includes(p.id_matricula)
          );

          overdueNotifications = clientOverduePayments.map(payment => {
            const daysOverdue = differenceInDays(today, new Date(payment.dataVencimento));
            return {
              id: payment.id,
              type: 'overdue',
              message: `Sua mensalidade venceu há ${daysOverdue} dias.`,
              clientId: currentUserClient.id,
              enrollmentId: payment.id_matricula,
              date: new Date().toISOString(),
              read: false,
            };
          });
        }
      }
    } else {
      // Contexto do Admin: mostra todas as notificações
      overdueNotifications = allOverduePayments.map(payment => {
        const enrollment = enrollments.find(e => e.id === payment.id_matricula);
        const client = enrollment ? clients.find(c => c.id === enrollment.id_aluno) : undefined;
        const daysOverdue = differenceInDays(today, new Date(payment.dataVencimento));
        
        return {
          id: payment.id,
          type: 'overdue',
          message: `A mensalidade de ${client?.nome || 'Aluno desconhecido'} venceu há ${daysOverdue} dias.`,
          clientId: client?.id,
          enrollmentId: payment.id_matricula,
          date: new Date().toISOString(),
          read: false,
        };
      });
    }

    setNotifications(overdueNotifications);

  }, [location, user, payments, enrollments, clients, setNotifications]);

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
        <Route path="/portal_aluno" element={<PortalLayout />}>
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