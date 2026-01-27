# Supabase Setup Guide for Headz Hairstyle App

This guide walks you through setting up a new Supabase project for the Headz hairstyle app.

## Quick Setup Steps

1. Create new Supabase project at https://supabase.com/dashboard
2. Copy the Project URL and anon key
3. Run the `supabase-setup.sql` script in SQL Editor
4. Update `.env` file with new credentials
5. (Optional) Configure Google OAuth

---

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project name**: `headz-hairstyle` (or your preferred name)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

---

## Step 2: Get Your Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...` (long string)

---

## Step 3: Run Database Setup

1. Go to **SQL Editor** in the Supabase dashboard
2. Click "New query"
3. Open the `supabase-setup.sql` file from this project
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify no errors appear

### What Gets Created

| Table | Purpose |
|-------|---------|
| `public.users` | User accounts, profiles, authentication |
| `public.generations` | Hairstyle generation history |
| `public.otp_codes` | Email OTP verification codes |

| Storage Bucket | Purpose | Access |
|----------------|---------|--------|
| `generated-images` | Uploaded & generated images | Public |

---

## Step 4: Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

---

## Step 5: Google OAuth Setup (Optional)

If you want to enable "Sign in with Google":

### 5.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add **Authorized redirect URI**:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. Save your **Client ID** and **Client Secret**

### 5.2 Supabase Dashboard

1. Go to **Authentication** > **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Enter your:
   - **Client ID** from Google
   - **Client Secret** from Google
5. Click **Save**

---

## Verification Checklist

After setup, verify everything works:

- [ ] **Table Editor**: See `users`, `generations`, `otp_codes` tables
- [ ] **Storage**: See `generated-images` bucket
- [ ] **Authentication > Policies**: RLS policies are listed
- [ ] **App Test**: Upload an image and verify it saves

---

## Troubleshooting

### "relation does not exist" error
Run the SQL setup script again. Make sure you copied the entire file.

### Storage upload fails
Check that the `generated-images` bucket exists and has public access enabled.

### Google OAuth not working
- Verify the redirect URI matches exactly
- Make sure the OAuth consent screen is configured
- Check that the app domain is authorized in Google Cloud Console

### RLS policy errors
If you get permission denied errors, check that the RLS policies were created correctly. You can view them in **Authentication > Policies**.

---

## Database Schema Reference

### users table
```sql
id              UUID (primary key)
email           TEXT (unique, required)
password_hash   TEXT
first_name      TEXT
last_name       TEXT
full_name       TEXT
location        TEXT
email_verified  BOOLEAN (default: false)
is_admin        BOOLEAN (default: false)
auth_provider   TEXT (default: 'email')
supabase_user_id TEXT
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
last_login_at   TIMESTAMP WITH TIME ZONE
```

### generations table
```sql
id                  BIGINT (auto-increment, primary key)
created_at          TIMESTAMP WITH TIME ZONE
session_id          TEXT
user_id             UUID (references users)
original_image_url  TEXT
styled_image_url    TEXT
generated_image_url TEXT
prompt              TEXT
style_name          TEXT
hairstyle_name      TEXT
seed                INTEGER
steps               INTEGER
guidance_scale      NUMERIC
strength            NUMERIC
status              TEXT (default: 'completed')
is_favorite         BOOLEAN (default: false)
is_shared           BOOLEAN (default: false)
metadata            JSONB
```

### otp_codes table
```sql
email       TEXT (primary key)
code        TEXT (required)
created_at  TIMESTAMP WITH TIME ZONE
expires_at  TIMESTAMP WITH TIME ZONE
```
