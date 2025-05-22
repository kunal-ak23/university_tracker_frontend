import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps {
  title: string
  column: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort: (column: string, direction: 'asc' | 'desc') => void
}

export function DataTableColumnHeader({
  title,
  column,
  sortColumn,
  sortDirection,
  onSort,
}: DataTableColumnHeaderProps) {
  const isSorted = sortColumn === column

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{title}</span>
          {isSorted ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onSort(column, 'asc')}>
          <ChevronUp className="mr-2 h-4 w-4" />
          Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort(column, 'desc')}>
          <ChevronDown className="mr-2 h-4 w-4" />
          Descending
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 