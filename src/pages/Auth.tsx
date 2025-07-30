import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ForgotPasswordDialog from '@/components/ui/forgot-password-dialog';
import ResendEmailDialog from '@/components/ui/resend-email-dialog';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    nome_completo: '',
    tipo_usuario: 'promotor' as 'admin' | 'promotor',
  });

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao Portal do Promotor DMC!',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(
        signupData.email,
        signupData.password,
        signupData.nome_completo,
        signupData.tipo_usuario
      );
      
      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Verifique sua caixa de entrada e confirme seu email para acessar o sistema.',
        });
        // Limpar formulário após sucesso
        setSignupData({
          email: '',
          password: '',
          nome_completo: '',
          tipo_usuario: 'promotor',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Portal do Promotor DMC</h1>
          <p className="text-muted-foreground">Sistema de gestão para promotores</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua conta ou cadastre-se para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                  <div className="text-center mt-4 space-y-2">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                    <div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setShowResendEmail(true)}
                      >
                        Não recebeu o email de confirmação?
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupData.nome_completo}
                      onChange={(e) => setSignupData({ ...signupData, nome_completo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-tipo">Tipo de Usuário</Label>
                    <Select 
                      value={signupData.tipo_usuario} 
                      onValueChange={(value: 'admin' | 'promotor') => 
                        setSignupData({ ...signupData, tipo_usuario: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotor">Promotor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ForgotPasswordDialog 
          open={showForgotPassword} 
          onOpenChange={setShowForgotPassword} 
        />
        
        <ResendEmailDialog 
          open={showResendEmail} 
          onOpenChange={setShowResendEmail} 
        />
      </div>
    </div>
  );
};

export default Auth;