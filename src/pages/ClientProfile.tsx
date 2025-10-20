import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { Client, Enrollment, MonthlyPayment } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ClientProfileHeader } from "@/components/ClientProfile/ClientProfileHeader";
import { DadosCadastraisTab } from "@/components/ClientProfile/DadosCadastraisTab";
import { MatriculasTab } from "@/components/ClientProfile/MatriculasTab";
import HistoricoFinanceiroTab from "@/components/ClientProfile/HistoricoFinanceiroTab";
import { FrequenciaTab } from "@/components/ClientProfile/FrequenciaTab";
import { format } from 'date-fns';

interface ClientProfileProps {
  clientId?: number;
}

export const ClientProfile = ({ clientId }: ClientProfileProps) => {
  const { id: idFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPortalView = location.pathname.startsWith('/portal_aluno');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dados');
  const { toast } = useToast();
  
  const { clients, enrollments, payments, updateClient, deleteClient, updateEnrollment, deleteEnrollment, markPaymentAsPaid, addEnrollment, loading, inviteClient, refresh } = useSupabaseData();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientEnrollments, setClientEnrollments] = useState<Enrollment[]>([]);
  const [clientPayments, setClientPayments] = useState<MonthlyPayment[]>([]);
  const [isNewEnrollmentFormOpen, setIsNewEnrollmentFormOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [highlightedPaymentId, setHighlightedPaymentId] = useState<number | null>(null);

  const effectiveId = clientId ?? (idFromUrl ? parseInt(idFromUrl, 10) : undefined);

  // Load data when component mounts and when data is available
  useEffect(() => {
    if (effectiveId && clients.length > 0 && !loading) {
      const foundClient = clients.find(c => c.id === effectiveId);
      if (foundClient) {
        setClient(foundClient);
        
        // Get client enrollments
        const clientEnroll = enrollments.filter(e => e.id_aluno === foundClient.id);
        setClientEnrollments(clientEnroll);
        
        // Get client payments
        const enrollmentIds = clientEnroll.map(e => e.id);
        const clientPaymentsData = payments.filter(p => enrollmentIds.includes(p.id_matricula));
        setClientPayments(clientPaymentsData);
        
        // Check for highlighted payment from notification redirect
        const paymentId = searchParams.get('highlight_payment');
        if (paymentId && searchParams.get('tab') === 'financeiro') {
          const paymentIdNum = parseInt(paymentId);
          setHighlightedPaymentId(paymentIdNum);
          setActiveTab('financeiro');
          // Remove highlight after 3 seconds
          setTimeout(() => setHighlightedPaymentId(null), 3000);
        }
      } else {
        // Client not found after data is loaded
        setClient(null);
      }
    }
  }, [effectiveId, clients, enrollments, payments, loading, searchParams]); // Depend on all necessary data

  const handleClientUpdate = (updatedClient: Client) => {
    updateClient(updatedClient.id, updatedClient);
    setClient(updatedClient);
  };

  const handleClientDelete = async (clientId: number) => {
    try {
      await deleteClient(clientId);
      toast({
        title: "Cliente Excluído",
        description: "O cliente foi removido do sistema.",
      });
      navigate('/clients'); // Navigate back to the client list
    } catch (error) {
      // The error toast is already handled in the context
      console.error("Falha ao excluir cliente:", error);
    }
  };

  const handleInvite = async () => {
    console.log('PASSO 1: Função de convite acionada.');
    if (!client) return;
    setIsInviting(true);
    try {
      console.log('PASSO 2: Chamando a função do contexto para convidar.');
      await inviteClient(client.id, client.email);
      toast({
        title: "Sucesso!",
        description: "Convite enviado com sucesso!",
      });
      await refresh(); // Refresh data to get the new user_id
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleEnrollmentUpdate = async (enrollmentToUpdate: Enrollment) => {
    try {
      const updatedData = await updateEnrollment(enrollmentToUpdate.id, enrollmentToUpdate);
      if (updatedData) {
        setClientEnrollments(prev => 
          prev.map(e => e.id === updatedData.id ? updatedData : e)
        );
      }
    } catch (error) {
      console.error("Falha ao atualizar matrícula:", error);
    }
  };

  const handleEnrollmentDelete = async (enrollmentId: number) => {
    try {
      await deleteEnrollment(enrollmentId);
      setClientEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error("Falha ao excluir matrícula:", error);
    }
  };

  const handleNewEnrollment = () => {
    setIsNewEnrollmentFormOpen(true);
  };

  const handlePaymentMarkAsPaid = (paymentId: number) => {
    markPaymentAsPaid(paymentId);
    
    // Update local state
    setClientPayments(prev => 
      prev.map(p => p.id === paymentId ? {
        ...p,
        statusPagamento: "Pago" as const,
        dataPagamento: format(new Date(), 'yyyy-MM-dd')
      } : p)
    );
    
    toast({
      title: "Pagamento confirmado",
      description: "Mensalidade marcada como paga com sucesso!",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
  };

  // Check if client needs medical certificate (age > 40 and no certificate)
  const needsMedicalCertificate = useMemo(() => {
    if (!client?.dataNascimento) return false;
    const birthDate = new Date(client.dataNascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return (age - 1) > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
    }
    
    return age > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
  }, [client]);

  // Show loading state
  if (loading || !client) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-card rounded-lg shadow-card p-6">
            <div className="flex items-center gap-6">
              <LoadingSkeleton className="h-24 w-24 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <LoadingSkeleton className="h-8 w-64" />
                <LoadingSkeleton className="h-4 w-48" />
                <div className="flex gap-2">
                  <LoadingSkeleton className="h-6 w-16" />
                  <LoadingSkeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <LoadingSkeleton className="h-10 w-20" />
                <LoadingSkeleton className="h-10 w-20" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-card rounded-lg shadow-card">
            <div className="flex border-b">
              <LoadingSkeleton className="h-12 w-32" />
              <LoadingSkeleton className="h-12 w-32" />
              <LoadingSkeleton className="h-12 w-32" />
              <LoadingSkeleton className="h-12 w-32" />
            </div>
            <div className="p-6 space-y-4">
              <LoadingSkeleton className="h-6 w-full" />
              <LoadingSkeleton className="h-6 w-3/4" />
              <LoadingSkeleton className="h-6 w-1/2" />
              <LoadingSkeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state if client doesn't exist and data is loaded
  if (!loading && clients.length > 0 && !client) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-card rounded-lg shadow-card p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              O cliente solicitado não existe ou foi removido do sistema.
            </p>
                        <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ClientProfileHeader 
          client={client} 
          enrollments={clientEnrollments}
          needsMedicalCertificate={needsMedicalCertificate} 
          onInvite={handleInvite}
          isInviting={isInviting}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Perfil</TabsTrigger>
            <TabsTrigger value="matriculas">Matrícula(s)</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="frequencia">Frequência</TabsTrigger>
          </TabsList>

          {/* Tab 1: Dados Cadastrais */}
          <TabsContent value="dados">
            <DadosCadastraisTab
              client={client}
              onUpdate={handleClientUpdate}
              onDelete={!isPortalView ? handleClientDelete : undefined}
              needsMedicalCertificate={needsMedicalCertificate}
            />
          </TabsContent>

          {/* Tab 2: Matrícula(s) */}
          <TabsContent value="matriculas">
            <MatriculasTab
              client={client}
              clientEnrollments={clientEnrollments}
              onEnrollmentUpdate={handleEnrollmentUpdate}
              onEnrollmentDelete={handleEnrollmentDelete}
              onNewEnrollment={handleNewEnrollment}
              isPortalView={isPortalView} // Passa a variável para o componente filho
            />
          </TabsContent>

          {/* Tab 3: Histórico Financeiro */}
          <TabsContent value="financeiro">
            <HistoricoFinanceiroTab
              clientPayments={clientPayments}
              onMarkAsPaid={handlePaymentMarkAsPaid}
              highlightedPaymentId={highlightedPaymentId}
              isPortalView={isPortalView}
            />
          </TabsContent>

          {/* Tab 4: Frequência */}
          <TabsContent value="frequencia">
            <FrequenciaTab clientId={client.id} />
          </TabsContent>
        </Tabs>

        {/* New Enrollment Form */}
        <EnrollmentForm
          client={client}
          isOpen={isNewEnrollmentFormOpen}
          onClose={() => setIsNewEnrollmentFormOpen(false)}
          onSubmit={(enrollmentData) => {
            const [year, month, day] = enrollmentData.dataInicio.split('-').map(Number);
            const startDate = new Date(Date.UTC(year, month - 1, day));
            
            const endDate = new Date(startDate);
            endDate.setUTCMonth(startDate.getUTCMonth() + enrollmentData.duracaoContratoMeses);
            
            const completeEnrollmentData = {
              ...enrollmentData,
              dataFim: format(endDate, 'yyyy-MM-dd'),
              statusMatricula: "Ativa" as const
            };
            addEnrollment(completeEnrollmentData);
            setIsNewEnrollmentFormOpen(false);
            
            // Refresh enrollments and payments
            const updatedEnrollments = enrollments.filter(e => e.id_aluno === client.id);
            setClientEnrollments(updatedEnrollments);
            const enrollmentIds = updatedEnrollments.map(e => e.id);
            const updatedPayments = payments.filter(p => enrollmentIds.includes(p.id_matricula));
            setClientPayments(updatedPayments);
          }}
        />
      </div>
    </div>
  );
};