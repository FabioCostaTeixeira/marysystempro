-- Criar tabelas baseadas nas interfaces TypeScript existentes

-- Tabela de alunos (baseada na interface Client)
CREATE TABLE public.alunos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
  foto TEXT,
  objetivos TEXT NOT NULL,
  genero TEXT NOT NULL,
  data_nascimento DATE,
  observacoes_medicas TEXT,
  atestado_medico TEXT, -- URL do arquivo no Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de matrículas (baseada na interface Enrollment)
CREATE TABLE public.matriculas (
  id SERIAL PRIMARY KEY,
  id_aluno INTEGER NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  tipo_treino TEXT NOT NULL CHECK (tipo_treino IN ('Online', 'Presencial')),
  frequencia_semanal INTEGER NOT NULL CHECK (frequencia_semanal > 0),
  duracao_contrato_meses INTEGER NOT NULL CHECK (duracao_contrato_meses > 0),
  valor_mensalidade DECIMAL(10,2) NOT NULL CHECK (valor_mensalidade > 0),
  recorrencia_pagamento TEXT NOT NULL CHECK (recorrencia_pagamento IN ('Mensal', 'Trimestral', 'Semestral')),
  data_fim DATE NOT NULL,
  status_matricula TEXT NOT NULL CHECK (status_matricula IN ('Ativa', 'Expirada', 'Cancelada')) DEFAULT 'Ativa',
  observacao_alteracao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensalidades (baseada na interface MonthlyPayment)
CREATE TABLE public.mensalidades (
  id SERIAL PRIMARY KEY,
  id_matricula INTEGER NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status_pagamento TEXT NOT NULL CHECK (status_pagamento IN ('Pendente', 'Pago', 'Atrasado')) DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_matriculas_aluno ON public.matriculas(id_aluno);
CREATE INDEX idx_mensalidades_matricula ON public.mensalidades(id_matricula);
CREATE INDEX idx_mensalidades_status ON public.mensalidades(status_pagamento);
CREATE INDEX idx_mensalidades_vencimento ON public.mensalidades(data_vencimento);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_alunos_updated_at
    BEFORE UPDATE ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
    BEFORE UPDATE ON public.matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mensalidades_updated_at
    BEFORE UPDATE ON public.mensalidades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo por enquanto - ajustar quando implementar auth)
CREATE POLICY "Allow all operations on alunos" ON public.alunos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on matriculas" ON public.matriculas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mensalidades" ON public.mensalidades
    FOR ALL USING (true) WITH CHECK (true);
