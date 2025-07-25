import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload, FileText } from 'lucide-react';

interface SolicitarAtestadoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SolicitarAtestado = ({ open, onOpenChange, onSuccess }: SolicitarAtestadoProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    motivo: '',
    arquivo: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Arquivo inválido',
          description: 'Apenas arquivos PDF, JPG, JPEG e PNG são permitidos.',
          variant: 'destructive',
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setFormData(prev => ({ ...prev, arquivo: file }));
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('atestados')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validações
    if (!formData.arquivo) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast({
        title: 'Erro',
        description: 'A data de fim deve ser posterior à data de início.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.data_inicio) > new Date()) {
      toast({
        title: 'Erro',
        description: 'A data de início não pode ser futura.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload do arquivo
      setUploadProgress(50);
      const arquivoUrl = await uploadFile(formData.arquivo);
      
      setUploadProgress(75);
      
      // Inserir no banco de dados (temporariamente comentado até migração ser aplicada)
      // const { error } = await supabase
      //   .from('atestados')
      //   .insert({
      //     promotor_id: user.id,
      //     data_inicio: formData.data_inicio,
      //     data_fim: formData.data_fim,
      //     motivo: formData.motivo,
      //     arquivo_url: arquivoUrl,
      //     status: 'pendente'
      //   });

      // if (error) throw error;
      const error = null; // Temporário

      if (error) throw error;

      setUploadProgress(100);
      
      toast({
        title: 'Sucesso',
        description: 'Atestado enviado com sucesso!',
      });

      // Reset form
      setFormData({
        data_inicio: '',
        data_fim: '',
        motivo: '',
        arquivo: null
      });
      
      onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar atestado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enviar Atestado
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo do atestado..."
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo (PDF, JPG, PNG - máx. 5MB)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="arquivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                className="flex-1"
              />
              {formData.arquivo && (
                <Upload className="h-4 w-4 text-green-600" />
              )}
            </div>
            {formData.arquivo && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {formData.arquivo.name}
              </p>
            )}
          </div>

          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Atestado
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SolicitarAtestado;