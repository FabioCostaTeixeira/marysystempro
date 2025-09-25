export interface Client {
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

export interface Enrollment {
  id: number;
  id_aluno: number;
  dataInicio: string;
  tipoTreino: "Online" | "Presencial";
  frequenciaSemanal: number;
  duracaoContratoMeses: number;
  valorMensalidade: number;
  recorrenciaPagamento: "Mensal" | "Trimestral" | "Semestral";
  dataFim: string;
  statusMatricula: "Ativa" | "Expirada" | "Cancelada";
  observacaoAlteracao?: string;
}

export interface MonthlyPayment {
  id: number;
  id_matricula: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  statusPagamento: "Pendente" | "Pago" | "Atrasado";
}

export interface Presence {
  id?: number;
  id_aluno: number;
  data_treino: string; // ISO date string
  status: 'Presente' | 'Ausente';
  observacao?: string;
}

export interface DashboardMetrics {
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  activeClients: number;
  newEnrollments: number;
  monthlyGoal: number;
  medicalCertificatePending: number;
}

export interface Notification {
  id: number;
  type: "overdue" | "expiring" | "medical_certificate";
  message: string;
  clientId?: number;
  enrollmentId?: number;
  date: string;
  read: boolean;
}