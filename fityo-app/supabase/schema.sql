-- Fityo Database Schema
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/ezrjhugkvfvpbttfyhxn/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  calorie_goal INTEGER DEFAULT 2400,
  protein_goal INTEGER DEFAULT 180,
  carbs_goal INTEGER DEFAULT 200,
  fat_goal INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOODS LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS foods_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  protein_per_100g FLOAT DEFAULT 0,
  carbs_per_100g FLOAT DEFAULT 0,
  fat_per_100g FLOAT DEFAULT 0,
  calories_per_100g FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods_library ON DELETE CASCADE,
  meal_type TEXT NOT NULL,
  amount_grams FLOAT NOT NULL,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEIGHT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  weight FLOAT NOT NULL,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, logged_at)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Foods library policies
CREATE POLICY "Users can view own foods" ON foods_library 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own foods" ON foods_library 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own foods" ON foods_library 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own foods" ON foods_library 
  FOR DELETE USING (auth.uid() = user_id);

-- Daily logs policies
CREATE POLICY "Users can view own logs" ON daily_logs 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON daily_logs 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON daily_logs 
  FOR DELETE USING (auth.uid() = user_id);

-- Weight history policies
CREATE POLICY "Users can view own weight" ON weight_history 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight" ON weight_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight" ON weight_history 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight" ON weight_history 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_foods_library_user_id ON foods_library(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON weight_history(user_id, logged_at);
