import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pendente' | 'aprovado' | 'recusado' | 'pago' | 'concluido' | 'urgente';
  className?: string;
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
  },
  aprovado: {
    label: 'Aprovado',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
  },
  recusado: {
    label: 'Recusado',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
  },
  pago: {
    label: 'Pago',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
  },
  concluido: {
    label: 'Concluído',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
  },
  urgente: {
    label: 'Urgente',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 animate-pulse'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}