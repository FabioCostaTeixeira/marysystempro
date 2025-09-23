import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line
} from "recharts";

export const Reports = () => {
  const { clients, payments, enrollments, getClientById } = useSupabaseData();

  // Relatório 1: Receita Mensal (últimos 12 meses)
  const getMonthlyRevenue = () => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const monthRevenue = payments
        .filter(payment => {
          if (payment.statusPagamento !== "Pago" || !payment.dataPagamento) return false;
          const paymentDate = new Date(payment.dataPagamento);
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, payment) => sum + payment.valor, 0);
      
      monthlyData.push({
        month: monthName,
        revenue: monthRevenue
      });
    }
    
    return monthlyData;
  };

  // Relatório 2: Alunos Ativos vs Inativos
  const getClientStatusData = () => {
    const active = clients.filter(c => c.status === "Ativo").length;
    const inactive = clients.filter(c => c.status === "Inativo").length;
    
    return [
      { name: "Ativos", value: active, color: "#22c55e" },
      { name: "Inativos", value: inactive, color: "#ef4444" }
    ];
  };

  // Relatório 3: Desempenho de Pagamentos
  const getPaymentPerformance = () => {
    const activeClients = clients.filter(c => c.status === "Ativo");
    
    return activeClients.map(client => {
      const clientEnrollments = enrollments.filter(e => e.id_aluno === client.id);
      const clientPayments = payments.filter(p => 
        clientEnrollments.some(e => e.id === p.id_matricula)
      );
      
      const onTimePayments = clientPayments.filter(p => {
        if (p.statusPagamento !== "Pago" || !p.dataPagamento) return false;
        const dueDate = new Date(p.dataVencimento);
        const paymentDate = new Date(p.dataPagamento);
        return paymentDate <= dueDate;
      }).length;
      
      const latePayments = clientPayments.filter(p => {
        if (p.statusPagamento !== "Pago" || !p.dataPagamento) return false;
        const dueDate = new Date(p.dataVencimento);
        const paymentDate = new Date(p.dataPagamento);
        return paymentDate > dueDate;
      }).length;
      
      return {
        nome: client.nome,
        emDia: onTimePayments,
        atrasados: latePayments,
        totalPago: onTimePayments + latePayments
      };
    });
  };

  const monthlyRevenue = getMonthlyRevenue();
  const clientStatusData = getClientStatusData();
  const paymentPerformance = getPaymentPerformance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlyRevenue = totalRevenue / 12;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Relatórios</h1>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total (12 meses)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal: {formatCurrency(averageMonthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {clients.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {clientStatusData[0]?.value} ativos, {clientStatusData[1]?.value} inativos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Processados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {payments.filter(p => p.statusPagamento === "Pago").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de pagamentos recebidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatório 1: Receita Mensal */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Receita Mensal (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Receita"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Relatório 2: Alunos Ativos vs Inativos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Alunos Ativos vs. Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip formatter={(value) => [value, "Alunos"]} />
                  <RechartsPieChart data={clientStatusData}>
                    {clientStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {clientStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório 3: Desempenho de Pagamentos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Desempenho de Pagamentos por Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Aluno</th>
                  <th className="text-center p-2">Pagos em Dia</th>
                  <th className="text-center p-2">Pagos em Atraso</th>
                  <th className="text-center p-2">Total Pago</th>
                  <th className="text-center p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {paymentPerformance.map((client, index) => {
                  const performanceRate = client.totalPago > 0 
                    ? (client.emDia / client.totalPago) * 100 
                    : 0;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{client.nome}</td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4 text-success" />
                          {client.emDia}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4 text-destructive" />
                          {client.atrasados}
                        </div>
                      </td>
                      <td className="text-center p-2 font-medium">
                        {client.totalPago}
                      </td>
                      <td className="text-center p-2">
                        <Badge 
                          variant={performanceRate >= 80 ? "default" : performanceRate >= 60 ? "secondary" : "destructive"}
                        >
                          {performanceRate.toFixed(0)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {paymentPerformance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de pagamento disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};