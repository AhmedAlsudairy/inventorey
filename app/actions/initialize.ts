'use server';

import { db } from '@/lib/db';

export async function initializeStatusTypes() {
  // Check if we have any status types for products
  const productStatusCount = await db.statusType.count({
    where: {
      entityType: 'product',
    },
  });

  // If no product status types, create default ones
  if (productStatusCount === 0) {
    await db.statusType.create({
      data: {
        code: 'ACT',
        name: 'Active',
        entityType: 'product',
      }
    });
    
    await db.statusType.create({
      data: {
        code: 'DISC',
        name: 'Discontinued',
        entityType: 'product',
      }
    });
  }

  // Initialize for each entity type to ensure we have basic status types
  const entityTypes = ['inventory', 'warehouse', 'rack', 'shelf'];
  for (const entityType of entityTypes) {
    const statusCount = await db.statusType.count({
      where: {
        entityType,
      },
    });

    if (statusCount === 0) {
      await db.statusType.create({
        data: {
          code: 'ACT',
          name: 'Active',
          entityType,
        }
      });
    }
  }
}
