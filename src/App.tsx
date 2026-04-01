import './App.module.css'
import './global.css'
import { Router } from './Router'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { VisitorTracker } from '@/components/VisitorTracker'

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <VisitorTracker />
        <Router />
        <Toaster />
      </LanguageProvider>
    </BrowserRouter>
  )
}
