import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
import { HistoricoFinanceiroTab } from "@/components/ClientProfile/HistoricoFinanceiroTab";

export const ClientProfile = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dados');
  const { toast } = useToast();
  
  const { clients, enrollments, payments, updateClient, deleteClient, markPaymentAsPaid, addEnrollment, loading } = useSupabaseData();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientEnrollments, setClientEnrollments] = useState<Enrollment[]>([]);
  const [clientPayments, setClientPayments] = useState<MonthlyPayment[]>([]);
  const [isNewEnrollmentFormOpen, setIsNewEnrollmentFormOpen] = useState(false);
  const [highlightedPaymentId, setHighlightedPaymentId] = useState<number | null>(null);

  // Load data when component mounts and when data is available
  useEffect(() => {
    if (id && clients.length > 0 && !loading) {
      const foundClient = clients.find(c => c.id === parseInt(id));
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
  }, [id, clients, enrollments, payments, loading, searchParams]); // Depend on all necessary data

  const handleClientUpdate = (updatedClient: Client) => {
    updateClient(updatedClient.id, updatedClient);
    setClient(updatedClient);
  };

  const handleClientDelete = (clientId: number) => {
    deleteClient(clientId);
    window.location.href = '/'; // Navigate away after deletion
  };

  const handleEnrollmentUpdate = (updatedEnrollment: Enrollment) => {
    setClientEnrollments(prev => 
      prev.map(e => e.id === updatedEnrollment.id ? updatedEnrollment : e)
    );
  };

  const handleEnrollmentDelete = (enrollmentId: number) => {
    setClientEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
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
        dataPagamento: new Date().toISOString().split('T')[0]
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
          needsMedicalCertificate={needsMedicalCertificate} 
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="matriculas">Matrícula(s)</TabsTrigger>
            <TabsTrigger value="financeiro">Histórico Financeiro</TabsTrigger>
          </TabsList>

          {/* Tab 1: Dados Cadastrais */}
          <TabsContent value="dados">
            <DadosCadastraisTab
              client={client}
              onUpdate={handleClientUpdate}
              onDelete={handleClientDelete}
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
            />
          </TabsContent>

          {/* Tab 3: Histórico Financeiro */}
          <TabsContent value="financeiro">
            <HistoricoFinanceiroTab
              clientPayments={clientPayments}
              onMarkAsPaid={handlePaymentMarkAsPaid}
              highlightedPaymentId={highlightedPaymentId}
            />
          </TabsContent>
        </Tabs>

        {/* New Enrollment Form */}
        <EnrollmentForm
          client={client}
          isOpen={isNewEnrollmentFormOpen}
          onClose={() => setIsNewEnrollmentFormOpen(false)}
          onSubmit={(enrollmentData) => {
            const startDate = new Date(enrollmentData.dataInicio);
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + enrollmentData.duracaoContratoMeses);
            
            const completeEnrollmentData = {
              ...enrollmentData,
              dataFim: endDate.toISOString().split('T')[0],
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