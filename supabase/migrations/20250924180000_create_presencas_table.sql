-- Tabela de Frequência (Presenças)
CREATE TABLE public.presencas (
  id SERIAL PRIMARY KEY,
  id_aluno INTEGER NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_treino DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Presente', 'Ausente')),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (id_aluno, data_treino) -- Garante que só há um registro por aluno por dia
);

-- Índices para performance
CREATE INDEX idx_presencas_aluno_data ON public.presencas(id_aluno, data_treino);

-- Trigger para updated_at
CREATE TRIGGER update_presencas_updated_at
    BEFORE UPDATE ON public.presencas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow all operations on presencas" ON public.presencas
    FOR ALL USING (true) WITH CHECK (true);
