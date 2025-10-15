import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { Presence, Enrollment } from '@/types';
import { MatriculaDropdown } from './MatriculaDropdown';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FrequenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  presence?: Presence | null; // For editing
  date: Date; // Pre-filled date from calendar
}

export const FrequenciaModal = ({ isOpen, onClose, clientId, presence, date }: FrequenciaModalProps) => {
  const { upsertPresence } = useSupabaseData();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Presence>>({
    id_aluno: clientId,
    data_treino: format(date, 'yyyy-MM-dd'),
    status: 'Presente',
    id_matricula: undefined,
    observacao: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (presence) {
      setFormData({
        ...presence,
        data_treino: format(new Date(presence.data_treino), 'yyyy-MM-dd'),
      });
    } else {
      setFormData({
        id_aluno: clientId,
        data_treino: format(date, 'yyyy-MM-dd'),
        status: 'Presente',
        id_matricula: undefined,
        observacao: '',
      });
    }
  }, [presence, date, clientId]);

  useEffect(() => {
    if (activeEnrollments.length > 0 && !formData.id_matricula) {
      handleInputChange('id_matricula', activeEnrollments[0].id);
    }
  }, [activeEnrollments, formData.id_matricula]);

  const handleInputChange = (field: keyof Presence, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.id_matricula) {
      setError('A seleção da matrícula é obrigatória.');
      return;
    }
    setError(null);

    try {
      await upsertPresence(formData as Omit<Presence, 'id'>);
      toast({ title: 'Sucesso', description: 'Frequência salva com sucesso!' });
      onClose();
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a frequência.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{presence ? 'Editar' : 'Registrar'} Frequência</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data_treino">Data do Treino</Label>
            <Input id="data_treino" type="date" value={formData.data_treino} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Presente">Presente</SelectItem>
                <SelectItem value="Ausente">Ausente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_matricula">Matrícula</Label>
            <MatriculaDropdown
              clientId={clientId}
              selectedValue={formData.id_matricula}
              onValueChange={(value) => handleInputChange('id_matricula', parseInt(value, 10))}
              error={error || undefined}
              onActiveEnrollmentsLoad={setActiveEnrollments}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao || ''}
              onChange={(e) => handleInputChange('observacao', e.target.value)}
              placeholder="Adicione uma observação..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};