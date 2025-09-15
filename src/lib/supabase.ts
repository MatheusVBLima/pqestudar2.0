import { createClient } from '@supabase/supabase-js'

// Verificar se as credenciais do Supabase estão configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Criar cliente Supabase apenas se as credenciais estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Função helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Log de aviso se não configurado
if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  console.warn('Funcionalidades de autenticação estarão desabilitadas até a configuração.')
}