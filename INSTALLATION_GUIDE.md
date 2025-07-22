# Installation & Setup Guide

## DSGVO-Menschenrechte-KI-Ethik-Systemintegration

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Environment Setup

1. **Clone & Install**
```bash
git clone <repository-url>
cd DSGVO-Menschenrechte-KI-Ethik-Systemintegration
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sacred_dev"

# Authentication
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
FRONTEGG_CLIENT_ID="your-frontegg-id"

# APIs
OPENAI_API_KEY="sk-..."
GITHUB_TOKEN="ghp_..."
TWILIO_ACCOUNT_SID="AC..."
WEATHER_API_KEY="your-weather-key"

# Security
SESSION_SECRET="your-secure-session-secret"
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Start Development Server**
```bash
npm run dev
```

### Accessing the Platform

- **Main Application**: http://localhost:5000
- **Navigation Hub**: http://localhost:5000/navigation
- **Certificate**: http://localhost:5000/certificate
- **Stack-Tech Platform**: http://localhost:5000/stack-tech
- **API Manager**: http://localhost:5000/api-manager
- **Admin Dashboard**: http://localhost:5000/admin

### Production Deployment

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t sacred-platform .
docker run -p 5000:5000 sacred-platform
```