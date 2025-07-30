import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || type !== 'recovery') {
        setIsValidToken(false);
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (error) {
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } catch (error) {
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Sua senha foi redefinida. Você será redirecionado para o login.',
      });

      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Link inválido</CardTitle>
              <CardDescription>
                O link de recuperação de senha é inválido ou expirou.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Portal do Promotor DMC</h1>
          <p className="text-muted-foreground">Redefinir senha</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;