import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SolicitarValeRefeicaoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SolicitarValeRefeicao = ({ open, onClose, onSuccess }: SolicitarValeRefeicaoProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valor = parseFloat(dados.valor);
      
      // Validate input values
      if (valor <= 0) {
        toast({
          title: 'Valor inválido',
          description: 'O valor deve ser maior que zero.',
          variant: 'destructive',
        });
        return;
      }
      
      if (valor > 1000) {
        toast({
          title: 'Valor muito alto',
          description: 'O valor máximo permitido é R$ 1.000,00.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('vale_refeicao')
        .insert({
          promotor_id: user?.id,
          valor: valor,
          data: dados.data,
          observacoes: dados.observacoes || null,
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: 'Seu pedido de vale refeição foi enviado para aprovação.',
      });

      setDados({ 
        valor: '', 
        data: new Date().toISOString().split('T')[0],
        observacoes: '' 
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Vale Refeição</DialogTitle>
          <DialogDescription>
            Informe o valor e a data do vale refeição.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              max="1000"
              placeholder="0,00"
              value={dados.valor}
              onChange={(e) => setDados({ ...dados, valor: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={dados.data}
              onChange={(e) => setDados({ ...dados, data: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações sobre o vale refeição..."
              value={dados.observacoes}
              onChange={(e) => setDados({ ...dados, observacoes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SolicitarValeRefeicao;