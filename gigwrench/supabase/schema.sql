-- ============================================
-- GIGWRENCH DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for geo radius search

-- ============================================
-- USERS / PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('pro', 'customer')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  country TEXT NOT NULL DEFAULT 'US',
  state TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRO PROFILES
-- ============================================
CREATE TABLE pro_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  -- Business info
  business_type TEXT CHECK (business_type IN ('registered', 'sole_trader')),
  business_name TEXT,
  trading_name TEXT,
  company_reg_number TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  ein_tax_id TEXT,
  vat_number TEXT,
  -- Verification status
  id_verified BOOLEAN DEFAULT FALSE,
  insurance_verified BOOLEAN DEFAULT FALSE,
  licence_verified BOOLEAN DEFAULT FALSE,
  background_check_passed BOOLEAN DEFAULT FALSE,
  profile_active BOOLEAN DEFAULT FALSE,
  -- Service area
  service_address TEXT,
  service_lat DOUBLE PRECISION,
  service_lng DOUBLE PRECISION,
  service_radius_miles INTEGER DEFAULT 25,
  -- Stats (auto-calculated)
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  on_time_rate INTEGER DEFAULT 100,
  -- Stripe
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  -- Subscription
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'growth')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRO TRADE CATEGORIES
-- ============================================
CREATE TABLE pro_trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customer_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  home_type TEXT,
  service_address TEXT,
  service_lat DOUBLE PRECISION,
  service_lng DOUBLE PRECISION,
  birthday_month INTEGER CHECK (birthday_month BETWEEN 1 AND 12),
  birthday_day INTEGER CHECK (birthday_day BETWEEN 1 AND 31),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  -- Job details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'invoiced', 'paid'
  )),
  -- Address
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  completed_at TIMESTAMPTZ,
  -- Financials
  quoted_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  -- Tracking
  tracking_active BOOLEAN DEFAULT FALSE,
  pro_lat DOUBLE PRECISION,
  pro_lng DOUBLE PRECISION,
  -- Notes
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  line_items JSONB DEFAULT '[]',
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_payment_link TEXT,
  -- Dates
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  -- Translations
  translated_description JSONB DEFAULT '{}', -- {es: '...', fr: '...'}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES (In-app chat with translation)
-- ============================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Content
  original_text TEXT NOT NULL,
  original_language TEXT NOT NULL DEFAULT 'en',
  translated_text TEXT,
  translated_language TEXT,
  -- Type
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'sms', 'system', 'invoice', 'tracking')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SMS TEMPLATES
-- ============================================
CREATE TABLE sms_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert global preset SMS templates
INSERT INTO sms_templates (id, pro_id, name, body, is_preset, language) VALUES
  (uuid_generate_v4(), NULL, 'On My Way', 'Hi {customer_name}, I am on my way to you now. Track my arrival live: {tracking_link}', TRUE, 'en'),
  (uuid_generate_v4(), NULL, 'Running Late', 'Hi {customer_name}, I am running about {minutes} minutes late. I apologise for the delay. I will be with you shortly.', TRUE, 'en'),
  (uuid_generate_v4(), NULL, 'Job Complete', 'Hi {customer_name}, the job is complete. Thank you for choosing {pro_name}. Your invoice has been sent.', TRUE, 'en'),
  (uuid_generate_v4(), NULL, 'Invoice Sent', 'Hi {customer_name}, your invoice for {amount} is ready. Pay securely here: {payment_link}', TRUE, 'en'),
  (uuid_generate_v4(), NULL, 'Appointment Reminder', 'Reminder: {pro_name} is scheduled to visit you tomorrow at {time}. Reply to this message if you need to reschedule.', TRUE, 'en'),
  (uuid_generate_v4(), NULL, 'Payment Reminder', 'Hi {customer_name}, your invoice of {amount} is still outstanding. Pay securely here: {payment_link}', TRUE, 'en');

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL UNIQUE,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  original_language TEXT DEFAULT 'en',
  translated_comment JSONB DEFAULT '{}',
  -- Pro response
  pro_response TEXT,
  pro_response_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT TRUE,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REMINDERS / AUTOMATION LOG
