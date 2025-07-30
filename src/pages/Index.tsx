import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary">Carregando...</div>;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Portal do Promotor DMC</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sistema completo de gestão para promotores
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Acessar Sistema
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Gestão Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Controle total de adiantamentos, reembolsos e vales refeição em um só lugar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Para Promotores</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Interface simples e intuitiva para solicitações e acompanhamento de status.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Acompanhe métricas e relatórios em tempo real para melhor gestão.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
