import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import ReCAPTCHA from 'react-google-recaptcha'

interface AdminLoginTCCProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminLoginTCC({ isOpen, onClose, onSuccess }: AdminLoginTCCProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaToken) {
      toast.error('Por favor, complete o reCAPTCHA')
      return
    }

    setLoading(true)

    try {
      // Verify reCAPTCHA
      const { data: captchaData, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: captchaToken }
      })

      if (captchaError || !captchaData?.success) {
        toast.error('Verificação reCAPTCHA falhou')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error('Credenciais inválidas')
        setLoading(false)
        return
      }

      // Check if user is coordenacao
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (adminError || adminData?.role !== 'coordenacao') {
        toast.error('Acesso restrito à coordenação')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      toast.success('Login realizado com sucesso!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login - Coordenação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
