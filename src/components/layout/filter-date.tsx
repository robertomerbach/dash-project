"use client"

import * as React from "react"
import { 
  addDays, 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  subWeeks,
  endOfDay
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"

interface FilterDateProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
}

export function FilterDate({
  className,
  initialDateRange,
  onDateRangeChange,
}: FilterDateProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialDateRange)
  const [selectedPreset, setSelectedPreset] = React.useState<string>("este-mes")
  const [isOpen, setIsOpen] = React.useState(false)

  const today = endOfDay(new Date())

  const presetDates = {
    "hoje": {
      label: "Hoje",
      value: {
        from: today,
        to: today,
      }
    },
    "ontem": {
      label: "Ontem",
      value: {
        from: subDays(today, 1),
        to: subDays(today, 1),
      }
    },
    "ultimos-7-dias": {
      label: "Últimos 7 dias",
      value: {
        from: subDays(today, 6),
        to: today,
      }
    },
    "ultimos-14-dias": {
      label: "Últimos 14 dias",
      value: {
        from: subDays(today, 13),
        to: today,
      }
    },
    "ultimos-30-dias": {
      label: "Últimos 30 dias",
      value: {
        from: subDays(today, 29),
        to: today,
      }
    },
    "esta-semana": {
      label: "Esta semana",
      value: {
        from: startOfWeek(today, { locale: ptBR }),
        to: today,
      }
    },
    "semana-passada": {
      label: "Semana passada",
      value: {
        from: startOfWeek(subWeeks(today, 1), { locale: ptBR }),
        to: endOfWeek(subWeeks(today, 1), { locale: ptBR }),
      }
    },
    "este-mes": {
      label: "Este mês",
      value: {
        from: startOfMonth(today),
        to: today,
      }
    },
    "mes-anterior": {
      label: "Mês anterior",
      value: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      }
    }
  }

  // Função auxiliar para verificar correspondência de preset
  const findMatchingPreset = (dateRange: DateRange) => {
    return Object.entries(presetDates).find(([_, preset]) => {
      const presetFrom = preset.value.from
      const presetTo = preset.value.to
      return (
        isSameDay(dateRange.from!, presetFrom) &&
        isSameDay(dateRange.to!, presetTo)
      )
    })
  }

  const handlePresetChange = (value: string) => {
    const preset = presetDates[value as keyof typeof presetDates]
    if (preset) {
      const newDate = preset.value
      setDate(newDate)
      setSelectedPreset(value)
      onDateRangeChange?.(newDate)
      setIsOpen(false) // Fecha o popover após a seleção
    }
  }

  const handleDateSelect = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to) {
      // Garante que as datas incluam o dia inteiro
      const adjustedRange = {
        from: newDate.from,
        to: endOfDay(newDate.to)
      }
      
      setDate(adjustedRange)
      const matchingPreset = findMatchingPreset(adjustedRange)
      setSelectedPreset(matchingPreset ? matchingPreset[0] : "")
      onDateRangeChange?.(adjustedRange)
    } else {
      setDate(newDate)
    }
  }

  React.useEffect(() => {
    if (date?.from && date?.to) {
      const matchingPreset = findMatchingPreset(date)
      if (matchingPreset) {
        setSelectedPreset(matchingPreset[0])
      }
    }
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[246px] justify-start text-left font-normal cursor-pointer",
              !date && "text-muted-foreground"
            )}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} —{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione uma data</span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid grid-cols-[164px_1fr] divide-x">
            <div className="p-3 space-y-3">
              <RadioGroup
                value={selectedPreset}
                onValueChange={handlePresetChange}
                className="gap-2"
              >
                {Object.entries(presetDates).map(([key, { label }]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label 
                      htmlFor={key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}