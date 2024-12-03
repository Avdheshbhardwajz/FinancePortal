'use client'

import React, { useEffect, useState, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import Papa from "papaparse"
import { ColDef, ICellRendererParams, GetRowIdParams } from 'ag-grid-community'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, CalendarIcon, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO, parse } from "date-fns"
import { cn } from "@/lib/utils"

interface GridTableProps {
  tableName: string
}

interface RowData {
  id?: string;
  [key: string]: string | number | null | undefined;
}

interface PendingChanges {
  [key: string]: string[];
}

interface ChangeRecord {
  id: string;
  tableName: string;
  rowId: string;
  rowData: RowData;
  oldValues: { [key: string]: any };
  newValues: { [key: string]: any };
  timestamp: string;
  maker: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ColumnConfig {
  field: string;
  isEditable: boolean;
  editType?: string;
  dropdownOptions?: string[];
}

interface ValidationError {
  hasError: boolean;
  message: string;
}

interface ValidationErrors {
  [key: string]: ValidationError;
}

interface CustomCellRendererParams extends ICellRendererParams {
  data: RowData;
  colDef: ColDef;
}

export default function GridTable({ tableName }: GridTableProps) {
  const [rowData, setRowData] = useState<RowData[]>([])
  const [colDefs, setColDefs] = useState<ColDef[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<RowData>({})
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})
  const [columnConfigs, setColumnConfigs] = useState<{ [key: string]: ColumnConfig }>({})
  const [headers, setHeaders] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const { toast } = useToast()

  

  // Enhanced validation function
const validateInput = (field: string, value: any): ValidationError => {
  const config = columnConfigs[field]
  if (!config) return { hasError: false, message: '' }

  // Handle empty values
  if (value === null || value === undefined || value === '') {
    return { hasError: false, message: '' }
  }

  const stringValue = String(value).trim()

  switch (config.editType) {
    

    case 'amount free text- numeric':
      // Allow integers and decimals, no text
      if (!/^\d*\.?\d*$/.test(stringValue)) {
        return {
          hasError: true,
          message: 'Please enter a valid number'
        }
      }
      if (stringValue.endsWith('.')) {
        return {
          hasError: true,
          message: 'Please enter a complete decimal number'
        }
      }
      const floatValue = parseFloat(stringValue)
      if (isNaN(floatValue) || floatValue < 0 || floatValue > 999999999.99) {
        return {
          hasError: true,
          message: 'Amount must be between 0 and 999,999,999.99'
        }
      }
      // Check for maximum 2 decimal places
      if (stringValue.includes('.') && stringValue.split('.')[1].length > 2) {
        return {
          hasError: true,
          message: 'Maximum 2 decimal places allowed'
        }
      }
      break

    case 'alphanumeric free text':
      // Allow letters and numbers, no special characters
      if (!/^[a-zA-Z0-9]*$/.test(stringValue)) {
        return {
          hasError: true,
          message: 'Please enter only letters and numbers (no special characters)'
        }
      }
      if (stringValue.length > 50) {
        return {
          hasError: true,
          message: 'Maximum length is 50 characters'
        }
      }
      break

    case 'text free text':
      // Allow only letters and spaces
      if (!/^[a-zA-Z\s]*$/.test(stringValue)) {
        return {
          hasError: true,
          message: 'Please enter only letters and spaces'
        }
      }
      if (stringValue.length > 100) {
        return {
          hasError: true,
          message: 'Maximum length is 100 characters'
        }
      }
      break

    case 'date calendar':
      if (!isValidDateString(stringValue)) {
        return {
          hasError: true,
          message: 'Please select a valid date'
        }
      }
      const date = new Date(stringValue)
      const minDate = new Date('1900-01-01')
      const maxDate = new Date('2100-12-31')
      if (date < minDate || date > maxDate) {
        return {
          hasError: true,
          message: 'Date must be between 1900 and 2100'
        }
      }
      break

    case 'dropdown':
    case 'drop down with predefined value in the column':
      if (!config.dropdownOptions?.includes(stringValue)) {
        return {
          hasError: true,
          message: 'Please select a valid option from the dropdown'
        }
      }
      break
  }

  return { hasError: false, message: '' }
}
// First, fix the storeDropdownColumns function
function storeDropdownColumns(tableName: string, configs: { [key: string]: ColumnConfig }) {
  try {
    // Get existing dropdown mappings from localStorage
    const existingMappings = JSON.parse(localStorage.getItem('dropdownColumns') || '{}')
    
    // Find all columns that have dropdown type and their options
    const dropdownColumns: { [key: string]: string[] } = {}
    Object.entries(configs)
      .filter(([_, config]) => config.editType === 'dropdown' || 
      config.editType === 'drop down with predefined value in the column')
      .forEach(([columnName, config]) => {
        dropdownColumns[columnName] = config.dropdownOptions || []
      })
    
    // Update mappings for this table
    existingMappings[tableName] = dropdownColumns
    
    // Store back in localStorage
    localStorage.setItem('dropdownColumns', JSON.stringify(existingMappings))
  } catch (error) {
    console.error('Error storing dropdown columns:', error)
  }
}

