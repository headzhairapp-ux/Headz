CREATE TABLE public.lead_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  full_mobile_number TEXT NOT NULL,
  location TEXT NOT NULL,
  session_id TEXT,
  device_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  source_path TEXT,
  user_agent TEXT
);

CREATE INDEX idx_lead_captures_created_at ON public.lead_captures(created_at DESC);
CREATE INDEX idx_lead_captures_phone ON public.lead_captures(full_mobile_number);
CREATE INDEX idx_lead_captures_session_id ON public.lead_captures(session_id);
CREATE INDEX idx_lead_captures_user_id ON public.lead_captures(user_id);

ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert lead captures" ON public.lead_captures
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public read lead captures" ON public.lead_captures
FOR SELECT
USING (true);

