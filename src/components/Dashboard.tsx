import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Filter } from "./Dashboard/Filter"; // Import the new Filter component
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Target,
  FileText
} from "lucide-react";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { MonthlyPayment, Client, Enrollment } from "@/types";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { payments, clients, enrollments, loading, getClientById, calculateAge } = useSupabaseData();

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const filteredPayments = useMemo(() => {
    if (selectedMonths.length === 0) {
      return payments.filter(p => new Date(p.dataVencimento).getFullYear() === currentYear);
    }
    return payments.filter(p => {
      const paymentDate = new Date(p.dataVencimento);
      return paymentDate.getFullYear() === currentYear && selectedMonths.includes(paymentDate.getMonth());
    });
  }, [payments, currentYear, selectedMonths]);

  const metrics = useMemo(() => {
    const totalReceived = filteredPayments
      .filter(p => p.statusPagamento === "Pago")
      .reduce((sum, p) => sum + p.valor, 0);

    const totalPending = filteredPayments
      .filter(p => p.statusPagamento === "Pendente")
      .reduce((sum, p) => sum + p.valor, 0);

    const totalOverdue = filteredPayments
      .filter(p => p.statusPagamento === "Atrasado")
      .reduce((sum, p) => sum + p.valor, 0);

    // These metrics below are not affected by the date filter
    const activeClients = clients.filter(c => c.status === "Ativo").length;
    const newEnrollments = enrollments.filter(e => {
        const enrollmentDate = new Date(e.dataInicio);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return enrollmentDate > thirtyDaysAgo;
    }).length;

    return {
      totalReceived,
      totalPending,
      totalOverdue,
      activeClients,
      newEnrollments,
      monthlyGoal: 50000, // Static goal for now
    };
  }, [filteredPayments, clients, enrollments]);

  const handleFilterChange = ({ year, months }: { year: number; months: number[] }) => {
    setCurrentYear(year);
    setSelectedMonths(months);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <LoadingSkeleton className="h-24 w-full" /> 
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
      </div>
    );
  }

  const clientsNeedingMedicalCertificate = clients.filter(client => {
    if (!client.dataNascimento || client.status !== "Ativo") return false;
    const age = calculateAge(client.dataNascimento);
    return age > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
  });

  const handleClientClick = (clientId: number) => {
    navigate(`/client/${clientId}?tab=dados`);
  };

  const progressPercentage = (metrics.totalReceived / metrics.monthlyGoal) * 100;

  const recentActivities = payments
    .filter(p => p.statusPagamento === "Pago" && p.dataPagamento)
    .sort((a, b) => new Date(b.dataPagamento!).getTime() - new Date(a.dataPagamento!).getTime())
    .slice(0, 3);

  const upcomingPayments = payments
    .filter(p => p.statusPagamento === "Pendente")
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
    .slice(0, 3);

  const getClientByPayment = (payment: MonthlyPayment) => {
    const enrollment = enrollments.find(e => e.id === payment.id_matricula);
    if (!enrollment) return null;
    return getClientById(enrollment.id_aluno);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <Filter payments={payments} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(metrics.totalReceived)}</div>
            <p className="text-xs text-muted-foreground">{selectedMonths.length > 0 ? "Nos meses selecionados" : "No ano selecionado"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(metrics.totalPending)}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.statusPagamento === "Pendente").length} mensalidades</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atrasado</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(metrics.totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.statusPagamento === "Atrasado").length} mensalidades</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.activeClients}</div>
            <p className="text-xs text-muted-foreground">Total de alunos com status ativo</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Matrículas</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{metrics.newEnrollments}</div>
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-smooth hover:shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{progressPercentage.toFixed(0)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(metrics.monthlyGoal)} de objetivo</p>
          </CardContent>
        </Card>
      </div>

      {clientsNeedingMedicalCertificate.length > 0 && (
        <Card className="shadow-card border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning"><FileText className="h-5 w-5" />Pendências de Atestado Médico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {clientsNeedingMedicalCertificate.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-2 bg-warning/10 rounded">
                <button onClick={() => handleClientClick(client.id)} className="text-sm font-medium hover:text-primary underline-offset-2">{client.nome}</button>
                <Badge variant="outline" className="text-warning border-warning">Pendente</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Últimas Atividades</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((payment) => {
                const client = getClientByPayment(payment);
                return (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Pagamento de {client?.nome || 'Cliente'}</span>
                    </div>
                    <Badge variant="outline" className="text-success">{formatCurrency(payment.valor)}</Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">Nenhuma atividade recente</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Próximos Vencimentos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => {
                const client = getClientByPayment(payment);
                return (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{client?.nome || 'Cliente'}</p>
                      <p className="text-xs text-muted-foreground">Vence {formatDate(payment.dataVencimento)}</p>
                    </div>
                    <Badge variant="outline" className={payment.statusPagamento === "Atrasado" ? "text-destructive" : "text-warning"}>{formatCurrency(payment.valor)}</Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">Nenhum vencimento próximo</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};