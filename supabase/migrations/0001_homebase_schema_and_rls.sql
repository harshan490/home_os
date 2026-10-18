-- HOMEBASE Private Family Operating System
-- PostgreSQL Schema & Server-Enforced Row-Level Security (RLS)
-- Zero Location Columns / Zero PostGIS / Strict Household Isolation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE household_role AS ENUM ('owner', 'admin', 'adult', 'restricted', 'readonly');

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
    base_currency CHAR(3) NOT NULL DEFAULT 'INR',
    monthly_budget_minor BIGINT NOT NULL DEFAULT 8500000 CHECK (monthly_budget_minor >= 0),
    budget_alert_pct INTEGER NOT NULL DEFAULT 80 CHECK (budget_alert_pct BETWEEN 10 AND 100),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role household_role NOT NULL DEFAULT 'adult',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'revoked')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (household_id, user_id),
    UNIQUE (household_id, email)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    category TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    paid_by_member_id UUID NOT NULL,
    payment_method TEXT NOT NULL,
    merchant TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    receipt_doc_id UUID,
    recurring_schedule TEXT,
    reimbursable BOOLEAN NOT NULL DEFAULT FALSE,
    settled BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    due_date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual', 'one-time')),
    status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'overdue')),
    paid_date DATE,
    reference_number TEXT,
    receipt_doc_id UUID,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE NOT NULL,
    routine_type TEXT NOT NULL DEFAULT 'none' CHECK (routine_type IN ('none', 'morning', 'evening', 'weekly', 'monthly')),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    extracted_text TEXT,
    tags TEXT[] DEFAULT '{}',
    storage_object_path TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    restricted_access BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    record_ref TEXT NOT NULL,
    description TEXT NOT NULL,
    change_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: verify active membership and role in household
CREATE OR REPLACE FUNCTION get_user_household_role(target_household UUID, target_user UUID)
RETURNS household_role AS $$
  SELECT role FROM household_members
  WHERE household_id = target_household
    AND user_id = target_user
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Read policy: only active members of the same household can read
CREATE POLICY household_isolation_select_expenses ON expenses
  FOR SELECT USING (get_user_household_role(household_id, auth.uid()) IS NOT NULL);

-- Write policy: readonly members cannot insert/update/delete
CREATE POLICY household_isolation_write_expenses ON expenses
  FOR ALL USING (
    get_user_household_role(household_id, auth.uid()) IN ('owner', 'admin', 'adult')
  );

-- Document restriction policy: restricted members cannot view restricted_access documents
CREATE POLICY household_document_select ON documents
  FOR SELECT USING (
    get_user_household_role(household_id, auth.uid()) IN ('owner', 'admin', 'adult')
    OR (
      get_user_household_role(household_id, auth.uid()) IN ('restricted', 'readonly')
      AND restricted_access = FALSE
    )
  );
