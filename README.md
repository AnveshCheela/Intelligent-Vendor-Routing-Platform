# Intelligent Vendor Routing Platform

A production-grade, AI-powered load balancer and traffic director designed to dynamically route API requests to third-party vendors (e.g., KYC, OCR, Fraud Detection) based on real-time latency, cost optimization, capability matching, and mathematical weighting.

## Key Features
- **Dynamic Routing Engine**: Route requests via Lowest Latency, Lowest Cost, Weighted Load Balancing, or Feature-Based matching.
- **Agentic AI Configuration**: Uses Google Gemini to translate natural English prompts into JSON routing configurations.
- **Automatic Failover**: Instantly detects offline or degraded vendors and reroutes traffic to healthy alternatives.
- **Interactive Dashboard**: Built with React & Vite to monitor active vendors, live traffic distribution, and latency trends.
- **Robust Backend**: Node.js, Express, PostgreSQL (Prisma), and Redis caching.

## Mandatory APIs Included
- `POST /api/vendors` - Register a new vendor with capabilities, rate limits, cost, and priority.
- `GET /api/vendors` - Retrieve paginated list of all vendors.
- `POST /api/route` - The core routing engine endpoint.
- `GET /api/vendor-metrics` - Retrieve system health and routing statistics.
- `GET /api/routing-logs` - Retrieve a history of all routing decisions.
- `GET /api/health` - System health check.

---

## 🏗 Architecture Diagram
The architecture relies on a highly scalable, decoupled microservice pattern.

```mermaid
graph TD
    Client[Client App / Dashboard] -->|HTTP/REST| API[Node.js Express Server]
    
    subgraph Backend Architecture
        API -->|Validates| RateLimiter[Redis Rate Limiter]
        RateLimiter --> RoutingEngine[Dynamic Routing Engine]
        
        RoutingEngine -->|Reads Config| DB[(PostgreSQL)]
        RoutingEngine -->|Reads Latency| Cache[(Redis Metrics)]
        
        RoutingEngine -->|Fallback & AI| Gemini[Google Gemini AI]
    end
    
    RoutingEngine -->|HTTP/REST| VendorA[Vendor: Stripe Identity]
    RoutingEngine -->|HTTP/REST| VendorB[Vendor: Jumio Core]
    RoutingEngine -->|HTTP/REST| VendorC[Vendor: Microblink]
```

## 🔄 Sequence Diagram (Routing a Request)
```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Router as Routing Engine
    participant Cache as Redis
    participant Vendor as Target Vendor
    
    Client->>API: POST /api/route { capability: "kyc" }
    API->>Cache: Check Rate Limit
    Cache-->>API: Allowed
    
    API->>Router: Execute Active Strategy (e.g., Lowest Latency)
    Router->>Cache: Fetch p95 Latencies for KYC Vendors
    Cache-->>Router: Jumio (50ms), Stripe (120ms)
    
    Router->>Vendor: Forward Request to Jumio
    alt Vendor Down or Timeout
        Vendor-->>Router: 503 Service Unavailable
        Router->>Router: Initiate Failover
        Router->>Vendor: Forward Request to Stripe
    end
    
    Vendor-->>Router: 200 OK (Verification Success)
    Router->>Cache: Log Latency & Success Metric
    Router-->>API: Standardized Vendor Response
    API-->>Client: 200 OK + JSON Payload
```

## 🗄 Entity-Relationship (ER) Diagram
```mermaid
erDiagram
    VENDOR {
        String id PK
        String name
        String capability
        String status
        Int priority
        Float weight
        Float costPerRequest
        Int rateLimit
        Int timeoutMs
    }
    
    VENDOR_METRIC {
        String id PK
        String vendorId FK
        Float avgLatencyMs
        Float successRate
        Float errorRate
    }
    
    ROUTING_LOG {
        String id PK
        String vendorId FK
        String capability
        String strategyUsed
        Float latencyMs
        String status
    }
    
    VENDOR ||--o{ VENDOR_METRIC : "tracks"
    VENDOR ||--o{ ROUTING_LOG : "receives"
```

---

## Quickstart (Docker)
1. Provide a `GEMINI_API_KEY` in your `.env` file.
2. Run `docker compose up --build -d`
3. Access the Dashboard at `http://localhost:8080`
4. Access the API at `http://localhost:3000`
