-- Corrigir warning de segurança - recriar função com search_path correto
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

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

-- Recriar os triggers que foram removidos pelo CASCADE
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