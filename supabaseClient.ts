import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jpqlkshtuyvvjvrcyebc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWxrc2h0dXl2dmp2cmN5ZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDQxNDMsImV4cCI6MjA3MzQyMDE0M30.3UX1N-kPVLv0-ZeF30cloapxASbPx13MmRSYASmjL9A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
