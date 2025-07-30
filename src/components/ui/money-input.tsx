import React, { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  prefix?: string;
}

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value = 0, onChange, prefix = 'R$ ', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatCurrency(value));

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const parseCurrency = (formattedValue: string): number => {
      const numericValue = formattedValue
        .replace(/[^\d,]/g, '')
        .replace(',', '.');
      return parseFloat(numericValue) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove tudo exceto números e vírgula
      const cleanValue = inputValue.replace(/[^\d,]/g, '');
      
      // Converte para número
      const numericValue = parseCurrency(cleanValue);
      
      // Formata para exibição
      const formatted = formatCurrency(numericValue);
      setDisplayValue(formatted);
      
      // Chama callback com valor numérico
      if (onChange) {
        onChange(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Seleciona apenas os números ao focar
      const numericPart = displayValue.replace(/[^\d,]/g, '');
      setDisplayValue(numericPart);
      e.target.select();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Reformata ao perder o foco
      const numericValue = parseCurrency(e.target.value);
      const formatted = formatCurrency(numericValue);
      setDisplayValue(formatted);
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "text-right font-mono text-lg",
          className
        )}
        placeholder={prefix + "0,00"}
      />
    );
  }
);

MoneyInput.displayName = 'MoneyInput';

export { MoneyInput };