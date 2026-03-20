import './contact-no-scroll.css'
import styles from './Contact.module.css'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import earth from '../../assets/earth-imgur.png'
import Whats from '../../assets/whatsapp-icon.png'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export function Contact() {
  const { t } = useLanguage();
  const phoneNumber = '+55(71)3283-8531'
  const whatsappNumber = '5571328385531'
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá!')}`
  const { toast } = useToast()
  const copyWhatsAppLink = async () => {
    try {
      await navigator.clipboard.writeText(whatsappHref)
      toast({
        title: t('toast.linkCopied'),
        description: t('toast.linkCopiedDesc'),
      })
    } catch (_) {
      alert('Não foi possível copiar automaticamente. Copie manualmente: ' + whatsappHref)
    }
  }

  return (
    <div className={`${styles.Container} contact-page`}>
      <Header />
      <main className={`${styles.contact} contact`}>
        <ul> {t('contact.emailUs')} </ul>
        <p> secretaria.cpgg.ufba@gmail.com</p>

        <div className={styles.whatsappSection}>
          <button type="button" className={styles.whatsappLink} onClick={copyWhatsAppLink} aria-label="Copiar link do WhatsApp">
            <img src={Whats} alt="WhatsApp ícone" className={styles.whatsappIcon} />
            <span>{t('contact.copyLink')}</span>
          </button>
        </div>

        <b> {phoneNumber}</b>
        <p className={styles.address}> {t('contact.address')}</p>
        <p className={styles.building}> {t('contact.building')}</p>

      </main>
      <Footer />
    </div>
  )
}
