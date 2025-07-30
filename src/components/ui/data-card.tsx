import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

const colorClasses = {
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-gray-600'
};

export function DataCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'primary',
  className,
  onClick
}: DataCardProps) {
  const isClickable = !!onClick;

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", colorClasses[color])} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold",
            colorClasses[color]
          )}>
            {value}
          </div>
          
          <div className="flex items-center space-x-2">
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}