-- ============================================
CREATE TABLE reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'job_reminder_24h_pro', 'job_reminder_24h_customer',
    'job_reminder_2h_customer', 'on_the_way',
    'thank_you', 'invoice_sent',
    'payment_reminder_3d', 'payment_reminder_7d',
    'birthday_pro', 'birthday_gigwrench',
    'review_request', 'review_reminder_48h'
  )),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channel TEXT CHECK (channel IN ('email', 'sms', 'both')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LIVE TRACKING
-- ============================================
CREATE TABLE tracking_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  tracking_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  eta_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDAR / BOOKINGS
-- ============================================
CREATE TABLE booking_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'Book a time',
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  buffer_minutes INTEGER DEFAULT 15,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/write their own
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Pro profiles: owner full access, public read for marketplace
CREATE POLICY "pro_profiles_own" ON pro_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "pro_profiles_public_read" ON pro_profiles FOR SELECT USING (profile_active = TRUE);

-- Customer profiles: owner only
CREATE POLICY "customer_profiles_own" ON customer_profiles FOR ALL USING (auth.uid() = id);

-- Pro trades: owner full access, public read
CREATE POLICY "pro_trades_own" ON pro_trades FOR ALL USING (auth.uid() = pro_id);
CREATE POLICY "pro_trades_public_read" ON pro_trades FOR SELECT USING (TRUE);

-- Jobs: pro sees their own, customer sees jobs they are in
CREATE POLICY "jobs_pro" ON jobs FOR ALL USING (auth.uid() = pro_id);
CREATE POLICY "jobs_customer" ON jobs FOR SELECT USING (auth.uid() = customer_id);

-- Invoices: pro and customer see their own
CREATE POLICY "invoices_pro" ON invoices FOR ALL USING (auth.uid() = pro_id);
CREATE POLICY "invoices_customer" ON invoices FOR SELECT USING (auth.uid() = customer_id);

-- Messages: sender or recipient
CREATE POLICY "messages_parties" ON messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Reviews: public read, customer writes own
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (published = TRUE);
CREATE POLICY "reviews_customer_write" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reviews_pro_respond" ON reviews FOR UPDATE USING (auth.uid() = pro_id);

-- Tracking: public read by token (handled in API), pro writes own
CREATE POLICY "tracking_pro_write" ON tracking_sessions FOR ALL USING (auth.uid() = pro_id);
CREATE POLICY "tracking_public_read" ON tracking_sessions FOR SELECT USING (active = TRUE);

-- SMS templates: presets readable by all pros, custom ones own only
CREATE POLICY "sms_templates_presets" ON sms_templates FOR SELECT USING (is_preset = TRUE OR auth.uid() = pro_id);
CREATE POLICY "sms_templates_own" ON sms_templates FOR ALL USING (auth.uid() = pro_id);

-- Booking links: public read, pro owns
CREATE POLICY "booking_links_public" ON booking_links FOR SELECT USING (active = TRUE);
CREATE POLICY "booking_links_own" ON booking_links FOR ALL USING (auth.uid() = pro_id);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pro_profiles_updated BEFORE UPDATE ON pro_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customer_profiles_updated BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-UPDATE PRO RATING AFTER REVIEW
-- ============================================
CREATE OR REPLACE FUNCTION update_pro_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pro_profiles SET
    avg_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE pro_id = NEW.pro_id AND published = TRUE),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE pro_id = NEW.pro_id AND published = TRUE)
  WHERE id = NEW.pro_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_pro_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_pro_rating();

-- ============================================
-- INVOICE NUMBER GENERATOR
-- ============================================
CREATE SEQUENCE invoice_number_seq START 1000;
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'GW-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();
