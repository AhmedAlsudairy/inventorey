import { getProduct } from '@/app/actions/product'
import ProductDetails from '@/components/product/ProductDetails'
import { notFound } from 'next/navigation'

export type ParamsType = Promise<{ id: string }>;

interface PageProps {
  params: ParamsType
}

export default async function ProductPage({ params }: PageProps) {
  // Await and resolve the params Promise
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  if (isNaN(id)) {
    return notFound()
  }
  
  try {
    const product = await getProduct(id)
    
    return (
      <div className="container mx-auto py-6">
        <ProductDetails product={product} />
      </div>
    )
  } catch (error) {
    console.log(error)
    return notFound()
  }
}