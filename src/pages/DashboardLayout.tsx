'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectedTableState } from '@/types/tables'
import { useTables } from '@/hooks/useTables'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'

 import { GridTable } from '@/components/grid/GridTable'
import MainContent from '@/components/MainContent'
import { useToast } from '@/hooks/use-toast'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { tables, isLoading: isTablesLoading, error: tablesError, refreshTables } = useTables()
  
  const [selectedTable, setSelectedTable] = useState<SelectedTableState>({
    name: null,
    filename: null
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [file, setFile] = useState<File | null>(null)

  // Handle table errors
  useEffect(() => {
    if (tablesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: tablesError
      })
    }
  }, [tablesError, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('makerToken')
    localStorage.removeItem('userData');
    navigate('/login')
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      toast({
        title: "Success",
        description: "File uploaded successfully"
      })
      
      setFile(null)
      // Refresh tables after successful upload
      refreshTables()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || 'Failed to upload file'
      })
    }
  }

  // Show loading state
  if (isTablesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen font-poppins bg-gray-100">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        file={file}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          isLoading={isTablesLoading}
          error={tablesError}
          tables={tables}
          setSelectedTable={setSelectedTable}
          />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {selectedTable.name && selectedTable.filename ? (
            <GridTable tableName={selectedTable.filename} />
          ) : (
            <MainContent />
          )}
        </main>
      </div>
    </div>
  )
}