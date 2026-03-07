import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY // Use service role if anon is missing for now, though not ideal for frontend

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
