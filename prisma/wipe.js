import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function reset() {
  await prisma.routingLog.deleteMany();
  await prisma.routingRule.deleteMany();
  await prisma.vendor.deleteMany();
  console.log('Deleted all records');
}

reset()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
