import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { 
  Calendar, 
  Users, 
  Search, 
  Filter,
  Monitor,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { Enrollment } from "@/types";

export const EnrollmentList = () => {
  const { enrollments, clients, getClientById, updateEnrollment, deleteEnrollment, loading } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEnrollmentClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleUpdateEnrollment = (updatedEnrollment: Enrollment) => {
    updateEnrollment(updatedEnrollment.id, updatedEnrollment);
    setSelectedEnrollment(updatedEnrollment);
  };

  const handleDeleteEnrollment = (enrollmentId: number) => {
    deleteEnrollment(enrollmentId);
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const client = getClientById(enrollment.id_aluno);
    const matchesSearch = client?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" || enrollment.statusMatricula === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa": return "bg-success text-success-foreground";
      case "Expirada": return "bg-warning text-warning-foreground";
      case "Cancelada": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Matrículas</h1>
          <p className="text-muted-foreground">Gerencie todas as matrículas de treinamento</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary">
            <Users className="h-4 w-4 mr-1" />
            {filteredEnrollments.length} matrículas
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Ativa">Ativas</SelectItem>
                  <SelectItem value="Expirada">Expiradas</SelectItem>
                  <SelectItem value="Cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment) => {
                const client = getClientById(enrollment.id_aluno);
                const isExpiringSoon = () => {
                  const endDate = new Date(enrollment.dataFim);
                  const today = new Date();
                  const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return daysDiff <= 15 && daysDiff > 0;
                };

                return (
                  <Card 
                    key={enrollment.id} 
                    className="shadow-card hover:shadow-primary transition-smooth cursor-pointer"
                    onClick={() => handleEnrollmentClick(enrollment)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {enrollment.tipoTreino === "Online" ? 
                            <Monitor className="h-5 w-5 text-primary" /> : 
                            <MapPin className="h-5 w-5 text-secondary" />
                          }
                          <div>
                            <h3 className="font-semibold text-lg">{client?.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {enrollment.id} • {enrollment.tipoTreino}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getStatusColor(enrollment.statusMatricula)}>
                            {enrollment.statusMatricula}
                          </Badge>
                          {isExpiringSoon() && (
                            <Badge variant="outline" className="text-warning border-warning">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expirando
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    {enrollment.tipoTreino === "Online" ? (
                      <Monitor className="h-4 w-4 text-primary" />
                    ) : (
                      <MapPin className="h-4 w-4 text-primary" />
                    )}
                    <span>{enrollment.tipoTreino}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{enrollment.frequenciaSemanal}x/semana</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(enrollment.valorMensalidade)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recorrência:</span>
                    <span className="font-medium">{enrollment.recorrenciaPagamento}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{enrollment.duracaoContratoMeses} meses</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Início:</span>
                    <span>{formatDate(enrollment.dataInicio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fim:</span>
                    <span>{formatDate(enrollment.dataFim)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEnrollments.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma matrícula encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "As matrículas aparecerão aqui conforme forem criadas"}
            </p>
          </CardContent>
        </Card>
      )}
      {/* Enrollment Modal */}
      <EnrollmentModal
        enrollment={selectedEnrollment}
        client={selectedEnrollment ? getClientById(selectedEnrollment.id_aluno) : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEnrollment(null);
        }}
        onUpdate={handleUpdateEnrollment}
        onDelete={handleDeleteEnrollment}
      />
    </div>
  );
};