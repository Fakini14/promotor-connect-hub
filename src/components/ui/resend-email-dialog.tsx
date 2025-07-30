import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResendEmailDialog = ({ open, onOpenChange }: ResendEmailDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira seu email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Email reenviado!',
        description: 'Verifique sua caixa de entrada para confirmar sua conta.',
      });

      onOpenChange(false);
      setEmail('');
    } catch (error) {
      toast({
        title: 'Erro ao reenviar email',
        description: 'Não foi possível reenviar o email de confirmação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setEmail('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reenviar email de confirmação</DialogTitle>
          <DialogDescription>
            Digite seu email para receber novamente o link de confirmação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resend-email">Email</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reenviar email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResendEmailDialog;