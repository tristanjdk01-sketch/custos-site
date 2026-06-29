// PUBLIC Supabase config for the website.
//
// These two values are SAFE to ship in client-side code. The anon key is
// Supabase's "publishable" key; it can do nothing on its own. The only thing
// it is permitted to do here is INSERT into `inbound_leads`, enforced by a
// Row-Level Security policy (no SELECT / UPDATE / DELETE for anon). Verified.
//
// Do NOT put the service_role or secret keys here — those bypass RLS and must
// stay server-side (n8n / scripts), in ~/.secrets, never in the repo.

export const SUPABASE_URL = 'https://wdopamzmgyilqqpbwjog.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkb3BhbXptZ3lpbHFxcGJ3am9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI3OTksImV4cCI6MjA5NTI5ODc5OX0.s5JJ4gLsWwUT-5s2htNT_cfSqDJ8P3vZI4NtjAsfkjs';
