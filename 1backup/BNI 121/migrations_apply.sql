-- Run this once in the Supabase SQL editor (Project: bvaefzcsgtgqwftczixb)
-- to fix the "Detail save failed: Could not find the column …" error,
-- and to support the new profile status bar.

-- ── proposal tracking columns (already in schema.sql but never applied to DB) ──
alter table bni_contact_details add column if not exists financial_proposal_sent_at  timestamptz;
alter table bni_contact_details add column if not exists technical_proposal_sent_at  timestamptz;
alter table bni_contact_details add column if not exists commercial_proposal_sent_at timestamptz;
alter table bni_contact_details add column if not exists financial_proposal_url      text not null default '';
alter table bni_contact_details add column if not exists technical_proposal_url      text not null default '';
alter table bni_contact_details add column if not exists commercial_proposal_url     text not null default '';

-- ── new: meeting outcome + proposal reply tracking for header status bar ──
alter table bni_contact_details add column if not exists meeting_outcome             text;
-- meeting_outcome values: 'completed' | 'rescheduled' | 'no_show' | null
alter table bni_contact_details add column if not exists proposal_reply_received_at  timestamptz;

-- ── sentiment of the BNI member (manually set or AI-derived) ──
alter table bni_contact_details add column if not exists sentiment                   text;
-- sentiment values: 'positive' | 'neutral' | 'negative' | null
alter table bni_contact_details add column if not exists sentiment_note              text not null default '';

-- ── team assignment (Team A / B / C / D) on bni_contacts ──
alter table bni_contacts add column if not exists team text;
-- team values: 'A' | 'B' | 'C' | 'D' | null

-- ── referral graph: who referred whom ──
alter table bni_contacts add column if not exists referred_by_id text references bni_contacts(id) on delete set null;
alter table bni_contacts add column if not exists referred_to    text not null default '';   -- comma-separated names of people the contact has referred TO Murali (free-text; can also be ids when linked)
create index if not exists bni_contacts_referred_by_idx on bni_contacts (referred_by_id);

-- ── WhatsApp drip scheduler ────────────────────────────────────────────────
create table if not exists bni_drip_schedule (
  id            uuid primary key default gen_random_uuid(),
  contact_id    text not null references bni_contacts(id) on delete cascade,
  template_id   text not null,
  scheduled_at  timestamptz not null,
  sent_at       timestamptz,
  cancelled_at  timestamptz,
  channel       text not null default 'WhatsApp',
  body_preview  text not null default '',
  error         text,
  created_by    text,
  created_at    timestamptz not null default now()
);
create index if not exists bni_drip_due_idx
  on bni_drip_schedule (scheduled_at)
  where sent_at is null and cancelled_at is null;
create index if not exists bni_drip_contact_idx on bni_drip_schedule (contact_id);

alter table bni_drip_schedule enable row level security;
drop policy if exists "bni_drip_anon_all" on bni_drip_schedule;
create policy "bni_drip_anon_all" on bni_drip_schedule for all to anon using (true) with check (true);

-- ── Zoom webhook audit log ─────────────────────────────────────────────────
create table if not exists bni_zoom_events (
  id                 uuid primary key default gen_random_uuid(),
  event_type         text not null,
  host_email         text,
  topic              text,
  matched_contact_id text,
  raw                jsonb,
  received_at        timestamptz not null default now()
);
create index if not exists bni_zoom_events_received_idx on bni_zoom_events (received_at desc);
alter table bni_zoom_events enable row level security;
drop policy if exists "bni_zoom_anon_all" on bni_zoom_events;
create policy "bni_zoom_anon_all" on bni_zoom_events for all to anon using (true) with check (true);

-- Tell PostgREST to reload its schema cache so the new columns are visible immediately.
notify pgrst, 'reload schema';
