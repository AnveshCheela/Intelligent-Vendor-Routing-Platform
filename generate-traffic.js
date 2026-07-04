import { PrismaClient } from '@prisma/client';
import redis from './src/config/redis.js';
import MetricCollector from './src/services/MetricCollector.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function generateHeavyTraffic() {
  console.log('Fetching vendors...');
  const vendors = await prisma.vendor.findMany();
  
  if (vendors.length === 0) {
    console.log('No vendors found. Exiting.');
    return;
  }

  console.log(`Simulating massive traffic for ${vendors.length} vendors...`);

  // Target: $4,500 total spend
  // Average cost per request is around $0.05
  // 4500 / 0.05 = ~90,000 requests total
  // Let's generate about 10,000 requests per vendor.

  let totalSimulatedSpend = 0;
  
  for (const vendor of vendors) {
    const numRequests = 8000 + Math.floor(Math.random() * 4000); // 8k to 12k
    console.log(`Generating ${numRequests} requests for ${vendor.name}...`);
    
    // We'll process in batches to avoid overwhelming memory
    for (let batch = 0; batch < numRequests; batch += 500) {
      const promises = [];
      const batchSize = Math.min(500, numRequests - batch);
      
      for (let i = 0; i < batchSize; i++) {
        const isSuccess = Math.random() > 0.05; // 95% success rate
        const baseLatency = vendor.metadata?.avgLatency || 100;
        
        // Add some jitter to latency
        const latencyMs = baseLatency + (Math.random() * baseLatency * 0.5) - (baseLatency * 0.25);
        
        const cost = vendor.costPerRequest;
        
        promises.push(MetricCollector.recordRequest(vendor.id, latencyMs, isSuccess, cost));
        
        if (isSuccess) {
          totalSimulatedSpend += cost;
        }
      }
      
      await Promise.all(promises);
    }
  }

  console.log(`\nSimulation Complete!`);
  console.log(`Total Simulated Spend: $${totalSimulatedSpend.toFixed(2)}`);
  
  await prisma.$disconnect();
  redis.disconnect();
}

generateHeavyTraffic().catch(console.error);
