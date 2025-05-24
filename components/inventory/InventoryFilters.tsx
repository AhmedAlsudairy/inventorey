'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getRacks } from '@/app/actions/rack'
import { getShelves } from '@/app/actions/shelf'
import { X } from 'lucide-react'

interface Rack {
  id: number
  rackCode: string
  warehouse: {
    name: string
  }
}

interface Shelf {
  id: number
  rackId: number
  shelfCode: string
  rack: {
    rackCode: string
    warehouseId: number
    warehouse: {
      name: string
    }
  }
}

export default function InventoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [racks, setRacks] = useState<Rack[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  
  const currentRackId = searchParams.get('rackId')
  const currentShelfId = searchParams.get('shelfId')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [racksData, shelvesData] = await Promise.all([
          getRacks(),
          getShelves()
        ])
        setRacks(racksData)
        setShelves(shelvesData)
      } catch (error) {
        console.error('Failed to load filter data:', error)
      }
    }

    loadData()
  }, [])
    // Filter shelves based on selected rack
  const filteredShelves = currentRackId
    ? shelves.filter((shelf: Shelf) => shelf.rackId === parseInt(currentRackId))
    : shelves

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Clear shelf filter if rack changes
    if (key === 'rackId' && value !== currentRackId) {
      params.delete('shelfId')
    }
    
    router.push(`/dashboard/inventory?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/dashboard/inventory')
  }

  const hasActiveFilters = currentRackId || currentShelfId

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="min-w-0 flex-1">
          <label className="text-sm font-medium mb-1 block">Filter by Rack</label>          <Select
            value={currentRackId || 'all'}
            onValueChange={(value) => updateFilter('rackId', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All racks" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All racks</SelectItem>
              {racks.map((rack) => (
                <SelectItem key={rack.id} value={rack.id.toString()}>
                  {rack.rackCode} ({rack.warehouse.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1">
          <label className="text-sm font-medium mb-1 block">Filter by Shelf</label>          <Select
            value={currentShelfId || 'all'}
            onValueChange={(value) => updateFilter('shelfId', value === 'all' ? null : value)}
            disabled={!filteredShelves.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="All shelves" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All shelves</SelectItem>
              {filteredShelves.map((shelf) => (
                <SelectItem key={shelf.id} value={shelf.id.toString()}>
                  {shelf.shelfCode} ({shelf.rack.rackCode} - {shelf.rack.warehouse.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="flex items-center gap-2 self-end"
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
