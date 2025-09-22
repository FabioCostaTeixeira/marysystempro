import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Target,
  FileText
} from "lucide-react";
import { useRealSupabaseData } from "@/hooks/useRealSupabaseData";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { getDashboardMetrics, payments, clients, getClientById, enrollments, loading } = useRealSupabaseData();
  const metrics = getDashboardMetrics();
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <LoadingSkeleton className="h-4 w-24" />
                <LoadingSkeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <LoadingSkeleton className="h-8 w-20 mb-2" />
                <LoadingSkeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <LoadingSkeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <LoadingSkeleton className="h-4 w-32" />
                  <LoadingSkeleton className="h-5 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <LoadingSkeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <LoadingSkeleton className="h-4 w-32" />
                  <LoadingSkeleton className="h-5 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Get clients who need medical certificate (age > 40 and no certificate)
  const clientsNeedingMedicalCertificate = clients.filter(client => {
    if (!client.dataNascimento || client.status !== "Ativo") return false;
    const birthDate = new Date(client.dataNascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1;
    }
    
    return actualAge > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
  });

  const handleClientClick = (clientId: number) => {
    navigate(`/client/${clientId}?tab=dados`);
  };

  const progressPercentage = (metrics.totalReceived / metrics.monthlyGoal) * 100;

  // Get recent activities
  const recentActivities = payments
    .filter(p => p.statusPagamento === "Pago" && p.dataPagamento)
    .sort((a, b) => new Date(b.dataPagamento!).getTime() - new Date(a.dataPagamento!).getTime())
    .slice(0, 3);

  // Get upcoming due dates
  const upcomingPayments = payments
    .filter(p => p.statusPagamento === "Pendente")
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
    .slice(0, 3);

  const getClientByPaymentId = (paymentId: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return null;
    
    const enrollment = enrollments.find(e => e.id === payment.id_matricula);
    if (!enrollment) return null;
    
    return getClientById(enrollment.id_aluno);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Recebido */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recebido (Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {metrics.totalReceived.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalReceived > 0 ? "Valores recebidos este mês" : "Nenhum valor recebido ainda"}
            </p>
          </CardContent>
        </Card>

        {/* Total Pendente */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendente
            </CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {metrics.totalPending.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.statusPagamento === "Pendente").length} mensalidades pendentes
            </p>
          </CardContent>
        </Card>

        {/* Total Atrasado */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Atrasado
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {metrics.totalOverdue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.statusPagamento === "Atrasado").length} mensalidades atrasadas
            </p>
          </CardContent>
        </Card>

        {/* Alunos Ativos */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alunos Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics.activeClients}
            </div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === "Ativo").length} alunos no total
            </p>
          </CardContent>
        </Card>

        {/* Novas Matrículas */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novas Matrículas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {metrics.newEnrollments}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        {/* Meta Mensal */}
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meta Mensal
            </CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {progressPercentage.toFixed(0)}%
            </div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              R$ {metrics.monthlyGoal.toLocaleString('pt-BR')} objetivo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pendências de Atestado Médico */}
      {clientsNeedingMedicalCertificate.length > 0 && (
        <Card className="shadow-card border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <FileText className="h-5 w-5" />
              Pendências de Atestado Médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Alunos acima de 40 anos que precisam entregar o atestado médico:
            </p>
            <div className="space-y-2">
              {clientsNeedingMedicalCertificate.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-warning/10 rounded">
                  <button 
                    onClick={() => handleClientClick(client.id)}
                    className="text-sm font-medium hover:text-primary underline underline-offset-2 text-left"
                  >
                    {client.nome}
                  </button>
                  <Badge variant="outline" className="text-warning border-warning">
                    Pendente
                  </Badge>
                </div>
              ))}
              {clientsNeedingMedicalCertificate.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{clientsNeedingMedicalCertificate.length - 5} outros alunos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Últimas Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((payment) => {
                const client = getClientByPaymentId(payment.id);
                return (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Pagamento de {client?.nome || 'Cliente'}</span>
                    </div>
                    <Badge variant="outline" className="text-success">
                      {formatCurrency(payment.valor)}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                Nenhuma atividade recente
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => {
                const client = getClientByPaymentId(payment.id);
                return (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{client?.nome || 'Cliente'}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence {formatDate(payment.dataVencimento)}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      payment.statusPagamento === "Atrasado" ? "text-destructive" : "text-warning"
                    }>
                      {formatCurrency(payment.valor)}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                Nenhum vencimento próximo
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};