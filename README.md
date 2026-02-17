# 🔗 URL Shortener with Analytics

Professional URL shortening service with advanced analytics, QR codes, and real-time tracking.

## ✨ Features

### Core Functionality
- **URL Shortening** - Create short, memorable links
- **Custom Aliases** - Choose your own short codes (3-20 characters)
- **QR Code Generation** - Download QR codes in PNG/SVG format
- **Password Protection** - Secure links with passwords
- **Expiration Dates** - Set automatic link expiration

### Analytics & Tracking
- **Real-time Analytics** - Track clicks, visitors, and engagement
- **Geographic Data** - Country and city-level location tracking
- **Device Analytics** - Browser, OS, and device type breakdown
- **Referrer Tracking** - See where your traffic comes from
- **Time-series Charts** - Visualize clicks over time (7/30/90 days)
- **CSV Export** - Download analytics data

### Performance
- **Redis Caching** - Lightning-fast redirects with 301 status
- **Async Processing** - BullMQ queues for non-blocking analytics
- **Rate Limiting** - IP-based limits (10 URLs/hour)
- **Batch Processing** - Efficient database writes

## 🏗️ Tech Stack

### Backend
- **Node.js 20+** with TypeScript (strict mode)
- **Express.js** - Fast, minimalist web framework
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and rate limiting
- **Prisma ORM** - Type-safe database access
- **BullMQ** - Queue system for analytics
- **GeoIP-Lite** - IP geolocation (offline)
- **QRCode** - QR code generation

### Frontend
- **React 18** with TypeScript
- **Vite** - Next-generation build tool
- **TailwindCSS** - Utility-first CSS
- **TanStack Query** - Data fetching and state management
- **React Hook Form + Zod** - Form validation
- **Recharts** - Beautiful analytics charts
- **Lucide React** - Modern icon library

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Production web server
- **Multi-stage builds** - Optimized Docker images

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd url-shortener

# Start all services
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis (or use Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## 📋 API Documentation

### Endpoints

#### Create Short URL
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/path",
  "customAlias": "mylink",        // optional
  "expiresAt": "2024-12-31",      // optional
  "password": "secret"            // optional
}

Response 201:
{
  "id": "uuid",
  "shortCode": "mylink",
  "shortUrl": "http://localhost:3001/mylink",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-12-31T23:59:59Z",
  "qrCodeUrl": "http://localhost:3001/api/qr/mylink"
}
```

#### Redirect to Original URL
```http
GET /:shortCode

Response: 301 Redirect to original URL
```

#### Get User's URLs
```http
GET /api/urls?page=1&limit=20

Response 200:
{
  "urls": [...],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

#### Get URL Analytics
```http
GET /api/urls/:id/analytics?days=30

Response 200:
{
  "totalClicks": 1234,
  "uniqueVisitors": 567,
  "clicksByDate": [...],
  "topCountries": [...],
  "topDevices": [...],
  "topBrowsers": [...],
  "topReferers": [...]
}
```

#### Generate QR Code
```http
GET /api/qr/:shortCode?format=png&size=300

Response: PNG or SVG image
```

#### Export Analytics
```http
GET /api/urls/:id/export

Response: CSV file download
```

## 🗄️ Database Schema

### URLs Table
```sql
CREATE TABLE urls (
  id UUID PRIMARY KEY,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id UUID,
  password_hash VARCHAR(255),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Clicks Table
```sql
CREATE TABLE clicks (
  id BIGSERIAL PRIMARY KEY,
  url_id UUID REFERENCES urls(id),
  ip_hash VARCHAR(64),
  country_code VARCHAR(2),
  city VARCHAR(100),
  browser VARCHAR(50),
  os VARCHAR(50),
  device_type VARCHAR(20),
  referer TEXT,
  clicked_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

- **URL Validation** - Blocks localhost, private IPs, malicious domains
- **Rate Limiting** - 10 URLs per hour per IP
- **Password Protection** - bcrypt hashing for protected links
- **IP Anonymization** - SHA-256 hashed IPs for privacy
- **XSS Protection** - Input sanitization with Zod
- **CORS** - Strict cross-origin policy
- **Helmet.js** - Security headers

## 📊 Analytics Features

- Total clicks and unique visitors
- Geographic distribution (countries, cities)
- Device breakdown (desktop, mobile, tablet)
- Browser and OS statistics
- Referrer tracking
- Time-series graphs (7/30/90 days)
- CSV export for further analysis

## 🎨 UI Features

- Responsive design (mobile-first)
- Real-time click tracking
- One-click copy to clipboard
- QR code preview and download
- Interactive charts with Recharts
- Dark/light color schemes
- Smooth animations

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/urlshortener
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 📦 Project Structure

```
url-shortener/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   │   └── url.controller.ts
│   │   ├── services/
│   │   │   ├── url.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── qrcode.service.ts
│   │   ├── queues/
│   │   │   └── analytics.queue.ts
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts
│   │   │   └── validation.ts
│   │   ├── utils/
│   │   │   ├── url.utils.ts
│   │   │   └── analytics.utils.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Card.tsx
│   │   │   ├── UrlShortenerForm.tsx
│   │   │   ├── UrlList.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## 🚦 Development Phases

### Phase 1: MVP (Completed)
- ✅ URL shortening with custom aliases
- ✅ Redis caching for fast redirects
- ✅ PostgreSQL database setup
- ✅ Basic frontend with form

### Phase 2: Analytics (Completed)
- ✅ Click tracking with BullMQ
- ✅ GeoIP integration
- ✅ User agent parsing
- ✅ Analytics dashboard with charts

### Phase 3: Advanced Features (Completed)
- ✅ QR code generation
- ✅ Expiration dates
- ✅ Password protection
- ✅ CSV export

### Phase 4: Production Ready
- ✅ Docker containerization
- ✅ Rate limiting
- ✅ Security hardening
- ⏳ User authentication (future)
- ⏳ API keys (future)

## 🔄 Scaling Considerations

For high-traffic scenarios (10M+ clicks/day):

1. **Database**
   - PostgreSQL read replicas for analytics queries
   - Partitioning clicks table by month
   - Consider ClickHouse for analytics

2. **Caching**
   - Redis cluster for HA
   - CDN for QR codes and static assets
   - Edge caching for redirects

3. **Application**
   - Horizontal scaling with load balancer
   - Separate analytics workers
   - Microservices architecture

## 📝 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using modern web technologies