  const isValidDateString = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false
    try {
      const isoDate = parseISO(dateString)
      if (isValid(isoDate)) return true

      const formats = [
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'yyyy/MM/dd',
        'MM-dd-yyyy',
        'dd-MM-yyyy'
      ]

      for (const formatStr of formats) {
        const parsedDate = parse(dateString, formatStr, new Date())
        if (isValid(parsedDate)) return true
      }

      return false
    } catch {
      return false
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    try {
      let date = parseISO(dateString)
      if (isValid(date)) {
        return format(date, "PPP")
      }

      const formats = [
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'yyyy/MM/dd',
        'MM-dd-yyyy',
        'dd-MM-yyyy'
      ]

      for (const formatStr of formats) {
        date = parse(dateString, formatStr, new Date())
        if (isValid(date)) {
          return format(date, "PPP")
        }
      }

      return dateString
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const handleEditButtonClick = useCallback((data: RowData) => {
    if (!data.id) return
    setSelectedRowData(data)
    setSelectedRowId(data.id)
    setEditedData({ ...data })
    setValidationErrors({})
    setIsModalOpen(true)
  }, [])

  const loadPendingChanges = useCallback(() => {
    try {
      const storedChanges = localStorage.getItem('pendingChanges')
      if (!storedChanges) return

      const changes = JSON.parse(storedChanges) as ChangeRecord[]
      const tableChanges = changes.filter(change => 
        change.tableName === tableName && 
        change.status === 'pending'
      )

      const newPendingChanges: PendingChanges = {}
      tableChanges.forEach(change => {
        if (change.rowId) {
          newPendingChanges[change.rowId] = Object.keys(change.newValues)
        }
      })
      
      setPendingChanges(newPendingChanges)
    } catch (error) {
      console.error('Error loading pending changes:', error)
    }
  }, [tableName])

  const getColumnDefs = useCallback(() => {
    const columns: ColDef[] = headers
      .filter(header => header !== 'id')
      .map((header) => ({
        field: header,
        filter: true,
        cellRenderer: (params: CustomCellRendererParams) => {
          const rowId = params.data.id || ''
          const field = params.colDef.field || ''
          const isPending = pendingChanges[rowId]?.includes(field)
          
          let displayValue = params.value
          if (columnConfigs[field]?.editType === 'date calendar' && params.value) {
            displayValue = isValidDateString(params.value) 
              ? formatDate(params.value)
              : params.value
          }

          return (
            <div className="flex items-center gap-2">
              <span>{displayValue}</span>
              {isPending && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change pending approval</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )
        },
        cellStyle: { padding: '8px' },
      }))

    columns.push({
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: CustomCellRendererParams) => (
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

    return columns
  }, [headers, columnConfigs, pendingChanges, handleEditButtonClick])

  useEffect(() => {
    setColDefs(getColumnDefs())
  }, [getColumnDefs])

 

  useEffect(() => {
    const csvFile = `../assets/csv/${tableName.toLowerCase().replace(/ /g, "_")}.csv`
    
    Papa.parse(csvFile, {
      download: true,
      header: false,
      complete: (result: Papa.ParseResult<any>) => {
        if (result.data.length < 3) {
          toast({
            variant: "destructive",
            title: "Invalid CSV format",
            description: "CSV must contain header row, editability row, and edit type row.",
          })
          return
        }

        const headers = result.data[0].filter(Boolean)
        const editability = result.data[1]
        const editTypes = result.data[2]

        setHeaders(headers)

          // Load existing dropdown options from localStorage
          let existingDropdowns: { [key: string]: { [key: string]: string[] } } = {}
          try {
            existingDropdowns = JSON.parse(localStorage.getItem('dropdownColumns') || '{}')
          } catch (error) {
            console.error('Error reading dropdown options from localStorage:', error)
          }

        const configs: { [key: string]: ColumnConfig } = {}
        headers.forEach((header: string, index: number) => {
          if (header && header !== 'id') {
            const editType = editTypes[index]?.toLowerCase() || 'free text'
            const isDropdown = editType === 'dropdown' || editType === 'drop down with predefined value in the column'
            
              // Get dropdown options from CSV
              let dropdownOptions = isDropdown
              ? Array.from(new Set(result.data.slice(3).map(row => row[index])))
                .filter(Boolean)
              : undefined

           

             // Merge with existing options from localStorage if available
             if (isDropdown && existingDropdowns[tableName]?.[header]) {
              dropdownOptions = Array.from(new Set([
                ...(dropdownOptions || []),
                ...existingDropdowns[tableName][header]
              ]))
            }
            configs[header] = {
              field: header,
              isEditable: editability[index]?.toLowerCase() === 'editable',
              editType: editType,
              
              dropdownOptions: dropdownOptions
            }
          }
        })
        setColumnConfigs(configs)
        

         // Update localStorage while preserving existing options for other columns
        if (Object.keys(configs).some(key => configs[key].editType === 'dropdown' || 
          configs[key].editType === 'drop down with predefined value in the column')) {
        const updatedDropdowns = { ...existingDropdowns }
        updatedDropdowns[tableName] = updatedDropdowns[tableName] || {}
        
        Object.entries(configs)
          .filter(([_, config]) => config.editType === 'dropdown' || 
              config.editType === 'drop down with predefined value in the column')
          .forEach(([header, config]) => {
            updatedDropdowns[tableName][header] = config.dropdownOptions || []
          })
        
        localStorage.setItem('dropdownColumns', JSON.stringify(updatedDropdowns))
      }

        const data = result.data.slice(3)
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row, index) => {
            const processedRow: RowData = { id: `row-${index}` }
            headers.forEach((header: string, colIndex: number) => {
              if (header && header !== 'id') {
                processedRow[header] = row[colIndex] ?? null
              }
            })
            return processedRow
          })

        setRowData(data)
      },
      error: (err: Error) => {
        console.error("Error parsing CSV file: ", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again later.",
        })
      },
    })
  }, [tableName, toast])

  useEffect(() => {
    loadPendingChanges()
  }, [loadPendingChanges])

  const getRowId = useCallback((params: GetRowIdParams): string => {
    return params.data.id || ''
  }, [])

  

  const handleInputChange = (field: string, value: any) => {
    const config = columnConfigs[field]
    if (!config) return
    
    // Update the edited data first
    setEditedData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error if value is empty (unless field is required)
    if (!value && value !== 0) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: { hasError: false, message: '' }
      }))
      return
    }
  
    // Validate based on edit type
    const validation = validateInput(field, value)
    setValidationErrors(prev => ({
      ...prev,
      [field]: validation
    }))
  }
 
  // Update the renderEditField to show immediate validation feedback
