# 🛠️ PokéTracker Technology Stack

## Current Stack Implementation

### Frontend Framework
**Next.js 15 with App Router**
- **Why**: Modern React framework with server-side rendering, file-based routing, and excellent developer experience
- **Features Used**:
  - App Router for file-based routing
  - Server Components for better performance
  - Client Components for interactivity
  - Middleware for authentication
  - API Routes (ready for backend logic)

### Language
**TypeScript 5.8**
- **Why**: Type safety, better IDE support, fewer runtime errors
- **Usage**: Strict typing for database schemas, API responses, and components

### Styling
**Tailwind CSS 3.4**
- **Why**: Utility-first CSS framework for rapid UI development
- **Features**:
  - Custom color scheme (Pokémon-themed: red, yellow)
  - Custom animations (floating, pulse, card shine)
  - Responsive design utilities
  - Dark mode ready

### Component Library
**shadcn/ui**
- **Why**: Customizable, accessible components built on Radix UI
- **Components Used**:
  - Button, Card, Input, Badge, Tabs, Select
  - All customized with Pokémon theme
  - Built with Radix UI primitives for accessibility

### Icons
**Lucide React**
- **Why**: Modern, lightweight icon library
- **Usage**: All UI icons (Search, TrendingUp, Bell, etc.)

### Charts & Data Visualization
**Chart.js + react-chartjs-2**
- **Why**: Powerful, flexible charting library
- **Usage**: Price history charts in PriceChart component

### Backend as a Service (BaaS)
**Supabase**
- **PostgreSQL Database**: Production-ready relational database
- **Authentication**: Email/password + OAuth (Google ready)
- **Row Level Security**: Database-level security policies
- **Real-time**: WebSocket subscriptions for live updates
- **Storage**: File uploads (ready for card images)
- **Edge Functions**: Serverless functions (ready for use)

### Package Manager
**Bun 1.2**
- **Why**: Fast JavaScript runtime and package manager
- **Benefits**:
  - Faster installs than npm/yarn
  - Built-in TypeScript support
  - Drop-in replacement for Node.js

### Code Quality
**Biome + ESLint**
- **Biome**: Fast linter and formatter
- **ESLint**: Additional JavaScript/TypeScript linting
- **Why**: Consistent code style, catch errors early

---

## Database Architecture

### Tables

#### `profiles`
User profiles extending Supabase Auth
```sql
- id (UUID, FK to auth.users)
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- created_at, updated_at
```

#### `cards`
Pokémon card catalog
```sql
- id (UUID)
- name (TEXT)
- set_name (TEXT)
- card_number (TEXT)
- rarity (TEXT)
- image_url (TEXT)
- market_price (DECIMAL)
- lowest_price (DECIMAL)
- price_change_percent (DECIMAL)
- created_at, updated_at
```

#### `watchlist`
User card watchlists
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- card_id (UUID, FK to cards)
- created_at
```

#### `portfolio`
User card collections
```sql
- id (UUID)
- user_id (UUID)
- card_id (UUID)
- quantity (INTEGER)
- purchase_price (DECIMAL)
- purchase_date (DATE)
- notes (TEXT)
- created_at, updated_at
```

#### `price_alerts`
Price notification settings
```sql
- id (UUID)
- user_id (UUID)
- card_id (UUID)
- condition ('above' | 'below')
- target_price (DECIMAL)
- email (TEXT)
- enabled (BOOLEAN)
- triggered (BOOLEAN)
- triggered_at (TIMESTAMP)
- created_at, updated_at
```

#### `price_history`
Historical price data
```sql
- id (UUID)
- card_id (UUID)
- price (DECIMAL)
- marketplace (TEXT)
- recorded_at (TIMESTAMP)
```

#### `marketplaces`
Marketplace listings
```sql
- id (UUID)
- card_id (UUID)
- marketplace_name (TEXT)
- price (DECIMAL)
- shipping_cost (TEXT)
- url (TEXT)
- in_stock (BOOLEAN)
- updated_at
```

### Security: Row Level Security (RLS)

All tables have RLS policies:
- **Read**: Public for cards, price_history, marketplaces
- **Write**: Only authenticated users for their own data
- **Isolation**: Users can only access their own watchlist, portfolio, alerts

---

## Authentication Flow

### Email/Password
```
1. User enters email + password
2. Supabase Auth creates user in auth.users
3. Trigger creates profile in public.profiles
4. JWT token returned to client
5. Token stored in HTTP-only cookie
6. Middleware validates token on each request
```

### Google OAuth
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent
3. Google redirects to Supabase callback
4. Supabase creates user + profile
5. Redirect to /auth/callback route
6. Exchange code for session
7. Redirect to homepage (authenticated)
```

