import { createClient } from '@supabase/supabase-js'

// Para desenvolvimento, você pode usar valores de exemplo ou configurar as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima'

// Verificar se as credenciais estão configuradas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Credenciais do Supabase não configuradas. Usando valores de exemplo.')
  console.warn('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações do projeto.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)