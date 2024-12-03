import { AlertCircle, CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { cn } from "@/lib/utils"
import { EditFieldProps } from '@/types/grid'
import { formatDate } from '@/utils/dateUtils'
import { format } from 'date-fns'

export const EditField = ({ field, value, validation, config, onChange }: EditFieldProps) => {
  const renderValidationError = () => {
    if (validation?.hasError) {
      return (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{validation.message}</span>
        </div>
      )
    }
    return null
  }

  const commonInputProps = {
    className: cn(
      "w-full font-poppins",
      validation?.hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
    ),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.value)
    },
    onBlur: () => {
      onChange(field, value)
    }
  }

  const formatHeaderName = (header: string) => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  switch (config.editType) {
    case 'date calendar':
      return (
        <div className="flex flex-col gap-2">
          <Label>{formatHeaderName(field)}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal font-poppins",
                  !value && "text-muted-foreground",
                  validation?.hasError && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white font-poppins">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(field, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {renderValidationError()}
        </div>
      )

    case 'dropdown':
    case 'drop down with predefined value in the column':
      return (
        <div className="flex flex-col gap-2">
          <Label>{formatHeaderName(field)}</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => onChange(field, newValue)}
          >
            <SelectTrigger className={cn(validation?.hasError && "border-red-500")}>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {config.dropdownOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderValidationError()}
        </div>
      )

    default:
      return (
        <div className="flex flex-col gap-2">
          <Label>{formatHeaderName(field)}</Label>
          <Input
            type={config.editType === 'number' ? 'number' : 'text'}
            value={value?.toString() || ""}
            {...commonInputProps}
            className="font-poppins"
          />
          {renderValidationError()}
        </div>
      )
  }
}
