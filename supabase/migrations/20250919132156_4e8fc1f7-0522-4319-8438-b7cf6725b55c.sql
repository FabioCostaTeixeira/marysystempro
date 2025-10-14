-- Corrigir warning de segurança - definir search_path na função

-- 1. Dropar os triggers que dependem da função
DROP TRIGGER IF EXISTS update_alunos_updated_at ON public.alunos;
DROP TRIGGER IF EXISTS update_matriculas_updated_at ON public.matriculas;
DROP TRIGGER IF EXISTS update_mensalidades_updated_at ON public.mensalidades;

-- 2. Agora é seguro dropar a função
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 3. Recriar a função com as correções de segurança
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 4. Recriar os triggers
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
