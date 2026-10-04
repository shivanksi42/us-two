-- ====================================================================
-- us-two: Production Schema for Supabase PostgreSQL
-- Matches SQLAlchemy models in app/auth/models.py and app/memories/models.py
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Refresh Tokens Table (with Rotation Support)
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(500),
    ip_address VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);

-- 3. Token Denylist Table (Instant JTI Revocation)
CREATE TABLE IF NOT EXISTS public.token_denylist (
    id VARCHAR(36) PRIMARY KEY,
    jti VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Login Attempt Audit Trail
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    was_successful BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON public.login_attempts(user_id);

-- 5. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    place VARCHAR(200),
    date_label VARCHAR(100),
    color VARCHAR(10) NOT NULL DEFAULT '#C45B38',
    cover TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);

-- 6. Memory Days Table
CREATE TABLE IF NOT EXISTS public.memory_days (
    id VARCHAR(36) PRIMARY KEY,
    memory_id VARCHAR(36) NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    day_date VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_days_memory_id ON public.memory_days(memory_id);

-- 7. Memory Entries Table (Photos & Notes)
CREATE TABLE IF NOT EXISTS public.memory_entries (
    id VARCHAR(36) PRIMARY KEY,
    day_id VARCHAR(36) NOT NULL REFERENCES public.memory_days(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'text')),
    photo_url TEXT,
    photo_public_id TEXT,
    caption TEXT,
    body TEXT,
    color VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_entries_day_id ON public.memory_entries(day_id);
