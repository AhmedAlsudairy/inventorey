import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStatusTypeById } from '@/app/actions/status'
import StatusForm from '@/components/status/StatusForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function EditStatusPage({ params }: PageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  const statusType = await getStatusTypeById(id)
  
  if (!statusType) {
    notFound()
  }
  
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
        <h1 className="text-2xl font-bold tracking-tight">Edit Status Type</h1>
        <p className="text-muted-foreground">
          Update the details for this status type
        </p>
      </div>
      
      <StatusForm initialData={statusType} />
    </div>
  )
}