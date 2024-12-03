import { Upload, FileUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ImportDialogProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpload: () => void
  file: File | null
}

export const ImportDialog = ({ handleFileChange, handleUpload, file }: ImportDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="flex items-center">
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-white font-poppins">
      <DialogHeader>
        <DialogTitle>Import CSV File</DialogTitle>
        <DialogDescription>
          Upload a CSV file to update data in bulk.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="csv-file" className="text-right">
            CSV File
          </Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleUpload} disabled={!file}>
          <FileUp className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)
