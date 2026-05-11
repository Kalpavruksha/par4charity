-- Golf Charity Subscription Platform
-- Supabase Database Schema
  
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
-- Clean up existing tables and functions to prevent "already exists" errors
DROP TABLE IF EXISTS public.charity_contributions CASCADE;
DROP TABLE IF EXISTS public.winners CASCADE;
DROP TABLE IF EXISTS public.draw_entries CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.golf_scores CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.charities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.prize_pool_rollover CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.enforce_score_limit CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;


-- ==========================================
-- PROFILES TABLE (extends auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  handicap INTEGER,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Enable insert for service role" ON public.profiles FOR INSERT WITH CHECK (TRUE);

-- ==========================================
-- SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  charity_id UUID,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON public.subscriptions FOR ALL USING (TRUE);

-- ==========================================
-- CHARITIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_raised INTEGER DEFAULT 0, -- in pence
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active charities" ON public.charities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access to charities" ON public.charities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ==========================================
-- GOLF SCORES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.golf_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL,
  course_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own scores" ON public.golf_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.golf_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can edit all scores" ON public.golf_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ==========================================
-- DRAWS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_month TEXT NOT NULL, -- e.g. '2026-03'
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published', 'completed')),
  draw_mode TEXT NOT NULL DEFAULT 'random' CHECK (draw_mode IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] DEFAULT '{}',
  prize_pool_total INTEGER DEFAULT 0, -- in pence
  jackpot_amount INTEGER DEFAULT 0,
  four_match_amount INTEGER DEFAULT 0,
  three_match_amount INTEGER DEFAULT 0,
  rollover_amount INTEGER DEFAULT 0,
  notes TEXT,
  simulated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published draws visible to all" ON public.draws FOR SELECT USING (status IN ('published', 'completed'));
CREATE POLICY "Admins full access to draws" ON public.draws FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ==========================================
-- DRAW ENTRIES TABLE (tracks who entered each draw)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scores_snapshot INTEGER[] NOT NULL, -- snapshot of user's 5 scores at draw time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to entries" ON public.draw_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access to entries" ON public.draw_entries FOR ALL USING (TRUE);

-- ==========================================
-- WINNERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
  matched_numbers INTEGER[] NOT NULL,
  prize_amount INTEGER NOT NULL, -- in pence
  proof_url TEXT,
  proof_submitted_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'proof_required', 'under_review', 'approved', 'rejected')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid')),
  admin_notes TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own winnings" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload own proof" ON public.winners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access to winners" ON public.winners FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ==========================================
-- CHARITY CONTRIBUTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) NOT NULL,
  amount INTEGER NOT NULL, -- in pence
  subscription_id UUID REFERENCES public.subscriptions(id),
  contribution_month TEXT, -- e.g. '2026-03'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contributions" ON public.charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to contributions" ON public.charity_contributions FOR ALL USING (TRUE);

-- ==========================================
-- PRIZE POOL ROLLOVER TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.prize_pool_rollover (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount INTEGER NOT NULL DEFAULT 0, -- accumulated jackpot in pence
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row
INSERT INTO public.prize_pool_rollover (amount) VALUES (0);

ALTER TABLE public.prize_pool_rollover ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rollover" ON public.prize_pool_rollover FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage rollover" ON public.prize_pool_rollover FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ==========================================
-- TRIGGER: Auto-update profiles.updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TRIGGER: Auto-create profile on user signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- FUNCTION: Keep only latest 5 golf scores per user
-- ==========================================
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_score_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count FROM public.golf_scores WHERE user_id = NEW.user_id;
  IF score_count >= 5 THEN
    SELECT id INTO oldest_score_id
    FROM public.golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at ASC, created_at ASC
    LIMIT 1;
    DELETE FROM public.golf_scores WHERE id = oldest_score_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_golf_score_limit
  BEFORE INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION enforce_score_limit();

-- ==========================================
-- SEED: Initial Charities
-- ==========================================
INSERT INTO public.charities (name, slug, description, short_description, category, is_featured, is_active) VALUES
('Golf Foundation', 'golf-foundation', 'The Golf Foundation is committed to introducing golf to young people across the UK, building confidence and life skills through the sport.', 'Helping young people discover golf across the UK', 'Youth & Sport', TRUE, TRUE),
('Macmillan Cancer Support', 'macmillan-cancer-support', 'Macmillan Cancer Support provides services, gives money and fights for people living with cancer through its network of nurses and healthcare professionals.', 'Supporting people living with cancer', 'Health', TRUE, TRUE),
('WWF - World Wildlife Fund', 'wwf', 'WWF works to conserve nature and reduce the most pressing threats to the diversity of life on Earth, partnering with local communities worldwide.', 'Protecting nature and wildlife worldwide', 'Environment', FALSE, TRUE),
('British Heart Foundation', 'british-heart-foundation', 'The British Heart Foundation funds life-saving research into heart and circulatory diseases.', 'Funding heart disease research', 'Health', FALSE, TRUE),
('RNLI - Royal National Lifeboat Institution', 'rnli', 'The RNLI saves lives at sea through its lifeboat and lifeguard services around the UK and Ireland coastline.', 'Saving lives at sea across the UK', 'Emergency Services', FALSE, TRUE),
('Alzheimer''s Society', 'alzheimers-society', 'Alzheimer''s Society is a care and research charity for people affected by dementia in England, Wales and Northern Ireland.', 'Supporting those affected by dementia', 'Health', TRUE, TRUE);
