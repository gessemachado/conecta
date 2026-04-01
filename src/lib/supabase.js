import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://auejlgcxgvpdstmzlzsi.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWpsZ2N4Z3ZwZHN0bXpsenNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzYyNjUsImV4cCI6MjA5MDE1MjI2NX0.PBmgFaDUWfUtwBUhRCBjgBO_M99SEB0_FuzLu4f1-8E'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const AUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/auth-login`
export const SUPABASE_ANON_KEY_EXPORT = SUPABASE_ANON_KEY
