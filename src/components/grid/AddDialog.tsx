import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EditField } from './EditField'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { submitRequestData } from '@/services/api'
import { RequestDataPayload } from '@/types/requestData'

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
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleFieldChange = (field: string, value: any) => {
    setNewData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const payload: RequestDataPayload = {
        table_name: tableName,
        old_values: {}, // Empty object for new records
        new_values: newData,
        maker_id: 1, // Using default user ID temporarily
        comments: 'New record added'
      }

      await submitRequestData(payload)
      
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white font-poppins">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">Add New Record</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {Object.entries(columnConfigs)
            .filter(([field]) => field !== 'id' && field !== 'dim_branch_sk')
            .map(([field, config]: [string, any]) => (
              <EditField
                key={field}
                field={field}
                config={config}
                value={newData[field] || ''}
                onChange={(value) => handleFieldChange(field, value)}
              />
            ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
