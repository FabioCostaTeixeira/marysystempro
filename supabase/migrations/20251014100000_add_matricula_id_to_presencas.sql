ALTER TABLE public.presencas
ADD COLUMN id_matricula INTEGER;

ALTER TABLE public.presencas
ADD CONSTRAINT fk_matricula
FOREIGN KEY (id_matricula)
REFERENCES public.matriculas(id)
ON DELETE SET NULL;

COMMENT ON COLUMN public.presencas.id_matricula IS 'Link to the specific enrollment for this presence record';