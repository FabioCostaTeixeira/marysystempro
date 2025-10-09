
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ProtectedRoute = () => {
  const { supabase } = useSupabaseData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificação síncrona imediata para links de recuperação/convite
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type=invite')) {
      navigate('/update-password', { replace: true });
      setLoading(false); // Interrompe o carregamento, pois já estamos redirecionando
      return; // Interrompe a execução do restante do efeito
    }

    // Lógica assíncrona para verificar a sessão se não for um link de recuperação
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      } 
      setLoading(false);
    };

    checkSession();

    // Listener para mudanças de estado de autenticação (ex: logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Adicionamos uma verificação para não redirecionar se ainda estivermos em um fluxo de recuperação
      if (!session && !window.location.hash.includes('type=recovery') && !window.location.hash.includes('type=invite')) {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return <Outlet />;
};
