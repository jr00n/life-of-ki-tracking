# Coaching Tracker App - Product Requirements Document

## 1. Project Overview

**Product Name**: CoachTrack (of jouw voorkeur)
**Target**: Mobile-first web applicatie voor persoonlijke coaching tracking
**Core Value**: Dagelijkse en wekelijkse voortgang bijhouden in een gestructureerd coachingstraject

## 2. Technology Stack Aanbeveling

### Backend: Supabase ✅
**Waarom Supabase perfect is:**
- Real-time database (PostgreSQL)
- Ingebouwde authenticatie
- Row Level Security voor privacy
- Automatische API generatie
- Gratis tier voldoende voor start
- Edge functions voor complexere logica

### Frontend: Next.js + Vercel ✅
**Waarom deze combo:**
- React met SSR/SSG voor performance
- Mobile-first responsive design
- Vercel deployment (gratis)
- Goede integratie met Supabase
- TypeScript support

### UI Framework: Tailwind CSS + shadcn/ui
**Motivatie:**
- Utility-first CSS voor snelle development
- shadcn/ui: moderne, toegankelijke componenten
- Consistente design system
- Excellent mobile support
- Dark/light mode out-of-the-box

## 3. Database Schema

### Users Table
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default now()
);
```

### Daily Entries Table
```sql
create table daily_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  date date not null,
  
  -- Basis tracking
  mood text, -- neutraal, positief, negatief
  intention text,
  task text,
  
  -- Slaap
  sleep_hours interval,
  bedtime_hours interval,
  
  -- Activiteiten (JSON arrays voor flexibiliteit)
  water_intake jsonb default '[]', -- [{"time": "ochtend", "amount": 1}]
  yoga_minutes integer default 0,
  meditation jsonb default '{}', -- {"duration": 20, "type": "breathing"}
  relaxation jsonb default '[]', -- [{"activity": "...", "duration": 30}]
  exercise jsonb default '[]', -- [{"type": "boxing", "calories": 346}]
  
  -- Voeding per maaltijd
  breakfast jsonb default '[]',
  lunch jsonb default '[]',
  dinner jsonb default '[]',
  evening_snack jsonb default '[]',
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Weekly Summaries Table
```sql
create table weekly_summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  week_start date not null,
  week_end date not null,
  
  avg_sleep_hours interval,
  insights text,
  weekly_assignment text,
  assignment_completed boolean default false,
  
  created_at timestamp with time zone default now()
);
```

## 4. App Architecture

### Folder Structure
```
src/
├── app/                 # Next.js 13+ app directory
│   ├── (auth)/         # Auth layouts
│   ├── dashboard/      # Main app
│   └── layout.tsx
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Entry forms
│   ├── charts/        # Data visualization
│   └── layout/        # Navigation, headers
├── lib/
│   ├── supabase/      # Database client
│   ├── utils/         # Helper functions
│   └── validations/   # Zod schemas
├── hooks/             # Custom React hooks
└── types/             # TypeScript definitions
```

## 5. Core Features & User Flow

### Authentication Flow
1. **Login/Register** - Supabase Auth
2. **Profile Setup** - Basic user info
3. **Onboarding** - Explain app usage

### Daily Tracking Flow
1. **Dashboard** - Today's overview + quick actions
2. **Daily Entry Form** - Sectioned form:
   - Basis (gevoel, intentie, taak)
   - Slaap & Welzijn
   - Activiteiten
   - Voeding (per maaltijd)
3. **Save & Continue** - Progressive saving
4. **Review** - Edit previous days (limited window)

### Weekly Review Flow
1. **Auto-calculation** - Sleep averages, patterns
2. **Insights Input** - Coach or user insights
3. **Assignment** - New weekly goal/task
4. **Progress Overview** - Charts & trends

## 6. Design System

### Color Scheme: Professional Wellness
```css
/* Primary: Calming Blue-Green */
--primary: 158 64% 52%        /* #22c55e - Fresh, growth-oriented */
--primary-foreground: 0 0% 98%

/* Secondary: Warm Accent */
--secondary: 25 95% 53%       /* #fb7c1d - Energy, motivation */
--secondary-foreground: 0 0% 98%

/* Neutral: Clean Grays */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--muted: 210 40% 98%
--muted-foreground: 215.4 16.3% 46.9%

/* Status Colors */
--success: 142 76% 36%        /* Positive progress */
--warning: 38 92% 50%         /* Needs attention */
--destructive: 0 72% 51%      /* Missing entries */
```

### Typography Scale
- **Headers**: Inter (clean, readable)
- **Body**: System fonts for performance
- **Data**: JetBrains Mono (numbers, time)

## 7. Mobile-First Component Design

### Key Mobile Patterns
1. **Bottom Navigation** - Primary navigation
2. **FAB (Floating Action Button)** - Quick daily entry
3. **Swipe Gestures** - Navigate between days
4. **Pull-to-Refresh** - Update data
5. **Progressive Forms** - Multi-step daily entry

### Responsive Breakpoints
```css
sm: 640px    /* Large mobile */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
```

## 8. Development Phases

### Phase 1: MVP (Week 1-2)
- [ ] Supabase setup + authentication
- [ ] Basic daily entry form
- [ ] Simple dashboard view
- [ ] Mobile navigation

### Phase 2: Core Features (Week 3-4)
- [ ] Complete daily tracking system
- [ ] Data visualization (charts)
- [ ] Weekly summary calculation
- [ ] Form validation & error handling

### Phase 3: Enhancement (Week 5-6)
- [ ] Advanced insights
- [ ] Data export functionality
- [ ] Performance optimization
- [ ] Testing & bug fixes

### Phase 4: Polish (Week 7+)
- [ ] Animations & micro-interactions
- [ ] Push notifications (PWA)
- [ ] Advanced analytics
- [ ] Coach collaboration features

## 9. Security & Privacy

### Row Level Security (RLS) Policies
```sql
-- Users can only see their own data
create policy "Users can view own entries" 
on daily_entries for select 
using (auth.uid() = user_id);

create policy "Users can insert own entries" 
on daily_entries for insert 
with check (auth.uid() = user_id);

create policy "Users can update own entries" 
on daily_entries for update 
using (auth.uid() = user_id);
```

### Data Protection
- All personal data encrypted at rest
- HTTPS only
- Regular automated backups
- GDPR compliance ready

## 10. Deployment Strategy

### Development Workflow
1. **Local**: Next.js dev server + Supabase local
2. **Staging**: Vercel preview + Supabase staging
3. **Production**: Vercel + Supabase production

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 11. Success Metrics

### User Engagement
- Daily entry completion rate
- Weekly retention rate
- Time spent in app

### Feature Usage
- Most/least used tracking categories
- Form completion patterns
- Weekly review engagement

### Technical Metrics
- Page load performance
- Mobile usability score
- Error rates

## 12. Getting Started Checklist

- [ ] Create Supabase project
- [ ] Set up Next.js project with TypeScript
- [ ] Install shadcn/ui and Tailwind
- [ ] Configure authentication
- [ ] Create database tables
- [ ] Build first component (login)
- [ ] Deploy to Vercel

---

*Ready to build something amazing for personal growth tracking!* 🚀