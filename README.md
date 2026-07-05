# Intelligent Vendor Routing Platform

![Live Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**🌐 Live Production Dashboard:** [https://frontend-drab-psi-qrk3ksyoio.vercel.app/](https://frontend-drab-psi-qrk3ksyoio.vercel.app/)

A production-grade, AI-powered load balancer and traffic director designed to dynamically route API requests to third-party vendors (e.g., KYC, OCR, Fraud Detection) based on real-time latency, cost optimization, capability matching, and mathematical weighting.

## Key Features
- **Dynamic Routing Engine**: Route requests via Lowest Latency, Lowest Cost, Weighted Load Balancing, or Feature-Based matching.
- **Agentic AI Configuration**: Uses Google Gemini to translate natural English prompts into JSON routing configurations.
- **Automatic Failover**: Instantly detects offline or degraded vendors and reroutes traffic to healthy alternatives.
- **Interactive Dashboard**: Built with React & Vite to monitor active vendors, live traffic distribution, and latency trends.
- **Robust Backend**: Node.js, Express, PostgreSQL (Prisma), and Redis caching.
- **Dynamic Global Settings**: Modify core routing thresholds (latency, timeouts) via PostgreSQL in real-time without server restarts.
- **Strict Agentic AI Mode**: Enforce deterministic safety rails to prevent AI fallback generation when API keys are missing.
- **Continuous Integration / Continuous Deployment (CI/CD)**: Automated GitHub Actions pipeline to test backend routing logic, build frontend assets, and verify Docker containers on every commit.

## Mandatory APIs Included
- `POST /api/vendors` - Register a new vendor with capabilities, rate limits, cost, and priority.
- `GET /api/vendors` - Retrieve paginated list of all vendors.
- `POST /api/route` - The core routing engine endpoint.
- `GET /api/vendor-metrics` - Retrieve system health and routing statistics.
- `GET /api/routing-logs` - Retrieve a history of all routing decisions.
- `GET /api/health` - System health check.
- `GET /api/settings` - Retrieve global routing settings.
- `PUT /api/settings` - Update global routing settings.

---

## 🏗 Architecture Diagram
The architecture relies on a highly scalable, decoupled microservice pattern.

```mermaid
graph TD
    Client[Client App / Dashboard] -->|HTTP/REST| API[Node.js Express Server]
    
    subgraph Backend Architecture
        API -->|Validates| RateLimiter[Redis Rate Limiter]
        RateLimiter --> RoutingEngine[Dynamic Routing Engine]
        
        RoutingEngine -->|Reads Settings| SettingsCache[(Redis Settings Cache)]
        SettingsCache -->|Refreshes From| DB[(PostgreSQL)]
        RoutingEngine -->|Reads Config| DB
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

## 🚀 CI/CD Pipeline (GitHub Actions)
This repository is equipped with a production-ready Continuous Integration and Continuous Deployment (CI/CD) pipeline located at `.github/workflows/ci.yml`. On every `push` and `pull_request` to the `main` branch, GitHub Actions automatically provisions an Ubuntu runner to execute:
1. **Backend Tests:** Spins up ephemeral PostgreSQL and Redis instances, runs Prisma migrations, and executes `npm run test` against the routing engine.
2. **Frontend Builds:** Resolves dependencies and builds the React/Vite dashboard to ensure code compiles flawlessly.
3. **Docker Verification:** Performs a clean `docker compose build` to validate the containerization architecture.

---

## Quickstart (Docker)
1. Provide a `GEMINI_API_KEY` in your `.env` file.
2. Run `docker compose up --build -d`
3. Access the Dashboard at `http://localhost:8080`
4. Access the API at `http://localhost:3000`
