# URL Shortener Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Device]
    end

    subgraph "Frontend - React"
        UI[React UI<br/>Tailwind CSS]
        Router[React Router]
        Query[TanStack Query<br/>State Management]
    end

    subgraph "Backend - Express.js"
        API[REST API<br/>Express]
        Controller[Controllers]
        Service[Services]
        Middleware[Middleware<br/>Rate Limit, Validation]
    end

    subgraph "Data Processing"
        Queue[BullMQ<br/>Analytics Queue]
        Worker[Queue Workers<br/>Async Processing]
    end

    subgraph "Data Layer"
        Redis[(Redis Cache<br/>URL Mapping)]
        Postgres[(PostgreSQL<br/>URLs & Analytics)]
        GeoIP[GeoIP Database<br/>Location Data]
    end

    subgraph "External Services"
        QR[QR Code Generator]
        UserAgent[User Agent Parser]
    end

    Browser --> UI
    Mobile --> UI
    UI --> Router
    Router --> Query
    Query --> API
    
    API --> Middleware
    Middleware --> Controller
    Controller --> Service
    
    Service --> Redis
    Service --> Postgres
    Service --> Queue
    
    Queue --> Worker
    Worker --> Postgres
    Worker --> GeoIP
    Worker --> UserAgent
    
    Service --> QR
    
    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style UI fill:#b3e5fc
    style API fill:#81c784
    style Queue fill:#ffb74d
    style Redis fill:#ef5350
    style Postgres fill:#5c6bc0
```

## Data Flow

### 1. URL Shortening Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Redis
    participant PostgreSQL

    User->>Frontend: Enter long URL
    Frontend->>API: POST /api/shorten
    API->>API: Validate URL
    API->>API: Generate short code
    API->>PostgreSQL: Save URL mapping
    API->>Redis: Cache mapping (24h TTL)
    API->>Frontend: Return short URL
    Frontend->>User: Display short link
```

### 2. Redirect & Analytics Flow
```mermaid
sequenceDiagram
    participant User
    participant API
    participant Redis
    participant PostgreSQL
    participant Queue
    participant Worker

    User->>API: GET /:shortCode
    API->>Redis: Check cache
    
    alt Cache Hit
        Redis->>API: Return URL
    else Cache Miss
        API->>PostgreSQL: Query URL
        PostgreSQL->>API: Return URL
        API->>Redis: Update cache
    end
    
    API->>Queue: Enqueue analytics data
    API->>User: 301 Redirect to original URL
    
    Queue->>Worker: Process analytics
    Worker->>Worker: Parse User-Agent
    Worker->>Worker: Get GeoIP location
    Worker->>PostgreSQL: Save click data
```

### 3. Analytics Query Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant PostgreSQL

    User->>Frontend: View analytics
    Frontend->>API: GET /api/urls/:id/analytics?days=30
    API->>PostgreSQL: Aggregate clicks data
    API->>PostgreSQL: Query top countries
    API->>PostgreSQL: Query device breakdown
    API->>PostgreSQL: Query time-series data
    PostgreSQL->>API: Return aggregated data
    API->>Frontend: Send analytics JSON
    Frontend->>Frontend: Render charts
    Frontend->>User: Display dashboard
```

## System Components

### Frontend Components
- **UrlShortenerForm**: Main URL input form with validation
- **UrlList**: Paginated list of user's links
- **AnalyticsDashboard**: Comprehensive analytics with charts
- **UI Components**: Reusable Button, Input, Card components

### Backend Services
- **UrlService**: URL CRUD operations, caching
- **AnalyticsService**: Data aggregation, export
- **QRCodeService**: QR code generation in PNG/SVG

### Queue System
- **Analytics Queue**: Asynchronous click processing
- **Workers**: Background job processors (10 concurrent)

### Middleware
- **Rate Limiter**: IP-based throttling (10/hour)
- **Validation**: Zod schema validation
- **CORS**: Cross-origin security
- **Helmet**: Security headers

## Technology Stack

```mermaid
mindmap
  root((URL Shortener))
    Backend
      Node.js 20
      Express.js
      TypeScript
      Prisma ORM
      BullMQ
    Frontend
      React 18
      Vite
      TailwindCSS
      TanStack Query
      Recharts
    Database
      PostgreSQL 15
      Redis 7
    DevOps
      Docker
      Docker Compose
      Nginx
    Libraries
      QRCode
      GeoIP-Lite
      UA Parser
      Zod
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Production Environment"
        LB[Load Balancer<br/>Nginx]
        
        subgraph "Application Tier"
            API1[Backend Instance 1]
            API2[Backend Instance 2]
        end
        
        subgraph "Data Tier"
            PG_Primary[(PostgreSQL<br/>Primary)]
            PG_Replica[(PostgreSQL<br/>Read Replica)]
            Redis_Cluster[(Redis<br/>Cluster)]
        end
        
        CDN[CDN<br/>Static Assets & QR]
    end
    
    Internet[Internet] --> CDN
    Internet --> LB
    LB --> API1
    LB --> API2
    API1 --> Redis_Cluster
    API2 --> Redis_Cluster
    API1 --> PG_Primary
    API2 --> PG_Primary
    API1 --> PG_Replica
    API2 --> PG_Replica
    
    style Internet fill:#e1f5ff
    style CDN fill:#ffb74d
    style LB fill:#81c784
    style PG_Primary fill:#5c6bc0
    style Redis_Cluster fill:#ef5350
```

## Security Layers

```mermaid
graph TD
    A[Request] --> B{Rate Limiter}
    B -->|Allowed| C{CORS Check}
    B -->|Blocked| Z[429 Too Many Requests]
    
    C -->|Valid Origin| D{Input Validation}
    C -->|Invalid| Z
    
    D -->|Valid| E{URL Validation}
    D -->|Invalid| Y[400 Bad Request]
    
    E -->|Safe URL| F[Process Request]
    E -->|Malicious| Y
    
    F --> G{Password Protected?}
    G -->|Yes| H[Verify Password]
    G -->|No| I[Execute]
    
    H -->|Valid| I
    H -->|Invalid| X[401 Unauthorized]
    
    I --> J[Success Response]
    
    style A fill:#e1f5ff
    style F fill:#81c784
    style J fill:#81c784
    style Z fill:#ef5350
    style Y fill:#ef5350
    style X fill:#ef5350
```
