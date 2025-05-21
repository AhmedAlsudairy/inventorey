import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStatusTypeById } from '@/app/actions/status'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export type ParamsType = Promise<{
  id: string;
}>;

interface StatusPageProps {
  params: ParamsType;
}

export default async function StatusPage({ params }: StatusPageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id)
  const statusType = await getStatusTypeById(id)
  
  if (!statusType) {
    notFound()
  }
  
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
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          asChild
        >
          <Link href="/dashboard/status">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Status Types
          </Link>
        </Button>
        
        <Button asChild>
          <Link href={`/dashboard/status/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Status
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{statusType.name}</h1>
        <div className="flex items-center mt-1">
          <Badge className="mr-2">{statusType.code}</Badge>
          <Badge variant="outline" className={getEntityTypeBadgeStyle(statusType.entityType)}>
            {statusType.entityType}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Status Code</dt>
                <dd className="text-base">{statusType.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Status Name</dt>
                <dd className="text-base">{statusType.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Entity Type</dt>
                <dd className="text-base">
                  <Badge variant="outline" className={getEntityTypeBadgeStyle(statusType.entityType)}>
                    {statusType.entityType}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">ID</dt>
                <dd className="text-base">{statusType.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
