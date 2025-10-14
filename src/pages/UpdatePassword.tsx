import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/contexts/SupabaseContext';
import { Save } from 'lucide-react';
import Logo from '@/assets/mary-personal-logo.jpg';

export const UpdatePasswordPage = () => {
  const { supabase } = useSupabaseData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca o e-mail do usuário para o autocomplete, já que a página só é acessível com uma sessão (mesmo que temporária).
  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      }
    };
    getUserEmail();
  }, [supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
        toast({
          title: 'Senha muito curta',
          description: 'A senha deve ter no mínimo 6 caracteres.',
          variant: 'destructive',
        });
        return;
      }

    setLoading(true);

    try {
      // Atualiza a senha e o metadado is_first_login em uma única chamada
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { is_first_login: false },
      });
      setLoading(false);

      if (error) {
        throw error; // Joga o erro para ser pego pelo catch
      }

      toast({
        title: 'Sucesso!',
        description: 'Sua senha foi definida com sucesso! Faça o login com sua nova credencial.',
      });
      await supabase.auth.signOut();
      navigate('/login');

    } catch (error: any) {
      setLoading(false);
      console.error('ERRO DETALHADO AO ATUALIZAR A SENHA:', error);
      toast({
        title: 'Erro ao Atualizar Senha',
        description: error.message || 'Não foi possível redefinir sua senha. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardHeader className="text-center">
              <img src={Logo} alt="Mary Personal Trainer Logo" className="w-24 h-24 mx-auto mb-4 rounded-full" />
              <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
              <CardDescription className="font-handwriting text-lg text-muted-foreground">Você esta a um passo de sua melhor versão</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <input type="hidden" autoComplete="username" value={email} readOnly />
                <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                    id="new-password"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                </Button>
            </form>
            </CardContent>
        </Card>
    </div>
  );
};
