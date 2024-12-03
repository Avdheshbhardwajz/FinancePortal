"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, PlusCircle } from 'lucide-react'

export default function DropdownColumnsManager() {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [newOption, setNewOption] = useState('')
  const [currentOptions, setCurrentOptions] = useState([])
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' })

  // Existing useEffect hooks and handlers remain the same
  useEffect(() => {
    const dropdownData = JSON.parse(localStorage.getItem('dropdownColumns')) || {}
    if (Object.keys(dropdownData).length > 0) {
      setTables(Object.keys(dropdownData))
    }
  }, [])

  useEffect(() => {
    if (selectedTable) {
      const dropdownData = JSON.parse(localStorage.getItem('dropdownColumns')) || {}
      const tableData = dropdownData[selectedTable] || {}
      setColumns(Object.keys(tableData))
    } else {
      setColumns([])
    }
    setSelectedColumn('')
    setCurrentOptions([])
  }, [selectedTable])

  useEffect(() => {
    if (selectedTable && selectedColumn) {
      const dropdownData = JSON.parse(localStorage.getItem('dropdownColumns')) || {}
      const options = dropdownData[selectedTable]?.[selectedColumn] || []
      setCurrentOptions(options)
    } else {
      setCurrentOptions([])
    }
  }, [selectedTable, selectedColumn])

  const showAlertMessage = (message, type = 'info') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000)
  }

  const handleAddOption = () => {
    if (!newOption.trim()) {
      showAlertMessage('Please enter an option', 'error')
      return
    }

    if (currentOptions.includes(newOption.trim())) {
      showAlertMessage('Option already exists', 'error')
      return
    }

    const dropdownData = JSON.parse(localStorage.getItem('dropdownColumns')) || {}
    const updatedOptions = [...currentOptions, newOption.trim()]
    
    dropdownData[selectedTable] = {
      ...dropdownData[selectedTable],
      [selectedColumn]: updatedOptions
    }

    localStorage.setItem('dropdownColumns', JSON.stringify(dropdownData))
    setCurrentOptions(updatedOptions)
    setNewOption('')
    showAlertMessage('Option added successfully', 'success')
  }

  const handleRemoveOption = (optionToRemove) => {
    const updatedOptions = currentOptions.filter(option => option !== optionToRemove)
    const dropdownData = JSON.parse(localStorage.getItem('dropdownColumns')) || {}
    
    dropdownData[selectedTable] = {
      ...dropdownData[selectedTable],
      [selectedColumn]: updatedOptions
    }

    localStorage.setItem('dropdownColumns', JSON.stringify(dropdownData))
    setCurrentOptions(updatedOptions)
    showAlertMessage('Option removed successfully', 'success')
  }

  return (
    <Card className="mt-6 font-poppins">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Column Options Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alert.show && (
          <Alert className={`mb-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent className='bg-white font-poppins'>
              {tables.map(table => (
                <SelectItem key={table} value={table}>
                  {table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedColumn} onValueChange={setSelectedColumn} disabled={!selectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className='bg-white font-poppins'>
              {columns.map(column => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              placeholder="Add new option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              disabled={!selectedColumn}
            />
            <Button
              onClick={handleAddOption}
              disabled={!selectedColumn}
              className="bg-primary hover:bg-primary/90"
            >
              Add
            </Button>
          </div>
        </div>

        {selectedColumn && currentOptions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Current Options:</h3>
            <div className="flex flex-wrap gap-2">
              {currentOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{option}</span>
                  <button
                    onClick={() => handleRemoveOption(option)}
                    className="text-gray-500 hover:text-red-500"
                    aria-label={`Remove ${option}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}