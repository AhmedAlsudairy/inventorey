import Link from 'next/link'
import StatusForm from '@/components/status/StatusForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewStatusPage() {
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        asChild
        className="mb-6"
      >
        <Link href="/dashboard/status">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Status Types
        </Link>
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Status Type</h1>
        <p className="text-muted-foreground">
          Add a new status type for your products, inventory, or other entities
        </p>
      </div>
      
      <StatusForm />
    </div>
  )
}
