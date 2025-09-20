import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
    
    // Verificar se é um signup repetido
    if (data?.user && !data.session && data.user.identities?.length === 0) {
      return { 
        error: { 
          message: "Este email já está cadastrado. Tente fazer login ou recuperar sua senha.",
          isExistingUser: true
        } 
      }
    }
    
    return { error }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      })
      return { error }
    } catch (error) {
      console.error('Erro no Google Auth:', error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Chamar nossa edge function para enviar o email customizado
      const response = await fetch(`https://omkxiomwzbykmqttfozi.supabase.co/functions/v1/send-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta3hpb213emJ5a21xdHRmb3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTc1OTIsImV4cCI6MjA3MzQ5MzU5Mn0.IzpMhFg4XJGNxPJlu8LTP_yDOGeHN4C8dESNKxq7bIc`,
        },
        body: JSON.stringify({
          email,
          resetUrl: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar email de recuperação')
      }

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}