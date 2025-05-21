import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdqxfevdupagjurjzji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZHF4ZmV2ZHVwYWdqdXJqemppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjM2MzUsImV4cCI6MjA2MzM5OTYzNX0.dRp469ZOMlEQ6HSq-yqDLnII7qc_LZRl-tH_Ryx3Rak'; // Found in Supabase → Project → Settings → API
export const supabase = createClient(supabaseUrl, supabaseKey);
