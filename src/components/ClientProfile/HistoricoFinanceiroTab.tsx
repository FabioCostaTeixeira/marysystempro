import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText } from "lucide-react";
import { MonthlyPayment } from "@/types";

interface HistoricoFinanceiroTabProps {
  clientPayments: MonthlyPayment[];
  onMarkAsPaid: (paymentId: number) => void;
  highlightedPaymentId?: number | null;
}

export const HistoricoFinanceiroTab = memo(({ 
  clientPayments, 
  onMarkAsPaid,
  highlightedPaymentId 
}: HistoricoFinanceiroTabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-success text-success-foreground';
      case 'Pendente': return 'bg-warning text-warning-foreground';
      case 'Atrasado': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Histórico Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        {clientPayments.length > 0 ? (
          <div className="space-y-4">
            {clientPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className={`p-4 transition-all ${
                  highlightedPaymentId === payment.id 
                    ? 'ring-2 ring-primary bg-primary/5 animate-pulse' 
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Vencimento</p>
                      <p className="font-medium">{formatDate(payment.dataVencimento)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-medium">{formatCurrency(payment.valor)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(payment.statusPagamento)}>
                        {payment.statusPagamento}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data do Pagamento</p>
                      <p className="font-medium">
                        {payment.dataPagamento ? formatDate(payment.dataPagamento) : '-'}
                      </p>
                    </div>
                  </div>
                  {(payment.statusPagamento === 'Pendente' || payment.statusPagamento === 'Atrasado') && (
                    <Button
                      size="sm"
                      className="ml-4 gradient-primary text-primary-foreground"
                      onClick={() => onMarkAsPaid(payment.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Paga
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum histórico financeiro</h3>
            <p className="text-muted-foreground">Este aluno ainda não possui mensalidades cadastradas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

HistoricoFinanceiroTab.displayName = "HistoricoFinanceiroTab";