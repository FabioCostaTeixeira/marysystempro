import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Página Não Encontrada</h2>
      <p className="mt-2 text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;