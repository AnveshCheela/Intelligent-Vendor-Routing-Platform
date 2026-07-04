# Explanation of Routing Decisions

The Intelligent Vendor Routing Platform utilizes a multi-strategy routing engine to dynamically evaluate and select the optimal third-party vendor for any incoming request. Below is the technical breakdown of how the routing decisions are made.

## Strategy Evaluation Hierarchy
When `POST /api/route` is called, the `VendorRouter` executes the active strategy. If no specific strategy is requested by the client, it defaults to the system-wide active strategy (e.g., `LowestCost` or `Weighted`).

### 1. Lowest Latency Strategy
- **Decision Logic:** The system queries the Redis time-series database to retrieve the `p95LatencyMs` (the 95th percentile latency over the last rolling window) for all healthy vendors matching the requested `capability`.
- **Selection:** It strictly sorts the array ascending by latency and selects the lowest value. This prioritizes speed and user experience over financial cost.

### 2. Lowest Cost Strategy
- **Decision Logic:** The engine queries PostgreSQL for the `costPerRequest` values of all healthy, capable vendors. 
- **Selection:** It sorts ascending by cost. This strategy is critical for bulk processing or asynchronous tasks where speed is not the primary factor, but operational budget is.

### 3. Weighted (Load Balancing) Strategy
- **Decision Logic:** The engine acts as a mathematical traffic splitter. It maps the `weight` integer column from the database (e.g., Vendor A: 70, Vendor B: 30) onto a distribution line between 0 and 100.
- **Selection:** It generates a secure random number (0-100). If the number falls between 0-70, it selects Vendor A. If 71-100, Vendor B. This ensures traffic accurately mirrors the configured SLA commitments.

### 4. Feature-Based Matching
- **Decision Logic:** When the request payload strictly requires a specific nested feature (e.g., `requires: ["liveness_check"]`), the engine scans the JSON `metadata.capabilities` column in PostgreSQL.
- **Selection:** Vendors lacking the required sub-capability are entirely filtered out of the pool. The remaining eligible vendors are then sorted by `priority`.

## Failover Mechanisms (Graceful Degradation)
A critical requirement of the routing decision is **resiliency**. 
If the actively selected vendor times out or returns a `503 Service Unavailable` error:
1. The `RoutingEngine` catches the HTTP exception natively.
2. It immediately flags the vendor as `degraded` in Redis.
3. It writes a `RoutingLog` to PostgreSQL with `fallbackReason: "Vendor timeout"`.
4. The router recursively loops, removes the degraded vendor from the eligible array, and passes the payload to the *next* best vendor according to the active strategy.
