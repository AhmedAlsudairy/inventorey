import { Suspense } from 'react'
import Link from 'next/link'
import { getStatusTypes } from '@/app/actions/status'
import StatusTable from '@/components/status/StatusTable'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, Plus } from 'lucide-react'

export default async function StatusPage() {
  const statusTypes = await getStatusTypes()
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Status Management</h1>
          <p className="text-muted-foreground">
            Manage status types for products, inventory, and other entities
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/status/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Status
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<div className="py-8 text-center">Loading status types...</div>}>
        {statusTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3">
              <ClipboardCheck className="h-6 w-6" />
            </div>            <h3 className="mt-4 text-lg font-semibold">No status types</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
              You haven&apos;t added any status types yet. Add one to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/status/new">
                <Plus className="mr-2 h-4 w-4" />
                Add your first status
              </Link>
            </Button>
          </div>
        ) : (
          <StatusTable statusTypes={statusTypes} />
        )}
      </Suspense>
    </div>
  )
}
