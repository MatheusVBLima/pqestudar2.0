import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar se há um token de reset na URL
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const email = searchParams.get('email')
    
    if (access_token && refresh_token) {
      // Definir a sessão com os tokens da URL
      supabase.auth.setSession({
        access_token,
        refresh_token
      })
    } else if (!email) {
      // Se não há tokens nem email, redirecionar para login
      navigate('/login')
    }
    // Se há email mas não há tokens, permitir que o usuário use a página
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const email = searchParams.get('email')
      
      if (email) {
        // Se temos email, fazer login primeiro com uma senha temporária
        // e depois atualizar a senha
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (updateError) {
          // Se falhar, tentar através do email
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            decodeURIComponent(email),
            {
              redirectTo: `${window.location.origin}/login`,
            }
          )
          
          if (resetError) {
            toast.error('Erro ao redefinir senha. Tente novamente mais tarde.')
          } else {
            toast.success('Um novo link de redefinição foi enviado para seu email!')
            setTimeout(() => {
              navigate('/login')
            }, 2000)
          }
        } else {
          toast.success('Senha redefinida com sucesso! Você será redirecionado.')
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      } else {
        // Se não temos email, usar o método tradicional
        const { error } = await supabase.auth.updateUser({
          password: password
        })

        if (error) {
          toast.error('Erro ao redefinir senha: ' + error.message)
        } else {
          toast.success('Senha redefinida com sucesso! Você será redirecionado.')
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao login
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              {searchParams.get('email') 
                ? `Digite sua nova senha para ${decodeURIComponent(searchParams.get('email') || '')}`
                : 'Digite sua nova senha abaixo'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}