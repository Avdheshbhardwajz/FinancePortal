import { AlertCircle, CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { cn } from "@/lib/utils"
import { EditFieldProps } from '@/types/grid'
import { format } from 'date-fns'

export const EditField = ({ field, value, validation, config, onChange }: EditFieldProps) => {
  const renderValidationError = () => {
    if (validation?.hasError) {
      return (
        <div className="flex items-center gap-2 mt-1 text-sm text-red-500 font-poppins">
          <AlertCircle className="h-4 w-4" />
          <span>{validation.message}</span>
        </div>
      )
    }
    return null
  }

  const formatHeaderName = (header: string) => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  switch (config.editType?.toLowerCase()) {
    case 'date calendar':
    case 'date':
      return (
        <div className="flex flex-col gap-2 font-poppins">
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
                className="bg-white font-poppins"
              />
            </PopoverContent>
          </Popover>
          {renderValidationError()}
        </div>
      )

    case 'dropdown':
    case 'drop down with predefined value in the column':
      return (
        <div className="flex flex-col gap-2 font-poppins">
          <Label>{formatHeaderName(field)}</Label>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => onChange(field, newValue)}
          >
            <SelectTrigger 
              className={cn(
                "w-full font-poppins",
                validation?.hasError && "border-red-500"
              )}
            >
              <SelectValue placeholder="Select value" className="font-poppins" />
            </SelectTrigger>
            <SelectContent className="bg-white font-poppins">
              {config.dropdownOptions?.map((option: string) => (
                <SelectItem key={option} value={option} className="font-poppins">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderValidationError()}
        </div>
      )

    case 'number':
      return (
        <div className="flex flex-col gap-2 font-poppins">
          <Label>{formatHeaderName(field)}</Label>
          <Input
            type="number"
            value={value?.toString() || ''}
            onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : null)}
            className={cn(
              "w-full font-poppins",
              validation?.hasError && "border-red-500"
            )}
          />
          {renderValidationError()}
        </div>
      )

    default:
      return (
        <div className="flex flex-col gap-2 font-poppins">
          <Label>{formatHeaderName(field)}</Label>
          <Input
            type="text"
            value={value?.toString() || ''}
            onChange={(e) => onChange(field, e.target.value)}
            className={cn(
              "w-full font-poppins",
              validation?.hasError && "border-red-500"
            )}
          />
          {renderValidationError()}
        </div>
      )
  }
}
