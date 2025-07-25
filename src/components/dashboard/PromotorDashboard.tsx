import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, DollarSign, Car, UtensilsCrossed, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SolicitarAdiantamento from '@/components/forms/SolicitarAdiantamento';
import SolicitarReembolsoKm from '@/components/forms/SolicitarReembolsoKm';
import SolicitarValeRefeicao from '@/components/forms/SolicitarValeRefeicao';
import SolicitarAtestado from '@/components/forms/SolicitarAtestado';

interface Adiantamento {
  id: string;
  valor: number;
  data_solicitacao: string;
  status: string;
  observacoes?: string;
}

interface ReembolsoKm {
  id: string;
  km_rodados: number;
  valor_total: number;
  data: string;
  status: string;
}

interface ValeRefeicao {
  id: string;
  valor: number;
  data: string;
  status: string;
}

interface Atestado {
  id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  status: string;
  created_at: string;
}

const PromotorDashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const [adiantamentos, setAdiantamentos] = useState<Adiantamento[]>([]);
  const [reembolsos, setReembolsos] = useState<ReembolsoKm[]>([]);
  const [vales, setVales] = useState<ValeRefeicao[]>([]);
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdiantamento, setShowAdiantamento] = useState(false);
  const [showReembolso, setShowReembolso] = useState(false);
  const [showVale, setShowVale] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar adiantamentos
      const { data: adiantamentosData } = await supabase
        .from('adiantamentos')
        .select('*')
        .order('data_solicitacao', { ascending: false })
        .limit(5);

      // Carregar reembolsos
      const { data: reembolsosData } = await supabase
        .from('reembolsos_km')
        .select('*')
        .order('data', { ascending: false })
        .limit(5);

      // Carregar vales
      const { data: valesData } = await supabase
        .from('vale_refeicao')
        .select('*')
        .order('data', { ascending: false })
        .limit(5);

      setAdiantamentos(adiantamentosData || []);
      setReembolsos(reembolsosData || []);
      setVales(valesData || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularSaldoAdiantamentos = () => {
    return adiantamentos
      .filter(a => a.status === 'aprovado')
      .reduce((total, a) => total + a.valor, 0);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pendente: 'default',
      aprovado: 'default',
      recusado: 'destructive',
    };
    
    return (
      <Badge variant={colors[status as keyof typeof colors] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Portal do Promotor DMC</h1>
            <p className="text-muted-foreground">Bem-vindo, {profile?.nome_completo}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Adiantamentos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {calcularSaldoAdiantamentos().toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total aprovado disponível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {[...adiantamentos, ...reembolsos, ...vales].filter(item => item.status === 'pendente').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimos Reembolsos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {reembolsos
                  .filter(r => r.status === 'aprovado')
                  .slice(0, 3)
                  .reduce((total, r) => total + r.valor_total, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 3 aprovados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Solicite adiantamentos, reembolsos e vales refeição
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => setShowAdiantamento(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Solicitar Adiantamento
            </Button>
            <Button variant="outline" onClick={() => setShowReembolso(true)}>
              <Car className="mr-2 h-4 w-4" />
              Reembolso KM
            </Button>
            <Button variant="outline" onClick={() => setShowVale(true)}>
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Vale Refeição
            </Button>
          </CardContent>
        </Card>

        {/* Últimas Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>
              Histórico recente de solicitações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adiantamentos */}
            {adiantamentos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Adiantamentos</h4>
                <div className="space-y-2">
                  {adiantamentos.map((adiantamento) => (
                    <div key={adiantamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">R$ {adiantamento.valor.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(adiantamento.data_solicitacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(adiantamento.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adiantamentos.length > 0 && (reembolsos.length > 0 || vales.length > 0) && <Separator />}

            {/* Reembolsos */}
            {reembolsos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Reembolsos KM</h4>
                <div className="space-y-2">
                  {reembolsos.map((reembolso) => (
                    <div key={reembolso.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Car className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{reembolso.km_rodados} km - R$ {reembolso.valor_total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reembolso.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(reembolso.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(adiantamentos.length > 0 || reembolsos.length > 0) && vales.length > 0 && <Separator />}

            {/* Vales */}
            {vales.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Vales Refeição</h4>
                <div className="space-y-2">
                  {vales.map((vale) => (
                    <div key={vale.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">R$ {vale.valor.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(vale.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(vale.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adiantamentos.length === 0 && reembolsos.length === 0 && vales.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showAdiantamento && (
        <SolicitarAdiantamento
          open={showAdiantamento}
          onClose={() => setShowAdiantamento(false)}
          onSuccess={carregarDados}
        />
      )}
      {showReembolso && (
        <SolicitarReembolsoKm
          open={showReembolso}
          onClose={() => setShowReembolso(false)}
          onSuccess={carregarDados}
        />
      )}
      {showVale && (
        <SolicitarValeRefeicao
          open={showVale}
          onClose={() => setShowVale(false)}
          onSuccess={carregarDados}
        />
      )}
    </div>
  );
};

export default PromotorDashboard;