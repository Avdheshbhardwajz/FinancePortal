"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

// Mock database structure
const mockDatabase = {
  users: ["id", "name", "email", "gender", "status"],
  products: ["id", "name", "category", "price", "stock"],
}

export default function Definedata() {
  const [selectedTable, setSelectedTable] = useState("")
  const [editableColumns, setEditableColumns] = useState([])
  const [columnOptions, setColumnOptions] = useState({})

  const handleSelectTable = (table) => {
    setSelectedTable(table)
    setEditableColumns([])
    setColumnOptions({})
  }

  const handleToggleColumn = (column) => {
    setEditableColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    )
    if (!columnOptions[column]) {
      setColumnOptions((prev) => ({ ...prev, [column]: [] }))
    }
  }

  const handleAddOption = (column, option) => {
    if (option && !columnOptions[column].includes(option)) {
      setColumnOptions((prev) => ({
        ...prev,
        [column]: [...prev[column], option],
      }))
    }
  }

  const handleRemoveOption = (column, option) => {
    setColumnOptions((prev) => ({
      ...prev,
      [column]: prev[column].filter((opt) => opt !== option),
    }))
  }

  const handleEditOption = (column, oldOption, newOption) => {
    if (newOption && !columnOptions[column].includes(newOption)) {
      setColumnOptions((prev) => ({
        ...prev,
        [column]: prev[column].map((opt) => (opt === oldOption ? newOption : opt)),
      }))
    }
  }

  return (
    <Card className="w-full max-w-4xl font-poppins">
      <CardHeader>
        <CardTitle>Column Options Manager</CardTitle>
        <CardDescription>Define options for editable columns in your database tables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">1. Select a table</h3>
          <Select value={selectedTable} onValueChange={handleSelectTable}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent className="bg-white font-poppins">
              {Object.keys(mockDatabase).map((table) => (
                <SelectItem key={table} value={table}>
                  {table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTable && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">2. Select editable columns</h3>
            <div className="flex flex-wrap gap-2">
              {mockDatabase[selectedTable].map((column) => (
                <Button
                  key={column}
                  variant={editableColumns.includes(column) ? "default" : "outline"}
                  onClick={() => handleToggleColumn(column)}
                >
                  {column}
                </Button>
              ))}
            </div>
          </div>
        )}

        {editableColumns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">3. Define options for editable columns</h3>
            {editableColumns.map((column) => (
              <div key={column} className="space-y-2">
                <h4 className="font-medium">{column}</h4>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add new option"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddOption(column, e.target.value)
                        e.target.value = ""
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="Add new option"]`) as HTMLInputElement
                      if (input) {
                        handleAddOption(column, input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {columnOptions[column]?.map((option) => (
                    <div key={option} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      <Input
                        className="w-auto bg-transparent border-none p-0"
                        defaultValue={option}
                        onBlur={(e) => handleEditOption(column, option, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleEditOption(column, option, e.currentTarget.value)
                            e.currentTarget.blur()
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => handleRemoveOption(column, option)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}