import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MonthlyPayment } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface FilterProps {
  payments: MonthlyPayment[];
  onFilterChange: (filters: { year: number; months: number[] }) => void;
}

const MONTHS = [
  { label: 'JAN', value: 0 }, { label: 'FEV', value: 1 }, { label: 'MAR', value: 2 },
  { label: 'ABR', value: 3 }, { label: 'MAI', value: 4 }, { label: 'JUN', value: 5 },
  { label: 'JUL', value: 6 }, { label: 'AGO', value: 7 }, { label: 'SET', value: 8 },
  { label: 'OUT', value: 9 }, { label: 'NOV', value: 10 }, { label: 'DEZ', value: 11 }
];

export const Filter = ({ payments, onFilterChange }: FilterProps) => {
  const availableYears = useMemo(() => {
    const years = new Set(payments.map(p => new Date(p.dataVencimento).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [payments]);

  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth()]);

  useEffect(() => {
    onFilterChange({ year: selectedYear, months: selectedMonths });
  }, []);

  const handleYearChange = (yearValue: string) => {
    const year = parseInt(yearValue, 10);
    setSelectedYear(year);
    onFilterChange({ year, months: selectedMonths });
  };

  const handleMonthClick = (monthValue: number) => {
    const newSelectedMonths = selectedMonths.includes(monthValue)
      ? selectedMonths.filter(m => m !== monthValue)
      : [...selectedMonths, monthValue];
    setSelectedMonths(newSelectedMonths);
    onFilterChange({ year: selectedYear, months: newSelectedMonths });
  };

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Ano:</span>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Month Buttons */}
        <div className="hidden md:flex flex-1 flex-wrap gap-2">
          <Button
            variant={selectedMonths.length === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedMonths([]);
              onFilterChange({ year: selectedYear, months: [] });
            }}
          >
            TODOS
          </Button>
          {MONTHS.map(month => (
            <Button
              key={month.value}
              variant={selectedMonths.includes(month.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMonthClick(month.value)}
              className="transition-all duration-200"
            >
              {month.label}
            </Button>
          ))}
        </div>

        {/* Mobile Month Dropdown */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Mês:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between">
                {selectedMonths.length === 0
                  ? 'Todos'
                  : selectedMonths.length === 1
                  ? MONTHS.find(m => m.value === selectedMonths[0])?.label
                  : `${selectedMonths.length} selecionados`}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {
                MONTHS.map(month => (
                  <DropdownMenuCheckboxItem
                    key={month.value}
                    checked={selectedMonths.includes(month.value)}
                    onCheckedChange={() => handleMonthClick(month.value)}
                  >
                    {month.label}
                  </DropdownMenuCheckboxItem>
                ))
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
