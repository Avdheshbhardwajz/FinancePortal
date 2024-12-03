
'use client'

import React, { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GridTableProps {
  tableName: string
}

interface RowData {
  [key: string]: any;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ApiResponse {
  data: RowData[];
  pagination: PaginationInfo;
}

interface EditPayload {
  [key: string]: any;
}

export default function GridTable({ tableName }: GridTableProps) {
  const [rowData, setRowData] = useState<RowData[]>([])
  const [colDefs, setColDefs] = useState<ColDef[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null)
  const [editedData, setEditedData] = useState<RowData>({})
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  })
  const { toast } = useToast()

  // Function to fetch data from API
  const fetchTableData = useCallback(async (page = 1, pageSize = 10) => {
    try {
      const response = await axios.get(`http://localhost:5000/table/${tableName}`, {
        params: { page, pageSize }
      })
      
      const apiResponse: ApiResponse = response.data
      setRowData(apiResponse.data)
      setPagination(apiResponse.pagination)

      // Dynamically generate column definitions based on first row
      if (apiResponse.data.length > 0) {
        const columns: ColDef[] = Object.keys(apiResponse.data[0])
          .filter(key => key !== 'id')
          .map((key) => ({
            field: key,
            headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
          }))

        columns.push({
          headerName: "Actions",
          field: "actions",
          cellRenderer: (params: ICellRendererParams) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditButtonClick(params.data)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ),
          width: 120,
          filter: false,
        })

        setColDefs(columns)
      }
    } catch (error) {
      console.error("Error fetching table data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again.",
      })
    }
  }, [tableName, toast])

  // Initial data load
  useEffect(() => {
    fetchTableData()
  }, [fetchTableData])

  const handleEditButtonClick = (data: RowData) => {
    setSelectedRowData(data)
    setEditedData({ ...data })
    setIsModalOpen(true)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!selectedRowData) return

    try {
      // Prepare payload with only changed fields
      const payload: EditPayload = {}
      Object.keys(editedData).forEach(key => {
        if (editedData[key] !== selectedRowData[key]) {
          payload[key] = editedData[key]
        }
      })

      // If no changes, just close the modal
      if (Object.keys(payload).length === 0) {
        setIsModalOpen(false)
        return
      }

      // Send edit request
      await axios.patch(`http://localhost:5000/table/${tableName}/${selectedRowData.id}`, payload)

      // Refresh data after successful edit
      await fetchTableData(pagination.currentPage, pagination.pageSize)

      setIsModalOpen(false)
      toast({
        title: "Success",
        description: "Row updated successfully",
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes. Please try again.",
      })
    }
  }

  // Custom Pagination Controls
  const handlePageChange = (page: number) => {
    fetchTableData(page, pagination.pageSize)
  }

  const handlePageSizeChange = (pageSize: number) => {
    fetchTableData(1, pageSize)
  }

  // Render Pagination Controls
  const renderPagination = () => {
    const { currentPage, totalPages, total, pageSize } = pagination

    // Calculate start and end records
    const startRecord = (currentPage - 1) * pageSize + 1
    const endRecord = Math.min(currentPage * pageSize, total)

    return (
      <div className="flex items-center justify-between mt-4 px-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm">entries</span>
        </div>

        {/* Pagination Info */}
        <div className="text-sm text-gray-600">
          Showing {startRecord} to {endRecord} of {total} entries
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = index + 1
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2">...</span>
            )}
            {totalPages > 5 && (
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{tableName}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="ag-theme-alpine h-[600px] w-full rounded-md border">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={false}
            suppressPaginationPanel={true}
            suppressMenuHide={true}
            defaultColDef={{
              sortable: true,
              resizable: true,
              flex: 1,
              minWidth: 100,
            }}
            rowSelection="single"
            animateRows={true}
            suppressCellFocus={true}
            enableCellTextSelection={true}
            className="font-poppins"
          />
        </div>

        {/* Custom Pagination Controls */}
        {renderPagination()}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white font-poppins">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Row</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] px-1">
              {selectedRowData && (
                <div className="grid gap-4 py-4">
                  {Object.keys(selectedRowData)
                    .filter(field => field !== 'id')
                    .map((field) => (
                      <div key={field} className="grid gap-2">
                        <Label htmlFor={field} className="font-medium">
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <Input
                          id={field}
                          value={editedData[field]?.toString() || ""}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}