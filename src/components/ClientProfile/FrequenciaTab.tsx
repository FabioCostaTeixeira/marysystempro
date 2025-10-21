import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { Presence } from "@/types";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FrequenciaModal } from '@/components/FrequenciaModal';
import { Plus } from 'lucide-react';

interface FrequenciaTabProps {
  clientId: number;
  isPortalView?: boolean;
}

export const FrequenciaTab = ({ clientId, isPortalView }: FrequenciaTabProps) => {
  const { presences, getClientById } = useSupabaseData();
  const [month, setMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState<Presence | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);

  const client = useMemo(() => getClientById(clientId), [clientId, getClientById]);

  const clientPresences = useMemo(() => {
    return presences.filter(p => p.id_aluno === clientId);
  }, [presences, clientId]);

  const sortedPresences = useMemo(() => {
    return [...clientPresences].sort((a, b) => parseISO(b.data_treino).getTime() - parseISO(a.data_treino).getTime());
  }, [clientPresences]);

  const summaryMetrics = useMemo(() => {
    const currentMonthPresences = clientPresences.filter(p => {
      const pDate = parseISO(p.data_treino);
      return pDate.getFullYear() === month.getFullYear() && pDate.getMonth() === month.getMonth() && p.status === 'Presente';
    }).length;

    const currentMonthAbsences = clientPresences.filter(p => {
      const pDate = parseISO(p.data_treino);
      return pDate.getFullYear() === month.getFullYear() && pDate.getMonth() === month.getMonth() && p.status === 'Ausente';
    }).length;

    const totalPresences = clientPresences.filter(p => p.status === 'Presente').length;
    const totalAbsences = clientPresences.filter(p => p.status === 'Ausente').length;
    const totalRecords = totalPresences + totalAbsences;
    const attendancePercentage = totalRecords > 0 ? (totalPresences / totalRecords) * 100 : 0;

    return {
      currentMonthPresences,
      currentMonthAbsences,
      attendancePercentage
    };
  }, [clientPresences, month]);

  const presentDays = useMemo(() => {
    return clientPresences.filter(p => p.status === 'Presente').map(p => parseISO(p.data_treino));
  }, [clientPresences]);

  const absentDays = useMemo(() => {
    return clientPresences.filter(p => p.status === 'Ausente').map(p => parseISO(p.data_treino));
  }, [clientPresences]);

  const handleDayClick = (day: Date) => {
    const existingPresence = clientPresences.find(p => format(parseISO(p.data_treino), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    setSelectedPresence(existingPresence || null);
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleAddFrequencyClick = () => {
    setSelectedPresence(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleRowClick = (observationText: string) => {
    setSelectedObservation(observationText);
    setIsObservationModalOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Controle de Frequência</CardTitle>
        {!isPortalView && (
          <Button onClick={handleAddFrequencyClick}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Frequência
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-center sm:text-left">Resumo de Frequência</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Presenças no Mês</p>
              <p className="text-2xl font-bold text-success">{summaryMetrics.currentMonthPresences}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faltas no Mês</p>
              <p className="text-2xl font-bold text-destructive">{summaryMetrics.currentMonthAbsences}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Frequência (Geral)</p>
              <p className="text-2xl font-bold text-primary">{summaryMetrics.attendancePercentage.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onDayClick={handleDayClick}
              locale={ptBR}
              className="rounded-md border w-full shadow-card"
              modifiers={{ present: presentDays, absent: absentDays }}
              modifiersStyles={{
                present: { color: '#16a34a', backgroundColor: '#dcfce7' },
                absent: { color: '#dc2626', backgroundColor: '#fee2e2' },
              }}
            />
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Legenda do Calendário:</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-[#dcfce7] border border-[#16a34a]"></div><span className="text-sm">Presente</span></div>
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-[#fee2e2] border border-[#dc2626]"></div><span className="text-sm">Ausente</span></div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <h4 className="text-lg font-semibold p-4 border-b">Histórico de Frequência</h4>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Dia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPresences.length > 0 ? (
                    sortedPresences.map(p => (
                      <TableRow 
                        key={p.id} 
                        className={p.observacao ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={p.observacao ? () => handleRowClick(p.observacao!) : undefined}
                      >
                        <TableCell>{format(parseISO(p.data_treino), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(parseISO(p.data_treino), 'E', { locale: ptBR })}</TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell className="text-center">
                          <span className={p.observacao ? 'font-bold text-primary' : 'text-muted-foreground'}>
                            {p.observacao ? 'Sim' : 'Não'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Nenhum registro de frequência.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>

      {isModalOpen && (
        <FrequenciaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clientId={clientId}
          presence={selectedPresence}
          date={selectedDate}
        />
      )}

      {/* Modal para exibir observação */}
      <Dialog open={isObservationModalOpen} onOpenChange={setIsObservationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observação do Treino</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {selectedObservation}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
