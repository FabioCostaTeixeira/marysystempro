import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Save, X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { useRealSupabaseData } from "@/hooks/useRealSupabaseData";

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
}

interface ClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  onDelete: (clientId: number) => void;
}

export const ClientModal = ({ client, isOpen, onClose, onUpdate, onDelete }: ClientModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const { toast } = useToast();
  const { addEnrollment } = useRealSupabaseData();

  const handleEdit = () => {
    setEditedClient({ ...client! });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedClient) {
      onUpdate(editedClient);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Dados do aluno atualizados com sucesso!",
      });
    }
  };

  const handleCancel = () => {
    setEditedClient(null);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (client) {
      onDelete(client.id);
      onClose();
      toast({
        title: "Aluno excluído",
        description: "O aluno foi removido permanentemente do sistema.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient({ ...editedClient, [field]: value });
    }
  };

  if (!client) return null;

  const displayClient = isEditing ? editedClient! : client;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? "Editar Aluno" : "Detalhes do Aluno"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            {isEditing ? (
              <ImageUploader
                currentImage={displayClient.foto}
                onImageChange={(imageUrl) => handleInputChange('foto', imageUrl)}
                altText={displayClient.nome}
                className="flex-shrink-0"
              />
            ) : (
              <Avatar className="h-20 w-20">
                <AvatarImage src={displayClient.foto} alt={displayClient.nome} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {displayClient.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={displayClient.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="text-xl font-semibold"
                />
              ) : (
                <h3 className="text-xl font-semibold">{displayClient.nome}</h3>
              )}
              <Badge 
                variant={displayClient.status === "Ativo" ? "default" : "secondary"}
                className={displayClient.status === "Ativo" ? "bg-success text-success-foreground" : ""}
              >
                {displayClient.status}
              </Badge>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="telefone"
                  value={displayClient.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">{displayClient.telefone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={displayClient.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">{displayClient.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              {isEditing ? (
                <Select value={displayClient.genero} onValueChange={(value) => handleInputChange('genero', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 bg-muted rounded-md">{displayClient.genero}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              {isEditing ? (
                <Input
                  id="dataNascimento"
                  type="date"
                  value={displayClient.dataNascimento || ''}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md">
                  {displayClient.dataNascimento ? new Date(displayClient.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select value={displayClient.status} onValueChange={(value: "Ativo" | "Inativo") => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 bg-muted rounded-md">{displayClient.status}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivos">Objetivos</Label>
            {isEditing ? (
              <Textarea
                id="objetivos"
                value={displayClient.objetivos}
                onChange={(e) => handleInputChange('objetivos', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="p-3 bg-muted rounded-md min-h-[80px]">{displayClient.objetivos}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoesMedicas">Observações Médicas</Label>
            {isEditing ? (
              <Textarea
                id="observacoesMedicas"
                value={displayClient.observacoesMedicas || ''}
                onChange={(e) => handleInputChange('observacoesMedicas', e.target.value)}
                rows={3}
                placeholder="Observações médicas importantes..."
              />
            ) : (
              <p className="p-3 bg-muted rounded-md min-h-[80px]">
                {displayClient.observacoesMedicas || 'Nenhuma observação médica registrada'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {!isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Aluno
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      Você tem certeza que deseja excluir este aluno? 
                      <br /><br />
                      <strong>Esta ação é irreversível</strong> e todos os dados, incluindo matrículas e histórico de pagamentos, serão permanentemente apagados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit} className="gradient-primary text-primary-foreground">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Dados
                </Button>
                <Button 
                  onClick={() => setShowEnrollmentForm(true)} 
                  className="gradient-secondary text-secondary-foreground ml-2"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Nova Matrícula
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {client && (
      <EnrollmentForm
        client={client}
        isOpen={showEnrollmentForm}
        onClose={() => setShowEnrollmentForm(false)}
        onSubmit={(enrollmentData) => {
          const startDate = new Date(enrollmentData.dataInicio);
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + enrollmentData.duracaoContratoMeses);
          
          const completeEnrollmentData = {
            ...enrollmentData,
            dataFim: endDate.toISOString().split('T')[0],
            statusMatricula: "Ativa" as const
          };
          addEnrollment(completeEnrollmentData);
          setShowEnrollmentForm(false);
        }}
      />
    )}
  </>
  );
};