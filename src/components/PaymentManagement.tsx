import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { 
  CreditCard, 
  Search, 
  Filter,
  Check,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";

export const PaymentManagement = () => {
  const { payments, enrollments, clients, markPaymentAsPaid, getClientById } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const getEnrollmentById = (enrollmentId: number) => 
    enrollments.find(e => e.id === enrollmentId);

  const getClientByPayment = (payment: any) => {
    const enrollment = getEnrollmentById(payment.id_matricula);
    return enrollment ? getClientById(enrollment.id_aluno) : null;
  };

  const filteredPayments = payments.filter(payment => {
    const client = getClientByPayment(payment);
    const matchesSearch = client?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" || payment.statusPagamento === statusFilter;
    
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const dueDate = new Date(payment.dataVencimento);
      matchesDate = isWithinInterval(dueDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate summary for date range
  const dateRangeSummary = {
    received: filteredPayments
      .filter(p => p.statusPagamento === "Pago")
      .reduce((sum, p) => sum + p.valor, 0),
    pending: filteredPayments
      .filter(p => p.statusPagamento === "Pendente")
      .reduce((sum, p) => sum + p.valor, 0),
    overdue: filteredPayments
      .filter(p => p.statusPagamento === "Atrasado")
      .reduce((sum, p) => sum + p.valor, 0)
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "bg-success text-success-foreground";
      case "Pendente": return "bg-warning text-warning-foreground";
      case "Atrasado": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleMarkAsPaid = (paymentId: number) => {
    markPaymentAsPaid(paymentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Contas a Receber</h1>
          <p className="text-muted-foreground">Gerencie todas as mensalidades e pagamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary">
            <CreditCard className="h-4 w-4 mr-1" />
            {filteredPayments.length} mensalidades
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {dateRangeSummary.pending.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.statusPagamento === "Pendente").length} mensalidades
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasado</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {dateRangeSummary.overdue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.statusPagamento === "Atrasado").length} mensalidades
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido no Período</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {dateRangeSummary.received.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.statusPagamento === "Pago").length} mensalidades pagas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por aluno</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Período de Vencimento</label>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const client = getClientByPayment(payment);
              const enrollment = getEnrollmentById(payment.id_matricula);
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-semibold">{client?.nome || 'Cliente não encontrado'}</p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment?.tipoTreino} • {enrollment?.frequenciaSemanal}x/semana
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Vencimento</p>
                      <p className="font-medium">{formatDate(payment.dataVencimento)}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold text-primary">{formatCurrency(payment.valor)}</p>
                    </div>
                    
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Badge className={getStatusColor(payment.statusPagamento)}>
                        {payment.statusPagamento}
                      </Badge>
                      
                      {payment.statusPagamento !== "Pago" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="ml-2"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marcar como Paga
                        </Button>
                      )}
                      
                      {payment.statusPagamento === "Pago" && payment.dataPagamento && (
                        <p className="text-xs text-muted-foreground ml-2">
                          Pago em {formatDate(payment.dataPagamento)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma mensalidade encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};