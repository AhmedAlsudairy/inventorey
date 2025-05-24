// Simple database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.warehouse.findFirst();
    console.log('✅ Database query successful:', result ? 'Data found' : 'No data');
    
    await prisma.$disconnect();
    console.log('✅ Database disconnection successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
