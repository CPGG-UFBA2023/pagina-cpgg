import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente invisível que rastreia a localização do visitante uma vez por sessão.
 * Deve ser montado no App.tsx para funcionar em todas as páginas.
 */
export function VisitorTracker() {
  useEffect(() => {
    // Evitar múltiplas chamadas na mesma sessão
    const alreadyTracked = sessionStorage.getItem('visitor_tracked');
    if (alreadyTracked) return;

    const trackLocation = async () => {
      try {
        const { error } = await supabase.functions.invoke('track-visitor-location');
        if (error) {
          console.error('Error tracking visitor:', error);
          return;
        }
        sessionStorage.setItem('visitor_tracked', 'true');
      } catch (error) {
        console.error('Error calling track-visitor-location:', error);
      }
    };

    trackLocation();
  }, []);

  return null;
}
