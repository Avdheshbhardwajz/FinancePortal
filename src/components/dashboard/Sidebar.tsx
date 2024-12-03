import { Button } from "@/components/ui/button"
import { TableInfo, SelectedTableState } from "@/types/tables"

interface SidebarProps {
  sidebarOpen: boolean
  isLoading: boolean
  error: string | null
  tables: TableInfo[]
  setSelectedTable: (table: SelectedTableState) => void
}

export const Sidebar = ({ 
  sidebarOpen, 
  isLoading, 
  error, 
  tables, 
  setSelectedTable 
}: SidebarProps) => (
  <div className={`bg-white overflow-y-auto custom-scrollbar w-64 shadow-lg transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="p-4">
      <h2 className="text-xl font-semibold text-[#00529B] mb-4">Select Tables</h2>
      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00529B]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm py-2">{error}</div>
        ) : (
          <nav>
            {tables.map((table, index) => (
              <Button
                key={index}
                onClick={() => setSelectedTable({
                  name: table.name,
                  filename: table.filename
                })}
                variant="ghost"
                className="w-full justify-start text-left mb-2 hover:bg-[#00529B] hover:text-white"
              >
                {table.name}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </div>
  </div>
)
