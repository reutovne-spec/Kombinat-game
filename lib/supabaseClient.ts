import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwtkpdepgoetfowlqgfm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dGtwZGVwZ29ldGZvd2xxZ2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzQzNzgsImV4cCI6MjA3NDcxMDM3OH0.6rQSsqb658rm5Baod_1k_zWCjbZrColQJAufrDm0LBk';

// TODO: Replace with your JWT secret from Supabase project settings (Settings -> API -> JWT Settings)
// WARNING: This is insecure for a production app. 
// The JWT secret should never be exposed on the client-side.
// This should be replaced with a server-side authentication flow (e.g., using a Supabase Edge Function).
export const supabaseJwtSecret = 'v3q8ptD/N0R7Y+rw8JCr+ejVE1armICc5bte5xADMoxQPSXCsd8Vz9ng5Txwa2tWE4NWUaJarFWW5ixyxDRI/g==';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or anon key is missing. Please add it to lib/supabaseClient.ts");
}

if (supabaseJwtSecret === 'v3q8ptD/N0R7Y+rw8JCr+ejVE1armICc5bte5xADMoxQPSXCsd8Vz9ng5Txwa2tWE4NWUaJarFWW5ixyxDRI/g==') {
  console.warn("Supabase JWT secret is not set in lib/supabaseClient.ts. Authentication will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
