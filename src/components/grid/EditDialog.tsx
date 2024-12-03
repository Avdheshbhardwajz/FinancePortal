import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { RowData, ColumnConfig, ValidationErrors } from '@/types/grid'

interface EditDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedRowData: RowData | null
  editedData: RowData
  columnConfigs: { [key: string]: ColumnConfig }
  validationErrors: ValidationErrors
  onSave: () => void
  onInputChange: (field: string, value: any) => void
  isSaving?: boolean
  error?: string | null
}

export const EditDialog = ({
  isOpen,
  onClose,
  selectedRowData,
  editedData,
  columnConfigs,
  validationErrors,
  onSave,
  onInputChange,
  isSaving,
  error,
}: EditDialogProps) => {
  if (!selectedRowData) return null

  const renderField = (field: string) => {
    const config = columnConfigs[field]
    if (!config || !config.isEditable) return null

    const value = editedData[field]
    const error = validationErrors[field]

    switch (config.editType) {
      case 'date calendar':
        return (
          <div className="grid gap-2">
            <Label htmlFor={field}>{config.headerName || field}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                    error?.hasError && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => onInputChange(field, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error?.hasError && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div className="grid gap-2">
            <Label htmlFor={field}>{config.headerName || field}</Label>
            <Input
              id={field}
              type="number"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value ? Number(e.target.value) : null)}
              className={cn(error?.hasError && "border-red-500")}
            />
            {error?.hasError && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )

      case 'email':
        return (
          <div className="grid gap-2">
            <Label htmlFor={field}>{config.headerName || field}</Label>
            <Input
              id={field}
              type="email"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              className={cn(error?.hasError && "border-red-500")}
            />
            {error?.hasError && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )

      case 'phone':
        return (
          <div className="grid gap-2">
            <Label htmlFor={field}>{config.headerName || field}</Label>
            <Input
              id={field}
              type="tel"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              className={cn(error?.hasError && "border-red-500")}
            />
            {error?.hasError && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )

      default:
        return (
          <div className="grid gap-2">
            <Label htmlFor={field}>{config.headerName || field}</Label>
            <Input
              id={field}
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              className={cn(error?.hasError && "border-red-500")}
            />
            {error?.hasError && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-poppins bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">Edit Record</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {Object.keys(columnConfigs)
            .filter(field => 
              field !== 'id' && 
              field !== 'dim_branch_sk' && 
              columnConfigs[field].isEditable
            )
            .map(field => (
              <div key={field}>
                {renderField(field)}
              </div>
            ))}
        </div>
        <DialogFooter>
          {error && (
            <div className="text-sm text-red-600 mb-2">
              {error}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
