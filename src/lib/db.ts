import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient // create type 
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

// similar to singleton (but not singleton pattern)
const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma