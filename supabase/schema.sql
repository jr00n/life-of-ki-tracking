-- Life of Ki Tracking App - Complete Database Schema
-- Run this in your Supabase SQL editor to create the complete database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DAILY ENTRIES TABLE
-- =============================================================================

-- Create daily_entries table with proper structure
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  
  -- Basic Info
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  daily_intention TEXT,
  
  -- Sleep & Wellness
  sleep_hours DECIMAL(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  wake_up_time TIME,
  bedtime TIME,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  
  -- Activities
  exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
  exercise_type TEXT,
  meditation_minutes INTEGER DEFAULT 0 CHECK (meditation_minutes >= 0),
  meditation_type TEXT,
  outdoor_time INTEGER DEFAULT 0 CHECK (outdoor_time >= 0),
  
  -- Nutrition
  water_glasses INTEGER DEFAULT 0 CHECK (water_glasses >= 0 AND water_glasses <= 20),
  
  -- Reflection
  gratitude TEXT,
  day_highlight TEXT,
  challenges_faced TEXT,
  tomorrow_focus TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per day
  UNIQUE(user_id, entry_date)
);

-- =============================================================================
-- NUTRITION ENTRIES TABLE  
-- =============================================================================

-- Create nutrition_entries table for flexible meal tracking
CREATE TABLE IF NOT EXISTS public.nutrition_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_entry_id UUID REFERENCES public.daily_entries(id) ON DELETE CASCADE NOT NULL,
  time_consumed TIME NOT NULL,
  food_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FAVORITE FOODS TABLE
-- =============================================================================

-- Create favorite_foods table for quick nutrition entry
CREATE TABLE IF NOT EXISTS public.favorite_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  default_time TIME, -- Optional default time for this food
  category TEXT CHECK (category IN ('ontbijt', 'lunch', 'diner', 'snack', 'drank', 'anders')),
  usage_count INTEGER DEFAULT 0, -- Track how often it's used
  last_used DATE, -- Track when it was last used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique favorites per user
  UNIQUE(user_id, name)
);

-- =============================================================================
-- USER PREFERENCES TABLE
-- =============================================================================

-- Create user_preferences table for storing user-specific settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Week start day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  -- Default is 1 (Monday)
  week_start_day INTEGER DEFAULT 1 CHECK (week_start_day >= 0 AND week_start_day <= 6),
  
  -- Theme preference (light, dark, system)
  -- Default is 'system' to follow system preference
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- WEEKLY SUMMARIES TABLE
-- =============================================================================

-- Create weekly_summaries table
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  
  -- Aggregated metrics
  avg_mood DECIMAL(3,2),
  avg_energy DECIMAL(3,2),
  avg_sleep_hours DECIMAL(4,2),
  avg_sleep_quality DECIMAL(3,2),
  total_exercise_minutes INTEGER DEFAULT 0,
  total_meditation_minutes INTEGER DEFAULT 0,
  avg_stress_level DECIMAL(3,2),
  
  -- AI-generated insights and coaching
  insights TEXT,
  weekly_assignment TEXT,
  assignment_completed BOOLEAN DEFAULT FALSE,
  
  -- Weekly reflection fields
  personal_insight TEXT,
  movement_goal_achieved BOOLEAN,
  movement_goal_next_week TEXT,
  nutrition_goal_achieved BOOLEAN,
  nutrition_goal_next_week TEXT,
  favorite_relaxation TEXT,
  relaxation_goal_next_week TEXT,
  overall_energy_reflection TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one summary per user per week
  UNIQUE(user_id, week_start)
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Create updated_at triggers for all tables
CREATE TRIGGER set_updated_at_daily_entries
  BEFORE UPDATE ON public.daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_nutrition_entries
  BEFORE UPDATE ON public.nutrition_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_favorite_foods
  BEFORE UPDATE ON public.favorite_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_weekly_summaries
  BEFORE UPDATE ON public.weekly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - DAILY ENTRIES
-- =============================================================================

CREATE POLICY "Users can view their own daily entries" ON public.daily_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own daily entries" ON public.daily_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily entries" ON public.daily_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily entries" ON public.daily_entries
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- RLS POLICIES - NUTRITION ENTRIES
-- =============================================================================

CREATE POLICY "Users can view their own nutrition entries" ON public.nutrition_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.daily_entries 
      WHERE daily_entries.id = nutrition_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own nutrition entries" ON public.nutrition_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_entries 
      WHERE daily_entries.id = nutrition_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own nutrition entries" ON public.nutrition_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.daily_entries 
      WHERE daily_entries.id = nutrition_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own nutrition entries" ON public.nutrition_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.daily_entries 
      WHERE daily_entries.id = nutrition_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

-- =============================================================================
-- RLS POLICIES - FAVORITE FOODS
-- =============================================================================

CREATE POLICY "Users can view their own favorite foods" ON public.favorite_foods
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own favorite foods" ON public.favorite_foods
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own favorite foods" ON public.favorite_foods
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorite foods" ON public.favorite_foods
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- RLS POLICIES - USER PREFERENCES
-- =============================================================================

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- RLS POLICIES - WEEKLY SUMMARIES
-- =============================================================================

CREATE POLICY "Users can view their own weekly summaries" ON public.weekly_summaries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own weekly summaries" ON public.weekly_summaries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own weekly summaries" ON public.weekly_summaries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own weekly summaries" ON public.weekly_summaries
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Daily entries indexes
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON public.daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON public.daily_entries(entry_date DESC);

-- Nutrition entries indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_daily_entry_id ON public.nutrition_entries(daily_entry_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_time ON public.nutrition_entries(daily_entry_id, time_consumed);

-- Favorite foods indexes
CREATE INDEX IF NOT EXISTS idx_favorite_foods_user_id ON public.favorite_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_foods_usage ON public.favorite_foods(user_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_foods_category ON public.favorite_foods(user_id, category);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Weekly summaries indexes
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id ON public.weekly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week ON public.weekly_summaries(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week_start ON public.weekly_summaries(week_start DESC);

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant access to authenticated users
GRANT ALL ON public.daily_entries TO authenticated;
GRANT ALL ON public.nutrition_entries TO authenticated;
GRANT ALL ON public.favorite_foods TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.weekly_summaries TO authenticated;