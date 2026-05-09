import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  !supabaseUrl.includes('xxxx') &&
  supabaseAnonKey &&
  !supabaseAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
)

// createClient jette si l'URL est vide — on passe un placeholder pour que le module charge
// sans erreur. L'app affiche un écran de configuration si isSupabaseConfigured est false.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
