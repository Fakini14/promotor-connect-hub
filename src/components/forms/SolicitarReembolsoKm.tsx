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

interface SolicitarReembolsoKmProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SolicitarReembolsoKm = ({ open, onClose, onSuccess }: SolicitarReembolsoKmProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    km_rodados: '',
    valor_por_km: '0.70',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
  });

  const calcularValorTotal = () => {
    const km = parseFloat(dados.km_rodados) || 0;
    const valorKm = parseFloat(dados.valor_por_km) || 0;
    return km * valorKm;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const kmRodados = parseFloat(dados.km_rodados);
      const valorPorKm = parseFloat(dados.valor_por_km);
      
      // Validate input values
      if (kmRodados <= 0) {
        toast({
          title: 'KM inválido',
          description: 'Os quilômetros devem ser maior que zero.',
          variant: 'destructive',
        });
        return;
      }
      
      if (kmRodados > 2000) {
        toast({
          title: 'KM muito alto',
          description: 'O máximo permitido é 2.000 km por solicitação.',
          variant: 'destructive',
        });
        return;
      }
      
      if (valorPorKm <= 0 || valorPorKm > 10) {
        toast({
          title: 'Valor por KM inválido',
          description: 'O valor por KM deve estar entre R$ 0,01 e R$ 10,00.',
          variant: 'destructive',
        });
        return;
      }
      
      const valorTotal = kmRodados * valorPorKm;
      
      const { error } = await supabase
        .from('reembolsos_km')
        .insert({
          promotor_id: user?.id,
          km_rodados: kmRodados,
          valor_por_km: valorPorKm,
          valor_total: valorTotal,
          data: dados.data,
          observacoes: dados.observacoes || null,
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: 'Seu pedido de reembolso de KM foi enviado para aprovação.',
      });

      setDados({ 
        km_rodados: '', 
        valor_por_km: '0.70', 
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
          <DialogTitle>Solicitar Reembolso de KM</DialogTitle>
          <DialogDescription>
            Informe os quilômetros rodados para calcular o reembolso.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="km_rodados">Quilômetros Rodados</Label>
            <Input
              id="km_rodados"
              type="number"
              step="0.1"
              min="0.1"
              max="2000"
              placeholder="0.0"
              value={dados.km_rodados}
              onChange={(e) => setDados({ ...dados, km_rodados: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valor_por_km">Valor por KM (R$)</Label>
            <Input
              id="valor_por_km"
              type="number"
              step="0.01"
              min="0.01"
              max="10"
              value={dados.valor_por_km}
              onChange={(e) => setDados({ ...dados, valor_por_km: e.target.value })}
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
          
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm font-medium">
              Valor Total: R$ {calcularValorTotal().toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações sobre o reembolso..."
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

export default SolicitarReembolsoKm;