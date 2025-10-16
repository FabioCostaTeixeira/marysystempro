import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import Logo from '@/assets/mary-personal-logo.jpg';
import { LogIn, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const LoginPage = () => {
  const { supabase } = useSupabaseData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [supabase, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Erro de Autenticação',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
    } else if (data.user?.user_metadata?.is_first_login) {
      setShowFirstLoginModal(true);
    } else if (data.user) {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando...',
      });
      
      const ADMIN_USER_ID = 'bfd00b65-1c6d-45c9-89bb-0a469dec7126';
      if (data.user.id === ADMIN_USER_ID) {
        navigate('/'); // Admin vai para o dashboard principal
      } else {
        navigate('/portal_aluno'); // Outros usuários vão para o portal do aluno
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="text-center">
          <img src={Logo} alt="Mary Personal Trainer Logo" className="w-24 h-24 mx-auto mb-4 rounded-full" />
          <CardTitle className="text-2xl font-bold">Mary Personal</CardTitle>
          <CardDescription className="font-handwriting text-lg text-muted-foreground">Você esta a um passo de sua melhor versão</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showFirstLoginModal} onOpenChange={setShowFirstLoginModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <ShieldAlert className="mr-2 text-yellow-500" />
              Primeiro Acesso Detectado
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para garantir a segurança da sua conta, você precisa definir uma nova senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/update-password')}>
              Definir Nova Senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};