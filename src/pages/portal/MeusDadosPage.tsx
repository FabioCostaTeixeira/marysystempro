import { useState, useEffect } from 'react';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { ClientProfile } from '@/pages/ClientProfile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const MeusDadosPage = () => {
  const { supabase, clients, loading: contextLoading } = useSupabaseData();
  const [foundClientId, setFoundClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetClient = async () => {
      // Ensure we have clients before proceeding
      if (clients.length === 0) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const foundClient = clients.find(c => c.user_id === user.id);
        if (foundClient) {
          setFoundClientId(foundClient.id);
        }
      }
      // Stop loading only after attempting to find the client
      setIsLoading(false);
    };

    // Run when context is done loading and clients are populated
    if (!contextLoading) {
      fetchAndSetClient();
    }
  }, [supabase, clients, contextLoading]);

  if (isLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (foundClientId) {
    return <ClientProfile clientId={foundClientId} />;
  }

  return (
    <div className="p-8">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
                Não foi possível encontrar os dados do seu perfil. Por favor, entre em contato com o suporte.
            </AlertDescription>
        </Alert>
    </div>
  );
};

export default MeusDadosPage;