const renderEditField = (field: string, value: any) => {
  const config = columnConfigs[field]
  if (!config) return null

  const validation = validationErrors[field]

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
      "w-full",
      validation?.hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
    ),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(field, e.target.value)
    },
    onBlur: () => {
      // Revalidate on blur to catch any edge cases
      handleInputChange(field, value)
    }
  }

  switch (config.editType) {
    case 'date calendar':
      return (
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  validation?.hasError && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? formatDate(value) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleInputChange(field, date?.toISOString())}
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
        <div>
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => handleInputChange(field, newValue)}
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
        <div>
          <Input
            value={value?.toString() || ""}
            {...commonInputProps}
          />
          {renderValidationError()}
        </div>
      )
  }
}
  const handleSave = () => {
    if (!selectedRowData || !selectedRowId) return

    // Check for any validation errors before saving
    const hasErrors = Object.values(validationErrors).some(error => error.hasError)
    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix all validation errors before saving.",
      })
      return
    }

    const changes: { [key: string]: any } = {}
    const originalValues: { [key: string]: any } = {}

    Object.keys(editedData)
      .filter(key => key !== 'id')
      .forEach(key => {
        const oldValue = selectedRowData[key]
        const newValue = editedData[key]
        if (newValue !== oldValue) {
          changes[key] = newValue
          originalValues[key] = oldValue
        }
      })

    if (Object.keys(changes).length === 0) {
      setIsModalOpen(false)
      return
    }

    const changeRecord: ChangeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      tableName,
      rowId: selectedRowId,
      rowData: selectedRowData,
      oldValues: originalValues,
      newValues: changes,
      timestamp: new Date().toISOString(),
      maker: localStorage.getItem('makerToken') || 'unknown',
      status: 'pending'
    }

    try {
      const existingChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]')
      localStorage.setItem('pendingChanges', JSON.stringify([...existingChanges, changeRecord]))

      setPendingChanges(prev => ({
        ...prev,
        [selectedRowId]: [...(prev[selectedRowId] || []), ...Object.keys(changes)]
      }))

      setIsModalOpen(false)
      toast({
        title: "Changes Pending",
        description: "Your edited data will reflect here once approved by checker.",
      })
    } catch (error) {
      console.error('Error saving changes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes. Please try again.",
      })
    }
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
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            suppressMenuHide={true}
            defaultColDef={{
              sortable: true,
              resizable: true,
              flex: 1,
              minWidth: 100,
            }}
            getRowId={getRowId}
            rowSelection="single"
            animateRows={true}
            suppressCellFocus={true}
            enableCellTextSelection={true}
            className="font-poppins"
          />
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white font-poppins">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Row</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] px-1">
              {selectedRowData && (
                <div className="grid gap-4 py-4">
                  {Object.entries(columnConfigs)
                    .filter(([field]) => field !== 'id')
                    .map(([field, config]) => (
                      <div key={field} className="grid gap-2">
                        <Label htmlFor={field} className="font-medium">
                          {field}
                          {config.isEditable && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Editable
                            </Badge>
                          )}
                          {config.isEditable && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {config.editType}
                            </Badge>
                          )}
                        </Label>
                        <div className="relative">
                          {config.isEditable ? (
                            renderEditField(field, editedData[field])
                          ) : (
                            <Input
                              id={field}
                              value={editedData[field]?.toString() || ""}
                              disabled
                              className="bg-gray-100 text-gray-600"
                            />
                          )}
                        </div>
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
                disabled={Object.values(validationErrors).some(error => error.hasError)}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  Object.values(validationErrors).some(error => error.hasError) && 
                  "opacity-50 cursor-not-allowed"
                )}
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


