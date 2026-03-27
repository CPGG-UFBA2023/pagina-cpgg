import styles from './LaigaSuccess.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'

export function LaigaSuccess() {
  return (
    <div className={styles.successContainer}>
      <Header />
      <div className={styles.success}>
        <ul>Solicitação de Reserva Enviada com Sucesso!</ul>
        <p>Em breve o coordenador do laboratório entrará em contato por e-mail.</p>
      </div>
      <Footer />
    </div>
  )
}
