# Sample API Requests & Responses

## 1. Register a New Vendor (POST `/api/vendors`)
**Request:**
```http
POST /api/vendors
Content-Type: application/json

{
  "name": "Acme Identity Verification",
  "capability": "kyc",
  "priority": 2,
  "weight": 40,
  "costPerRequest": 0.50,
  "rateLimit": 200,
  "timeoutMs": 2500,
  "supportedFeatures": ["kyc", "liveness_check"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "id": "e4b2d1c3-4a5f-4a6b-8c7d-9e0f1a2b3c4d",
    "name": "Acme Identity Verification",
    "capability": "kyc",
    "status": "healthy",
    "costPerRequest": 0.5,
    "rateLimit": 200,
    "metadata": {
      "capabilities": ["kyc", "liveness_check"]
    }
  }
}
```

## 2. Route a Request (POST `/api/route`)
**Request:**
```http
POST /api/route
Content-Type: application/json

{
  "capability": "kyc",
  "routing_preference": "lowest_cost",
  "payload": {
    "userId": "user_88321",
    "documentType": "passport",
    "image": "base64_encoded_string_here"
  },
  "requirements": {
    "maxLatencyMs": 3000,
    "preferLowCost": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requestId": "r_99214ab",
    "vendorUsed": "Jumio Core",
    "strategyUsed": "lowest_cost",
    "latencyMs": 142.5,
    "cost": 0.80,
    "response": {
      "verificationStatus": "APPROVED",
      "confidenceScore": 0.98
    }
  }
}
```

## 3. Generate Agentic Routing Config (POST `/api/ai/generate-config`)
**Request:**
```http
POST /api/ai/generate-config
Content-Type: application/json

{
  "prompt": "Route 80 percent of traffic to Stripe Identity and the remaining 20 percent to Jumio Core. If they fail, drop the max latency to 2000."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "strategy": "weighted",
    "config": {
      "weights": {
        "Stripe Identity": 80,
        "Jumio Core": 20
      }
    },
    "failover": {
      "max_latency_ms": 2000
    },
    "reasoning": "The prompt explicitly states percentages for traffic distribution between vendors, which translates to a 'weighted' routing strategy. It also specifies a failover condition for latency."
  }
}
```
