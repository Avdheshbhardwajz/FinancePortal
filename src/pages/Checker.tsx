

'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, AlertCircle, LogOut, Plus, Minus, Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import logo from "../assets/Logo.png"

interface ColumnChange {
  column: string
  oldValue: string
  newValue: string
}

interface Change {
  id: string
  user: string
  dateTime: string
  reason: string
  changes: ColumnChange[]
  fullRow: Record<string, string>
  tableName: string
  status: 'pending' | 'approved' | 'rejected'
  newValues?: Record<string, string>
  oldValues?: Record<string, string>
  rowData?: Record<string, string>
}

interface Table {
  name: string
  changes: Change[]
}

interface Group {
  name: string
  tables: Table[]
}

export default function EnhancedCheckerPage() {
  const [selectedChanges, setSelectedChanges] = useState<Record<string, boolean>>({})
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null)
  const [currentViewData, setCurrentViewData] = useState<Record<string, string> | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const [pendingChanges, setPendingChanges] = useState<Change[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadPendingChanges = () => {
      try {
        const storedChanges = localStorage.getItem('pendingChanges')
        if (storedChanges) {
          const rawChanges = JSON.parse(storedChanges)
          const transformedChanges: Change[] = rawChanges
            .filter((change: any) => change.status === 'pending')
            .map((change: any) => ({
              id: change.id,
              user: change.maker || 'Unknown User',
              dateTime: new Date(change.timestamp).toLocaleString(),
              reason: change.reason || 'No reason provided',
              changes: Object.keys(change.newValues || {}).map(key => ({
                column: key,
                oldValue: String(change.oldValues?.[key] ?? ''),
                newValue: String(change.newValues?.[key])
              })),
              fullRow: change.rowData || {},
              tableName: change.tableName,
              status: change.status,
              newValues: change.newValues,
              oldValues: change.oldValues,
              rowData: change.rowData
            }))
          setPendingChanges(transformedChanges)
        }
      } catch (error) {
        console.error('Error loading pending changes:', error)
      }
    }
    loadPendingChanges()
  }, [])

  const organizedData = {
    totalChanges: pendingChanges.length,
    groups: pendingChanges.reduce((groups: Group[], change) => {
      const groupName = change.tableName.includes('Product') ? 'Product Master Changes' : 'Investor Changes'
      
      let group = groups.find(g => g.name === groupName)
      if (!group) {
        group = { name: groupName, tables: [] }
        groups.push(group)
      }

      let table = group.tables.find(t => t.name === change.tableName)
      if (!table) {
        table = { name: change.tableName, changes: [] }
        group.tables.push(table)
      }

      table.changes.push(change)

      return groups
    }, [])
  }

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges(prev => ({ ...prev, [changeId]: !prev[changeId] }))
  }

  const handleView = (rowData: Record<string, string>) => {
    setCurrentViewData(rowData)
    setIsViewModalOpen(true)
  }

  const handleApprove = (changeId: string) => {
    try {
      const storedChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]')
      const updatedChanges = storedChanges.map((change: Change) => 
        change.id === changeId ? { ...change, status: 'approved' } : change
      )
      localStorage.setItem('pendingChanges', JSON.stringify(updatedChanges))
      
      setPendingChanges(prev => prev.filter(change => change.id !== changeId))
      setSelectedChanges(prev => {
        const newSelected = { ...prev }
        delete newSelected[changeId]
        return newSelected
      })
    } catch (error) {
      console.error('Error approving change:', error)
    }
  }

  const handleReject = (changeId: string) => {
    setCurrentRejectId(changeId)
    setIsRejectModalOpen(true)
  }

  const submitReject = () => {
    if (!currentRejectId || !rejectReason.trim()) {
      return
    }

    try {
      const storedChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]')
      const updatedChanges = storedChanges.map((change: Change) => 
        change.id === currentRejectId ? { ...change, status: 'rejected', rejectReason } : change
      )
      localStorage.setItem('pendingChanges', JSON.stringify(updatedChanges))
      
      setPendingChanges(prev => prev.filter(change => change.id !== currentRejectId))
      setSelectedChanges(prev => {
        const newSelected = { ...prev }
        delete newSelected[currentRejectId]
        return newSelected
      })

      setIsRejectModalOpen(false)
      setRejectReason("")
      setCurrentRejectId(null)
    } catch (error) {
      console.error('Error rejecting change:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("checkerToken")
    navigate("/login")
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }))
  }

  const handleApproveAll = (tableName: string) => {
    try {
      const storedChanges = JSON.parse(localStorage.getItem('pendingChanges') || '[]')
      const updatedChanges = storedChanges.map((change: Change) => 
        change.tableName === tableName ? { ...change, status: 'approved' } : change
      )
      localStorage.setItem('pendingChanges', JSON.stringify(updatedChanges))
      
      setPendingChanges(prev => prev.filter(change => change.tableName !== tableName))
      setSelectedChanges({})
    } catch (error) {
      console.error('Error approving all changes:', error)
    }
  }

  const handleRejectAll = (tableName: string) => {
    const changes = pendingChanges.filter(change => change.tableName === tableName)
    if (changes.length > 0) {
      setCurrentRejectId(tableName)
      setIsRejectModalOpen(true)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6 font-poppins">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-12 w-auto mr-2" />
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            Pending Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            You have <span className="font-semibold text-primary">{organizedData.totalChanges} changes</span> to approve
          </p>
        </CardContent>
      </Card>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6">
          {organizedData.groups.map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardHeader className="cursor-pointer" onClick={() => toggleGroup(group.name)}>
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  {group.name}
                  {expandedGroups[group.name] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedGroups[group.name] && (
                <CardContent>
                  <div className="space-y-6">
                    {group.tables.map((table, tableIndex) => (
                      <Card key={tableIndex}>
                        <CardHeader className="cursor-pointer" onClick={() => toggleTable(table.name)}>
                          <CardTitle className="text-lg font-semibold flex items-center justify-between">
                            {table.name}
                            <div className="flex items-center">
                              <Badge variant="secondary" className="mr-2">{table.changes.length} changes</Badge>
                              {expandedTables[table.name] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        {expandedTables[table.name] && (
                          <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                              <Checkbox
                                id={`selectAll-${table.name}`}
                                onCheckedChange={(checked) => {
                                  const newSelected = {...selectedChanges}
                                  table.changes.forEach(change => {
                                    newSelected[change.id] = checked as boolean
                                  })
                                  setSelectedChanges(newSelected)
                                }}
                              />
                              <Label htmlFor={`selectAll-${table.name}`} className="text-sm font-medium">
                                Select All
                              </Label>
                              <Button size="sm" onClick={() => handleApproveAll(table.name)}>
                                <Check className="h-4 w-4 mr-1" /> Approve All
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectAll(table.name)}>
                                <X className="h-4 w-4 mr-1" /> Reject All
                              </Button>
                            </div>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[50px]">Sr No.</TableHead>
                                    <TableHead className="w-[120px]">Actions</TableHead>
                                    <TableHead className="w-[50px]">Select</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Reason</TableHead>
                                    {table.changes[0]?.rowData && Object.keys(table.changes[0].rowData).map((columnName) => (
                                      <TableHead key={columnName}>{columnName}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {table.changes.map((change, index) => (
                                    <TableRow key={change.id}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleApprove(change.id)}
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            onClick={() => handleReject(change.id)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Checkbox
                                          checked={selectedChanges[change.id]}
                                          onCheckedChange={() => toggleChangeSelection(change.id)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="whitespace-nowrap">{change.user}</div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="whitespace-nowrap">{change.dateTime}</div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="whitespace-nowrap">{change.reason}</div>
                                      </TableCell>
                                      {change.rowData && Object.keys(change.rowData).map((columnName) => {
                                        const columnChange = change.changes.find(c => c.column === columnName);
                                        const isChanged = !!columnChange;
                                        
                                        return (
                                          <TableCell 
                                            key={columnName}
                                            className={isChanged ? 'bg-yellow-50' : ''}
                                          >
                                            {isChanged ? (
                                              <div className="flex flex-col">
                                                <span className="line-through text-gray-500">
                                                  {columnChange.oldValue}
                                                </span>
                                                <span className="text-green-600">
                                                  {columnChange.newValue}
                                                </span>
                                              </div>
                                            ) : (
                                              change.rowData[columnName]
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-white font-poppins">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter rejection reason..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectModalOpen(false)
                setRejectReason("")
                setCurrentRejectId(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={submitReject}
              disabled={!rejectReason.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-white font-poppins max-w-2xl">
          <DialogHeader>
            <DialogTitle>Row Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[60vh]">
              <div className="grid gap-4">
                {currentViewData && Object.entries(currentViewData).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right font-medium">{key}</Label>
                    <div className="col-span-2 break-words">
                      {value || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setIsViewModalOpen(false)
                setCurrentViewData(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}