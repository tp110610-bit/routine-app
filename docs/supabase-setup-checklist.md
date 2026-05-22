# Supabase Setup Checklist

This checklist covers the Supabase and Vercel steps needed to operate the routine app's current manual backup flow.

The app is still `localStorage`-first. Supabase Auth and manual upload/download UI exist, but automatic sync, realtime sync, and app-start pull/push do not.

## Prerequisites

- Confirm the current app build and local JSON export/import flow work before enabling Supabase.
- Confirm `docs/supabase-migration.sql` matches the schema you intend to apply.
- Keep a local JSON export before testing any Supabase download path that can replace local data.
- Use only browser-safe Supabase public configuration in the app.

## Create Supabase Project

1. Create or select the Supabase project that will back this routine app.
2. Record the Project URL for browser configuration.
3. Record the anon public key for browser configuration.
4. Do not use the `service_role` key in Vercel browser environment variables or in `.env.local`.

## Apply SQL

1. Open the target Supabase project.
2. Open the SQL Editor.
3. Open `docs/supabase-migration.sql` from this repository.
4. Paste the SQL into the SQL Editor and run it against the intended project.
5. Confirm the tables exist:
   - `routine_logs`
   - `custom_foods`
   - `user_profiles`
   - `user_preferences`
6. Confirm RLS is enabled and the user-owned policies were created.

Use `docs/supabase-schema.md` for design notes and app mapping. Use `docs/supabase-migration.sql` as the SQL Editor script.

## Auth Settings

Use Supabase Auth email/password login for the current auth flow.

- Keep the Email provider enabled for email/password login.
- Confirm whether email confirmation is enabled for sign-up.
- If email confirmation is enabled, new users may need to open the confirmation email before password login succeeds.
- Verify project email delivery settings before production testing.
- Confirm sign-up confirmation redirects are allowed for both local and deployed origins.
- Test with an email account that can receive project auth email.

## Redirect URLs

Configure Supabase Auth URL settings for the environments you will use.

- Local development URL: `http://localhost:3000`
- Production URL: `https://routine-app-sooty.vercel.app`

Set the production URL as the Site URL when production is the primary login target. Keep both local and production URLs in the redirect allowlist while testing local and deployed flows.

## Vercel Environment Variables

Add only these browser-facing environment variable names to the Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

- Add values for the Vercel environments you plan to test.
- Redeploy after changing environment variables so the deployed Next.js bundle receives the updated public values.
- Never add a `service_role` key to Vercel for this browser app flow.

## Local `.env.local`

For local testing, create or update `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- Use the Supabase Project URL and anon public key.
- Keep `.env.local` uncommitted.
- Restart the local dev server after changing `.env.local`.

## Post-Deploy Checks

Check both the configuration boundary and the login boundary after deployment.

- Open the upper-right account menu and confirm it shows the intended Supabase unset or configured state.
- Open the upper-right account menu and confirm the configured state exposes the email login form.
- Sign up with email and password and check whether a confirmation email is required.
- Complete email/password login and confirm the logged-in state is shown.
- Confirm the manual upload button is visible only when logged in.
- Confirm the manual download button is visible only when logged in.
- Confirm existing localStorage routine records remain available before any manual download is approved.

## Manual Sync Test Scenarios

Run these scenarios deliberately and keep local JSON backups while testing.

1. Sign in with an empty Supabase account and upload local data from one browser.
2. Download the uploaded backup on the same browser and confirm the summary and warning flow.
3. Sign in from another browser or device and download the Supabase backup there.
4. Confirm archived custom foods remain archived and still support historical records.
5. Confirm `favoriteFoodIds` are preserved after upload and download.
6. Confirm profile values are preserved after upload and download.

## Rollback And Cautions

- Supabase download can replace this device's local routine records after user confirmation.
- Export a JSON backup before destructive download tests.
- Manual sync does not resolve device conflicts automatically. Choose which device uploads the authoritative local state.
- Upload can update Supabase rows that share the same routine date or custom food key.
- Download can be a partial backup. Read the summary and confirmation prompt before applying it.
- If auth or sync testing behaves unexpectedly, stop before approving another download and inspect the browser console, Vercel deployment logs, and Supabase Auth or database logs.
