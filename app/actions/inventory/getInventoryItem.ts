'use server'

import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function getInventoryItem(id: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }
  
  try {    const inventory = await db.inventory.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            documentNo: true,
            productType: true,
            primaryUnit: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        shelf: {
          include: {
            rack: {
              include: {
                warehouse: true
              }
            }
          }
        },
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    })

    // Debug: Log the retrieved inventory position
    console.log('GetInventoryItem - Retrieved inventory:', {
      id: inventory?.id,
      position: inventory?.position,
      quantity: inventory?.quantity,
      unit: inventory?.unit
    })
    
    return inventory
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    throw new Error('Failed to fetch inventory item')
  }
}
