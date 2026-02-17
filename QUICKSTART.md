# 🚀 Quick Start Guide

## Prerequisites
- Node.js 20+
- Docker Desktop (recommended) OR PostgreSQL 15 + Redis 7

## Option 1: Docker Compose (Recommended - 2 minutes)

```bash
# 1. Navigate to project directory
cd url-shortener

# 2. Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# 3. Wait 30 seconds for services to initialize

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Health check: http://localhost:3001/health

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Option 2: Local Development (5 minutes)

### Step 1: Start Database Services

```bash
# Start PostgreSQL
docker run -d \
  --name urlshortener-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=urlshortener \
  -p 5432:5432 \
  postgres:15-alpine

# Start Redis
docker run -d \
  --name urlshortener-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment (already configured)
cat .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start backend server
npm run dev

# Backend will run on http://localhost:3001
```

### Step 3: Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

## Verify Installation

### Test Backend
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test URL Shortening
```bash
curl -X POST http://localhost:3001/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'

# Should return short URL details
```

### Open Frontend
Navigate to http://localhost:3000 in your browser

## First Steps

1. **Create a Short URL**
   - Enter a long URL in the form
   - Optionally set a custom alias
   - Click "Shorten URL"

2. **View Your Links**
   - Scroll down to see all your created links
   - Click "Analytics" to view detailed statistics

3. **Download QR Code**
   - Click the "Download QR" button on any link
   - Use the QR code to share your short URL

4. **Track Analytics**
   - Click on a short link multiple times
   - Visit from different devices/browsers
   - View the analytics dashboard to see:
     - Total clicks
     - Unique visitors
     - Geographic distribution
     - Device breakdown
     - Time-series graphs

## Testing the API

Run the included test script:

```bash
chmod +x test-api.sh
./test-api.sh
```

## Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Port 3001 already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database connection error**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
psql postgresql://postgres:postgres@localhost:5432/urlshortener
```

**Redis connection error**
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
# Should return: PONG
```

## Features to Try

✨ **Basic Features**
- [ ] Create a short URL
- [ ] Use custom alias
- [ ] Copy short URL to clipboard
- [ ] Click on short link and verify redirect

🎨 **Advanced Features**
- [ ] Set expiration date for a link
- [ ] Add password protection
- [ ] Generate and download QR code
- [ ] View analytics dashboard
- [ ] Export analytics to CSV
- [ ] Filter analytics by time period (7/30/90 days)

📊 **Analytics Features**
- [ ] View total clicks and unique visitors
- [ ] See geographic distribution
- [ ] Check device types (mobile/desktop/tablet)
- [ ] Analyze browser usage
- [ ] Track referrer sources
- [ ] View clicks over time graph

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check API documentation in README.md
- Explore the codebase structure

## Project Structure

```
url-shortener/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── queues/       # BullMQ jobs
│   │   ├── middleware/   # Rate limiting, validation
│   │   └── utils/        # Helper functions
│   └── prisma/           # Database schema
│
├── frontend/             # React app
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page components
│       └── lib/          # API client, utilities
│
└── docker-compose.yml    # Docker setup
```

## Support

Need help? 
- Check the logs: `docker-compose logs -f`
- Review environment variables in `.env` files
- Open an issue on GitHub

## Performance Tips

🚀 For production deployment:
- Use Docker Compose for easy scaling
- Enable Redis caching (already configured)
- Add Cloudflare CDN for static assets
- Set up database connection pooling
- Monitor with Sentry or New Relic

Happy URL shortening! 🎉
