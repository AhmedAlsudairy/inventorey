'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, Eye, MoreHorizontal, Search } from 'lucide-react'

interface StatusType {
  id: number
  code: string
  name: string
  entityType: string
}

interface StatusTableProps {
  statusTypes: StatusType[]
}

export default function StatusTable({ statusTypes }: StatusTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStatusTypes = searchQuery
    ? statusTypes.filter(status => 
        status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.entityType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : statusTypes

  const getEntityTypeBadgeStyle = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'product':
        return 'bg-blue-100 text-blue-800'
      case 'inventory':
        return 'bg-green-100 text-green-800'
      case 'warehouse':
        return 'bg-purple-100 text-purple-800'
      case 'rack':
        return 'bg-amber-100 text-amber-800'
      case 'shelf':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search statuses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStatusTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No status types found
                </TableCell>
              </TableRow>
            ) : (
              filteredStatusTypes.map(status => (
                <TableRow key={status.id}>
                  <TableCell className="font-medium">{status.code}</TableCell>
                  <TableCell>{status.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getEntityTypeBadgeStyle(status.entityType)}>
                      {status.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/status/${status.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/status/${status.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
