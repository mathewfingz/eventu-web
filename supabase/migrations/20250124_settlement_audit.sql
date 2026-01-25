-- Settlement and Audit System Migration
-- Creates tables for settlements, organizer profiles, and audit logs

-- Organizer Profiles (for tax/settlement purposes)
CREATE TABLE IF NOT EXISTS organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business Information
  legal_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('NIT', 'CC', 'CE')),
  document_number VARCHAR(50) NOT NULL UNIQUE,
  taxpayer_type VARCHAR(50) NOT NULL CHECK (taxpayer_type IN ('PERSONA_NATURAL', 'PERSONA_JURIDICA', 'GRAN_CONTRIBUYENTE', 'NO_APLICA')),
  
  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100) NOT NULL,
  
  -- Bank Information
  bank_name VARCHAR(255) NOT NULL,
  bank_account_type VARCHAR(20) NOT NULL CHECK (bank_account_type IN ('AHORROS', 'CORRIENTE')),
  bank_account_number VARCHAR(50) NOT NULL,
  
  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'ON_HOLD', 'DISPUTED')),
  
  -- Financial Breakdown (stored as JSONB for flexibility)
  breakdown JSONB NOT NULL,
  
  -- Payment Info
  payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (payment_method IN ('BANK_TRANSFER', 'CHECK')),
  payment_reference VARCHAR(255),
  paid_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate settlements for same event
  UNIQUE(event_id)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  
  -- User Info
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  
  -- Data
  data JSONB,
  previous_data JSONB,
  reason TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user ON organizer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_document ON organizer_profiles(document_number);

CREATE INDEX IF NOT EXISTS idx_settlements_event ON settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_settlements_organizer ON settlements(organizer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_created ON settlements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- RLS Policies
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizer Profiles: Users can only see/edit their own
CREATE POLICY "Users can view own organizer profile"
  ON organizer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own organizer profile"
  ON organizer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organizer profile"
  ON organizer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Settlements: Organizers can only see their own
CREATE POLICY "Organizers can view own settlements"
  ON settlements FOR SELECT
  USING (auth.uid() = organizer_id);

-- Settlements: Only system can insert/update (via service role)
CREATE POLICY "System can manage settlements"
  ON settlements FOR ALL
  USING (true)
  WITH CHECK (true);

-- Audit Logs: Read-only for users of their own logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Audit Logs: Insert only from server
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizer_profiles_updated_at
  BEFORE UPDATE ON organizer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
