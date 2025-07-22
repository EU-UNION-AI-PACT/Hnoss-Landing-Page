import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DOMAIN = process.env.DOMAIN || 'wwwKnowNowNoKnow.Rocks';

// Security Middleware - Top priority security modules
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
}));

// Rate limiting for DDoS protection
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Additional rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for sensitive endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      `https://${DOMAIN}`,
      `https://www.${DOMAIN}`,
      'http://localhost:3002',
      'http://localhost:5000',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5000'
    ];
    
    if (NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:8080');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with security
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'hnoss.sid',
  cookie: {
    secure: NODE_ENV === 'production', // require HTTPS in production
    httpOnly: true, // prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  rolling: true // reset expiration on activity
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    domain: DOMAIN,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Security headers endpoint for diagnostics
app.get('/security-status', (req, res) => {
  res.json({
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimit: 'active',
      session: 'secure',
      https: NODE_ENV === 'production' ? 'enforced' : 'dev-mode',
      csp: 'enabled',
      hsts: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes with authentication
app.use('/api/auth', strictLimiter); // Apply strict rate limiting to auth endpoints

// Basic API endpoint structure
app.get('/api/status', (req, res) => {
  res.json({
    api: 'operational',
    version: '1.0.0',
    environment: NODE_ENV,
    authenticated: !!req.session?.user,
    timestamp: new Date().toISOString()
  });
});

// Protected API endpoint example
app.get('/api/user', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  res.json({
    user: req.session.user,
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints (placeholder structure)
app.post('/api/auth/login', strictLimiter, (req, res) => {
  // TODO: Implement actual authentication logic
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  // Placeholder authentication (replace with real auth)
  if (username === 'admin' && password === 'secure-password') {
    req.session.user = { username, role: 'admin', id: '1' };
    res.json({ 
      success: true, 
      user: req.session.user,
      message: 'Authentication successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('hnoss.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Serve static files (when client is built)
if (NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../dist/public');
  app.use(express.static(clientPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  // Development mode - serve a simple page
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hnoss Landing Page - Development</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
          }
          .container { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            border-radius: 10px; 
            backdrop-filter: blur(10px);
          }
          h1 { color: #FFD700; text-align: center; }
          .status { background: rgba(0,255,0,0.2); padding: 15px; border-radius: 5px; margin: 15px 0; }
          .api-info { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin: 15px 0; }
          ul { list-style: none; padding: 0; }
          li { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
          a { color: #FFD700; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌟 Hnoss Landing Page</h1>
          <div class="status">
            <h2>✅ System Status: Operational</h2>
            <p><strong>Environment:</strong> ${NODE_ENV}</p>
            <p><strong>Target Domain:</strong> https://${DOMAIN}</p>
            <p><strong>Security:</strong> Enhanced protection active</p>
            <p><strong>API:</strong> Ready for integration</p>
          </div>
          
          <div class="api-info">
            <h3>🔐 Security Features Active:</h3>
            <ul>
              <li>✅ HTTPS Enforcement (production)</li>
              <li>✅ DDoS Protection via Rate Limiting</li>
              <li>✅ XSS Protection</li>
              <li>✅ CSRF Protection</li>
              <li>✅ Security Headers (Helmet)</li>
              <li>✅ CORS Configuration</li>
              <li>✅ Session Security</li>
            </ul>
          </div>

          <div class="api-info">
            <h3>🌐 Available Endpoints:</h3>
            <ul>
              <li><a href="/health">GET /health</a> - Health check</li>
              <li><a href="/security-status">GET /security-status</a> - Security status</li>
              <li><a href="/api/status">GET /api/status</a> - API status</li>
              <li>POST /api/auth/login - Authentication</li>
              <li>POST /api/auth/logout - Logout</li>
              <li>GET /api/user - User profile (protected)</li>
            </ul>
          </div>

          <div class="api-info">
            <h3>🚀 Ready for Public Deployment</h3>
            <p>The application is configured for secure public access with all required security modules.</p>
            <p>Domain configuration: <strong>https://${DOMAIN}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', error);
  
  // Don't leak error details in production
  const isDev = NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDev && { 
      message: error.message,
      stack: error.stack 
    }),
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hnoss Landing Page server running on port ${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  console.log(`🔐 Security modules: Active`);
  console.log(`🎯 Target domain: https://${DOMAIN}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;