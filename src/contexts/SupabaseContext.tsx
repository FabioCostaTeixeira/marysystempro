import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client, Enrollment, MonthlyPayment, Presence, DashboardMetrics, Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';

interface SupabaseContextType {
  supabase: typeof supabase;
  clients: Client[];
  enrollments: Enrollment[];
  payments: MonthlyPayment[];
  presences: Presence[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  addClient: (clientData: Omit<Client, 'id'>) => Promise<any>;
  updateClient: (id: number, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addEnrollment: (enrollmentData: Omit<Enrollment, 'id'>) => Promise<any>;
  updateEnrollment: (id: number, enrollmentData: Partial<Enrollment>) => Promise<void>;
  deleteEnrollment: (id: number) => Promise<void>;
  markPaymentAsPaid: (paymentId: number) => Promise<void>;
  upsertPresence: (presenceData: Omit<Presence, 'id'>) => Promise<void>;
  inviteClient: (aluno_id: number, email: string) => Promise<any>;
  markAllNotificationsAsRead: () => void;
  deleteSelectedNotifications: (ids: number[]) => void;
  calculateAge: (birthDate: string) => number;
  getClientById: (id: number) => Client | undefined;
  getEnrollmentsByClientId: (clientId: number) => Enrollment[];
  getPaymentsByEnrollmentId: (enrollmentId: number) => MonthlyPayment[];
  getDashboardMetrics: () => DashboardMetrics;
  uploadMedicalCertificate: (file: File, clientId: number) => Promise<string>;
  loadAllData: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabaseData = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).supabase = supabase;
    }
  }, [supabase]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        loadClients(),
        loadEnrollments(),
        loadPayments(),
        loadPresences()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do sistema');
      toast({ title: "Erro", description: "Erro ao carregar dados do sistema", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadAllData();
  };

  const loadClients = async () => {
    const { data, error } = await supabase.from('alunos').select('*').order('nome', { ascending: true });
    if (error) throw error;
    const mappedClients: Client[] = (data || []).map(aluno => ({
      id: aluno.id,
      nome: aluno.nome,
      telefone: aluno.telefone,
      email: aluno.email,
      status: aluno.status as "Ativo" | "Inativo",
      foto: aluno.foto || '',
      objetivos: aluno.objetivos,
      genero: aluno.genero,
      dataNascimento: aluno.data_nascimento || undefined,
      observacoesMedicas: aluno.observacoes_medicas || undefined,
      atestadoMedico: aluno.atestado_medico || undefined,
      user_id: aluno.user_id || null
    }));
    setClients(mappedClients);
  };

  const loadEnrollments = async () => {
    const { data, error } = await supabase.from('matriculas').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const mappedEnrollments: Enrollment[] = (data || []).map(matricula => ({
      id: matricula.id,
      id_aluno: matricula.id_aluno,
      dataInicio: matricula.data_inicio,
      tipoTreino: matricula.tipo_treino as "Online" | "Presencial",
      frequenciaSemanal: matricula.frequencia_semanal,
      duracaoContratoMeses: matricula.duracao_contrato_meses,
      valorMensalidade: Number(matricula.valor_mensalidade),
      recorrenciaPagamento: matricula.recorrencia_pagamento as "Mensal" | "Trimestral" | "Semestral",
      dataFim: matricula.data_fim,
      statusMatricula: matricula.status_matricula as "Ativa" | "Expirada" | "Cancelada",
      observacaoAlteracao: matricula.observacao_alteracao || undefined
    }));
    setEnrollments(mappedEnrollments);
  };

  const loadPayments = async () => {
    const { data, error } = await supabase.from('mensalidades').select('*').order('data_vencimento', { ascending: true });
    if (error) throw error;
    const mappedPayments: MonthlyPayment[] = (data || []).map(mensalidade => ({
      id: mensalidade.id,
      id_matricula: mensalidade.id_matricula,
      valor: Number(mensalidade.valor),
      dataVencimento: mensalidade.data_vencimento,
      dataPagamento: mensalidade.data_pagamento || undefined,
      statusPagamento: mensalidade.status_pagamento as "Pendente" | "Pago" | "Atrasado"
    }));
    setPayments(mappedPayments);
  };

  const loadPresences = async () => {
    const { data, error } = await supabase.from('presencas').select('*');
    if (error) throw error;
    setPresences(data || []);
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    const { data, error } = await supabase
      .from('alunos')
      .insert({
        nome: clientData.nome,
        telefone: clientData.telefone,
        email: clientData.email,
        status: clientData.status,
        foto: clientData.foto,
        objetivos: clientData.objetivos,
        genero: clientData.genero,
        data_nascimento: clientData.dataNascimento ? `${clientData.dataNascimento}T00:00:00` : null,
        observacoes_medicas: clientData.observacoesMedicas || null,
        atestado_medico: clientData.atestadoMedico || null
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
    await loadClients();
    return data;
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    const { error } = await supabase
      .from('alunos')
      .update({
        nome: clientData.nome,
        telefone: clientData.telefone,
        email: clientData.email,
        status: clientData.status,
        foto: clientData.foto,
        objetivos: clientData.objetivos,
        genero: clientData.genero,
        data_nascimento: clientData.dataNascimento ? `${clientData.dataNascimento}T00:00:00` : null,
        observacoes_medicas: clientData.observacoesMedicas || null,
        atestado_medico: clientData.atestadoMedico || null,
        user_id: clientData.user_id || null
      })
      .eq('id', id);
    if (error) throw error;
    await loadClients();
  };

  const deleteClient = async (id: number) => {
    const { error } = await supabase.from('alunos').delete().eq('id', id);
    if (error) throw error;
    await loadAllData();
  };

  const addEnrollment = async (enrollmentData: Omit<Enrollment, 'id'>) => {
    const dbData = {
      id_aluno: enrollmentData.id_aluno,
      data_inicio: `${enrollmentData.dataInicio}T00:00:00`,
      data_fim: `${enrollmentData.dataFim}T00:00:00`,
      tipo_treino: enrollmentData.tipoTreino,
      frequencia_semanal: enrollmentData.frequenciaSemanal,
      duracao_contrato_meses: enrollmentData.duracaoContratoMeses,
      valor_mensalidade: enrollmentData.valorMensalidade,
      recorrencia_pagamento: enrollmentData.recorrenciaPagamento,
      status_matricula: enrollmentData.statusMatricula,
      observacao_alteracao: enrollmentData.observacaoAlteracao || null
    };
    const { data, error } = await supabase.from('matriculas').insert(dbData).select().single();
    if (error) throw error;
    await generatePaymentsForEnrollmentFunction(data.id, enrollmentData);
    await Promise.all([loadEnrollments(), loadPayments()]);
    return data;
  };

  const updateEnrollment = async (id: number, enrollmentData: Partial<Enrollment>) => {
    try {
      const dbData = {
        id_aluno: enrollmentData.id_aluno,
        data_inicio: enrollmentData.dataInicio ? `${enrollmentData.dataInicio}T00:00:00` : undefined,
        data_fim: enrollmentData.dataFim ? `${enrollmentData.dataFim}T00:00:00` : undefined,
        tipo_treino: enrollmentData.tipoTreino,
        frequencia_semanal: enrollmentData.frequenciaSemanal,
        duracao_contrato_meses: enrollmentData.duracaoContratoMeses,
        valor_mensalidade: enrollmentData.valorMensalidade,
        recorrencia_pagamento: enrollmentData.recorrenciaPagamento,
        status_matricula: enrollmentData.statusMatricula,
        observacao_alteracao: enrollmentData.observacaoAlteracao || null
      };
      const { data, error } = await supabase.from('matriculas').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      toast({ title: "Sucesso!", description: "Matrícula atualizada com sucesso." });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error);
      toast({ title: "Erro", description: "Falha ao atualizar a matrícula.", variant: "destructive" });
      throw error;
    }
  };

  const deleteEnrollment = async (id: number) => {
    try {
      // Deleta as mensalidades relacionadas primeiro
      const { error: paymentError } = await supabase.from('mensalidades').delete().eq('id_matricula', id);
      if (paymentError) throw paymentError;

      // Deleta a matrícula
      const { error: enrollmentError } = await supabase.from('matriculas').delete().eq('id', id);
      if (enrollmentError) throw enrollmentError;

      await Promise.all([loadEnrollments(), loadPayments()]);
      toast({ title: "Sucesso!", description: "Matrícula e mensalidades relacionadas foram excluídas." });
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      toast({ title: "Erro", description: "Falha ao excluir a matrícula.", variant: "destructive" });
      throw error;
    }
  };

  const generatePaymentsForEnrollmentFunction = async (enrollmentId: number, enrollment: Omit<Enrollment, 'id'>) => {
    try {
      // Corrige o bug de fuso horário na data de início
      const startDate = new Date(`${enrollment.dataInicio}T00:00:00`);
      
      let paymentsToGenerate: number;
      let monthsInterval: number;
      
      switch (enrollment.recorrenciaPagamento) {
        case 'Trimestral':
          paymentsToGenerate = Math.floor(enrollment.duracaoContratoMeses / 3);
          monthsInterval = 3;
          break;
        case 'Semestral':
          paymentsToGenerate = Math.floor(enrollment.duracaoContratoMeses / 6);
          monthsInterval = 6;
          break;
        case 'Mensal':
        default:
          paymentsToGenerate = enrollment.duracaoContratoMeses;
          monthsInterval = 1;
      }
      
      if (paymentsToGenerate <= 0) return;

      const paymentsData = [];
      for (let i = 0; i < paymentsToGenerate; i++) {
        const dueDate = addMonths(startDate, i * monthsInterval);
        
        paymentsData.push({
          id_matricula: enrollmentId,
          valor: enrollment.valorMensalidade,
          data_vencimento: format(dueDate, 'yyyy-MM-dd'), // Formato correto para o DB
          status_pagamento: 'Pendente'
        });
      }

      const { error } = await supabase.from('mensalidades').insert(paymentsData);

      if (error) {
        console.error('Erro ao gerar pagamentos:', error);
        throw error;
      }
    } catch (error) {
      console.error('Falha crítica na geração de pagamentos:', error);
    }
  };

  const markPaymentAsPaid = async (paymentId: number) => {
    const { error } = await supabase.from('mensalidades').update({ status_pagamento: 'Pago', data_pagamento: format(new Date(), 'yyyy-MM-dd') }).eq('id', paymentId);
    if (error) throw error;
    await loadPayments();
  };

  const upsertPresence = async (presenceData: Omit<Presence, 'id'>) => {
    try {
      const { error } = await supabase
        .from('presencas')
        .upsert(presenceData, { onConflict: 'id_aluno, data_treino' });

      if (error) {
        throw error;
      }
      
      await loadPresences(); // Recarrega as presenças
      toast({ title: "Sucesso", description: "Frequência salva com sucesso!" });

    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar a frequência.", variant: "destructive" });
    }
  };
  const inviteClient = async (aluno_id: number, email: string) => {
    console.log('PASSO 3: Função inviteClient no contexto executada.');
    try {
      const { data, error } = await supabase.functions.invoke('invite-student', {
        body: { aluno_id, email },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ERRO AO CHAMAR A EDGE FUNCTION:', error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  };
  const calculateAge = (birthDate: string): number => { /* ... */ };
  const getClientById = (id: number): Client | undefined => clients.find(c => c.id === id);
  const getEnrollmentsByClientId = (clientId: number): Enrollment[] => enrollments.filter(e => e.id_aluno === clientId);
  const getPaymentsByEnrollmentId = (enrollmentId: number): MonthlyPayment[] => payments.filter(p => p.id_matricula === enrollmentId);
  const getDashboardMetrics = (): DashboardMetrics => { /* ... */ };
  const markAllNotificationsAsRead = () => { /* ... */ };
  const deleteSelectedNotifications = (ids: number[]) => { /* ... */ };
  const uploadMedicalCertificate = async (file: File, clientId: number): Promise<string> => { /* ... */ };

  const value: SupabaseContextType = {
    supabase,
    clients,
    enrollments,
    payments,
    presences,
    notifications,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    markPaymentAsPaid,
    upsertPresence,
    inviteClient,
    markAllNotificationsAsRead,
    deleteSelectedNotifications,
    calculateAge,
    getClientById,
    getEnrollmentsByClientId,
    getPaymentsByEnrollmentId,
    getDashboardMetrics,
    uploadMedicalCertificate,
    loadAllData,
    refresh
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};