export interface TableInfo {
  name: string
  filename: string
}

export interface SelectedTableState {
  name: string | null
  filename: string | null
}

export interface TablesResponse {
  success: boolean
  tables: Array<{ table_name: string }>
}
