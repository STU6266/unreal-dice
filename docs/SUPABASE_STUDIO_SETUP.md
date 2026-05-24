# Supabase Studio Setup

Use this guide to enable remote Quick Start template management for unrealDice.

## Security Warning

- Never place the Supabase service-role key in Vite environment variables.
- Never commit the real `.env` file.
- The `/studio/templates` route being unlinked is convenience only. Supabase Auth and Row Level Security are the actual security boundary.
- Modifier-enabled sets are stored inside the existing `sets` JSON field. No service-role key or extra browser credential is required for this JSON shape change.

## Setup Steps

1. Create a Supabase project.
2. In Supabase Authentication, create one admin user with email/password.
3. Find that admin user's UUID in the Supabase dashboard.
4. Open `supabase/quick_start_templates_schema.sql`.
5. Replace every `REPLACE_WITH_YOUR_ADMIN_USER_UUID` placeholder with the real admin UUID.
6. Run the schema SQL in the Supabase SQL Editor.
7. Run `supabase/quick_start_templates_seed.sql` in the Supabase SQL Editor.
8. Copy the project URL and browser-safe publishable/anon key.
9. Create local `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

10. Add the same environment variables in Vercel or the chosen production host.
11. Deploy or redeploy the app.
12. Open the unlinked studio route:

```text
/studio/templates
```

13. Sign in with the admin account.
14. Create, edit, and publish one test template.
15. Sign out.
16. Verify that the published template appears in public Quick Start.
17. Verify that unpublished templates do not appear publicly.
18. Verify that unauthenticated users cannot create, edit, delete, publish, or read unpublished templates.

## Manual RLS Checks

After deployment, test these cases in the browser:

- Signed-out public user can see only published Quick Start templates.
- Signed-out public user cannot open unpublished templates through the studio.
- Signed-in non-admin user cannot list unpublished templates.
- Signed-in non-admin user cannot insert, update, publish, unpublish, or delete templates.
- Signed-in admin user can manage templates.

Frontend tests do not prove database security. The SQL policies and Supabase manual checks are required.
