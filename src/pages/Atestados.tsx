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
import { UploadButton } from '@/components/ui/upload-button';
import { ArrowLeft, Plus, FileText, Calendar, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Atestado {
  id: string;
  tipo: 'medico' | 'comparecimento' | 'outros';
  data_inicio: string;
  data_fim: string;
  dias_afastamento: number;
  motivo?: string;
  cid?: string;
  medico_nome?: string;
  medico_crm?: string;
  arquivo_url?: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  observacoes_promotor?: string;
  observacoes_admin?: string;
  created_at: string;
}

const Atestados = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: '',
    data_inicio: '',
    data_fim: '',
    motivo: '',
    cid: '',
    medico_nome: '',
    medico_crm: '',
    observacoes_promotor: ''
  });
  const [arquivos, setArquivos] = useState<File[]>([]);

  useEffect(() => {
    carregarAtestados();
  }, []);

  const carregarAtestados = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('atestados')
        .select('*')
        .eq('promotor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAtestados(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os atestados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularDias = (inicio: string, fim: string): number => {
    if (!inicio || !fim) return 0;
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const uploadArquivo = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('atestados')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('atestados')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const submitAtestado = async () => {
    if (!profile?.id) return;
    if (!formData.tipo || !formData.data_inicio || !formData.data_fim || arquivos.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos e anexe o documento.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Upload do arquivo
      const arquivo_url = await uploadArquivo(arquivos[0]);

      // Inserir atestado
      const { error } = await supabase
        .from('atestados')
        .insert({
          promotor_id: profile.id,
          tipo: formData.tipo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          motivo: formData.motivo,
          cid: formData.cid,
          medico_nome: formData.medico_nome,
          medico_crm: formData.medico_crm,
          arquivo_url,
          observacoes_promotor: formData.observacoes_promotor
        });

      if (error) throw error;

      toast({
        title: 'Atestado enviado',
        description: 'Seu atestado foi enviado para análise.',
      });

      // Reset form
      setFormData({
        tipo: '',
        data_inicio: '',
        data_fim: '',
        motivo: '',
        cid: '',
        medico_nome: '',
        medico_crm: '',
        observacoes_promotor: ''
      });
      setArquivos([]);
      setShowForm(false);
      carregarAtestados();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o atestado.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      medico: 'Médico',
      comparecimento: 'Comparecimento',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">Carregando atestados...</div>
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
            <h1 className="text-2xl font-bold text-primary">Atestados</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Atestado
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Formulário de Novo Atestado */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Atestado</CardTitle>
              <CardDescription>
                Envie seu atestado médico ou de comparecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Atestado</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="comparecimento">Comparecimento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                    placeholder="Descrição do motivo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>
              </div>

              {formData.data_inicio && formData.data_fim && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Dias de afastamento:</strong> {calcularDias(formData.data_inicio, formData.data_fim)} dias
                  </p>
                </div>
              )}

              {formData.tipo === 'medico' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medico_nome">Nome do Médico</Label>
                      <Input
                        id="medico_nome"
                        value={formData.medico_nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, medico_nome: e.target.value }))}
                        placeholder="Dr. João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medico_crm">CRM</Label>
                      <Input
                        id="medico_crm"
                        value={formData.medico_crm}
                        onChange={(e) => setFormData(prev => ({ ...prev, medico_crm: e.target.value }))}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cid">CID (opcional)</Label>
                    <Input
                      id="cid"
                      value={formData.cid}
                      onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value }))}
                      placeholder="Ex: M25.3"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes_promotor}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes_promotor: e.target.value }))}
                  placeholder="Informações adicionais..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Documento do Atestado</Label>
                <UploadButton
                  onFilesChange={setArquivos}
                  accept="image/*,.pdf"
                  maxFiles={1}
                  maxSize={5}
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
                  onClick={submitAtestado}
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar Atestado'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Atestados */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Atestados</CardTitle>
            <CardDescription>
              Histórico dos seus atestados enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {atestados.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum atestado encontrado"
                description="Você ainda não enviou nenhum atestado"
                action={{
                  label: "Enviar primeiro atestado",
                  onClick: () => setShowForm(true)
                }}
              />
            ) : (
              <div className="space-y-4">
                {atestados.map((atestado) => (
                  <div key={atestado.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={atestado.status} />
                          <span className="text-sm font-medium text-gray-600">
                            {getTipoLabel(atestado.tipo)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <strong>Período:</strong><br />
                            {new Date(atestado.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                            {new Date(atestado.data_fim).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <strong>Dias:</strong><br />
                            {atestado.dias_afastamento} dias
                          </div>
                          <div>
                            <strong>Enviado em:</strong><br />
                            {new Date(atestado.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        {atestado.motivo && (
                          <div className="text-sm">
                            <strong>Motivo:</strong> {atestado.motivo}
                          </div>
                        )}

                        {atestado.medico_nome && (
                          <div className="text-sm">
                            <strong>Médico:</strong> {atestado.medico_nome}
                            {atestado.medico_crm && ` - CRM: ${atestado.medico_crm}`}
                          </div>
                        )}

                        {atestado.observacoes_admin && (
                          <div className="bg-yellow-50 p-2 rounded text-sm">
                            <strong>Observações do Admin:</strong> {atestado.observacoes_admin}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {atestado.arquivo_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(atestado.arquivo_url, '_blank')}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                          </Button>
                        )}
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

export default Atestados;