import styles from './lagep.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import earth from '../../../assets/earth-imgur.png'

export function Lagep() {
  return (
    <>
      <Header />
      <div className={styles.lagep}>
        <div className={styles.Title} >
          <ul> LAGEP </ul>
          <a> Laboratório de Geofísica do Petróleo </a>
          <div className={styles.box}>
          <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla luctus
    aliquam dolor, eu lacinia lorem placerat vulputate. Duis felis orci,
    pulvinar id metus ut, rutrum luctus orci. Cras porttitor imperdiet nunc, at
    ultricies tellus laoreet sit amet. Sed auctor cursus massa at porta. Integer
    ligula ipsum, tristique sit amet orci vel, viverra egestas ligula. Curabitur
    vehicula tellus neque, ac ornare ex malesuada et. In vitae convallis lacus.
    Aliquam erat volutpat. Suspendisse ac imperdiet turpis. Aenean finibus
    sollicitudin eros pharetra congue. Duis ornare egestas augue ut luctus.
    Proin blandit quam nec lacus varius commodo et a urna. Ut id ornare felis,
    eget fermentum sapien.
            </p>
            <br></br>
            <p>
            Nam vulputate diam nec tempor bibendum. Donec luctus augue eget malesuada
    ultrices. Phasellus turpis est, posuere sit amet dapibus ut, facilisis sed
    est. Nam id risus quis ante semper consectetur eget aliquam lorem. Vivamus
    tristique elit dolor, sed pretium metus suscipit vel. Mauris ultricies
    lectus sed lobortis finibus. Vivamus eu urna eget velit cursus viverra quis
    vestibulum sem. Aliquam tincidunt eget purus in interdum. Cum sociis natoque
    penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            </p>
            
            <p> 
              Para acessar as informações acerca das estatísticas de uso dos equipamentos, acesse o link abaixo
             </p>
             <nav>
              <a href="https://pnipe.mcti.gov.br/search?term=Laiga" target="_blank">Estatísticas de uso</a>
            </nav>
            <br></br>
             <p> 
              Acesse o site da Plataforma Nacional de Infraestrutura de Pesquisa-PNIPE, e veja as fotos e mais detalhes sobre os equipamentos disponíveis. 
            </p>

             <nav>
              <a href="https://pnipe.mcti.gov.br/search?term=Laiga" target="_blank">Site do PNIPE</a>
            </nav>
            <p> 
              Para saber da disponibilidade dos equipamentos e solicitá-los para uso, acesse nossa plataforma de requerimento
            </p>
            <nav>
             <a href="https://pnipe.mcti.gov.br/search?term=Laiga" target="_blank">Requerimento de uso</a>
           </nav>
          <br></br>
           <b> Coordenador do LAGEP</b>
           <span> prof. Milton José Porsani</span>

            <div className={styles.box1}>
              <h4 className={styles.legend1}>Sala 1- Almoxarifado com equipamentos de geofísica</h4>
            </div>
            <div className={styles.box2}>
              <h4 className={styles.legend2}>Sala 1-Sala de Dados</h4>
            </div>
            <div className={styles.box3}>
              <h4 className={styles.legend3}>Sala 3- Eletrônica</h4>
            </div>
            <div className={styles.box4}>
              <h4 className={styles.legend4}>Sala de apoio do LAIGA</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}