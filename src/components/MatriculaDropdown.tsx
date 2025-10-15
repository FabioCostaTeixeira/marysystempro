import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { Enrollment } from '@/types';

interface MatriculaDropdownProps {
  clientId: number;
  selectedValue: number | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  onActiveEnrollmentsLoad?: (enrollments: Enrollment[]) => void;
}

export const MatriculaDropdown = ({ clientId, selectedValue, onValueChange, disabled, error, onActiveEnrollmentsLoad }: MatriculaDropdownProps) => {
  const { enrollments, loading } = useSupabaseData();
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (enrollments.length > 0) {
      const clientActiveEnrollments = enrollments.filter(
        (e) => e.id_aluno === clientId && e.statusMatricula === 'Ativa'
      );
      setActiveEnrollments(clientActiveEnrollments);
      if (onActiveEnrollmentsLoad) {
        onActiveEnrollmentsLoad(clientActiveEnrollments);
      }
    }
  }, [clientId, enrollments, onActiveEnrollmentsLoad]);

  if (loading) {
    return <p>Carregando matrículas...</p>;
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedValue ? String(selectedValue) : ''}
        onValueChange={onValueChange}
        disabled={disabled || activeEnrollments.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma matrícula" />
        </SelectTrigger>
        <SelectContent>
          {activeEnrollments.length > 0 ? (
            activeEnrollments.map((enrollment) => (
              <SelectItem key={enrollment.id} value={String(enrollment.id)}>
                {`${enrollment.tipoTreino} - ${enrollment.frequenciaSemanal} vezes/semana`}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-enrollment" disabled>
              Nenhuma matrícula ativa encontrada
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};