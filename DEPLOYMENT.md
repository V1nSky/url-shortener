# 🚀 Deployment Guide

This guide covers deploying the URL Shortener to various platforms.

## Table of Contents
- [Railway](#railway)
- [Render](#render)
- [Vercel + Railway](#vercel--railway)
- [VPS (Hetzner/DigitalOcean)](#vps-hetznerdigitalocean)
- [Environment Variables](#environment-variables)

---

## Railway

Railway provides easy deployment with PostgreSQL and Redis add-ons.

### Backend Deployment

1. **Create a new project** on Railway
2. **Add PostgreSQL** and **Redis** services
3. **Deploy from GitHub**:
   - Connect your repository
   - Set root directory to `/backend`
   - Railway will auto-detect Node.js

4. **Environment Variables**:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.RAILWAY_PRIVATE_DOMAIN}}
REDIS_PORT=${{Redis.PORT}}
NODE_ENV=production
BASE_URL=https://your-app.railway.app
PORT=${{PORT}}
```

5. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
6. **Start Command**: `npm start`

### Frontend Deployment

1. **Create another service** in the same project
2. **Set root directory** to `/frontend`
3. **Environment Variables**:
```env
VITE_API_URL=https://your-backend.railway.app
```

4. **Build Command**: `npm install && npm run build`
5. **Start Command**: Use static file serving or Nginx

---

## Render

Render offers free tiers for PostgreSQL and Redis.

### Backend (Web Service)

1. **Create Web Service**
   - Connect GitHub repository
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`

2. **Add PostgreSQL** (from Render dashboard)
3. **Add Redis** (from Render dashboard)

4. **Environment Variables**:
```env
DATABASE_URL=<from-postgres-service>
REDIS_HOST=<redis-hostname>
REDIS_PORT=<redis-port>
NODE_ENV=production
BASE_URL=https://your-service.onrender.com
```

### Frontend (Static Site)

1. **Create Static Site**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**:
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Vercel + Railway

Best for frontend performance with edge deployment.

### Backend on Railway
Follow Railway backend steps above.

### Frontend on Vercel

1. **Import project** from GitHub
2. **Framework Preset**: Vite
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

6. **Environment Variables**:
```env
VITE_API_URL=https://your-backend.railway.app
```

7. **Vercel Configuration** (`vercel.json` in frontend/):
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    }
  ]
}
```

---

## VPS (Hetzner/DigitalOcean)

For full control and best performance.

### Prerequisites
- Ubuntu 22.04+ server
- Domain name (optional)
- SSH access

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply Docker group changes
sudo reboot
```

### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd url-shortener

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with production values
nano backend/.env
nano frontend/.env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3. Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/urlshortener
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/urlshortener /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### 5. Monitoring & Maintenance

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Update application
git pull
docker-compose down
docker-compose up -d --build

# Backup database
docker exec urlshortener-postgres pg_dump -U postgres urlshortener > backup.sql

# Restore database
cat backup.sql | docker exec -i urlshortener-postgres psql -U postgres urlshortener
```

---

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_HOST=redis-host
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV=production
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend.com

# Security
JWT_SECRET=<generate-long-random-string>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend (.env)

```env
VITE_API_URL=https://api.your-domain.com
```

### Generating Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Performance Optimization

### Production Checklist

- [ ] Enable Redis caching
- [ ] Set up CDN (Cloudflare)
- [ ] Configure database connection pooling
- [ ] Enable gzip compression
- [ ] Set up monitoring (UptimeRobot, Sentry)
- [ ] Configure backup automation
- [ ] Enable HTTPS/SSL
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Enable rate limiting

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_created_at ON urls(created_at);
CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);

-- Partition clicks table by month (for high traffic)
CREATE TABLE clicks_2024_01 PARTITION OF clicks
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Redis Configuration

```conf
# redis.conf optimizations
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

---

## Monitoring

### Health Checks

Backend health endpoint: `GET /health`

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Recommended Tools

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, Rollbar
- **Logs**: Logtail, Papertrail
- **Metrics**: Prometheus + Grafana
- **APM**: New Relic, DataDog

---

## Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**Redis connection fails**
```bash
# Check Redis is running
docker ps | grep redis

# Test Redis
redis-cli -h <host> -p <port> ping
```

**Build fails**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Docker cache
docker-compose down -v
docker-compose build --no-cache
```

---

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review environment variables
3. Verify database migrations: `npx prisma migrate status`
4. Open a GitHub issue with error details
