import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useRecaptcha() {
  const [isVerifying, setIsVerifying] = useState(false)

  const verifyRecaptcha = useCallback(async (token: string | null): Promise<boolean> => {
    if (!token) {
      return false
    }

    setIsVerifying(true)
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      })

      if (error) {
        console.error('Erro na verificação reCAPTCHA:', error)
        return false
      }

      return data?.success === true
    } catch (error) {
      console.error('Erro ao verificar reCAPTCHA:', error)
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [])

  return { verifyRecaptcha, isVerifying }
}

// Site key for reCAPTCHA v2 - esta é uma chave pública
export const RECAPTCHA_SITE_KEY = '6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b'
