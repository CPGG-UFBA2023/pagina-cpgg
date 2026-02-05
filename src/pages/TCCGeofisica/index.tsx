import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import styles from './TCCGeofisica.module.css'

// Lista de alunos - será preenchida posteriormente
const students: string[] = []

export function TCCGeofisica() {
  // Ordenar alfabeticamente
  const sortedStudents = [...students].sort((a, b) => 
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  )

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.content}>
        <h1 className={styles.title}>
          Trabalho Final de Graduação do curso de Geofísica
        </h1>
        
        {sortedStudents.length > 0 ? (
          <ul className={styles.studentList}>
            {sortedStudents.map((student, index) => (
              <li key={index} className={styles.studentItem}>
                {student}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>
            Lista de alunos será adicionada em breve.
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}
