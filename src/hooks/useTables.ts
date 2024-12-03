import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { TableInfo, TablesResponse } from '@/types/tables'
import { useToast } from './use-toast'

export const useTables = () => {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<TablesResponse>('http://localhost:8080/table')
      
      if (!response.data?.success || !Array.isArray(response.data?.tables)) {
        throw new Error('Invalid response format')
      }

      const fetchedTables: TableInfo[] = response.data.tables.map((row) => {
        if (!row?.table_name) {
          throw new Error('Invalid table data format')
        }
        return {
          name: row.table_name.replace(/_/g, ' ').toLowerCase(),
          filename: row.table_name.toLowerCase()
        }
      })
      
      setTables(fetchedTables)
    } catch (err) {
      const error = err as Error | { response?: { data?: { error?: string } } }
      console.error('Error fetching tables:', error)
      
      const errorMessage = 'response' in error 
        ? error.response?.data?.error || 'Failed to load tables'
        : error.message || 'Failed to load tables'
      
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const refreshTables = () => {
    fetchTables()
  }

  return {
    tables,
    isLoading,
    error,
    refreshTables
  }
}
