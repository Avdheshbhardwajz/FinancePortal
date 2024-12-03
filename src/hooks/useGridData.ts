import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { GridResponse, RowData, ColumnConfig } from '@/types/grid'

interface UseGridDataProps {
  tableName: string
  initialPageSize?: number
}

interface ApiResponse {
  data: any[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export const useGridData = ({ tableName, initialPageSize = 20 }: UseGridDataProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowData, setRowData] = useState<RowData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnConfigs, setColumnConfigs] = useState<{ [key: string]: ColumnConfig }>({})
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: initialPageSize
  })
  
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getColumnEditType = useCallback((header: string): string => {
    if (header.includes('date') || header.includes('_on')) {
      return 'date calendar'
    }
    if (header.includes('email')) {
      return 'email'
    }
    if (header.includes('phone') || header.includes('telephone') || header.includes('fax')) {
      return 'phone'
    }
    if (header.includes('pin')) {
      return 'number'
    }
    if (header.includes('state') || header.includes('zone') || header.includes('category')) {
      return 'dropdown'
    }
    return 'text'
  }, [])

  const formatHeaderName = useCallback((header: string): string => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const createColumnConfigs = useCallback((firstRow: any) => {
    const configs: { [key: string]: ColumnConfig } = {}
    Object.keys(firstRow).forEach(header => {
      configs[header] = {
        field: header,
        headerName: formatHeaderName(header),
        isEditable: !['created_by', 'modified_by', 'created_on', 'modified_on', 'dim_branch_sk'].includes(header),
        editType: getColumnEditType(header)
      }
    })
    return configs
  }, [formatHeaderName, getColumnEditType])

  const fetchData = useCallback(async (page: number, pageSize: number) => {
    if (!tableName) {
      console.error('Table name is required')
      return
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<ApiResponse>(
        `http://localhost:8080/tableData/${tableName}`,
        {
          params: {
            page,
            pageSize
          },
          signal: abortControllerRef.current.signal
        }
      )

      if (!response.data?.data) {
        throw new Error('Invalid response format')
      }

      const { data, pagination: paginationData } = response.data

      if (data.length > 0) {
        setColumnConfigs(createColumnConfigs(data[0]))
        setHeaders(Object.keys(data[0]))
      }

      setRowData(data)
      setPagination(paginationData)
    } catch (err: any) {
      if (err.name === 'CanceledError') {
        // Request was cancelled, ignore error
        return
      }
      
      console.error('Error fetching data:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load data'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [tableName, createColumnConfigs, toast])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    fetchData(page, pagination.pageSize)
  }, [fetchData, pagination.pageSize])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }))
    fetchData(1, newPageSize)
  }, [fetchData])

  const refreshData = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage, pagination.pageSize])

  useEffect(() => {
    // Set a small delay before fetching to prevent rapid consecutive calls
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData(pagination.currentPage, pagination.pageSize)
    }, 300)

    return () => {
      // Cleanup function
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [tableName, fetchData, pagination.currentPage, pagination.pageSize])

  return {
    isLoading,
    error,
    rowData,
    headers,
    columnConfigs,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refreshData
  }
}
