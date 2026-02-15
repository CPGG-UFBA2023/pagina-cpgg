import styles from './LemarSuccess.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'

export function LemarSuccess() {
  return (
    <div className={styles.successContainer}>
      <Header />
      <div className={styles.success}>
        <ul>Solicitação de Análise Enviada com Sucesso!</ul>
        <p>Em breve o chefe do laboratório entrará em contato por e-mail.</p>
      </div>
      <Footer />
    </div>
  )
}
