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
import { useToast } from "@/hooks/use-toast"
import { fetchChangeTrackerData, approveChange, rejectChange } from '@/services/api'
import { ChangeTrackerData } from '@/types/checkerData'
import logo from "../assets/Logo.png"

interface ColumnChange {
  column: string
  oldValue: string
  newValue: string
}

interface Change {
  id: number
  user: string
  dateTime: string
  reason: string
  changes: ColumnChange[]
  fullRow: Record<string, string>
  tableName: string
  status: 'pending' | 'approved' | 'rejected'
  newValues?: Record<string, any>
  oldValues?: Record<string, any>
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
  const [currentRejectId, setCurrentRejectId] = useState<number | null>(null)
  const [currentViewData, setCurrentViewData] = useState<Record<string, string> | null>(null)
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const [pendingChanges, setPendingChanges] = useState<Change[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadPendingChanges = async () => {
    try {
      setIsLoading(true)
      const response = await fetchChangeTrackerData()
      if (response.success) {
        const transformedChanges: Change[] = response.data
          .filter((change: ChangeTrackerData) => change.status === 'pending')
          .map((change: ChangeTrackerData) => ({
            id: change.id,
            user: change.maker_name || 'Unknown User',
            dateTime: new Date(change.created_at).toLocaleString(),
            reason: change.comments || 'No reason provided',
            changes: Object.keys(change.new_values || {}).map(key => ({
              column: key,
              oldValue: String(change.old_values?.[key] ?? ''),
              newValue: String(change.new_values?.[key])
            })),
            fullRow: { ...change.old_values, ...change.new_values },
            tableName: change.table_name,
            status: change.status,
            newValues: change.new_values,
            oldValues: change.old_values,
            rowData: { ...change.old_values, ...change.new_values }
          }))
        setPendingChanges(transformedChanges)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch pending changes"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPendingChanges()
  }, [])

  const organizedData = {
    totalChanges: pendingChanges.length,
    tables: pendingChanges.reduce((tables: Table[], change) => {
      let table = tables.find(t => t.name === change.tableName)
      if (!table) {
        table = { name: change.tableName, changes: [] }
        tables.push(table)
      }
      table.changes.push(change)
      return tables
    }, [])
  }

  const toggleChangeSelection = (changeId: number) => {
    setSelectedChanges(prev => ({ ...prev, [changeId]: !prev[changeId] }))
  }

  const handleView = (rowData: Record<string, string>) => {
    setCurrentViewData(rowData)
    setIsViewModalOpen(true)
  }

  const handleApprove = async (changeId: number) => {
    try {
      setIsLoading(true)
      const response = await approveChange(changeId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Change approved successfully"
        })
        setPendingChanges(prev => prev.filter(change => change.id !== changeId))
        setSelectedChanges(prev => {
          const newSelected = { ...prev }
          delete newSelected[changeId]
          return newSelected
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve change"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!currentRejectId || !rejectReason.trim()) return

    try {
      setIsLoading(true)
      const response = await rejectChange(currentRejectId, rejectReason)
      if (response.success) {
        toast({
          title: "Success",
          description: "Change rejected successfully"
        })
        setPendingChanges(prev => prev.filter(change => change.id !== currentRejectId))
        setSelectedChanges(prev => {
          const newSelected = { ...prev }
          delete newSelected[currentRejectId]
          return newSelected
        })
        setIsRejectModalOpen(false)
        setRejectReason("")
        setCurrentRejectId(null)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject change"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openRejectModal = (changeId: number) => {
    setCurrentRejectId(changeId)
    setIsRejectModalOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("checkerToken")
    navigate("/login")
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }))
  }

  const handleApproveAll = (tableName: string) => {
    try {
      const changes = pendingChanges.filter(change => change.tableName === tableName)
      changes.forEach(change => handleApprove(change.id))
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve all changes"
      })
    }
  }

  const handleRejectAll = (tableName: string) => {
    const changes = pendingChanges.filter(change => change.tableName === tableName)
    if (changes.length > 0) {
      setCurrentRejectId(changes[0].id)
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
          {organizedData.tables.map((table, tableIndex) => (
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
                                  onClick={() => openRejectModal(change.id)}
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
              onClick={handleReject}
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