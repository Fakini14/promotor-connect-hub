import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
  max?: number;
  children?: React.ReactNode;
}

export function NotificationBadge({
  count,
  className,
  showZero = false,
  max = 99,
  children
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = count > 0 || showZero;

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      {children}
      <Badge
        className={cn(
          "absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center",
          "bg-red-500 text-white text-xs font-bold px-1.5 py-0.5",
          "animate-pulse hover:animate-none",
          "border-2 border-white shadow-sm",
          className
        )}
      >
        {displayCount}
      </Badge>
    </div>
  );
}