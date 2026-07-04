import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Vendors
  const vendors = [
    {
      name: 'Stripe Identity',
      capability: 'kyc',
      priority: 1,
      weight: 70,
      costPerRequest: 0.05,
      rateLimit: 100,
      timeoutMs: 5000,
      status: 'healthy',
      metadata: { avgLatency: 120, capabilities: ['kyc', 'kyc_aml', 'identity'] }
    },
    {
      name: 'Jumio Core',
      capability: 'kyc',
      priority: 2,
      weight: 20,
      costPerRequest: 0.04,
      rateLimit: 50,
      timeoutMs: 8000,
      status: 'degraded',
      metadata: { avgLatency: 210, capabilities: ['kyc', 'identity'] }
    },
    {
      name: 'Microblink OCR',
      capability: 'ocr',
      priority: 1,
      weight: 10,
      costPerRequest: 0.02,
      rateLimit: 200,
      timeoutMs: 3000,
      status: 'down',
      metadata: { avgLatency: 300, capabilities: ['ocr', 'document', 'ocr_data'] }
    },
    {
      name: 'GlobalCheck KYC',
      capability: 'kyc_aml',
      priority: 3,
      weight: 5,
      costPerRequest: 0.03,
      rateLimit: 500,
      timeoutMs: 2000,
      status: 'healthy',
      metadata: { avgLatency: 145, capabilities: ['kyc', 'kyc_aml', 'sanctions_screening'] }
    },
    {
      name: 'Acme Verification',
      capability: 'fraud',
      priority: 2,
      weight: 5,
      costPerRequest: 0.01,
      rateLimit: 1000,
      timeoutMs: 1500,
      status: 'healthy',
      metadata: { avgLatency: 80, capabilities: ['fraud'] }
    }
  ];

  const createdVendors = [];
  for (const v of vendors) {
    const created = await prisma.vendor.create({
      data: v
    });
    createdVendors.push(created);
    console.log(`Created vendor: ${created.name}`);
  }

  // 2. Seed Routing Rule
  const rule = await prisma.routingRule.create({
    data: {
      name: 'Default Weighted Routing',
      strategy: 'weighted',
      isActive: true,
      config: {
        weights: {
          "Stripe Identity": 70,
          "Jumio Core": 20,
          "Microblink OCR": 10
        }
      }
    }
  });
  console.log(`Created active routing rule: ${rule.name}`);

  // 3. Seed some dummy routing logs
  const logs = [];
  const strategies = ['lowest_latency', 'lowest_cost', 'weighted', 'priority'];
  const capabilities = ['kyc', 'ocr', 'fraud'];

  for (let i = 0; i < 20; i++) {
    const isSuccess = Math.random() > 0.1;
    const vendor = createdVendors[Math.floor(Math.random() * createdVendors.length)];
    
    logs.push({
      requestId: `req_${uuidv4().substring(0, 8)}`,
      vendorId: vendor.id,
      capability: capabilities[Math.floor(Math.random() * capabilities.length)],
      strategyUsed: strategies[Math.floor(Math.random() * strategies.length)],
      reason: [`Selected ${vendor.name} based on simulated seed data`],
      latencyMs: vendor.metadata.avgLatency + Math.floor(Math.random() * 50),
      cost: vendor.costPerRequest,
      status: isSuccess ? 'success' : 'failed',
      statusCode: isSuccess ? 200 : 503,
      fallbackReason: isSuccess ? null : 'Simulated vendor timeout'
    });
  }

  await prisma.routingLog.createMany({
    data: logs
  });
  console.log(`Created 20 sample routing logs.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
