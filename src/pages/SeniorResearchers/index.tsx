import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';

import styles from './SeniorResearchers.module.css';

const seniorResearchers = [
  { name: 'Aroldo Misi', route: '/researchers/personal/Aroldo' },
  { name: 'Edson Emanuel Starteri Sampaio', route: '/researchers/personal/Edson' },
  { name: 'Johildo Salomão Figuerêdo Barbosa', route: '/researchers/personal/Johildo' },
  { name: 'José Maria Dominguez Landim', route: '/researchers/personal/Landim' },
  { name: 'Juarez dos Santos Azevedo', route: '/researchers/personal/Juarez' },
  { name: 'Luiz Rogério Bastos Leal', route: '/researchers/personal/LRogerio' },
  { name: 'Marcos Alberto Rodrigues Vasconcelos', route: '/researchers/personal/Marcos' },
  { name: 'Milton José Porsani', route: '/researchers/personal/Porsani' },
  { name: 'Reynam da Cruz Pestana', route: '/researchers/personal/Reynam' },
  { name: 'Ruy Kenji Papa de Kikuchi', route: '/researchers/personal/Ruy' },
  { name: 'Simone Cerqueira Pereira Cruz', route: '/researchers/personal/Simone' },
];

export function SeniorResearchers() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Pesquisadores Seniores</h1>
        <div className={styles.card}>
          <p className={styles.description}>
            A denominação "pesquisador sênior" foi normatizada pelo Conselho Científico no ano de 2023 a partir da aprovação da Deliberação Normativa 02/2023, em que os critérios para tal classificação são definidos.
          </p>
          <ul className={styles.list}>
            {seniorResearchers.map((researcher) => (
              <li key={researcher.name}>
                <Link to={researcher.route} className={styles.listItem}>
                  {researcher.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      
    </div>
  );
}
