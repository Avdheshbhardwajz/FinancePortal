import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EditField } from './EditField'
import { useState } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'

interface AddDialogProps {
  isOpen: boolean
  onClose: () => void
  columnConfigs: any
  tableName: string
  onSuccess: () => void
}

export const AddDialog = ({
  isOpen,
  onClose,
  columnConfigs,
  tableName,
  onSuccess,
}: AddDialogProps) => {
  const [newData, setNewData] = useState<any>({})
  const { toast } = useToast()

  const handleFieldChange = (field: string, value: any) => {
    setNewData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:5000/table/${tableName}/add`, newData)
      toast({
        title: "Success",
        description: "Record added successfully",
      })
      onSuccess()
      onClose()
      setNewData({})
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add record",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-poppins bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">Add New Record</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(columnConfigs)
            .filter(([field, config]: [string, any]) => config.isEditable !== false)
            .map(([field, config]: [string, any]) => (
              <EditField
                key={field}
                field={field}
                value={newData[field]}
                config={config}
                onChange={(value) => handleFieldChange(field, value)}
              />
            ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Record</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
