# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Life of Ki Tracking App**, a comprehensive wellness and personal development tracking application built with Next.js 15 and Supabase. The app enables users to track daily wellness metrics, mood, sleep patterns, activities, and reflections through a multi-step form interface with calendar visualization.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

The development server runs on http://localhost:3000 with hot reloading enabled.

## Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Form Management**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth with middleware protection
- **Icons**: Lucide React

### Directory Structure

```
├── app/                          # Next.js App Router pages
│   ├── (auth)/                  # Auth route group (login/register)
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── calendar/           # Calendar view page
│   │   └── entry/              # Daily entry form page
├── components/                  # Reusable React components
│   ├── dashboard/              # Dashboard-specific components
│   ├── forms/                  # Form components and steps
│   ├── layout/                 # Layout components (Header, MobileNav)
│   └── ui/                     # shadcn/ui components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries and configurations
│   ├── supabase/              # Supabase client configurations
│   └── validations/           # Zod schemas
├── types/                     # TypeScript type definitions
└── supabase/                  # Database schema files
```

## Key Architectural Patterns

### Authentication Flow
- Middleware-based route protection (`middleware.ts`)
- Unified Supabase client pattern throughout the app (`createClient()`)
- Custom `useAuth` hook for authentication state management
- Auth route group with separate layout for login/register pages

### Data Management
- **Unified Client Pattern**: All components use the same `createClient()` function for consistent authentication state
- **Type-Safe Database**: Generated TypeScript types from Supabase schema in `types/database.types.ts`
- **Row Level Security**: All database access is protected by RLS policies tied to `auth.uid()`
- **CRUD Operations**: Centralized in custom hooks like `useDailyEntry`

### Form Architecture
- **Multi-Step Forms**: Daily entry form is split into 4 logical steps with progress tracking
- **Step Validation**: Each step validates independently before allowing navigation
- **Automatic Calculations**: Sleep hours calculated automatically from bedtime/wake-up time
- **Form State Management**: React Hook Form with Zod validation schemas

### Calendar Integration
- **Date-Aware Forms**: Entry forms accept date parameters for editing historical entries
- **Visual Indicators**: Calendar displays color-coded mood/energy indicators per day
- **Click-to-Edit**: Users can edit any day's entry directly from the calendar view

## Critical Implementation Details

### Supabase Integration
- **Client Configuration**: Browser client created with SSR support
- **Middleware**: Automatic session refresh and route protection
- **Database Schema**: Users, daily_entries, and weekly_summaries tables with proper relationships
- **RLS Policies**: Ensure users can only access their own data

### Form System
- **Entry Date Handling**: Forms support both "today" entries and historical date entries via URL parameters
- **Sleep Calculation**: Automatic calculation with overnight support (if wake time < bedtime, assumes next day)
- **Step Navigation**: Prevents form submission until all required fields in each step are completed
- **Data Persistence**: Forms load existing entries and allow updates

### Calendar System
- **Monthly View**: Grid-based calendar with proper week/day alignment
- **Entry Visualization**: Each day shows colored dots indicating mood and energy levels
- **Detail Panel**: Side panel shows complete entry information when a date is selected
- **Edit Functionality**: Links to entry form with pre-filled data for the selected date

## Environment Setup

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Data Flow Patterns

### Daily Entry Creation/Update
1. User navigates to entry form (with optional date parameter)
2. Form loads existing entry if date specified, otherwise creates new entry
3. Multi-step form validates each step before allowing navigation
4. Sleep hours calculated automatically from bedtime/wake-up inputs
5. Data saved to Supabase with RLS ensuring user isolation
6. Dashboard and calendar automatically reflect changes

### Calendar Interaction
1. Calendar fetches month's entries on load/navigation
2. Visual indicators calculated client-side based on mood/energy values
3. Date selection shows entry details in side panel
4. Edit/Add buttons navigate to entry form with appropriate date parameter

## Important Conventions

- **Dutch Localization**: All user-facing text is in Dutch
- **Life of Ki Branding**: Consistent terminology throughout (not "KAMP KI")
- **Mobile-First**: All components designed for mobile with desktop enhancement
- **Type Safety**: Strict TypeScript with generated database types
- **Error Handling**: Comprehensive error logging with user-friendly toast notifications
- **Timezone Handling**: Manual date string formatting to avoid timezone conversion issues

## Development Guidelines

When working with this codebase:

- Always use the unified `createClient()` function for Supabase access
- Forms should include proper validation with Zod schemas
- New routes under `/dashboard` are automatically protected by middleware
- Use existing UI components from `components/ui/` before creating new ones
- Follow the multi-step form pattern for complex data entry
- Ensure all user data is properly isolated via RLS policies
- Test both creation and editing workflows for any data entry features
- Maintain Dutch localization for all new user-facing text

## Testing Considerations

- Test authentication flow (login/logout/register)
- Verify RLS policies prevent cross-user data access
- Test form validation and step navigation
- Verify automatic sleep calculation with various time combinations
- Test calendar functionality across month boundaries
- Verify responsive design on mobile devices