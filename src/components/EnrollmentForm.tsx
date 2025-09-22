import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types";

interface EnrollmentFormProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (enrollment: {
    id_aluno: number;
    dataInicio: string;
    tipoTreino: "Online" | "Presencial";
    frequenciaSemanal: number;
    duracaoContratoMeses: number;
    valorMensalidade: number;
    recorrenciaPagamento: "Mensal" | "Trimestral" | "Semestral";
  }) => void;
}

export const EnrollmentForm = ({ client, isOpen, onClose, onSubmit }: EnrollmentFormProps) => {
  const [formData, setFormData] = useState({
    dataInicio: "",
    tipoTreino: "" as "Online" | "Presencial" | "",
    frequenciaSemanal: 1,
    duracaoContratoMeses: 1,
    valorMensalidade: 0,
    recorrenciaPagamento: "" as "Mensal" | "Trimestral" | "Semestral" | ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataInicio || !formData.tipoTreino || !formData.recorrenciaPagamento || formData.valorMensalidade <= 0) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      id_aluno: client.id,
      dataInicio: formData.dataInicio,
      tipoTreino: formData.tipoTreino,
      frequenciaSemanal: formData.frequenciaSemanal,
      duracaoContratoMeses: formData.duracaoContratoMeses,
      valorMensalidade: formData.valorMensalidade,
      recorrenciaPagamento: formData.recorrenciaPagamento
    });

    toast({
      title: "Matrícula realizada!",
      description: `Matrícula de ${client.nome} foi criada com sucesso. As mensalidades foram geradas automaticamente.`,
    });

    setFormData({
      dataInicio: "",
      tipoTreino: "",
      frequenciaSemanal: 1,
      duracaoContratoMeses: 1,
      valorMensalidade: 0,
      recorrenciaPagamento: ""
    });
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Nova Matrícula - {client.nome}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => handleInputChange('dataInicio', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoTreino">Tipo de Treino *</Label>
            <Select value={formData.tipoTreino} onValueChange={(value: "Online" | "Presencial") => handleInputChange('tipoTreino', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de treino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequenciaSemanal">Frequência Semanal *</Label>
              <Select value={formData.frequenciaSemanal.toString()} onValueChange={(value) => handleInputChange('frequenciaSemanal', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x por semana</SelectItem>
                  <SelectItem value="2">2x por semana</SelectItem>
                  <SelectItem value="3">3x por semana</SelectItem>
                  <SelectItem value="4">4x por semana</SelectItem>
                  <SelectItem value="5">5x por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracaoContrato">Duração (meses) *</Label>
              <Input
                id="duracaoContrato"
                type="number"
                min="1"
                max="24"
                value={formData.duracaoContratoMeses}
                onChange={(e) => handleInputChange('duracaoContratoMeses', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recorrenciaPagamento">Recorrência do Pagamento *</Label>
            <Select value={formData.recorrenciaPagamento} onValueChange={(value: "Mensal" | "Trimestral" | "Semestral") => handleInputChange('recorrenciaPagamento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mensal">Mensal</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Semestral">Semestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorMensalidade">Valor da Mensalidade (R$) *</Label>
            <Input
              id="valorMensalidade"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={formData.valorMensalidade || ''}
              onChange={(e) => handleInputChange('valorMensalidade', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Criar Matrícula
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};