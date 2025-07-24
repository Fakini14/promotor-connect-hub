import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Solicitacao {
  id: string;
  promotor_id: string;
  valor?: number;
  status: string;
  tipo: 'adiantamento' | 'reembolso_km' | 'vale_refeicao';
  data_solicitacao?: string;
  data?: string;
  km_rodados?: number;
  valor_total?: number;
  observacoes?: string;
  promotor?: {
    nome_completo: string;
    email: string;
  };
}

interface Promotor {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<Solicitacao[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar solicitações pendentes
      const [
        { data: adiantamentos },
        { data: reembolsos },
        { data: vales }
      ] = await Promise.all([
        supabase
          .from('adiantamentos')
          .select(`
            *,
            promotor:profiles(nome_completo, email)
          `)
          .eq('status', 'pendente')
          .order('data_solicitacao', { ascending: false }),
        
        supabase
          .from('reembolsos_km')
          .select(`
            *,
            promotor:profiles(nome_completo, email)
          `)
          .eq('status', 'pendente')
          .order('data', { ascending: false }),
        
        supabase
          .from('vale_refeicao')
          .select(`
            *,
            promotor:profiles(nome_completo, email)
          `)
          .eq('status', 'pendente')
          .order('data', { ascending: false })
      ]);

      const todasSolicitacoes: Solicitacao[] = [
        ...(adiantamentos?.map(a => ({ ...a, tipo: 'adiantamento' as const })) || []),
        ...(reembolsos?.map(r => ({ ...r, tipo: 'reembolso_km' as const })) || []),
        ...(vales?.map(v => ({ ...v, tipo: 'vale_refeicao' as const })) || [])
      ];

      setSolicitacoesPendentes(todasSolicitacoes);

      // Carregar promotores
      const { data: promotoresData } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'promotor')
        .order('nome_completo');

      setPromotores(promotoresData as Promotor[] || []);
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

  const aprovarSolicitacao = async (solicitacao: Solicitacao) => {
    try {
      const table = solicitacao.tipo === 'adiantamento' ? 'adiantamentos' :
                   solicitacao.tipo === 'reembolso_km' ? 'reembolsos_km' : 'vale_refeicao';

      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'aprovado',
          data_aprovacao: new Date().toISOString()
        })
        .eq('id', solicitacao.id);

      if (error) throw error;

      toast({
        title: 'Solicitação aprovada',
        description: 'A solicitação foi aprovada com sucesso.',
      });

      carregarDados();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const recusarSolicitacao = async (solicitacao: Solicitacao) => {
    try {
      const table = solicitacao.tipo === 'adiantamento' ? 'adiantamentos' :
                   solicitacao.tipo === 'reembolso_km' ? 'reembolsos_km' : 'vale_refeicao';

      const { error } = await supabase
        .from(table)
        .update({ status: 'recusado' })
        .eq('id', solicitacao.id);

      if (error) throw error;

      toast({
        title: 'Solicitação recusada',
        description: 'A solicitação foi recusada.',
        variant: 'destructive',
      });

      carregarDados();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível recusar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const togglePromotor = async (promotor: Promotor) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: !promotor.ativo })
        .eq('id', promotor.id);

      if (error) throw error;

      toast({
        title: promotor.ativo ? 'Promotor desativado' : 'Promotor ativado',
        description: `${promotor.nome_completo} foi ${promotor.ativo ? 'desativado' : 'ativado'}.`,
      });

      carregarDados();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do promotor.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const formatarTipo = (tipo: string) => {
    const tipos = {
      adiantamento: 'Adiantamento',
      reembolso_km: 'Reembolso KM',
      vale_refeicao: 'Vale Refeição'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatarValor = (solicitacao: Solicitacao) => {
    if (solicitacao.tipo === 'reembolso_km') {
      return `${solicitacao.km_rodados} km - R$ ${solicitacao.valor_total?.toFixed(2)}`;
    }
    return `R$ ${(solicitacao.valor || 0).toFixed(2)}`;
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
            <h1 className="text-2xl font-bold text-primary">Portal do Promotor DMC - Admin</h1>
            <p className="text-muted-foreground">Painel Administrativo - {profile?.nome_completo}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="solicitacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solicitacoes">
              Solicitações Pendentes ({solicitacoesPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="promotores">
              Promotores ({promotores.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="solicitacoes" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {solicitacoesPendentes.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    R$ {solicitacoesPendentes
                      .reduce((total, s) => total + (s.valor_total || s.valor), 0)
                      .toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor total pendente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promotores Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {promotores.filter(p => p.ativo).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De {promotores.length} total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Solicitações */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Pendentes</CardTitle>
                <CardDescription>
                  Revise e aprove as solicitações dos promotores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {solicitacoesPendentes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma solicitação pendente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {solicitacoesPendentes.map((solicitacao) => (
                      <div key={`${solicitacao.tipo}-${solicitacao.id}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {formatarTipo(solicitacao.tipo)}
                              </Badge>
                              <span className="font-medium">
                                {solicitacao.promotor?.nome_completo}
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-primary">
                              {formatarValor(solicitacao)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(solicitacao.data_solicitacao || solicitacao.data || '').toLocaleDateString('pt-BR')}
                            </p>
                            {solicitacao.observacoes && (
                              <p className="text-sm bg-muted p-2 rounded">
                                <strong>Observações:</strong> {solicitacao.observacoes}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => aprovarSolicitacao(solicitacao)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => recusarSolicitacao(solicitacao)}
                            >
                              Recusar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="promotores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Promotores</CardTitle>
                <CardDescription>
                  Gerencie os promotores cadastrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {promotores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum promotor cadastrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {promotores.map((promotor) => (
                      <div key={promotor.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{promotor.nome_completo}</h3>
                            <p className="text-sm text-muted-foreground">{promotor.email}</p>
                            {promotor.telefone && (
                              <p className="text-sm text-muted-foreground">{promotor.telefone}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={promotor.ativo ? 'default' : 'secondary'}>
                              {promotor.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePromotor(promotor)}
                            >
                              {promotor.ativo ? 'Desativar' : 'Ativar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;