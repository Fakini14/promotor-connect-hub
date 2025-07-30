import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalCardProps {
  title: string;
  subtitle?: string;
  value: string;
  date: string;
  status?: 'pendente' | 'aprovado' | 'recusado';
  type: string;
  description?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onComment?: () => void;
  className?: string;
  loading?: boolean;
}

export function ApprovalCard({
  title,
  subtitle,
  value,
  date,
  status = 'pendente',
  type,
  description,
  onApprove,
  onReject,
  onComment,
  className,
  loading = false
}: ApprovalCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <StatusBadge status={status} />
              <span className="text-sm font-medium text-gray-600">{type}</span>
            </div>

            {/* Title and Subtitle */}
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>

            {/* Value */}
            <div className="text-lg font-bold text-primary">
              {value}
            </div>

            {/* Date */}
            <p className="text-xs text-gray-500">{date}</p>

            {/* Description */}
            {description && (
              <div className="bg-gray-50 p-2 rounded text-sm">
                <strong>Observações:</strong> {description}
              </div>
            )}
          </div>

          {/* Actions */}
          {status === 'pendente' && (
            <div className="flex flex-col space-y-2 ml-4">
              {onApprove && (
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={loading}
                  className="min-w-[80px]"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Aprovar
                </Button>
              )}
              
              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onReject}
                  disabled={loading}
                  className="min-w-[80px]"
                >
                  <X className="mr-1 h-4 w-4" />
                  Recusar
                </Button>
              )}
              
              {onComment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onComment}
                  disabled={loading}
                  className="min-w-[80px]"
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Comentar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}