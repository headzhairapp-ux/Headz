-- Logs every successful Gemini generation that passes through the /api/gemini
-- proxy, including anonymous (not-logged-in) visitors. This is the only place
-- anonymous generations are recorded server-side, so it is the source of truth
-- for "how many generations did anonymous users make".
--
-- Anonymous count:  SELECT count(*) FROM gemini_calls WHERE is_anonymous = true;
-- Per device:       SELECT device_id, count(*) FROM gemini_calls
--                     WHERE is_anonymous = true GROUP BY device_id ORDER BY 2 DESC;
CREATE TABLE IF NOT EXISTS public.gemini_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    device_id TEXT,
    -- No FK on purpose: logging must never fail because of a missing reference.
    user_id UUID,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    model TEXT
);

CREATE INDEX IF NOT EXISTS idx_gemini_calls_is_anonymous ON public.gemini_calls (is_anonymous);
CREATE INDEX IF NOT EXISTS idx_gemini_calls_device_id ON public.gemini_calls (device_id);
CREATE INDEX IF NOT EXISTS idx_gemini_calls_created_at ON public.gemini_calls (created_at);

-- Enable RLS. The proxy inserts with the anon key, and the Super Admin
-- dashboard reads aggregate counts with the anon key as well (the app's
-- super-admin gate is enforced client-side, consistent with the existing
-- `users` / `generations` tables). So we allow public INSERT and SELECT.
ALTER TABLE public.gemini_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access" ON public.gemini_calls
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.gemini_calls
FOR SELECT USING (true);
