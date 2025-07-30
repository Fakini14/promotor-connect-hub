import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PromotorDashboard from '@/components/dashboard/PromotorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Perfil não encontrado</CardTitle>
            <CardDescription>
              Seu usuário está autenticado, mas não foi encontrado um perfil no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.tipo_usuario === 'admin' ? (
        <AdminDashboard />
      ) : (
        <PromotorDashboard />
      )}
    </div>
  );
};

export default Dashboard;