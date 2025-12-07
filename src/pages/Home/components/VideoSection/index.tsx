import styles from './VideoSection.module.css'

interface VideoSectionProps {
  videoUrl: string
}

export function VideoSection({ videoUrl }: VideoSectionProps) {
  return (
    <div className={styles.videoContainer}>
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
      <div className={styles.overlay}>
        <h1 className={styles.title}>
          Centro de Pesquisa em Geofísica e Geologia
        </h1>
        <div className={styles.scrollIndicator}>
          <span>Deslize para explorar</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </div>
    </div>
  )
}
