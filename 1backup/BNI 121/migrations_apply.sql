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

-- Tell PostgREST to reload its schema cache so the new columns are visible immediately.
notify pgrst, 'reload schema';
