import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client, Enrollment, MonthlyPayment, DashboardMetrics, Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SupabaseContextType {
  clients: Client[];
  enrollments: Enrollment[];
  payments: MonthlyPayment[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  // CRUD functions
  addClient: (clientData: Omit<Client, 'id'>) => Promise<any>;
  updateClient: (id: number, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addEnrollment: (enrollmentData: Omit<Enrollment, 'id'>) => Promise<any>;
  updateEnrollment: (id: number, enrollmentData: Partial<Enrollment>) => Promise<void>;
  deleteEnrollment: (id: number) => Promise<void>;
  markPaymentAsPaid: (paymentId: number) => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial data
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
        loadPayments()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do sistema');
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadAllData();
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar clientes:', error);
      throw error;
    }

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
      atestadoMedico: aluno.atestado_medico || undefined
    }));

    setClients(mappedClients);
  };

  const loadEnrollments = async () => {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar matrículas:', error);
      throw error;
    }

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
    const { data, error } = await supabase
      .from('mensalidades')
      .select('*')
      .order('data_vencimento', { ascending: true });

    if (error) {
      console.error('Erro ao carregar pagamentos:', error);
      throw error;
    }

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

  // CRUD Operations for Clients
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
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
          data_nascimento: clientData.dataNascimento || null,
          observacoes_medicas: clientData.observacoesMedicas || null,
          atestado_medico: clientData.atestadoMedico || null
        })
        .select()
        .single();

      if (error) throw error;

      await loadClients();
      toast({
        title: "Sucesso!",
        description: "Cliente adicionado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    try {
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
          data_nascimento: clientData.dataNascimento || null,
          observacoes_medicas: clientData.observacoesMedicas || null,
          atestado_medico: clientData.atestadoMedico || null
        })
        .eq('id', id);

      if (error) throw error;

      await loadClients();
      toast({
        title: "Sucesso!",
        description: "Cliente atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadClients();
      toast({
        title: "Sucesso!",
        description: "Cliente deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cliente",
        variant: "destructive",
      });
      throw error;
    }
  };

  // CRUD Operations for Enrollments
  const addEnrollment = async (enrollmentData: Omit<Enrollment, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('matriculas')
        .insert({
          id_aluno: enrollmentData.id_aluno,
          data_inicio: enrollmentData.dataInicio,
          tipo_treino: enrollmentData.tipoTreino,
          frequencia_semanal: enrollmentData.frequenciaSemanal,
          duracao_contrato_meses: enrollmentData.duracaoContratoMeses,
          valor_mensalidade: enrollmentData.valorMensalidade,
          recorrencia_pagamento: enrollmentData.recorrenciaPagamento,
          data_fim: enrollmentData.dataFim,
          status_matricula: enrollmentData.statusMatricula,
          observacao_alteracao: enrollmentData.observacaoAlteracao || null
        })
        .select()
        .single();

      if (error) throw error;

      // Generate payments for this enrollment
      await generatePaymentsForEnrollmentFunction(data.id, enrollmentData);
      
      await Promise.all([loadEnrollments(), loadPayments()]);
      
      toast({
        title: "Sucesso!",
        description: "Matrícula adicionada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar matrícula:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar matrícula",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEnrollment = async (id: number, enrollmentData: Partial<Enrollment>) => {
    try {
      const { error } = await supabase
        .from('matriculas')
        .update({
          id_aluno: enrollmentData.id_aluno,
          data_inicio: enrollmentData.dataInicio,
          tipo_treino: enrollmentData.tipoTreino,
          frequencia_semanal: enrollmentData.frequenciaSemanal,
          duracao_contrato_meses: enrollmentData.duracaoContratoMeses,
          valor_mensalidade: enrollmentData.valorMensalidade,
          recorrencia_pagamento: enrollmentData.recorrenciaPagamento,
          data_fim: enrollmentData.dataFim,
          status_matricula: enrollmentData.statusMatricula,
          observacao_alteracao: enrollmentData.observacaoAlteracao || null
        })
        .eq('id', id);

      if (error) throw error;

      await loadEnrollments();
      toast({
        title: "Sucesso!",
        description: "Matrícula atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar matrícula",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEnrollment = async (id: number) => {
    try {
      // Delete related payments first
      await supabase
        .from('mensalidades')
        .delete()
        .eq('id_matricula', id);

      // Delete enrollment
      const { error } = await supabase
        .from('matriculas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await Promise.all([loadEnrollments(), loadPayments()]);
      toast({
        title: "Sucesso!",
        description: "Matrícula deletada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar matrícula:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar matrícula",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generatePaymentsForEnrollmentFunction = async (enrollmentId: number, enrollment: Omit<Enrollment, 'id'>) => {
    const startDate = new Date(enrollment.dataInicio);
    
    // Calcular número de pagamentos e intervalo baseado na recorrência
    let paymentsToGenerate: number;
    let monthsInterval: number;
    
    switch (enrollment.recorrenciaPagamento) {
      case 'Mensal':
        paymentsToGenerate = enrollment.duracaoContratoMeses;
        monthsInterval = 1;
        break;
      case 'Trimestral':
        paymentsToGenerate = enrollment.duracaoContratoMeses / 3;
        monthsInterval = 3;
        break;
      case 'Semestral':
        paymentsToGenerate = enrollment.duracaoContratoMeses / 6;
        monthsInterval = 6;
        break;
      default:
        paymentsToGenerate = enrollment.duracaoContratoMeses;
        monthsInterval = 1;
    }
    
    const paymentsData = [];
    
    for (let i = 0; i < paymentsToGenerate; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i * monthsInterval));
      
      paymentsData.push({
        id_matricula: enrollmentId,
        valor: enrollment.valorMensalidade,
        data_vencimento: dueDate.toISOString().split('T')[0],
        status_pagamento: 'Pendente'
      });
    }

    const { error } = await supabase
      .from('mensalidades')
      .insert(paymentsData);

    if (error) {
      console.error('Erro ao gerar pagamentos:', error);
      throw error;
    }
  };

  const markPaymentAsPaid = async (paymentId: number) => {
    try {
      const { error } = await supabase
        .from('mensalidades')
        .update({
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId);

      if (error) throw error;

      await loadPayments();
      toast({
        title: "Sucesso!",
        description: "Pagamento marcado como pago",
      });
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar pagamento",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Utility functions
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getClientById = (id: number): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getEnrollmentsByClientId = (clientId: number): Enrollment[] => {
    return enrollments.filter(enrollment => enrollment.id_aluno === clientId);
  };

  const getPaymentsByEnrollmentId = (enrollmentId: number): MonthlyPayment[] => {
    return payments.filter(payment => payment.id_matricula === enrollmentId);
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const totalReceived = payments
      .filter(payment => payment.statusPagamento === "Pago")
      .reduce((sum, payment) => sum + payment.valor, 0);

    const totalPending = payments
      .filter(payment => payment.statusPagamento === "Pendente")
      .reduce((sum, payment) => sum + payment.valor, 0);

    const totalOverdue = payments
      .filter(payment => {
        if (payment.statusPagamento !== "Pendente") return false;
        const dueDate = new Date(payment.dataVencimento);
        return dueDate < new Date();
      })
      .reduce((sum, payment) => sum + payment.valor, 0);

    const activeClients = clients.filter(client => client.status === "Ativo").length;

    const newEnrollments = enrollments.filter(enrollment => {
      const enrollmentDate = new Date(enrollment.dataInicio);
      return enrollmentDate.getMonth() + 1 === currentMonth && 
             enrollmentDate.getFullYear() === currentYear;
    }).length;

    const medicalCertificatePending = clients.filter(client => {
      if (!client.dataNascimento || client.atestadoMedico) return false;
      return calculateAge(client.dataNascimento) > 40;
    }).length;

    return {
      totalReceived,
      totalPending,
      totalOverdue,
      activeClients,
      newEnrollments,
      monthlyGoal: 50000, // Meta fixa por enquanto
      medicalCertificatePending
    };
  };

  // Mock notification functions (can be expanded later)
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteSelectedNotifications = (ids: number[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  };

  // File upload for medical certificates
  const uploadMedicalCertificate = async (file: File, clientId: number): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('atestados-medicos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('atestados-medicos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  };

  const value: SupabaseContextType = {
    clients,
    enrollments,
    payments,
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