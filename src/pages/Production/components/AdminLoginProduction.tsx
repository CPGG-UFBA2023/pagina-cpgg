import { useState, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import ReCAPTCHA from 'react-google-recaptcha'

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface AdminLoginProductionProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
  isLoading: boolean
}

export function AdminLoginProduction({ isOpen, onClose, onLogin, isLoading }: AdminLoginProductionProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      })
      return
    }

    if (!captchaToken) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete o reCAPTCHA.",
        variant: "destructive"
      })
      return
    }

    // Verify reCAPTCHA
    const { data: captchaData, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
      body: { token: captchaToken }
    })

    if (captchaError || !captchaData?.success) {
      toast({
        title: "Erro de verificação",
        description: "Falha na verificação do reCAPTCHA. Tente novamente.",
        variant: "destructive"
      })
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      return
    }

    onLogin(email, password)
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setCaptchaToken(null)
    recaptchaRef.current?.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Login de Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'left', marginTop: '8px', marginBottom: '-8px' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !captchaToken}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}