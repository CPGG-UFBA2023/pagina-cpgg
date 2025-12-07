import { Header } from '../../components/Header/'
import { Footer } from '../../components/Footer/'
import { Middle } from './components/Middle/'
import { VideoSection } from './components/VideoSection/'
import styles from './Home.module.css'

const DRONE_VIDEO_URL = "https://kbxdwrvxrnfkqvpselwz.supabase.co/storage/v1/object/sign/VANT-photos/CPGG%20-%20DRONE_compressed.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80YjM3OGVhNS01NDYxLTQwNGItYTcxOS0wNDZmNTljMTY5OGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWQU5ULXBob3Rvcy9DUEdHIC0gRFJPTkVfY29tcHJlc3NlZC5tcDQiLCJpYXQiOjE3NjUxNDQ4OTEsImV4cCI6MTc5NjY4MDg5MX0._8lym16pk62x1adpIo0Jrc-YLWGsSifF7BNic9y8yDk"

export function Home() {
  return (
    <div className={styles.Container}>
      <Header />
      
      {/* Video Section - Full Screen */}
      <section className={styles.videoSection}>
        <VideoSection videoUrl={DRONE_VIDEO_URL} />
      </section>
      
      {/* Content Section */}
      <section className={styles.contentSection}>
        <main className={`middle ${styles.middle}`}>
          <Middle />
        </main>
      </section>
      
      <Footer />
    </div>
  )
}
