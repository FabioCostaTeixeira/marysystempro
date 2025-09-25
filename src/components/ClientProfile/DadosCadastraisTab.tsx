import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Save, X, Upload, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { Client } from "@/types";

interface DadosCadastraisTabProps {
  client: Client;
  onUpdate: (client: Client) => void;
  onDelete: (clientId: number) => void;
  needsMedicalCertificate: boolean;
}

export const DadosCadastraisTab = memo(({ 
  client, 
  onUpdate, 
  onDelete, 
  needsMedicalCertificate 
}: DadosCadastraisTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client>(client);
  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
  const { toast } = useToast();

  const handleEdit = () => {
    setEditedClient({ ...client });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editedClient);
    setIsEditing(false);
    toast({
      title: "Sucesso",
      description: "Dados do aluno atualizados com sucesso!",
    });
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(client.id);
    toast({
      title: "Aluno excluído",
      description: "O aluno foi removido permanentemente do sistema.",
      variant: "destructive",
    });
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    setEditedClient({ ...editedClient, [field]: value });
  };

  const handleMedicalCertificateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF, JPG ou PNG.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setMedicalCertificate(file);
    handleInputChange('atestadoMedico', file.name);
    toast({
      title: "Sucesso",
      description: "Atestado médico carregado com sucesso!",
    });
  };

  const handleRemoveMedicalCertificate = () => {
    setMedicalCertificate(null);
    handleInputChange('atestadoMedico', '');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to treat the date as local, avoiding timezone shifts.
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('pt-BR');
  };

  const displayClient = isEditing ? editedClient : client;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Dados Cadastrais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing && (
          <div className="mb-6">
            <ImageUploader
              currentImage={displayClient.foto}
              onImageChange={(imageUrl) => handleInputChange('foto', imageUrl)}
              altText={displayClient.nome}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            {isEditing ? (
              <Input
                id="nome"
                value={displayClient.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
              />
            ) : (
              <p className="p-2 bg-muted rounded-md">{displayClient.nome}</p>
            )}
          </div>

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
                {displayClient.dataNascimento ? formatDate(displayClient.dataNascimento) : 'Não informado'}
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

        {/* Medical Certificate Upload */}
        <div className="space-y-2">
          <Label>Atestado Médico</Label>
          {displayClient.atestadoMedico ? (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">{displayClient.atestadoMedico}</span>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveMedicalCertificate}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-md text-center">
              {isEditing ? (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleMedicalCertificateUpload}
                    className="hidden"
                    id="medical-certificate"
                  />
                  <label htmlFor="medical-certificate">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Atestado Médico (.pdf, .jpg, .png)
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum atestado médico enviado</p>
              )}
            </div>
          )}
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
              <Button onClick={handleEdit} className="gradient-primary text-primary-foreground">
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DadosCadastraisTab.displayName = "DadosCadastraisTab";