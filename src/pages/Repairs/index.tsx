import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './repairs-page-no-scroll.css'
import styles from './RepairsServices.module.css'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabase } from '../../integrations/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

export function RepairsServices() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    problemType: '',
    problemDescription: ''
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    console.log('Iniciando validação do formulário...')
    console.log('FormData:', formData)
    console.log('Email:', email)
    console.log('Password:', password ? '***' : 'vazio')
    
    // Validar se todos os campos estão preenchidos
    if (!formData.nome || !formData.sobrenome || !formData.problemType || !formData.problemDescription || !email) {
      console.error('Campos obrigatórios não preenchidos')
      setAuthError(t('repairs.requiredError'))
      return;
    }

    // Validar senha
    if (!password) {
      console.error('Senha não preenchida')
      setAuthError(t('repairs.passwordError'))
      return;
    }
    
    try {
      console.log('Tentando autenticar usuário...')
      // Tentar autenticar o usuário
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (authError) {
        console.error('Erro de autenticação:', authError)
        // Verificar tipo de erro
        if (authError.message.includes('Invalid login credentials')) {
          setAuthError(t('repairs.credentialsError'))
        } else if (authError.message.includes('Email not confirmed')) {
          setAuthError(t('repairs.unconfirmedError'))
        } else {
          setAuthError(t('repairs.userError'))
        }
        return;
      }

      if (!authData.user) {
        console.error('Usuário não encontrado')
        setAuthError(t('repairs.userError'))
        return;
      }

      console.log('Usuário autenticado, enviando solicitação...')
      // Se autenticado, enviar a solicitação com email incluído
      const { data, error } = await supabase.functions.invoke('send-repair-request', {
        body: {
          ...formData,
          email: email
        }
      });

      if (error) {
        console.error('Erro ao invocar edge function:', error)
        throw error;
      }

      console.log('Solicitação enviada com sucesso:', data);
      
      // Fazer logout após enviar
      await supabase.auth.signOut()
      
      // Redirecionar para página de sucesso com o tipo de problema
      navigate('/reservations/success', { 
        state: { serviceType: formData.problemType }
      })
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setAuthError(t('repairs.sendError'))
    }
  }

  return (
    <div className="repairs-page">
      <Header />
      <main className={`${styles.RS} repairs`}>
          <form className={styles.box} onSubmit={handleSubmit}>
          <ul>{t('repairs.title')}</ul>

          <div className={styles.form}>
            <label>{t('repairs.firstName')} *</label>
             <input 
               type="text" 
               placeholder={t('repairs.firstName')}
               value={formData.nome}
               onChange={(e) => handleInputChange('nome', e.target.value)}
               required 
             />
          </div>

          <div className={styles.form}> 
            <label>{t('repairs.lastName')} *</label>
            <input 
              type="text" 
              placeholder={t('repairs.lastName')}
              value={formData.sobrenome}
              onChange={(e) => handleInputChange('sobrenome', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>{t('repairs.problemType')} *</label>
            <select 
              value={formData.problemType}
              onChange={(e) => handleInputChange('problemType', e.target.value)}
              required 
            >
              <option value="">{t('repairs.selectProblem')}</option>
              <option value="infraestrutura">{t('repairs.infrastructure')}</option>
              <option value="ti">{t('repairs.it')}</option>
            </select>
          </div>

          <div className={styles.form}> 
            <label>{t('repairs.description')} *</label>
            <textarea 
              placeholder={t('repairs.descriptionPlaceholder')}
              value={formData.problemDescription}
              onChange={(e) => handleInputChange('problemDescription', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>E-mail *</label>
            <input 
              type="email" 
              placeholder={t('repairs.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>{t('repairs.password')} *</label>
            <input 
              type="password" 
              placeholder={t('repairs.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          {authError && (
            <div style={{ 
              color: '#ff4444', 
              fontSize: '14px', 
              fontWeight: '600',
              textAlign: 'center',
              marginTop: '10px',
              padding: '10px',
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderRadius: '10px'
            }}>
              {authError}
            </div>
          )}

          <button type="submit">
              {t('repairs.submit')}
          </button>

          </form>
        </main>
        
      <Footer hideImage />
    </div>
  )
}
