import { Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CellRendererProps } from '@/types/grid'
import { formatDate, isValidDateString } from '@/utils/dateUtils'

interface CellRendererProps extends CustomCellRendererParams {
  isPending: boolean
  isDateField?: boolean
  editType?: string
}

export const CellRenderer = ({ value, isPending, isDateField, editType }: CellRendererProps) => {
  const formatValue = () => {
    if (!value && value !== 0) return '-'

    if (isDateField) {
      try {
        const date = new Date(value)
        return date.toLocaleDateString()
      } catch (e) {
        return value
      }
    }

    if (editType === 'number') {
      return typeof value === 'number' ? value.toLocaleString() : value
    }

    return value
  }

  return (
    <div className="flex items-center gap-2">
      <span className={isPending ? 'text-blue-600 font-medium' : ''}>
        {formatValue()}
      </span>
      {isPending && (
        <Badge variant="outline" className="h-5 px-1">
          <Clock className="h-3 w-3 text-blue-600" />
        </Badge>
      )}
    </div>
  )
}