### Session Management
- JWT tokens automatically refreshed
- Middleware validates on every request
- Server-side session management
- Secure HTTP-only cookies

---

## File Structure

```
pokemon-price-tracker/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts      # OAuth callback handler
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React components
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # Auth modal with Supabase
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── select.tsx
│   │   ├── PriceChart.tsx        # Chart.js price chart
│   │   ├── PortfolioTracker.tsx  # Portfolio management
│   │   └── PriceAlerts.tsx       # Price alerts UI
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuth.ts            # Authentication hook
│   │
│   ├── lib/                      # Utilities
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   └── server.ts         # Server Supabase client
│   │   ├── types/
│   │   │   └── database.types.ts # TypeScript database types
│   │   ├── utils.ts              # Helper functions (cn, etc.)
│   │   └── card-images.ts        # Card image URLs
│   │
│   └── middleware.ts             # Auth middleware
│
├── supabase/                     # Database
│   ├── schema.sql                # Full database schema
│   └── seed.sql                  # Sample data
│
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── components.json               # shadcn/ui config
└── README.md                     # Documentation
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (future)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Future Stack Additions

### Payments
**Stripe**
- Subscription management
- One-time payments for premium features
- Webhook handling for order processing

### Email
**Resend or SendGrid**
- Price alert notifications
- Welcome emails
- Transaction receipts

### Background Jobs
**Supabase Edge Functions or Vercel Cron**
- Price update scraping
- Alert checking
- Data aggregation

### AI/ML
**OpenAI API**
- Card price predictions
- Collection recommendations
- Market trend analysis

### Monitoring
**Vercel Analytics + Sentry**
- Performance monitoring
- Error tracking
- User analytics

### CDN & Storage
**Supabase Storage or Cloudinary**
- Card image hosting
- User avatars
- Collection photos

---

## Development Workflow

### Local Development
```bash
bun run dev          # Start dev server
bun run lint         # Run linter
bun run build        # Build for production
bun run start        # Start production server
```

### Database Changes
1. Update schema in `supabase/schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types in `database.types.ts`
4. Update components as needed

### Deployment
1. Push to GitHub
2. Vercel auto-deploys
3. Update Supabase URLs for production
4. Test thoroughly

---

## Performance Optimizations

### Current
- Server Components for static content
- Client Components only where needed
- Image optimization with Next.js Image
- Tailwind CSS purging unused styles
- Bun for fast package management

### Future
- Edge caching with Vercel
- Database connection pooling
- Redis for frequently accessed data
- Lazy loading for heavy components
- Service Workers for offline support

---

## Security Measures

### Implemented
- Row Level Security (RLS)
- JWT authentication
- HTTPS-only cookies
- CSRF protection
- XSS prevention
- SQL injection protection (parameterized queries)

### Planned
- Rate limiting
- DDoS protection
- Content Security Policy (CSP)
- Security headers
- Regular dependency updates
- Penetration testing

---

## Testing Strategy

### Current
- Manual testing
- TypeScript type checking
- ESLint for code quality

### Planned
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Cypress
- **API Tests**: Supertest
- **Database Tests**: Supabase test database

---

## Why This Stack?

### Developer Experience
- ✅ Fast development with hot reload
- ✅ Type safety with TypeScript
- ✅ Modern tooling (Bun, Biome)
- ✅ Great documentation

### Scalability
- ✅ Supabase handles millions of users
- ✅ Vercel Edge Network
- ✅ PostgreSQL for complex queries
- ✅ Real-time subscriptions ready

### Cost Efficiency
- ✅ Supabase free tier: 500MB database, 50,000 monthly active users
- ✅ Vercel free tier: Generous limits for hobby projects
- ✅ Pay-as-you-grow pricing

### Future-Proof
- ✅ Easy to add features
- ✅ Stripe integration ready
- ✅ AI/ML capabilities ready
- ✅ Mobile app ready (can share backend)

---

Built with ❤️ using modern web technologies
