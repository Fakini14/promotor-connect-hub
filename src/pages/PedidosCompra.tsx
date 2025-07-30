import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { MoneyInput } from '@/components/ui/money-input';
import { ArrowLeft, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/use-currency';

interface PedidoCompra {
  id: string;
  tipo_despesa: 'material_promocional' | 'transporte' | 'hospedagem' | 'alimentacao' | 'outros';
  descricao: string;
  valor_estimado?: number;
  valor_aprovado?: number;
  justificativa: string;
  urgencia: 'baixa' | 'media' | 'alta';
  data_necessidade?: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido';
  observacoes_admin?: string;
  created_at: string;
}

const PedidosCompra = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { format } = useCurrency();
  
  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo_despesa: '',
    descricao: '',
    valor_estimado: 0,
    justificativa: '',
    urgencia: 'media',
    data_necessidade: ''
  });

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('pedidos_compra')
        .select('*')
        .eq('promotor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitPedido = async () => {
    if (!profile?.id) return;
    if (!formData.tipo_despesa || !formData.descricao || !formData.justificativa) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('pedidos_compra')
        .insert({
          promotor_id: profile.id,
          tipo_despesa: formData.tipo_despesa,
          descricao: formData.descricao,
          valor_estimado: formData.valor_estimado || null,
          justificativa: formData.justificativa,
          urgencia: formData.urgencia,
          data_necessidade: formData.data_necessidade || null
        });

      if (error) throw error;

      toast({
        title: 'Pedido enviado',
        description: 'Seu pedido de compra foi enviado para análise.',
      });

      // Reset form
      setFormData({
        tipo_despesa: '',
        descricao: '',
        valor_estimado: 0,
        justificativa: '',
        urgencia: 'media',
        data_necessidade: ''
      });
      setShowForm(false);
      carregarPedidos();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o pedido.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      material_promocional: 'Material Promocional',
      transporte: 'Transporte',
      hospedagem: 'Hospedagem',
      alimentacao: 'Alimentação',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getUrgenciaColor = (urgencia: string) => {
    const colors = {
      baixa: 'text-green-600',
      media: 'text-yellow-600',
      alta: 'text-red-600'
    };
    return colors[urgencia as keyof typeof colors] || 'text-gray-600';
  };

  const getUrgenciaLabel = (urgencia: string) => {
    const labels = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta'
    };
    return labels[urgencia as keyof typeof labels] || urgencia;
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">Carregando pedidos...</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Pedidos de Compra</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Formulário de Novo Pedido */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Pedido de Compra</CardTitle>
              <CardDescription>
                Solicite aprovação para compras e despesas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_despesa">Tipo de Despesa</Label>
                  <Select
                    value={formData.tipo_despesa}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_despesa: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material_promocional">Material Promocional</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="hospedagem">Hospedagem</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgencia">Urgência</Label>
                  <Select
                    value={formData.urgencia}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgencia: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Item/Serviço</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva detalhadamente o que precisa ser comprado..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_estimado">Valor Estimado (opcional)</Label>
                  <MoneyInput
                    value={formData.valor_estimado}
                    onChange={(value) => setFormData(prev => ({ ...prev, valor_estimado: value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_necessidade">Data Necessária (opcional)</Label>
                  <Input
                    id="data_necessidade"
                    type="date"
                    value={formData.data_necessidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_necessidade: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  value={formData.justificativa}
                  onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
                  placeholder="Explique por que precisa desta compra, como será utilizada, etc..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={submitPedido}
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar Pedido'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Pedidos</CardTitle>
            <CardDescription>
              Histórico dos seus pedidos de compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Nenhum pedido encontrado"
                description="Você ainda não fez nenhum pedido de compra"
                action={{
                  label: "Fazer primeiro pedido",
                  onClick: () => setShowForm(true)
                }}
              />
            ) : (
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={pedido.status} />
                            <span className="text-sm font-medium text-gray-600">
                              {getTipoLabel(pedido.tipo_despesa)}
                            </span>
                            <div className={`flex items-center space-x-1 ${getUrgenciaColor(pedido.urgencia)}`}>
                              {pedido.urgencia === 'alta' && <AlertTriangle className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {getUrgenciaLabel(pedido.urgencia)}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {pedido.descricao}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <strong>Valor Estimado:</strong><br />
                              {pedido.valor_estimado ? format(pedido.valor_estimado) : 'Não informado'}
                            </div>
                            {pedido.valor_aprovado && (
                              <div>
                                <strong>Valor Aprovado:</strong><br />
                                <span className="text-green-600 font-semibold">
                                  {format(pedido.valor_aprovado)}
                                </span>
                              </div>
                            )}
                            <div>
                              <strong>Data Necessária:</strong><br />
                              {pedido.data_necessidade 
                                ? new Date(pedido.data_necessidade).toLocaleDateString('pt-BR')
                                : 'Não especificada'}
                            </div>
                          </div>

                          <div className="text-sm">
                            <strong>Justificativa:</strong><br />
                            <p className="text-gray-600 mt-1">{pedido.justificativa}</p>
                          </div>

                          {pedido.observacoes_admin && (
                            <div className="bg-yellow-50 p-3 rounded text-sm">
                              <strong>Observações do Admin:</strong><br />
                              {pedido.observacoes_admin}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Enviado em: {new Date(pedido.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PedidosCompra;