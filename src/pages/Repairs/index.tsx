import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './repairs-page-no-scroll.css'
import styles from './RepairsServices.module.css'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabase } from '../../integrations/supabase/client'

export function RepairsServices() {
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
      setAuthError('Por favor, preencha todos os campos obrigatórios.')
      return;
    }

    // Validar senha
    if (!password) {
      console.error('Senha não preenchida')
      setAuthError('Por favor, insira sua senha.')
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
          setAuthError('Email ou senha incorretos.')
        } else if (authError.message.includes('Email not confirmed')) {
          setAuthError('Email não confirmado. Verifique sua caixa de entrada.')
        } else {
          setAuthError('Usuário não cadastrado.')
        }
        return;
      }

      if (!authData.user) {
        console.error('Usuário não encontrado')
        setAuthError('Usuário não cadastrado.')
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
      setAuthError('Erro ao enviar solicitação. Tente novamente.')
    }
  }

  return (
    <div className="repairs-page">
      <Header />
      <main className={`${styles.RS} repairs`}>
          <form className={styles.box} onSubmit={handleSubmit}>
          <ul> Solicitação de Reparos e Serviços Técnicos </ul>

          <div className={styles.form}>
            <label>Nome *</label>
             <input 
               type="text" 
               placeholder="Nome" 
               value={formData.nome}
               onChange={(e) => handleInputChange('nome', e.target.value)}
               required 
             />
          </div>

          <div className={styles.form}> 
            <label>Sobrenome *</label>
            <input 
              type="text" 
              placeholder="Sobrenome" 
              value={formData.sobrenome}
              onChange={(e) => handleInputChange('sobrenome', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>Tipo de Problema *</label>
            <select 
              value={formData.problemType}
              onChange={(e) => handleInputChange('problemType', e.target.value)}
              required 
            >
              <option value="">Selecione o tipo de problema</option>
              <option value="infraestrutura">1. Problema de infraestrutura</option>
              <option value="ti">2. Problema de T.I.</option>
            </select>
          </div>

          <div className={styles.form}> 
            <label>Descrição do Problema *</label>
            <textarea 
              placeholder="Descreva detalhadamente o problema..." 
              value={formData.problemDescription}
              onChange={(e) => handleInputChange('problemDescription', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>E-mail *</label>
            <input 
              type="email" 
              placeholder="Digite seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <label>Senha *</label>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
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
              Enviar Solicitação
          </button>

          </form>
        </main>
        
      <Footer hideImage />
    </div>
  )
}
