import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";

interface Client {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  status: "Ativo" | "Inativo";
  foto: string;
  objetivos: string;
  genero: string;
  dataNascimento?: string;
  observacoesMedicas?: string;
  atestadoMedico?: string;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => void;
}

export const ClientForm = ({ isOpen, onClose, onSave }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    genero: '',
    dataNascimento: '',
    objetivos: '',
    observacoesMedicas: '',
    atestadoMedico: '',
    status: 'Ativo' as const,
    foto: '/placeholder.svg'
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando salvamento...');

    // Basic validation
    if (!formData.nome || !formData.telefone || !formData.email || !formData.genero || !formData.objetivos) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Dados a serem salvos:', formData);
      await onSave(formData);
      handleReset();
      onClose();
      
      toast({
        title: "Sucesso",
        description: "Novo aluno cadastrado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao chamar a API:', error);
      toast({
        title: "Erro no Cadastro",
        description: "Houve um problema ao salvar o aluno. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      genero: '',
      dataNascimento: '',
      objetivos: '',
      observacoesMedicas: '',
      atestadoMedico: '',
      status: 'Ativo',
      foto: '/placeholder.svg'
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cadastrar Novo Aluno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex justify-center">
            <ImageUploader
              currentImage={formData.foto}
              onImageChange={(imageUrl) => handleInputChange('foto', imageUrl)}
              altText="Foto do aluno"
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite o email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Gênero *</Label>
              <Select value={formData.genero} onValueChange={(value) => handleInputChange('genero', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "Ativo" | "Inativo") => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objetivos">Objetivos *</Label>
              <Textarea
                id="objetivos"
                value={formData.objetivos}
                onChange={(e) => handleInputChange('objetivos', e.target.value)}
                rows={3}
                placeholder="Descreva os objetivos do aluno..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoesMedicas">Observações Médicas</Label>
              <Textarea
                id="observacoesMedicas"
                value={formData.observacoesMedicas}
                onChange={(e) => handleInputChange('observacoesMedicas', e.target.value)}
                rows={3}
                placeholder="Observações médicas importantes (opcional)..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="atestadoMedico">Atestado Médico</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Input
                  id="atestadoMedico"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleInputChange('atestadoMedico', file.name);
                    }
                  }}
                  className="hidden"
                />
                <Label htmlFor="atestadoMedico" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-muted-foreground">
                      Clique para fazer upload do atestado médico
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Formatos aceitos: PDF, JPG, PNG (obrigatório para alunos acima de 40 anos)
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Cadastrar Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};