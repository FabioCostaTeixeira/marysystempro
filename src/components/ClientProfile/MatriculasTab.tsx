import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Client, Enrollment } from "@/types";
import { EnrollmentModal } from "@/components/EnrollmentModal";

interface MatriculasTabProps {
  client: Client;
  clientEnrollments: Enrollment[];
  onEnrollmentUpdate: (enrollment: Enrollment) => void;
  onEnrollmentDelete: (enrollmentId: number) => void;
  onNewEnrollment: () => void;
}

export const MatriculasTab = memo(({ 
  client, 
  clientEnrollments,
  onEnrollmentUpdate,
  onEnrollmentDelete,
  onNewEnrollment
}: MatriculasTabProps) => {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);

  const handleEnrollmentClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEnrollmentModalOpen(true);
  };

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
      case 'Ativa': return 'bg-success text-success-foreground';
      case 'Expirada': return 'bg-destructive text-destructive-foreground';
      case 'Cancelada': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Matrícula(s)</CardTitle>
            {clientEnrollments.length === 0 && (
              <Button 
                onClick={onNewEnrollment}
                className="gradient-primary text-primary-foreground"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Nova Matrícula
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {clientEnrollments.length > 0 ? (
            <div className="space-y-4">
              {clientEnrollments.map((enrollment) => (
                <Card 
                  key={enrollment.id}
                  className="cursor-pointer transition-smooth hover:shadow-primary"
                  onClick={() => handleEnrollmentClick(enrollment)}
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(enrollment.statusMatricula)}>
                          {enrollment.statusMatricula}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Período</p>
                        <p className="font-medium">
                          {formatDate(enrollment.dataInicio)} - {formatDate(enrollment.dataFim)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Treino</p>
                        <p className="font-medium">{enrollment.tipoTreino}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Mensal</p>
                        <p className="font-medium">{formatCurrency(enrollment.valorMensalidade)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
              }
              <div className="pt-4 border-t">
                <Button 
                  onClick={onNewEnrollment}
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Adicionar Nova Matrícula
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma matrícula encontrada</h3>
              <p className="text-muted-foreground mb-4">Este aluno ainda não possui matrículas cadastradas.</p>
              <Button 
                onClick={onNewEnrollment}
                className="gradient-primary text-primary-foreground"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Criar Primeira Matrícula
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Enrollment Modal for Editing */}
      {selectedEnrollment && (
        <EnrollmentModal
          enrollment={selectedEnrollment}
          client={client}
          isOpen={isEnrollmentModalOpen}
          onClose={() => {
            setIsEnrollmentModalOpen(false);
            setSelectedEnrollment(null);
          }}
          onUpdate={onEnrollmentUpdate}
          onDelete={onEnrollmentDelete}
        />
      )}
    </>
  );
});

MatriculasTab.displayName = "MatriculasTab";
