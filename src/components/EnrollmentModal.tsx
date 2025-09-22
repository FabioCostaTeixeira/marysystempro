import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Monitor, MapPin, DollarSign, Clock, Edit, Save, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { Enrollment, Client } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EnrollmentModalProps {
  enrollment: Enrollment | null;
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedEnrollment: Enrollment) => void;
  onDelete: (enrollmentId: number) => void;
}

export const EnrollmentModal = ({
  enrollment,
  client,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: EnrollmentModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Enrollment>>({});
  const [observacaoAlteracao, setObservacaoAlteracao] = useState("");

  const handleEdit = () => {
    if (enrollment) {
      setFormData(enrollment);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setObservacaoAlteracao("");
  };

  const handleSave = () => {
    if (!enrollment || !observacaoAlteracao.trim()) {
      alert("Por favor, preencha a observação da alteração.");
      return;
    }

    const updatedEnrollment = {
      ...enrollment,
      ...formData,
      observacaoAlteracao
    };

    onUpdate(updatedEnrollment);
    setIsEditing(false);
    setFormData({});
    setObservacaoAlteracao("");
  };

  const handleDelete = () => {
    if (enrollment) {
      onDelete(enrollment.id);
      onClose();
    }
  };

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

  if (!enrollment || !client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes da Matrícula - {client.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <Badge className={getStatusColor(enrollment.statusMatricula)}>
              {enrollment.statusMatricula}
            </Badge>
            <div className="text-sm text-muted-foreground">
              ID: {enrollment.id}
            </div>
          </div>

          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dataInicio || enrollment.dataInicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Calendar className="h-4 w-4" />
                  {formatDate(enrollment.dataInicio)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Calendar className="h-4 w-4" />
                {formatDate(enrollment.dataFim)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Treino</Label>
              {isEditing ? (
                <Select
                  value={formData.tipoTreino || enrollment.tipoTreino}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoTreino: value as "Online" | "Presencial" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  {enrollment.tipoTreino === "Online" ? 
                    <Monitor className="h-4 w-4" /> : 
                    <MapPin className="h-4 w-4" />
                  }
                  {enrollment.tipoTreino}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Frequência Semanal</Label>
              {isEditing ? (
                <Select
                  value={String(formData.frequenciaSemanal || enrollment.frequenciaSemanal)}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequenciaSemanal: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((freq) => (
                      <SelectItem key={freq} value={String(freq)}>
                        {freq}x por semana
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Clock className="h-4 w-4" />
                  {enrollment.frequenciaSemanal}x por semana
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Duração (meses)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  value={formData.duracaoContratoMeses || enrollment.duracaoContratoMeses}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracaoContratoMeses: Number(e.target.value) }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Calendar className="h-4 w-4" />
                  {enrollment.duracaoContratoMeses} meses
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Valor da Mensalidade</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorMensalidade || enrollment.valorMensalidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, valorMensalidade: Number(e.target.value) }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(enrollment.valorMensalidade)}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Recorrência de Pagamento</Label>
              {isEditing ? (
                <Select
                  value={formData.recorrenciaPagamento || enrollment.recorrenciaPagamento}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recorrenciaPagamento: value as "Mensal" | "Trimestral" | "Semestral" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Clock className="h-4 w-4" />
                  {enrollment.recorrenciaPagamento}
                </div>
              )}
            </div>
          </div>

          {/* Observação de Alteração - apenas no modo de edição */}
          {isEditing && (
            <div className="space-y-2">
              <Label>Observação da Alteração *</Label>
              <Textarea
                placeholder="Descreva o motivo da alteração..."
                value={observacaoAlteracao}
                onChange={(e) => setObservacaoAlteracao(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Última Observação */}
          {enrollment.observacaoAlteracao && (
            <div className="space-y-2">
              <Label>Última Alteração</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{enrollment.observacaoAlteracao}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você tem certeza que deseja excluir esta matrícula? Esta ação é irreversível 
                      e todas as mensalidades associadas também serão excluídas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};