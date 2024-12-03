import { ICellRendererParams } from 'ag-grid-community'

export interface GridTableProps {
  tableName: string
}

export type EditType = 'text' | 'date calendar' | 'number' | 'dropdown' | 'email' | 'phone'

export interface ColumnConfig {
  field: string
  headerName?: string
  isEditable?: boolean
  editType?: EditType
  width?: number
  dropdownOptions?: string[]
  valueFormatter?: (value: any) => string
  valueGetter?: (params: any) => any
  hide?: boolean
}

export interface ValidationError {
  hasError: boolean
  message?: string
}

export interface ValidationErrors {
  [key: string]: ValidationError
}

export interface RowData {
  [key: string]: any
  id?: string | number
  dim_branch_sk?: number
}

export interface PendingChanges {
  [rowId: string]: string[]
}

export interface ChangeRecord {
  rowId: string
  originalData: RowData
  changes: { [key: string]: any }
  originalValues: { [key: string]: any }
  timestamp: number
}

export interface GridResponse {
  data: RowData[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
  success: boolean
  message?: string
}

export interface GridState {
  loading: boolean
  error: string | null
  data: RowData[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export interface GridActions {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setData: (data: RowData[]) => void
  setPagination: (pagination: GridState['pagination']) => void
  reset: () => void
}

export interface CellRendererProps {
  value: any
  data: RowData
  field: string
  isPending?: boolean
  isDateField?: boolean
  editType?: string
}

export interface PendingChange {
  oldValue: any
  newValue: any
  timestamp: number
}
