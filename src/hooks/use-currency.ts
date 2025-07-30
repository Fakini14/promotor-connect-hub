import { useMemo } from 'react';

interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function useCurrency(options?: CurrencyFormatOptions) {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options || {};

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }, [locale, currency, minimumFractionDigits, maximumFractionDigits]);

  const format = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return formatter.format(0);
    }
    return formatter.format(value);
  };

  const parse = (formattedValue: string): number => {
    // Remove todos os caracteres não numéricos exceto vírgula
    const cleanValue = formattedValue
      .replace(/[^\d,]/g, '')
      .replace(',', '.');
    
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  const formatCompact = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return format(value);
  };

  return {
    format,
    parse,
    formatCompact,
    formatter
  };
}