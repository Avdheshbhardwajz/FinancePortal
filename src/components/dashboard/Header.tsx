import { Menu, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import logo from "@/assets/Logo.png"
import { ImportDialog } from './ImportDialog'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  handleLogout: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpload: () => void
  file: File | null
}

export const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  handleLogout, 
  handleFileChange, 
  handleUpload, 
  file 
}: HeaderProps) => (
  <header className="bg-white shadow-md p-4 flex items-center justify-between w-full">
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-4"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <img src={logo} alt="Sundaram Logo" className="w-[50%] mr-2" />
    </div>
    <div className="flex items-center space-x-4">
      <ImportDialog handleFileChange={handleFileChange} handleUpload={handleUpload} file={file} />
      <UserMenu handleLogout={handleLogout} />
    </div>
  </header>
)
