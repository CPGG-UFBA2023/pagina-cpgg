import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import styles from './SeniorResearchers.module.css';

const seniorResearchers = [
  { name: 'Aroldo Misi', route: '/researchers/dynamic/0bb0394a-e96e-4af7-a69f-fe81a41ebbaa' },
  { name: 'Edson Emanuel Starteri Sampaio', route: '/researchers/dynamic/2b1a5a7f-8910-44e1-b88d-f5feee7a4195' },
  { name: 'Johildo Salomão Figuerêdo Barbosa', route: '/researchers/dynamic/32d973bf-215e-4145-9759-31685cee7e7a' },
  { name: 'José Maria Dominguez Landim', route: '/researchers/dynamic/5f2752aa-b103-48ab-8b7a-89e358795b09' },
  { name: 'Juarez dos Santos Azevedo', route: '/researchers/dynamic/e288b7c5-ffb1-404b-a952-783cc2fb0967' },
  { name: 'Luiz Rogério Bastos Leal', route: '/researchers/dynamic/c60ebb49-68d6-4c89-8d16-5ce402f0cd91' },
  { name: 'Marcos Alberto Rodrigues Vasconcelos', route: '/researchers/dynamic/76be24ad-b44c-48dc-8cbd-9f96362678e7' },
  { name: 'Milton José Porsani', route: '/researchers/dynamic/676bc98a-459e-48bc-ab81-aa0a9c48f411' },
  { name: 'Reynam da Cruz Pestana', route: '/researchers/dynamic/0b968483-40e2-44c8-90b9-878888760a77' },
  { name: 'Ruy Kenji Papa de Kikuchi', route: '/researchers/dynamic/a403df12-741d-41da-aa2d-60d7b654e1cd' },
  { name: 'Simone Cerqueira Pereira Cruz', route: '/researchers/dynamic/b66d8460-d4af-4db6-a1b9-c1b91b6e098a' },
];

export function SeniorResearchers() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'visible' }}>
      <Header />
      <div className={`${styles.researchers} hide-earth`} style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
        <div className={styles.Programs}>
          <ul>Pesquisadores Seniores</ul>
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
        </div>
      </div>
    </div>
  );
}
