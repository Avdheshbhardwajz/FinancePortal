import { useMemo, useState, useCallback, memo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Button } from '@/components/ui/button'
import { EditDialog } from './EditDialog'
import { AddDialog } from './AddDialog'
import { ColDef } from 'ag-grid-community'
import { Pencil, Plus } from 'lucide-react'
import { useGridData } from '@/hooks/useGridData'
import { submitRequestData } from '@/services/api'
import { RequestDataPayload } from '@/types/requestData'

interface GridTableProps {
  tableName: string
  initialPageSize?: number
}

const GridTable = memo(({
  tableName,
  initialPageSize = 20
}: GridTableProps) => {
  const {
    isLoading,
    error,
    rowData,
    columnConfigs,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refreshData
  } = useGridData({ tableName, initialPageSize })

  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [editedData, setEditedData] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleEditClick = useCallback((row: any) => {
    setSelectedRow(row)
    setEditedData({...row})
    setValidationErrors({})
    setIsEditDialogOpen(true)
  }, [])

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
    setValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }))
  }, [])

  const handleEditSave = useCallback(async () => {
    try {
      if (!selectedRow || !editedData) return;

      setIsSaving(true);
      setSaveError(null);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      const payload: RequestDataPayload = {
        table_name: tableName,
        old_values: selectedRow,
        new_values: editedData,
        maker_id: userData.user_id, // Using a default user ID temporarily
        comments: ''
      };

      await submitRequestData(payload);
      refreshData();
      setIsEditDialogOpen(false);
      setSelectedRow(null);
      setEditedData(null);
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [refreshData, selectedRow, editedData, tableName]);

  const handleAddSuccess = useCallback(() => {
    refreshData()
    setIsAddDialogOpen(false)
  }, [refreshData])

  const columnDefs = useMemo(() => {
    const baseColumns: ColDef[] = Object.values(columnConfigs).map(config => ({
      field: config.field,
      headerName: config.headerName,
      editable: config.isEditable,
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100
    }))

    return [
      ...baseColumns,
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        width: 100,
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleEditClick(params.data)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    ]
  }, [columnConfigs, handleEditClick])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold capitalize">{tableName.replace(/_/g, ' ')}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="ag-theme-alpine w-full h-[calc(100vh-16rem)]">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            suppressPaginationPanel={true}
            suppressScrollOnNewData={true}
            enableCellTextSelection={true}
            animateRows={true}
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border rounded p-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSaveError(null);
          setValidationErrors({});
        }}
        selectedRowData={selectedRow}
        editedData={editedData || {}}
        columnConfigs={columnConfigs}
        validationErrors={validationErrors}
        onSave={handleEditSave}
        onInputChange={handleInputChange}
        isSaving={isSaving}
        error={saveError}
      />

      <AddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        columnConfigs={columnConfigs}
        tableName={tableName}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
})

GridTable.displayName = 'GridTable'

export { GridTable }
