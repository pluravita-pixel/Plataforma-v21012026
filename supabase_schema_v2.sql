-- TABLAS PARA SUPABASE (Basado en Drizzle Schema V2)

-- 1. Usuarios (Tabla pública para metadatos)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'patient', -- 'patient', 'psychologist', 'admin'
  sessions_count INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  has_completed_affinity BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Psicólogos
CREATE TABLE IF NOT EXISTS public.psychologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_patients INTEGER DEFAULT 0,
  active_patients INTEGER DEFAULT 0,
  rating TEXT DEFAULT '5.0',
  specialty TEXT,
  experience TEXT,
  image TEXT,
  description TEXT,
  iban TEXT,
  payout_name TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 3. Citas / Sesiones
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON UPDATE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Tickets de Soporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de desarrollo (Permitir todo temporalmente)
CREATE POLICY "Public access v2" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access v2" ON public.psychologists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access v2" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access v2" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);
