import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Eye, Loader2 } from 'lucide-react';

interface Atestado {
  id: string;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  status: string;
  arquivo_url: string;
  created_at: string;
  promotor_id: string;
  profiles?: {
    nome_completo: string;
  };
}

interface AtestadoViewerProps {
  atestado: Atestado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
  onStatusChange?: () => void;
}

const AtestadoViewer = ({ 
  atestado, 
  open, 
  onOpenChange, 
  isAdmin = false,
  onStatusChange 
}: AtestadoViewerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'aprovado' | 'recusado' | null>(null);

  if (!atestado) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'default',
      aprovado: 'secondary',
      recusado: 'destructive'
    } as const;
    
    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      recusado: 'Recusado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.storage
        .from('atestados')
        .createSignedUrl(atestado.arquivo_url, 60);

      if (error) throw error;

      // Criar link temporário e fazer download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `atestado_${atestado.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao baixar arquivo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.storage
        .from('atestados')
        .createSignedUrl(atestado.arquivo_url, 60);

      if (error) throw error;

      setFileUrl(data.signedUrl);
      window.open(data.signedUrl, '_blank');

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao visualizar arquivo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (novoStatus: 'aprovado' | 'recusado') => {
    try {
      setActionLoading(novoStatus);
      
      const { error } = await supabase
        .from('atestados')
        .update({ 
          status: novoStatus,
          data_aprovacao: new Date().toISOString()
        })
        .eq('id', atestado.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Atestado ${novoStatus} com sucesso!`,
      });

      onStatusChange?.();
      onOpenChange(false);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Erro ao ${novoStatus} atestado.`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularDias = () => {
    const inicio = new Date(atestado.data_inicio);
    const fim = new Date(atestado.data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Atestado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isAdmin && atestado.profiles && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Promotor: {atestado.profiles.nome_completo}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
              <p className="text-sm">{formatDate(atestado.data_inicio)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Fim</label>
              <p className="text-sm">{formatDate(atestado.data_fim)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Período</label>
            <p className="text-sm">{calcularDias()} dia(s)</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Motivo</label>
            <p className="text-sm">{atestado.motivo}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {getStatusBadge(atestado.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Enviado em</label>
              <p className="text-sm">{formatDate(atestado.created_at)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleViewFile}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Visualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Baixar
              </Button>
            </div>
          </div>

          {isAdmin && atestado.status === 'pendente' && (
            <div className="border-t pt-4">
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleStatusChange('aprovado')}
                  disabled={actionLoading !== null}
                  className="flex-1"
                >
                  {actionLoading === 'aprovado' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Aprovar
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange('recusado')}
                  disabled={actionLoading !== null}
                  className="flex-1"
                >
                  {actionLoading === 'recusado' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Recusar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AtestadoViewer;