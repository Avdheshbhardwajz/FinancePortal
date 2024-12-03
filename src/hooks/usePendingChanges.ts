import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { RowData, PendingChanges, ChangeRecord } from '@/types/grid'
import axios from 'axios'

export const usePendingChanges = (tableName: string) => {
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})
  const { toast } = useToast()

  // Load pending changes from localStorage on mount
  useEffect(() => {
    try {
      const storedChanges = localStorage.getItem(`pendingChanges_${tableName}`)
      if (storedChanges) {
        setPendingChanges(JSON.parse(storedChanges))
      }
    } catch (error) {
      console.error('Error loading pending changes:', error)
    }
  }, [tableName])

  // Save pending changes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`pendingChanges_${tableName}`, JSON.stringify(pendingChanges))
    } catch (error) {
      console.error('Error saving pending changes:', error)
    }
  }, [pendingChanges, tableName])

  const saveChange = useCallback(async (
    rowId: string,
    originalData: RowData,
    changes: { [key: string]: any },
    originalValues: { [key: string]: any }
  ): Promise<boolean> => {
    try {
      // Create change record
      const changeRecord: ChangeRecord = {
        rowId,
        originalData,
        changes,
        originalValues,
        timestamp: Date.now()
      }

      // Send change to backend
      await axios.post(
        `http://localhost:8080/table/${tableName}/changes`,
        changeRecord,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Update local pending changes
      setPendingChanges(prev => {
        const updatedChanges = { ...prev }
        const changedFields = Object.keys(changes)
        
        if (!updatedChanges[rowId]) {
          updatedChanges[rowId] = changedFields
        } else {
          updatedChanges[rowId] = Array.from(new Set([...updatedChanges[rowId], ...changedFields]))
        }
        
        return updatedChanges
      })

      toast({
        title: "Success",
        description: "Changes saved successfully and pending approval.",
      })

      return true
    } catch (error: any) {
      console.error('Error saving changes:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to save changes. Please try again.",
      })
      return false
    }
  }, [tableName, toast])

  const clearPendingChanges = useCallback((rowId?: string) => {
    if (rowId) {
      setPendingChanges(prev => {
        const updated = { ...prev }
        delete updated[rowId]
        return updated
      })
    } else {
      setPendingChanges({})
    }
    localStorage.removeItem(`pendingChanges_${tableName}`)
  }, [tableName])

  return { 
    pendingChanges, 
    saveChange,
    clearPendingChanges
  }
}
